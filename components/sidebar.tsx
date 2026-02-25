'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import Image from 'next/image'
import { LayoutDashboard, FileText, Settings, Menu, X, CalendarCheck, LogOut } from 'lucide-react'
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

export function Sidebar({ collapsed }: { collapsed: boolean }) {
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
        className={`fixed left-0 top-0 z-30 flex h-screen ${
          collapsed ? 'w-20' : 'w-64'
        } flex-col bg-background text-foreground transition-all duration-300 ease-in-out md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo Area */}
        <div
          className={`border-b border-border h-16 flex items-center transition-[padding] duration-300 ease-in-out ${
            collapsed ? 'px-4 justify-center' : 'px-6'
          }`}
        >
          <div className={`flex items-center ${collapsed ? '' : 'gap-2'}`}>
            <Image
              src="/agrilogo.png"
              alt="Olongapo City Agriculture Office logo"
              width={32}
              height={32}
              className="h-8 w-8 object-contain"
              priority
            />
            {!collapsed && (
              <div className="flex-1">
                <h1 className="text-lg font-bold text-foreground">Olongapo</h1>
                <p className="text-xs text-muted-foreground">Agriculture Office</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <nav
          className={`flex-1 space-y-2 py-6 transition-[padding] duration-300 ease-in-out ${
            collapsed ? 'px-2' : 'px-4'
          }`}
        >
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname.startsWith(item.href)

            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? 'default' : 'ghost'}
                  className={`w-full ${collapsed ? 'justify-center' : 'justify-start gap-2'}`}
                  onClick={() => {
                    // Close sidebar on mobile after navigation
                    if (window.innerWidth < 768) {
                      setOpen(false)
                    }
                  }}
                >
                  <Icon className="h-5 w-5" />
                  {!collapsed && <span>{item.label}</span>}
                </Button>
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div
          className={`border-t border-border py-4 space-y-3 transition-[padding] duration-300 ease-in-out ${
            collapsed ? 'px-2' : 'px-4'
          }`}
        >
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button className={`w-full ${collapsed ? 'justify-center' : ''}`} variant="destructive">
                <LogOut className="h-4 w-4" />
                {!collapsed && <span className="ml-2">Sign Out</span>}
              </Button>
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

          {!collapsed && (
            <p className="text-xs text-muted-foreground text-center">© 2026 Olongapo City</p>
          )}
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
