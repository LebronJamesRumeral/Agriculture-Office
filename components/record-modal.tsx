'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { X, Edit2, QrCode, FileSpreadsheet } from 'lucide-react'
import { useEffect, useState } from 'react'

interface Record {
  id: number
  name: string
  type: 'Farmer' | 'Fisherfolk' | 'Both'
  barangay: string
  contactNumber: string
  cropType: string
  yearsExperience: number
  createdAt: string
  status?: 'Active' | 'Inactive'
  lastName?: string
  firstName?: string
  middleName?: string
  extName?: string
  birthdate?: string
  age?: string
  gender?: string
  civilStatus?: string
  designation?: string
  unaKard?: string
  imc?: string
  uMobileAccount?: string
  lguCodeNo?: string
  ffrsSystemGeneratedNo?: string
  ffrsDateEncoded?: string
  fishrNo?: string
  contactNo?: string
  association?: string
  familyMembers?: string
  organic?: string
  fourPsMember?: string
  ipsMember?: string
  severelyStuntedChildren?: string
  motherMaidenName?: string
  householdHead?: string
  householdHeadSpecify?: string
  typeOfId?: string
  idNo?: string
  farmerFisherfolkBoth?: string
  farmType?: string
  cropAreaOrHeads?: string
  cropName?: string
  remarks?: string
}

interface RecordModalProps {
  record: Record | null
  isOpen: boolean
  onClose: () => void
  mode: 'view' | 'edit'
}

export function RecordModal({ record, isOpen, onClose, mode }: RecordModalProps) {
  const [editData, setEditData] = useState<Record | null>(null)
  const [localMode, setLocalMode] = useState<'view' | 'edit'>(mode)

  // Keep internal state in sync when a record is selected
  useEffect(() => {
    if (record) setEditData(record)
    setLocalMode(mode)
  }, [record, mode])

  if (!isOpen || !record) return null

  const current = editData ?? record
  const nameParts = current.name ? current.name.split(' ') : []
  const derived = {
    firstName: current.firstName ?? nameParts[0] ?? '',
    lastName: current.lastName ?? nameParts[nameParts.length - 1] ?? '',
    middleName:
      current.middleName ?? (nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : ''),
    contactNo: current.contactNo ?? current.contactNumber ?? '',
    farmerFisherfolkBoth: current.farmerFisherfolkBoth ?? current.type ?? '',
    cropName: current.cropName ?? current.cropType ?? '',
  }
  const displayName = [derived.firstName, derived.middleName, derived.lastName]
    .filter((value) => value && value.trim().length > 0)
    .join(' ')

  const handleSave = () => {
    // Mock save - in real app, would call API
    setLocalMode('view')
  }

  const handleCancel = () => {
    if (record) setEditData(record)
    setLocalMode('view')
  }

  const handleGenerateQR = async () => {
    try {
      const QR = await import('qrcode')
      const data = JSON.stringify(current)
      const url = await QR.toDataURL(data, { margin: 2, width: 512 })
      const a = document.createElement('a')
      a.href = url
      a.download = `record-${current.id}-qr.png`
      document.body.appendChild(a)
      a.click()
      a.remove()
    } catch (err) {
      console.error('QR generation failed', err)
    }
  }

  const handleExportExcel = async () => {
    try {
      const XLSX = await import('xlsx')
      const fullName = [derived.lastName, derived.firstName, derived.middleName]
        .filter((value) => value && value.trim().length > 0)
        .join('_')
      const safeName = fullName.replace(/[^a-zA-Z0-9_-]/g, '_') || `record-${current.id}`
      const row = {
        ID: current.id,
        LastName: derived.lastName,
        FirstName: derived.firstName,
        MiddleName: derived.middleName,
        ExtensionName: current.extName ?? '',
        Birthdate: current.birthdate ?? '',
        Age: current.age ?? '',
        Gender: current.gender ?? '',
        CivilStatus: current.civilStatus ?? '',
        Barangay: current.barangay,
        Designation: current.designation ?? '',
        UNAKard: current.unaKard ?? '',
        IMC: current.imc ?? '',
        UMobileAcctNo: current.uMobileAccount ?? '',
        LGUCodeNo: current.lguCodeNo ?? '',
        FFRSSystemGeneratedNo: current.ffrsSystemGeneratedNo ?? '',
        FFRSDateEncoded: current.ffrsDateEncoded ?? '',
        FISHRNo: current.fishrNo ?? '',
        ContactNo: derived.contactNo,
        Association: current.association ?? '',
        FamilyMembers: current.familyMembers ?? '',
        Organic: current.organic ?? '',
        FourPsMember: current.fourPsMember ?? '',
        IPsMember: current.ipsMember ?? '',
        SeverelyStuntedChildren: current.severelyStuntedChildren ?? '',
        MotherMaidenName: current.motherMaidenName ?? '',
        HouseholdHead: current.householdHead ?? '',
        HouseholdHeadSpecify: current.householdHeadSpecify ?? '',
        TypeOfID: current.typeOfId ?? '',
        IDNo: current.idNo ?? '',
        FarmerFisherfolkBoth: derived.farmerFisherfolkBoth,
        FarmType: current.farmType ?? '',
        CropAreaOrHeads: current.cropAreaOrHeads ?? '',
        CropName: derived.cropName,
        Remarks: current.remarks ?? '',
        Type: current.type,
        CropFishType: current.cropType,
        YearsExperience: current.yearsExperience,
        Status: current.status ?? '',
        RegisteredOn: current.createdAt,
      }
      const ws = XLSX.utils.json_to_sheet([row])
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Record')
      XLSX.writeFile(wb, `${safeName}.xlsx`)
    } catch (err) {
      console.error('Excel export failed', err)
    }
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[1px]"
        onClick={onClose}
      />

      {/* Modal */}
      <Card className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl max-h-[70vh] overflow-y-auto -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-card p-6 shadow-2xl">
        <div className="-m-6 mb-6 rounded-t-xl border-b border-emerald-900/20 bg-gradient-to-br from-emerald-700 via-emerald-600 to-lime-600 px-6 py-5 text-white">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
                Olongapo City Agriculture Office
              </p>
              <h2 className="text-2xl font-semibold">
                {localMode === 'view' ? 'Record Details' : 'Edit Record'}
              </h2>
              <div className="flex flex-wrap items-center gap-2 text-sm text-white/90">
                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                  ID {current.id}
                </span>
                <span className="font-medium">
                  {displayName || 'Unnamed Record'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
            {localMode === 'view' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocalMode('edit')}
                className="rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20"
                title="Edit"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleGenerateQR}
              className="rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20"
              title="Generate QR"
            >
              <QrCode className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExportExcel}
              className="rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20"
              title="Export to Excel"
            >
              <FileSpreadsheet className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20"
              title="Close"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          </div>
        </div>

        <div className="mt-6 space-y-5">
          {[
            {
              title: 'Personal Information',
              fields: [
                { label: 'Last Name', key: 'lastName', fallback: derived.lastName },
                { label: 'First Name', key: 'firstName', fallback: derived.firstName },
                { label: 'Middle Name', key: 'middleName', fallback: derived.middleName },
                { label: 'Extension Name', key: 'extName' },
                { label: 'Birthdate', key: 'birthdate' },
                { label: 'Age', key: 'age' },
                { label: 'Gender', key: 'gender' },
                { label: 'Civil Status', key: 'civilStatus' },
                { label: 'Barangay', key: 'barangay' },
                { label: 'Designation', key: 'designation' },
              ],
            },
            {
              title: 'IDs and Program Cards',
              fields: [
                { label: 'Type of ID', key: 'typeOfId' },
                { label: 'ID No.', key: 'idNo' },
                { label: 'UNA Kard (USSC Network Acct Kard)', key: 'unaKard' },
                { label: 'Intervention Monitoring Card (IMC)', key: 'imc' },
                { label: 'U-Mobile Acct No.', key: 'uMobileAccount' },
                { label: 'LGU Code No.', key: 'lguCodeNo' },
                { label: 'FFRS System Generated No.', key: 'ffrsSystemGeneratedNo' },
                { label: 'FFRS Date Encoded', key: 'ffrsDateEncoded' },
                { label: 'FISHR No.', key: 'fishrNo' },
              ],
            },
            {
              title: 'Household and Membership',
              fields: [
                { label: 'Contact No.', key: 'contactNo', fallback: derived.contactNo },
                { label: 'Association', key: 'association' },
                { label: 'No. of Family Members', key: 'familyMembers' },
                { label: 'Organic (Y/N)', key: 'organic' },
                { label: "4P's Member (Y/N)", key: 'fourPsMember' },
                { label: "IP's Member (Y/N)", key: 'ipsMember' },
                {
                  label: 'No. of Severely Stunted Children (0-59 months)',
                  key: 'severelyStuntedChildren',
                },
                { label: 'Mother Maiden Name', key: 'motherMaidenName' },
                { label: 'Household Head? (Y/N)', key: 'householdHead' },
                { label: 'If No, specify', key: 'householdHeadSpecify' },
              ],
            },
            {
              title: 'Farm / Fish Details',
              fields: [
                {
                  label: 'Farmer / Fisherfolk / Both',
                  key: 'farmerFisherfolkBoth',
                  fallback: derived.farmerFisherfolkBoth,
                },
                { label: 'Farm Type', key: 'farmType' },
                { label: 'Crop Area / No. of Heads', key: 'cropAreaOrHeads' },
                { label: 'Crop Name', key: 'cropName', fallback: derived.cropName },
              ],
            },
            {
              title: 'System Details',
              fields: [
                { label: 'Status', key: 'status' },
                { label: 'Registered On', key: 'createdAt' },
                { label: 'Remarks', key: 'remarks', multiline: true },
              ],
            },
          ].map((section) => (
            <div key={section.title} className="rounded-lg border border-border bg-background/60 p-4">
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                {section.title}
              </p>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {section.fields.map((field) => {
                  const rawValue = (current as Record)[field.key as keyof Record]
                  const displayValue =
                    typeof rawValue === 'string' && rawValue.trim().length > 0
                      ? rawValue
                      : field.fallback ?? ''
                  const fallbackValue = displayValue?.toString().trim()
                    ? displayValue
                    : '—'

                  if (localMode === 'view' || !field.key) {
                    return (
                      <div key={field.label} className="space-y-1">
                        <label className="text-xs font-semibold text-primary">
                          {field.label}
                        </label>
                        <p className="text-sm text-foreground">{fallbackValue}</p>
                      </div>
                    )
                  }

                  if (field.multiline) {
                    return (
                      <div key={field.label} className="space-y-1 md:col-span-2">
                        <label className="text-xs font-semibold text-primary">
                          {field.label}
                        </label>
                        <textarea
                          value={displayValue}
                          onChange={(e) =>
                            setEditData({
                              ...current,
                              [field.key as keyof Record]: e.target.value,
                            })
                          }
                          className="min-h-[90px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                        />
                      </div>
                    )
                  }

                  if (field.key === 'status') {
                    return (
                      <div key={field.label} className="space-y-1">
                        <label className="text-xs font-semibold text-primary">
                          {field.label}
                        </label>
                        <Select
                          value={displayValue}
                          onValueChange={(value) =>
                            setEditData({
                              ...current,
                              status: value as Record['status'],
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Active">Active</SelectItem>
                            <SelectItem value="Inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )
                  }

                  if (field.key === 'designation') {
                    return (
                      <div key={field.label} className="space-y-1">
                        <label className="text-xs font-semibold text-primary">
                          {field.label}
                        </label>
                        <Select
                          value={displayValue}
                          onValueChange={(value) =>
                            setEditData({
                              ...current,
                              designation: value,
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select designation" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Fisherfolk">Fisherfolk</SelectItem>
                            <SelectItem value="Farmer">Farmer</SelectItem>
                            <SelectItem value="Both">Both</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )
                  }

                  if (field.key === 'createdAt') {
                    return (
                      <div key={field.label} className="space-y-1">
                        <label className="text-xs font-semibold text-primary">
                          {field.label}
                        </label>
                        <Input value={displayValue} readOnly />
                      </div>
                    )
                  }

                  return (
                    <div key={field.label} className="space-y-1">
                      <label className="text-xs font-semibold text-primary">
                        {field.label}
                      </label>
                      <Input
                        value={displayValue}
                        onChange={(e) =>
                          setEditData({
                            ...current,
                            [field.key as keyof Record]: e.target.value,
                          })
                        }
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <Button
            variant="outline"
            className="flex-1 border-primary/30 text-primary hover:bg-primary/10"
            onClick={localMode === 'edit' ? handleCancel : onClose}
          >
            {localMode === 'view' ? 'Close' : 'Cancel'}
          </Button>
          {localMode === 'edit' && (
            <Button
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={handleSave}
            >
              Save Changes
            </Button>
          )}
        </div>
      </Card>
    </>
  )
}
