"use client";

import { Button } from "@/components/button";
import { IconButton } from "@/components/icon-button";
import SidebarMenu from "@/components/sidebar-menu";
import { ArrowLeft, CircleX, FileClock } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

type Agendamento = {
  id: number;
  horario: string;
  object_id: number;
  atendente_nome: string;
  servico: string;
  sala: string;
  local: string;
  status: "realizado" | "confirmado" | "cancelado";
  dia: string;
};

export default function Histórico() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [isExit, setIsExit] = useState(false);
  const [consultaSelecionada, setConsultaSelecionada] =
    useState<Agendamento | null>(null);

  const [userType, setUserType] = useState<
    "profissional" | "estagiario" | "outro"
  >("outro");
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    const storedUserType = localStorage.getItem("user_type") as
      | "profissional"
      | "estagiario"
      | "outro"
      | null;
    const storedUserName = localStorage.getItem("user_name") || "";

    if (storedUserType) setUserType(storedUserType);
    setUserName(storedUserName);
  }, []);

  const statusColors: Record<string, string> = {
    confirmado: "bg-yellow-400 text-black",
    realizado: "bg-green-500 text-white",
    cancelado: "bg-red text-white",
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("Token:", token);

    if (token) {
      fetch("http://localhost:8000/api/agendamentos/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("API retornou:", data);
          const agendamentosFiltrados = data.filter((ag: Agendamento) =>
            ["confirmado", "realizado", "cancelado"].includes(
              ag.status.toLowerCase()
            )
          );
          setAgendamentos(agendamentosFiltrados);
        })
        .catch((error) => {
          console.error("Erro ao buscar agendamentos:", error);
        });
    }
  }, []);

  const cancelarAgendamento = async (id: number) => {
    const token = localStorage.getItem("token");

    if (!token) return;

    try {
      const response = await fetch(
        `http://localhost:8000/api/agendamentos/${id}/cancelar/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setAgendamentos((prev) =>
          prev.map((ag) => (ag.id === id ? { ...ag, status: "cancelado" } : ag))
        );
        setIsExit(false);
      } else {
        console.error("Erro ao cancelar:", await response.text());
      }
    } catch (err) {
      console.error("Erro ao cancelar consulta:", err);
    }
  };

  return (
    <>
      <SidebarMenu
        userType={userType}
        userName={userName}
        activeItem="Histórico"
      />

      <div className="ml-[360px] p-6 relative">
        <div className="gap-6 mt-15 px-6">
          <div className="flex items-center gap-2 mb-6 ml-5">
            <h1 className="flex items-center gap-2 text-3xl font-semibold text-pink4000 whitespace-nowrap">
              <FileClock className="w-8 h-8" />
              Histórico de Agendamentos:
            </h1>
          </div>
          <div className="overflow-y-auto max-h-[80vh] pr-2 srcrollbar-thin">
            <div className="flex flex-col space-y-4 ml-5 gap-0 justify-start">
              {agendamentos.map((consulta, i) => (
                <div
                  key={i}
                  className="bg-pink3000 rounded-xl shadow-md p-6 w-full max-w-full overflow-auto mt-10"
                >
                  <div className="flex items-center justify-between text-lg font-bold text-pink4000 mb-3">
                    <div className="flex-1">
                      <span>{consulta.horario}</span>
                    </div>

                    {consulta.status === "confirmado" && (
                      <IconButton
                        className="p-1.5 bg-pink3000 text-red rounded-md cursor-pointer transition-colors duration-300 hover:text-pink4000"
                        onClick={() => {
                          setConsultaSelecionada(consulta);
                          setIsExit(true);
                        }}
                      >
                        <CircleX size={25} />
                      </IconButton>
                    )}
                  </div>

                  <div className="bg-pink1000 rounded-xl shadow-md p-6 w-full max-w-full overflow-auto">
                    <table className="w-full text-sm text-center border border-pink1000">
                      <thead>
                        <tr className="bg-pink2000 text-pink1000 border border-pink3000 text-center">
                          <th className="px-2">Data</th>
                          <th className="p-2">Hora</th>
                          <th className="p-2">Nome</th>
                          <th className="p-2">Serviço</th>
                          <th className="p-2">Local</th>
                          <th className="p-2">Sala</th>
                          <th className="p-2">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr key={consulta.id}>
                          <td className="p-2">{consulta.dia}</td>
                          <td className="p-2">{consulta.horario}</td>
                          <td className="p-2">{consulta.atendente_nome}</td>
                          <td className="p-2">{consulta.servico}</td>
                          <td className="p-2">{consulta.local}</td>
                          <td className="p-2">{consulta.sala}</td>
                          <td className="px-2 py-2">
                            <span
                              className={`px-2 py-1 rounded ${
                                statusColors[consulta.status.toLowerCase()]
                              }`}
                            >
                              {consulta.status}
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {isExit && consultaSelecionada && (
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
          <div className="absolute top-1/2 left-[60%] transform -translate-x-1/2 -translate-y-1/2 z-50">
            <div className="bg-pink1000 rounded-2xl shadow-lg p-6 w-[90vw] max-w-sm h-[200px] border border-pink4000">
              <div className="absolute top-4 left-1">
                <IconButton
                  onClick={() => setIsExit(false)}
                  className="p-1.5 bg-pink1000 text-pink4000 rounded-md cursor-pointer transition-colors duration-300 hover:text-pink2000"
                >
                  <ArrowLeft />
                </IconButton>
              </div>
              <div className="bg-pink2000 w-full h-4 absolute top-0 left-0 rounded-t-2xl border border-pink4000" />
              <h2 className="text-xl font-bold mb-4 text-pink4000 text-center">
                Cancelar Consulta
              </h2>
              <div className="flex items-center justify-between mb-8">
                <span className="text-pink4000 text-sm">
                  Cancelar consulta de {consultaSelecionada.object_id} em{" "}
                  {consultaSelecionada.dia} às {consultaSelecionada.horario}?
                </span>
              </div>
              <Button
                onClick={() => cancelarAgendamento(consultaSelecionada.id)}
                className="bg-red text-pink1000 border border-red px-4 py-2 rounded-xl w-full transition-colors duration-300 hover:bg-pink3000 hover:text-red cursor-pointer"
              >
                Cancelar consulta
              </Button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
