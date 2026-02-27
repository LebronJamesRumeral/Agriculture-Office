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
        className={`relative transition-[margin] duration-300 ease-in-out ${
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
            className="max-w-[75vw] opacity-10 select-none"
          />
        </div>
        <main className="relative z-10 min-h-[calc(100vh-4rem)]">{children}</main>
      </div>
    </ThemeProvider>
  )
}
