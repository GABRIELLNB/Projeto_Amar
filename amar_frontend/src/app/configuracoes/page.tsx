"use client";

import { Button, ButtonField, ButtonIcon } from "@/components/button";
import { IconButton } from "@/components/icon-button";
import { InputField, InputIcon, InputRoot } from "@/components/input";
import SidebarMenu from "@/components/sidebar-menu";
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
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Configuracoes() {
  const router = useRouter();
  const [isCheck, setIsCheck] = useState(false);
  const [isInfo, setIsInfo] = useState(false);
  const [isPolicy, setIsPolicy] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isExit, setIsExit] = useState(false);
  const [isClient, setIsClient] = useState(false);



  const [userType, setUserType] = useState<
    "profissional" | "estagiario" | "outro"
  >("outro");
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    setIsClient(true); // só ativa no client
    if (typeof window !== "undefined") {
      const storedUserType = localStorage.getItem("user_type") as
        | "profissional"
        | "estagiario"
        | "outro"
        | null;
      const storedUserName = localStorage.getItem("user_name") || "";

      if (storedUserType) setUserType(storedUserType);
      setUserName(storedUserName);
    }
    
  }, []);

  const handleLogout = () => {
    // Limpar dados de autenticação
    if (typeof window !== "undefined") {
      localStorage.removeItem("token"); // ou sessionStorage.clear(), etc.

      // Redirecionar sem deixar rastros no histórico
      router.replace("/");
    }
  };


  const copyToClipboard = async (text: string) => {
    if (typeof window !== "undefined" && navigator?.clipboard) {
    try {
      await navigator.clipboard.writeText(text);
      alert("Copiado para a área de transferência!");
    } catch (err) {
      alert("Erro ao copiar.");
      console.error("Falha ao copiar: ", err);
    }
  }
  };
   if (!isClient) return null; // evita renderização no build

  return (
    <div>
      <SidebarMenu
        userType={userType}
        userName={userName}
        activeItem="Configurações"
      />

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
                /*
                {
                  icon: <UserLock />,
                  label: "Permissões",
                  onClick: () => setIsCheck(true),
                },
                 */
                {
                  icon: <Info />,
                  label: "Entenda Mais",
                  onClick: () => setIsInfo(true),
                },
                {
                  icon: <FileCheck2 />,
                  label: "Termos e Política",
                  onClick: () => setIsPolicy(true),
                },
                {
                  icon: <HelpCircle />,
                  label: "Ajuda",
                  onClick: () => setIsHelpOpen(true),
                },
                {
                  icon: <LogOut />,
                  label: "Sair da Conta",
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

      {/*ACHO MELHOR TIRAR */}
      {/*PERMISSÕES */}
      {isCheck && (
        <>
          <div
            role="button"
            tabIndex={0}
            onClick={() => setIsCheck(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                setIsCheck(false);
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
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                setIsInfo(false);
              }
            }}
            className="fixed inset-0 z-40 backdrop-blur-sm"
          />

          {/* Pop-up acima da camada transparente */}
          <div className="fixed top-1/2 left-[60%] transform -translate-x-1/2 -translate-y-1/2 z-50">
            <div className="relative bg-pink1000 rounded-2xl shadow-lg p-6 w-[105vw] max-w-lg h-[330px] border border-pink4000">
              <div className="absolute top-4 left-1">
                <IconButton
                  onClick={() => setIsInfo(false)}
                  className="p-1.5 bg-pink1000 text-pink4000 rounded-md cursor-pointer transition-colors duration-300 hover:text-pink2000"
                >
                  <ArrowLeft />
                </IconButton>
              </div>

              <div className="bg-pink2000 w-full h-4 absolute top-[-1] left-0 rounded-t-2xl border border-pink4000" />

              <h2 className="text-xl font-bold mb-8 text-pink4000 text-center">
                Entenda Mais
              </h2>
              <h3 className="mb-2 text-pink2000">O que é o A.M.A.R ?</h3>
              <div className="flex items-center justify-between mb-2">
                <div className="overflow-y-auto max-h-[140px] px-2 text-justify text-pink4000 text-sm">
                  A.M.A.R. é uma plataforma inclusiva e acolhedora, que foi
                  criada especialmente para oferecer apoio e promover as
                  conexões dentro da comunidade LGBTQIAPN+. Mais do que um
                  simples espaço online, a plataforma representa um ambiente
                  seguro e cheio de possibilidades, onde você vai poder
                  compartilhar experiências, buscar ajuda e encontrar
                  profissionais especializados para lidar com questões
                  essenciais da vida. Vai ser possível também participar de um
                  fórum aberto e colaborativo, onde vai te permitir a
                  possibilidade de trocar histórias, desabafos, conquistas e
                  aprendizados, fortalecendo o sentimento de pertencimento e
                  união. Além disso, a plataforma vai permitir interações mais
                  direcionadas e um suporte ainda mais eficaz para cada
                  necessidade. Outro recurso essencial é a funcionalidade de
                  agendamento de serviços, que torna possível marcar consultas
                  com psicólogos, médicos e estagiários parceiros com total
                  conveniência. E para garantir uma experiência completa, a
                  A.M.A.R vai te oferecer o acompanhamento de todos os
                  agendamentos, enviando lembretes e notificações que ajudam a
                  manter o controle das consultas e facilitam o planejamento de
                  novos atendimentos, conforme a necessidade de cada pessoa. Com
                  um compromisso cuidado, a plataforma também disponibiliza
                  consultoria online com profissionais especializados em
                  diversas áreas que vão te proporcionar orientações práticas e
                  acessíveis para a comunidade.
                </div>
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
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                setIsPolicy(false);
              }
            }}
            className="fixed inset-0 z-40 backdrop-blur-sm"
          />

          {/* Pop-up acima da camada transparente */}
          <div className="fixed top-1/2 left-[60%] transform -translate-x-1/2 -translate-y-1/2 z-50">
            <div className="relative bg-pink1000 rounded-2xl shadow-lg p-6 w-[90vw] max-w-lg h-[330px] border border-pink4000">
              <div className="absolute top-4 left-1">
                <IconButton
                  onClick={() => setIsPolicy(false)}
                  className="p-1.5 bg-pink1000 text-pink4000 rounded-md cursor-pointer transition-colors duration-300 hover:text-pink2000"
                >
                  <ArrowLeft />
                </IconButton>
              </div>

              <div className="bg-pink2000 w-full h-4 absolute top-[-1] left-0 rounded-t-2xl border border-pink4000" />

              <h2 className="text-xl font-bold mb-8 text-pink4000 text-center">
                Termos e Permissões
              </h2>

              <h3 className="mb-2 text-pink2000">Termos de Uso e Permissões da Plataforma A.M.A.R.</h3>
              <div className="flex items-center justify-between mb-2">
                <div className="overflow-y-auto max-h-[140px] px-2 text-justify text-pink4000 text-sm">
                  1. Aceitação dos Termos
Ao acessar ou utilizar a plataforma A.M.A.R., você concorda com os presentes Termos de Uso e Permissões. Caso não concorde com qualquer parte destes termos, recomendamos que não utilize a plataforma.
<br /><br />
2. Objetivo da Plataforma
A.M.A.R. é uma plataforma online voltada ao acolhimento, apoio e promoção de conexões dentro da comunidade LGBTQIAPN+. A plataforma disponibiliza fóruns, agendamento de serviços com profissionais especializados, grupos temáticos de apoio e consultoria online.
<br /><br />
3. Cadastro e Responsabilidades do Usuário
Para utilizar determinadas funcionalidades, o usuário deve se cadastrar, fornecendo informações verdadeiras e atualizadas.

É proibido criar perfis falsos, utilizar dados de terceiros ou fazer-se passar por outra pessoa.

O usuário é responsável por manter a confidencialidade de seu login e senha.
<br /><br />
4. Conduta no Uso da Plataforma
Ao utilizar a A.M.A.R., o usuário se compromete a:

Respeitar os demais membros da comunidade, mantendo um ambiente acolhedor e inclusivo.

Não publicar conteúdos ofensivos, discriminatórios, violentos, pornográficos ou ilegais.

Utilizar os serviços da plataforma de forma ética e respeitosa, principalmente ao interagir com profissionais e outros usuários.

A plataforma reserva-se o direito de remover conteúdos e suspender ou excluir contas que violem essas diretrizes.
<br /><br />
5. Uso dos Fóruns e Grupos de Apoio
Os fóruns são espaços colaborativos e públicos dentro da comunidade da plataforma.

Informações pessoais compartilhadas por outros usuários devem ser respeitadas e não podem ser utilizadas fora do contexto da plataforma.

A.M.A.R. não se responsabiliza por informações ou conselhos postados por usuários nos fóruns.
<br /><br />
6. Agendamento e Serviços Profissionais
Os serviços disponibilizados por psicólogos, médicos e advogados parceiros são realizados de forma autônoma, não sendo a A.M.A.R. responsável direta pelo atendimento prestado.

O usuário deve respeitar os horários agendados e comunicar previamente em caso de cancelamento.

Os profissionais devem manter o sigilo e a ética profissional conforme seus respectivos conselhos de classe.
<br /><br />
7. Consultorias Online
As consultorias são oferecidas com caráter informativo e orientativo, não substituindo diagnósticos ou tratamentos presenciais quando necessários.

A.M.A.R. poderá, a seu critério, gravar atendimentos (com aviso prévio) para fins de controle de qualidade, sempre respeitando o sigilo das informações pessoais.
<br /><br />
8. Privacidade e Proteção de Dados
A.M.A.R. se compromete a proteger os dados pessoais dos usuários, conforme as diretrizes da Lei Geral de Proteção de Dados (LGPD).

As informações coletadas são utilizadas exclusivamente para melhorar a experiência da plataforma e garantir a prestação adequada dos serviços.
<br /><br />
9. Propriedade Intelectual
Todos os conteúdos disponibilizados na plataforma (textos, design, marca, software) são de propriedade da A.M.A.R. ou de seus parceiros, sendo proibida a reprodução sem autorização prévia.
<br /><br />
10. Alterações nos Termos
A plataforma poderá alterar estes Termos de Uso a qualquer momento. É responsabilidade do usuário revisar os termos periodicamente. O uso contínuo da plataforma após alterações será considerado como aceitação das mudanças.
                </div>
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
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                setIsHelpOpen(false);
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
                  amar@gmail.com
                </span>
                <IconButton
                  onClick={() => copyToClipboard("amar@gmail.com")}
                >
                  <Copy className="w-4 h-4 text-pink4000 hover:text-pink3000" />
                </IconButton>
              </div>

              <div className="flex items-center justify-between mb-4">
                <span className="text-pink4000 text-sm">
                  Telefone: <br />
                  (73) 98873-1234
                </span>
                <IconButton onClick={() => copyToClipboard("(73) 98873-1234")}>
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
              <h2 className="text-xl font-bold mb-10 text-pink4000 text-center">
                Sair da Conta
              </h2>
              <div className="flex items-center justify-between mb-2">
                <span className="text-pink4000 text-sm">
                  Deseja mesmo sair?
                </span>
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
                    onClick={handleLogout}
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
  );
}
