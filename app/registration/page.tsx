'use client'

import { useState } from 'react'
import { AppLayout } from '@/components/app-layout'
import { RegistrationForm } from '@/components/registration-form'
import { Card } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle } from 'lucide-react'

interface FormData {
  lastName: string
  firstName: string
  middleName: string
  extName: string
  birthdate: string
  age: string
  gender: string
  civilStatus: string
  barangay: string
  designation: string
  unaKard: string
  imc: string
  uMobileAccount: string
  lguCodeNo: string
  ffrsSystemGeneratedNo: string
  ffrsDateEncoded: string
  fishrNo: string
  contactNo: string
  association: string
  familyMembers: string
  organic: string
  fourPsMember: string
  ipsMember: string
  severelyStuntedChildren: string
  motherMaidenName: string
  householdHead: string
  householdHeadSpecify: string
  typeOfId: string
  idNo: string
  farmerFisherfolkBoth: string
  farmType: string
  cropAreaOrHeads: string
  cropName: string
  remarks: string
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

  const displayName = submittedData
    ? `${submittedData.firstName} ${submittedData.lastName}`.trim()
    : 'applicant'

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
              Registration submitted successfully for <strong>{displayName}</strong>! The record has
              been added to the system.
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
              <span>Household head details are needed when the applicant is not the head</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              <span>Contact number should be in 09XX-XXXX-XXX format</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              <span>Remarks can be used for any additional relevant information</span>
            </li>
          </ul>
        </Card>
      </div>
    </AppLayout>
  )
}
