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
  type: 'Farmer' | 'Fisherfolk'
  barangay: string
  contactNumber: string
  cropType: string
  yearsExperience: number
  createdAt: string
  status?: 'Active' | 'Inactive'
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
      const row = {
        ID: current.id,
        Name: current.name,
        Type: current.type,
        Barangay: current.barangay,
        Contact: current.contactNumber,
        CropFishType: current.cropType,
        YearsExperience: current.yearsExperience,
        Status: current.status ?? '',
        RegisteredOn: current.createdAt,
      }
      const ws = XLSX.utils.json_to_sheet([row])
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Record')
      XLSX.writeFile(wb, `record-${current.id}.xlsx`)
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
          {/* Name */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-primary">Full Name</label>
            {localMode === 'view' ? (
              <p className="text-sm text-foreground">{current.name}</p>
            ) : (
              <Input
                value={current.name}
                onChange={(e) =>
                  setEditData({ ...current, name: e.target.value })
                }
              />
            )}
          </div>

          {/* Type */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-primary">Type</label>
            {localMode === 'view' ? (
              <p className="text-sm text-foreground">{current.type}</p>
            ) : (
              <Select
                value={current.type}
                onValueChange={(value) =>
                  setEditData({
                    ...current,
                    type: value as 'Farmer' | 'Fisherfolk',
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Farmer">Farmer</SelectItem>
                  <SelectItem value="Fisherfolk">Fisherfolk</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Barangay */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-primary">Barangay</label>
            {localMode === 'view' ? (
              <p className="text-sm text-foreground">{current.barangay}</p>
            ) : (
              <Input
                value={current.barangay}
                onChange={(e) =>
                  setEditData({ ...current, barangay: e.target.value })
                }
              />
            )}
          </div>

          {/* Contact Number */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-primary">
              Contact Number
            </label>
            {localMode === 'view' ? (
              <p className="text-sm text-foreground">{current.contactNumber}</p>
            ) : (
              <Input
                value={current.contactNumber}
                onChange={(e) =>
                  setEditData({
                    ...current,
                    contactNumber: e.target.value,
                  })
                }
              />
            )}
          </div>

          {/* Crop/Fish Type */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-primary">
              {current.type === 'Farmer' ? 'Crop' : 'Fish'} Type
            </label>
            {localMode === 'view' ? (
              <p className="text-sm text-foreground">{current.cropType}</p>
            ) : (
              <Input
                value={current.cropType}
                onChange={(e) =>
                  setEditData({ ...current, cropType: e.target.value })
                }
              />
            )}
          </div>

          {/* Years of Experience */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-primary">
              Years of Experience
            </label>
            {localMode === 'view' ? (
              <p className="text-sm text-foreground">{current.yearsExperience}</p>
            ) : (
              <Input
                type="number"
                value={current.yearsExperience}
                onChange={(e) =>
                  setEditData({
                    ...current,
                    yearsExperience: parseInt(e.target.value),
                  })
                }
              />
            )}
          </div>

          {/* Status (View Only) */}
          {typeof current.status !== 'undefined' && (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-primary">Status</label>
              <span
                className={`inline-block w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                  current.status === 'Active'
                    ? 'bg-green-500/20 text-green-700 dark:text-green-400'
                    : 'bg-slate-500/20 text-slate-700 dark:text-slate-400'
                }`}
              >
                {current.status}
              </span>
            </div>
          )}

          {/* Created At (View Only) */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-primary">
              Registered On
            </label>
            <p className="text-sm text-foreground">{current.createdAt}</p>
          </div>
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
