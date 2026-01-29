'use client'

import { AppLayout } from '@/components/app-layout'
import { Card } from '@/components/ui/card'
import { Users, Fish, TrendingUp, AlertCircle, UserCheck, UserX } from 'lucide-react'
import { AnalyticsChart } from '@/components/analytics-chart'
import { NotificationsPanel } from '@/components/notifications-panel'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type NotificationItem = {
  id: number
  message: string
  timestamp: string
  type: 'info' | 'warning' | 'success'
}

type DashboardStats = {
  totalRegistered: number
  activeMembers: number
  inactiveMembers: number
  totalFarmers: number
  totalFisherfolks: number
  percentageActive: number
  percentageInactive: number
  percentageFarmers: number
  percentageFisherfolks: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalRegistered: 0,
    activeMembers: 0,
    inactiveMembers: 0,
    totalFarmers: 0,
    totalFisherfolks: 0,
    percentageActive: 0,
    percentageInactive: 0,
    percentageFarmers: 0,
    percentageFisherfolks: 0,
  })
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        if (!supabase) {
          setLoading(false);
          return;
        }
        // Fetch all farmers
        const { data: farmers, error } = await supabase
          .from('farmers')
          .select('*')

        if (error) throw error

        const totalRegistered = farmers?.length || 0
        const activeMembers = farmers?.filter(f => f.status === 'active').length || 0
        const inactiveMembers = totalRegistered - activeMembers
        const totalFarmers = farmers?.filter(f => f.farmer_type === 'farmer').length || 0
        const totalFisherfolks = farmers?.filter(f => f.farmer_type === 'fisherfolk').length || 0

        setStats({
          totalRegistered,
          activeMembers,
          inactiveMembers,
          totalFarmers,
          totalFisherfolks,
          percentageActive: totalRegistered > 0 ? (activeMembers / totalRegistered) * 100 : 0,
          percentageInactive: totalRegistered > 0 ? (inactiveMembers / totalRegistered) * 100 : 0,
          percentageFarmers: totalRegistered > 0 ? (totalFarmers / totalRegistered) * 100 : 0,
          percentageFisherfolks: totalRegistered > 0 ? (totalFisherfolks / totalRegistered) * 100 : 0,
        })

        // Generate notifications from recent registrations
        const recentFarmers = farmers?.slice(0, 5) || []
        const recentNotifications: NotificationItem[] = recentFarmers.map((farmer, idx) => ({
          id: idx + 1,
          message: `New registration: ${farmer.full_name} (${farmer.farmer_type})`,
          timestamp: new Date(farmer.created_at).toLocaleDateString(),
          type: 'success' as const,
        }))

        setNotifications(recentNotifications)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-screen">
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="relative space-y-6 p-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to the Olongapo Agriculture Registry Management System
          </p>
        </div>

        {/* Metrics Cards */}
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
          {/* Total Registered */}
          <Card className="border border-border bg-card p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Registered</p>
                <p className="mt-2 text-3xl font-bold text-foreground">
                  {stats.totalRegistered.toLocaleString()}
                </p>
              </div>
              <div className="rounded-lg bg-primary/10 p-3">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
            </div>
          </Card>

          {/* Active Members */}
          <Card className="border border-border bg-card p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Members</p>
                <p className="mt-2 text-3xl font-bold text-foreground">
                  {stats.activeMembers.toLocaleString()}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {stats.percentageActive.toFixed(1)}%
                </p>
              </div>
              <div className="rounded-lg bg-green-500/10 p-3">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </Card>

          {/* Inactive Members */}
          <Card className="border border-border bg-card p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Inactive Members</p>
                <p className="mt-2 text-3xl font-bold text-foreground">
                  {stats.inactiveMembers.toLocaleString()}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {stats.percentageInactive.toFixed(1)}%
                </p>
              </div>
              <div className="rounded-lg bg-slate-500/10 p-3">
                <UserX className="h-6 w-6 text-slate-600" />
              </div>
            </div>
          </Card>

          {/* Total Farmers */}
          <Card className="border border-border bg-card p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Farmers</p>
                <p className="mt-2 text-3xl font-bold text-foreground">
                  {stats.totalFarmers.toLocaleString()}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {stats.percentageFarmers.toFixed(1)}%
                </p>
              </div>
              <div className="rounded-lg bg-accent/10 p-3">
                <Users className="h-6 w-6 text-accent" />
              </div>
            </div>
          </Card>

          {/* Total Fisherfolks */}
          <Card className="border border-border bg-card p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Fisherfolks</p>
                <p className="mt-2 text-3xl font-bold text-foreground">
                  {stats.totalFisherfolks.toLocaleString()}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {stats.percentageFisherfolks.toFixed(1)}%
                </p>
              </div>
              <div className="rounded-lg bg-blue-500/10 p-3">
                <Fish className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </Card>

          {/* Pending Review */}
          <Card className="border border-border bg-card p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Review</p>
                <p className="mt-2 text-3xl font-bold text-foreground">0</p>
                <p className="mt-1 text-xs text-muted-foreground">All reviewed</p>
              </div>
              <div className="rounded-lg bg-amber-500/10 p-3">
                <AlertCircle className="h-6 w-6 text-amber-500" />
              </div>
            </div>
          </Card>
        </div>

        {/* Chart and Notifications */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Analytics Chart */}
          <div className="lg:col-span-2">
            <Card className="border border-border bg-card p-6">
              <h2 className="mb-6 text-lg font-semibold text-foreground">
                Registration Overview
              </h2>
              <AnalyticsChart />
            </Card>
          </div>

          {/* Notifications */}
          <Card className="border border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground">Recent Activity</h2>
            <NotificationsPanel notifications={notifications} />
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}
