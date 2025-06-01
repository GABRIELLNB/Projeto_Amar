'use client'

import { BuscaPorNome } from '@/components/busca'
import { Button } from '@/components/button'
import { ChatInput } from '@/components/chat-input'
import { BotaoGostei } from '@/components/gostei'
import { IconButton } from '@/components/icon-button'
import { ArrowLeft } from 'lucide-react'
import React, { useState, useRef, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

export default function Agendar() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [sidebarWidth, setSidebarWidth] = useState(350)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const isResizing = useRef(false)
  const minWidth = 300
  const maxWidth = 450
  const router = useRouter()

  const startResizing = () => {
    isResizing.current = true
  }

  const stopResizing = useCallback(() => {
    isResizing.current = false
  }, [])

  const resize = useCallback((e: MouseEvent) => {
    if (!isResizing.current) return
    const maxAllowedWidth = Math.min(maxWidth, window.innerWidth - 50)
    const newWidth = Math.min(maxAllowedWidth, Math.max(minWidth, e.clientX))
    setSidebarWidth(newWidth)
  }, [])

  useEffect(() => {
    window.addEventListener('mousemove', resize)
    window.addEventListener('mouseup', stopResizing)
    return () => {
      window.removeEventListener('mousemove', resize)
      window.removeEventListener('mouseup', stopResizing)
    }
  }, [resize, stopResizing])

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
          <IconButton className="bg-pink2000 text-pink1000 p-2 rounded-md hover:text-pink4000 hover:bg-pink2000 cursor-pointer"
            onClick={() => router.push('/menu')}
          >
            <ArrowLeft />
          </IconButton>
          <h1 className="text-pink1000 text-2xl font-semibold ml-5">FÓRUNS</h1>
        </div>

        {/* Busca sticky logo abaixo */}
        <div className="sticky top-20 z-40 bg-pink3000 p-2 border-b border-pink3000">
          <BuscaPorNome valor="" aoAlterar={() => {}} className="w-full" />
        </div>

        {/* Conteúdo que rola abaixo da busca */}
        <div className="absolute bottom-3 left-5 right-5 flex justify-between items-center">
          {/* Add content if necessary */}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Button
              key={i}
              className="relative group rounded-br-none flex justify-between rounded-2xl border border-pink1000 items-start px-6 pt-4 pb-12 bg-pink1000 text-pink2000 font-semibold w-full"
            >
              <span className="text-left">
                Seu texto aqui afastado das bordas
              </span>

              <div className="absolute bottom-2 right-2 scale-70">
                <BotaoGostei />
              </div>
            </Button>
          ))}
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
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Add main content here */}
      </div>

      <div
        className="absolute left-[300px] right-0 p-6 min-h-screen bg-cover bg-fixed bg-center"
        style={{ backgroundImage: "url('/CC2.png')" }}
      >
        <div className="bg-pink2000 w-full h-20 fixed top-0 left-[350px] right-0 z-40" />
        <ChatInput />
      </div>
    </>
  )
}
