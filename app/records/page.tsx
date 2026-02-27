'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AppLayout } from '@/components/app-layout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RecordModal } from '@/components/record-modal'
import { supabase } from '@/lib/supabase'
import { buildDisplayName, mapRecordRow, type RecordItem, type RecordRow } from '@/lib/records'
import { 
  Eye, 
  Trash2, 
  Plus, 
  Download, 
  Search, 
  X,
  Filter,
  ChevronLeft,
  ChevronRight,
  Users,
  FileText,
  Calendar,
  ArrowUpDown,
  MoreHorizontal,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

export default function RecordsPage() {
  const router = useRouter()
  const [records, setRecords] = useState<RecordItem[]>([])
  const [recordsLoading, setRecordsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'All' | 'Farmer' | 'Fisherfolk' | 'Both'>('All')
  const [filterStatus, setFilterStatus] = useState<'All' | 'Active' | 'Inactive'>('All')
  const [filterSector, setFilterSector] = useState('All')
  const [filterOrganization, setFilterOrganization] = useState('All')
  const [filterID, setFilterID] = useState('All')
  const [selectedRecord, setSelectedRecord] = useState<RecordItem | null>(null)
  const [modalMode, setModalMode] = useState<'view' | 'edit'>('view')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [showFilters, setShowFilters] = useState(true)
  const itemsPerPage = 10

  useEffect(() => {
    let mounted = true
    const loadRecords = async () => {
      setRecordsLoading(true)
      const { data, error } = await supabase
        .from('records')
        .select('*')
        .order('id', { ascending: false })
      if (!mounted) return
      if (error) {
        console.error('Failed to load records', error)
        setRecords([])
      } else {
        setRecords((data ?? []).map((row) => mapRecordRow(row as RecordRow)))
      }
      setRecordsLoading(false)
    }

    loadRecords()
    return () => {
      mounted = false
    }
  }, [])

  // Get unique values for filter options
  const filterOptions = useMemo(() => {
    const sectors = new Set<string>()
    const organizations = new Set<string>()
    const idTypes = new Set<string>()
    const barangays = new Set<string>()
    
    records.forEach(record => {
      if ((record as any).sector) sectors.add((record as any).sector)
      if ((record as any).organization) organizations.add((record as any).organization)
      if ((record as any).typeOfId) idTypes.add((record as any).typeOfId)
      if (record.barangay) barangays.add(record.barangay)
    })
    
    return {
      sectors: Array.from(sectors).sort(),
      organizations: Array.from(organizations).sort(),
      idTypes: Array.from(idTypes).sort(),
      barangays: Array.from(barangays).sort()
    }
  }, [records])

  // Filter and search records
  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const recordType = record.farmerFisherfolkBoth ?? record.type
      const matchesType = filterType === 'All' || recordType === filterType
      const matchesStatus = filterStatus === 'All' || record.status === filterStatus
      const matchesSector = filterSector === 'All' || (record as any).sector === filterSector
      const matchesOrganization =
        filterOrganization === 'All' || (record as any).organization === filterOrganization
      const matchesID = filterID === 'All' || (record as any).typeOfId === filterID
      
      const searchLower = searchQuery.toLowerCase().trim()
      if (searchLower === '') return matchesType && matchesStatus && matchesSector && matchesOrganization && matchesID
      
      const searchableText = [
        record.lastName,
        record.firstName,
        record.middleName,
        record.barangay,
        record.contactNo,
        record.contactNumber,
        record.idNo,
        record.farmerFisherfolkBoth,
        record.type,
        record.status,
        (record as any).sector,
        (record as any).organization,
        (record as any).typeOfId
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      
      const matchesSearch = searchableText.includes(searchLower)
      
      return (
        matchesType &&
        matchesStatus &&
        matchesSector &&
        matchesOrganization &&
        matchesID &&
        matchesSearch
      )
    })
  }, [records, searchQuery, filterType, filterStatus, filterSector, filterOrganization, filterID])

  // Pagination
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage)
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, filterType, filterStatus, filterSector, filterOrganization, filterID])

  const handleViewRecord = (record: RecordItem) => {
    setSelectedRecord(record)
    setModalMode('view')
    setIsModalOpen(true)
  }

  const handleDeleteRecord = async (id: number) => {
    if (!confirm('Are you sure you want to delete this record?')) return
    
    const { error } = await supabase.from('records').delete().eq('id', id)
    if (error) {
      console.error('Delete failed', error)
      alert('Failed to delete record')
      return
    }
    setRecords((prev) => prev.filter((record) => record.id !== id))
  }

  const handleExportToExcel = () => {
    const headers = [
      'Last Name',
      'First Name',
      'Middle Name',
      'Barangay',
      'Contact No.',
      'Type',
      'ID No.',
      'Status',
      'Sector',
      'Organization',
      'ID Type',
      'Crop Type',
      'Years Experience',
      'Created At'
    ]

    const csvRows = [
      headers.join(','),
      ...filteredRecords.map((record: RecordItem) => {
        const recordType = record.farmerFisherfolkBoth ?? record.type
        
        return [
          `"${record.lastName || ''}"`,
          `"${record.firstName || ''}"`,
          `"${record.middleName || ''}"`,
          `"${record.barangay || ''}"`,
          `"${record.contactNo || record.contactNumber || ''}"`,
          `"${recordType}"`,
          `"${record.idNo || ''}"`,
          `"${record.status || ''}"`,
          `"${(record as any).sector || ''}"`,
          `"${(record as any).organization || ''}"`,
          `"${(record as any).typeOfId || ''}"`,
          `"${record.cropType || ''}"`,
          `"${record.yearsExperience || ''}"`,
          `"${record.createdAt || ''}"`
        ].join(',')
      })
    ]

    const csvContent = csvRows.join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', `records_export_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const clearFilters = () => {
    setSearchQuery('')
    setFilterType('All')
    setFilterStatus('All')
    setFilterSector('All')
    setFilterOrganization('All')
    setFilterID('All')
  }

  const hasActiveFilters = useMemo(() => {
    return searchQuery !== '' || 
           filterType !== 'All' || 
           filterStatus !== 'All' || 
           filterSector !== 'All' || 
           filterOrganization !== 'All' || 
           filterID !== 'All'
  }, [searchQuery, filterType, filterStatus, filterSector, filterOrganization, filterID])

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'Active':
        return <CheckCircle2 className="h-3 w-3 text-green-600" />
      case 'Inactive':
        return <XCircle className="h-3 w-3 text-red-600" />
      default:
        return <AlertCircle className="h-3 w-3 text-slate-600" />
    }
  }

  const getTypeColor = (type: string) => {
    switch(type) {
      case 'Farmer':
        return 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20'
      case 'Fisherfolk':
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20'
      case 'Both':
        return 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20'
      default:
        return 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20'
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header with Stats */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Records Management
            </h1>
            <p className="text-sm text-muted-foreground md:text-base">
              View and manage all registered farmers and fisherfolks
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
            </Button>
            <Button
              className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary"
              onClick={() => router.push('/registration')}
              size="sm"
            >
              <Plus className="h-4 w-4" />
              New Record
            </Button>
          </div>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="group relative overflow-hidden border border-border/50 bg-gradient-to-br from-background via-background to-muted/20 p-4 transition-all hover:shadow-md">
            <div className="absolute right-0 top-0 h-20 w-20 translate-x-6 -translate-y-6 rounded-full bg-primary/5 transition-transform group-hover:scale-150" />
            <div className="relative flex items-start gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Total Records</p>
                <p className="text-xl font-bold text-foreground">{records.length}</p>
              </div>
            </div>
          </Card>

          <Card className="group relative overflow-hidden border border-border/50 bg-gradient-to-br from-background via-background to-muted/20 p-4 transition-all hover:shadow-md">
            <div className="absolute right-0 top-0 h-20 w-20 translate-x-6 -translate-y-6 rounded-full bg-green-500/5 transition-transform group-hover:scale-150" />
            <div className="relative flex items-start gap-3">
              <div className="rounded-lg bg-green-500/10 p-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Active</p>
                <p className="text-xl font-bold text-foreground">
                  {records.filter(r => r.status === 'Active').length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="group relative overflow-hidden border border-border/50 bg-gradient-to-br from-background via-background to-muted/20 p-4 transition-all hover:shadow-md">
            <div className="absolute right-0 top-0 h-20 w-20 translate-x-6 -translate-y-6 rounded-full bg-slate-500/5 transition-transform group-hover:scale-150" />
            <div className="relative flex items-start gap-3">
              <div className="rounded-lg bg-slate-500/10 p-2">
                <XCircle className="h-4 w-4 text-slate-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Inactive</p>
                <p className="text-xl font-bold text-foreground">
                  {records.filter(r => r.status === 'Inactive').length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="group relative overflow-hidden border border-border/50 bg-gradient-to-br from-background via-background to-muted/20 p-4 transition-all hover:shadow-md">
            <div className="absolute right-0 top-0 h-20 w-20 translate-x-6 -translate-y-6 rounded-full bg-amber-500/5 transition-transform group-hover:scale-150" />
            <div className="relative flex items-start gap-3">
              <div className="rounded-lg bg-amber-500/10 p-2">
                <FileText className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">This Month</p>
                <p className="text-xl font-bold text-foreground">+12</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Search and Filter Section */}
        {showFilters && (
          <Card className="border border-border/50 bg-gradient-to-br from-background via-background to-muted/20 p-5">
            {/* Search Bar */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by name, barangay, contact number, or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-10 border-border/50 bg-background/50"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Filter Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">Type</label>
                <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                  <SelectTrigger className="h-9 border-border/50 bg-background/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Types</SelectItem>
                    <SelectItem value="Farmer">Farmers</SelectItem>
                    <SelectItem value="Fisherfolk">Fisherfolks</SelectItem>
                    <SelectItem value="Both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">Status</label>
                <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
                  <SelectTrigger className="h-9 border-border/50 bg-background/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Status</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">Sector</label>
                <Select value={filterSector} onValueChange={setFilterSector}>
                  <SelectTrigger className="h-9 border-border/50 bg-background/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Sectors</SelectItem>
                    {filterOptions.sectors.map(sector => (
                      <SelectItem key={sector} value={sector}>{sector}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">Organization</label>
                <Select value={filterOrganization} onValueChange={setFilterOrganization}>
                  <SelectTrigger className="h-9 border-border/50 bg-background/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Organizations</SelectItem>
                    {filterOptions.organizations.map(org => (
                      <SelectItem key={org} value={org}>{org}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">ID Type</label>
                <Select value={filterID} onValueChange={setFilterID}>
                  <SelectTrigger className="h-9 border-border/50 bg-background/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All ID Types</SelectItem>
                    {filterOptions.idTypes.map(idType => (
                      <SelectItem key={idType} value={idType}>{idType}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Results Count and Actions */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <p className="text-sm text-muted-foreground">
                  {recordsLoading ? 'Loading...' : `Showing ${paginatedRecords.length} of ${filteredRecords.length} records`}
                </p>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 px-2 text-xs">
                    <X className="mr-1 h-3 w-3" />
                    Clear Filters
                  </Button>
                )}
              </div>
              <Button variant="outline" size="sm" onClick={handleExportToExcel} className="gap-2 h-8">
                <Download className="h-3.5 w-3.5" />
                Export CSV
              </Button>
            </div>
          </Card>
        )}

        {/* Table */}
        <Card className="border border-border/50 bg-gradient-to-br from-background via-background to-muted/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50 bg-muted/30">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    <div className="flex items-center gap-1 cursor-pointer hover:text-foreground">
                      Last Name
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">First Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Middle Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Barangay</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Contact</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">ID No.</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {recordsLoading ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        <p className="text-sm text-muted-foreground">Loading records...</p>
                      </div>
                    </td>
                  </tr>
                ) : paginatedRecords.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <FileText className="h-12 w-12 text-muted-foreground/50" />
                        <p className="text-sm text-muted-foreground">No records found</p>
                        {hasActiveFilters && (
                          <Button variant="link" onClick={clearFilters} className="text-primary">
                            Clear filters to see all records
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedRecords.map((record: RecordItem) => (
                    <tr
                      key={record.id}
                      className="group hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm font-medium text-foreground">
                        {record.lastName || '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground">
                        {record.firstName || '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground">
                        {record.middleName || '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground">
                        {record.barangay || '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground">
                        {record.contactNo || record.contactNumber || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
                          getTypeColor(record.farmerFisherfolkBoth ?? record.type)
                        )}>
                          {record.farmerFisherfolkBoth ?? record.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground font-mono">
                        {record.idNo || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                          record.status === 'Active' 
                            ? 'bg-green-500/10 text-green-700 border-green-500/20'
                            : record.status === 'Inactive'
                              ? 'bg-red-500/10 text-red-700 border-red-500/20'
                              : 'bg-slate-500/10 text-slate-700 border-slate-500/20'
                        )}>
                          {getStatusIcon(record.status || '')}
                          {record.status || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-full hover:bg-primary/10 hover:text-primary"
                            onClick={() => handleViewRecord(record)}
                            title="View record"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-full hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => handleDeleteRecord(record.id)}
                            title="Delete record"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="border-t border-border/50 px-4 py-3 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  let pageNum = currentPage;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <Button
                      key={i}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className="h-8 w-8 p-0"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Record Modal */}
      <RecordModal
        record={selectedRecord}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={modalMode}
      />
    </AppLayout>
  )
}