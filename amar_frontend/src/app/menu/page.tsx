'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/button'
import { BotaoGostei } from '@/components/gostei'
import SidebarMenu from '@/components/sidebar-menu'
import { MessageSquare } from 'lucide-react'

export default function Menu() {
  const router = useRouter()
  const [data, setData] = useState<any[]>([]) // Supondo que você vai buscar alguma lista de dados
  const [loading, setLoading] = useState(true)

  const [userType, setUserType] = useState<"profissional" | "estagiario" | "outro">("outro");
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
    
  useEffect(() => {
    const token = localStorage.getItem('token')

    if (!token) {
      router.push('/') // Se não tiver token, redireciona para login
      return
    }

    fetch('http://localhost:8000/api/usuarios', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => {
        if (!res.ok) {
          throw new Error('Não autorizado')
        }
        return res.json()
      })
      .then(json => {
        setData(json)
        setLoading(false)
      })
      .catch(() => {
        alert('Sessão expirada ou inválida. Faça login novamente.')
        localStorage.removeItem('token')
        router.push('/')
      })
  }, [router])


  return (
    <div>
      <SidebarMenu userType={userType}
        userName={userName} activeItem='Menu' />

      <div className="ml-[360px] p-6 relative">
        <div className="gap-6 px-6">
          <div className="flex items-center gap-6 ml-0 flex-wrap">
            <div className="flex-grow overflow-auto">
              <div className="grid grid-cols-2 gap-6 p-4 overflow-y-auto">
                {data.length === 0
                  ? <p> </p>
                  : data.map((item, i) => (
                      <div
                        key={i}
                        className="bg-pink1000 rounded-xl p-6 cursor-pointer transition-colors hover:bg-pink1000"
                      >
                        <Button className="relative group flex flex-col justify-between shadow-md h-50 cursor-pointer rounded-2xl rounded-br-none border border-pink1000 px-5 pt-5 pb-14 bg-pink1000 text-pink2000 font-semibold w-full transition-colors duration-300 hover:bg-pink1000 hover:text-pink4000 hover:border-pink4000">
                          <div className="text-left text-sm mb-4">
                            <p>{item.texto || 'Texto do item'}</p>
                          </div>

                          <div className="absolute bottom-3 left-5 right-5 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <div className="text-pink2000 pointer-events-none scale-70 !cursor-default">
                                <BotaoGostei />
                              </div>
                              <div className="text-pink2000">
                                <MessageSquare size={20} />
                              </div>
                            </div>

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
