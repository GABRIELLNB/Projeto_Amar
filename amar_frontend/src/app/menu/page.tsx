'use client'

import { Button, ButtonField } from '@/components/button'
import { BotaoGostei } from '@/components/gostei'
import SidebarMenu from '@/components/sidebar-menu'
import { MessageSquare } from 'lucide-react'

export default function EditarPerfil() {
  return (
    <div>
      <SidebarMenu userName="Paulo Avelino" />

      <div className="ml-[360px] p-6 relative">
        <div className="gap-6 px-6">
          <div className="flex items-center gap-6 ml-0 flex-wrap">
            <div className="flex-grow overflow-auto">
              <div className="grid grid-cols-2 gap-6 p-4 overflow-y-auto">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-pink1000 rounded-xl p-6 cursor-pointer transition-colors hover:bg-pink1000"
                  >
                    <Button className="relative group flex flex-col justify-between shadow-md h-50 cursor-pointer rounded-2xl rounded-br-none border border-pink1000 px-5 pt-5 pb-14 bg-pink1000 text-pink2000 font-semibold w-full transition-colors duration-300 hover:bg-pink1000 hover:text-pink4000 hover:border-pink4000">
                      <div className="text-left text-sm mb-4">
                        <p>
                          jfsjffoifnf jhrsgs hsrheshe hfhfhfghgf hffghfhdhgdh
                          ghd ghdgdg dhgfhfh hgfhfhfhf hfhfghfg hfghfhfh
                          gfhfhfhf fghfhfg hfghfhg fhghfhfg hfghfhf fhwhfwi
                          fwjfwisufbiuwe fsjfhshfihfie fbshfiusfuiw
                          fbsfshfshfhsjhf bsfbhsdfhbshfs bfishfiushifuw
                        </p>
                      </div>

                      <div className="absolute bottom-3 left-5 right-5 flex justify-between items-center">
                        {/* Ícones à esquerda */}
                        <div className="flex items-center gap-2">
                          <div className="text-pink2000 pointer-events-none scale-70 !cursor-default">
                            <BotaoGostei />
                          </div>
                          <div className="text-pink2000">
                            <MessageSquare size={20} />
                          </div>
                        </div>

                        {/* Botão "Acesse o fórum" à direita */}
                        <Button
                          type="button"
                          className="text-pink2000 text-sm font-medium hover:underline underline-offset-4 decoration-orange-400/50 hover:decoration-pink2000 transition-colors duration-300 cursor-pointer text-[12px]"
                        >
                          Acesse o fórum
                        </Button>
                      </div>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
