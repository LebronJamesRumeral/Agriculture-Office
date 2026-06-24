'use client'

import { useEffect, useState, useRef } from 'react'
import { AppLayout } from '@/components/app-layout'
import { Card } from '@/components/ui/card'
import { 
  Users, 
  Fish, 
  TrendingUp, 
  AlertCircle, 
  UserCheck, 
  UserX,
  Sprout,
  Droplets,
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import { AnalyticsChart } from '@/components/analytics-chart'
import { AssociationModal } from '@/components/association-modal'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'

type AnalyticsOverview = {
  total_registered: number
  active_members: number
  percentage_active: number
  inactive_members: number
  percentage_inactive: number
  total_farmers: number
  percentage_farmers: number
  total_fisherfolks: number
  percentage_fisherfolks: number
}

type MonthlyStats = {
  this_month: number
  last_month: number
  growth_rate: number
}

type AssociationStats = {
  name: string
  active: number
  inactive: number
  total: number
}

const defaultMetrics: AnalyticsOverview = {
  total_registered: 0,
  active_members: 0,
  percentage_active: 0,
  inactive_members: 0,
  percentage_inactive: 0,
  total_farmers: 0,
  percentage_farmers: 0,
  total_fisherfolks: 0,
  percentage_fisherfolks: 0,
}

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<AnalyticsOverview>(defaultMetrics)
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats>({
    this_month: 0,
    last_month: 0,
    growth_rate: 0
  })
  const [associations, setAssociations] = useState<AssociationStats[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAssociation, setSelectedAssociation] = useState<AssociationStats | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const isRefreshingRef = useRef(false)
  const itemsPerPage = 12

  const loadMetrics = async (isInitialLoad = false) => {
    if (isInitialLoad) setLoading(true)
    
    // Fetch main analytics
    const { data: analyticsData, error: analyticsError } = await supabase
      .from('analytics_overview')
      .select('*')
      .single()
    
    if (analyticsError || !analyticsData) {
      console.error('Failed to load analytics', analyticsError)
    } else {
      setMetrics(analyticsData as AnalyticsOverview)
    }

    // Fetch monthly registration stats
    const now = new Date()
    const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()
    const firstDayNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString()

    // Get this month's registrations
    const { count: thisMonthCount, error: thisMonthError } = await supabase
      .from('records')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', firstDayThisMonth)
      .lt('created_at', firstDayNextMonth)

    // Get last month's registrations
    const { count: lastMonthCount, error: lastMonthError } = await supabase
      .from('records')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', firstDayLastMonth)
      .lt('created_at', firstDayThisMonth)

    const safeThisMonthCount = thisMonthCount ?? 0
    const safeLastMonthCount = lastMonthCount ?? 0
    const growthRate = safeLastMonthCount > 0
      ? ((safeThisMonthCount - safeLastMonthCount) / safeLastMonthCount) * 100 
      : 0

    setMonthlyStats({
      this_month: safeThisMonthCount,
      last_month: safeLastMonthCount,
      growth_rate: growthRate
    })

    // Fetch records for association statistics
    const { data: recordsData, error: recordsError } = await supabase
      .from('records')
      .select('association, status')

    if (recordsError) {
      console.error('Failed to load records for associations', recordsError)
    } else if (recordsData) {
      const assocMap: Record<string, { active: number; inactive: number; total: number }> = {}
      
      recordsData.forEach(rec => {
        const rawName = rec.association?.trim() || ''
        const name = rawName === '' ? 'Unassociated' : rawName
        const status = rec.status?.toLowerCase().trim() || 'inactive'
        
        if (!assocMap[name]) {
          assocMap[name] = { active: 0, inactive: 0, total: 0 }
        }
        
        assocMap[name].total += 1
        if (status === 'active') {
          assocMap[name].active += 1
        } else {
          assocMap[name].inactive += 1
        }
      })

      const sortedAssoc: AssociationStats[] = Object.keys(assocMap)
        .map(name => ({
          name,
          active: assocMap[name].active,
          inactive: assocMap[name].inactive,
          total: assocMap[name].total
        }))
        .sort((a, b) => b.total - a.total || a.name.localeCompare(b.name))

      setAssociations(sortedAssoc)
      setCurrentPage(1)
    }

    if (isInitialLoad) setLoading(false)
  }

  const handleAssociationClick = (assoc: AssociationStats) => {
    setSelectedAssociation(assoc)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedAssociation(null)
  }

  const handleRefresh = () => {
    // Trigger a refresh of the metrics
    if (!isRefreshingRef.current) {
      isRefreshingRef.current = true
      void loadMetrics().finally(() => {
        isRefreshingRef.current = false
      })
    }
  }

  useEffect(() => {
    let mounted = true
    let refreshTimeout: number | undefined

    const triggerRefresh = () => {
      if (!mounted) return
      if (refreshTimeout) window.clearTimeout(refreshTimeout)
      refreshTimeout = window.setTimeout(() => {
        if (!mounted) return
        if (isRefreshingRef.current) return
        isRefreshingRef.current = true

        void loadMetrics().finally(() => {
          isRefreshingRef.current = false
        })
      }, 250)
    }

    void loadMetrics(true)

    const channel = supabase
      .channel('dashboard-monthly-records')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'records' },
        () => triggerRefresh()
      )
      .subscribe()

    return () => {
      mounted = false
      if (refreshTimeout) window.clearTimeout(refreshTimeout)
      supabase.removeChannel(channel)
    }
  }, [])

  // Calculate registration rate (percentage of total population)
  const registrationRate = 75 // This would come from a separate table with target population data

  // Pagination logic
  const totalPages = Math.ceil(associations.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedAssociations = associations.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const MetricSkeleton = () => (
    <div className="h-32 animate-pulse rounded-xl bg-muted/50" />
  )

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header with Date */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Dashboard
            </h1>
            <p className="text-sm text-muted-foreground md:text-base">
              Welcome back! Here's what's happening with your registry today.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-border/50 bg-card px-3 py-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-foreground">
              {new Date().toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric', 
                year: 'numeric' 
              })}
            </span>
          </div>
        </div>

        {/* Metrics Cards */}
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <MetricSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Total Registered */}
            <Card className="group relative overflow-hidden border border-border/50 bg-gradient-to-br from-background via-background to-muted/20 p-5 transition-all hover:shadow-md">
              <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-primary/5 transition-transform group-hover:scale-150" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Total Registered
                    </p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-3xl font-bold text-foreground">
                        {metrics.total_registered.toLocaleString()}
                      </p>
                      <span className={cn(
                        "flex items-center text-xs font-medium",
                        monthlyStats.growth_rate >= 0 ? "text-green-600" : "text-red-600"
                      )}>
                        {monthlyStats.growth_rate >= 0 ? 
                          <ArrowUpRight className="h-3 w-3" /> : 
                          <ArrowDownRight className="h-3 w-3" />
                        }
                        {Math.abs(monthlyStats.growth_rate).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 p-3 ring-2 ring-primary/10">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                  <span>vs last month</span>
                </div>
              </div>
            </Card>

            {/* Active Members */}
            <Card className="group relative overflow-hidden border border-border/50 bg-gradient-to-br from-background via-background to-muted/20 p-5 transition-all hover:shadow-md">
              <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-green-500/5 transition-transform group-hover:scale-150" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Active Members
                    </p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-3xl font-bold text-foreground">
                        {metrics.active_members.toLocaleString()}
                      </p>
                      <span className="text-xs font-medium text-green-600">
                        {metrics.percentage_active.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="rounded-xl bg-gradient-to-br from-green-500/20 to-green-500/5 p-3 ring-2 ring-green-500/10">
                    <UserCheck className="h-5 w-5 text-green-600" />
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-green-500" />
                    Active
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-slate-400" />
                    Inactive: {metrics.inactive_members}
                  </span>
                </div>
              </div>
            </Card>

            {/* Inactive Members */}
            <Card className="group relative overflow-hidden border border-border/50 bg-gradient-to-br from-background via-background to-muted/20 p-5 transition-all hover:shadow-md">
              <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-slate-500/5 transition-transform group-hover:scale-150" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Inactive Members
                    </p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-3xl font-bold text-foreground">
                        {metrics.inactive_members.toLocaleString()}
                      </p>
                      <span className="text-xs font-medium text-slate-600">
                        {metrics.percentage_inactive.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="rounded-xl bg-gradient-to-br from-slate-500/20 to-slate-500/5 p-3 ring-2 ring-slate-500/10">
                    <UserX className="h-5 w-5 text-slate-600" />
                  </div>
                </div>
              </div>
            </Card>

            {/* Total Farmers */}
            <Card className="group relative overflow-hidden border border-border/50 bg-gradient-to-br from-background via-background to-muted/20 p-5 transition-all hover:shadow-md">
              <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-accent/5 transition-transform group-hover:scale-150" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Total Farmers
                    </p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-3xl font-bold text-foreground">
                        {metrics.total_farmers.toLocaleString()}
                      </p>
                      <span className="text-xs font-medium text-accent">
                        {metrics.percentage_farmers.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="rounded-xl bg-gradient-to-br from-accent/20 to-accent/5 p-3 ring-2 ring-accent/10">
                    <Sprout className="h-5 w-5 text-accent" />
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
                  <Users className="h-3 w-3" />
                  <span>{metrics.total_farmers} registered farmers</span>
                </div>
              </div>
            </Card>

            {/* Total Fisherfolks */}
            <Card className="group relative overflow-hidden border border-border/50 bg-gradient-to-br from-background via-background to-muted/20 p-5 transition-all hover:shadow-md">
              <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-blue-500/5 transition-transform group-hover:scale-150" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Total Fisherfolks
                    </p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-3xl font-bold text-foreground">
                        {metrics.total_fisherfolks.toLocaleString()}
                      </p>
                      <span className="text-xs font-medium text-blue-600">
                        {metrics.percentage_fisherfolks.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 p-3 ring-2 ring-blue-500/10">
                    <Droplets className="h-5 w-5 text-blue-500" />
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
                  <Fish className="h-3 w-3" />
                  <span>{metrics.total_fisherfolks} registered fisherfolks</span>
                </div>
              </div>
            </Card>

          </div>
        )}

        {/* Charts Section */}
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Main Chart */}
          <Card className="lg:col-span-2 border border-border/50 bg-gradient-to-br from-background via-background to-muted/20 p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Registration Overview</h2>
                <p className="text-sm text-muted-foreground">Distribution of farmers and fisherfolks</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <span className="h-3 w-3 rounded-full bg-accent" />
                  <span className="text-xs text-muted-foreground">Farmers</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="h-3 w-3 rounded-full bg-blue-500" />
                  <span className="text-xs text-muted-foreground">Fisherfolks</span>
                </div>
              </div>
            </div>
            <AnalyticsChart
              data={[
                {
                  name: 'Farmers',
                  value: metrics.percentage_farmers,
                  count: metrics.total_farmers,
                },
                {
                  name: 'Fisherfolks',
                  value: metrics.percentage_fisherfolks,
                  count: metrics.total_fisherfolks,
                },
              ]}
            />
          </Card>

          {/* Quick Stats - Now connected to real data */}
          <Card className="border border-border/50 bg-gradient-to-br from-background via-background to-muted/20 p-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground">Quick Stats</h2>
            <div className="space-y-4">
              {/* Registration Rate - This would need a target population table */}
              <div className="rounded-lg bg-muted/30 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Registration Rate</span>
                  <span className={cn(
                    "text-sm font-medium",
                    monthlyStats.growth_rate >= 0 ? "text-green-600" : "text-red-600"
                  )}>
                    {monthlyStats.growth_rate >= 0 ? '+' : ''}{monthlyStats.growth_rate.toFixed(1)}%
                  </span>
                </div>
                <div className="mt-2 h-2 w-full rounded-full bg-muted">
                  <div 
                    className="h-2 rounded-full bg-primary transition-all duration-500" 
                    style={{ width: `${Math.min(Math.abs(monthlyStats.growth_rate), 100)}%` }}
                  />
                </div>
                <p className="mt-1 text-[10px] text-muted-foreground">Monthly growth rate</p>
              </div>
              
              {/* Active Ratio */}
              <div className="rounded-lg bg-muted/30 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Active Ratio</span>
                  <span className="text-sm font-medium text-foreground">
                    {metrics.percentage_active.toFixed(1)}%
                  </span>
                </div>
                <div className="mt-2 h-2 w-full rounded-full bg-muted">
                  <div 
                    className="h-2 rounded-full bg-green-500 transition-all duration-500" 
                    style={{ width: `${metrics.percentage_active}%` }}
                  />
                </div>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  {metrics.active_members} active out of {metrics.total_registered} total
                </p>
              </div>

              {/* Farmer/Fisherfolk Ratio */}
              <div className="rounded-lg bg-muted/30 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Farmer/Fisherfolk Ratio</span>
                  <span className="text-sm font-medium text-foreground">
                    {metrics.total_farmers}:{metrics.total_fisherfolks}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1">
                    <div className="flex h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div 
                        className="h-full bg-accent transition-all duration-500" 
                        style={{ width: `${metrics.percentage_farmers}%` }}
                      />
                      <div 
                        className="h-full bg-blue-500 transition-all duration-500" 
                        style={{ width: `${metrics.percentage_fisherfolks}%` }}
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
                  <span>Farmers: {metrics.total_farmers}</span>
                  <span>Fisherfolks: {metrics.total_fisherfolks}</span>
                </div>
              </div>

              {/* Monthly Registrations */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <div className="rounded-lg border border-border/50 p-3 text-center">
                  <p className="text-xs text-muted-foreground">This Month</p>
                  <p className="text-lg font-bold text-foreground">+{monthlyStats.this_month}</p>
                  <p className="text-[10px] text-muted-foreground">new registrations</p>
                </div>
                <div className="rounded-lg border border-border/50 p-3 text-center">
                  <p className="text-xs text-muted-foreground">Last Month</p>
                  <p className="text-lg font-bold text-foreground">+{monthlyStats.last_month}</p>
                  <p className="text-[10px] text-muted-foreground">new registrations</p>
                </div>
              </div>

              {/* Quick Summary */}
              <div className="rounded-lg bg-primary/5 p-3">
                <p className="text-xs text-muted-foreground">Average monthly growth</p>
                <p className="text-xl font-bold text-foreground">
                  {((monthlyStats.this_month + monthlyStats.last_month) / 2).toFixed(0)}
                </p>
                <p className="text-[10px] text-muted-foreground">registrations per month</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Association Overview */}
        <Card className="border border-border/50 bg-gradient-to-br from-background via-background to-muted/20 p-6">
          <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Association Overview</h2>
              <p className="text-sm text-muted-foreground">Active and inactive members per association</p>
            </div>
            <div className="flex gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-green-600">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                Active Members
              </span>
              <span className="flex items-center gap-1.5 text-slate-500">
                <span className="h-2 w-2 rounded-full bg-slate-400" />
                Inactive Members
              </span>
            </div>
          </div>
          
          {associations.length === 0 ? (
            <div className="flex h-32 flex-col items-center justify-center rounded-lg border border-dashed border-border/50 text-center">
              <AlertCircle className="h-8 w-8 text-muted-foreground/60 animate-pulse" />
              <p className="mt-2 text-sm text-muted-foreground">No association records found</p>
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {paginatedAssociations.map((assoc) => (
                <div 
                  key={assoc.name} 
                  className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-border/40 bg-card/50 p-4 transition-all hover:border-border/80 hover:shadow-sm cursor-pointer"
                  onClick={() => handleAssociationClick(assoc)}
                >
                  <div className="space-y-1">
                    <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors text-sm" title={assoc.name}>
                      {assoc.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {assoc.total} {assoc.total === 1 ? 'member' : 'members'}
                    </p>
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Status Distribution</span>
                      <span className="font-medium text-foreground">
                        {assoc.total > 0 ? Math.round((assoc.active / assoc.total) * 100) : 0}% Active
                      </span>
                    </div>
                    {/* Dual-color Progress Bar */}
                    <div className="flex h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-500" 
                        style={{ width: `${assoc.total > 0 ? (assoc.active / assoc.total) * 100 : 0}%` }}
                      />
                      <div 
                        className="h-full bg-slate-300 dark:bg-slate-700 transition-all duration-500" 
                        style={{ width: `${assoc.total > 0 ? (assoc.inactive / assoc.total) * 100 : 0}%` }}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between pt-1 text-xs">
                      <span className="flex items-center gap-1 font-medium text-green-600">
                        {assoc.active} Active
                      </span>
                      <span className="flex items-center gap-1 font-medium text-slate-500">
                        {assoc.inactive} Inactive
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t border-border/50">
                <div className="text-sm text-muted-foreground">
                  Showing {startIndex + 1} to {Math.min(endIndex, associations.length)} of {associations.length} associations
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 text-sm rounded-md border border-border/50 bg-card hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                          currentPage === page
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'border-border/50 bg-card hover:bg-muted/50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 text-sm rounded-md border border-border/50 bg-card hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
            </>
          )}
        </Card>
      </div>

      {/* Association Modal */}
      <AssociationModal
        association={selectedAssociation}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onRefresh={handleRefresh}
      />
    </AppLayout>
  )
}