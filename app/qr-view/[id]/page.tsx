'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Download, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { mapRecordRow, formatRecordDate, type RecordRow } from '@/lib/records'
import ExcelJS from 'exceljs'

export default function QRViewPage() {
  const params = useParams()
  const recordId = params.id as string
  const [record, setRecord] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadRecord = async () => {
      try {
        const { data, error } = await supabase
          .from('records')
          .select('*')
          .eq('id', recordId)
          .single()

        if (error) {
          setError('Record not found')
          setLoading(false)
          return
        }

        if (data) {
          setRecord(mapRecordRow(data as RecordRow))
        }
        setLoading(false)
      } catch (err) {
        setError('Failed to load record')
        setLoading(false)
      }
    }

    if (recordId) {
      loadRecord()
    }
  }, [recordId])

  const handleExportExcel = async () => {
    if (!record) return
    try {
      const fullName = [record.lastName, record.firstName, record.middleName]
        .filter((v: any) => v && v.trim().length > 0)
        .join('_')
      const safeName = fullName.replace(/[^a-zA-Z0-9_-]/g, '_') || `record-${record.id}`
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Record')
      worksheet.columns = [
        { header: 'Field', key: 'field', width: 32 },
        { header: 'Value', key: 'value', width: 50 },
      ]
      const rows: Record<string, any> = {
        LastName: record.lastName || '',
        FirstName: record.firstName || '',
        MiddleName: record.middleName || '',
        ExtensionName: record.extName || '',
        Birthdate: formatRecordDate(record.birthdate) || '',
        Age: record.age || '',
        Gender: record.gender || '',
        CivilStatus: record.civilStatus || '',
        Barangay: record.barangay || '',
        Designation: record.designation || '',
        TypeOfID: record.typeOfId || '',
        IDNo: record.idNo || '',
        UNAKard: record.unaKard || '',
        IMC: record.imc || '',
        UMobileAcctNo: record.uMobileAccount || '',
        LGUCodeNo: record.lguCodeNo || '',
        FFRSSystemGeneratedNo: record.ffrsSystemGeneratedNo || '',
        FFRSDateEncoded: formatRecordDate(record.ffrsDateEncoded) || '',
        FISHRNo: record.fishrNo || '',
        ContactNo: record.contactNo || record.contactNumber || '',
        Association: record.association || '',
        FamilyMembers: record.familyMembers || '',
        Organic: record.organic || '',
        FourPsMember: record.fourPsMember || '',
        IPsMember: record.ipsMember || '',
        PWDMember: record.pwdMember || '',
        SeniorCitizen: record.seniorCitizen || '',
        SoloParent: record.soloParent || '',
        SeverelyStuntedChildren: record.severelyStuntedChildren || '',
        MotherMaidenName: record.motherMaidenName || '',
        HouseholdHead: record.householdHead || '',
        HouseholdHeadSpecify: record.householdHeadSpecify || '',
        FarmerFisherfolkBoth: record.farmerFisherfolkBoth || record.type || '',
        FarmType: record.farmType || '',
        CropAreaOrHeads: record.cropAreaOrHeads || '',
        CropName: record.cropName || record.cropType || '',
        Status: record.status || '',
        RegisteredOn: record.createdAt || '',
        Remarks: record.remarks || '',
      }
      Object.entries(rows).forEach(([key, value]) => {
        worksheet.addRow({ field: key, value: value == null ? '' : String(value) })
      })
      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${safeName}.xlsx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Excel export failed', err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black/80 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mx-auto mb-6 h-16 w-16">
            <div className="absolute inset-0 rounded-full border-4 border-white/20" />
            <div className="absolute inset-0 animate-spin rounded-full border-4 border-t-emerald-500 border-r-transparent border-b-transparent border-l-transparent" />
          </div>
          <p className="text-sm font-medium text-white">Loading record…</p>
        </div>
      </div>
    )
  }

  if (error || !record) {
    return (
      <div className="min-h-screen bg-black/80 flex items-center justify-center p-4">
        <Card className="p-8 max-w-sm w-full text-center">
          <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-red-50 flex items-center justify-center">
            <AlertCircle className="h-7 w-7 text-red-500" />
          </div>
          <h2 className="text-lg font-semibold mb-1">Record Not Found</h2>
          <p className="text-sm text-muted-foreground mb-6">{error || 'This QR code does not match any record.'}</p>
          <Button onClick={() => window.history.back()} className="w-full" variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </Card>
      </div>
    )
  }

  const displayName = [record.firstName, record.middleName, record.lastName, record.extName]
    .filter((v: any) => v && v.trim().length > 0)
    .join(' ')

  const recordType = record.farmerFisherfolkBoth || record.type || '—'
  const contactNo = record.contactNo || record.contactNumber || '—'
  const cropName = record.cropName || record.cropType || '—'

  const sections = [
    {
      title: 'Personal Information',
      fields: [
        { label: 'Last Name', value: record.lastName || '—' },
        { label: 'First Name', value: record.firstName || '—' },
        { label: 'Middle Name', value: record.middleName || '—' },
        { label: 'Extension Name', value: record.extName || '—' },
        { label: 'Birthdate', value: formatRecordDate(record.birthdate) || '—' },
        { label: 'Age', value: record.age || '—' },
        { label: 'Gender', value: record.gender || '—' },
        { label: 'Civil Status', value: record.civilStatus || '—' },
        { label: 'Barangay', value: record.barangay || '—' },
        { label: 'Designation', value: record.designation || '—' },
      ],
    },
    {
      title: 'IDs and Program Cards',
      fields: [
        { label: 'Type of ID', value: record.typeOfId || '—' },
        { label: 'ID No.', value: record.idNo || '—' },
        { label: 'UNA Kard (USSC Network Acct Kard)', value: record.unaKard || '—' },
        { label: 'Intervention Monitoring Card (IMC)', value: record.imc || '—' },
        { label: 'U-Mobile Acct No.', value: record.uMobileAccount || '—' },
        { label: 'LGU Code No.', value: record.lguCodeNo || '—' },
        { label: 'FFRS System Generated No.', value: record.ffrsSystemGeneratedNo || '—' },
        { label: 'FFRS Date Encoded', value: formatRecordDate(record.ffrsDateEncoded) || '—' },
        { label: 'FISHR No.', value: record.fishrNo || '—' },
      ],
    },
    {
      title: 'Household and Membership',
      fields: [
        { label: 'Contact No.', value: contactNo },
        { label: 'Association', value: record.association || '—' },
        { label: 'No. of Family Members', value: record.familyMembers || '—' },
        { label: 'Organic (Y/N)', value: record.organic || '—' },
        { label: "4P's Member (Y/N)", value: record.fourPsMember || '—' },
        { label: "IP's Member (Y/N)", value: record.ipsMember || '—' },
        { label: 'PWD Member (Y/N)', value: record.pwdMember || '—' },
        { label: 'Senior Citizen (Y/N)', value: record.seniorCitizen || '—' },
        { label: 'Solo Parent (Y/N)', value: record.soloParent || '—' },
        { label: 'No. of Severely Stunted Children (0-59 months)', value: record.severelyStuntedChildren || '—' },
        { label: 'Mother Maiden Name', value: record.motherMaidenName || '—' },
        { label: 'Household Head? (Y/N)', value: record.householdHead || '—' },
        { label: 'If No, specify', value: record.householdHeadSpecify || '—' },
      ],
    },
    {
      title: 'Farm / Fish Details',
      fields: [
        { label: 'Farmer / Fisherfolk / Both', value: recordType },
        { label: 'Farm Type', value: record.farmType || '—' },
        { label: 'Crop Area / No. of Heads', value: record.cropAreaOrHeads || '—' },
        { label: 'Crop Name', value: cropName },
      ],
    },
    {
      title: 'System Details',
      fields: [
        { label: 'Status', value: record.status || '—' },
        { label: 'Registered On', value: formatRecordDate(record.createdAt) || '—' },
        { label: 'Remarks', value: record.remarks || '—' },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-black/80 backdrop-blur-md flex items-start justify-center p-4 py-8">
      {/* Card — same width as the modal */}
      <div className="w-full max-w-[42rem]">
        <Card className="overflow-hidden rounded-xl border border-border shadow-2xl">

          {/* Green header — matches modal exactly */}
          <div className="-m-0 rounded-t-xl border-b border-emerald-900/20 bg-gradient-to-br from-emerald-700 via-emerald-600 to-lime-600 px-6 py-5 text-white">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
                  Olongapo City Agriculture Office
                </p>
                <h1 className="text-2xl font-semibold">Record Details</h1>
                <p className="text-sm font-medium text-white/90">{displayName || 'Unnamed Record'}</p>
              </div>
              {/* Back + Export actions */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleExportExcel}
                  className="rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20"
                  title="Export to Excel"
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.history.back()}
                  className="rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20"
                  title="Go Back"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Body — matches modal content area */}
          <div className="bg-card p-6">
            <div className="space-y-6">
              {sections.map((section) => (
                <div key={section.title} className="rounded-lg border border-border bg-background/60 p-4">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">
                    {section.title}
                  </p>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    {section.fields.map((field) => (
                      <div key={field.label} className="space-y-1">
                        <label className="text-xs font-semibold text-primary">
                          {field.label}
                        </label>
                        <p className="text-sm text-foreground">{field.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer export button */}
            <div className="mt-6">
              <Button
                onClick={handleExportExcel}
                variant="outline"
                className="w-full gap-2 border-primary/30 text-primary hover:bg-primary/10"
              >
                <Download className="h-4 w-4" />
                Export to Excel
              </Button>
            </div>
          </div>

        </Card>
      </div>
    </div>
  )
}
