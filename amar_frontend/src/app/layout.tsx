import '@/app/globals.css'

import type { Metadata } from 'next'
import { Montserrat, Oxanium } from 'next/font/google'
import { BodyWrapper } from '@/components/client'
import { UserProvider } from "@/contexts/userContext";

export const metadata: Metadata = {
  title: 'A.M.A.R',
  description: '',
}

const oxanium = Oxanium({
  weight: ['500', '600'],
  subsets: ['latin'],
  variable: '--font-oxanium',
})

const montserrat = Montserrat({
  weight: ['400', '600'],
  subsets: ['latin'],
  variable: '--font-montserrat',
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${oxanium.variable} ${montserrat.variable}`}>
      <head>
        <link rel="icon" href="/favicon2/favicon.ico" />
        <link rel="apple-touch-icon" href="/favicon2/apple-touch-icon.png" />
        <link rel="manifest" href="/favicon2/site.webmanifest" />
        <link rel="icon" type="image/svg+xml" href="/favicon2/favicon.svg" />
      </head>

  
        <UserProvider>
          <BodyWrapper>
            <main className="px-5 py-8 md:py-0">{children}</main>
          </BodyWrapper>
        </UserProvider>
  
      
    </html>
  )
}
