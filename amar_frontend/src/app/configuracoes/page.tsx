'use client'

import { Button, ButtonField, ButtonIcon } from '@/components/button'
import { IconButton } from '@/components/icon-button'
import { InputField, InputIcon, InputRoot } from '@/components/input'
import SidebarMenu from '@/components/sidebar-menu'
import {
  ArrowLeft,
  ArrowRight,
  CalendarCheck2,
  Copy,
  FileCheck2,
  FileClock,
  HelpCircle,
  Home,
  Info,
  LogOut,
  Mail,
  MessageSquare,
  Phone,
  Settings,
  SquarePen,
  User,
  UserLock,
  UserRoundPen,
} from 'lucide-react'
import { useState } from 'react'

export default function Configuracoes() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isCheck, setIsCheck] = useState(false)
  const [isInfo, setIsInfo] = useState(false)
  const [isPolicy, setIsPolicy] = useState(false)
  const [isHelpOpen, setIsHelpOpen] = useState(false)
  const [isExit, setIsExit] = useState(false)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div>
      <SidebarMenu userName="Paulo Avelino" activeItem="Configurações"/>

      <div className="ml-[360px] p-6 relative">
        <div className="gap-6 mt-[-50] px-6">
          <div className="flex items-center gap-6 ml-0 flex-wrap">
            <div className="gap-6 mt-28 px-6">
              <div className="flex justify-center gap-2 mb-0 ml-2 flex-wrap">
                <Settings className="text-pink4000 w-10 h-10" />
                <h1 className="text-3xl font-semibold text-pink4000 whitespace-nowrap">
                  Configurações
                </h1>
              </div>
            </div>
            <div className="bg-pink1000 rounded-xl shadow-md p-6 w-full max-w-full overflow-auto max-h-screen mt-8">
              {[
                { icon: <UserLock />, label: 'Permissões', onClick: () => setIsCheck(true) },
                { icon: <Info />, label: 'Entenda Mais', onClick:() => setIsInfo(true) },
                { icon: <FileCheck2 />, label: 'Termos e Política', onClick: () => setIsPolicy(true) },
                {
                  icon: <HelpCircle />,
                  label: 'Ajuda',
                  onClick: () => setIsHelpOpen(true),
                },
                {
                  icon: <LogOut />,
                  label: 'Sair da Conta',
                  onClick: () => setIsExit(true),
                },
              ].map((item, index) => (
                <div key={index} className="flex justify-center mb-2">
                  <Button
                    onClick={item.onClick}
                    className="flex items-center justify-between px-5 h-12 bg-pink3000 text-pink1000 font-semibold rounded-xl w-full cursor-pointer transition-colors duration-300 hover:bg-pink2000 hover:text-pink1000"
                  >
                    <div className="flex items-center gap-4">
                      <ButtonIcon className="text-pink4000">
                        {item.icon}
                      </ButtonIcon>
                      <ButtonField className="flex-1 text-pink4000 hover:text-pink1000 transition-colors duration-300">
                        {item.label}
                      </ButtonField>
                    </div>
                    <ArrowRight className="text-pink4000" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/*PERMISSÕES */}
      {isCheck && (
        <>
          <div
            role="button"
            tabIndex={0}
            onClick={() => setIsCheck(false)}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                setIsCheck(false)
              }
            }}
            className="fixed inset-0 z-40 backdrop-blur-sm"
          />

          {/* Pop-up acima da camada transparente */}
          <div className="fixed top-1/2 left-[60%] transform -translate-x-1/2 -translate-y-1/2 z-50">
            <div className="relative bg-pink1000 rounded-2xl shadow-lg p-6 w-[90vw] max-w-sm h-[300px] border border-pink4000">
              <div className="absolute top-4 left-1">
                <IconButton
                  onClick={() => setIsCheck(false)}
                  className="p-1.5 bg-pink1000 text-pink4000 rounded-md cursor-pointer transition-colors duration-300 hover:text-pink2000"
                >
                  <ArrowLeft />
                </IconButton>
              </div>

              <div className="bg-pink2000 w-full h-4 absolute top-[-1] left-0 rounded-t-2xl border border-pink4000" />

              <h2 className="text-xl font-bold mb-10 text-pink4000 text-center">
                Permissões
              </h2>
              <h3 className="mb-3 text-pink2000">
                Precisa de ajuda? Conte com a gente:
              </h3>
              {/* Botão centralizado */}
              <div className="flex justify-center">
                <Button
                  onClick={() => setIsCheck(false)}
                  className="bg-pink2000 text-pink1000 border border-pink2000 px-4 py-2 rounded-xl w-full transition-colors duration-300 hover:bg-pink3000 hover:text-pink2000 cursor-pointer"
                >
                  Fechar
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      {/*ENTENDA MAIS */}
      {isInfo && (
        <>
          <div
            role="button"
            tabIndex={0}
            onClick={() => setIsInfo(false)}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                setIsInfo(false)
              }
            }}
            className="fixed inset-0 z-40 backdrop-blur-sm"
          />

          {/* Pop-up acima da camada transparente */}
          <div className="fixed top-1/2 left-[60%] transform -translate-x-1/2 -translate-y-1/2 z-50">
            <div className="relative bg-pink1000 rounded-2xl shadow-lg p-6 w-[90vw] max-w-sm h-[300px] border border-pink4000">
              <div className="absolute top-4 left-1">
                <IconButton
                  onClick={() => setIsInfo(false)}
                  className="p-1.5 bg-pink1000 text-pink4000 rounded-md cursor-pointer transition-colors duration-300 hover:text-pink2000"
                >
                  <ArrowLeft />
                </IconButton>
              </div>

              <div className="bg-pink2000 w-full h-4 absolute top-[-1] left-0 rounded-t-2xl border border-pink4000" />

              <h2 className="text-xl font-bold mb-10 text-pink4000 text-center">
                Entenda Mais
              </h2>

              <div className="flex items-center justify-between mb-4">
                <span className="text-pink4000 text-sm">
                  AMAR É UM SITE DE EVBTB RTGR TGTR RGT TGT TGR RGR TRGRRGTR R GRY  6YNYUN6N 6NUN  6 H6H6 H6 6 6J7J7 J7 YGF SJDBAVB VHABVUEBVHHA VBUEBVEBVU DJFJFJNVHBHUV VEFEUFEINCHE CEHH CREHNFWIBUE WUDHWUIDIWNRU
                </span>
              </div>

              {/* Botão centralizado */}
              <div className="flex justify-center">
                <Button
                  onClick={() => setIsInfo(false)}
                  className="bg-pink2000 text-pink1000 border border-pink2000 px-4 py-2 rounded-xl w-full transition-colors duration-300 hover:bg-pink3000 hover:text-pink2000 cursor-pointer"
                >
                  Fechar
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
      {/*POLITICA */}
      {isPolicy && (
        <>
          <div
            role="button"
            tabIndex={0}
            onClick={() => setIsPolicy(false)}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                setIsPolicy(false)
              }
            }}
            className="fixed inset-0 z-40 backdrop-blur-sm"
          />

          {/* Pop-up acima da camada transparente */}
          <div className="fixed top-1/2 left-[60%] transform -translate-x-1/2 -translate-y-1/2 z-50">
            <div className="relative bg-pink1000 rounded-2xl shadow-lg p-6 w-[90vw] max-w-sm h-[300px] border border-pink4000">
              <div className="absolute top-4 left-1">
                <IconButton
                  onClick={() => setIsPolicy(false)}
                  className="p-1.5 bg-pink1000 text-pink4000 rounded-md cursor-pointer transition-colors duration-300 hover:text-pink2000"
                >
                  <ArrowLeft />
                </IconButton>
              </div>

              <div className="bg-pink2000 w-full h-4 absolute top-[-1] left-0 rounded-t-2xl border border-pink4000" />

              <h2 className="text-xl font-bold mb-10 text-pink4000 text-center">
              Termos e Permissões
              </h2>

              <div className="flex items-center justify-between mb-4">
                <span className="text-pink4000 text-sm">
                  É jknfncna snajfakbf asjkfbbfaei fajhsbfrufuia fdsakfhsdhf shfkabfiaua fgasfjguyeafe fauyfguyavef abfjbuyvuefaf bjhabfbaefjbaef aefg uaegfuyaegfa faghahgueruba ghgjaughaurh giurebgbrbghrb ghghaighur huahogagbjdnknfkjsb gsgsdg io ernigankg 
                </span>
              </div>

              {/* Botão centralizado */}
              <div className="flex justify-center">
                <Button
                  onClick={() => setIsPolicy(false)}
                  className="bg-pink2000 text-pink1000 border border-pink2000 px-4 py-2 rounded-xl w-full transition-colors duration-300 hover:bg-pink3000 hover:text-pink2000 cursor-pointer"
                >
                  Fechar
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
      {/*AJUDA */}
      {isHelpOpen && (
        <>
          <div
            role="button"
            tabIndex={0}
            onClick={() => setIsHelpOpen(false)}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                setIsHelpOpen(false)
              }
            }}
            className="fixed inset-0 z-40 backdrop-blur-sm"
          />

          {/* Pop-up acima da camada transparente */}
          <div className="fixed top-1/2 left-[60%] transform -translate-x-1/2 -translate-y-1/2 z-50">
            <div className="relative bg-pink1000 rounded-2xl shadow-lg p-6 w-[90vw] max-w-sm h-[300px] border border-pink4000">
              {/* Botão de voltar */}
              <div className="absolute top-4 left-1">
                <IconButton
                  onClick={() => setIsHelpOpen(false)}
                  className="p-1.5 bg-pink1000 text-pink4000 rounded-md cursor-pointer transition-colors duration-300 hover:text-pink2000"
                >
                  <ArrowLeft />
                </IconButton>
              </div>

              {/* Barra superior */}
              <div className="bg-pink2000 w-full h-4 absolute top-[-1] left-0 rounded-t-2xl border border-pink4000" />

              {/* Título */}
              <h2 className="text-xl font-bold mb-10 text-pink4000 text-center">
                Ajuda
              </h2>

              {/* Texto e botões de copiar */}
              <h3 className="mb-3 text-pink2000">
                Precisa de ajuda? Conte com a gente:
              </h3>

              <div className="flex items-center justify-between mb-2">
                <span className="text-pink4000 text-sm">
                  Email: <br />
                  lmaafhagdafywfef@gmail.com
                </span>
                <IconButton
                  onClick={() => copyToClipboard('lmaafhagdafywfef@gmail.com')}
                >
                  <Copy className="w-4 h-4 text-pink4000 hover:text-pink3000" />
                </IconButton>
              </div>

              <div className="flex items-center justify-between mb-4">
                <span className="text-pink4000 text-sm">
                  Telefone: <br />
                  5555555-54654565
                </span>
                <IconButton onClick={() => copyToClipboard('5555555-54654565')}>
                  <Copy className="w-4 h-4 text-pink4000 hover:text-pink3000" />
                </IconButton>
              </div>

              {/* Botão centralizado */}
              <div className="flex justify-center">
                <Button
                  onClick={() => setIsHelpOpen(false)}
                  className="bg-pink2000 text-pink1000 border border-pink2000 px-4 py-2 rounded-xl w-full transition-colors duration-300 hover:bg-pink3000 hover:text-pink2000 cursor-pointer"
                >
                  Fechar
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      {/*SAIR */}
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
            <h2 className="text-xl font-bold mb-10 text-pink4000 text-center">
              Sair da Conta
            </h2>
            <div className="flex items-center justify-between mb-2">
              <span className="text-pink4000 text-sm">Deseja mesmo sair?</span>
            </div>

            <div className="flex justify-center mb-2 gap-2">
              <div>
                <Button
                  onClick={() => setIsExit(false)}
                  className="bg-pink2000 text-pink1000 border border-pink2000 px-4 py-2 rounded-xl w-30  transition-colors duration-300 hover:bg-pink3000 hover:text-pink2000 cursor-pointer"
                >
                  Cancelar
                </Button>
              </div>
              <div>
                <Button
                  onClick={() => setIsExit(false)}
                  className="bg-red text-pink1000 border border-red px-4 py-2 rounded-xl w-30  transition-colors duration-300 hover:bg-pink3000 hover:text-red cursor-pointer"
                >
                  Sair
                </Button>
              </div>
            </div>
          </div>
        </div>
        </>
      )}
    </div>
  )
}
