import { InputField, InputRoot } from '@/components/input'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'

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
    <div className="w-full">
      <InputRoot
        className={cn(
          'relative bg-pink1000 h-10 border border-pink2000 rounded-sm px-4 flex items-center gap-2 focus-within:border-pink4000',
          className
        )}
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-pink2000 w-5 h-5 pointer-events-none" />
        <InputField
          type="text"
          placeholder={placeholder || 'Buscar...'}
          value={valor}
          onChange={(e) => aoAlterar(e.target.value)}
          className="pl-10 w-full bg-transparent text-pink2000 placeholder:text-pink2000 focus:outline-none"
        />
      </InputRoot>
    </div>
  )
}
