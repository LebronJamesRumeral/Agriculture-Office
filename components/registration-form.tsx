'use client'

import { useState } from 'react'
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

export function RegistrationForm({ onSubmit }: { onSubmit: (data: FormData) => void }) {
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
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }
    if (!formData.middleName.trim()) {
      newErrors.middleName = 'Middle name is required'
    }
    if (!formData.birthdate) {
      newErrors.birthdate = 'Birthdate is required'
    }
    if (!formData.age) {
      newErrors.age = 'Age is required'
    } else if (Number(formData.age) < 18) {
      newErrors.age = 'Minimum age is 18'
    }
    if (!formData.gender) {
      newErrors.gender = 'Gender is required'
    }
    if (!formData.civilStatus) {
      newErrors.civilStatus = 'Civil status is required'
    }
    if (!formData.barangay) {
      newErrors.barangay = 'Barangay is required'
    }
    if (!formData.designation.trim()) {
      newErrors.designation = 'Designation is required'
    }
    if (!formData.contactNo.trim()) {
      newErrors.contactNo = 'Contact number is required'
    }
    if (!formData.householdHead) {
      newErrors.householdHead = 'Household head status is required'
    }
    if (formData.householdHead === 'No' && !formData.householdHeadSpecify.trim()) {
      newErrors.householdHeadSpecify = 'Please specify household head'
    }
    if (!formData.typeOfId.trim()) {
      newErrors.typeOfId = 'Type of ID is required'
    }
    if (!formData.idNo.trim()) {
      newErrors.idNo = 'ID number is required'
    }
    if (!formData.farmerFisherfolkBoth) {
      newErrors.farmerFisherfolkBoth = 'Please select applicant type'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
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

  return (
    <Card className="relative overflow-hidden border border-border bg-card p-8">
      <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <img
          src="/olongapo.png"
          alt=""
          className="opacity-10 w-[50%] max-w-[480px] select-none"
        />
      </div>
      <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Last Name <span className="text-destructive">*</span>
            </label>
            <Input
              placeholder="Enter last name"
              value={formData.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              className={errors.lastName ? 'border-destructive' : ''}
            />
            {errors.lastName && <p className="text-xs text-destructive">{errors.lastName}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              First Name <span className="text-destructive">*</span>
            </label>
            <Input
              placeholder="Enter first name"
              value={formData.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              className={errors.firstName ? 'border-destructive' : ''}
            />
            {errors.firstName && <p className="text-xs text-destructive">{errors.firstName}</p>}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Middle Name <span className="text-destructive">*</span>
            </label>
            <Input
              placeholder="Enter middle name"
              value={formData.middleName}
              onChange={(e) => handleChange('middleName', e.target.value)}
              className={errors.middleName ? 'border-destructive' : ''}
            />
            {errors.middleName && <p className="text-xs text-destructive">{errors.middleName}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Extension Name</label>
            <Input
              placeholder="Enter extension name"
              value={formData.extName}
              onChange={(e) => handleChange('extName', e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Birthdate <span className="text-destructive">*</span>
            </label>
            <Input
              type="date"
              value={formData.birthdate}
              onChange={(e) => handleChange('birthdate', e.target.value)}
              className={errors.birthdate ? 'border-destructive' : ''}
            />
            {errors.birthdate && <p className="text-xs text-destructive">{errors.birthdate}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Age <span className="text-destructive">*</span>
            </label>
            <Input
              type="number"
              min={18}
              step={1}
              placeholder="Enter age"
              value={formData.age}
              readOnly
              onChange={(e) => handleChange('age', e.target.value)}
              className={errors.age ? 'border-destructive' : ''}
            />
            {errors.age && <p className="text-xs text-destructive">{errors.age}</p>}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Gender <span className="text-destructive">*</span>
            </label>
            <Select value={formData.gender} onValueChange={(value) => handleChange('gender', value)}>
              <SelectTrigger className={errors.gender ? 'border-destructive' : ''}>
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
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Civil Status <span className="text-destructive">*</span>
            </label>
            <Select value={formData.civilStatus} onValueChange={(v) => handleChange('civilStatus', v)}>
              <SelectTrigger className={errors.civilStatus ? 'border-destructive' : ''}>
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
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Barangay <span className="text-destructive">*</span>
            </label>
            <Select value={formData.barangay} onValueChange={(value) => handleChange('barangay', value)}>
              <SelectTrigger className={errors.barangay ? 'border-destructive' : ''}>
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
            {errors.barangay && <p className="text-xs text-destructive">{errors.barangay}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Designation <span className="text-destructive">*</span>
            </label>
            <Input
              placeholder="Enter designation"
              value={formData.designation}
              onChange={(e) => handleChange('designation', e.target.value)}
              className={errors.designation ? 'border-destructive' : ''}
            />
            {errors.designation && <p className="text-xs text-destructive">{errors.designation}</p>}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              UNA Kard (USSC Network Acct Kard)
            </label>
            <Input
              placeholder="Enter UNA Kard"
              value={formData.unaKard}
              onChange={(e) => handleChange('unaKard', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Intervention Monitoring Card (IMC)
            </label>
            <Input
              placeholder="Enter IMC"
              value={formData.imc}
              onChange={(e) => handleChange('imc', e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">U-Mobile Acct No.</label>
            <Input
              placeholder="Enter U-Mobile account number"
              value={formData.uMobileAccount}
              onChange={(e) => handleChange('uMobileAccount', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">LGU Code No.</label>
            <Input
              placeholder="Enter LGU code number"
              value={formData.lguCodeNo}
              onChange={(e) => handleChange('lguCodeNo', e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">FFRS System Generated No.</label>
            <Input
              placeholder="Enter FFRS system generated number"
              value={formData.ffrsSystemGeneratedNo}
              onChange={(e) => handleChange('ffrsSystemGeneratedNo', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">FFRS Date Encoded</label>
            <Input
              type="date"
              value={formData.ffrsDateEncoded}
              onChange={(e) => handleChange('ffrsDateEncoded', e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">FISHR No.</label>
            <Input
              placeholder="Enter FISHR number"
              value={formData.fishrNo}
              onChange={(e) => handleChange('fishrNo', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Contact No. <span className="text-destructive">*</span>
            </label>
            <Input
              placeholder="09XX-XXXX-XXX"
              value={formData.contactNo}
              onChange={(e) => handleChange('contactNo', e.target.value)}
              className={errors.contactNo ? 'border-destructive' : ''}
            />
            {errors.contactNo && <p className="text-xs text-destructive">{errors.contactNo}</p>}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Association</label>
            <Input
              placeholder="Enter association"
              value={formData.association}
              onChange={(e) => handleChange('association', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">No. of Family Members</label>
            <Input
              type="number"
              placeholder="Enter number of family members"
              value={formData.familyMembers}
              onChange={(e) => handleChange('familyMembers', e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Organic (Y/N)</label>
            <Select value={formData.organic} onValueChange={(v) => handleChange('organic', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Yes">Yes</SelectItem>
                <SelectItem value="No">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">4P's Member (Y/N)</label>
            <Select value={formData.fourPsMember} onValueChange={(v) => handleChange('fourPsMember', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Yes">Yes</SelectItem>
                <SelectItem value="No">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">IP's Member (Y/N)</label>
            <Select value={formData.ipsMember} onValueChange={(v) => handleChange('ipsMember', v)}>
              <SelectTrigger>
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
            <label className="text-sm font-medium text-foreground">
              No. of Severely Stunted Children (0-59 months)
            </label>
            <Input
              type="number"
              placeholder="Enter count"
              value={formData.severelyStuntedChildren}
              onChange={(e) => handleChange('severelyStuntedChildren', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Mother Maiden Name</label>
            <Input
              placeholder="Enter mother maiden name"
              value={formData.motherMaidenName}
              onChange={(e) => handleChange('motherMaidenName', e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Household Head? <span className="text-destructive">*</span>
            </label>
            <Select value={formData.householdHead} onValueChange={(v) => handleChange('householdHead', v)}>
              <SelectTrigger className={errors.householdHead ? 'border-destructive' : ''}>
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
            <label className="text-sm font-medium text-foreground">If No, specify</label>
            <Input
              placeholder="Enter household head"
              value={formData.householdHeadSpecify}
              onChange={(e) => handleChange('householdHeadSpecify', e.target.value)}
              className={errors.householdHeadSpecify ? 'border-destructive' : ''}
              disabled={formData.householdHead !== 'No'}
            />
            {errors.householdHeadSpecify && (
              <p className="text-xs text-destructive">{errors.householdHeadSpecify}</p>
            )}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Type of ID <span className="text-destructive">*</span>
            </label>
            <Select
              value={formData.typeOfId}
              onValueChange={(v) => handleChange('typeOfId', v)}
            >
              <SelectTrigger className={errors.typeOfId ? 'border-destructive' : ''}>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Philippine Passport">Philippine Passport</SelectItem>
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
            <label className="text-sm font-medium text-foreground">
              ID No. <span className="text-destructive">*</span>
            </label>
            <Input
              placeholder="Enter ID number"
              value={formData.idNo}
              onChange={(e) => handleChange('idNo', e.target.value)}
              className={errors.idNo ? 'border-destructive' : ''}
            />
            {errors.idNo && <p className="text-xs text-destructive">{errors.idNo}</p>}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Farmer / Fisherfolk / Both <span className="text-destructive">*</span>
            </label>
            <Select
              value={formData.farmerFisherfolkBoth}
              onValueChange={(v) => handleChange('farmerFisherfolkBoth', v)}
            >
              <SelectTrigger className={errors.farmerFisherfolkBoth ? 'border-destructive' : ''}>
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
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Farm Type</label>
            <Input
              placeholder="Enter farm type"
              value={formData.farmType}
              onChange={(e) => handleChange('farmType', e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Crop Area / No. of Heads</label>
            <Input
              placeholder="Enter crop area or number of heads"
              value={formData.cropAreaOrHeads}
              onChange={(e) => handleChange('cropAreaOrHeads', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Crop Name</label>
            <Input
              placeholder="Enter crop name"
              value={formData.cropName}
              onChange={(e) => handleChange('cropName', e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Remarks</label>
          <textarea
            placeholder="Enter remarks"
            value={formData.remarks}
            onChange={(e) => handleChange('remarks', e.target.value)}
            className="min-h-[120px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm font-medium placeholder:text-muted-foreground"
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          size="lg"
        >
          Submit Registration
        </Button>
      </form>
    </Card>
  )
}
