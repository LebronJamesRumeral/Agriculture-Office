'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { X, Users, UserCheck, UserX, Loader2, Edit, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

type AssociationStats = {
  name: string
  active: number
  inactive: number
  total: number
}

interface AssociationModalProps {
  association: AssociationStats | null
  isOpen: boolean
  onClose: () => void
  onRefresh: () => void
}

export function AssociationModal({ association, isOpen, onClose, onRefresh }: AssociationModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<'Active' | 'Inactive'>('Active')
  const [isSaving, setIsSaving] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState('')
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (association) {
      // Determine the dominant status based on member counts
      const dominantStatus = association.active >= association.inactive ? 'Active' : 'Inactive'
      setSelectedStatus(dominantStatus)
      setEditedName(association.name)
    }
  }, [association])

  if (!mounted || !isOpen || !association) return null

  const handleStatusChange = async (newStatus: 'Active' | 'Inactive') => {
    if (newStatus === selectedStatus) return

    const previousStatus = selectedStatus
    setSelectedStatus(newStatus)
    setIsSaving(true)

    try {
      // Update all records in this association to the new status
      const { error } = await supabase
        .from('records')
        .update({ status: newStatus.toLowerCase() })
        .eq('association', association.name)

      if (error) {
        throw error
      }

      // Show success notification
      toast.success(`Association status updated to ${newStatus} successfully.`)

      // Refresh dashboard data
      onRefresh()
    } catch (error) {
      console.error('Error updating association status:', error)

      // Revert to previous status on error
      setSelectedStatus(previousStatus)

      // Show error notification
      toast.error('Failed to update association status. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditedName(association.name)
  }

  const handleSaveEdit = async () => {
    if (!editedName.trim()) {
      toast.error('Association name cannot be empty')
      return
    }

    if (editedName.trim() === association.name) {
      setIsEditing(false)
      return
    }

    setIsSaving(true)

    try {
      // Check if new name already exists
      const { data: existingRecords, error: checkError } = await supabase
        .from('records')
        .select('id')
        .ilike('association', editedName.trim())
        .limit(1)

      if (checkError) {
        throw checkError
      }

      if (existingRecords && existingRecords.length > 0) {
        toast.error('An association with this name already exists')
        setIsSaving(false)
        return
      }

      // Update all records with the old association name to the new name
      const { error: updateError } = await supabase
        .from('records')
        .update({ association: editedName.trim() })
        .eq('association', association.name)

      if (updateError) {
        throw updateError
      }

      toast.success('Association name updated successfully')
      setIsEditing(false)
      onRefresh()
      onClose()
    } catch (error) {
      console.error('Error updating association name:', error)
      toast.error('Failed to update association name. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    setShowDeleteDialog(false)

    try {
      // Delete all records with this association
      const { error } = await supabase
        .from('records')
        .delete()
        .eq('association', association.name)

      if (error) {
        throw error
      }

      toast.success('Association and all its members deleted successfully')
      onRefresh()
      onClose()
    } catch (error) {
      console.error('Error deleting association:', error)
      toast.error('Failed to delete association. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  const activePercentage = association.total > 0 
    ? Math.round((association.active / association.total) * 100) 
    : 0

  return createPortal(
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal */}
      <Card className="fixed left-1/2 top-1/2 z-[10000] w-[min(92vw,42rem)] max-h-[calc(100vh-120px)] overflow-y-auto scrollbar-hide -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-card p-6 shadow-2xl">
        <div className="-m-6 mb-6 rounded-t-xl border-b border-emerald-900/20 bg-gradient-to-br from-emerald-700 via-emerald-600 to-lime-600 px-6 py-5 text-white">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
                Association Details
              </p>
              {isEditing ? (
                <Input
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSaveEdit()
                    } else if (e.key === 'Escape') {
                      handleCancelEdit()
                    }
                  }}
                  disabled={isSaving}
                  autoFocus
                />
              ) : (
                <h2 className="text-2xl font-semibold">
                  {association.name}
                </h2>
              )}
              <p className="text-sm text-white/90">
                {association.total} {association.total === 1 ? 'member' : 'members'} registered
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCancelEdit}
                    className="rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20"
                    title="Cancel"
                    disabled={isSaving}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSaveEdit}
                    className="rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20"
                    title="Save"
                    disabled={isSaving}
                  >
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    SAVE
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleEdit}
                    className="rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20"
                    title="Edit"
                  >
                    EDIT
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowDeleteDialog(true)}
                    className="rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20"
                    title="Delete"
                  >
                    <Trash2 className="h-5 w-5" />
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
                </>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-6">
          {/* Status Overview */}
          <div className="rounded-lg border border-border bg-background/60 p-4">
            <p className="text-xs font-semibold uppercase text-muted-foreground mb-4">
              Status Overview
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Active Members</span>
                  <span className="font-semibold text-green-600">{association.active}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-500" 
                    style={{ width: `${activePercentage}%` }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Inactive Members</span>
                  <span className="font-semibold text-slate-500">{association.inactive}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div 
                    className="h-full bg-slate-300 dark:bg-slate-700 transition-all duration-500" 
                    style={{ width: `${100 - activePercentage}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Status Change */}
          <div className="rounded-lg border border-border bg-background/60 p-4">
            <p className="text-xs font-semibold uppercase text-muted-foreground mb-4">
              Change Association Status
            </p>
            <div className="space-y-2">
              <label className="text-sm font-medium text-primary">
                Association Status
              </label>
              <div className="relative">
                <Select
                  value={selectedStatus}
                  onValueChange={(value: 'Active' | 'Inactive') => handleStatusChange(value)}
                  disabled={isSaving}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="z-[10001]">
                    <SelectItem value="Active">
                      <div className="flex items-center gap-2">
                        <UserCheck className="h-4 w-4 text-green-600" />
                        <span>Active</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="Inactive">
                      <div className="flex items-center gap-2">
                        <UserX className="h-4 w-4 text-slate-500" />
                        <span>Inactive</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {isSaving && (
                  <div className="absolute right-8 top-1/2 -translate-y-1/2">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Changing the status will update all {association.total} members in this association.
                Changes are saved automatically.
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="rounded-lg border border-border bg-background/60 p-4">
            <p className="text-xs font-semibold uppercase text-muted-foreground mb-4">
              Quick Statistics
            </p>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-2xl font-bold text-foreground">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  {association.total}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Total Members</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {activePercentage}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">Active Rate</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-500">
                  {100 - activePercentage}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">Inactive Rate</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6">
          <Button
            variant="outline"
            className="w-full border-primary/30 text-primary hover:bg-primary/10"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="z-[10001]">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Association</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this association? This will also delete all {association.total} members registered under this association. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  , document.body)
}
