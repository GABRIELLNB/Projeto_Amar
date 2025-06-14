'use client'

import { Button } from '@/components/button'
import { IconButton } from '@/components/icon-button'
import { InputField, InputIcon, InputRoot } from '@/components/input'
import SidebarMenu from '@/components/sidebar-menu'
import {jwtDecode} from 'jwt-decode'
import {
  ArrowLeft,
  Eye,
  EyeOff,
  FileText,
  Fingerprint,
  Lock,
  Mail,
  Phone,
  SquarePen,
  User,
} from 'lucide-react'
import { useEffect, useState } from 'react'

export default function EditarPerfil() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [userType, setUserType] = useState<"profissional" | "estagiario" | "outro">("outro");
  const [userName, setUserName] = useState<string>("");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true); // só ativa no client
    const storedUserType = localStorage.getItem("user_type") as
      | "profissional"
      | "estagiario"
      | "outro";
    const storedUserName = localStorage.getItem("user_name") || "";

    if (storedUserType) setUserType(storedUserType);
    setUserName(storedUserName);
  }, []);

 if (!isClient) return null; // evita renderização no build

  return (
    <div>
       <SidebarMenu userType={userType}
        userName={userName}
        activeItem="Editar Perfil"/>

      <div className="ml-[360px] p-6 relative">
        <div className="gap-6 mt-[-50] px-6">
          <div className="flex items-center gap-6 ml-0 flex-wrap">
            <div className="bg-pink1000 rounded-xl shadow-md p-6 w-full max-w-full overflow-auto max-h-screen mt-10">
              <div className="flex-grow overflow-auto">
                <div className="flex justify-center mt-0 ">
                  <div className="relative w-fit mx-auto">
                    <IconButton className="w-42 h-42 rounded-full bg-pink3000 text-pink4000 flex items-center justify-center">
                      <User className="w-20 h-20" />
                    </IconButton>

                    {/* Botão de editar (ícone de lápis ou texto) */}
                    <Button className="absolute bottom-2 right-2 bg-pink4000 text-pink1000 p-1 rounded-full hover:bg-pink2000 hover:text-pink1000 transition cursor-pointer">
                      <SquarePen />
                    </Button>
                  </div>
                </div>

                <div className="flex justify-center mb-2">
                  <h1 className="text-3xl font-bold text-pink4000">
                    Paulo Avelino
                  </h1>
                </div>
              </div>
              <form className="space-y-4">
                <div>
                  <label
                    htmlFor="nome"
                    className="block text-sm font-medium text-pink2000 mb-1"
                  >
                    Nome
                  </label>
                  <InputRoot className="group bg-pink1000 h-10 border border-pink2000 rounded-sm px-4 flex items-center gap-2 focus-within:border-pink4000 data-[error=true]:border-red-700">
                    <InputIcon>
                      <User />
                    </InputIcon>
                    <InputField
                      id="nome"
                      placeholder="Digite seu nome"
                      defaultValue="Paulo Avelino"
                    />
                  </InputRoot>
                </div>
                <div>
                  <label
                    htmlFor="nome"
                    className="block text-sm font-medium text-pink2000 mb-1"
                  >
                    CPF
                  </label>
                  <InputRoot className="group bg-pink1000 h-10 border border-pink2000 rounded-sm px-4 flex items-center gap-2 focus-within:border-pink4000 data-[error=true]:border-red-700">
                    <InputIcon>
                      <Fingerprint />
                    </InputIcon>
                    <InputField
                      id="cpf"
                      placeholder="Digite seu CPF"
                      defaultValue="123.456.789-00"
                      readOnly
                      className="flex-1 outline-0 text-pink4000 opacity-25 cursor-not-allowed"
                    />
                  </InputRoot>
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-pink2000 mb-1"
                  >
                    Email
                  </label>
                  <InputRoot className="group bg-pink1000 h-10 border border-pink2000 rounded-sm px-4 flex items-center gap-2 focus-within:border-pink4000 data-[error=true]:border-red-700">
                    <InputIcon>
                      <Mail />
                    </InputIcon>
                    <InputField
                      id="email"
                      type="email"
                      placeholder="Digite seu email"
                      defaultValue="paulo@exemplo.com"
                    />
                  </InputRoot>
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-pink2000 mb-1"
                  >
                    Senha
                  </label>
                  <InputRoot className="group bg-pink1000 h-10 border border-pink2000 rounded-sm px-4 flex items-center gap-2 focus-within:border-pink4000 data-[error=true]:border-red-700">
                    <InputIcon>
                      <Lock />
                    </InputIcon>
                    <InputField
                      id="senha"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Digite sua senha"
                      defaultValue="paulo@exemplo.com"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-pink4000 hover:text-pink2000 transition cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </InputRoot>
                </div>

                <div>
                  <label
                    htmlFor="confirmar-senha"
                    className="block text-sm font-medium text-pink2000 mb-1"
                  >
                    Confirmar Senha
                  </label>
                  <InputRoot className="group bg-pink1000 h-10 border border-pink2000 rounded-sm px-4 flex items-center gap-2 focus-within:border-pink4000 data-[error=true]:border-red-700">
                    <InputIcon>
                      <Lock />
                    </InputIcon>
                    <InputField
                      id="confirmar-senha"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirme sua senha"
                      defaultValue="paulo@exemplo.com"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="text-pink4000 hover:text-pink2000 transition cursor-pointer"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                  </InputRoot>
                </div>

                <Button
                  type="submit"
                  className="group flex justify-between items-center mt-8 px-5 h-12 bg-pink2000 text-pink100 font-semibold rounded-xl w-full cursor-pointer transition-colors duration-300 hover:bg-pink3000 hover:text-pink4000"
                >
                  <span className="mx-auto">Confirmar Alterações</span>
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
