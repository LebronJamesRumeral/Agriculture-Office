'use client'

import { useState } from 'react'
import { AppLayout } from '@/components/app-layout'
import { RegistrationForm } from '@/components/registration-form'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { buildRecordNameFromParts } from '@/lib/records'
import { toast } from 'sonner'
import { 
  UserPlus, 
  Info, 
  CheckCircle2, 
  AlertCircle,
  ArrowLeft,
  Save,
  Loader2,
  FileCheck,
  HelpCircle
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

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
  pwdMember: string
  seniorCitizen: string
  soloParent: string
  severelyStuntedChildren: string
  motherMaidenName: string
  householdHead: string
  householdHeadSpecify: string
  typeOfId: string
  idNo: string
  farmerFisherfolkBoth: string
  yearsExperience: string
  farmType: string
  cropAreaOrHeads: string
  cropName: string
  remarks: string
}

export default function RegistrationPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeStep, setActiveStep] = useState(1)

  const handleSubmit = async (data: FormData) => {
    setIsSubmitting(true)

    try {
      const recordName = buildRecordNameFromParts({
        firstName: data.firstName,
        middleName: data.middleName,
        lastName: data.lastName,
        extName: data.extName,
      })

      // Prepare insert data with all fields properly mapped
      const insertData = {
        name: recordName,
        type: data.farmerFisherfolkBoth || data.designation || null,
        barangay: data.barangay || null,
        contact_number: data.contactNo || null,
        crop_type: data.cropName || null,
        years_experience: data.yearsExperience ? Number(data.yearsExperience) : null,
        status: 'Active',
        last_name: data.lastName || null,
        first_name: data.firstName || null,
        middle_name: data.middleName || null,
        ext_name: data.extName || null,
        birthdate: data.birthdate || null,
        age: data.age ? Number(data.age) : null,
        gender: data.gender || null,
        civil_status: data.civilStatus || null,
        designation: data.designation || null,
        una_kard: data.unaKard || null,
        imc: data.imc || null,
        u_mobile_account: data.uMobileAccount || null,
        lgu_code_no: data.lguCodeNo || null,
        ffrs_system_generated_no: data.ffrsSystemGeneratedNo || null,
        ffrs_date_encoded: data.ffrsDateEncoded || null,
        fishr_no: data.fishrNo || null,
        contact_no: data.contactNo || null,
        association: data.association || null,
        family_members: data.familyMembers ? Number(data.familyMembers) : null,
        organic: data.organic || null,
        four_ps_member: data.fourPsMember || null,
        ips_member: data.ipsMember || null,
        pwd_member: data.pwdMember || null,
        senior_citizen: data.seniorCitizen || null,
        solo_parent: data.soloParent || null,
        severely_stunted_children: data.severelyStuntedChildren
          ? Number(data.severelyStuntedChildren)
          : null,
        mother_maiden_name: data.motherMaidenName || null,
        household_head: data.householdHead || null,
        household_head_specify: data.householdHeadSpecify || null,
        type_of_id: data.typeOfId || null,
        id_no: data.idNo || null,
        farmer_fisherfolk_both: data.farmerFisherfolkBoth || null,
        farm_type: data.farmType || null,
        crop_area_or_heads: data.cropAreaOrHeads || null,
        crop_name: data.cropName || null,
        remarks: data.remarks || null,
      }

      const { data: result, error } = await supabase
        .from('records')
        .insert(insertData)
        .select()

      if (error) {
        console.error('Registration failed:', error)
        toast.error('Registration Failed', {
          description: error.message || 'Failed to save registration. Please try again.',
          duration: 5000,
        })
        setIsSubmitting(false)
        return
      }

      const displayName = `${data.firstName} ${data.lastName}`.trim()

      toast.success('Registration Successful!', {
        description: `${displayName} has been successfully registered.`,
        duration: 5000,
        icon: <CheckCircle2 className="h-4 w-4" />,
      })

      setIsSubmitting(false)
    } catch (err) {
      console.error('Unexpected error during registration:', err)
      toast.error('Unexpected Error', {
        description: 'An unexpected error occurred. Please try again.',
        duration: 5000,
      })
      setIsSubmitting(false)
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header with Back Button */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Link href="/records">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                New Registration
              </h1>
              <p className="text-sm text-muted-foreground md:text-base">
                Register a new farmer or fisherfolk in the system
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Registration Form - Takes 2/3 of the space */}
          <div className="lg:col-span-2">
            <Card className="border border-border/50 bg-gradient-to-br from-background via-background to-muted/20 p-6">
              <RegistrationForm onSubmit={handleSubmit} />
            </Card>
          </div>

          {/* Help Sidebar - Takes 1/3 of the space */}
          <div className="space-y-4">
            {/* Required Information Card */}
            <Card className="border border-border/50 bg-gradient-to-br from-background via-background to-muted/20 p-5">
              <div className="mb-4 flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-foreground">Required Information</h3>
              </div>
              <ul className="space-y-3">
                <li className="flex gap-2 text-sm">
                  <span className="text-primary">•</span>
                  <span className="text-muted-foreground">
                    Fields marked with <span className="font-medium text-foreground">*</span> are required
                  </span>
                </li>
                <li className="flex gap-2 text-sm">
                  <span className="text-primary">•</span>
                  <span className="text-muted-foreground">
                    Household head details needed if applicant is not the head
                  </span>
                </li>
                <li className="flex gap-2 text-sm">
                  <span className="text-primary">•</span>
                  <span className="text-muted-foreground">
                    Contact format: <span className="font-mono text-xs">09XX-XXX-XXXX</span>
                  </span>
                </li>
                <li className="flex gap-2 text-sm">
                  <span className="text-primary">•</span>
                  <span className="text-muted-foreground">
                    Valid ID required for verification
                  </span>
                </li>
              </ul>
            </Card>

            {/* Quick Tips Card */}
            <Card className="border border-border/50 bg-gradient-to-br from-background via-background to-muted/20 p-5">
              <div className="mb-4 flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-amber-500" />
                <h3 className="font-semibold text-foreground">Quick Tips</h3>
              </div>
              <div className="space-y-3">
                <div className="rounded-lg bg-amber-500/5 p-3">
                  <p className="text-xs font-medium text-amber-600">Personal Info</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Ensure names match government-issued IDs
                  </p>
                </div>
                <div className="rounded-lg bg-blue-500/5 p-3">
                  <p className="text-xs font-medium text-blue-600">Farm Details</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Specify crop type and area for accurate tracking
                  </p>
                </div>
                <div className="rounded-lg bg-green-500/5 p-3">
                  <p className="text-xs font-medium text-green-600">ID Verification</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Upload clear photos of both front and back
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Progress Indicator for Mobile */}
        {isSubmitting && (
          <div className="fixed bottom-4 right-4 z-50">
            <Card className="border border-primary/20 bg-primary/5 p-3 shadow-lg">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-xs font-medium text-foreground">Saving registration...</span>
              </div>
            </Card>
          </div>
        )}
      </div>
    </AppLayout>
  )
}