'use client'

import React from "react"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // Mock login - in real app, validate credentials
    if (username && password) {
      router.push('/dashboard')
    }
  }

  return (
    <div className="relative min-h-screen">
      {/* Background image */}
      <Image
        src="/agrilogo.png"
        alt="Agriculture background"
        fill
        priority
        className="z-0 object-cover"
      />

      {/* Left-side tint/blur overlay for readability */}
      <div className="pointer-events-none absolute inset-0 z-[1] md:bg-gradient-to-r md:from-black/60 md:to-transparent backdrop-blur-[10px]" />

      {/* Content grid: left hero, right login */}
      <div className="relative z-10 grid min-h-screen grid-cols-1 md:grid-cols-2">
        {/* Left hero content */}
        <div className="flex items-center pl-6 pr-2 py-10 md:pl-12 md:pr-4">
          <div className="max-w-lg text-white ml-2 md:ml-4">
            
            <h1 className="text-3xl font-bold md:text-4xl">Welcome to the Olongapo City Agriculture Registry</h1>
            <p className="mt-3 text-sm md:text-base text-white/80">
              Manage registrations, records, and analytics across the department.
            </p>

            <div className="mt-6 space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="mt-0.5 h-5 w-5 text-emerald-400" />
                <span className="text-sm md:text-base">Streamlined Farmer and Fisherfolk registration and verification</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="mt-0.5 h-5 w-5 text-emerald-400" />
                <span className="text-sm md:text-base">Real-time records and updates</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="mt-0.5 h-5 w-5 text-emerald-400" />
                <span className="text-sm md:text-base">Insights and dashboards for monitoring</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right login card */}
        <div className="flex items-center justify-end pl-2 pr-4 md:pl-14 md:pr-26">
          <Card className="w-full max-w-md mr-14 md:mr-26 border border-border shadow-lg">
            <div className="space-y-6 p-8">
              {/* Header */}
              <div className="space-y-3 text-center">
                <div className="flex justify-center">
                  <div className="h-16 w-16 overflow-hidden rounded-full ring-2 ring-primary/20">
                    <Image
                      src="/agrilogo.png"
                      alt="Olongapo City Agriculture Department logo"
                      width={64}
                      height={64}
                      className="h-full w-full object-contain"
                      priority
                    />
                  </div>
                </div>
                <h1 className="text-2xl font-bold text-foreground">
                  Olongapo Agriculture Office
                </h1>
                <p className="text-sm text-muted-foreground">
                  Registry & Records Management System
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Username</label>
                  <Input
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="border-border bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Password</label>
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border-border bg-background"
                  />
                </div>

                {/* Forgot Password */}
                <div className="text-right">
                  <Link
                    href="#"
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    Forgot Password?
                  </Link>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  size="lg"
                >
                  Login
                </Button>
              </form>

              {/* Footer */}
              <div className="border-t border-border pt-6 text-center">
                <p className="text-xs text-muted-foreground">
                  © 2026 Olongapo City Agriculture Office. All rights reserved.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
