'use client'
import { Button, ButtonField, ButtonIcon } from '@/components/button'
import { IconButton } from '@/components/icon-button'
import { InputField, InputRoot } from '@/components/input'
import {
  CalendarCheck2,
  CalendarPlus,
  FileClock,
  Home,
  MessageSquare,
  Send,
  Settings,
  User,
  UserRoundPen,
} from 'lucide-react'
import React, { useRef, useState, useEffect, useCallback } from 'react'

interface SidebarMenuProps {
  userName: string
}

export default function ProfsidebarMenu({ userName }: SidebarMenuProps) {
  const [activeItem, setActiveItem] = useState<string>('Menu')
  const sidebarRef = useRef<HTMLDivElement>(null)
  const isResizing = useRef(false)

  const minWidth = 300
  const maxWidth = 450

  const [sidebarWidth, setSidebarWidth] = useState(350)

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
      <div
        ref={sidebarRef}
        className="fixed top-0 left-0 h-screen bg-pink3000 border-r border-pink5000 z-50 flex flex-col"
        style={{ width: sidebarWidth }}
      >
        <div className="bg-pink2000 w-full h-2 fixed top-0 left-0 flex items-center px-4">
        </div>
        {/* Topo e meio */}
        <div className="flex-grow overflow-auto">
          <div className="flex justify-center mt-10">
            <IconButton className="w-50 h-50 rounded-full bg-pink1000 text-pink4000 hover:text-pink4000 flex items-center justify-center transition-colors duration-300">
              <User className="w-30 h-30" />
            </IconButton>
          </div>

          <div className="flex justify-center mb-6">
            <h1 className="text-4xl font-bold text-pink4000">{userName}</h1>
          </div>

         {[
          { icon: <Home />, label: 'Menu' },
          { icon: <UserRoundPen />, label: 'Editar Perfil' },
          { icon: <MessageSquare />, label: 'Bate-Papo' },
          { icon: <CalendarPlus />, label: 'Agendar' },
          { icon: <FileClock />, label: 'Histórico' },
          { icon: <Settings />, label: 'Configurações' },
          { icon: <CalendarCheck2 />, label: 'Consultas Marcadas' },
        ].map((item, index) => (
          <div key={index} className="flex justify-center mb-2">
            <Button
              className={`flex justify-between items-center px-5 h-12 font-semibold rounded-xl w-full cursor-pointer transition-colors duration-300 ${
                activeItem === item.label
                  ? 'bg-pink2000 text-pink1000'
                  : 'text-pink4000 hover:bg-pink2000 hover:text-pink1000'
              }`}
              onClick={() => setActiveItem(item.label)}
            >
              <ButtonIcon className={activeItem === item.label ? 'text-pink1000' : 'text-pink4000'}>
                {item.icon}
              </ButtonIcon>
              <ButtonField className="flex-1">{item.label}</ButtonField>
            </Button>
          </div>
        ))}
        </div>

        {/* Parte inferior - input + botão */}
        <div className="flex items-center p-4 border-t border-pink2000 rounded-tr-2xl bg-pink2000">
          <InputRoot className="flex-20 bg-pink3000 h-10 border border-pink2000 rounded-xl px-4 flex items-center gap-2 focus-within:border-pink4000">
            <InputField placeholder="Digite sua mensagem..." />
          </InputRoot>
          <Button className="ml-4 bg-pink4000 text-pink1000 p-2 rounded-2xl hover:bg-pink1000 transition-colors duration-300 hover:text-pink4000">
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
    </>
  )
}
