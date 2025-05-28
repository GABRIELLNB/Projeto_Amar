'use client'

import { Button } from '@/components/button'
import { IconButton } from '@/components/icon-button'
import SidebarMenu from '@/components/sidebar-menu'
import { ArrowLeft, CircleX, FileClock } from 'lucide-react'
import { useState } from 'react'

const consultas = [
  {
    hora: '09:30',
    data: '30/05/2025',
    paciente: 'Paulo',
    servico: 'Psicóloga',
    local: 'Unijorge',
    sala: '01',
    profissional: 'Dr. Ariela',
    status: 'Pendente',
  },
  {
    hora: '14:00',
    data: '19/05/2025',
    paciente: 'Paulo',
    servico: 'Nutrição',
    local: 'Unijorge',
    sala: '01',
    profissional: 'Dr. Estela',
    status: 'Concluído',
  },
  {
    hora: '15:30',
    data: '12/05/2025',
    paciente: 'Paulo',
    servico: 'Nutrição',
    local: 'Unijorge',
    sala: '01',
    profissional: 'Dr. Estela',
    status: 'Cancelado',
  },
]

const statusColors: Record<string, string> = {
  Pendente: 'bg-yellow-400 text-black',
  Concluído: 'bg-green-500 text-white',
  Cancelado: 'bg-red-500 text-white',
}

export default function Histórico() {
  const [isExit, setIsExit] = useState(false)
  const [consultaSelecionada, setConsultaSelecionada] = useState(null)

  return (
    <>
      <SidebarMenu userName="Paulo Avelino" />

      <div className="ml-[360px] p-6 relative">
        <div className="gap-6 mt-10 px-6">
          {/* Título */}
          <div className="flex items-center gap-2 mb-6 ml-5">
            <h1 className="flex items-center gap-2 text-3xl font-semibold text-pink4000 whitespace-nowrap">
              <FileClock className="w-8 h-8" />
              Histórico de Consultas:
            </h1>
          </div>

          {/* Cards de agendamento */}
          <div className="flex flex-col space-y-4 ml-5 gap-0 justify-start">
            {consultas.map((consulta, i) => (
              <div
                key={i}
                className="bg-pink3000 rounded-xl shadow-md p-6 w-full max-w-full overflow-auto max-h-screen mt-10"
              >
                <div className="flex items-center justify-between text-lg font-bold text-pink4000 mb-3">
                  <div className="flex-1">
                    <span>{consulta.hora}</span>
                  </div>

                  {consulta.status === 'Pendente' && (
                    <IconButton
                      className=" p-1.5 bg-pink3000 text-red rounded-md cursor-pointer transition-colors duration-300  hover:text-pink4000"
                      onClick={() => {
                        setConsultaSelecionada(consulta)
                        setIsExit(true)
                      }}
                    >
                      <CircleX size={25} />
                    </IconButton>
                  )}
                </div>

                <div
                  key={i}
                  className="bg-pink1000 rounded-xl shadow-md p-6 w-full max-w-full overflow-auto max-h-screen"
                >
                  {/* Hora destacada no topo */}

                  {/* Informações da consulta */}
                  <table className="w-full text-sm text-center border border-pink1000">
                    <thead>
                      <tr className="bg-pink1000 text-pink4000 font-semibold">
                        <th className="px-2 py-2">Data</th>
                        <th className="px-2 py-2">Paciente</th>
                        <th className="px-2 py-2">Serviço</th>
                        <th className="px-2 py-2">Local</th>
                        <th className="px-2 py-2">Sala</th>
                        <th className="px-2 py-2">Profissional</th>
                        <th className="px-2 py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t border-pink3000">
                        <td className="px-2 py-2">{consulta.data}</td>
                        <td className="px-2 py-2">{consulta.paciente}</td>
                        <td className="px-2 py-2">{consulta.servico}</td>
                        <td className="px-2 py-2">{consulta.local}</td>
                        <td className="px-2 py-2">{consulta.sala}</td>
                        <td className="px-2 py-2">{consulta.profissional}</td>
                        <td className="px-2 py-2">
                          <span
                            className={`px-2 py-1 rounded ${statusColors[consulta.status]}`}
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
      {isExit && (
        <>
          <div
            role="button"
            tabIndex={0}
            onClick={() => setIsExit(false)}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                setIsExit(false)
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
                {consultaSelecionada && (
                  <span className="text-pink4000 text-sm">
                    Cancelar consulta de {consultaSelecionada.profissional} em{' '}
                    {consultaSelecionada.data} às {consultaSelecionada.hora}?
                  </span>
                )}
              </div>

              <div className="mb-2">
                <div>
                  <Button
                    onClick={() => setIsExit(false)}
                    className="bg-red text-pink1000 border border-red px-4 py-2 rounded-xl w-full transition-colors duration-300 hover:bg-pink3000 hover:text-red cursor-pointer"
                  >
                    Cancelar consulta
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
