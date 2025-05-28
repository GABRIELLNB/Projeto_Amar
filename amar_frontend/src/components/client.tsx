'use client'

import { usePathname } from 'next/navigation'

export function BodyWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const backgroundClass =
    pathname === '/' || pathname === '/cadastro'
      ? 'bg-[url(/PINK3.png)]'
      : 'bg-pink1000'

  return (
    <body className={`${backgroundClass} bg-no-repeat bg-cover bg-fixed`}>
      {children}
    </body>
  )
}
