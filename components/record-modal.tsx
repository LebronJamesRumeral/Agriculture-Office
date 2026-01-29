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
import { X, QrCode, FileSpreadsheet } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { Farmer } from '@/lib/farmers-service'

interface RecordModalProps {
  record: Farmer | null
  isOpen: boolean
  onClose: () => void
  mode: 'view' | 'edit'
}

export function RecordModal({ record, isOpen, onClose, mode }: RecordModalProps) {
  const [editData, setEditData] = useState<Farmer | null>(null)
  const [localMode, setLocalMode] = useState<'view' | 'edit'>(mode)

  // Keep internal state in sync when a record is selected
  useEffect(() => {
    if (record) setEditData(record)
    setLocalMode(mode)
  }, [record, mode])

  if (!isOpen || !record) return null

  const current = editData ?? record

  const handleGenerateQR = async () => {
    try {
      const QR = await import('qrcode')
      const data = current.qr_code
      const url = await QR.toDataURL(data, { margin: 2, width: 512 })
      const a = document.createElement('a')
      a.href = url
      a.download = `${current.full_name}-qr.png`
      document.body.appendChild(a)
      a.click()
      a.remove()
    } catch (err) {
      console.error('QR generation failed', err)
    }
  }

  const handleExportExcel = async () => {
    try {
      const ExcelJS = await import('exceljs')
      const workbook = new ExcelJS.default.Workbook()
      const worksheet = workbook.addWorksheet('Record')
      
      worksheet.columns = [
        { header: 'Field', key: 'field', width: 20 },
        { header: 'Value', key: 'value', width: 40 },
      ]
      
      worksheet.addRows([
        { field: 'QR Code', value: current.qr_code },
        { field: 'Full Name', value: current.full_name },
        { field: 'Type', value: current.farmer_type === 'farmer' ? 'Farmer' : 'Fisherfolk' },
        { field: 'Barangay', value: current.barangay },
        { field: 'Municipality', value: current.municipality },
        { field: 'Address', value: current.address },
        { field: 'Phone', value: current.phone || 'N/A' },
        { field: 'Email', value: current.email || 'N/A' },
        { field: 'Crop Type', value: current.crop_type || 'N/A' },
        { field: 'Farm Size', value: current.farm_size ? `${current.farm_size} ha` : 'N/A' },
        { field: 'Fishing Vessel', value: current.fishing_vessel || 'N/A' },
        { field: 'Status', value: current.status },
        { field: 'Registration Date', value: new Date(current.registration_date).toLocaleDateString() },
      ])
      
      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], { type: 'application/octet-stream' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${current.full_name}-record.xlsx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
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
        <div className="-m-6 mb-6 flex items-center justify-between rounded-t-xl bg-gradient-to-r from-green-600 to-lime-500 px-6 py-4">
          <h2 className="text-xl font-semibold text-white">
            {localMode === 'view' ? 'View Record' : 'Edit Record'}
          </h2>
          <div className="flex items-center gap-2">
            {localMode === 'view' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocalMode('edit')}
                className="text-white/90 hover:bg-white/10"
                title="Edit"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleGenerateQR}
              className="text-white/90 hover:bg-white/10"
              title="Generate QR"
            >
              <QrCode className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExportExcel}
              className="text-white/90 hover:bg-white/10"
              title="Export to Excel"
            >
              <FileSpreadsheet className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white/90 hover:bg-white/10"
              title="Close"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {/* QR Code */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-primary">QR Code</label>
            <p className="text-sm text-foreground font-mono">{current.qr_code}</p>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-primary">Full Name</label>
            <p className="text-sm text-foreground">{current.full_name}</p>
          </div>

          {/* Type */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-primary">Type</label>
            <p className="text-sm text-foreground">
              {current.farmer_type === 'farmer' ? 'Farmer' : 'Fisherfolk'}
            </p>
          </div>

          {/* Barangay */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-primary">Barangay</label>
            <p className="text-sm text-foreground">{current.barangay}</p>
          </div>

          {/* Municipality */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-primary">Municipality</label>
            <p className="text-sm text-foreground">{current.municipality}</p>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-primary">Address</label>
            <p className="text-sm text-foreground">{current.address}</p>
          </div>

          {/* Contact */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-primary">Phone Number</label>
            <p className="text-sm text-foreground">{current.phone || 'N/A'}</p>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-primary">Email</label>
            <p className="text-sm text-foreground">{current.email || 'N/A'}</p>
          </div>

          {/* Crop/Vessel */}
          {current.farmer_type === 'farmer' ? (
            <>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-primary">Crop Type</label>
                <p className="text-sm text-foreground">{current.crop_type || 'N/A'}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-primary">Farm Size</label>
                <p className="text-sm text-foreground">
                  {current.farm_size ? `${current.farm_size} hectares` : 'N/A'}
                </p>
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-primary">Fishing Vessel</label>
              <p className="text-sm text-foreground">{current.fishing_vessel || 'N/A'}</p>
            </div>
          )}

          {/* Status */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-primary">Status</label>
            <p className="text-sm text-foreground capitalize">{current.status}</p>
          </div>

          {/* Registration Date */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-primary">Registration Date</label>
            <p className="text-sm text-foreground">
              {new Date(current.registration_date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </Card>
    </>
  )
}
