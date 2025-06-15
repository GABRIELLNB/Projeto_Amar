"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/button";
import { InputField, InputIcon, InputRoot } from "@/components/input";
import { useState } from "react";

// Schema de validação com Zod
const loginSchema = z.object({
  email: z.string().email("Digite um e-mail válido"),
  senha: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

type LoginSchema = z.infer<typeof loginSchema>;

export default function Home() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
  });

  async function onLogin(data: LoginSchema) {
    try {
      const response = await fetch("http://localhost:8000/api/token/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          password: data.senha,
        }),
      });

      if (!response.ok) throw new Error("Erro no login");

      const json = await response.json();
      console.log("Resposta do backend:", json);

      localStorage.setItem("token", json.access);
      localStorage.setItem("user_type", json.user_type); // Salva tipo de usuário
      localStorage.setItem("user_name", json.name); // Salva nome, se disponível
      localStorage.setItem("usuario_id", json.id);

      if (json.is_superuser) {
        router.push("/menu-adm");
      } else if (
        json.user_type === "profissional" ||
        json.user_type === "estagiario"
      ) {
        router.push("/menu");
      } else {
        router.push("/menu");
      }
    } catch (error) {
    console.error("Falha no login:", error);
    setErrorMessage("Usuário ou senha inválidos");
  }

  }

  return (
    <div className="min-h-dvh w-full flex items-center justify-center gap-16 flex-col md:flex-row">
      <div className="bg-pink1000 p-8 rounded-xl shadow-lg w-full max-w-md min-h-[400px]">
        <div className="flex items-start text-left gap-1 ml-1 mb-6">
          <Image
            src="/teste3.png"
            alt="Logo da AMAR"
            width={130}
            height={130}
            priority
          />
          <div className="flex flex-col leading-tight">
            <h1 className="text-4xl font-bold text-blue1000">
              <br />
              A.M.A.R
            </h1>
            <span className="text-sm text-blue1000">
              Apoio, Motivação, Acolhimento e Respeito
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onLogin)} className="space-y-4">
          <div className="space-y-4 mb-0">
            {/* Email */}
            <div className="space-y-1">
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
                <p className="text-red text-xs">{errors.email.message}</p>
              )}
            </div>

            {/* Senha */}
            <div className="space-y-1">
              <InputRoot error={!!errors.senha}>
                <InputIcon>
                  <Lock />
                </InputIcon>
                <InputField
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Senha"
                  {...register("senha")}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-pink4000 hover:text-pink2000 transition"
                >
                  {showConfirmPassword ? (
                    <Eye size={16} />
                  ) : (
                    <EyeOff size={16} />
                  )}
                </button>
              </InputRoot>
              {errors.senha && (
                <p className="text-red text-xs">{errors.senha.message}</p>
              )}
            </div>
          </div>

          <br />
{errorMessage && (
  <div className="flex justify-center mt-2">
    <p className="text-red-600 text-sm">{errorMessage}</p>
  </div>
)}


          <Button type="submit">
            <span className="mx-auto">Entrar</span>
          </Button>

          <div className="mt-[-10px] text-sm text-[13px]">
            <span className="text-pink2000">Precisando de uma conta?</span>
            <Button
              type="button"
              onClick={() => router.replace("/cadastro")}
              className="ml-1 text-blue1000 text-sm hover:underline transition-colors duration-300 cursor-pointer text-[13px]"
            >
              Registre-se
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
