'use client'

import { Button, ButtonField } from '@/components/button'
import { InputField, InputIcon, InputRoot } from '@/components/input'
import {
  ArrowLeft,
  BadgeDollarSign,
  CalendarCheck,
  Camera,
  Circle,
  CircleX,
  Clock,
  FileClock,
  Fingerprint,
  IdCard,
  ImageDown,
  Phone,
  User,
  X,
} from 'lucide-react'
import { type JSX, useState } from 'react'
import { IconButton } from './icon-button'

interface CadastroPessoaProps {
  type: 'profissional' | 'estagiario'
  onSubmit: (data: any) => void
}

export default function CadastroPessoa({
  type,
  onSubmit,
}: CadastroPessoaProps) {
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    matricula: '',
    telefone: '',
    pis: '',
    diasDisponiveis: [''],
    horariosDisponiveis: [''],
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const fieldIcons: Record<string, JSX.Element> = {
    nome: <User size={18} />,
    cpf: <Fingerprint size={18} />,
    matricula: <IdCard size={18} />,
    telefone: <Phone size={18} />,
    pis: <BadgeDollarSign size={18} />,
    diasDisponiveis: <CalendarCheck size={18} />,
    horariosDisponiveis: <Clock size={18} />,
  }

  const handleArrayChange = (
    field: 'diasDisponiveis' | 'horariosDisponiveis',
    index: number,
    value: string
  ) => {
    setFormData(prev => {
      const updated = [...prev[field]]
      updated[index] = value
      return { ...prev, [field]: updated }
    })
  }

  const addArrayField = (field: 'diasDisponiveis' | 'horariosDisponiveis') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], ''],
    }))
  }

  const removeArrayField = (
    field: 'diasDisponiveis' | 'horariosDisponiveis',
    index: number
  ) => {
    setFormData(prev => {
      const updated = [...prev[field]]
      updated.splice(index, 1)
      return { ...prev, [field]: updated }
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
          value={formData[name]}
          onChange={handleChange}
        />
      </InputRoot>
    </div>
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <>
      <div className="bg-pink2000 w-full h-20 fixed top-0 left-0 flex items-center px-4" />
              <div className="bg-pink2000 w-full h-20 fixed top-0 left-0 flex items-center px-4 z-50">
          <div className="flex items-center gap-2">
            <IconButton className="bg-pink2000 text-pink1000 p-2 rounded-md hover:text-pink4000 hover:bg-pink2000 cursor-pointer">
              <ArrowLeft />
            </IconButton>
            <h1 className="text-pink1000 text-2xl font-semibold">
              ADICIONAR FUNCIONÁRIO
            </h1>
          </div>
                    
        </div>
      <div className="flex flex-col md:flex-row w-full bg-pink1000 p-6 gap-8 items-center justify-center min-h-screen">
        <div className="flex flex-col justify-center items-center rounded-xl bg-pink1000 p-4 shadow-md w-80 h-70 border border-pink3000">
          <div className="flex flex-col justify-center items-center rounded-full bg-pink1000 p-4 shadow-md w-40 h-40 border border-pink3000">
 <IconButton className="bg-pink1000 text-pink4000 hover:text-pink4000 flex items-center justify-center transition-colors duration-300">
            <User size={100} />
          </IconButton>
          </div>
         
          <div className="w-3/4 h-px bg-pink3000 my-4" />
          
          <div className="flex mt-2 gap-15">
            <IconButton className="bg-pink1000 text-pink4000 hover:text-pink4000 flex items-center justify-center transition-colors duration-300"><ImageDown /></IconButton>
            <IconButton className="bg-pink1000 text-pink4000 hover:text-pink4000 flex items-center justify-center transition-colors duration-300"><Camera /></IconButton>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex-1 space-y-4 bg-pink1000 p-6 rounded-xl shadow-md items-center"
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
          {type === 'profissional' && renderInput('PIS', 'pis')}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm text-pink4000 font-medium">Datas Disponíveis</label>
              {formData.diasDisponiveis.map((dia, index) => (
                <InputRoot key={index}>
                  <InputIcon><CalendarCheck size={18} /></InputIcon>
                  <input
                    type="date"
                    id={`diasDisponiveis-${index}`}
                    name={`diasDisponiveis-${index}`}
                    className="flex-1 outline-0 text-pink4000 bg-transparent"
                    value={dia}
                    onChange={e => handleArrayChange('diasDisponiveis', index, e.target.value)}
                  />
                  {formData.diasDisponiveis.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayField('diasDisponiveis', index)}
                      className="text-red-500 ml-2"
                      aria-label={`Remover data ${dia || index + 1}`}
                    >
                      <X/>
                    </button>
                  )}
                </InputRoot>
              ))}
              <button
                type="button"
                onClick={() => addArrayField('diasDisponiveis')}
                className="text-sm text-pink4000 hover:underline self-start"
              >
                + Adicionar data
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm text-pink4000 font-medium">Horários Disponíveis</label>
              {formData.horariosDisponiveis.map((hora, index) => (
                <InputRoot key={index}>
                  <InputIcon><Clock size={18} /></InputIcon>
                  <InputField
                    placeholder="Ex: 08:00 - 12:00"
                    value={hora}
                    onChange={e =>
                      handleArrayChange('horariosDisponiveis', index, e.target.value)
                    }
                  />
                  {formData.horariosDisponiveis.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayField('horariosDisponiveis', index)}
                      className="text-red-500 ml-2"
                      aria-label={`Remover horário ${hora || index + 1}`}
                    >
                      <X/>
                    </button>
                  )}
                </InputRoot>
              ))}
              <button
                type="button"
                onClick={() => addArrayField('horariosDisponiveis')}
                className="text-sm text-pink4000 hover:underline self-start"
              >
                + Adicionar horário
              </button>
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
