'use client'

import { useState } from 'react'
import { AppLayout } from '@/components/app-layout'
import { RegistrationForm } from '@/components/registration-form'
import { Card } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle } from 'lucide-react'

interface FormData {
  fullName: string
  age: string
  gender: string
  address: string
  barangay: string
  contactNumber: string
  type: string
  cropType: string
  yearsExperience: string
  notes: string
  email?: string
  civilStatus?: string
  nationalId?: string
  education?: string
  livelihood?: string
  areaSize?: string
  householdSize?: string
  emergencyName?: string
  emergencyContact?: string
  registrationDate?: string
}

export default function RegistrationPage() {
  const [submitted, setSubmitted] = useState(false)
  const [submittedData, setSubmittedData] = useState<FormData | null>(null)

  const handleSubmit = (data: FormData) => {
    setSubmittedData(data)
    setSubmitted(true)
    // Reset after 5 seconds
    setTimeout(() => {
      setSubmitted(false)
      setSubmittedData(null)
    }, 5000)
  }

  return (
    <AppLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">New Registration</h1>
          <p className="text-muted-foreground">
            Register a new farmer or fisherfolk in the system
          </p>
        </div>

        {/* Success Alert */}
        {submitted && (
          <Alert className="border-green-500 bg-green-500/10">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              Registration submitted successfully for <strong>{submittedData?.fullName}</strong>!
              The record has been added to the system.
            </AlertDescription>
          </Alert>
        )}

        {/* Form Container */}
        <div className="max-w-4xl mx-auto">
          <RegistrationForm onSubmit={handleSubmit} />
        </div>

        {/* Info Card */}
        <Card className="border border-border bg-card p-6">
          <h3 className="mb-4 text-lg font-semibold text-foreground">Required Information</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              <span>All fields marked with <strong>*</strong> are required</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              <span>Crop/Fish Type and Years of Experience are optional but recommended</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              <span>Contact number should be in 09XX-XXXX-XXX format</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              <span>Use the Notes field for any additional relevant information</span>
            </li>
          </ul>
        </Card>
      </div>
    </AppLayout>
  )
}
