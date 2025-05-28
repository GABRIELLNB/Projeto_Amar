'use client'

import CadastroPessoa from '@/components/pessoa-cadastro'

export default function Estagiario() {
  const handleCadastro = (dados: any) => {
    console.log('Dados recebidos:', dados)
    // Aqui envia pra API, salva ou exibe confirmação
  }

  return (
    <div className="p-6 space-y-10">
    
      <CadastroPessoa type="estagiario" onSubmit={handleCadastro} />
    </div>
  )
}
