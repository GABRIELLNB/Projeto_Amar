"use client";

import { BuscaPorNome } from "@/components/busca";
import { Button } from "@/components/button";
import { ChatInput } from "@/components/chat-input";
import { BotaoGostei } from "@/components/gostei";
import { IconButton } from "@/components/icon-button";
import { InputField, InputRoot } from "@/components/input";
import { ArrowLeft, CircleX, Send } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState, useRef, useEffect, useCallback } from "react";

type ForumsDisponiveis = {
  id: number;
  criador: {
    email: string;
    nome: string;
    cpf: string;
    telefone: string;
    foto_perfil: string;
  };
  nome: string;
  publicacao: string;
  total_curtidas: number;
};

type Mensagem = {
  id: number;
  forum: number;
  autor: {
    email: string;
    nome: string;
    cpf: string;
    telefone: string;
    foto_perfil: string;
  };
  mensagem: string;
  data_envio: string; // timestamp da mensagem

};

type ForumProps = {
  selectedForumId: number;
};
export default function Forum({ selectedForumId }: ForumProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [sidebarWidth, setSidebarWidth] = useState(350);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const isResizing = useRef(false);
  const minWidth = 300;
  const maxWidth = 400;
  const router = useRouter();

  const startResizing = () => {
    isResizing.current = true;
  };

  const stopResizing = useCallback(() => {
    isResizing.current = false;
  }, []);

  const resize = useCallback((e: MouseEvent) => {
    if (!isResizing.current) return;
    const maxAllowedWidth = Math.min(maxWidth, window.innerWidth - 50);
    const newWidth = Math.min(maxAllowedWidth, Math.max(minWidth, e.clientX));
    setSidebarWidth(newWidth);
  }, []);

  const [tabAtiva, setTabAtiva] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollToTab = (index: number) => {
    setTabAtiva(index);
    if (scrollContainerRef.current) {
      const width = scrollContainerRef.current.clientWidth;
      scrollContainerRef.current.scrollTo({
        left: width * index,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [resize, stopResizing]);


  const [selectedForum, setSelectedForum] = useState<ForumsDisponiveis | null>(null);
  const [foruns, setForuns] = useState<ForumsDisponiveis[]>([]);
  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch("http://localhost:8000/api/forum/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Erro ${res.status}`);
        return res.json();
      })
      .then((data: ForumsDisponiveis[]) => setForuns(data))
      .catch((err) => console.error("Erro ao buscar fóruns:", err));
  }, []);


  const [mensagens, setMensagens] = useState<Mensagem[]>([]);

useEffect(() => {
  if (!selectedForum) {
    setMensagens([]);
    return;
  }

  const token = localStorage.getItem("token");
  fetch(`http://localhost:8000/api/mensagem-forum/forum/${selectedForum.id}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((res) => {
      if (!res.ok) throw new Error(`Erro ${res.status}`);
      return res.json();
    })
  .then((data) => {
  console.log("Mensagens recebidas:", data);
  setMensagens(Array.isArray(data) ? data : data ? [data] : []);
})
    .catch((err) => console.error("Erro ao buscar mensagens:", err));
}, [selectedForum]);
  // Caso a API não filtre por fórum, filtra aqui
const mensagensDoForum = mensagens.filter(
  (m) => m.forum === selectedForum?.id
);

const bottomRef = useRef<HTMLDivElement>(null);
useEffect(() => {
  bottomRef.current?.scrollIntoView({ behavior: "smooth" });
}, [mensagensDoForum]);



  const [novoTitulo, setNovoTitulo] = useState("");
  const [novaDescricao, setNovaDescricao] = useState("");
  const token = localStorage.getItem("token");

  const formatarDataSimples = (date: Date) => {
    const dia = String(date.getDate()).padStart(2, "0");
    const mes = String(date.getMonth() + 1).padStart(2, "0"); // mês começa em 0
    const ano = date.getFullYear();
    return `${dia}-${mes}-${ano}`;
  };

  const criarForum = async () => {
    try {
      const dataCriacao = formatarDataSimples(new Date());

      const response = await fetch("http://localhost:8000/api/forum/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // se estiver usando JWT
        },
        body: JSON.stringify({
          nome: novoTitulo,
          publicacao: dataCriacao,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Fórum criado com sucesso:", data);
        setForuns((prev) => [...prev, data]);
        setNovoTitulo("");
      } else {
        const erro = await response.json();
        console.error("Erro ao criar fórum:", erro);
      }
    } catch (error) {
      console.error("Erro ao conectar com o servidor:", error);
    }
  };


  const userName = localStorage.getItem("user_name") || "";
  return (
    <>
      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className="fixed top-0 left-0 h-screen bg-pink3000 border-r border-pink5000 z-50 flex flex-col"
        style={{ width: sidebarWidth }}
      >
        {/* Header fixo no topo */}
        <div
          className="bg-pink2000 h-20 flex items-center px-4 sticky top-0 z-40"
          style={{ width: sidebarWidth }}
        >
          <IconButton
            className="bg-pink2000 text-pink1000 p-2 rounded-md hover:text-pink4000 hover:bg-pink2000 cursor-pointer"
            onClick={() => router.push("/menu")}
          >
            <ArrowLeft />
          </IconButton>
          <h1 className="text-pink1000 text-2xl font-semibold ml-5">FÓRUNS</h1>
        </div>

        {/* Busca sticky logo abaixo */}
        <div className="sticky top-20 z-40 bg-pink3000 p-2 border-b border-pink3000 ">
          <BuscaPorNome
            valor=""
            aoAlterar={() => {}}
            placeholder="Buscar Fórum"
          />
        </div>

        {/* Botões*/}
        <div className="sticky top-40 bg-pink3000 z-40 mb-10">
          <div className="flex border-b border-pink3000 cursor-pointer justify-center items-center">
            {["Fóruns", "Meus Fóruns"].map((label, index) => (
              <Button
                key={index}
                
                className={`px-4 py-2 text-sm  font-medium  cursor-pointer focus:outline-none ${
                  tabAtiva === index
                    ? "border-b-2 border-pink2000 text-pink2000 font-semibold cursor-pointer items-center justify-center"
                    : "text-pink4000 hover:text-pink4000 cursor-pointer items-center justify-center"
                }`}
                onClick={() => scrollToTab(index)}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>

        {/* Container com conteúdo rolável */}
        <div className="flex-1 overflow-y-auto w-full px-4">
          <div className="flex space-x-4">
            {tabAtiva === 0 && (
              <div className="flex-1 space-y-4">
                {foruns
                  .filter((forum) => forum.criador.nome !== userName) // todos menos os seus
                  .map((forum) => (
                    <Button
                      key={forum.id}
                      onClick={() => setSelectedForum(forum)}
                      className="relative group rounded-br-none flex justify-between cursor-pointer rounded-2xl border border-pink1000 items-start px-6 pt-4 pb-10 bg-pink1000 text-pink2000 font-semibold w-full"
                    >
                      <span className="text-left">
                        <strong>{forum.nome}</strong> <br />
                        <div className="absolute bottom-[-4] left-0 scale-55 text-pink4000">
                          {forum.publicacao}
                        </div>
                      </span>

                      <div className="absolute bottom-0 right-1 scale-70">
                        <span>{forum.total_curtidas}</span>
                        {selectedForum?.id && <BotaoGostei forumId={selectedForum.id} />}
                      </div>
                    </Button>
                  ))}
              </div>
            )}

            {tabAtiva === 1 && (
              <div className="flex-1 space-y-4">
                {foruns
                  .filter((forum) => forum.criador.nome === userName) // só seus fóruns
                  .map((forum) => (
                    <Button
                      key={forum.id}
                      onClick={() => setSelectedForum(forum)}
                      className="relative group rounded-br-none flex justify-between shadow transition-colors duration-300 hover:border-pink2000 rounded-2xl border cursor-pointer border-pink1000 items-start px-6 pt-4 pb-10 bg-pink1000 text-pink2000 font-semibold w-full"
                    >
                      <span className="text-left">
                        <strong>{forum.nome}</strong> <br />
                        <div className="absolute bottom-[-4] left-0 scale-55 text-pink4000">
                          {forum.publicacao}
                        </div>
                      </span>
                      <IconButton
                        className="absolute top-2 right-2 p-1.5 bg-pink1000 text-red rounded-md cursor-pointer transition-colors duration-300 hover:text-pink4000"
                        onClick={() => {
                          // ação ao clicar no X
                        }}
                      >
                        <CircleX size={15} />
                      </IconButton>
                      <div className="absolute bottom-0 right-1 scale-70">
                        <span>{forum.total_curtidas}</span>
                        {selectedForum?.id && <BotaoGostei forumId={selectedForum.id} />}
                      </div>
                    </Button>
                  ))}
              </div>
            )}
          </div>
        </div>
 {/* Rodapé com campos de título e descrição para criar fórum */}
        <div className="flex items-center p-4 border-t border-pink2000 rounded-tr-2xl bg-pink2000 gap-2">
          <InputRoot className="flex-20 bg-pink3000 h-10 border border-pink2000 rounded-xl px-4 flex items-center gap-2 focus-within:border-pink4000">
            <InputField
              placeholder="Nome do fórum"
              value={novoTitulo}
              onChange={(e) => setNovoTitulo(e.target.value)}
            />
          </InputRoot>

          <Button
            onClick={criarForum}
            className="ml-2 bg-pink4000 text-pink1000 p-2 rounded-2xl hover:bg-pink1000 transition-colors duration-300 hover:text-pink4000"
          >
            <Send className="w-5 h-5 cursor-pointer" />
          </Button>
        </div>
      </div>

      {/* Drag da sidebar */}
      <div
        className="fixed top-0 z-50 h-screen cursor-ew-resize bg-transparent"
        style={{ left: sidebarWidth - 4, width: 8 }}
        onMouseDown={startResizing}
        role="button"
        tabIndex={0}
        aria-label="Resize Sidebar"
      />

      {/* Conteúdo principal */}
<div
  className="flex-1 overflow-hidden space-y-0"
  style={{
    marginLeft: sidebarWidth,
    backgroundImage: "url('/CC2.png')",
    backgroundSize: 'cover',
    backgroundAttachment: 'fixed',
    backgroundPosition: 'center'
  }}
>
  {selectedForum ? (
    <>
      {/* Faixa fixa no topo */}
<div
  className="fixed top-0 z-50 bg-pink3000 h-14 flex items-center px-6 border border-pink2000 rounded-b-sm"
  style={{
    // desloca a barra para não cobrir o sidebar
    left: sidebarWidth,
    width: `calc(100% - ${sidebarWidth}px)`,
  }}
>
  <h1 className="text-pink2000 text-2xl font-semibold ">
    {selectedForum?.nome}
  </h1>

</div>

      {/* Área do chat rolável */}
   <div
  className="chat-container overflow-y-auto p-4 pt-20" // <-- 64 px = altura da barra
  style={{ height: '100vh' }}
>
        {mensagensDoForum.length === 0 && (
          <p className="text-center text-pink4000 mt-4">Nenhuma mensagem encontrada.</p>
        )}

        {mensagensDoForum
          .slice()
          .sort((a, b) => new Date(a.data_envio).getTime() - new Date(b.data_envio).getTime())
          .map((msg) => {
            const isUser = msg.autor.nome === userName;
            return (
              <div
                key={msg.id}
                className={`flex ${isUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm mb-2 ${
                    isUser
                      ? "bg-pink2000 text-pink1000 rounded-br-none"
                      : "bg-pink3000 text-pink2000 rounded-bl-none"
                  }`}
                >
                  <p className="break-words">{msg.mensagem}</p>
                  <span className="text-[10px] block text-right mt-1 text-pink4000">
                    {new Date(msg.data_envio).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            );
          })}
        <div ref={bottomRef} />
      </div>

      {/* Input de mensagem */}
      <div className="p-4 border-t border-pink2000 max-w-xl mx-auto">
         <ChatInput forumId={selectedForum?.id} onNovaMensagem={msg => setMensagens(prev => [...prev, msg])} />
      </div>
    </>
  ) : (
    <p className="text-center text-pink4000 mt-10">Selecione um fórum para começar a conversar.</p>
  )}
</div>
 
    </>
  );
}
