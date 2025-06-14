"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import SidebarMenu from "@/components/sidebar-menu";
import { BotaoGostei } from "@/components/gostei";
import { Button } from "@/components/button";
import { Forum } from "next/font/google";
import { ExternalLink } from "lucide-react";

export default function Menu() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  const [userType, setUserType] = useState<
    "profissional" | "estagiario" | "outro"
  >("outro");
  const [userName, setUserName] = useState<string>("");

  const [topForuns, setTopForuns] = useState<any[]>([]);
  const [proximoAgendamento, setProximoAgendamento] = useState<any>(null);
  const [linksEImagens, setLinksEImagens] = useState<any[]>([]);

  useEffect(() => {
    setIsClient(true);
    if (typeof window === "undefined") return;
    const storedUserType = localStorage.getItem("user_type") as
      | "profissional"
      | "estagiario"
      | "outro"
      | null;
    const storedUserName = localStorage.getItem("user_name") || "";

    if (storedUserType) setUserType(storedUserType);
    setUserName(storedUserName);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("token");

    fetch("http://localhost:8000/api/menu/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Não autorizado");
        }
        return res.json();
      })
      .then((json) => {
        setTopForuns(json.top_foruns);
        setProximoAgendamento(json.proximo_agendamento);
        setLinksEImagens(json.links_e_imagens);
      })
      .catch(() => {
        alert("Sessão expirada ou inválida. Faça login novamente.");
        localStorage.removeItem("token");
        router.push("/");
      });
  }, [router]);

  // Cria um array com o tamanho máximo dos arrays
const maxLength = Math.max(topForuns.length, linksEImagens.length);
const topForunsLimitados = topForuns.slice(0, 3);

const itensIntercalados = [];

for (let i = 0; i < maxLength; i++) {
  if (i < linksEImagens.length)
    itensIntercalados.push({ tipo: "link", item: linksEImagens[i] });
  if (i < topForunsLimitados.length)
    itensIntercalados.push({ tipo: "forum", item: topForunsLimitados[i] });
  
}

// Se quiser colocar o agendamento uma vez, pode colocar no começo ou no final
if (proximoAgendamento) {
  itensIntercalados.unshift({ tipo: "agendamento", item: proximoAgendamento });
}



  if (!isClient) return null;
return (
    <div>
      <SidebarMenu userType={userType} activeItem="Menu" />

      <main className="ml-[360px] p-6">
        <section className="mb-10">
          <div className="grid grid-cols-2 gap-6 p-4">
            {itensIntercalados.length === 0 ? (
              <p className="text-pink2000">Nenhum item encontrado.</p>
            ) : (
              itensIntercalados.map(({ tipo, item }, i) => {
                if (tipo === "forum") {
                  return (
                    <div
                      key={"forum-" + item.id}
                      className="bg-pink1000 rounded-xl p-6"
                    >
                      <Button
                        onClick={() => router.push(`/forum?id=${item.id}`)}
                        className="relative group flex flex-col justify-between shadow-md h-50 cursor-pointer rounded-2xl rounded-br-none border border-pink1000 px-5 pt-5 pb-14 bg-pink1000 text-pink2000 font-semibold w-full transition-colors duration-300 hover:bg-pink1000 hover:text-pink4000 hover:border-pink4000"
                      >
                        <div className="text-left text-sm mb-4">
                          <p>{item.nome || "Título do fórum"}</p>
                          <p className="text-xs mt-1 text-pink3000">
                            {item.publicacao || "Sem descrição"}
                          </p>
                        </div>

                        <div className="absolute bottom-3 left-5 right-5 flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div className="text-pink2000 pointer-events-none scale-90">
                              <BotaoGostei
                                forumId={item.id}
                                inicialmenteQuantidade={item.total_curtidas || 0}
                                onCurtirChange={(novoGostei, novaQuantidade) => {
                                  setTopForuns((prev) =>
                                    prev.map((f) =>
                                      f.id === item.id
                                        ? { ...f, total_curtidas: novaQuantidade }
                                        : f
                                    )
                                  );
                                }}
                              />
                            </div>
                          </div>

                          <a className="text-[12px] text-pink2000 underline">
                            Acesse o fórum
                          </a>
                        </div>
                      </Button>
                    </div>
                  );
                }

                if (tipo === "link") {
  return (
    <a
      key={`link-${i}`}
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block w-full"
    >
<Button
  className="relative group flex flex-col items-center justify-center shadow-md h-65 cursor-pointer rounded-2xl rounded-br-none border border-pink1000 px-5 py-4 bg-pink1000 text-pink2000 font-semibold w-full hover:text-pink4000 hover:border-pink4000 transition-all duration-300"
>
  {item.imagem && (
    <img
      src={item.imagem}
      alt={item.titulo}
      className="max-h-40 object-contain mb-3"
    />
  )}

  <div className="flex items-center gap-2 justify-center">
    <p className="m-0">{item.titulo || "Sem título"}</p>
    <ExternalLink className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
  </div>
</Button>

    </a>
  );
}
                if (tipo === "agendamento") {
                  return (
                    <div
                      key={"agendamento"}
                      className="bg-pink1000 rounded-xl p-6"
                    >
<Button onClick={() => router.push("/historico")} 
className="relative group flex flex-col justify-between shadow-md  cursor-pointer rounded-2xl rounded-br-none border border-pink1000 px-5 pt-5 pb-14 bg-pink1000 text-pink2000 font-semibold w-full transition-colors duration-300 hover:bg-pink1000 hover:text-pink4000 hover:border-pink4000">
  <h1 className="text-lg mb-2">Próximo Agendamento</h1>

  {/* Faixa horizontal */}
  <div className="w-full h-[2px] bg-pink2000 mb-4 rounded" />

  {item ? (
    <div className="text-left text-sm">
      <p>Dia: {item.dia}</p>
      <p>Horário: {item.horario}</p>
      <p>Atendente: {item.atendente_nome}</p>
      <p>Serviço: {item.servico}</p>
      <p>Local: {item.local}</p>
      <p>Sala: {item.sala}</p>
      <p>Status: {item.status}</p>
    </div>
  ) : (
    <p className="text-pink2000">
      Você não possui agendamentos futuros.
    </p>
  )}
</Button>
                    </div>
                  );
                }

                return null;
              })
            )}
          </div>
        </section>
      </main>
    </div>
  );
}