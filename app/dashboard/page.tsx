'use client'

import { AppLayout } from '@/components/app-layout'
import { Card } from '@/components/ui/card'
import { mockAnalytics, mockNotifications } from '@/lib/mock-data'
import { Users, Fish, TrendingUp, AlertCircle, UserCheck, UserX } from 'lucide-react'
import { AnalyticsChart } from '@/components/analytics-chart'
import { NotificationsPanel } from '@/components/notifications-panel'

type NotificationItem = {
  id: number
  message: string
  timestamp: string
  type: 'info' | 'warning' | 'success'
}

const normalizedNotifications: NotificationItem[] = mockNotifications.map((n) => ({
  ...n,
  type: n.type as 'info' | 'warning' | 'success',
}))

export default function DashboardPage() {
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
                  {mockAnalytics.totalRegistered.toLocaleString()}
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
                  {mockAnalytics.activeMembers.toLocaleString()}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {mockAnalytics.percentageActive.toFixed(1)}%
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
                  {mockAnalytics.inactiveMembers.toLocaleString()}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {mockAnalytics.percentageInactive.toFixed(1)}%
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
                  {mockAnalytics.totalFarmers.toLocaleString()}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {mockAnalytics.percentageFarmers.toFixed(1)}%
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
                  {mockAnalytics.totalFisherfolks.toLocaleString()}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {mockAnalytics.percentageFisherfolks.toFixed(1)}%
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
                <p className="mt-2 text-3xl font-bold text-foreground">5</p>
                <p className="mt-1 text-xs text-muted-foreground">Waiting approval</p>
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
            <h2 className="mb-4 text-lg font-semibold text-foreground">Notifications</h2>
            <NotificationsPanel notifications={normalizedNotifications} />
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}
