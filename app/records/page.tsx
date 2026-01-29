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
import { getAllFarmers, deleteFarmer, type Farmer } from '@/lib/farmers-service'
import { Eye, Trash2, Plus } from 'lucide-react'

export default function RecordsPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'All' | 'farmer' | 'fisherfolk'>('All')
  const [filterStatus, setFilterStatus] = useState<'All' | 'active' | 'inactive'>('All')
  const [selectedRecord, setSelectedRecord] = useState<Farmer | null>(null)
  const [modalMode, setModalMode] = useState<'view' | 'edit'>('view')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [farmers, setFarmers] = useState<Farmer[]>([])
  const [loading, setLoading] = useState(true)
  const itemsPerPage = 10

  // Fetch farmers from Supabase
  useEffect(() => {
    async function loadFarmers() {
      try {
        const data = await getAllFarmers()
        setFarmers(data)
      } catch (error) {
        console.error('Error loading farmers:', error)
      } finally {
        setLoading(false)
      }
    }
    loadFarmers()
  }, [])

  // Filter and search records
  const filteredRecords = useMemo(() => {
    return farmers.filter((farmer) => {
      const matchesType = filterType === 'All' || farmer.farmer_type === filterType
      const matchesStatus = filterStatus === 'All' || farmer.status === filterStatus
      const matchesSearch = farmer.full_name
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
        farmer.barangay.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesType && matchesStatus && matchesSearch
    })
  }, [searchQuery, filterType, filterStatus, farmers])

  // Pagination
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage)
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleViewRecord = (farmer: Farmer) => {
    setSelectedRecord(farmer)
    setModalMode('view')
    setIsModalOpen(true)
  }

  const handleDeleteRecord = async (id: string) => {
    if (confirm('Are you sure you want to delete this record?')) {
      try {
        await deleteFarmer(id)
        setFarmers(farmers.filter(f => f.id !== id))
      } catch (error) {
        console.error('Error deleting farmer:', error)
        alert('Failed to delete record')
      }
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-screen">
          <p className="text-muted-foreground">Loading records...</p>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Records Management</h1>
            <p className="text-muted-foreground">
              View and manage all registered farmers and fisherfolks
            </p>
          </div>
          <Button
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => router.push('/registration')}
            title="Create new record"
          >
            <Plus className="h-5 w-5" />
            New Record
          </Button>
        </div>

        {/* Search and Filter */}
        <Card className="border border-border bg-card p-4">
          <div className="grid gap-4 md:grid-cols-4">
            {/* Search */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-foreground">Search</label>
              <Input
                placeholder="Search by name or barangay..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
                className="border-border bg-background"
              />
            </div>

            {/* Filter by Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Filter by Type</label>
              <Select
                value={filterType}
                onValueChange={(value: any) => {
                  setFilterType(value)
                  setCurrentPage(1)
                }}
              >
                <SelectTrigger className="border-border bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Types</SelectItem>
                  <SelectItem value="farmer">Farmers</SelectItem>
                  <SelectItem value="fisherfolk">Fisherfolks</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filter by Status */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Filter by Status</label>
              <Select
                value={filterStatus}
                onValueChange={(value: any) => {
                  setFilterStatus(value)
                  setCurrentPage(1)
                }}
              >
                <SelectTrigger className="border-border bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results Count */}
          <p className="mt-4 text-sm text-muted-foreground">
            Showing {paginatedRecords.length} of {filteredRecords.length} records
          </p>
        </Card>

        {/* Table */}
        <Card className="border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Barangay
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Crop/Fish Type
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Experience
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Status
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedRecords.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center">
                      <p className="text-muted-foreground">No records found</p>
                    </td>
                  </tr>
                ) : (
                  paginatedRecords.map((farmer) => (
                    <tr
                      key={farmer.id}
                      className="border-b border-border hover:bg-muted/50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-foreground">
                        {farmer.full_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        <span
                          className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                            farmer.farmer_type === 'farmer'
                              ? 'bg-green-500/20 text-green-700 dark:text-green-400'
                              : 'bg-blue-500/20 text-blue-700 dark:text-blue-400'
                          }`}
                        >
                          {farmer.farmer_type === 'farmer' ? 'Farmer' : 'Fisherfolk'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {farmer.barangay}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {farmer.phone || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {farmer.crop_type || farmer.fishing_vessel || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {farmer.farm_size ? `${farmer.farm_size} ha` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        <span
                          className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                            farmer.status === 'active'
                              ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                              : 'bg-slate-500/20 text-slate-700 dark:text-slate-400'
                          }`}
                        >
                          {farmer.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-2"
                            onClick={() => handleViewRecord(farmer)}
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="gap-2"
                            onClick={() => handleDeleteRecord(farmer.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {record.yearsExperience} years
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        <span
                          className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                            record.status === 'Active'
                              ? 'bg-green-500/20 text-green-700 dark:text-green-400'
                              : 'bg-slate-500/20 text-slate-700 dark:text-slate-400'
                          }`}
                        >
                          {record.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewRecord(record)}
                            title="View record"
                          >
                            <Eye className="h-4 w-4 text-foreground" />
                          </Button>
                          {/* Edit action removed */}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteRecord(record.id)}
                            title="Delete record"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
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
            <div className="border-t border-border px-6 py-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
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
