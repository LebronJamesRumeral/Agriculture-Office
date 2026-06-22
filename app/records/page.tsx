'use client'

import { useState, useMemo, useEffect, useRef, type ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import ExcelJS from 'exceljs'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { RecordModal } from '@/components/record-modal'
import { supabase } from '@/lib/supabase'
import {
  formatRecordDate,
  mapRecordRow,
  capitalizePayloadStrings,
  type RecordItem,
  type RecordRow,
} from '@/lib/records'
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
  CheckCircle2,
  XCircle,
  AlertCircle,
  CreditCard
} from 'lucide-react'
import { toast } from 'sonner'

type ImportableRecordRow = Omit<RecordRow, 'id' | 'created_at'>

type ImportRecordPayload = {
  [K in keyof ImportableRecordRow]?: ImportableRecordRow[K] | null
}

type ImportReport = {
  totalRows: number
  successfullyImported: number
  updated: number
  skippedUnchanged: number
  failed: number
  successfullyMappedFields: string[]
  unmappedColumns: string[]
  failedRows: Array<{ rowNumber: number; reason: string }>
  errors: string[]
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
  pwd_member: string | null
  senior_citizen: string | null
  solo_parent: string | null
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
  // Personal Information
  name: 'name',
  lastname: 'last_name',
  firstname: 'first_name',
  middlename: 'middle_name',
  extname: 'ext_name',
  extensionname: 'ext_name',
  birthdate: 'birthdate',
  birthdateddmmyyyy: 'birthdate',
  age: 'age',
  gender: 'gender',
  civilstatus: 'civil_status',
  barangay: 'barangay',
  designation: 'designation',
  sector: 'designation',

  // IDs and Program Cards
  unakard: 'una_kard',
  unakardusscnetworkacctkard: 'una_kard',
  unakardpassbook: 'una_kard',
  unakardpassbookno: 'una_kard',
  imc: 'imc',
  interventionmonitoringcard: 'imc',
  interventionmonitoringcardimc: 'imc',
  umobileaccount: 'u_mobile_account',
  umobileacctno: 'u_mobile_account',
  lgucodeno: 'lgu_code_no',
  ffrssystemgeneratedno: 'ffrs_system_generated_no',
  ffrsdateencoded: 'ffrs_date_encoded',
  fishrno: 'fishr_no',
  typeofid: 'type_of_id',
  idno: 'id_no',

  // Household and Membership
  contactnumber: 'contact_number',
  contactno: 'contact_no',
  association: 'association',
  organization: 'association',
  familymembers: 'family_members',
  nooffamilymembers: 'family_members',
  numberoffamilymembers: 'family_members',
  organic: 'organic',
  organicyn: 'organic',
  fourpsmember: 'four_ps_member',
  fourpsmemberyn: 'four_ps_member',
  '4psmember': 'four_ps_member',
  '4psmemberyn': 'four_ps_member',
  '4ps': 'four_ps_member',
  '4p\'smember': 'four_ps_member',
  '4p\'s': 'four_ps_member',
  '4p\'smembery/n': 'four_ps_member',
  '4p\'smemberyn': 'four_ps_member',
  ipsmember: 'ips_member',
  ipsmemberyn: 'ips_member',
  'ips': 'ips_member',
  'ip\'smember': 'ips_member',
  'ip\'s': 'ips_member',
  'ip\'smembery/n': 'ips_member',
  'ip\'smemberyn': 'ips_member',
  pwdmember: 'pwd_member',
  pwdmemberyn: 'pwd_member',
  seniorcitizen: 'senior_citizen',
  seniorcitizenyn: 'senior_citizen',
  soloparent: 'solo_parent',
  soloparentyn: 'solo_parent',
  solo_parent: 'solo_parent',
  severelystuntedchildren: 'severely_stunted_children',
  noofseverelystuntedchildren059months: 'severely_stunted_children',
  mothermaidenname: 'mother_maiden_name',
  householdhead: 'household_head',
  householdheadyn: 'household_head',
  householdheadspecify: 'household_head_specify',
  ifnospecify: 'household_head_specify',

  // Farm / Fisherfolk Details
  farmerfisherfolkboth: 'farmer_fisherfolk_both',
  farmerfisherfolk: 'farmer_fisherfolk_both',
  'farmer/fisherfolk': 'farmer_fisherfolk_both',
  'farmer/fisherfolk/both': 'farmer_fisherfolk_both',
  farmtype: 'farm_type',
  cropareaorheads: 'crop_area_or_heads',
  cropareanoofheads: 'crop_area_or_heads',
  cropareaheads: 'crop_area_or_heads',
  cropname: 'crop_name',
  croptype: 'crop_type',

  // System Details
  status: 'status',
  remarks: 'remarks',
  yearsexperience: 'years_experience',
  type: 'type',
}

const NUMBER_FIELDS = new Set<keyof ImportableRecordRow>([
  'years_experience',
  'age',
  'family_members',
  'severely_stunted_children',
])

const DATE_FIELDS = new Set<keyof ImportableRecordRow>([
  'birthdate',
  'ffrs_date_encoded',
])

const normalizeHeader = (header: string): string => {
  // Remove line breaks, extra spaces, and convert to lowercase
  const normalized = header
    .replace(/\n/g, ' ')  // Replace line breaks with spaces
    .replace(/\r/g, '')   // Remove carriage returns
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '') // Remove all spaces for matching
  return normalized
}

const normalizeDateValue = (valStr: string): string | null => {
  const trimmed = valStr.trim()
  if (!trimmed) return null

  // 1. Check if it's already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed
  }

  // 2. Check if it's DD/MM/YYYY or DD-MM-YYYY
  const match = /^(\d{1,2})[/\-](\d{1,2})[/\-](\d{4})$/.exec(trimmed)
  if (match) {
    const [, first, second, year] = match
    const day = Number(first)
    const month = Number(second)

    // Validate bounds
    if (day > 31 || month > 12) {
      // Heuristic: If first is month (>12 checks)
      if (month <= 31 && day <= 12) {
        return `${year}-${String(day).padStart(2, '0')}-${String(month).padStart(2, '0')}`
      }
      return null
    }

    if (month > 12 && day <= 12) {
      return `${year}-${String(day).padStart(2, '0')}-${String(month).padStart(2, '0')}`
    }
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  const parsed = new Date(trimmed)
  if (!Number.isNaN(parsed.getTime())) {
    const y = parsed.getFullYear()
    const m = String(parsed.getMonth() + 1).padStart(2, '0')
    const d = String(parsed.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }

  return null
}

const findFieldForHeader = (header: string): keyof ImportableRecordRow | null => {
  const normalized = normalizeHeader(header)

  // First try direct lookup in CSV_FIELD_MAP
  if (CSV_FIELD_MAP[normalized]) {
    return CSV_FIELD_MAP[normalized]
  }

  // Enhanced fuzzy matching with more comprehensive patterns
  const patterns: Array<{ pattern: string; field: keyof ImportableRecordRow }> = [
    // Personal Information
    { pattern: 'lastname', field: 'last_name' },
    { pattern: 'firstname', field: 'first_name' },
    { pattern: 'middlename', field: 'middle_name' },
    { pattern: 'extname', field: 'ext_name' },
    { pattern: 'extensionname', field: 'ext_name' },
    { pattern: 'birthdate', field: 'birthdate' },
    { pattern: 'age', field: 'age' },
    { pattern: 'gender', field: 'gender' },
    { pattern: 'civilstatus', field: 'civil_status' },
    { pattern: 'barangay', field: 'barangay' },
    { pattern: 'designation', field: 'designation' },
    { pattern: 'sector', field: 'designation' },

    // IDs and Program Cards
    { pattern: 'unakard', field: 'una_kard' },
    { pattern: 'ussc', field: 'una_kard' },
    { pattern: 'networkacct', field: 'una_kard' },
    { pattern: 'passbook', field: 'una_kard' },
    { pattern: 'imc', field: 'imc' },
    { pattern: 'intervention', field: 'imc' },
    { pattern: 'monitoring', field: 'imc' },
    { pattern: 'umobile', field: 'u_mobile_account' },
    { pattern: 'lgucode', field: 'lgu_code_no' },
    { pattern: 'ffrssystem', field: 'ffrs_system_generated_no' },
    { pattern: 'systemgenerated', field: 'ffrs_system_generated_no' },
    { pattern: 'ffrsdate', field: 'ffrs_date_encoded' },
    { pattern: 'dateencoded', field: 'ffrs_date_encoded' },
    { pattern: 'fishr', field: 'fishr_no' },
    { pattern: 'typeofid', field: 'type_of_id' },
    { pattern: 'idno', field: 'id_no' },

    // Household and Membership
    { pattern: 'contactno', field: 'contact_no' },
    { pattern: 'contactnumber', field: 'contact_number' },
    { pattern: 'association', field: 'association' },
    { pattern: 'organization', field: 'association' },
    { pattern: 'familymembers', field: 'family_members' },
    { pattern: 'organic', field: 'organic' },
    { pattern: 'fourps', field: 'four_ps_member' },
    { pattern: '4ps', field: 'four_ps_member' },
    { pattern: '4p', field: 'four_ps_member' },
    { pattern: 'ips', field: 'ips_member' },
    { pattern: 'ip', field: 'ips_member' },
    { pattern: 'ipsmember', field: 'ips_member' },
    { pattern: 'pwdmember', field: 'pwd_member' },
    { pattern: 'seniorcitizen', field: 'senior_citizen' },
    { pattern: 'soloparent', field: 'solo_parent' },
    { pattern: 'severely', field: 'severely_stunted_children' },
    { pattern: 'stunted', field: 'severely_stunted_children' },
    { pattern: 'mothermaiden', field: 'mother_maiden_name' },
    { pattern: 'householdhead', field: 'household_head' },
    { pattern: 'ifnospecify', field: 'household_head_specify' },

    // Farm / Fisherfolk Details
    { pattern: 'farmerfisherfolk', field: 'farmer_fisherfolk_both' },
    { pattern: 'farmer', field: 'farmer_fisherfolk_both' },
    { pattern: 'fisherfolk', field: 'farmer_fisherfolk_both' },
    { pattern: 'farmtype', field: 'farm_type' },
    { pattern: 'croparea', field: 'crop_area_or_heads' },
    { pattern: 'heads', field: 'crop_area_or_heads' },
    { pattern: 'cropname', field: 'crop_name' },
    { pattern: 'croptype', field: 'crop_type' },

    // System Details
    { pattern: 'status', field: 'status' },
    { pattern: 'remarks', field: 'remarks' },
    { pattern: 'yearsexperience', field: 'years_experience' },
    { pattern: 'type', field: 'type' },
  ]

  // Try to match patterns
  for (const { pattern, field } of patterns) {
    if (normalized.includes(pattern)) {
      // Special handling for household_head_specify
      if (field === 'household_head' && normalized.includes('specify') && !normalized.includes('yn')) {
        return 'household_head_specify'
      }
      return field
    }
  }

  return null
}

const normalizeKeyValue = (value?: string | null) => (value ?? '').trim().toLowerCase()

const normalizeComparableValue = (value: unknown) => {
  if (value === null || value === undefined) return ''
  const str = String(value).trim().toLowerCase()
  if (str === 'n/a' || str === 'none' || str === '-' || str === '—' || str === 'na') return ''
  return str
}

const isValidIdentifier = (val: string): boolean => {
  const cleaned = val.trim().toLowerCase()
  return (
    cleaned !== '' &&
    cleaned !== 'n/a' &&
    cleaned !== 'na' &&
    cleaned !== 'none' &&
    cleaned !== 'not applicable' &&
    cleaned !== 'not_applicable' &&
    cleaned !== 'not applicable.' &&
    cleaned !== 'null' &&
    cleaned !== '-' &&
    cleaned !== '—'
  )
}

const isSamePerson = (rec1: ImportRecordPayload, rec2: ImportRecordPayload): boolean => {
  const first1 = normalizeComparableValue(rec1.first_name)
  const first2 = normalizeComparableValue(rec2.first_name)
  const last1 = normalizeComparableValue(rec1.last_name)
  const last2 = normalizeComparableValue(rec2.last_name)

  return first1 === first2 && last1 === last2
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

const parseExcelRows = async (file: File): Promise<Array<Record<string, string>>> => {
  const arrayBuffer = await file.arrayBuffer()
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.load(arrayBuffer)

  let worksheet = workbook.worksheets[0]
  for (const sheet of workbook.worksheets) {
    if (sheet.rowCount > 0) {
      worksheet = sheet
      break
    }
  }

  if (!worksheet || worksheet.rowCount < 2) return []

  const rows: Array<Record<string, string>> = []

  const headerRow = worksheet.getRow(1)
  const headers: string[] = []

  headerRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
    const val = cell.value
    headers[colNumber] = (cell.text || (val !== null && val !== undefined ? String(val) : '')).trim()
  })

  worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber === 1) return

    const rowData: Record<string, string> = {}
    let hasData = false

    headers.forEach((header, colNumber) => {
      if (!header) return
      const cell = row.getCell(colNumber)
      let valStr = ''

      if (cell.value !== null && cell.value !== undefined) {
        const val = cell.value

        if (val instanceof Date) {
          const year = val.getFullYear()
          const month = String(val.getMonth() + 1).padStart(2, '0')
          const day = String(val.getDate()).padStart(2, '0')
          valStr = `${year}-${month}-${day}`
        } else if (typeof val === 'object') {
          if ('result' in val) {
            if (val.result instanceof Date) {
              const year = val.result.getFullYear()
              const month = String(val.result.getMonth() + 1).padStart(2, '0')
              const day = String(val.result.getDate()).padStart(2, '0')
              valStr = `${year}-${month}-${day}`
            } else {
              valStr = val.result !== null && val.result !== undefined ? String(val.result) : ''
            }
          } else if ('text' in val) {
            valStr = String(val.text)
          } else if ('richText' in val && Array.isArray(val.richText)) {
            valStr = val.richText.map((rt: any) => rt.text || '').join('')
          } else {
            valStr = JSON.stringify(val)
          }
        } else {
          valStr = cell.text || String(val)
        }
      }

      const trimmed = valStr.trim()
      if (trimmed) {
        hasData = true
      }
      rowData[header] = trimmed
    })

    if (hasData) {
      rows.push(rowData)
    }
  })

  return rows
}

const mapCsvRowToPayload = (
  rawRow: Record<string, string>,
  report: ImportReport,
  rowNumber: number
): ImportRecordPayload | null => {
  const payload: ImportRecordPayload = {}
  const unmappedInRow: string[] = []

  Object.entries(rawRow).forEach(([header, value]) => {
    const field = findFieldForHeader(header)
    if (!field) {
      const normalizedHeader = normalizeHeader(header)
      if (
        normalizedHeader === 'no' ||
        normalizedHeader === 'no.' ||
        normalizedHeader === 'num' ||
        normalizedHeader === 'number'
      ) {
        return
      }
      if (!report.unmappedColumns.includes(header)) {
        report.unmappedColumns.push(header)
        console.warn(`[Import] Unmapped column header: "${header}" (normalized: "${normalizedHeader}")`)
      }
      unmappedInRow.push(header)
      return
    }

    if (!report.successfullyMappedFields.includes(field)) {
      report.successfullyMappedFields.push(field)
    }

    const trimmedValue = value.trim()
    if (trimmedValue === '') {
      ; (payload as Record<string, unknown>)[field] = null
      return
    }

    if (NUMBER_FIELDS.has(field)) {
      const parsed = Number(trimmedValue)
        ; (payload as Record<string, unknown>)[field] = Number.isNaN(parsed) ? null : Math.round(parsed)
      return
    }

    if (DATE_FIELDS.has(field)) {
      const dateValue = normalizeDateValue(trimmedValue)
        ; (payload as Record<string, unknown>)[field] = dateValue
      if (!dateValue && trimmedValue) {
        console.warn(`[Import] Row ${rowNumber}: Failed to parse date for field "${field}": "${trimmedValue}"`)
      }
      return
    }

    ; (payload as Record<string, unknown>)[field] = trimmedValue
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
  if (!hasContent) {
    report.failedRows.push({ rowNumber, reason: 'No valid data found in row' })
    return null
  }

  return capitalizePayloadStrings(payload)
}

const cleanNameString = (str: string | null | undefined): string => {
  if (!str) return ''
  const cleaned = str.trim().toLowerCase().replace(/\s+/g, ' ')
  if (cleaned === 'n/a' || cleaned === 'none' || cleaned === '-' || cleaned === '—' || cleaned === 'na') {
    return ''
  }
  return cleaned
}

const getUnifiedNormalizedName = (row: {
  first_name?: string | null
  last_name?: string | null
  middle_name?: string | null
  ext_name?: string | null
  name?: string | null
}): string => {
  const firstName = cleanNameString(row.first_name)
  const lastName = cleanNameString(row.last_name)

  if (firstName && lastName) {
    const parts = [row.first_name, row.middle_name, row.last_name, row.ext_name]
      .map(cleanNameString)
      .filter(Boolean)
    return parts.join(' ').replace(/\s+/g, ' ')
  }

  const nameVal = cleanNameString(row.name)
  if (nameVal) return nameVal

  const parts = [row.first_name, row.middle_name, row.last_name, row.ext_name]
    .map(cleanNameString)
    .filter(Boolean)
  return parts.join(' ').replace(/\s+/g, ' ')
}

const buildImportKey = (row: {
  id_no?: string | null
  lgu_code_no?: string | null
  fishr_no?: string | null
  first_name?: string | null
  last_name?: string | null
  middle_name?: string | null
  ext_name?: string | null
  birthdate?: string | null
  barangay?: string | null
  contact_no?: string | null
  contact_number?: string | null
  name?: string | null
}) => {
  const idNo = normalizeKeyValue(row.id_no)
  if (idNo) return `id:${idNo}`

  const lguCode = normalizeKeyValue(row.lgu_code_no)
  if (lguCode) return `lgu:${lguCode}`

  const fishrNo = normalizeKeyValue(row.fishr_no)
  if (fishrNo) return `fishr:${fishrNo}`

  const nameKey = getUnifiedNormalizedName(row)

  const birthdate = normalizeKeyValue(row.birthdate)
  if (nameKey && birthdate) return `person:${nameKey}|${birthdate}`

  const barangay = normalizeKeyValue(row.barangay)
  const contact = normalizeKeyValue(row.contact_no ?? row.contact_number)
  if (nameKey && barangay && contact) {
    return `fallback:${nameKey}|${barangay}|${contact}`
  }

  if (nameKey && barangay) {
    return `name-brgy:${nameKey}|${barangay}`
  }

  if (nameKey) {
    return `name-only:${nameKey}`
  }

  return null
}

const getNewAdditionalData = (
  existing: ExistingImportRecord,
  incoming: ImportRecordPayload
): ImportRecordPayload | null => {
  const updatePayload: ImportRecordPayload = {}
  let hasAdditional = false

  Object.entries(incoming).forEach(([key, value]) => {
    if (key === 'id') return

    const normalizedIncoming = normalizeComparableValue(value)
    if (normalizedIncoming === '') return

    const existingValue = (existing as unknown as Record<string, unknown>)[key]
    const normalizedExisting = normalizeComparableValue(existingValue)

    if (normalizedIncoming !== normalizedExisting) {
      ; (updatePayload as Record<string, unknown>)[key] = value
      hasAdditional = true
    }
  })

  return hasAdditional ? updatePayload : null
}

export default function RecordsPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [records, setRecords] = useState<RecordItem[]>([])
  const [recordsLoading, setRecordsLoading] = useState(true)
  const [totalRecords, setTotalRecords] = useState<number>(0)
  const [isImporting, setIsImporting] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'All' | 'Farmer' | 'Fisherfolk' | 'Both'>('All')
  const [filterStatus, setFilterStatus] = useState<'All' | 'Active' | 'Inactive'>('All')
  const [filterSector, setFilterSector] = useState('All')
  const [filterOrganization, setFilterOrganization] = useState('All')
  const [filterAssociation, setFilterAssociation] = useState('All')
  const [filterID, setFilterID] = useState('All')
  const [selectedRecord, setSelectedRecord] = useState<RecordItem | null>(null)
  const [modalMode, setModalMode] = useState<'view' | 'edit'>('view')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [showFilters, setShowFilters] = useState(true)
  const itemsPerPage = 10

  // Import preview states
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [previewData, setPreviewData] = useState<ImportRecordPayload[]>([])
  const [previewFileName, setPreviewFileName] = useState('')

  const loadRecords = async () => {
    setRecordsLoading(true)
    try {
      // Get exact total count without fetching data
      const { count, error: countError } = await supabase
        .from('records')
        .select('id', { head: true, count: 'exact' })

      if (countError) {
        console.error('Failed to get records count', countError)
      }
      setTotalRecords(count ?? 0)

      // Supabase / PostgREST can impose a default max page size (commonly 1000).
      // To ensure we retrieve the entire table regardless of server limits,
      // fetch in batches using .range() and concatenate until no more rows.
      const batchSize = 1000
      let from = 0
      const allRows: RecordRow[] = []

      while (true) {
        const to = from + batchSize - 1
        const { data, error } = await supabase
          .from('records')
          .select('*')
          .order('last_name', { ascending: true, nullsFirst: false })
          .order('first_name', { ascending: true, nullsFirst: false })
          .order('name', { ascending: true, nullsFirst: false })
          .range(from, to)

        if (error) {
          console.error('Failed to load records batch', error)
          setRecords([])
          setRecordsLoading(false)
          return
        }

        if (!data || data.length === 0) break

        allRows.push(...(data as RecordRow[]))

        if (data.length < batchSize) break
        from += batchSize
      }

      setRecords(allRows.map((row) => mapRecordRow(row as RecordRow)))
    } catch (err) {
      console.error('Failed to load records', err)
      setRecords([])
      setTotalRecords(0)
    } finally {
      setRecordsLoading(false)
    }
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
    const associations = new Set<string>()
    const idTypes = new Set<string>()
    const barangays = new Set<string>()

    records.forEach(record => {
      if ((record as any).sector) sectors.add((record as any).sector)
      if ((record as any).organization) organizations.add((record as any).organization)
      if (record.association) associations.add(record.association)
      if ((record as any).typeOfId) idTypes.add((record as any).typeOfId)
      if (record.barangay) barangays.add(record.barangay)
    })

    return {
      sectors: Array.from(sectors).sort(),
      organizations: Array.from(organizations).sort(),
      associations: Array.from(associations).sort(),
      idTypes: Array.from(idTypes).sort(),
      barangays: Array.from(barangays).sort()
    }
  }, [records])

  // Filter and search records
  const filteredRecords = useMemo(() => {
    const filtered = records.filter((record) => {
      const recordType = record.farmerFisherfolkBoth ?? record.type
      const matchesType = filterType === 'All' || recordType === filterType
      const matchesStatus = filterStatus === 'All' || record.status === filterStatus
      const matchesSector = filterSector === 'All' || (record as any).sector === filterSector
      const matchesOrganization =
        filterOrganization === 'All' || (record as any).organization === filterOrganization
      const matchesAssociation =
        filterAssociation === 'All' || record.association === filterAssociation
      const matchesID = filterID === 'All' || (record as any).typeOfId === filterID

      const searchLower = searchQuery.toLowerCase().trim()
      if (searchLower === '') return matchesType && matchesStatus && matchesSector && matchesOrganization && matchesAssociation && matchesID

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
        matchesAssociation &&
        matchesID &&
        matchesSearch
      )
    })

    // Sort alphabetically: last name -> first name -> name
    return [...filtered].sort((a, b) => {
      const aLast = (a.lastName || '').trim().toLowerCase()
      const bLast = (b.lastName || '').trim().toLowerCase()

      if (aLast !== bLast) {
        if (!aLast) return 1
        if (!bLast) return -1
        return aLast.localeCompare(bLast)
      }

      const aFirst = (a.firstName || '').trim().toLowerCase()
      const bFirst = (b.firstName || '').trim().toLowerCase()

      if (aFirst !== bFirst) {
        if (!aFirst) return 1
        if (!bFirst) return -1
        return aFirst.localeCompare(bFirst)
      }

      const aName = (a.name || '').trim().toLowerCase()
      const bName = (b.name || '').trim().toLowerCase()
      return aName.localeCompare(bName)
    })
  }, [records, searchQuery, filterType, filterStatus, filterSector, filterOrganization, filterAssociation, filterID])

  // Pagination
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage)
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, filterType, filterStatus, filterSector, filterOrganization, filterAssociation, filterID])

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
      toast.error('Failed to delete record', {
        description: error.message || 'Please try again.',
      })
      return
    }
    setRecords((prev) => prev.filter((record) => record.id !== id))
    toast.success('Record deleted successfully.')
  }

  const handleExportToExcel = async () => {
    try {
      const rows = filteredRecords.map((record: RecordItem, index: number) => {
        return {
          id: index + 1,
          lastName: record.lastName || '',
          firstName: record.firstName || '',
          middleName: record.middleName || '',
          extName: record.extName || '',
          birthdate: formatRecordDate(record.birthdate) || '',
          age: record.age || '',
          gender: record.gender || '',
          civilStatus: record.civilStatus || '',
          barangay: record.barangay || '',
          designation: record.designation || '',
          unaKard: record.unaKard || '',
          imc: record.imc || '',
          uMobileAccount: record.uMobileAccount || '',
          lguCodeNo: record.lguCodeNo || '',
          ffrsSystemGeneratedNo: record.ffrsSystemGeneratedNo || '',
          ffrsDateEncoded: formatRecordDate(record.ffrsDateEncoded) || '',
          fishrNo: record.fishrNo || '',
          contactNo: record.contactNo || record.contactNumber || '',
          association: record.association || '',
          familyMembers: record.familyMembers || '',
          organic: record.organic || '',
          fourPsMember: record.fourPsMember || '',
          ipsMember: record.ipsMember || '',
          pwdMember: record.pwdMember || '',
          seniorCitizen: record.seniorCitizen || '',
          soloParent: record.soloParent || '',
          severelyStuntedChildren: record.severelyStuntedChildren || '',
          motherMaidenName: record.motherMaidenName || '',
          householdHead: record.householdHead || '',
          householdHeadSpecify: record.householdHeadSpecify || '',
          typeOfId: record.typeOfId || '',
          idNo: record.idNo || '',
          farmerFisherfolkBoth: record.farmerFisherfolkBoth || record.type || '',
          farmType: record.farmType || '',
          cropAreaOrHeads: record.cropAreaOrHeads || '',
          cropName: record.cropName || record.cropType || '',
          status: record.status || '',
          createdAt: formatRecordDate(record.createdAt) || '',
          remarks: record.remarks || '',
        }
      })

      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Records')

      worksheet.columns = [
        { header: 'System ID no', key: 'id', width: 15 },
        { header: 'Last Name', key: 'lastName', width: 20 },
        { header: 'First Name', key: 'firstName', width: 20 },
        { header: 'Middle Name', key: 'middleName', width: 20 },
        { header: 'Extension Name', key: 'extName', width: 15 },
        { header: 'Birthdate (DD/MM/YYYY)', key: 'birthdate', width: 25 },
        { header: 'Age', key: 'age', width: 10 },
        { header: 'Gender', key: 'gender', width: 12 },
        { header: 'Civil Status', key: 'civilStatus', width: 15 },
        { header: 'Barangay', key: 'barangay', width: 20 },
        { header: 'Designation', key: 'designation', width: 20 },
        { header: 'UNA Kard', key: 'unaKard', width: 25 },
        { header: 'IMC', key: 'imc', width: 20 },
        { header: 'U-Mobile Acct No.', key: 'uMobileAccount', width: 20 },
        { header: 'LGU Code No.', key: 'lguCodeNo', width: 20 },
        { header: 'FFRS System Generated No.', key: 'ffrsSystemGeneratedNo', width: 25 },
        { header: 'FFRS Date Encoded', key: 'ffrsDateEncoded', width: 20 },
        { header: 'FISHR No.', key: 'fishrNo', width: 20 },
        { header: 'Contact No.', key: 'contactNo', width: 20 },
        { header: 'Association', key: 'association', width: 25 },
        { header: 'No. of Family Members', key: 'familyMembers', width: 20 },
        { header: 'Organic (Y/N)', key: 'organic', width: 15 },
        { header: '4P\'s Member (Y/N)', key: 'fourPsMember', width: 15 },
        { header: 'IP\'s Member (Y/N)', key: 'ipsMember', width: 15 },
        { header: 'PWD Member (Y/N)', key: 'pwdMember', width: 15 },
        { header: 'Senior Citizen (Y/N)', key: 'seniorCitizen', width: 15 },
        { header: 'Solo Parent (Y/N)', key: 'soloParent', width: 15 },
        { header: 'No. of Severely Stunted Children (0-59 months)', key: 'severelyStuntedChildren', width: 25 },
        { header: 'Mother Maiden Name', key: 'motherMaidenName', width: 25 },
        { header: 'Household Head? (Y/N)', key: 'householdHead', width: 20 },
        { header: 'If No, specify', key: 'householdHeadSpecify', width: 20 },
        { header: 'Type of ID', key: 'typeOfId', width: 20 },
        { header: 'ID No.', key: 'idNo', width: 20 },
        { header: 'Farmer / Fisherfolk / Both', key: 'farmerFisherfolkBoth', width: 25 },
        { header: 'Farm Type', key: 'farmType', width: 20 },
        { header: 'Crop Area / No. of Heads', key: 'cropAreaOrHeads', width: 25 },
        { header: 'Crop Name', key: 'cropName', width: 20 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Registered On', key: 'createdAt', width: 25 },
        { header: 'Remarks', key: 'remarks', width: 30 },
      ]

      rows.forEach((row) => {
        worksheet.addRow(row)
      })

      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `records_export_${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Failed to export to Excel', err)
      toast.error('Failed to export records to Excel.')
    }
  }

  const handleOpenImport = () => {
    fileInputRef.current?.click()
  }

  const handleImportCsv = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setIsImporting(true)

      const fileName = file.name.toLowerCase()
      let parsedRows: Array<Record<string, string>> = []

      if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
        parsedRows = await parseExcelRows(file)
      } else {
        const csvText = await file.text()
        parsedRows = parseCsvRows(csvText)
      }

      if (parsedRows.length === 0) {
        toast.error('No valid rows found in the selected file.')
        setIsImporting(false)
        event.target.value = ''
        return
      }

      // Initialize import report
      const report: ImportReport = {
        totalRows: parsedRows.length,
        successfullyImported: 0,
        updated: 0,
        skippedUnchanged: 0,
        failed: 0,
        successfullyMappedFields: [],
        unmappedColumns: [],
        failedRows: [],
        errors: [],
      }

      console.log(`[Import] Starting import of ${parsedRows.length} rows from file: ${file.name}`)
      console.log(`[Import] Excel headers found:`, Object.keys(parsedRows[0] || {}))

      const mappedRows = parsedRows
        .map((row, index) => mapCsvRowToPayload(row, report, index + 2)) // +2 because row 1 is header
        .filter((row): row is ImportRecordPayload => row !== null)

      console.log(`[Import] Successfully mapped ${mappedRows.length} rows`)
      console.log(`[Import] Successfully mapped fields:`, report.successfullyMappedFields)
      console.log(`[Import] Unmapped columns:`, report.unmappedColumns)
      console.log(`[Import] Failed rows:`, report.failedRows)

      if (mappedRows.length === 0) {
        toast.error('No importable values found. Please check your file columns.', {
          description: `Unmapped columns: ${report.unmappedColumns.join(', ')}`,
        })
        setIsImporting(false)
        event.target.value = ''
        return
      }

      // Store preview data and show preview modal
      setPreviewData(mappedRows)
      setPreviewFileName(file.name)
      setShowPreviewModal(true)
    } catch (error) {
      console.error('File import failed', error)
      toast.error('Unable to import file. Please try again.')
    } finally {
      setIsImporting(false)
      event.target.value = ''
    }
  }

  const executeImport = async () => {
    try {
      setIsImporting(true)
      setShowConfirmDialog(false)
      setShowPreviewModal(false)

      const mappedRows = previewData

      // Initialize import report
      const report: ImportReport = {
        totalRows: mappedRows.length,
        successfullyImported: 0,
        updated: 0,
        skippedUnchanged: 0,
        failed: 0,
        successfullyMappedFields: [],
        unmappedColumns: [],
        failedRows: [],
        errors: [],
      }

      const existingData: ExistingImportRecord[] = []
      const batchSize = 1000
      let from = 0

      while (true) {
        const to = from + batchSize - 1
        const { data, error: existingError } = await supabase
          .from('records')
          .select('id,id_no,lgu_code_no,fishr_no,first_name,last_name,birthdate,barangay,contact_no,contact_number,name,type,crop_type,years_experience,status,middle_name,ext_name,age,gender,civil_status,designation,una_kard,imc,u_mobile_account,ffrs_system_generated_no,ffrs_date_encoded,association,family_members,organic,four_ps_member,ips_member,pwd_member,senior_citizen,solo_parent,severely_stunted_children,mother_maiden_name,household_head,household_head_specify,type_of_id,farmer_fisherfolk_both,farm_type,crop_area_or_heads,crop_name,remarks')
          .range(from, to)

        if (existingError) {
          console.error('Failed to load existing records for import matching', existingError)
          toast.error('Import failed. Could not check existing records.', {
            description: existingError.message || 'Please try again.',
          })
          return
        }

        if (!data || data.length === 0) break
        existingData.push(...(data as ExistingImportRecord[]))

        if (data.length < batchSize) break
        from += batchSize
      }

      type TrackerRecord = {
        id: number | undefined
        payload: ImportRecordPayload
      }

      const trackerList: TrackerRecord[] = existingData.map((rec) => ({
        id: rec.id,
        payload: {
          id_no: rec.id_no,
          lgu_code_no: rec.lgu_code_no,
          fishr_no: rec.fishr_no,
          first_name: rec.first_name,
          last_name: rec.last_name,
          middle_name: rec.middle_name,
          ext_name: rec.ext_name,
          birthdate: rec.birthdate,
          barangay: rec.barangay,
          contact_no: rec.contact_no,
          contact_number: rec.contact_number,
          name: rec.name,
          type: rec.type,
          crop_type: rec.crop_type,
          years_experience: rec.years_experience,
          status: rec.status,
          age: rec.age,
          gender: rec.gender,
          civil_status: rec.civil_status,
          designation: rec.designation,
          una_kard: rec.una_kard,
          imc: rec.imc,
          u_mobile_account: rec.u_mobile_account,
          ffrs_system_generated_no: rec.ffrs_system_generated_no,
          ffrs_date_encoded: rec.ffrs_date_encoded,
          association: rec.association,
          family_members: rec.family_members,
          organic: rec.organic,
          four_ps_member: rec.four_ps_member,
          ips_member: rec.ips_member,
          pwd_member: rec.pwd_member,
          senior_citizen: rec.senior_citizen,
          solo_parent: rec.solo_parent,
          severely_stunted_children: rec.severely_stunted_children,
          mother_maiden_name: rec.mother_maiden_name,
          household_head: rec.household_head,
          household_head_specify: rec.household_head_specify,
          type_of_id: rec.type_of_id,
          farmer_fisherfolk_both: rec.farmer_fisherfolk_both,
          farm_type: rec.farm_type,
          crop_area_or_heads: rec.crop_area_or_heads,
          crop_name: rec.crop_name,
          remarks: rec.remarks,
        },
      }))

      const lookupById = new Map<string, TrackerRecord>()
      const lookupByLgu = new Map<string, TrackerRecord>()
      const lookupByFishr = new Map<string, TrackerRecord>()
      const lookupByPerson = new Map<string, TrackerRecord>()
      const lookupByFallback = new Map<string, TrackerRecord>()
      const lookupByNameBrgy = new Map<string, TrackerRecord>()
      const lookupByName = new Map<string, TrackerRecord>()

      const registerLookup = (record: TrackerRecord) => {
        const payload = record.payload

        const idNo = normalizeKeyValue(payload.id_no)
        if (idNo && isValidIdentifier(idNo) && !lookupById.has(idNo)) lookupById.set(idNo, record)

        const lguCode = normalizeKeyValue(payload.lgu_code_no)
        if (lguCode && isValidIdentifier(lguCode) && !lookupByLgu.has(lguCode)) lookupByLgu.set(lguCode, record)

        const fishrNo = normalizeKeyValue(payload.fishr_no)
        if (fishrNo && isValidIdentifier(fishrNo) && !lookupByFishr.has(fishrNo)) lookupByFishr.set(fishrNo, record)

        const nameKey = getUnifiedNormalizedName(payload)
        const birthdate = normalizeKeyValue(payload.birthdate)
        if (nameKey && birthdate) {
          const personKey = `${nameKey}|${birthdate}`
          if (!lookupByPerson.has(personKey)) lookupByPerson.set(personKey, record)
        }

        const barangay = normalizeKeyValue(payload.barangay)
        const contact = normalizeKeyValue(payload.contact_no ?? payload.contact_number)
        if (nameKey && barangay && contact) {
          const fallbackKey = `${nameKey}|${barangay}|${contact}`
          if (!lookupByFallback.has(fallbackKey)) lookupByFallback.set(fallbackKey, record)
        }

        if (nameKey && barangay) {
          const nameBrgyKey = `${nameKey}|${barangay}`
          if (!lookupByNameBrgy.has(nameBrgyKey)) lookupByNameBrgy.set(nameBrgyKey, record)
        }

        if (nameKey && !lookupByName.has(nameKey)) {
          lookupByName.set(nameKey, record)
        }
      }

      trackerList.forEach(registerLookup)

      const findMatchingRecord = (incoming: ImportRecordPayload): TrackerRecord | undefined => {
        const idNo = normalizeKeyValue(incoming.id_no)
        if (idNo && isValidIdentifier(idNo) && lookupById.has(idNo)) return lookupById.get(idNo)

        const lguCode = normalizeKeyValue(incoming.lgu_code_no)
        if (lguCode && isValidIdentifier(lguCode) && lookupByLgu.has(lguCode)) return lookupByLgu.get(lguCode)

        const fishrNo = normalizeKeyValue(incoming.fishr_no)
        if (fishrNo && isValidIdentifier(fishrNo) && lookupByFishr.has(fishrNo)) return lookupByFishr.get(fishrNo)

        const checkNameMatch = (matched: TrackerRecord | undefined): TrackerRecord | undefined => {
          if (!matched) return undefined
          if (isSamePerson(incoming, matched.payload)) return matched
          return undefined
        }

        const nameKey = getUnifiedNormalizedName(incoming)
        const birthdate = normalizeKeyValue(incoming.birthdate)
        if (nameKey && birthdate) {
          const personKey = `${nameKey}|${birthdate}`
          const matched = lookupByPerson.get(personKey)
          const verified = checkNameMatch(matched)
          if (verified) return verified
        }

        // Smarter fallback matching - require more specific information
        const barangay = normalizeKeyValue(incoming.barangay)
        const contact = normalizeKeyValue(incoming.contact_no ?? incoming.contact_number)

        // Only use fallback if name has at least 2 parts (first + last name)
        const nameParts = nameKey.split(' ')
        if (nameKey && nameParts.length >= 2 && barangay && contact) {
          const fallbackKey = `${nameKey}|${barangay}|${contact}`
          const matched = lookupByFallback.get(fallbackKey)
          const verified = checkNameMatch(matched)
          if (verified) return verified
        }

        if (nameKey && nameParts.length >= 2 && barangay) {
          const nameBrgyKey = `${nameKey}|${barangay}`
          const matched = lookupByNameBrgy.get(nameBrgyKey)
          const verified = checkNameMatch(matched)
          if (verified) return verified
        }

        return undefined
      }

      const rowsToInsert: ImportRecordPayload[] = []
      const updatesMap = new Map<number, ImportRecordPayload>()

      mappedRows.forEach((incoming, index) => {
        const rowNumber = index + 2 // +2 because row 1 is header
        const matchedRecord = findMatchingRecord(incoming)

        if (!matchedRecord) {
          const newRecord: TrackerRecord = {
            id: undefined,
            payload: { ...incoming },
          }
          rowsToInsert.push(newRecord.payload)
          registerLookup(newRecord)
          report.successfullyImported += 1
          console.log(`[Import] Row ${rowNumber}: New record will be inserted`)
          return
        }

        if (matchedRecord.id !== undefined) {
          const additionalDataPayload = getNewAdditionalData(
            matchedRecord.payload as unknown as ExistingImportRecord,
            incoming
          )

          if (!additionalDataPayload) {
            report.skippedUnchanged += 1
            console.log(`[Import] Row ${rowNumber}: No changes detected, skipping`)
            return
          }

          Object.assign(matchedRecord.payload, additionalDataPayload)
          registerLookup(matchedRecord)

          const existingUpdate = updatesMap.get(matchedRecord.id)
          if (existingUpdate) {
            Object.assign(existingUpdate, additionalDataPayload)
          } else {
            updatesMap.set(matchedRecord.id, { ...additionalDataPayload })
          }
          report.updated += 1
          console.log(`[Import] Row ${rowNumber}: Existing record ID ${matchedRecord.id} will be updated`)
        } else {
          let hasMergedAdditional = false
          Object.entries(incoming).forEach(([key, value]) => {
            if (key === 'id') return
            const normalizedIncoming = normalizeComparableValue(value)
            if (normalizedIncoming === '') return

            const existingValue = (matchedRecord.payload as Record<string, unknown>)[key]
            const normalizedExisting = normalizeComparableValue(existingValue)

            if (normalizedIncoming !== normalizedExisting) {
              ; (matchedRecord.payload as Record<string, unknown>)[key] = value
              hasMergedAdditional = true
            }
          })

          if (hasMergedAdditional) {
            registerLookup(matchedRecord)
            report.updated += 1
            console.log(`[Import] Row ${rowNumber}: Unmatched record merged with additional data`)
          } else {
            report.skippedUnchanged += 1
          }
        }
      })

      const rowsToUpdate: Array<{ id: number; payload: ImportRecordPayload }> = []
      updatesMap.forEach((payload, id) => {
        rowsToUpdate.push({ id, payload })
      })

      if (rowsToInsert.length === 0 && rowsToUpdate.length === 0) {
        toast.success('Import complete. No new or updated records detected.')
        return
      }

      const chunkSize = 200
      for (let i = 0; i < rowsToInsert.length; i += chunkSize) {
        const chunk = rowsToInsert.slice(i, i + chunkSize)
        if (chunk.length === 0) continue
        const { error: insertError } = await supabase.from('records').insert(chunk)
        if (insertError) {
          console.error('Failed to insert imported records:', {
            message: insertError.message,
            details: insertError.details,
            hint: insertError.hint,
            code: insertError.code,
          })
          toast.error('Import failed while adding new records. Please verify the file data.', {
            description: insertError.message || undefined,
          })
          return
        }
      }

      for (const update of rowsToUpdate) {
        const { error: updateError } = await supabase
          .from('records')
          .update(update.payload)
          .eq('id', update.id)

        if (updateError) {
          console.error('Failed to update imported record:', {
            message: updateError.message,
            details: updateError.details,
            hint: updateError.hint,
            code: updateError.code,
          })
          toast.error('Import failed while updating existing records. Please retry.', {
            description: updateError.message || undefined,
          })
          return
        }
      }

      await loadRecords()

      // Log final import report
      console.log('[Import] Final Import Report:', report)

      toast.success('Import complete.', {
        description: `Added ${report.successfullyImported}, updated ${report.updated}, skipped ${report.skippedUnchanged}.`,
      })

      // Show detailed report if there are unmapped columns or failed rows
      if (report.unmappedColumns.length > 0) {
        console.warn(`[Import] ${report.unmappedColumns.length} columns were not mapped:`, report.unmappedColumns)
        toast.warning('Some columns were not mapped', {
          description: `Unmapped: ${report.unmappedColumns.slice(0, 5).join(', ')}${report.unmappedColumns.length > 5 ? '...' : ''}`,
        })
      }

      if (report.failedRows.length > 0) {
        console.error(`[Import] ${report.failedRows.length} rows failed to import:`, report.failedRows)
        toast.error('Some rows failed to import', {
          description: `${report.failedRows.length} rows had errors. Check console for details.`,
        })
      }
    } catch (error) {
      console.error('File import failed', error)
      toast.error('Unable to import file. Please try again.')
    } finally {
      setIsImporting(false)
      setPreviewData([])
      setPreviewFileName('')
    }
  }

  const clearFilters = () => {
    setSearchQuery('')
    setFilterType('All')
    setFilterStatus('All')
    setFilterSector('All')
    setFilterOrganization('All')
    setFilterAssociation('All')
    setFilterID('All')
  }

  const hasActiveFilters = useMemo(() => {
    return searchQuery !== '' ||
      filterType !== 'All' ||
      filterStatus !== 'All' ||
      filterSector !== 'All' ||
      filterOrganization !== 'All' ||
      filterAssociation !== 'All' ||
      filterID !== 'All'
  }, [searchQuery, filterType, filterStatus, filterSector, filterOrganization, filterAssociation, filterID])

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
              accept=".csv,text/csv,.xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
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
                <p className="text-xl font-bold text-foreground">{totalRecords.toLocaleString()}</p>
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
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">Type</label>
                <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                  <SelectTrigger className="h-9 border-border/50 bg-background/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-w-[200px]">
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
                  <SelectContent className="max-w-[200px]">
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
                  <SelectContent className="max-w-[250px]">
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
                <label className="text-xs font-medium text-foreground">Association</label>
                <Select value={filterAssociation} onValueChange={setFilterAssociation}>
                 <SelectTrigger className="h-9 w-full max-w-[220px] border-border/50 bg-background/50">                    <SelectValue className="truncate" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[250px] max-w-xs">
                    <SelectItem value="All">All Associations</SelectItem>
                    {filterOptions.associations.map(assoc => (
                      <SelectItem key={assoc} value={assoc}>{assoc}</SelectItem>
                    ))}
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
                  <SelectContent className="max-h-[300px] max-w-[250px]">
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
                  {recordsLoading ? 'Loading...' : `Showing ${paginatedRecords.length} of ${hasActiveFilters ? filteredRecords.length : totalRecords} records`}
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
                Export Excel
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">No</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Last Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">First Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Middle Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Ext Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Birthdate (DD/MM/YYYY)</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Age</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Gender</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Civil Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Barangay</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Designation</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">UNA KARD (PASSBOOK)</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {recordsLoading ? (
                  <tr>
                    <td colSpan={13} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        <p className="text-sm text-muted-foreground">Loading records...</p>
                      </div>
                    </td>
                  </tr>
                ) : paginatedRecords.length === 0 ? (
                  <tr>
                    <td colSpan={13} className="px-4 py-12 text-center">
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
                  paginatedRecords.map((record: RecordItem, rowIndex: number) => (
                    <tr
                      key={record.id}
                      className="group hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm text-foreground">
                        {(currentPage - 1) * itemsPerPage + rowIndex + 1}
                      </td>
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
                        {record.extName || '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground">
                        {formatRecordDate(record.birthdate) || '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground">
                        {record.age || '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground">
                        {record.gender || '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground">
                        {record.civilStatus || '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground">
                        {record.barangay || '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground">
                        {record.designation || '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground">
                        {record.unaKard || '—'}
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
        onSave={() => loadRecords()}
      />

      {/* Import Preview Modal */}
      <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
        <DialogContent className="max-w-6xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Import Preview</DialogTitle>
            <DialogDescription>
              Review the data from {previewFileName} before importing. Total records: {previewData.length}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-auto border rounded-md">
            <table className="w-full text-sm">
              <thead className="bg-muted sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left font-medium border-b">No.</th>
                  <th className="px-3 py-2 text-left font-medium border-b">Last Name</th>
                  <th className="px-3 py-2 text-left font-medium border-b">First Name</th>
                  <th className="px-3 py-2 text-left font-medium border-b">Middle Name</th>
                  <th className="px-3 py-2 text-left font-medium border-b">Barangay</th>
                  <th className="px-3 py-2 text-left font-medium border-b">Contact</th>
                  <th className="px-3 py-2 text-left font-medium border-b">Type</th>
                </tr>
              </thead>
              <tbody>
                {previewData.map((row, index) => (
                  <tr key={index} className="hover:bg-muted/50">
                    <td className="px-3 py-2 border-b">{index + 1}</td>
                    <td className="px-3 py-2 border-b">{row.last_name || '—'}</td>
                    <td className="px-3 py-2 border-b">{row.first_name || '—'}</td>
                    <td className="px-3 py-2 border-b">{row.middle_name || '—'}</td>
                    <td className="px-3 py-2 border-b">{row.barangay || '—'}</td>
                    <td className="px-3 py-2 border-b">{row.contact_number || row.contact_no || '—'}</td>
                    <td className="px-3 py-2 border-b">{row.farmer_fisherfolk_both || row.type || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowPreviewModal(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowConfirmDialog(true)} className="bg-primary">
              Import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure do you want to import this?</AlertDialogTitle>
            <AlertDialogDescription>
              This will import {previewData.length} records into the database. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No</AlertDialogCancel>
            <AlertDialogAction onClick={executeImport}>Yes</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  )
}