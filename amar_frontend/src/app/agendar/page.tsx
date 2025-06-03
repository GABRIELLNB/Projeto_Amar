"use client";

import { BuscaPorNome } from "@/components/busca";
import { Button, ButtonField, ButtonIcon } from "@/components/button";
import { IconButton } from "@/components/icon-button";
import { Calendar } from "@/components/ui/calendar";
import { ptBR } from "date-fns/locale/pt-BR";
import { ArrowLeft, CalendarCheck2, History } from "lucide-react";
import React, { useState, useRef, useEffect, useCallback } from "react";

import { format } from "date-fns";
import { useRouter } from "next/navigation";

type HorarioDisponivel = {
  id: number;
  dia: string;
  horario: string;
  object_id: number;
  atendente_nome: string;
  servico: string;
  sala: string;
  local: string;
  tipo_atendente: string;
  // outros campos que a API enviar, se houver
};

export default function Agendar() {
  const router = useRouter();
  const [agendados, setAgendados] = useState<number[]>([]);

  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [horariosDisponiveis, setHorariosDisponiveis] = useState<
    HorarioDisponivel[]
  >([]);

  const marcarHorario = async (horarioId: number) => {
    console.log("horarioId recebido:", horarioId);
    const token = localStorage.getItem("token");

    const horarioSelecionado = horariosDisponiveis.find(
      (item) => item.id === horarioId
    );

    if (!horarioSelecionado || !selectedDate) {
      alert("Data ou horário inválido.");
      return;
    }

    const tipoAtendente = horarioSelecionado.tipo_atendente.toLowerCase();
    console.log("tipoAtendente recebido:", tipoAtendente);

    const contentTypeMap: Record<string, number> = {
      profissional: 10,
      estagiario: 9,
    };

    const contentType = contentTypeMap[tipoAtendente];

    if (!contentType) {
      alert("Tipo de atendente desconhecido.");
      return;
    }

    console.log("Usuário ID:", localStorage.getItem("usuario_id"));
    const usuarioId = localStorage.getItem("usuario_id");
    if (!usuarioId) {
      alert("Usuário não autenticado");
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/api/agendamentos/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content_type: contentType,
          object_id: horarioSelecionado.object_id,
          dia: format(selectedDate, "yyyy-MM-dd"),
          horario: horarioSelecionado.horario,
          local: horarioSelecionado.local,
          sala: horarioSelecionado.sala,
          usuario: Number.parseInt(usuarioId),
        }),
      });

      if (!res.ok) {
      const errorData = await res.json();
      const mensagemErro =
        errorData?.detail ||
        errorData?.non_field_errors?.join(", ") ||
        JSON.stringify(errorData) ||
        `Erro ao agendar: ${res.status}`;

      throw new Error(mensagemErro);
    }

    // Aqui você pode marcar o horário como "agendado" — você precisa de um estado para isso
    setAgendados((prev) => [...prev, horarioId]);

    // Espera 3 segundos para o usuário ver o "Marcado"
    setTimeout(async () => {
      // Remove o horário agendado da lista disponível
      setHorariosDisponiveis((prev) =>
        prev.filter((item) => item.id !== horarioId)
      );
      // Remove o horário do marcado (se quiser)
      setAgendados((prev) => prev.filter((id) => id !== horarioId));
      

      // Atualiza horários disponíveis
      const dataFormatada = format(selectedDate, "yyyy-MM-dd");
      const horariosRes = await fetch(
        `http://localhost:8000/api/disponibilidades-por-data/${dataFormatada}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!horariosRes.ok) throw new Error(`Erro ${horariosRes.status}`);
      const dados = await horariosRes.json();
      setHorariosDisponiveis(dados);
       }, 3000);
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Erro ao marcar o horário.");
    }
  };

  useEffect(() => {
    if (!selectedDate) return;
    const token = localStorage.getItem("token");

    const dataFormatada = format(selectedDate, "yyyy-MM-dd");

    fetch(
      `http://localhost:8000/api/disponibilidades-por-data/${dataFormatada}/`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
      .then((res) => {
        if (!res.ok) throw new Error(`Erro ${res.status}`);
        return res.json();
      })
      .then((data: HorarioDisponivel[]) => setHorariosDisponiveis(data))
      .catch((err) =>
        console.error("Erro ao buscar horários disponíveis:", err)
      );
  }, [selectedDate]);

  const sidebarRef = useRef<HTMLDivElement>(null);
  const isResizing = useRef(false);
  const minWidth = 300;
  const maxWidth = 450;
  const [sidebarWidth, setSidebarWidth] = useState(350);

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

  return (
    <>
      {/* Sidebar com Calendário */}
      <div
        ref={sidebarRef}
        className="fixed top-0 left-0 h-screen bg-pink3000 border-r border-pink5000 z-50 flex flex-col items-center justify-center p-4 overflow-y-auto"
        style={{ width: sidebarWidth }}
      >
        <div className="bg-pink2000 w-full h-20 fixed top-0 left-0 flex items-center px-4 z-50">
          <div className="flex items-center gap-2">
            <IconButton
              onClick={() => router.push("/menu")}
              className="bg-pink2000 text-pink1000 p-2 rounded-md hover:text-pink4000 hover:bg-pink2000 cursor-pointer"
            >
              <ArrowLeft />
            </IconButton>
            <h1 className="text-pink1000 text-2xl font-semibold">
              AGENDAMENTO DE CONSULTAS
            </h1>
          </div>
        </div>

        <h2 className="text-3xl font-bold text-pink4000 mb-4 mt-20">
          Selecione uma data
        </h2>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          locale={ptBR}
          className="rdp mx-auto w-full max-w-[280px]"
        />

        {selectedDate && (
          <p className="mt-4 text-pink4000">
            Data selecionada:{" "}
            <strong>{format(selectedDate, "dd/MM/yyyy")}</strong>
          </p>
        )}
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
      <div className="ml-[360px] p-6 relative">
        <div className="bg-pink2000 w-full h-20 fixed top-0 left-[360px] right-0 z-40" />
        <div className="gap-6 mt-28 px-6">
          <div className="flex items-center justify-between gap-2 mb-25 ml-5 flex-wrap">
            <h1 className="flex items-center gap-2 text-3xl font-semibold text-pink4000 whitespace-nowrap">
              <CalendarCheck2 className="w-8 h-8" />
              Agendamentos:
            </h1>

            {/* Filtro por hora */}
            <div className="flex items-center gap-2 text-pink4000 ml-30">
              <label htmlFor="filtroHora" className="text-sm text-pink4000">
                Filtrar por hora:
              </label>
              <select
                id="filtroHora"
                className="border border-pink2000 rounded-sm py-1 text-sm w-40"
              >
                <option value="">Todas</option>
              </select>
            </div>

            {/* Filtro por dia do mês */}
            <div className="flex items-center gap-2 text-pink4000">
              <label htmlFor="filtroDia" className="text-sm text-pink4000">
                Filtrar por dia do mês:
              </label>
              <select
                id="filtroDia"
                className="border border-pink2000 rounded-sm px-3 py-1 text-sm w-40"
              >
                <option value="">Todos</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between flex-wrap gap-4 mb-[-16]">
            <div className="flex justify-center">
              <Button className="flex justify-between rounded-sm items-center bg-pink3000 px-5 h-10 text-pink2000 font-semibold w-full cursor-pointer transition-colors duration-300 hover:bg-pink2000 hover:text-pink1000">
                <ButtonIcon className="text-pink4000 w-7 ">
                  <History />
                </ButtonIcon>
                <ButtonField
                  onClick={() => router.push("/historico")}
                  className="flex-1 text-pink4000 hover:text-pink1000 transition-colors duration-300"
                >
                  Histórico de Agendamento
                </ButtonField>
              </Button>
            </div>

            <div>
              {/* define largura para o BuscaPorNome */}
              <BuscaPorNome valor="" aoAlterar={() => {}} />
            </div>
          </div>

          <div className="bg-pink1000 rounded-xl shadow-md p-6 w-full max-w-full overflow-auto max-h-screen mt-10">
            <h2 className="text-xl font-semibold text-pink2000 mb-4">
              Horários:
            </h2>

            {/* Tabela atualizada com placeholders */}
            <table className="w-full text-sm text-center border border-pink1000">
              <thead>
                <tr className="bg-pink2000 text-pink1000 border border-pink3000 text-center">
                  <th className="p-2">Hora</th>
                  <th className="p-2">Nome</th>
                  <th className="p-2">Serviço</th>
                  <th className="p-2">Local</th>
                  <th className="p-2">Sala</th>
                  <th className="p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {horariosDisponiveis.length > 0 ? (
                  horariosDisponiveis.map((item) => (
                    <tr key={item.id}>
                      <td className="p-2">{item.horario}</td>
                      <td className="p-2">{item.atendente_nome}</td>
                      <td className="p-2">{item.servico}</td>
                      <td className="p-2">{item.local}</td>
                      <td className="p-2">{item.sala}</td>
                      <td className="p-2">
                        {agendados.includes(item.id) ? (
                          <Button
                            disabled
                            className="bg-green-400 text-white px-3 py-1 rounded cursor-not-allowed opacity-70"
                          >
                            Marcado
                          </Button>
                        ) : (
                          <Button
                            onClick={() => marcarHorario(item.id)}
                            className="bg-pink2000 hover:bg-pink1000 hover:text-pink2000 text-pink1000 px-3 py-1 rounded cursor-pointer"
                          >
                            Marcar
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="p-2" colSpan={9}>
                      {selectedDate
                        ? "Nenhum horário disponível nesta data."
                        : "Selecione uma data."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
