"use client";

import { BuscaPorNome } from "@/components/busca";
import { Button, ButtonField, ButtonIcon } from "@/components/button";
import { IconButton } from "@/components/icon-button";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { ArrowLeft, CalendarCheck2, History } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState, useRef, useEffect, useCallback } from "react";

export default function Agendar() {
  const [selectedHora, setSelectedHora] = useState<string>("");
  const [disponibilidades, setDisponibilidades] = useState<any[]>([]);

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const sidebarRef = useRef<HTMLDivElement>(null);
  const isResizing = useRef(false);
  const minWidth = 300;
  const maxWidth = 450;
  const [sidebarWidth, setSidebarWidth] = useState(350);
  const router = useRouter()

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

  useEffect(() => {
  if (!selectedDate) return;

  const token = localStorage.getItem("token");
  if (!token) {
    console.warn("Usuário não autenticado. Nenhum token encontrado.");
    return;
  }

  const dataFormatada = format(selectedDate, "yyyy-MM-dd");
  console.log("Token:", token);
  console.log("Data Formatada:", dataFormatada);

  fetch(`http://127.0.0.1:8000/api/disponibilidades-por-data/${dataFormatada}/`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((res) => {
      if (!res.ok) throw new Error(`Erro HTTP: ${res.status}`);
      return res.json();
    })
    .then((data) => {
      if (data && Array.isArray(data.disponibilidades)) {
        setDisponibilidades(data.disponibilidades); // Supondo que a API retorna esse formato
      } else {
        console.warn("Formato de dados inesperado:", data);
      }
    })
    .catch((error) => {
      console.error("Erro ao carregar disponibilidades:", error);
    });
}, [selectedDate]);


  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedHora(e.target.value);
  };

  return (
    <>
      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className="fixed top-0 left-0 h-screen bg-pink3000 border-r border-pink5000 z-50 flex flex-col items-center justify-center p-4 overflow-y-auto"
        style={{ width: sidebarWidth }}
      >
        <div className="bg-pink2000 w-full h-20 fixed top-0 left-0 flex items-center px-4 z-50">
          <div className="flex items-center gap-2">
            <IconButton className="bg-pink2000 text-pink1000 p-2 rounded-md hover:text-pink4000 hover:bg-pink2000 cursor-pointer"
            onClick={() => router.push('/menu')}
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

      {/* Drag handler */}
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

            <div className="flex items-center gap-2 text-pink4000 ml-30">
              <label htmlFor="filtroHora" className="text-sm text-pink4000">
                Filtrar por hora:
              </label>
              <select
                id="filtroHora"
                className="border border-pink2000 rounded-sm py-1 text-sm w-40"
                value={selectedHora}
                onChange={handleFilterChange}
              >
                <option value="">Todas</option>
                {[...new Set(disponibilidades.map((item) => item.hora))].map(
                  (hora) => (
                    <option key={hora} value={hora}>
                      {hora}
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="flex items-center gap-2 text-pink4000">
              <label htmlFor="filtroDia" className="text-sm text-pink4000">
                Filtrar por dia do mês:
              </label>
              <select
                id="filtroDia"
                className="border border-pink2000 rounded-sm px-3 py-1 text-sm w-40"
              >
                <option value="">Todos</option>
                {/* Aqui você pode adicionar opções de dias específicos, se necessário */}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between flex-wrap gap-4 mb-[-16]">
            <div className="flex justify-center">
              <Button className="flex justify-between rounded-sm items-center bg-pink3000 px-5 h-10 text-pink2000 font-semibold w-full cursor-pointer transition-colors duration-300 hover:bg-pink2000 hover:text-pink1000">
                <ButtonIcon className="text-pink4000 w-7 ">
                  <History />
                </ButtonIcon>
                <ButtonField className="flex-1 text-pink4000 hover:text-pink1000 transition-colors duration-300">
                  Histórico de Agendamento
                </ButtonField>
              </Button>
            </div>

            <div>
              <BuscaPorNome valor="" aoAlterar={() => {}} />
            </div>
          </div>

          <div className="bg-pink1000 rounded-xl shadow-md p-6 w-full max-w-full overflow-auto max-h-screen mt-10">
            <h2 className="text-xl font-semibold text-pink2000 mb-4">
              Disponibilidade:
            </h2>

            <table className="w-full text-sm text-center border border-pink1000">
  <thead>
    <tr className="bg-pink2000 text-pink1000 border border-pink3000 text-center">
      <th className="p-2">Hora</th>
      <th className="p-2">Nome</th>
      <th className="p-2">Serviço</th>
      <th className="p-2">Local</th>
      <th className="p-2">Sala</th>
      <th className="p-2">Por</th>
    </tr>
  </thead>
  <tbody>
    {(disponibilidades && Array.isArray(disponibilidades) ? disponibilidades : []).map((item) => (
      <tr key={item.id} className="text-pink1000 border-b border-pink2000">
        <td>{item.hora}</td>
        <td>{item.nome}</td>
        <td>{item.servico}</td>
        <td>{item.local}</td>
        <td>{item.sala}</td>
        <td>{item.por}</td>
      </tr>
    ))}
  </tbody>
</table>

          </div>
        </div>
      </div>
    </>
  );
}
