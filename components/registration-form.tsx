'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { 
  User, 
  Calendar, 
  Phone, 
  MapPin, 
  Users, 
  CreditCard,
  Home,
  AlertCircle,
  FileText,
  Heart,
  Leaf,
  Droplets,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { Alert, AlertDescription } from '@/components/ui/alert'

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
  farmType: string
  cropAreaOrHeads: string
  cropName: string
  remarks: string
  deceased: string
}

const steps = [
  { 
    id: 1, 
    title: 'Personal',
    icon: User,
    description: 'Basic details about the applicant'
  },
  { 
    id: 2, 
    title: 'IDs', 
    icon: CreditCard,
    description: 'Government IDs and program membership'
  },
  { 
    id: 3, 
    title: 'Household',
    icon: Users,
    description: 'Family and social program details'
  },
  { 
    id: 4, 
    title: 'Applicant',
    icon: FileText,
    description: 'Type of applicant and valid ID'
  },
  { 
    id: 5, 
    title: 'Farm',
    icon: Leaf,
    description: 'Agricultural information and notes'
  },
]

export function RegistrationForm({ onSubmit }: { onSubmit: (data: FormData) => void }) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    lastName: '',
    firstName: '',
    middleName: '',
    extName: '',
    birthdate: '',
    age: '',
    gender: '',
    civilStatus: '',
    barangay: '',
    designation: '',
    unaKard: '',
    imc: '',
    uMobileAccount: '',
    lguCodeNo: '',
    ffrsSystemGeneratedNo: '',
    ffrsDateEncoded: '',
    fishrNo: '',
    contactNo: '',
    association: '',
    familyMembers: '',
    organic: '',
    fourPsMember: '',
    ipsMember: '',
    pwdMember: '',
    seniorCitizen: '',
    soloParent: '',
    severelyStuntedChildren: '',
    motherMaidenName: '',
    householdHead: '',
    householdHeadSpecify: '',
    typeOfId: '',
    idNo: '',
    farmerFisherfolkBoth: '',
    farmType: '',
    cropAreaOrHeads: '',
    cropName: '',
    remarks: '',
    deceased: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [duplicateCheck, setDuplicateCheck] = useState<{
    checking: boolean
    isDuplicate: boolean
    message: string
    existingRecord?: any
  }>({
    checking: false,
    isDuplicate: false,
    message: ''
  })

  // Check for duplicates when relevant fields change
  useEffect(() => {
    const checkDuplicate = async () => {
      // Only check if we have enough information
      if (!formData.firstName || !formData.lastName || !formData.birthdate) {
        setDuplicateCheck({ checking: false, isDuplicate: false, message: '' })
        return
      }

      setDuplicateCheck(prev => ({ ...prev, checking: true }))

      try {
        const { data, error } = await supabase
          .from('records')
          .select('*')
          .eq('first_name', formData.firstName.trim())
          .eq('last_name', formData.lastName.trim())
          .eq('birthdate', formData.birthdate)

        if (error) {
          console.error('Error checking duplicates:', error)
          setDuplicateCheck({ checking: false, isDuplicate: false, message: '' })
          return
        }

        if (data && data.length > 0) {
          const existing = data[0]
          setDuplicateCheck({
            checking: false,
            isDuplicate: true,
            message: `A record with the same name and birthdate already exists.`,
            existingRecord: existing
          })
        } else {
          setDuplicateCheck({ checking: false, isDuplicate: false, message: '' })
        }
      } catch (error) {
        console.error('Error in duplicate check:', error)
        setDuplicateCheck({ checking: false, isDuplicate: false, message: '' })
      }
    }

    // Debounce the check to avoid too many requests
    const timeoutId = setTimeout(checkDuplicate, 500)
    return () => clearTimeout(timeoutId)
  }, [formData.firstName, formData.lastName, formData.birthdate])

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {}

    if (step === 1) {
      if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required'
      if (!formData.firstName.trim()) newErrors.firstName = 'First name is required'
      if (!formData.middleName.trim()) newErrors.middleName = 'Middle name is required'
      if (!formData.birthdate) newErrors.birthdate = 'Birthdate is required'
      if (!formData.age) {
        newErrors.age = 'Age is required'
      } else if (Number(formData.age) < 18) {
        newErrors.age = 'Minimum age is 18'
      }
      if (!formData.gender) newErrors.gender = 'Gender is required'
      if (!formData.civilStatus) newErrors.civilStatus = 'Civil status is required'
      if (!formData.barangay) newErrors.barangay = 'Barangay is required'
    }

    if (step === 2) {
      if (!formData.contactNo.trim()) newErrors.contactNo = 'Contact number is required'
    }

    if (step === 3) {
      if (!formData.householdHead) newErrors.householdHead = 'Household head status is required'
      if (formData.householdHead === 'No' && !formData.householdHeadSpecify.trim()) {
        newErrors.householdHeadSpecify = 'Please specify household head'
      }
    }

    if (step === 4) {
      if (!formData.typeOfId.trim()) newErrors.typeOfId = 'Type of ID is required'
      if (!formData.idNo.trim()) newErrors.idNo = 'ID number is required'
      if (!formData.farmerFisherfolkBoth) newErrors.farmerFisherfolkBoth = 'Please select applicant type'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault()
    if (validateStep(currentStep)) {
      // If on step 1 and duplicate exists, show warning but allow proceeding
      if (currentStep === 1 && duplicateCheck.isDuplicate) {
        if (!confirm('A record with similar details already exists. Do you want to continue?')) {
          return
        }
      }
      setCurrentStep(prev => Math.min(prev + 1, steps.length))
    }
  }

  const handlePrevious = (e: React.MouseEvent) => {
    e.preventDefault()
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (currentStep === steps.length) {
      // Final duplicate check before submission
      if (duplicateCheck.isDuplicate) {
        if (!confirm('A record with similar details already exists. Are you sure you want to submit?')) {
          return
        }
      }
      onSubmit(formData)
    }
  }

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => {
      if (field === 'birthdate') {
        const today = new Date()
        const birthDate = value ? new Date(value) : null
        let calculatedAge = ''

        if (birthDate && !Number.isNaN(birthDate.getTime())) {
          let age = today.getFullYear() - birthDate.getFullYear()
          const monthDiff = today.getMonth() - birthDate.getMonth()
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age -= 1
          }
          calculatedAge = age >= 0 ? String(age) : ''
        }

        return { ...prev, birthdate: value, age: calculatedAge }
      }

      return { ...prev, [field]: value }
    })
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            {/* Duplicate Warning Alert */}
            {duplicateCheck.isDuplicate && (
              <Alert className="border-amber-500/50 bg-amber-500/10">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800 dark:text-amber-200">
                  {duplicateCheck.message}
                </AlertDescription>
              </Alert>
            )}

            {/* Loading indicator for duplicate check */}
            {duplicateCheck.checking && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                Checking for existing records...
              </div>
            )}

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-medium">
                  Last Name <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="lastName"
                    placeholder="Enter last name"
                    value={formData.lastName}
                    onChange={(e) => handleChange('lastName', e.target.value)}
                    className={cn(
                      "pl-9 border-border/50 bg-background/50",
                      errors.lastName && "border-destructive",
                      duplicateCheck.isDuplicate && "border-amber-500"
                    )}
                  />
                </div>
                {errors.lastName && <p className="text-xs text-destructive">{errors.lastName}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-medium">
                  First Name <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="firstName"
                    placeholder="Enter first name"
                    value={formData.firstName}
                    onChange={(e) => handleChange('firstName', e.target.value)}
                    className={cn(
                      "pl-9 border-border/50 bg-background/50",
                      errors.firstName && "border-destructive",
                      duplicateCheck.isDuplicate && "border-amber-500"
                    )}
                  />
                </div>
                {errors.firstName && <p className="text-xs text-destructive">{errors.firstName}</p>}
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="middleName" className="text-sm font-medium">
                  Middle Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="middleName"
                  placeholder="Enter middle name"
                  value={formData.middleName}
                  onChange={(e) => handleChange('middleName', e.target.value)}
                  className={cn(
                    "border-border/50 bg-background/50",
                    errors.middleName && "border-destructive"
                  )}
                />
                {errors.middleName && <p className="text-xs text-destructive">{errors.middleName}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="extName" className="text-sm font-medium">Extension Name</Label>
                <Input
                  id="extName"
                  placeholder="e.g., Jr., Sr., III"
                  value={formData.extName}
                  onChange={(e) => handleChange('extName', e.target.value)}
                  className="border-border/50 bg-background/50"
                />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="birthdate" className="text-sm font-medium">
                  Birthdate <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="birthdate"
                    type="date"
                    value={formData.birthdate}
                    onChange={(e) => handleChange('birthdate', e.target.value)}
                    className={cn(
                      "pl-9 border-border/50 bg-background/50",
                      errors.birthdate && "border-destructive",
                      duplicateCheck.isDuplicate && "border-amber-500"
                    )}
                  />
                </div>
                {errors.birthdate && <p className="text-xs text-destructive">{errors.birthdate}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="age" className="text-sm font-medium">
                  Age <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="age"
                  type="number"
                  min={18}
                  step={1}
                  placeholder="Auto-calculated"
                  value={formData.age}
                  readOnly
                  className={cn(
                    "border-border/50 bg-muted/30",
                    errors.age && "border-destructive"
                  )}
                />
                {errors.age && <p className="text-xs text-destructive">{errors.age}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender" className="text-sm font-medium">
                  Gender <span className="text-destructive">*</span>
                </Label>
                <Select value={formData.gender} onValueChange={(value) => handleChange('gender', value)}>
                  <SelectTrigger className={cn(
                    "border-border/50 bg-background/50",
                    errors.gender && "border-destructive"
                  )}>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Others">Others</SelectItem>
                  </SelectContent>
                </Select>
                {errors.gender && <p className="text-xs text-destructive">{errors.gender}</p>}
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="civilStatus" className="text-sm font-medium">
                  Civil Status <span className="text-destructive">*</span>
                </Label>
                <Select value={formData.civilStatus} onValueChange={(v) => handleChange('civilStatus', v)}>
                  <SelectTrigger className={cn(
                    "border-border/50 bg-background/50",
                    errors.civilStatus && "border-destructive"
                  )}>
                    <SelectValue placeholder="Select civil status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Single">Single</SelectItem>
                    <SelectItem value="Married">Married</SelectItem>
                    <SelectItem value="Widowed">Widowed</SelectItem>
                    <SelectItem value="Separated">Separated</SelectItem>
                  </SelectContent>
                </Select>
                {errors.civilStatus && <p className="text-xs text-destructive">{errors.civilStatus}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="barangay" className="text-sm font-medium">
                  Barangay <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Select value={formData.barangay} onValueChange={(value) => handleChange('barangay', value)}>
                    <SelectTrigger className={cn(
                      "pl-9 border-border/50 bg-background/50",
                      errors.barangay && "border-destructive"
                    )}>
                      <SelectValue placeholder="Select barangay" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asinan">Asinan</SelectItem>
                      <SelectItem value="Banicain">Banicain</SelectItem>
                      <SelectItem value="Barretto">Barretto</SelectItem>
                      <SelectItem value="East Bajac-Bajac">East Bajac-Bajac</SelectItem>
                      <SelectItem value="East Tapinac">East Tapinac</SelectItem>
                      <SelectItem value="Gordon Heights">Gordon Heights</SelectItem>
                      <SelectItem value="Kalaklan">Kalaklan</SelectItem>
                      <SelectItem value="Mabayuan">Mabayuan</SelectItem>
                      <SelectItem value="New Cabalan">New Cabalan</SelectItem>
                      <SelectItem value="New Ilalim">New Ilalim</SelectItem>
                      <SelectItem value="New Kababae">New Kababae</SelectItem>
                      <SelectItem value="New Kalalake">New Kalalake</SelectItem>
                      <SelectItem value="Old Cabalan">Old Cabalan</SelectItem>
                      <SelectItem value="Pag-asa">Pag-asa</SelectItem>
                      <SelectItem value="Santa Rita">Santa Rita</SelectItem>
                      <SelectItem value="West Bajac-Bajac">West Bajac-Bajac</SelectItem>
                      <SelectItem value="West Tapinac">West Tapinac</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {errors.barangay && <p className="text-xs text-destructive">{errors.barangay}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="designation" className="text-sm font-medium">
                Designation <span className="text-destructive">*</span>
              </Label>
              <Input
                id="designation"
                placeholder="Enter designation (e.g., Farmer, Fisherfolk)"
                value={formData.designation}
                onChange={(e) => handleChange('designation', e.target.value)}
                className={cn(
                  "border-border/50 bg-background/50",
                  errors.designation && "border-destructive"
                )}
              />
              {errors.designation && <p className="text-xs text-destructive">{errors.designation}</p>}
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="unaKard">UNA Kard (USSC Network Acct Kard)</Label>
                <Input
                  id="unaKard"
                  placeholder="Enter UNA Kard"
                  value={formData.unaKard}
                  onChange={(e) => handleChange('unaKard', e.target.value)}
                  className="border-border/50 bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="imc">Intervention Monitoring Card (IMC)</Label>
                <Input
                  id="imc"
                  placeholder="Enter IMC"
                  value={formData.imc}
                  onChange={(e) => handleChange('imc', e.target.value)}
                  className="border-border/50 bg-background/50"
                />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="uMobileAccount">U-Mobile Acct No.</Label>
                <Input
                  id="uMobileAccount"
                  placeholder="Enter U-Mobile account number"
                  value={formData.uMobileAccount}
                  onChange={(e) => handleChange('uMobileAccount', e.target.value)}
                  className="border-border/50 bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lguCodeNo">LGU Code No.</Label>
                <Input
                  id="lguCodeNo"
                  placeholder="Enter LGU code number"
                  value={formData.lguCodeNo}
                  onChange={(e) => handleChange('lguCodeNo', e.target.value)}
                  className="border-border/50 bg-background/50"
                />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="ffrsSystemGeneratedNo">FFRS System Generated No.</Label>
                <Input
                  id="ffrsSystemGeneratedNo"
                  placeholder="Enter FFRS system generated number"
                  value={formData.ffrsSystemGeneratedNo}
                  onChange={(e) => handleChange('ffrsSystemGeneratedNo', e.target.value)}
                  className="border-border/50 bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ffrsDateEncoded">FFRS Date Encoded</Label>
                <Input
                  id="ffrsDateEncoded"
                  type="date"
                  value={formData.ffrsDateEncoded}
                  onChange={(e) => handleChange('ffrsDateEncoded', e.target.value)}
                  className="border-border/50 bg-background/50"
                />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fishrNo">FISHR No.</Label>
                <Input
                  id="fishrNo"
                  placeholder="Enter FISHR number"
                  value={formData.fishrNo}
                  onChange={(e) => handleChange('fishrNo', e.target.value)}
                  className="border-border/50 bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactNo" className="text-sm font-medium">
                  Contact No. <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="contactNo"
                    placeholder="09XX-XXX-XXXX"
                    value={formData.contactNo}
                    onChange={(e) => handleChange('contactNo', e.target.value)}
                    className={cn(
                      "pl-9 border-border/50 bg-background/50",
                      errors.contactNo && "border-destructive"
                    )}
                  />
                </div>
                {errors.contactNo && <p className="text-xs text-destructive">{errors.contactNo}</p>}
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="association">Association/Organization</Label>
                <Input
                  id="association"
                  placeholder="Enter association name"
                  value={formData.association}
                  onChange={(e) => handleChange('association', e.target.value)}
                  className="border-border/50 bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="familyMembers">No. of Family Members</Label>
                <Input
                  id="familyMembers"
                  type="number"
                  placeholder="Enter number"
                  value={formData.familyMembers}
                  onChange={(e) => handleChange('familyMembers', e.target.value)}
                  className="border-border/50 bg-background/50"
                />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="organic">Organic Farmer</Label>
                <Select value={formData.organic} onValueChange={(v) => handleChange('organic', v)}>
                  <SelectTrigger className="border-border/50 bg-background/50">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fourPsMember">4P's Beneficiary</Label>
                <Select value={formData.fourPsMember} onValueChange={(v) => handleChange('fourPsMember', v)}>
                  <SelectTrigger className="border-border/50 bg-background/50">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ipsMember">Indigenous Peoples (IPs)</Label>
                <Select value={formData.ipsMember} onValueChange={(v) => handleChange('ipsMember', v)}>
                  <SelectTrigger className="border-border/50 bg-background/50">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pwdMember">Person with Disability (PWD)</Label>
                <Select value={formData.pwdMember} onValueChange={(v) => handleChange('pwdMember', v)}>
                  <SelectTrigger className="border-border/50 bg-background/50">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="seniorCitizen">Senior Citizen</Label>
                <Select value={formData.seniorCitizen} onValueChange={(v) => handleChange('seniorCitizen', v)}>
                  <SelectTrigger className="border-border/50 bg-background/50">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="soloParent">Solo Parent</Label>
                <Select value={formData.soloParent} onValueChange={(v) => handleChange('soloParent', v)}>
                  <SelectTrigger className="border-border/50 bg-background/50">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="severelyStuntedChildren">No. of Severely Stunted Children</Label>
                <Input
                  id="severelyStuntedChildren"
                  type="number"
                  placeholder="Enter count"
                  value={formData.severelyStuntedChildren}
                  onChange={(e) => handleChange('severelyStuntedChildren', e.target.value)}
                  className="border-border/50 bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="motherMaidenName">Mother's Maiden Name</Label>
                <Input
                  id="motherMaidenName"
                  placeholder="Enter mother's maiden name"
                  value={formData.motherMaidenName}
                  onChange={(e) => handleChange('motherMaidenName', e.target.value)}
                  className="border-border/50 bg-background/50"
                />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="householdHead" className="text-sm font-medium">
                  Household Head? <span className="text-destructive">*</span>
                </Label>
                <Select value={formData.householdHead} onValueChange={(v) => handleChange('householdHead', v)}>
                  <SelectTrigger className={cn(
                    "border-border/50 bg-background/50",
                    errors.householdHead && "border-destructive"
                  )}>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                  </SelectContent>
                </Select>
                {errors.householdHead && <p className="text-xs text-destructive">{errors.householdHead}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="householdHeadSpecify">If No, specify household head</Label>
                <Input
                  id="householdHeadSpecify"
                  placeholder="Enter household head name"
                  value={formData.householdHeadSpecify}
                  onChange={(e) => handleChange('householdHeadSpecify', e.target.value)}
                  className={cn(
                    "border-border/50 bg-background/50",
                    errors.householdHeadSpecify && "border-destructive"
                  )}
                  disabled={formData.householdHead !== 'No'}
                />
                {errors.householdHeadSpecify && (
                  <p className="text-xs text-destructive">{errors.householdHeadSpecify}</p>
                )}
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="typeOfId" className="text-sm font-medium">
                  Type of ID <span className="text-destructive">*</span>
                </Label>
                <Select value={formData.typeOfId} onValueChange={(v) => handleChange('typeOfId', v)}>
                  <SelectTrigger className={cn(
                    "border-border/50 bg-background/50",
                    errors.typeOfId && "border-destructive"
                  )}>
                    <SelectValue placeholder="Select ID type" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    <SelectItem value="Philippine Passport">Philippine Passport</SelectItem>
                    <SelectItem value="National ID">National ID</SelectItem>
                    <SelectItem value="Driver's License">Driver's License</SelectItem>
                    <SelectItem value="SSS ID">SSS ID</SelectItem>
                    <SelectItem value="GSIS ID">GSIS ID</SelectItem>
                    <SelectItem value="UMID">UMID (Unified Multi-Purpose ID)</SelectItem>
                    <SelectItem value="PhilHealth ID">PhilHealth ID</SelectItem>
                    <SelectItem value="TIN ID">TIN ID</SelectItem>
                    <SelectItem value="Postal ID">Postal ID</SelectItem>
                    <SelectItem value="Voter's ID">Voter's ID</SelectItem>
                    <SelectItem value="PRC ID">PRC ID</SelectItem>
                    <SelectItem value="Senior Citizen ID">Senior Citizen ID</SelectItem>
                    <SelectItem value="PWD ID">PWD ID</SelectItem>
                    <SelectItem value="Barangay ID">Barangay ID</SelectItem>
                    <SelectItem value="NBI Clearance">NBI Clearance</SelectItem>
                    <SelectItem value="Police Clearance">Police Clearance</SelectItem>
                    <SelectItem value="Pag-IBIG ID">Pag-IBIG ID</SelectItem>
                  </SelectContent>
                </Select>
                {errors.typeOfId && <p className="text-xs text-destructive">{errors.typeOfId}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="idNo" className="text-sm font-medium">
                  ID No. <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="idNo"
                  placeholder="Enter ID number"
                  value={formData.idNo}
                  onChange={(e) => handleChange('idNo', e.target.value)}
                  className={cn(
                    "border-border/50 bg-background/50",
                    errors.idNo && "border-destructive"
                  )}
                />
                {errors.idNo && <p className="text-xs text-destructive">{errors.idNo}</p>}
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="farmerFisherfolkBoth" className="text-sm font-medium">
                  Farmer / Fisherfolk / Both <span className="text-destructive">*</span>
                </Label>
                <Select value={formData.farmerFisherfolkBoth} onValueChange={(v) => handleChange('farmerFisherfolkBoth', v)}>
                  <SelectTrigger className={cn(
                    "border-border/50 bg-background/50",
                    errors.farmerFisherfolkBoth && "border-destructive"
                  )}>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Farmer">Farmer</SelectItem>
                    <SelectItem value="Fisherfolk">Fisherfolk</SelectItem>
                    <SelectItem value="Both">Both</SelectItem>
                  </SelectContent>
                </Select>
                {errors.farmerFisherfolkBoth && (
                  <p className="text-xs text-destructive">{errors.farmerFisherfolkBoth}</p>
                )}
              </div>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="farmType">Farm Type</Label>
                <Input
                  id="farmType"
                  placeholder="e.g., Rice, Vegetable, Fishpond"
                  value={formData.farmType}
                  onChange={(e) => handleChange('farmType', e.target.value)}
                  className="border-border/50 bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cropAreaOrHeads">Crop Area (ha) / No. of Heads</Label>
                <Input
                  id="cropAreaOrHeads"
                  placeholder="Enter area or number"
                  value={formData.cropAreaOrHeads}
                  onChange={(e) => handleChange('cropAreaOrHeads', e.target.value)}
                  className="border-border/50 bg-background/50"
                />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="cropName">Primary Crop/Livestock</Label>
                <Input
                  id="cropName"
                  placeholder="e.g., Rice, Tilapia, Swine"
                  value={formData.cropName}
                  onChange={(e) => handleChange('cropName', e.target.value)}
                  className="border-border/50 bg-background/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="remarks" className="text-sm font-medium">Additional Remarks</Label>
              </div>
              <textarea
                id="remarks"
                placeholder="Enter any additional notes or remarks..."
                value={formData.remarks}
                onChange={(e) => handleChange('remarks', e.target.value)}
                rows={4}
                className="w-full rounded-lg border border-border/50 bg-background/50 px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Card className="relative overflow-hidden border border-border/50 bg-gradient-to-br from-background via-background to-muted/20 p-6 md:p-8">
      {/* Background Watermark */}
      <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-5">
        <img
          src="/olongapo.png"
          alt=""
          className="w-[50%] max-w-[480px] select-none"
        />
      </div>

      <form onSubmit={handleSubmit} className="relative z-10 space-y-8">
        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-between w-full">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isActive = step.id === currentStep
              const isCompleted = step.id < currentStep
              
              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center relative">
                    <div
                      className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all z-10 bg-background",
                        isActive && "border-primary bg-primary text-primary-foreground",
                        isCompleted && "border-green-500 bg-green-500 text-white",
                        !isActive && !isCompleted && "border-muted-foreground/30 text-muted-foreground"
                      )}
                    >
                      {isCompleted ? (
                        <CheckCircle className="h-6 w-6" />
                      ) : (
                        <Icon className="h-6 w-6" />
                      )}
                    </div>
                    <span className="absolute top-14 text-xs font-medium text-center whitespace-nowrap">
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={cn(
                        "h-[2px] flex-1 mx-4",
                        step.id < currentStep ? "bg-green-500" : "bg-muted-foreground/30"
                      )}
                    />
                  )}
                </div>
              )
            })}
          </div>
          {/* Desktop Step Titles */}
          <div className="hidden md:flex justify-between mt-16 px-2">
            {steps.map((step) => (
              <div key={step.id} className="text-center" style={{ width: '120px' }}>
                <p className={cn(
                  "text-xs font-medium",
                  step.id === currentStep ? "text-primary" : "text-muted-foreground"
                )}>
                  {step.fullTitle}
                </p>
              </div>
            ))}
          </div>
          {/* Mobile Step Indicator */}
          <div className="mt-16 text-center md:hidden">
            <p className="text-sm font-medium text-foreground">
              Step {currentStep} of {steps.length}: {steps[currentStep - 1].fullTitle}
            </p>
            <p className="text-xs text-muted-foreground">
              {steps[currentStep - 1].description}
            </p>
          </div>
        </div>

        {/* Step Content */}
        <div className="min-h-[400px]">
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="flex-1 gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          
          {currentStep === steps.length ? (
            <Button
              type="submit"
              className="flex-1 gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary"
            >
              <FileText className="h-4 w-4" />
              Submit Registration
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleNext}
              className="flex-1 gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </form>
    </Card>
  )
}