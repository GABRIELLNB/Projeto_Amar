import React, { useState, useEffect } from 'react'
import { Heart, ThumbsUp } from 'lucide-react'
import { Button } from './button'

export function BotaoGostei() {
  const [gostei, setGostei] = useState(false)
  const [animando, setAnimando] = useState(false)

  useEffect(() => {
    if (animando) {
      const timer = setTimeout(() => setAnimando(false), 700)
      return () => clearTimeout(timer)
    }
  }, [animando])

  const handleClick = () => {
    if (!gostei) {
      setGostei(true)
      setAnimando(true)
    } else {
      setGostei(false)
    }
  }

  return (
    <>
      <Button
        onClick={handleClick}
        aria-label={gostei ? 'Desfazer gostei' : 'Gostei'}
        className={'relative text-pink2000 cursor-pointer bg-transparent border-none outline-none p-0'}
      >
        <Heart
          size={30}
          fill={gostei ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth={2}
          className={`transition-colors duration-300 ${
            gostei ? 'text-red' : 'text-pink2000'
          }`}
        />

        {/* Círculos animados */}
        {animando && (
          <>
            <span className="burst burst-1">

            </span>
            <span className="burst burst-2">

            </span>
            <span className="burst burst-3">
                
            </span>
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
          background-color: #db2777; /* pink-600 */
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
