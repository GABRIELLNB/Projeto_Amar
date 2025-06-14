import React, { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { Button } from './button'


export function BotaoGostei({
  forumId,
  inicialmenteGostei = false,
  inicialmenteQuantidade = 0,
  onCurtirChange, // callback opcional
}: {
  forumId?: number;
  inicialmenteGostei?: boolean;
  inicialmenteQuantidade?: number;
  onCurtirChange?: (novoGostei: boolean, novaQuantidade: number) => void;
}) {
  const [gostei, setGostei] = useState(inicialmenteGostei);
  const [quantidade, setQuantidade] = useState(inicialmenteQuantidade);
  const [loading, setLoading] = useState(false);
  const [animando, setAnimando] = useState(false);
  const token = localStorage.getItem("token");

  // caso o mesmo componente seja reciclado para outro fórum
  useEffect(() => {
    setGostei(inicialmenteGostei);
    setQuantidade(inicialmenteQuantidade);
  }, [inicialmenteGostei, inicialmenteQuantidade]);


  const handleClick = async () => {
    if (loading) return;
    setLoading(true);

    const proximoEstado = !gostei;
    const url = `http://localhost:8000/api/forum/${forumId}/${proximoEstado ? "curtir" : "descurtir"}/`;

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        alert("Erro ao curtir/descurtir");
        return;
      }

      const novaQuantidade = proximoEstado ? quantidade + 1 : Math.max(0, quantidade - 1);
      setGostei(proximoEstado);
      setQuantidade(novaQuantidade);

      onCurtirChange?.(proximoEstado, novaQuantidade); // AVISA O PAI

      if (proximoEstado) {
        setAnimando(true);
        setTimeout(() => setAnimando(false), 700);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={handleClick}
        aria-label={gostei ? "Desfazer gostei" : "Gostei"}
        disabled={loading}
        className="relative flex items-center gap-1 bg-transparent p-0"
      >
        <Heart
          size={28}
          fill={gostei ? "currentColor" : "none"}
          stroke="currentColor"
          className={` cursor-pointer transition-colors duration-300 ${gostei ? "text-red-500" : "text-pink2000"}`}
        />
        <span>{quantidade}</span>

        {animando && (
          <>
            <span className="burst burst-1" />
            <span className="burst burst-2" />
            <span className="burst burst-3" />
          </>
        )}
      </Button>

      <style jsx>{`
        button {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .burst {
          position: absolute;
          border-radius: 50%;
          background-color: #db2777;
          opacity: 0.7;
          pointer-events: none;
          animation: burstAnim 500ms ease forwards;
        }
        .burst-1 {
          width: 12px;
          height: 12px;
          top: 50%;
          left: 50%;
          margin: -6px 0 0 -6px;
          animation-delay: 0ms;
        }
        .burst-2 {
          width: 18px;
          height: 18px;
          top: 50%;
          left: 50%;
          margin: -9px 0 0 -9px;
          animation-delay: 100ms;
        }
        .burst-3 {
          width: 24px;
          height: 24px;
          top: 50%;
          left: 50%;
          margin: -12px 0 0 -12px;
          animation-delay: 250ms;
        }
        @keyframes burstAnim {
          0% {
            transform: scale(0.5);
            opacity: 0.7;
          }
          100% {
            transform: scale(3);
            opacity: 0;
          }
        }
      `}</style>
    </>
  )
}
