'use client'

import { useState, useMemo } from 'react'
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
import { mockRecords } from '@/lib/mock-data'
import { Eye, Trash2, Plus, Download } from 'lucide-react'

interface Record {
  id: number
  name: string
  type: 'Farmer' | 'Fisherfolk' | 'Both'
  barangay: string
  contactNumber: string
  cropType: string
  yearsExperience: number
  createdAt: string
  status: 'Active' | 'Inactive'
  lastName?: string
  firstName?: string
  middleName?: string
  contactNo?: string
  farmerFisherfolkBoth?: string
  idNo?: string
}

export default function RecordsPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'All' | 'Farmer' | 'Fisherfolk' | 'Both'>('All')
  const [filterStatus, setFilterStatus] = useState<'All' | 'Active' | 'Inactive'>('All')
  const [filterSector, setFilterSector] = useState('All')
  const [filterOrganization, setFilterOrganization] = useState('All')
  const [filterID, setFilterID] = useState('All')
  const [selectedRecord, setSelectedRecord] = useState<Record | null>(null)
  const [modalMode, setModalMode] = useState<'view' | 'edit'>('view')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Filter and search records
  const filteredRecords = useMemo(() => {
    return mockRecords.filter((record: Record) => {
      const recordType = record.farmerFisherfolkBoth ?? record.type
      const matchesType = filterType === 'All' || recordType === filterType
      const matchesStatus = filterStatus === 'All' || record.status === filterStatus
      const matchesSector = filterSector === 'All' || (record as any).sector === filterSector
      const matchesOrganization = filterOrganization === 'All' || (record as any).organization === filterOrganization
      const matchesID = filterID === 'All' || (record as any).typeOfId === filterID
      const matchesSearch =
        record.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.barangay.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.contactNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.idNo?.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesType && matchesStatus && matchesSector && matchesOrganization && matchesID && matchesSearch
    })
  }, [searchQuery, filterType, filterStatus, filterSector, filterOrganization, filterID])

  // Pagination
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage)
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleViewRecord = (record: Record) => {
    setSelectedRecord(record)
    setModalMode('view')
    setIsModalOpen(true)
  }

  // Removed Edit action; modal remains view-only in UI

  const handleDeleteRecord = (id: number) => {
    // Mock delete - in real app, would call API
    console.log('Delete record:', id)
  }

  const handleExportToExcel = () => {
    // Prepare CSV data from filtered records
    const headers = [
      'Last Name',
      'First Name',
      'Middle Name',
      'Barangay',
      'Contact No.',
      'Type',
      'ID No.',
      'Status',
      'Crop Type',
      'Years Experience',
      'Created At'
    ]

    const csvRows = [
      headers.join(','),
      ...filteredRecords.map((record: Record) => {
        const recordType = record.farmerFisherfolkBoth ?? record.type
        const lastName = record.lastName ?? record.name.split(' ').slice(-1)[0]
        const firstName = record.firstName ?? record.name.split(' ')[0]
        const middleName = record.middleName ?? record.name.split(' ').slice(1, -1).join(' ')
        const contactNo = record.contactNo ?? record.contactNumber
        
        return [
          `"${lastName}"`,
          `"${firstName}"`,
          `"${middleName || '—'}"`,
          `"${record.barangay}"`,
          `"${contactNo}"`,
          `"${recordType}"`,
          `"${record.idNo ?? '—'}"`,
          `"${record.status}"`,
          `"${record.cropType ?? '—'}"`,
          `"${record.yearsExperience ?? '—'}"`,
          `"${record.createdAt}"`
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
          <div className="grid gap-4 md:grid-cols-6">
            {/* Search */}
            <div className="space-y-2">
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
                  <SelectItem value="Farmer">Farmers</SelectItem>
                  <SelectItem value="Fisherfolk">Fisherfolks</SelectItem>
                  <SelectItem value="Both">Both</SelectItem>
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
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filter by Sector */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Sector</label>
              <Select
                value={filterSector}
                onValueChange={(value: any) => {
                  setFilterSector(value)
                  setCurrentPage(1)
                }}
              >
                <SelectTrigger className="border-border bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  <SelectItem value="IPs">IPs</SelectItem>
                  <SelectItem value="4ps">4ps</SelectItem>
                  <SelectItem value="solo parent">Solo Parent</SelectItem>
                  <SelectItem value="senior citizen">Senior Citizen</SelectItem>
                  <SelectItem value="pwd">PWD</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filter by Organizations */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Organizations</label>
              <Select
                value={filterOrganization}
                onValueChange={(value: any) => {
                  setFilterOrganization(value)
                  setCurrentPage(1)
                }}
              >
                <SelectTrigger className="border-border bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  <SelectItem value="association">Association</SelectItem>
                  <SelectItem value="federation">Federation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filter by ID */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">ID</label>
              <Select
                value={filterID}
                onValueChange={(value: any) => {
                  setFilterID(value)
                  setCurrentPage(1)
                }}
              >
                <SelectTrigger className="border-border bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  <SelectItem value="Philippine Passport">Philippine Passport</SelectItem>
                  <SelectItem value="Driver's License">Driver's License</SelectItem>
                  <SelectItem value="SSS ID">SSS ID</SelectItem>
                  <SelectItem value="GSIS ID">GSIS ID</SelectItem>
                  <SelectItem value="UMID">UMID</SelectItem>
                  <SelectItem value="PhilHealth ID">PhilHealth ID</SelectItem>
                  <SelectItem value="TIN ID">TIN ID</SelectItem>
                  <SelectItem value="Postal ID">Postal ID</SelectItem>
                  <SelectItem value="Voter's ID">Voter's ID</SelectItem>
                  <SelectItem value="PRC ID">PRC ID</SelectItem>
                  <SelectItem value="Senior Citizen ID">Senior Citizen ID</SelectItem>
                  <SelectItem value="PWD ID">PWD ID</SelectItem>
                  <SelectItem value="Barangay ID">Barangay ID</SelectItem>
                  <SelectItem value="NBI Clearance">NBI Clearance</SelectItem>
                  <SelectItem value="Police Clearance">Police Clearance</SelectItem>
                  <SelectItem value="Pag-IBIG ID">Pag-IBIG ID</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results Count and Export Button */}
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {paginatedRecords.length} of {filteredRecords.length} records
            </p>
            <Button
              className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={handleExportToExcel}
              title="Export filtered records to Excel"
            >
              <Download className="h-5 w-5" />
              Export to Excel
            </Button>
          </div>
        </Card>

        {/* Table */}
        <Card className="border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Last Name
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    First Name
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Middle Name
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Barangay
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Contact No.
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    ID No.
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
                  paginatedRecords.map((record: Record) => (
                    <tr
                      key={record.id}
                      className="border-b border-border hover:bg-muted/50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-foreground">
                        {record.lastName ?? record.name.split(' ').slice(-1)[0]}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {record.firstName ?? record.name.split(' ')[0]}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {(record.middleName ?? record.name.split(' ').slice(1, -1).join(' ')) || '—'}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {record.barangay}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {record.contactNo ?? record.contactNumber}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        <span
                          className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                            (record.farmerFisherfolkBoth ?? record.type) === 'Farmer'
                              ? 'bg-green-500/20 text-green-700 dark:text-green-400'
                              : (record.farmerFisherfolkBoth ?? record.type) === 'Both'
                                ? 'bg-amber-500/20 text-amber-700 dark:text-amber-400'
                                : 'bg-blue-500/20 text-blue-700 dark:text-blue-400'
                          }`}
                        >
                          {record.farmerFisherfolkBoth ?? record.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {record.idNo ?? '—'}
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
