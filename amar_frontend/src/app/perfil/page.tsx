"use client";

import { Button } from "@/components/button";
import { IconButton } from "@/components/icon-button";
import { InputField, InputIcon, InputRoot } from "@/components/input";
import { MaskedInputField } from "@/components/mask";
import SidebarMenu from "@/components/sidebar-menu";
import {
  Eye,
  EyeOff,
  Fingerprint,
  Lock,
  Mail,
  User,
  SquarePen,
  Phone,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useUser } from "@/contexts/userContext";


export default function EditarPerfil() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [userType, setUserType] = useState<
    "profissional" | "estagiario" | "outro"
  >("outro");

  const { setUserName, setUserImage } = useUser();
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [senhaMascara, setSenhaMascara] = useState<string | null>(null);

  const [tel, setTel] = useState(""); // Adicionado
  const [isClient, setIsClient] = useState(false);
  const [imagemPerfil, setImagemPerfil] = useState<string | null>(null);
  const inputFileRef = useRef<HTMLInputElement>(null);
  const [modalAberto, setModalAberto] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const storedUserType = localStorage.getItem("user_type") as
      | "profissional"
      | "estagiario"
      | "outro";
    const storedUserName = localStorage.getItem("user_name") || "";
    if (storedUserType) setUserType(storedUserType);
    setUserName(storedUserName);

    const token = localStorage.getItem("token");
    if (!token) return;

    fetch("http://localhost:8000/api/usuario/perfil/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Erro ao carregar perfil");
        const data = await res.json();
        setNome(data.nome || "");
        setCpf(data.cpf || "");
        setEmail(data.email || "");
        setTel(data.telefone || "");
        setSenhaMascara(data.senha_mascara || null); // <- aqui
      })
      .catch(() => alert("Erro ao carregar perfil"));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (senha !== confirmarSenha) {
      alert("As senhas não coincidem");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Você precisa estar logado");
      return;
    }

    const payload: any = {
      nome,
      email,
      telefone: tel,
    };
    if (senha.trim() !== "") {
      payload.password = senha;
    }

    const response = await fetch("http://localhost:8000/api/usuario/perfil/", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      alert("Perfil atualizado com sucesso!");
      setUserName(nome);
      if (imagemPerfil) {
        setUserImage(imagemPerfil);
        localStorage.setItem("imagem_perfil", imagemPerfil);
      }
      localStorage.setItem("user_name", nome);
      setSenha("");
      setConfirmarSenha("");
    } else {
      alert("Erro ao atualizar perfil");
    }
  }

  const handleImagemSelecionada = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagemPerfil(reader.result as string);
        // Se quiser salvar para manter ao recarregar:
        localStorage.setItem("imagem_perfil", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Carregar do localStorage ao abrir
  useEffect(() => {
    const imagemSalva = localStorage.getItem("imagem_perfil");
    if (imagemSalva) setImagemPerfil(imagemSalva);
  }, []);

  if (!isClient) return null;
  return (
    <div>
      <SidebarMenu userType={userType} activeItem="Editar Perfil" />

      <div className="ml-[360px] p-6 relative">
        <div className="gap-6 mt-[-50] px-6">
          <div className="flex items-center gap-6 ml-0 flex-wrap">
            <div className="bg-pink1000 rounded-xl shadow-md p-6 w-full max-w-full overflow-auto max-h-screen mt-10">
              <div className="flex-grow overflow-auto">
                <div className="flex justify-center mt-0 ">
                  <div className="relative w-fit mx-auto">
                    <IconButton
                      onClick={() => {
                        if (imagemPerfil) setModalAberto(true);
                      }}
                      className="w-42 h-42 rounded-full bg-pink3000 text-pink4000 flex items-center justify-center overflow-hidden cursor-pointer"
                      aria-label="Visualizar imagem ampliada"
                    >
                      {imagemPerfil ? (
                        <img
                          src={imagemPerfil}
                          alt="Perfil"
                          className="object-cover w-full h-full rounded-full"
                        />
                      ) : (
                        <User className="w-20 h-20" />
                      )}
                    </IconButton>
                    <Button
                      onClick={() => inputFileRef.current?.click()}
                      className="absolute bottom-2 right-2 bg-pink4000 text-pink1000 p-1 rounded-full hover:bg-pink2000 hover:text-pink1000 transition cursor-pointer"
                    >
                      <SquarePen />
                    </Button>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImagemSelecionada}
                      ref={inputFileRef}
                      className="hidden"
                    />
                  </div>
                  {modalAberto && (
                    <div
                      onClick={() => setModalAberto(false)}
                      className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 cursor-pointer "
                    >
                      <img
                        src={imagemPerfil!}
                        alt="Imagem ampliada"
                        className="max-w-[90vw] max-h-[90vh] rounded-full shadow-lg"
                        onClick={(e) => e.stopPropagation()} // para evitar fechar ao clicar na imagem
                      />
                    </div>
                  )}
                </div>

                <div className="flex justify-center mb-2">
                  <h1 className="text-3xl font-bold text-pink4000">{nome}</h1>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Nome */}
                <label className="text-pink2000">Nome</label>
                <InputRoot>
                  <InputIcon>
                    <User />
                  </InputIcon>
                  <InputField
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Digite seu nome"
                    required
                  />
                </InputRoot>

                {/* CPF */}
                <label className="text-pink2000">CPF</label>
                <InputRoot>
                  <InputIcon>
                    <Fingerprint />
                  </InputIcon>
                  <InputField value={cpf} readOnly />
                </InputRoot>

                {/* Email */}
                <label className="text-pink2000">Email</label>
                <InputRoot>
                  <InputIcon>
                    <Mail />
                  </InputIcon>
                  <InputField
                    type="email"
                    value={email}
                    readOnly
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Digite seu email"
                    required
                  />
                </InputRoot>

                {/* Telefone */}
                <label className="text-pink2000">Telefone</label>
                <InputRoot>
                  <InputIcon>
                    <Phone />
                  </InputIcon>

                  <MaskedInputField
                    mask="(00) 00000-0000"
                    placeholder="Digite seu telefone"
                    value={tel}
                    onChange={(e) => setTel(e.target.value)}
                    required
                  />
                </InputRoot>

                <label className="text-pink2000">Senha</label>
                <InputRoot>
                  <InputIcon>
                    <Lock />
                  </InputIcon>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="Digite sua senha"
                    className="bg-transparent flex-1 outline-none text-pink4000"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-pink4000 hover:text-pink2000 transition"
                  >
                    {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                </InputRoot>

                {/* Confirmar Senha */}
                <label className="text-pink2000">Confirmar Senha</label>
                <InputRoot>
                  <InputIcon>
                    <Lock />
                  </InputIcon>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    placeholder="Confirme sua senha"
                    className="bg-transparent flex-1 outline-none text-pink4000"
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

                <Button
                  type="submit"
                  className=" cursor-pointer mt-6 bg-pink2000 text-pink100 rounded-xl w-full py-3 font-semibold hover:bg-pink3000 hover:text-pink4000 transition"
                >
                  Confirmar Alterações
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
