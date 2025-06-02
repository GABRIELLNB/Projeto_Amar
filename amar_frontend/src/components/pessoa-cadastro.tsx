'use client'

import { Button, ButtonField } from '@/components/button'
import { InputField, InputIcon, InputRoot } from '@/components/input'
import {
  ArrowLeft,
  CalendarCheck,
  Clock,
  Fingerprint,
  IdCard,
  Phone,
  User,
  X,
  HandHelping,
  ImageDown,
  Camera,
} from 'lucide-react'
import { type JSX, useState } from 'react'
import { IconButton } from './icon-button'
import { z } from 'zod'
import { useRouter } from 'next/navigation'

const cadastroSchema = z.object({
  nome: z.string().min(2, 'Digite seu nome completo'),
  cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF inválido'),
  telefone: z.string().regex(/^\(\d{2}\) \d{4,5}-\d{4}$/, 'Telefone inválido'),
  matricula: z.string().min(1, 'Matrícula é obrigatória'),
  tipo_servico: z.string().min(1, 'Tipo de serviço é obrigatório'),
  disponibilidade: z.array(
    z.object({
      dia: z.string().min(1, 'Dia é obrigatório'),
      horarios: z.array(z.string().min(1, 'Horário é obrigatório')),
    })
  ),
})

interface CadastroPessoaProps {
  type: 'profissional' | 'estagiario'
  onSubmit: (data: any) => void
}

export default function CadastroPessoa({ type, onSubmit }: CadastroPessoaProps) {
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    matricula: '',
    telefone: '',
    tipo_servico: '',
    disponibilidade: [{ dia: '', horarios: [''] }],
  })

  const [errors, setErrors] = useState<Record<string, string | string[]>>({})

  const fieldIcons: Record<string, JSX.Element> = {
    nome: <User size={18} />,
    cpf: <Fingerprint size={18} />,
    matricula: <IdCard size={18} />,
    telefone: <Phone size={18} />,
    tipo_servico: <HandHelping size={20} />,
    disponibilidade: <CalendarCheck size={18} />,
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Manipulação para disponibilidade (dia + horários)

  const handleDiaChange = (index: number, value: string) => {
    setFormData(prev => {
      const updated = [...prev.disponibilidade]
      updated[index].dia = value
      return { ...prev, disponibilidade: updated }
    })
  }

  const handleHorarioChange = (dispIndex: number, horarioIndex: number, value: string) => {
    setFormData(prev => {
      const updated = [...prev.disponibilidade]
      updated[dispIndex].horarios[horarioIndex] = value
      return { ...prev, disponibilidade: updated }
    })
  }

  const addDiaDisponivel = () => {
    setFormData(prev => ({
      ...prev,
      disponibilidade: [...prev.disponibilidade, { dia: '', horarios: [''] }],
    }))
  }

  const removeDiaDisponivel = (index: number) => {
    setFormData(prev => {
      const updated = [...prev.disponibilidade]
      updated.splice(index, 1)
      return { ...prev, disponibilidade: updated }
    })
  }

  const addHorario = (index: number) => {
  setFormData(prev => {
    const updated = [...prev.disponibilidade];
    const diaAtualizado = { 
      ...updated[index], 
      horarios: [...updated[index].horarios, ''] 
    };
    updated[index] = diaAtualizado;
    return { ...prev, disponibilidade: updated };
  });
};


  const removeHorario = (dispIndex: number, horarioIndex: number) => {
    setFormData(prev => {
      const updated = [...prev.disponibilidade]
      updated[dispIndex].horarios.splice(horarioIndex, 1)
      return { ...prev, disponibilidade: updated }
    })
  }

  const renderInput = (
    label: string,
    name: keyof typeof formData,
    required = true,
    placeholder = ''
  ) => (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-sm text-pink4000 font-medium">
        {label}
      </label>
      <InputRoot>
        <InputIcon>{fieldIcons[name]}</InputIcon>
        <InputField
          id={name}
          name={name}
          required={required}
          placeholder={placeholder || label}
          value={typeof formData[name] === 'string' ? formData[name] : ''}
          onChange={handleChange}
        />
      </InputRoot>
      {errors[name] && (
        <p className="text-red-500 text-xs mt-1">
          {Array.isArray(errors[name]) ? errors[name].join(', ') : errors[name]}
        </p>
      )}
    </div>
  )

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const dataToValidate = { ...formData }

    const result = cadastroSchema.safeParse(dataToValidate)

    if (!result.success) {
      const fieldErrors: Record<string, string | string[]> = {}
      for (const issue of result.error.issues) {
        const key = issue.path[0]
        fieldErrors[key] = issue.message
      }
      setErrors(fieldErrors)
      return
    }

    setErrors({}) // limpa erros antes de enviar

    try {
      const response = await fetch('http://127.0.0.1:8000/api/cadastro-funcionario/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo: type, ...result.data }),
      })

      if (!response.ok) {
        const errorResponse = await response.json()
        console.error('Erro detalhado do backend:', errorResponse)
        if (response.status === 409) {
          alert(errorResponse.error)
        } else if (errorResponse.error) {
          alert(`Erro: ${errorResponse.error}`)
        } else {
          alert('Erro inesperado ao cadastrar funcionário.')
        }
        return
      }

      alert('Funcionário cadastrado com sucesso!')
      onSubmit({ tipo: type, ...result.data })
    } catch (error) {
      console.error('Erro na requisição:', error)
      alert('Erro de rede ou inesperado ao cadastrar funcionário.')
    }
  }

  const router = useRouter()

  return (
    <>
      <div className="bg-pink2000 w-full h-20 fixed top-0 left-0 flex items-center px-4 z-50">
        <div className="flex items-center gap-2">
          <IconButton
            className="bg-pink2000 text-pink1000 p-2 rounded-md hover:text-pink4000 hover:bg-pink2000 cursor-pointer"
            onClick={() => router.push('/menu-adm')}
          >
            <ArrowLeft />
          </IconButton>
          <h1 className="text-pink1000 text-2xl font-semibold">ADICIONAR FUNCIONÁRIO</h1>
        </div>
      </div>

      <div className="flex flex-col md:flex-row w-full bg-pink1000 p-6 gap-8 items-center justify-center min-h-screen pt-24">
        <div className="flex flex-col justify-center items-center rounded-xl bg-pink1000 p-4 shadow-md w-80 h-70 border border-pink3000">
          <div className="flex flex-col justify-center items-center rounded-full bg-pink1000 p-4 shadow-md w-40 h-40 border border-pink3000">
            <IconButton className="bg-pink1000 text-pink4000 hover:text-pink4000 flex items-center justify-center transition-colors duration-300">
              <User size={100} />
            </IconButton>
          </div>

          <div className="w-3/4 h-px bg-pink3000 my-4" />

          <div className="flex mt-2 gap-15">
            <IconButton className="bg-pink1000 text-pink4000 hover:text-pink4000 flex items-center justify-center transition-colors duration-300">
              <ImageDown />
            </IconButton>
            <IconButton className="bg-pink1000 text-pink4000 hover:text-pink4000 flex items-center justify-center transition-colors duration-300">
              <Camera />
            </IconButton>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex-1 space-y-4 bg-pink1000 p-6 rounded-xl shadow-md items-center"
          noValidate
        >
          <h2 className="text-2xl font-bold text-pink4000">
            Cadastro de {type === 'profissional' ? 'Profissional' : 'Estagiário'}
          </h2>

          {renderInput('Nome', 'nome')}
          <div className="flex gap-5">
            <div className="w-full md:w-1/3">{renderInput('CPF', 'cpf')}</div>
            <div className="w-full md:w-1/3">{renderInput('Matrícula', 'matricula')}</div>
            <div className="w-full md:w-1/3">{renderInput('Telefone', 'telefone')}</div>
          </div>
          {renderInput('Tipo de Serviço', 'tipo_servico')}

          {/* Disponibilidade dinâmica */}

         <div className="w-full flex flex-col gap-6 cursor-pointer">
            <div className="flex flex-col gap-2">
              <label className="text-sm text-pink4000 font-medium">Datas Disponíveis</label>

{formData.disponibilidade.map((disp, index) => (
  <div key={index} className="border border-pink3000 p-4 rounded-md mb-4 space-y-2">
    
    {/* Linha com data e primeiro horário */}
    <div className="flex items-center gap-4">
      <div className="w-1/2">
        <InputRoot>
          <InputIcon><CalendarCheck size={18} /></InputIcon>
          <input
            type="date"
            value={disp.dia}
            onChange={e => handleDiaChange(index, e.target.value)}
            className="w-full outline-0 text-pink4000 bg-transparent"
          />
        </InputRoot>
      </div>

      <div className="w-1/2">
        <InputRoot>
          <InputIcon><Clock size={18} /></InputIcon>
          <input
            type="time"
            value={disp.horarios[0]}
            onChange={e => handleHorarioChange(index, 0, e.target.value)}
            className="w-full outline-0 text-pink4000 bg-transparent"
          />
        </InputRoot>
      </div>

      <IconButton onClick={() => removeDiaDisponivel(index)} className="text-red-500">
        <X />
      </IconButton>
    </div>

    {/* Horários adicionais */}
    <div className="flex flex-wrap gap-2 ml-150 w-full">
    {disp.horarios.slice(1).map((horario, hIndex) => (
      <div key={`${index}-${hIndex + 1}`} className="flex items-center gap-4">
        <div className="w-1/2">
          <InputRoot>
            <InputIcon><Clock size={18} /></InputIcon>
            <input
              type="time"
              value={horario}
              onChange={e => handleHorarioChange(index, hIndex + 1, e.target.value)}
              className="w-full outline-0 text-pink4000 bg-transparent"
            />
          </InputRoot>
        </div>
        <IconButton onClick={() => removeHorario(index, hIndex + 1)} className="text-red-500">
          <X />
        </IconButton>
      </div>
    ))}
    </div>

    {/* Botão "Adicionar horário" */}
    <Button
      type="button"
      onClick={() => addHorario(index)}
      className="text-sm text-pink4000 hover:underline ml-120 mt-2"
    >
      + Adicionar horário
    </Button>
  </div>
))}
            <Button
              type="button"
              onClick={addDiaDisponivel}
              className="text-sm text-pink4000 hover:underline mt-2 self-start cursor-pointer"
            >
              + Adicionar dia
            </Button>
          </div>
          </div>

           <Button
            type="submit"
             className="group flex justify-between items-center px-5 h-12 bg-pink2000 text-pink1000 font-semibold rounded-xl w-full cursor-pointer transition-colors duration-300 hover:bg-pink3000 hover:text-pink4000"
          >
            <ButtonField className="flex-1 ">
Confirmar
            </ButtonField>
            
          </Button>

        </form>
      </div>
    </>
  )
}
