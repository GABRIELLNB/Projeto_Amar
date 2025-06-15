"use client";

import { BuscaPorNome } from "@/components/busca";
import { Button } from "@/components/button";
import { ChatInput } from "@/components/chat-input";
import { BotaoGostei } from "@/components/gostei";
import { IconButton } from "@/components/icon-button";
import { InputField, InputRoot } from "@/components/input";
import { ArrowLeft, CircleX, Send, User } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter, useSearchParams } from "next/navigation";
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
  curtiu: boolean;
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
  data_envio: string;
};

export default function Forum() {
  const params = useParams();
  const forumIdParam = params.forumId ? Number(params.forumId) : null;

  const searchParams = useSearchParams();
  const forumIdQuery = searchParams.get("id")
    ? Number(searchParams.get("id"))
    : null;

  // Use apenas uma dessas para controlar o fórum selecionado, ou combine a lógica conforme seu app
  const forumId = forumIdParam ?? forumIdQuery;

  const router = useRouter();
  const [mensagemStatus, setMensagemStatus] = useState<string | null>(null);
  const [tipoMensagem, setTipoMensagem] = useState<"erro" | "sucesso" | null>(null);

  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [sidebarWidth, setSidebarWidth] = useState(350);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const isResizing = useRef(false);
  const minWidth = 300;
  const maxWidth = 400;

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

  useEffect(() => {
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [resize, stopResizing]);

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

  const [selectedForum, setSelectedForum] = useState<ForumsDisponiveis | null>(
    null
  );
  const [foruns, setForuns] = useState<ForumsDisponiveis[]>([]);
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [novoTitulo, setNovoTitulo] = useState("");
  const [novaDescricao, setNovaDescricao] = useState("");
  const [curtidasState, setCurtidasState] = useState<{
    [forumId: number]: { gostei: boolean; quantidade: number };
  }>({});
  const [excluirModal, setExcluirModal] = useState(false);
  const [forumParaExcluir, setForumParaExcluir] =
    useState<ForumsDisponiveis | null>(null);
  const [buscaForuns, setBuscaForuns] = useState("");
  const [userName, setUserName] = useState("");
  const [isClient, setIsClient] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsClient(true);
    const storedName = localStorage.getItem("user_name");
    if (storedName) setUserName(storedName);
  }, []);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (!token) return;

    fetch("http://localhost:8000/api/forum/", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) =>
        res.ok ? res.json() : Promise.reject(`Erro ${res.status}`)
      )
      .then((data: ForumsDisponiveis[]) => setForuns(data))
      .catch((err) => console.error("Erro ao buscar fóruns:", err));
  }, [token]);

  useEffect(() => {
    if (!selectedForum || !token) {
      setMensagens([]);
      return;
    }

    fetch(
      `http://localhost:8000/api/mensagem-forum/forum/${selectedForum.id}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )
      .then((res) =>
        res.ok ? res.json() : Promise.reject(`Erro ${res.status}`)
      )
      .then((data) => setMensagens(Array.isArray(data) ? data : [data]))
      .catch((err) => console.error("Erro ao buscar mensagens:", err));
  }, [selectedForum, token]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens]);

  useEffect(() => {
    if (foruns.length > 0) {
      const estadoInicial: {
        [forumId: number]: { gostei: boolean; quantidade: number };
      } = {};
      for (const forum of foruns) {
        estadoInicial[forum.id] = {
          gostei: forum.curtiu,
          quantidade: forum.total_curtidas,
        };
      }
      console.log("Estado inicial das curtidas:", estadoInicial); // 👈
      setCurtidasState(estadoInicial);
    }
  }, [foruns]);

  useEffect(() => {
    if (!forumId || foruns.length === 0) {
      setSelectedForum(null);
      return;
    }

    const idNum = Number(forumId);
    const forumSelecionado = foruns.find((f) => f.id === idNum) ?? null;
    setSelectedForum(forumSelecionado);
  }, [forumId, foruns]);

  const formatarDataSimples = (date: Date) => {
    const dia = String(date.getDate()).padStart(2, "0");
    const mes = String(date.getMonth() + 1).padStart(2, "0");
    const ano = date.getFullYear();
    return `${dia}-${mes}-${ano}`;
  };

  const [enviando, setEnviando] = useState(false);

  const criarForum = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (enviando) return; // bloqueia se já estiver enviando

    setEnviando(true);
    setNovoTitulo(""); // Limpa o input na hora do clique
    try {
      const dataCriacao = formatarDataSimples(new Date());
      const responseCriacao = await fetch("http://localhost:8000/api/forum/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nome: novoTitulo,
          publicacao: dataCriacao,
        }),
      });

      if (responseCriacao.ok) {
        const novoForum = await responseCriacao.json();
        console.log("Fórum criado com sucesso:", novoForum);

        const responseLista = await fetch("http://localhost:8000/api/forum/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const listaAtualizada = await responseLista.json();
        setForuns(listaAtualizada);
        setNovoTitulo("");
      } else {
        const erro = await responseCriacao.json();
        console.error("Erro ao criar fórum:", erro);
      }
    } catch (error) {
      console.error("Erro ao conectar com o servidor:", error);
    } finally {
      setEnviando(false);
    }
  };

  const excluirForum = async (forumId: number) => {
    try {
      const res = await fetch(`http://localhost:8000/api/forum/${forumId}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 204) {
        setForuns((prev) => prev.filter((f) => f.id !== forumId));
        setExcluirModal(false);
        setForumParaExcluir(null);
        if (selectedForum?.id === forumId) setSelectedForum(null);
      } else {
        alert("Erro ao excluir fórum");
      }
    } catch (err) {
      console.error("Erro ao excluir fórum", err);
    }
  };

  const filtrarForuns = (foruns: ForumsDisponiveis[], termoBusca: string) => {
    if (!termoBusca) return foruns;
    const lowerTerm = termoBusca.toLowerCase();
    return foruns.filter(
      ({ nome, criador }) =>
        (nome?.toLowerCase() || "").includes(lowerTerm) ||
        (criador?.nome?.toLowerCase() || "").includes(lowerTerm)
    );
  };
  const mensagensDoForum = mensagens.filter(
    (m) => m.forum === selectedForum?.id
  );
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
          <h1 className="text-pink1000 justify-between text-2xl font-semibold ml-5">
            FÓRUNS
          </h1>
        </div>

        {/* Busca sticky logo abaixo */}
        <div className="sticky top-20 z-40 bg-pink3000 p-2 border-b border-pink3000 ">
          <BuscaPorNome
            valor={buscaForuns}
            aoAlterar={setBuscaForuns}
            placeholder="Buscar do fórum "
            className="max-w-xs"
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
                {filtrarForuns(
                  foruns.filter((forum) => forum.criador.nome !== userName),
                  buscaForuns
                ).map((forum) => (
                  <Button
                    key={forum.id}
                    onClick={() => setSelectedForum(forum)}
                    className="relative group rounded-br-none flex justify-between cursor-pointer rounded-2xl border border-pink1000 items-start px-6 pt-4 pb-8 bg-pink1000 text-pink2000 font-semibold w-full"
                  >
                    <span className="text-left">
                      <div className="flex items-center gap-2 mb-2">
                        {/* Foto de perfil ou ícone padrão */}
                        {forum.criador.foto_perfil ? (
                          <Image
                            src={forum.criador.foto_perfil}
                            alt={`Foto de ${forum.criador.nome}`}
                            width={42}
                            height={42}
                            className="rounded-full object-cover w-10 h-10"
                          />
                        ) : (
                          <User className="w-10 h-10 text-pink4000 border rounded-full border-pink3000" />
                        )}

                        {/* Nome ao lado da foto */}
                        <div className="text-pink4000 font-semibold">
                          {forum.criador.nome}
                        </div>
                      </div>
                      <strong className="block mt-2">{forum.nome}</strong>{" "}
                      <br />
                      <div className="absolute bottom-[-4] left-0 scale-55 mb-1 text-pink4000">
                        {forum.publicacao}
                      </div>
                    </span>

                    <div className="absolute bottom-0 right-1 scale-70">
                      <BotaoGostei
                        key={forum.id} // 👈 importante!
                        forumId={forum.id}
                        inicialmenteGostei={
                          curtidasState[forum.id]?.gostei ?? false
                        }
                        inicialmenteQuantidade={
                          curtidasState[forum.id]?.quantidade ?? 0
                        }
                        onCurtirChange={(novoGostei, novaQuantidade) => {
                          setCurtidasState((prev) => ({
                            ...prev,
                            [forum.id]: {
                              gostei: novoGostei,
                              quantidade: novaQuantidade,
                            },
                          }));
                        }}
                      />
                    </div>
                  </Button>
                ))}
              </div>
            )}

            {tabAtiva === 1 && (
              <div className="flex-1 space-y-4">
                {filtrarForuns(
                  foruns.filter((forum) => forum.criador.nome === userName),
                  buscaForuns
                ).map((forum) => (
                  <Button
                    key={forum.id}
                    onClick={() => setSelectedForum(forum)}
                    className="relative group rounded-br-none flex justify-between shadow transition-colors duration-300 hover:border-pink2000 rounded-2xl border cursor-pointer border-pink1000 items-start px-6 pt-4 pb-8 bg-pink1000 text-pink2000 font-semibold w-full"
                  >
                    <span className="text-left">
                      <div className="flex items-center gap-2 mb-2">
                        {/* Foto de perfil ou ícone padrão */}
                        {forum.criador.foto_perfil ? (
                          <Image
                            src={forum.criador.foto_perfil}
                            alt={`Foto de ${forum.criador.nome}`}
                            width={42}
                            height={42}
                            className="rounded-full object-cover w-10 h-10"
                          />
                        ) : (
                          <User className="w-10 h-10 text-pink4000 border rounded-full border-pink3000" />
                        )}

                        {/* Nome ao lado da foto */}
                        <div className="text-pink4000 font-semibold">
                          {forum.criador.nome}
                        </div>
                      </div>
                      <strong className="block mt-2">{forum.nome}</strong>{" "}
                      <br />
                      <div className="absolute bottom-[-4] left-0 scale-55 mb-1 text-pink4000">
                        {forum.publicacao}
                      </div>
                    </span>
                    <IconButton
                      className="absolute top-2 right-2 p-1.5 bg-pink1000 text-red rounded-md cursor-pointer transition-colors duration-300 hover:text-pink4000"
                      onClick={(e) => {
                        e.stopPropagation(); // evita selecionar o fórum
                        setForumParaExcluir(forum); // guarda qual vai excluir
                        setExcluirModal(true); // abre modal
                      }}
                    >
                      <CircleX size={15} />
                    </IconButton>
                    <div className="absolute bottom-0 right-1 scale-70">
                      <BotaoGostei
                        key={forum.id} // 👈 importante!
                        forumId={forum.id}
                        inicialmenteGostei={
                          curtidasState[forum.id]?.gostei ?? false
                        }
                        inicialmenteQuantidade={
                          curtidasState[forum.id]?.quantidade ?? 0
                        }
                        onCurtirChange={(novoGostei, novaQuantidade) => {
                          setCurtidasState((prev) => ({
                            ...prev,
                            [forum.id]: {
                              gostei: novoGostei,
                              quantidade: novaQuantidade,
                            },
                          }));
                        }}
                      />
                    </div>
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>
        {/* Rodapé com campos de título e descrição para criar fórum */}

        <div className="flex items-center p-3 border-t border-pink2000 rounded-tr-2xl bg-pink2000 gap-2">
          <InputRoot className="flex-20 bg-pink3000 h-10 border border-pink2000 rounded-xl px-4 flex items-center gap-2 focus-within:border-pink4000">
            <InputField
              placeholder="Crie um fórum"
              value={novoTitulo}
              onChange={(e) => setNovoTitulo(e.target.value)}
            />
          </InputRoot>

          <Button
            type="submit"
            onClick={criarForum}
            disabled={enviando}
            className={`ml-2 p-2 rounded-2xl transition-colors duration-300
    ${
      enviando
        ? "bg-pink2000 text-pink500 cursor-not-allowed"
        : "bg-pink4000 text-pink1000 hover:bg-pink1000 hover:text-pink4000"
    }`}
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
          backgroundSize: "cover",
          backgroundAttachment: "fixed",
          backgroundPosition: "center",
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
              style={{ height: "100vh" }}
            >
              {mensagensDoForum.length === 0 && (
                <p className="text-center text-pink4000 mt-4">
                  Nenhuma mensagem encontrada.
                </p>
              )}

              {mensagensDoForum
                .slice()
                .sort(
                  (a, b) =>
                    new Date(a.data_envio).getTime() -
                    new Date(b.data_envio).getTime()
                )
                .map((msg) => {
                  const isUser = msg.autor.nome === userName;
                  return (
                    <div
                      key={msg.id}
                      className={`flex items-end ${
                        isUser ? "justify-end" : "justify-start"
                      } gap-2`}
                    >
                      {/* Foto do autor ou ícone User só se não for você */}
                      {!isUser &&
                        (msg.autor.foto_perfil ? (
                          <img
                            src={msg.autor.foto_perfil}
                            alt={`Foto de ${msg.autor.nome}`}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <User className="w-12 h-12 text-pink4000 border rounded-full border-pink3000" />
                        ))}

                      <div
                        className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm mb-2 ${
                          isUser
                            ? "bg-pink2000 text-pink1000 rounded-br-none"
                            : "bg-pink3000 text-pink2000 rounded-bl-none"
                        }`}
                      >
                        {!isUser && (
                          <strong className="break-words text-[12px] text-pink2000 mb-1">
                            {msg.autor.nome}
                          </strong>
                        )}
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
            <div className="p-4 border-t border-pink2000 max-w-xl mx-auto mb-3">
              <ChatInput
                forumId={selectedForum?.id ?? 0}
                inicialmenteGostei={
                  selectedForum
                    ? curtidasState[selectedForum.id]?.gostei ?? false
                    : false
                }
                inicialmenteQuantidade={
                  selectedForum
                    ? curtidasState[selectedForum.id]?.quantidade ?? 0
                    : 0
                }
                onCurtirChange={(novoGostei, novaQuantidade) => {
                  if (selectedForum) {
                    setCurtidasState((prev) => ({
                      ...prev,
                      [selectedForum.id]: {
                        gostei: novoGostei,
                        quantidade: novaQuantidade,
                      },
                    }));
                  }
                }}
                onNovaMensagem={(msg) => {
                  setMensagens((prev) => [...prev, msg]);
                }}
              />
            </div>
          </>
        ) : (
          <p className="text-center text-pink4000 mt-10">
            Selecione um fórum para começar a conversar.
          </p>
        )}
      </div>
      {excluirModal && forumParaExcluir && (
        <>
          {/* backdrop */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => setExcluirModal(false)} // clicar aqui fecha
            onKeyDown={(e) =>
              (e.key === "Enter" || e.key === " ") && setExcluirModal(false)
            }
            className="fixed inset-0 z-40 backdrop-blur-sm"
          />

          {/* modal centralizado com flex */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="relative bg-pink1000 rounded-2xl shadow-lg p-6 h-auto max-h-[80vh] max-w-[90vw] border border-pink4000"
              onClick={(e) => e.stopPropagation()} // IMPORTANTE: previne o fechamento ao clicar dentro
            >
              {/* botão voltar - dentro da modal */}
              <div className="absolute top-4 left-4">
                <IconButton
                  onClick={() => setExcluirModal(false)}
                  className="p-1.5 bg-pink1000 text-pink4000 rounded-md cursor-pointer transition-colors duration-300 hover:text-pink2000"
                >
                  <ArrowLeft />
                </IconButton>
              </div>

              {/* faixa superior dentro da modal */}
              <div className="bg-pink2000 w-full h-4 absolute top-0 left-0 rounded-t-2xl border border-pink2000" />

              {/* título */}
              <h2 className="text-xl font-bold mb-5 text-pink4000 text-center">
                Excluir Fórum
              </h2>

              {/* mensagem */}
              <p className="text-pink4000 text-sm mb-8 text-center break-words max-w-full">
                Tem certeza que deseja excluir&nbsp;
                <strong>{forumParaExcluir.nome}</strong>?
              </p>

              {/* botão confirmar */}
              <Button
                onClick={() => excluirForum(forumParaExcluir.id)}
                className="bg-red text-pink1000 border border-red px-4 py-2 rounded-xl w-full transition-colors duration-300 hover:bg-pink3000 hover:text-red cursor-pointer"
              >
                Excluir fórum
              </Button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
