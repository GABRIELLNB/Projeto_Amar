"use client";

import CadastroPessoa from "@/components/pessoa-cadastro";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProfissionalCadastro() {
  const { id } = useParams();
  const [formData, setFormData] = useState({ nome: "", email: "", cpf: "" });

  useEffect(() => {
    if (id) {
      fetch(`http://localhost:8000/api/profissionais/${id}`)
        .then((res) => res.json())
        .then((data) => setFormData({ nome: data.nome, email: data.email, cpf: data.cpf }));
    }
  }, [id]);

  async function handleSubmit(data) {
    const method = id ? "PUT" : "POST";
    const url = id
      ? `http://localhost:8000/api/profissionais/${id}/`
      : "http://localhost:8000/api/profissionais/";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    alert(id ? "Atualizado com sucesso!" : "Criado com sucesso!");
  }

  return (
    <div className="p-6 space-y-10">
      <CadastroPessoa
        type="profissional"
        initialData={formData}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
