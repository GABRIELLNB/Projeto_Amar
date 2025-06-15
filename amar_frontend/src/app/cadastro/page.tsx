"use client";

import { Button } from "@/components/button";
import { IconButton } from "@/components/icon-button";
import { InputField, InputIcon, InputRoot } from "@/components/input";
import { MaskedInputField } from "@/components/mask";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  FileText,
  Fingerprint,
  Lock,
  Mail,
  Phone,
  User,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import InputMask from "react-input-mask";
import { z } from "zod";

const cadastroSchema = z
  .object({
    nome: z.string().min(2, "Digite seu nome completo"),
    cpf: z.string().min(14, "CPF inválido"), // 000.000.000-00
    email: z.string().email("Digite um e-mail válido"),
    telefone: z.string().min(14, "Telefone inválido"), // (00) 00000-0000
    senha: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
    confirmarSenha: z.string(),
  })
  .refine((data) => data.senha === data.confirmarSenha, {
    message: "As senhas não coincidem",
    path: ["confirmarSenha"],
  });

type CadastroSchema = z.infer<typeof cadastroSchema>;

export default function Cadastro() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CadastroSchema>({
    resolver: zodResolver(cadastroSchema),
  });

  async function onSubmit(data: CadastroSchema) {
    setIsLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:8000/api/cadastro/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const text = await response.text(); // pega o texto bruto da resposta

      // biome-ignore lint/suspicious/noImplicitAnyLet: <explanation>
      let result;
      try {
        result = JSON.parse(text); // tenta converter para JSON
      } catch {
        result = text; // se não for JSON, usa o texto puro
      }

      if (response.ok) {
        setSuccessMessage("Usuário cadastrado com sucesso!");
        setTimeout(() => router.push("/"), 3000); // Redireciona após 3s
        router.push("/");
      } else {
        console.error("Erro da API:", result);

        const errorMessage =
          typeof result === "object" && result !== null
            ? JSON.stringify(result)
            : String(result);

        setErrorMessage(`Erro ao cadastrar usuário: ${errorMessage}`);
      }
    } catch (error) {
      console.error("Erro de rede ou inesperado:", error);
      setErrorMessage(
        `Erro de conexão ou inesperado: ${
          error instanceof Error ? error.message : JSON.stringify(error)
        }`
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-dvh w-full flex items-center justify-center gap-16 flex-col md:flex-row">
      <div className="relative bg-pink1000 p-8 rounded-xl shadow-lg w-full max-w-md min-h-[400px]">
        <div className="absolute top-4 left-4">
          <IconButton onClick={() => router.push("/")}>
            <ArrowLeft />
          </IconButton>
        </div>

        <div className="flex justify-center items-center mb-6 mt-6">
          <h1 className="text-xl font-bold text-blue1000">Crie sua Conta</h1>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 mb-0">
            {/* Nome */}
            <InputRoot error={!!errors.nome}>
              <InputIcon>
                <User />
              </InputIcon>
              <InputField
                type="text"
                placeholder="Seu nome"
                {...register("nome")}
              />
            </InputRoot>
            {errors.nome && (
              <p className="mt-1 text-red text-xs">{errors.nome.message}</p>
            )}

            {/* CPF */}
            <InputRoot error={!!errors.cpf}>
              <InputIcon>
                <Fingerprint />
              </InputIcon>
              <MaskedInputField
                mask="000.000.000-00"
                placeholder="CPF"
                {...register("cpf")}
              />
            </InputRoot>
            {errors.cpf && (
              <p className="mt-1 text-red text-xs">{errors.cpf.message}</p>
            )}

            {/* Email */}
            <InputRoot error={!!errors.email}>
              <InputIcon>
                <Mail />
              </InputIcon>
              <InputField
                type="email"
                placeholder="E-mail"
                {...register("email")}
              />
            </InputRoot>
            {errors.email && (
              <p className="mt-1 text-red text-xs">{errors.email.message}</p>
            )}

            {/* Telefone */}
            <InputRoot error={!!errors.telefone}>
              <InputIcon>
                <Phone />
              </InputIcon>
              <MaskedInputField
                mask="(00) 00000-0000"
                placeholder="Telefone"
                {...register("telefone")}
              />
            </InputRoot>
            {errors.telefone && (
              <p className="mt-1 text-red text-xs">{errors.telefone.message}</p>
            )}

            {/* Senha */}
            <InputRoot error={!!errors.senha}>
              <InputIcon>
                <Lock />
              </InputIcon>
              <InputField
                type="password"
                placeholder="Senha"
                {...register("senha")}
              />
            </InputRoot>
            {errors.senha && (
              <p className="mt-1 text-red text-xs">{errors.senha.message}</p>
            )}

            {/* Confirmar Senha */}
            <InputRoot error={!!errors.confirmarSenha}>
              <InputIcon>
                <Lock />
              </InputIcon>
              <InputField
                type="password"
                placeholder="Confirme sua senha"
                {...register("confirmarSenha")}
              />
            </InputRoot>
            {errors.confirmarSenha && (
              <p className="mt-1 text-red text-sm">
                {errors.confirmarSenha.message}
              </p>
            )}
          </div>

          <br />
          {errorMessage && (
            <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-center">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="bg-green-100 text-green-700 p-2 rounded mb-4 text-center">
              {successMessage}
            </div>
          )}

          <Button type="submit">
            <span className="mx-auto">Confirmar</span>
          </Button>

          <div className="mt-[8px] text-sm text-[13px]">
            <Button
              type="button"
              onClick={() => router.push("/")}
              className="font-bold text-blue1000 text-sm hover:underline transition-colors duration-300 cursor-pointer text-[14px]"
            >
              Já tem uma conta?
            </Button>
          </div>
        </form>
      </div>
      <div className="absolute top-4 left-4 flex items-center gap-2">
        <Image
          src="/teste3.png"
          alt="Logo da AMAR"
          width={50}
          height={50}
          priority
        />
        <div className="flex flex-col leading-tight">
          <h1 className="text-[20px] font-bold text-blue1000 ml-[-5]">
            A.M.A.R
          </h1>
          <span className="text-sm text-pink4000 ml-[-5]">
            Apoio, Motivação, Acolhimento e Respeito
          </span>
        </div>
      </div>
    </div>
  );
}
