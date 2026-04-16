'use client'

import { useState, useMemo, useEffect, useRef, type ChangeEvent } from 'react'
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
  Upload,
  Search, 
  X,
  Filter,
  ChevronLeft,
  ChevronRight,
  Users,
  FileText,
  Calendar,
  ArrowUpDown,
  CheckCircle2,
  XCircle,
  AlertCircle,
  CreditCard
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

type ImportableRecordRow = Omit<RecordRow, 'id' | 'created_at'>

type ImportRecordPayload = {
  [K in keyof ImportableRecordRow]?: ImportableRecordRow[K] | null
}

type ExistingImportRecord = {
  id: number
  id_no: string | null
  lgu_code_no: string | null
  fishr_no: string | null
  first_name: string | null
  last_name: string | null
  birthdate: string | null
  barangay: string | null
  contact_no: string | null
  contact_number: string | null
  name: string | null
  type: string | null
  crop_type: string | null
  years_experience: number | null
  status: string | null
  middle_name: string | null
  ext_name: string | null
  age: number | null
  gender: string | null
  civil_status: string | null
  designation: string | null
  una_kard: string | null
  imc: string | null
  u_mobile_account: string | null
  ffrs_system_generated_no: string | null
  ffrs_date_encoded: string | null
  association: string | null
  family_members: number | null
  organic: string | null
  four_ps_member: string | null
  ips_member: string | null
  severely_stunted_children: number | null
  mother_maiden_name: string | null
  household_head: string | null
  household_head_specify: string | null
  type_of_id: string | null
  farmer_fisherfolk_both: string | null
  farm_type: string | null
  crop_area_or_heads: string | null
  crop_name: string | null
  remarks: string | null
}

const CSV_FIELD_MAP: Record<string, keyof ImportableRecordRow> = {
  name: 'name',
  type: 'type',
  barangay: 'barangay',
  contactnumber: 'contact_number',
  contactno: 'contact_no',
  croptype: 'crop_type',
  yearsexperience: 'years_experience',
  status: 'status',
  lastname: 'last_name',
  firstname: 'first_name',
  middlename: 'middle_name',
  extname: 'ext_name',
  birthdate: 'birthdate',
  age: 'age',
  gender: 'gender',
  civilstatus: 'civil_status',
  designation: 'designation',
  unakard: 'una_kard',
  imc: 'imc',
  umobileaccount: 'u_mobile_account',
  lgucodeno: 'lgu_code_no',
  ffrssystemgeneratedno: 'ffrs_system_generated_no',
  ffrsdateencoded: 'ffrs_date_encoded',
  fishrno: 'fishr_no',
  association: 'association',
  organization: 'association',
  familymembers: 'family_members',
  organic: 'organic',
  fourpsmember: 'four_ps_member',
  ipsmember: 'ips_member',
  severelystuntedchildren: 'severely_stunted_children',
  mothermaidenname: 'mother_maiden_name',
  householdhead: 'household_head',
  householdheadspecify: 'household_head_specify',
  typeofid: 'type_of_id',
  idno: 'id_no',
  farmerfisherfolkboth: 'farmer_fisherfolk_both',
  farmtype: 'farm_type',
  cropareaorheads: 'crop_area_or_heads',
  cropname: 'crop_name',
  remarks: 'remarks',
  sector: 'designation',
}

const NUMBER_FIELDS = new Set<keyof ImportableRecordRow>([
  'years_experience',
  'age',
  'family_members',
  'severely_stunted_children',
])

const normalizeHeader = (header: string) =>
  header.trim().toLowerCase().replace(/[^a-z0-9]/g, '')

const normalizeKeyValue = (value?: string | null) => (value ?? '').trim().toLowerCase()

const normalizeComparableValue = (value: unknown) => {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string') return value.trim()
  if (typeof value === 'number') return String(value)
  return String(value)
}

const parseCsvLine = (line: string): string[] => {
  const values: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i]

    if (char === '"') {
      const escapedQuote = inQuotes && line[i + 1] === '"'
      if (escapedQuote) {
        current += '"'
        i += 1
      } else {
        inQuotes = !inQuotes
      }
      continue
    }

    if (char === ',' && !inQuotes) {
      values.push(current)
      current = ''
      continue
    }

    current += char
  }

  values.push(current)
  return values
}

const parseCsvRows = (csvText: string): Array<Record<string, string>> => {
  const lines = csvText
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter((line) => line.length > 0)

  if (lines.length < 2) return []

  const headers = parseCsvLine(lines[0]).map((header) => header.trim())

  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line)
    const row: Record<string, string> = {}

    headers.forEach((header, index) => {
      row[header] = (values[index] ?? '').trim()
    })

    return row
  })
}

const mapCsvRowToPayload = (rawRow: Record<string, string>): ImportRecordPayload | null => {
  const payload: ImportRecordPayload = {}

  Object.entries(rawRow).forEach(([header, value]) => {
    const field = CSV_FIELD_MAP[normalizeHeader(header)]
    if (!field) return

    const trimmedValue = value.trim()
    if (trimmedValue === '') {
      ;(payload as Record<string, unknown>)[field] = null
      return
    }

    if (NUMBER_FIELDS.has(field)) {
      const parsed = Number(trimmedValue)
      ;(payload as Record<string, unknown>)[field] = Number.isNaN(parsed) ? null : parsed
      return
    }

    ;(payload as Record<string, unknown>)[field] = trimmedValue
  })

  if (!payload.contact_number && payload.contact_no) {
    payload.contact_number = payload.contact_no
  }
  if (!payload.contact_no && payload.contact_number) {
    payload.contact_no = payload.contact_number
  }
  if (!payload.crop_type && payload.crop_name) {
    payload.crop_type = payload.crop_name
  }
  if (!payload.crop_name && payload.crop_type) {
    payload.crop_name = payload.crop_type
  }
  if (!payload.type && payload.farmer_fisherfolk_both) {
    payload.type = payload.farmer_fisherfolk_both
  }
  if (!payload.farmer_fisherfolk_both && payload.type) {
    payload.farmer_fisherfolk_both = payload.type
  }
  if (!payload.status) {
    payload.status = 'Active'
  }

  if (!payload.name) {
    const fullName = [payload.first_name, payload.middle_name, payload.last_name, payload.ext_name]
      .filter((part) => typeof part === 'string' && part.trim().length > 0)
      .join(' ')
      .trim()
    payload.name = fullName || null
  }

  const hasContent = Object.values(payload).some((value) => value !== null && value !== '')
  return hasContent ? payload : null
}

const buildImportKey = (row: {
  id_no?: string | null
  lgu_code_no?: string | null
  fishr_no?: string | null
  first_name?: string | null
  last_name?: string | null
  birthdate?: string | null
  barangay?: string | null
  contact_no?: string | null
  contact_number?: string | null
}) => {
  const idNo = normalizeKeyValue(row.id_no)
  if (idNo) return `id:${idNo}`

  const lguCode = normalizeKeyValue(row.lgu_code_no)
  if (lguCode) return `lgu:${lguCode}`

  const fishrNo = normalizeKeyValue(row.fishr_no)
  if (fishrNo) return `fishr:${fishrNo}`

  const firstName = normalizeKeyValue(row.first_name)
  const lastName = normalizeKeyValue(row.last_name)
  const birthdate = normalizeKeyValue(row.birthdate)
  if (firstName && lastName && birthdate) return `person:${firstName}|${lastName}|${birthdate}`

  const barangay = normalizeKeyValue(row.barangay)
  const contact = normalizeKeyValue(row.contact_no ?? row.contact_number)
  if (firstName && lastName && barangay && contact) {
    return `fallback:${firstName}|${lastName}|${barangay}|${contact}`
  }

  return null
}

const hasChanges = (existing: ExistingImportRecord, incoming: ImportRecordPayload) => {
  return Object.entries(incoming).some(([key, value]) => {
    if (key === 'id') return false
    const existingValue = (existing as unknown as Record<string, unknown>)[key]
    return normalizeComparableValue(existingValue) !== normalizeComparableValue(value)
  })
}

export default function RecordsPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [records, setRecords] = useState<RecordItem[]>([])
  const [recordsLoading, setRecordsLoading] = useState(true)
  const [isImporting, setIsImporting] = useState(false)
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

  const loadRecords = async () => {
    setRecordsLoading(true)
    const { data, error } = await supabase
      .from('records')
      .select('*')
      .order('id', { ascending: false })
    if (error) {
      console.error('Failed to load records', error)
      setRecords([])
      setRecordsLoading(false)
      return
    }
    setRecords((data ?? []).map((row) => mapRecordRow(row as RecordRow)))
    setRecordsLoading(false)
  }

  useEffect(() => {
    void loadRecords()
  }, [])

  const monthlyStats = useMemo(() => {
    const now = new Date()
    const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const firstDayNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

    const thisMonthStartMs = firstDayThisMonth.getTime()
    const nextMonthStartMs = firstDayNextMonth.getTime()
    const lastMonthStartMs = firstDayLastMonth.getTime()

    let thisMonth = 0
    let lastMonth = 0

    for (const r of records) {
      const ts = new Date(r.createdAt).getTime()
      if (Number.isNaN(ts)) continue

      if (ts >= thisMonthStartMs && ts < nextMonthStartMs) thisMonth += 1
      if (ts >= lastMonthStartMs && ts < thisMonthStartMs) lastMonth += 1
    }

    return { this_month: thisMonth, last_month: lastMonth }
  }, [records])

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

  const handleOpenImport = () => {
    fileInputRef.current?.click()
  }

  const handleImportCsv = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setIsImporting(true)
      const csvText = await file.text()
      const parsedRows = parseCsvRows(csvText)

      if (parsedRows.length === 0) {
        alert('No valid rows found in the CSV file.')
        return
      }

      const mappedRows = parsedRows
        .map(mapCsvRowToPayload)
        .filter((row): row is ImportRecordPayload => row !== null)

      if (mappedRows.length === 0) {
        alert('No importable values found. Please check your CSV columns.')
        return
      }

      const dedupedIncoming = new Map<string, ImportRecordPayload>()
      const noKeyIncoming: ImportRecordPayload[] = []

      mappedRows.forEach((row) => {
        const key = buildImportKey({
          id_no: (row.id_no as string | null | undefined) ?? null,
          lgu_code_no: (row.lgu_code_no as string | null | undefined) ?? null,
          fishr_no: (row.fishr_no as string | null | undefined) ?? null,
          first_name: (row.first_name as string | null | undefined) ?? null,
          last_name: (row.last_name as string | null | undefined) ?? null,
          birthdate: (row.birthdate as string | null | undefined) ?? null,
          barangay: (row.barangay as string | null | undefined) ?? null,
          contact_no: (row.contact_no as string | null | undefined) ?? null,
          contact_number: (row.contact_number as string | null | undefined) ?? null,
        })

        if (!key) {
          noKeyIncoming.push(row)
          return
        }

        dedupedIncoming.set(key, row)
      })

      const { data: existingData, error: existingError } = await supabase
        .from('records')
        .select('id,id_no,lgu_code_no,fishr_no,first_name,last_name,birthdate,barangay,contact_no,contact_number,name,type,crop_type,years_experience,status,middle_name,ext_name,age,gender,civil_status,designation,una_kard,imc,u_mobile_account,ffrs_system_generated_no,ffrs_date_encoded,association,family_members,organic,four_ps_member,ips_member,severely_stunted_children,mother_maiden_name,household_head,household_head_specify,type_of_id,farmer_fisherfolk_both,farm_type,crop_area_or_heads,crop_name,remarks')

      if (existingError) {
        console.error('Failed to load existing records for import matching', existingError)
        alert('Import failed. Could not check existing records.')
        return
      }

      const existingMap = new Map<string, ExistingImportRecord>()
      ;(existingData as ExistingImportRecord[]).forEach((record) => {
        const key = buildImportKey(record)
        if (key && !existingMap.has(key)) {
          existingMap.set(key, record)
        }
      })

      const rowsToInsert: ImportRecordPayload[] = []
      const rowsToUpdate: Array<{ id: number; payload: ImportRecordPayload }> = []
      let skippedUnchanged = 0

      dedupedIncoming.forEach((incoming, key) => {
        const existing = existingMap.get(key)

        if (!existing) {
          rowsToInsert.push(incoming)
          return
        }

        if (!hasChanges(existing, incoming)) {
          skippedUnchanged += 1
          return
        }

        rowsToUpdate.push({ id: existing.id, payload: incoming })
      })

      rowsToInsert.push(...noKeyIncoming)

      if (rowsToInsert.length === 0 && rowsToUpdate.length === 0) {
        alert('Import complete. No new or updated records detected.')
        return
      }

      const chunkSize = 200
      for (let i = 0; i < rowsToInsert.length; i += chunkSize) {
        const chunk = rowsToInsert.slice(i, i + chunkSize)
        if (chunk.length === 0) continue
        const { error: insertError } = await supabase.from('records').insert(chunk)
        if (insertError) {
          console.error('Failed to insert imported records', insertError)
          alert('Import failed while adding new records. Please verify the CSV data.')
          return
        }
      }

      for (const update of rowsToUpdate) {
        const { error: updateError } = await supabase
          .from('records')
          .update(update.payload)
          .eq('id', update.id)

        if (updateError) {
          console.error('Failed to update imported record', updateError)
          alert('Import failed while updating existing records. Please retry.')
          return
        }
      }

      await loadRecords()
      alert(
        `Import complete. Added ${rowsToInsert.length}, updated ${rowsToUpdate.length}, skipped ${skippedUnchanged}.`
      )
    } catch (error) {
      console.error('CSV import failed', error)
      alert('Unable to import CSV. Please try again.')
    } finally {
      setIsImporting(false)
      event.target.value = ''
    }
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
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={handleImportCsv}
            />
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
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={handleOpenImport}
              disabled={isImporting}
            >
              <Upload className="h-4 w-4" />
              {isImporting ? 'Importing...' : 'Import Record'}
            </Button>
            <Button
              className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary"
              onClick={() => router.push('/registration')}
              size="sm"
              disabled={isImporting}
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
                <p className="text-xl font-bold text-foreground">+{monthlyStats.this_month}</p>
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
                    <SelectItem value="Indigenous Peoples (IPs)">Indigenous Peoples (IPs)</SelectItem>
                    <SelectItem value="4Ps Beneficiaries">4Ps Beneficiaries</SelectItem>
                    <SelectItem value="PWDs">PWDs</SelectItem>
                    <SelectItem value="Senior Citizens">Senior Citizens</SelectItem>  
                    <SelectItem value="None">None</SelectItem>  
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
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">ID Type</label>
                <Select value={filterID} onValueChange={setFilterID}>
                  <SelectTrigger className="h-9 border-border/50 bg-background/50">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
                      <SelectValue placeholder="All ID Types" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    <SelectItem value="All">All ID Types</SelectItem>
                    <SelectItem value="Philippine Passport">Philippine Passport</SelectItem>
                    <SelectItem value="National ID">National ID</SelectItem>
                    <SelectItem value="Driver's License">Driver's License</SelectItem>
                    <SelectItem value="SSS ID">SSS ID</SelectItem>
                    <SelectItem value="GSIS ID">GSIS ID</SelectItem>
                    <SelectItem value="UMID">UMID (Unified Multi-Purpose ID)</SelectItem>
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