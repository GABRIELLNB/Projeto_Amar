'use client'

import { Button, ButtonField } from '@/components/button'
import { IconButton } from '@/components/icon-button'
import { ArrowLeft, Settings } from 'lucide-react'
import React from 'react'

export default function menuAdm() {
  return (
    <>
      {/* Top bar */}
      <div className="bg-pink2000 w-full h-20 fixed top-0 left-0 flex items-center px-4 z-50">
        <div className="flex items-center gap-2">
          <IconButton className="bg-pink2000 text-pink1000 p-2 rounded-md hover:text-pink4000 hover:bg-pink2000 cursor-pointer">
            <ArrowLeft />
          </IconButton>
          <h1 className="text-pink1000 text-2xl font-semibold text-center">
            MENU DO ADMINISTRADOR
          </h1>
        </div>
      </div>

      {/* Main content */}
      <main className="flex flex-col items-center justify-center pt-2 min-h-screen bg-pink1000 px-6 gap-8">
        <div className="flex justify-center gap-2 mb-2 flex-wrap">
          <h1 className="text-3xl font-semibold text-pink4000 whitespace-nowrap">
            Cadastro de Funcionários
          </h1>
        </div>

        <div className="relative bg-pink1000 rounded-2xl shadow-lg p-6 w-[90vw] max-w-sm h-[250px] border border-pink1000">
          <div className="bg-pink2000 w-full h-4 absolute top-[-1] left-0 rounded-t-2xl border border-pink1000" />
          <h2 className="text-xl font-bold mb-10 text-pink4000 text-center">
            Escolha uma das opções:
          </h2>
          <div>
 <Button
            type="submit"
            className="group flex justify-between mb-5 items-center px-5 h-12 bg-pink2000 text-pink1000 font-semibold rounded-xl w-full cursor-pointer transition-colors duration-300 hover:bg-pink3000 hover:text-pink4000"
          >
            <ButtonField className="flex-1 ">
              Adicionar Profissional
            </ButtonField>
          </Button>
          <Button
            type="submit"
            className="group flex justify-between items-center px-5 h-12 bg-pink2000 text-pink1000 font-semibold rounded-xl w-full cursor-pointer transition-colors duration-300 hover:bg-pink3000 hover:text-pink4000"
          >
            <ButtonField className="flex-1 ">Adicionar Estagiário</ButtonField>
          </Button>
          </div>
         
        </div>
        </main>
    
    </>
  )
}
