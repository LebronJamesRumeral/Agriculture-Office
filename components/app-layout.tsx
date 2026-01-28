'use client'

import React from "react"

import { Sidebar } from '@/components/sidebar'
import { TopNav } from '@/components/top-nav'
import { ThemeProvider } from 'next-themes'

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <Sidebar />
      <div className="md:ml-64 relative">
        <TopNav />
        {/* Global background watermark for all pages */}
        <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <img
            src="/olongapo.png"
            alt="Background watermark"
            className="max-w-[75vw] opacity-10 select-none"
          />
        </div>
        <main className="relative z-10 min-h-[calc(100vh-4rem)]">{children}</main>
      </div>
    </ThemeProvider>
  )
}
