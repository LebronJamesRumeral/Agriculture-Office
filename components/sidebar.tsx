'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import Image from 'next/image'
import { LayoutDashboard, FileText, Settings, Menu, X, CalendarCheck } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog'

const navItems = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    href: '/registration',
    label: 'Registration',
    icon: FileText,
  },
  {
    href: '/records',
    label: 'Records',
    icon: FileText,
  },
  {
    href: '/events',
    label: 'Events and Attendance',
    icon: CalendarCheck,
  },
  {
    href: '/settings',
    label: 'Settings',
    icon: Settings,
  },
]

export function Sidebar() {
  const [open, setOpen] = useState(true)
  const pathname = usePathname()
  const router = useRouter()

  return (
    <>
      {/* Mobile Toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(!open)}
        className="fixed left-4 top-4 z-40 md:hidden"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-30 flex h-screen w-64 flex-col bg-amber-50 text-black transition-transform duration-300 md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo Area */}
        <div className="border-b border-border h-16 px-6 flex items-center">
          <div className="flex items-center gap-2">
            <Image
              src="/agrilogo.png"
              alt="Olongapo City Agriculture Office logo"
              width={32}
              height={32}
              className="h-8 w-8 object-contain"
              priority
            />
            <div className="flex-1">
              <h1 className="text-lg font-bold text-black">Olongapo</h1>
              <p className="text-xs text-black/70">Agriculture Office</p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1.5 px-3 py-6">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname.startsWith(item.href)

            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? 'default' : 'ghost'}
                  className={`w-full justify-start gap-3 px-4 py-6 text-base font-medium transition-all duration-200 ${
                    isActive 
                      ? 'bg-green-700 text-white hover:bg-green-800 shadow-sm' 
                      : 'text-gray-700 hover:bg-green-200 hover:text-green-900 hover:shadow-md'
                  }`}
                  onClick={() => {
                    // Close sidebar on mobile after navigation
                    if (window.innerWidth < 768) {
                      setOpen(false)
                    }
                  }}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Button>
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-amber-200 px-4 py-4 space-y-3">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button className="w-full" variant="destructive">Sign Out</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Sign out?</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to sign out?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>No</AlertDialogCancel>
                <AlertDialogAction onClick={() => router.push('/')}>Yes</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <p className="text-xs text-black/60 text-center">© 2026 Olongapo City</p>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/50 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  )
}
