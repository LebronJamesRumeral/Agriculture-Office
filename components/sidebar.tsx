'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import Image from 'next/image'
import { 
  LayoutDashboard, 
  FileText, 
  Settings, 
  Menu, 
  X, 
  CalendarCheck, 
  LogOut,
  Users,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { useState, useEffect } from 'react'
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
import { cn } from '@/lib/utils'

const navItems = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    description: 'Overview and statistics'
  },
  {
    href: '/registration',
    label: 'Registration',
    icon: FileText,
    description: 'Register new farmers'
  },
  {
    href: '/records',
    label: 'Records',
    icon: Users,
    description: 'Manage farmer records'
  },
  {
    href: '/events',
    label: 'Events',
    icon: CalendarCheck,
    description: 'Events and attendance'
  },
  {
    href: '/settings',
    label: 'Settings',
    icon: Settings,
    description: 'System preferences'
  },
]

export function Sidebar({ collapsed, setCollapsed }: { 
  collapsed: boolean, 
  setCollapsed: (collapsed: boolean) => void 
}) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSignOut = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user')
      router.push('/')
    }
  }

  const closeMobileSidebar = () => {
    setMobileOpen(false)
  }

  if (!mounted) return null

  return (
    <>
      {/* Mobile Header */}
      <div className="fixed left-0 right-0 top-0 z-40 flex h-16 items-center gap-2 border-b border-border/50 bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="shrink-0"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <Image
            src="/agrilogo.png"
            alt="Olongapo City Agriculture Office"
            width={32}
            height={32}
            className="h-8 w-8 object-contain"
          />
          <div>
            <h1 className="text-sm font-semibold">Olongapo City</h1>
            <p className="text-xs text-muted-foreground">Agriculture Office</p>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 md:hidden"
          onClick={closeMobileSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-border/50 bg-gradient-to-b from-background via-background to-muted/30 backdrop-blur supports-[backdrop-filter]:bg-background/60",
          "transition-all duration-300 ease-in-out",
          collapsed ? "w-20" : "w-64", // Changed from w-72 to w-64 to match AppLayout
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Logo Area with Collapse Toggle */}
        <div className={cn(
          "relative flex h-20 items-center border-b border-border/50",
          collapsed ? "justify-center px-3" : "justify-between px-4" // Reduced padding
        )}>
          <div className={cn(
            "flex items-center overflow-hidden transition-all duration-300",
            collapsed ? "w-10 justify-center" : "w-40" // Reduced from w-48
          )}>
            <div className="flex shrink-0 items-center gap-2"> {/* Reduced gap */}
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 p-2">
                <Image
                  src="/agrilogo.png"
                  alt="Logo"
                  width={40}
                  height={40}
                  className="h-full w-full object-contain"
                />
              </div>
              {!collapsed && (
                <div className="flex-1 overflow-hidden">
                  <h1 className="truncate text-base font-bold text-foreground">Olongapo</h1> {/* Smaller text */}
                  <p className="truncate text-[10px] text-muted-foreground">Agriculture</p> {/* Smaller text */}
                </div>
              )}
            </div>
          </div>

          {/* Collapse Toggle (Desktop only) */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="hidden h-6 w-6 shrink-0 rounded-md border border-border/50 bg-background/50 hover:bg-background md:inline-flex" // Smaller button
          >
            {collapsed ? (
              <ChevronRight className="h-3.5 w-3.5" />
            ) : (
              <ChevronLeft className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1 overflow-y-auto py-6 scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
          <div className={cn("space-y-1", collapsed ? "px-2" : "px-3")}>
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

              return (
                <Link key={item.href} href={item.href} onClick={closeMobileSidebar}>
                  <div
                    className={cn(
                      "group relative flex cursor-pointer items-center rounded-xl transition-all duration-200",
                      collapsed ? "justify-center px-2 py-2" : "gap-2 px-3 py-2", // Reduced gap
                      isActive 
                        ? "bg-gradient-to-r from-primary/10 to-primary/5 text-primary shadow-sm" 
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    )}
                  >
                    {/* Active Indicator */}
                    {isActive && (
                      <div className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
                    )}
                    
                    {/* Icon */}
                    <div className={cn(
                      "relative shrink-0",
                      isActive && "text-primary"
                    )}>
                      <Icon className="h-5 w-5" />
                      {isActive && (
                        <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-primary" />
                      )}
                    </div>

                    {/* Label and Description */}
                    {!collapsed && (
                      <div className="flex-1 overflow-hidden">
                        <p className={cn(
                          "truncate text-xs font-medium", // Smaller text
                          isActive ? "text-primary" : "text-foreground"
                        )}>
                          {item.label}
                        </p>
                        <p className="truncate text-[10px] text-muted-foreground"> {/* Smaller text */}
                          {item.description}
                        </p>
                      </div>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className={cn(
          "border-t border-border/50 bg-gradient-to-t from-muted/20 to-transparent py-4",
          collapsed ? "px-2" : "px-3" // Reduced padding
        )}>
          <div className="space-y-3">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="ghost" 
                  className={cn(
                    "w-full justify-start gap-2 rounded-xl border border-border/50 hover:border-destructive/20 hover:bg-destructive/5 hover:text-destructive",
                    collapsed ? "justify-center px-0" : "px-2" // Reduced padding
                  )}
                >
                  <LogOut className="h-4 w-4 shrink-0" />
                  {!collapsed && <span className="text-xs">Sign Out</span>} {/* Smaller text */}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="sm:max-w-[400px]">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-lg">Sign out?</AlertDialogTitle>
                  <AlertDialogDescription className="text-sm">
                    Are you sure you want to sign out of your account?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-2 sm:gap-0">
                  <AlertDialogCancel className="text-sm">Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleSignOut} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-sm">
                    Yes, sign out
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {!collapsed && (
              <div className="space-y-1">
                <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                <p className="text-center text-[10px] text-muted-foreground">
                  © 2026 Olongapo City
                </p>
                <p className="text-center text-[8px] text-muted-foreground/60">
                  Agriculture Office v1.0
                </p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Spacer - Matches AppLayout margins */}
      <div className={cn(
        "hidden transition-all duration-300 md:block",
        collapsed ? "md:ml-20" : "md:ml-64"
      )} />
    </>
  )
}