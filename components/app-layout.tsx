'use client'

import React, { useState } from "react"

import { Sidebar } from '@/components/sidebar'
import { TopNav } from '@/components/top-nav'
import { ThemeProvider } from 'next-themes'

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <Sidebar collapsed={isSidebarCollapsed} />
      <div
        className={`relative min-h-screen transition-[margin] duration-300 ease-in-out ${
          isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'
        }`}
      >
        <TopNav
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed((prev) => !prev)}
        />
        {/* Global background watermark for all pages */}
        <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <img
            src="/olongapo.png"
            alt="Background watermark"
            className="max-w-[70vw] opacity-5 select-none"
          />
        </div>
        {/* Constrain content width for better readability on wide screens */}
        <main className="relative z-10 min-h-[calc(100vh-4rem)] px-4 pb-10 pt-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-[1400px]">{children}</div>
        </main>
      </div>
    </ThemeProvider>
  )
}
