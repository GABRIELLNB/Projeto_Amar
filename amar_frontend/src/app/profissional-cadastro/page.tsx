'use client'

import CadastroPessoa from '@/components/pessoa-cadastro'

export default function Profissional() {
  const handleCadastro = (dados: any) => {
    console.log('Dados recebidos:', dados)
    // Aqui envia pra API, salva ou exibe confirmação
  }

  return (
    <div className="p-6 space-y-10">
      <CadastroPessoa type="profissional" onSubmit={handleCadastro} />
    </div>
  )
}
