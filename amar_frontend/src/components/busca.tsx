import { InputField, InputRoot } from '@/components/input'
import { Search } from 'lucide-react'
import { Button } from './button'
import { cn } from '@/lib/utils' // ou 'clsx'

interface BuscaPorNomeProps {
  valor: string
  aoAlterar: (valor: string) => void
  placeholder?: string
  className?: string
}

export function BuscaPorNome({
  valor,
  aoAlterar,
  placeholder,
  className,
}: BuscaPorNomeProps) {
  return (
    <div className="flex flex-col rounded-sm">
      <InputRoot
        className={cn(
          'group bg-pink1000 h-10 border w-58 border-pink2000 rounded-sm px-4 flex items-center gap-2 focus-within:border-pink4000 data-[error=true]:border-red-700',
          className
        )}
      >
        <InputField
          id="busca-nome"
          placeholder={placeholder || 'Busca:'}
          value={valor}
          onChange={e => aoAlterar(e.target.value)}
        />
        <Button className="ml-[-95] bg-pink1000 text-pink2000 p-2 rounded-2xl hover:bg-pink1000 transition-colors duration-300 hover:text-pink4000">
          <Search className="w-5 h-5 cursor-pointer" />
        </Button>
      </InputRoot>
    </div>
  )
}
