"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, ArrowLeft, Trash2 } from "lucide-react";
import { IconButton } from "@/components/icon-button";
import React from "react";
import { Button } from "./button";
import { useRouter } from "next/navigation";

type Pessoa = {
  id: number;
  nome: string;
  email: string;
  cpf: string;
};

export default function AdminUsersPanel() {

  const [modalTop, setModalTop] = useState<number | null>(null);
  const [isExit, setIsExit] = useState(false);
  const [idToDelete, setIdToDelete] = useState<number | null>(null);
  const [typeToDelete, setTypeToDelete] = useState<keyof typeof open | null>(
    null
  );

  const router = useRouter();

  function handleDeleteClick(
    e: React.MouseEvent<HTMLButtonElement>,
    id: number,
    type: keyof typeof open
  ) {
    setIdToDelete(id);
    setTypeToDelete(type);
    setIsExit(true);

    const buttonTop = e.currentTarget.getBoundingClientRect().top;
    setModalTop(buttonTop);
  }

  const handleAdicionarClick = (tipo: keyof typeof open) => {
    if (tipo === "usuarios") router.push("/cadastro");
    else if (tipo === "profissionais") router.push("/profissional-cadastro");
    else if (tipo === "estagiarios") router.push("/estagiario-cadastro");
  };

  const [open, setOpen] = useState({
    usuarios: false,
    profissionais: false,
    estagiarios: false,
  });

  const [usuarios, setUsuarios] = useState<Pessoa[]>([]);
  const [profissionais, setProfissionais] = useState<Pessoa[]>([]);
  const [estagiarios, setEstagiarios] = useState<Pessoa[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const usuariosRes = await fetch("http://127.0.0.1:8000/api/usuarios");
        const profissionaisRes = await fetch(
          "http://127.0.0.1:8000/api/profissionais"
        );
        const estagiariosRes = await fetch(
          "http://127.0.0.1:8000/api/estagiarios"
        );

        const usuariosData = await usuariosRes.json();
        const profissionaisData = await profissionaisRes.json();
        const estagiariosData = await estagiariosRes.json();

        setUsuarios(usuariosData);
        setProfissionais(profissionaisData);
        setEstagiarios(estagiariosData);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      }
    }

    fetchData();
  }, []);

  async function deleteUsuario(id: number | string, tipo: keyof typeof open) {
    // Define o endpoint correto com base no tipo e id
    const endpoint = `http://localhost:8000/api/${tipo}/${id}/`;

    try {
      const response = await fetch(endpoint, {
        method: "DELETE",
      });

      if (!response.ok) {
        alert("Erro ao deletar. Verifique se o servidor está ativo.");
        return;
      }

      alert(`Registro ${id} deletado com sucesso!`);

      // Atualiza o estado local removendo o item deletado
      if (tipo === "usuarios") {
        setUsuarios((prev) => prev.filter((user) => user.id !== id));
      } else if (tipo === "profissionais") {
        setProfissionais((prev) => prev.filter((user) => user.id !== id));
      } else if (tipo === "estagiarios") {
        setEstagiarios((prev) => prev.filter((user) => user.id !== id));
      }
    } catch (error) {
      console.error("Erro na requisição DELETE:", error);
      alert("Erro ao conectar com o servidor.");
    }
  }

  function toggle(section: keyof typeof open) {
    setOpen((prev) => ({ ...prev, [section]: !prev[section] }));
  }

  function renderSection(
    title: string,
    sectionKey: keyof typeof open,
    isOpen: boolean,
    items: Pessoa[],
    buttonText: string
  ) {
    return (
      <div className="mb-4">
        <Button
          className="group flex justify-between items-center px-5 h-12 bg-pink2000 text-pink100 font-semibold rounded-xl w-full cursor-pointer transition-colors duration-300 hover:bg-pink3000 hover:text-pink4000 shadow"
          onClick={() => toggle(sectionKey)}
        >
          <span>{title}</span>
          {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </Button>

        {isOpen && (
          <>
            <div className="mt-2 mb-2">
              {sectionKey !== "usuarios" && (
                <Button
                  className="bg-pink2000 shadow text-pink1000 px-4 py-2 rounded-md hover:bg-pink1000 hover:text-pink2000 cursor-pointer transition-colors duration-300"
                  onClick={() => handleAdicionarClick(sectionKey)}
                >
                  {buttonText}
                </Button>
              )}
            </div>
            <ul className="bg-pink1000 border border-pink1000 rounded-md shadow p-4">
              {items.map((item) => (
                <li key={item.id} className="mb-4">
                  <div className="w-full h-px bg-pink3000 my-2" />
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{item.nome}</p>
                      <p className="text-sm text-pink200">
                        EMAIL: {item.email}
                      </p>
                      <p className="text-sm text-pink200">CPF: {item.cpf}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        className="bg-pink1000 text-pink2000 px-3 py-1 rounded-md shadow hover:bg-pink4000 hover:text-pink1000 transition-colors duration-300 cursor-pointer"
                        onClick={() => console.log("Alterar", item.id)}
                      >
                        Alterar
                      </Button>
                      <IconButton
                        onClick={(e) =>
                          handleDeleteClick(e, item.id, sectionKey)
                        }
                        className="p-1.5 bg-pink1000 text-pink4000 rounded-md cursor-pointer transition-colors duration-300 hover:text-red"
                      >
                        <Trash2 size={20} />
                      </IconButton>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    );
  }

  
  return (
    <>
      <div className="bg-pink2000 w-full h-20 fixed top-0 left-0 flex items-center px-4 z-50">
        <div className="flex items-center gap-2">
          <IconButton className="bg-pink2000 text-pink1000 p-2 rounded-md hover:text-pink4000 hover:bg-pink2000 cursor-pointer"
          onClick={() => router.push('/')}
          >
            <ArrowLeft />
          </IconButton>
          <h1 className="text-pink1000 text-2xl font-semibold text-center">
            MENU DO ADMINISTRADOR
          </h1>
        </div>
      </div>

      <div className="pt-24 p-6 max-w-3xl mx-auto">
        <div className="flex justify-center gap-2 mb-8 mt-10 flex-wrap">
          <h1 className="text-3xl font-semibold text-pink4000 whitespace-nowrap">
            Painel de Usuários
          </h1>
        </div>

        {renderSection(
          "Usuários",
          "usuarios",
          open.usuarios,
          usuarios,
          "Adicionar Usuário"
        )}
        {renderSection(
          "Profissionais",
          "profissionais",
          open.profissionais,
          profissionais,
          "Adicionar Profissional"
        )}
        {renderSection(
          "Estagiários",
          "estagiarios",
          open.estagiarios,
          estagiarios,
          "Adicionar Estagiário"
        )}
      </div>

      {isExit && (
        <>
          <div
            role="button"
            tabIndex={0}
            onClick={() => setIsExit(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                setIsExit(false);
              }
            }}
            className="fixed inset-0 z-40 backdrop-blur-sm"
          />
          <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{
              top: modalTop ? modalTop + window.scrollY - 50 : "10vh",
              position: "absolute",
            }}
          >
            <div className="bg-pink1000 rounded-2xl shadow-lg p-6 w-[90vw] max-w-sm h-[150px] border border-pink4000 relative">
              {/* Faixa superior interna */}
              <div className="bg-pink2000 w-full h-4 absolute top-0 left-0 rounded-t-2xl border-b border-pink4000" />

              {/* Botão de voltar */}
              <div className="absolute top-4 left-4 z-10">
                <IconButton
                  onClick={() => setIsExit(false)}
                  className="p-1.5 bg-pink1000 text-pink4000 rounded-md cursor-pointer transition-colors duration-300 hover:text-pink2000"
                >
                  <ArrowLeft />
                </IconButton>
              </div>

              {/* Título e botões */}
              <h2 className="text-xl font-bold mb-10 text-pink4000 text-center mt-2">
                Deseja excluir?
              </h2>

              <div className="flex justify-center mb-2 gap-2">
                <Button
                  onClick={() => setIsExit(false)}
                  className="bg-pink2000 text-pink1000 border border-pink2000 px-4 py-2 rounded-xl transition-colors duration-300 hover:bg-pink3000 hover:text-pink2000 cursor-pointer"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={async () => {
                    if (idToDelete !== null && typeToDelete !== null) {
                      await deleteUsuario(idToDelete, typeToDelete);
                      setIsExit(false);
                      setIdToDelete(null);
                      setTypeToDelete(null);
                    }
                  }}
                  className="bg-red text-pink1000 border border-red px-4 py-2 rounded-xl transition-colors duration-300 hover:bg-pink3000 hover:text-red cursor-pointer"
                >
                  Sim
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
