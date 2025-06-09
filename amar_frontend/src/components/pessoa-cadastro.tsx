"use client";
import { MaskedInputField } from "@/components/mask";
import { Button, ButtonField } from "@/components/button";
import { InputField, InputIcon, InputRoot } from "@/components/input";
import {
  ArrowLeft,
  CalendarCheck,
  Camera,
  Clock,
  Fingerprint,
  HandHelping,
  IdCard,
  ImageDown,
  MapPin,
  Phone,
  User,
  X,
} from "lucide-react";

import { useRouter } from "next/navigation";
import { type JSX, useEffect, useState } from "react";
import { z } from "zod";
import { IconButton } from "./icon-button";

const cadastroSchema = z.object({
  nome: z.string().min(2, "Digite seu nome completo"),
  cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, "CPF inválido"),
  telefone: z.string().regex(/^\(\d{2}\) \d{4,5}-\d{4}$/, "Telefone inválido"),
  matricula: z.string().min(1, "Matrícula é obrigatória"),
  tipo_servico: z.string().min(1, "Tipo de serviço é obrigatório"),
  local: z.string().min(1, "Local é obrigatório"),
  sala: z.string().min(1, "Sala é obrigatório"),
  disponibilidades: z.array(
    z.object({
      dia: z.string().min(1, "Dia é obrigatório"),
      horarios: z.array(z.string().min(1, "Horário é obrigatório")),
    })
  ),
});

interface CadastroPessoaProps {
  type: "profissional" | "estagiario";
  onSubmit: (data: any) => void;
  editarCpf?: string; // se tiver, é edição, passa o CPF do registro
}

export default function CadastroPessoa({
  type,
  onSubmit,
  editarCpf,
}: CadastroPessoaProps) {
  const [formData, setFormData] = useState({
    nome: "",
    cpf: "",
    matricula: "",
    telefone: "",
    tipo_servico: "",
    local: "",
    sala: "",
    disponibilidades: [{ dia: "", horarios: [""] }],
  });

  const [errors, setErrors] = useState<Record<string, string | string[]>>({});

  const fieldIcons: Record<string, JSX.Element> = {
    nome: <User size={18} />,
    cpf: <Fingerprint size={18} />,
    matricula: <IdCard size={18} />,
    telefone: <Phone size={18} />,
    tipo_servico: <HandHelping size={20} />,
    local: <MapPin size={20} />,
    sala: <MapPin size={20} />,
    disponibilidades: <CalendarCheck size={18} />,
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Disponibilidades handlers
  const handleDiaChange = (index: number, value: string) => {
    setFormData((prev) => {
      const updated = [...prev.disponibilidades];
      updated[index].dia = value;
      return { ...prev, disponibilidades: updated };
    });
  };

  const handleHorarioChange = (
    dispIndex: number,
    horarioIndex: number,
    value: string
  ) => {
    setFormData((prev) => {
      const updated = [...prev.disponibilidades];
      updated[dispIndex].horarios[horarioIndex] = value;
      return { ...prev, disponibilidades: updated };
    });
  };

  const addDiaDisponivel = () => {
    setFormData((prev) => ({
      ...prev,
      disponibilidades: [...prev.disponibilidades, { dia: "", horarios: [""] }],
    }));
  };

  const removeDiaDisponivel = (index: number) => {
    setFormData((prev) => {
      const updated = [...prev.disponibilidades];
      updated.splice(index, 1);
      return { ...prev, disponibilidades: updated };
    });
  };

const addHorario = (index: number) => {
  setFormData((prev) => {
    const updated = prev.disponibilidades.map((disp, idx) =>
      idx === index
        ? { ...disp, horarios: [...disp.horarios, ""] }
        : disp
    );
    return { ...prev, disponibilidades: updated };
  });
};

  const removeHorario = (dispIndex: number, horarioIndex: number) => {
    setFormData((prev) => {
      const updated = [...prev.disponibilidades];
      if (updated[dispIndex].horarios.length > 1) {
        updated[dispIndex].horarios.splice(horarioIndex, 1);
      }
      return { ...prev, disponibilidades: updated };
    });
  };

  
  // Carregar dados para edição
  useEffect(() => {
    if (editarCpf) {
      fetch(`http://127.0.0.1:8000/api/precadastro/${type}/${editarCpf}`)
        .then((res) => res.json())
        .then((data) => {
          setFormData({
            nome: data.nome || "",
            cpf: data.cpf || editarCpf,
            matricula: data.matricula || "",
            telefone: data.telefone || "",
            tipo_servico: data.tipo_servico || "",
            local: data.local || "",
            sala: data.sala || "",
            disponibilidades: Array.isArray(data.disponibilidades)
  ? data.disponibilidades.map((d: any) => ({
      dia: d.dia || "",
      horarios: Array.isArray(d.horarios) ? d.horarios : [""],
    }))
  : [{ dia: "", horarios: [""] }],
          });
        })
        .catch((err) =>
          console.error("Erro ao carregar dados para edição:", err)
        );
    }
  }, [editarCpf, type]);



  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    
      event.preventDefault();

      const result = cadastroSchema.safeParse(formData);
      console.log("Validação:", result);

      if (!result.success) {
        const fieldErrors: Record<string, string | string[]> = {};
        for (const issue of result.error.issues) {
          const key = issue.path.join(".");
          fieldErrors[key] = issue.message;
        }
        setErrors(fieldErrors);
        return;
      }

      setErrors({});

      try {
        let url = "";
        let method = "";

        console.log("URL:", url);
        console.log("Payload:", { tipo: type, ...result.data });
        

        if (editarCpf) {
          url = `http://127.0.0.1:8000/api/precadastro/${type}/${formData.cpf}/`;
          method = "PUT";
        } else {
          url = "http://127.0.0.1:8000/api/cadastro-funcionario/";
          method = "POST";
        }

        const response = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tipo: type, ...result.data }),
        });

        if (!response.ok) {
          const text = await response.text();

          try {
            const errorResponse = JSON.parse(text);
            alert(errorResponse.error || "Erro inesperado.");
          } catch {
            console.error("Resposta não era JSON:", text);
            alert("Erro inesperado do servidor.");
          }

          return;
        }

        alert(
          editarCpf
            ? "Funcionário atualizado com sucesso!"
            : "Funcionário cadastrado com sucesso!"
        );
        onSubmit({ tipo: type, ...result.data });
      } catch (err) {
        alert("Erro de rede ou inesperado.");
        console.error(err);
      }
    };

    const renderInput = (
  label: string,
  name: keyof typeof formData,
  required = true
) => (
  <div className="flex flex-col gap-1" key={name}>
    <label htmlFor={name} className="text-sm text-pink4000 font-medium">
      {label}
    </label>
    <InputRoot>
      <InputIcon>{fieldIcons[name]}</InputIcon>

      {name === "cpf" || name === "telefone" ? (
        <MaskedInputField
          mask={name === "cpf" ? "000.000.000-00" : "(00) 0000-0000"}
          guide={false}
          id={name}
          name={name}
          required={required}
          placeholder={label}
          className="bg-transparent outline-none flex-1 text-black placeholder-pink2000"
          value={typeof formData[name] === "string" ? formData[name] : ""}
          onChange={handleChange}
        />
      ) : (
        <InputField
          id={name}
          name={name}
          required={required}
          placeholder={label}
          value={typeof formData[name] === "string" ? formData[name] : ""}
          onChange={handleChange}
        />
      )}
    </InputRoot>
    {errors[name] && (
      <p className="text-red-500 text-xs mt-1">
        {Array.isArray(errors[name])
          ? errors[name].join(", ")
          : errors[name]}
      </p>
    )}
  </div>
);

    const router = useRouter();
    return (
      <>
        <div className="bg-pink2000 w-full h-20 fixed top-0 left-0 flex items-center px-4 z-50">
          <div className="flex items-center gap-2">
            <IconButton
              className="bg-pink2000 text-pink1000 p-2 rounded-md hover:text-pink4000 hover:bg-pink2000 cursor-pointer"
              onClick={() => router.push("/menu-adm")}
            >
              <ArrowLeft />
            </IconButton>
            <h1 className="text-pink1000 text-2xl font-semibold">
              ADICIONAR FUNCIONÁRIO
            </h1>
          </div>
        </div>

        <div className="flex flex-col md:flex-row w-full bg-pink1000 p-6 gap-8 items-center justify-center min-h-screen pt-24">

{formData && (
          <form
            onSubmit={handleSubmit}
            className="flex-1 space-y-4 bg-pink1000 p-6 rounded-xl shadow-md items-center"
            noValidate
          >
            <h2 className="text-2xl font-bold text-pink4000">
              {editarCpf ? "Alteração de " : "Cadastro de "}
              {type === "profissional" ? "Profissional" : "Estagiário"}
            </h2>

            {renderInput("Nome", "nome")}
            <div className="flex gap-5">
              <div className="w-full md:w-1/3">{renderInput("CPF", "cpf")}</div>
              <div className="w-full md:w-1/3">
                {renderInput("Matrícula", "matricula")}
              </div>
              <div className="w-full md:w-1/3">
                {renderInput("Telefone", "telefone")}
              </div>
            </div>
            {renderInput("Tipo de Serviço", "tipo_servico")}
            <div className="flex gap-5 ">
              <div className="w-full md:w-1/2">
                {renderInput("Local", "local")}
              </div>

              <div className="w-full md:w-1/2">
                {renderInput("Sala", "sala")}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 cursor-pointer md:w-4/2">
              <div className="flex flex-col gap-2">
                <label
                  className="text-sm text-pink4000 font-medium"
                  htmlFor="disponibilidades-dia-0"
                >
                  Datas Disponíveis
                </label>
                {Array.isArray(formData.disponibilidades) &&
  formData.disponibilidades.map((disp, index) => (
                  <div
                    key={index}
                    className="w-full p-4 rounded-md flex flex-col gap-2"
                  >
                    {/* Input de Data */}
                    <div className="flex items-center gap-2 w-full">
                      <InputRoot className="flex-1 group bg-pink1000 h-12 border border-pink2000 rounded-xl px-4 flex items-center gap-2 focus-within:border-pink4000 data-[error=true]:border-red-700">
                        <InputIcon>
                          <CalendarCheck size={18} />
                        </InputIcon>
                        <input
                          type="date"
                          name={`disponibilidades[${index}].dia`}
                          id={`disponibilidades-dia-${index}`}
                          value={disp.dia}
                          onChange={(e) =>
                            handleDiaChange(index, e.target.value)
                          }
                          className="flex-1 outline-0 text-pink4000 bg-transparent"
                        />
                      </InputRoot>
                      <IconButton
                        onClick={() => removeDiaDisponivel(index)}
                        className="flex text-red-500 ml-2 cursor-pointer"
                      >
                        <X />
                      </IconButton>
                    </div>

                    {/* Inputs de Horário */}
                    {disp.horarios.map((horario, hIndex) => (
                      <div
                        key={`${index}-${hIndex}`}
                        className="flex items-center gap-2 w-full"
                      >
                        <InputRoot className="flex-1 group bg-pink1000 h-12 border border-pink2000 rounded-xl px-4 flex items-center gap-2 focus-within:border-pink4000 data-[error=true]:border-red-700">
                          <InputIcon>
                            <Clock size={18} />
                          </InputIcon>
                          <input
                            type="time"
                            name={`s[${index}].horarios[${hIndex}]`}
                            id={`disponibilidades-horario-${index}-${hIndex}`}
                            value={horario}
                            onChange={(e) =>
                              handleHorarioChange(index, hIndex, e.target.value)
                            }
                            className="flex-1 outline-0 text-pink4000 bg-transparent"
                          />
                        </InputRoot>
                        {disp.horarios.length > 1 && (
                          <IconButton
                            onClick={() => removeHorario(index, hIndex)}
                            className="text-red-500 ml-2"
                          >
                            <X />
                          </IconButton>
                        )}
                      </div>
                    ))}

                    <Button
                      type="button"
                      onClick={() => addHorario(index)}
                      className="text-sm text-pink4000 hover:underline mt-2 self-start cursor-pointer"
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
              <ButtonField className="flex-1 ">Confirmar</ButtonField>
            </Button>
          </form>
)}
        </div>
      </>
    );
  };
