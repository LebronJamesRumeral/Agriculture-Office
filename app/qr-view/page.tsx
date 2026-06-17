'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Download, QrCode } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { mapRecordRow, type RecordRow } from '@/lib/records'
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
        .filter((value: any) => value && value.trim().length > 0)
        .join('_')
      const safeName = fullName.replace(/[^a-zA-Z0-9_-]/g, '_') || `record-${record.id}`
      const row = {
        ID: record.id,
        LastName: record.lastName || '',
        FirstName: record.firstName || '',
        MiddleName: record.middleName || '',
        ExtensionName: record.extName || '',
        Birthdate: record.birthdate || '',
        Age: record.age || '',
        Gender: record.gender || '',
        CivilStatus: record.civilStatus || '',
        Barangay: record.barangay || '',
        Designation: record.designation || '',
        UNAKard: record.unaKard || '',
        IMC: record.imc || '',
        UMobileAcctNo: record.uMobileAccount || '',
        LGUCodeNo: record.lguCodeNo || '',
        FFRSSystemGeneratedNo: record.ffrsSystemGeneratedNo || '',
        FFRSDateEncoded: record.ffrsDateEncoded || '',
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
        TypeOfID: record.typeOfId || '',
        IDNo: record.idNo || '',
        FarmerFisherfolkBoth: record.farmerFisherfolkBoth || record.type || '',
        FarmType: record.farmType || '',
        CropAreaOrHeads: record.cropAreaOrHeads || '',
        CropName: record.cropName || record.cropType || '',
        Remarks: record.remarks || '',
        Type: record.type,
        CropFishType: record.cropType,
        YearsExperience: record.yearsExperience,
        Status: record.status || '',
        RegisteredOn: record.createdAt,
      }
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Record')

      const entries = Object.entries(row)
      worksheet.columns = [
        { header: 'Field', key: 'field', width: 32 },
        { header: 'Value', key: 'value', width: 50 },
      ]
      entries.forEach(([key, value]) => {
        worksheet.addRow({
          field: key,
          value: value == null ? '' : String(value),
        })
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
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-lime-50 flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading record...</p>
        </div>
      </div>
    )
  }

  if (error || !record) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-lime-50 flex items-center justify-center">
        <Card className="p-8 max-w-md">
          <p className="text-center text-destructive">{error || 'Record not found'}</p>
          <Button
            onClick={() => window.history.back()}
            className="mt-4 w-full"
            variant="outline"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </Card>
      </div>
    )
  }

  const displayName = [record.firstName, record.middleName, record.lastName, record.extName]
    .filter((value: any) => value && value.trim().length > 0)
    .join(' ')

  const sections = [
    {
      title: 'Personal Information',
      fields: [
        { label: 'Last Name', value: record.lastName || '—' },
        { label: 'First Name', value: record.firstName || '—' },
        { label: 'Middle Name', value: record.middleName || '—' },
        { label: 'Extension Name', value: record.extName || '—' },
        { label: 'Birthdate', value: record.birthdate || '—' },
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
        { label: 'UNA Kard', value: record.unaKard || '—' },
        { label: 'IMC', value: record.imc || '—' },
        { label: 'U-Mobile Acct No.', value: record.uMobileAccount || '—' },
        { label: 'LGU Code No.', value: record.lguCodeNo || '—' },
        { label: 'FFRS System Generated No.', value: record.ffrsSystemGeneratedNo || '—' },
        { label: 'FFRS Date Encoded', value: record.ffrsDateEncoded || '—' },
        { label: 'FISHR No.', value: record.fishrNo || '—' },
      ],
    },
    {
      title: 'Household and Membership',
      fields: [
        { label: 'Contact No.', value: record.contactNo || record.contactNumber || '—' },
        { label: 'Association', value: record.association || '—' },
        { label: 'No. of Family Members', value: record.familyMembers || '—' },
        { label: 'Organic', value: record.organic || '—' },
        { label: "4P's Member", value: record.fourPsMember || '—' },
        { label: "IP's Member", value: record.ipsMember || '—' },
        { label: 'PWD Member', value: record.pwdMember || '—' },
        { label: 'Senior Citizen', value: record.seniorCitizen || '—' },
        { label: 'Solo Parent', value: record.soloParent || '—' },
        { label: 'No. of Severely Stunted Children', value: record.severelyStuntedChildren || '—' },
        { label: 'Mother Maiden Name', value: record.motherMaidenName || '—' },
        { label: 'Household Head?', value: record.householdHead || '—' },
        { label: 'If No, specify', value: record.householdHeadSpecify || '—' },
      ],
    },
    {
      title: 'Farm / Fish Details',
      fields: [
        { label: 'Farmer / Fisherfolk / Both', value: record.farmerFisherfolkBoth || record.type || '—' },
        { label: 'Farm Type', value: record.farmType || '—' },
        { label: 'Crop Area / No. of Heads', value: record.cropAreaOrHeads || '—' },
        { label: 'Crop Name', value: record.cropName || record.cropType || '—' },
      ],
    },
    {
      title: 'System Details',
      fields: [
        { label: 'Status', value: record.status || '—' },
        { label: 'Registered On', value: record.createdAt || '—' },
        { label: 'Remarks', value: record.remarks || '—' },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-lime-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Button
          onClick={() => window.history.back()}
          variant="outline"
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <Card className="overflow-hidden">
          <div className="bg-gradient-to-br from-emerald-700 via-emerald-600 to-lime-600 px-6 py-5 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70 mb-2">
              Olongapo City Agriculture Office
            </p>
            <h1 className="text-2xl font-semibold mb-2">Record Details</h1>
            <p className="text-white/90">{displayName || 'Unnamed Record'}</p>
          </div>

          <div className="p-6 space-y-6">
            {sections.map((section) => (
              <div key={section.title} className="rounded-lg border border-border bg-background/60 p-4">
                <p className="text-xs font-semibold uppercase text-muted-foreground mb-4">
                  {section.title}
                </p>
                <div className="grid gap-4 md:grid-cols-2">
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

          <div className="p-6 border-t border-border">
            <Button
              onClick={handleExportExcel}
              className="w-full gap-2"
              variant="outline"
            >
              <Download className="h-4 w-4" />
              Export to Excel
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
