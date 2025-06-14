'use client';
import CadastroPessoa from '@/components/pessoa-cadastro'
import React from 'react';


export default function ProfissionalEditar({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const id = resolvedParams.id;

  async function handleSubmit(data: any) {
    // Exemplo: redirecionar após submit
    // router.push('/profissionais');
  }

  return (
    <CadastroPessoa
      type="estagiario"
      editarCpf={id}
      onSubmit={handleSubmit}
    />
  );
}


