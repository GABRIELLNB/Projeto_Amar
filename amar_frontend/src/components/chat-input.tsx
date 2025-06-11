import { InputField, InputIcon, InputRoot } from '@/components/input'
import EmojiPicker, { type EmojiClickData } from 'emoji-picker-react'
import { ThumbsUp, Send, Smile } from 'lucide-react'
import { useRef, useState, useEffect } from 'react'
import { Button } from './button'
import { BotaoGostei } from './gostei'


function useClickOutside<T extends HTMLElement | null>(ref: React.RefObject<T>, handler: () => void) {
  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (ref.current && ref.current instanceof HTMLElement && !ref.current.contains(event.target as Node)) {
        handler()
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => {
      document.removeEventListener('mousedown', onClick)
    }
  }, [ref, handler])
}

export function ChatInput({
  forumId,
  inicialmenteGostei = false,
  inicialmenteQuantidade = 0,
  onCurtirChange,
  onNovaMensagem,
}: {
  forumId: number;
  inicialmenteGostei: boolean;
  inicialmenteQuantidade: number;
  onCurtirChange: (gostei: boolean, quantidade: number) => void;
  onNovaMensagem: (msg: MessageType) => void;
}) {
  const [mensagem, setMensagem] = useState('');
  const [mostrarEmoji, setMostrarEmoji] = useState(false);
  const emojiRef = useRef<HTMLDivElement>(null);

  useClickOutside(emojiRef, () => setMostrarEmoji(false));

  const enviarMensagem = async () => {
    if (mensagem.trim() === '') return;
    const token = localStorage.getItem("token");
    try {
      const response = await fetch('http://127.0.0.1:8000/api/mensagem-forum/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          forum: forumId,
          mensagem: mensagem,
        }),
      });

      if (!response.ok) {
        const erro = await response.json();
        throw new Error(erro.detail || 'Erro ao enviar mensagem');
      }

      const data = await response.json();
      setMensagem('');
      onNovaMensagem(data);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    }
  };

  function adicionarEmoji(emojiData: EmojiClickData, event: MouseEvent) {
    setMensagem(prev => prev + emojiData.emoji);
  }

  return (
    <div className="border-t px-4 py-3 flex items-center gap-2 border border-pink1000 bg-pink1000 fixed bottom-0 left-[350px] right-0 z-50">
<BotaoGostei
        forumId={forumId}
        inicialmenteGostei={inicialmenteGostei}
        inicialmenteQuantidade={inicialmenteQuantidade}
        onCurtirChange={onCurtirChange}
      />

      <div className="relative w-full">
        <InputRoot className="group bg-pink3000 h-12 border border-pink2000 w-full rounded-xl px-4 flex items-center gap-2 focus-within:border-pink4000 data-[error=true]:border-red-700">
          <InputIcon className="text-pink2000 group-focus-within:text-pink4000">
            <Button
              type="button"
              onClick={() => setMostrarEmoji(!mostrarEmoji)}
              className={`flex items-center justify-center p-1 focus:outline-none cursor-pointer transition-colors ${
                mostrarEmoji ? 'text-pink4000' : 'text-pink2000 hover:text-pink4000'
              }`}
            >
              <Smile size={24} />
            </Button>
          </InputIcon>

          <InputField
            className="flex-1 outline-0 text-pink4000"
            placeholder="Digite uma mensagem"
            value={mensagem}
            onChange={e => setMensagem(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && enviarMensagem()}
          />
        </InputRoot>

        {mostrarEmoji && (
          <div ref={emojiRef} className="absolute bottom-14 left-0 z-50 justify-center">
            <EmojiPicker
              onEmojiClick={adicionarEmoji}
              lazyLoadEmojis
              searchDisabled
              height={350}
            />
          </div>
        )}
      </div>

      <Button
        onClick={enviarMensagem}
        className="bg-pink2000 hover:bg-pink4000 text-pink1000 p-2 rounded-full cursor-pointer"
      >
        <Send size={20} />
      </Button>
    </div>
  );
}
