'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { X, Plus } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

interface AddAssociationModalProps {
  isOpen: boolean
  onClose: () => void
  onRefresh: () => void
}

export function AddAssociationModal({ isOpen, onClose, onRefresh }: AddAssociationModalProps) {
  const [associationName, setAssociationName] = useState('')
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAddClick = () => {
    if (!associationName.trim()) {
      toast.error('Please enter an association name')
      return
    }
    setShowConfirmDialog(true)
  }

  const handleConfirmAdd = async () => {
    setIsSubmitting(true)
    setShowConfirmDialog(false)

    try {
      // Check if association already exists
      const { data: existingRecords, error: checkError } = await supabase
        .from('records')
        .select('id')
        .ilike('association', associationName.trim())
        .limit(1)

      if (checkError) {
        throw checkError
      }

      if (existingRecords && existingRecords.length > 0) {
        toast.error('An association with this name already exists')
        setIsSubmitting(false)
        return
      }

      // Create a placeholder record for the new association
      const { error: insertError } = await supabase
        .from('records')
        .insert({
          name: 'Placeholder',
          association: associationName.trim(),
          status: 'inactive',
          type: 'farmer'
        })

      if (insertError) {
        throw insertError
      }

      toast.success('Association added successfully')
      setAssociationName('')
      onRefresh()
      onClose()
    } catch (error) {
      console.error('Error adding association:', error)
      toast.error('Failed to add association. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancelConfirm = () => {
    setShowConfirmDialog(false)
  }

  const handleClose = () => {
    setAssociationName('')
    setShowConfirmDialog(false)
    onClose()
  }

  if (!isOpen) return null

  return createPortal(
    <>
      {/* Main Modal */}
      <div
        className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md"
        onClick={handleClose}
      />

      <Card className="fixed left-1/2 top-1/2 z-[10000] w-[min(92vw,42rem)] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-card p-6 shadow-2xl">
        <div className="-m-6 mb-6 rounded-t-xl border-b border-primary/20 bg-gradient-to-br from-primary via-primary/90 to-primary/80 px-6 py-5 text-white">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
                New Association
              </p>
              <h2 className="text-2xl font-semibold">
                Add Association
              </h2>
              <p className="text-sm text-white/90">
                Create a new association for the registry
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20"
              title="Close"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="mt-6 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Association Name
            </label>
            <Input
              placeholder="Enter association name"
              value={associationName}
              onChange={(e) => setAssociationName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAddClick()
                }
              }}
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              Enter the name of the new association you want to add to the registry.
            </p>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <Button
            variant="outline"
            className="flex-1 border-border/50"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={handleAddClick}
            disabled={isSubmitting || !associationName.trim()}
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Adding...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Add Association
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="z-[10001]">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Addition</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to add this association?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelConfirm}>
              No
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmAdd}>
              Yes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  , document.body)
}
