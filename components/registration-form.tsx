'use client'

import React from "react"

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
  email: string
  civilStatus: string
  nationalId: string
  education: string
  livelihood: string
  areaSize: string
  householdSize: string
  emergencyName: string
  emergencyContact: string
  registrationDate: string
}

export function RegistrationForm({ onSubmit }: { onSubmit: (data: FormData) => void }) {
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    age: '',
    gender: '',
    address: '',
    barangay: '',
    contactNumber: '',
    type: 'Farmer',
    cropType: '',
    yearsExperience: '',
    notes: '',
    email: '',
    civilStatus: '',
    nationalId: '',
    education: '',
    livelihood: '',
    areaSize: '',
    householdSize: '',
    emergencyName: '',
    emergencyContact: '',
    registrationDate: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    }
    if (!formData.age) {
      newErrors.age = 'Age is required'
    }
    if (!formData.gender) {
      newErrors.gender = 'Gender is required'
    }
    if (!formData.contactNumber.trim()) {
      newErrors.contactNumber = 'Contact number is required'
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    }
    if (!formData.barangay) {
      newErrors.barangay = 'Barangay is required'
    }
    if (!formData.type) {
      newErrors.type = 'Type is required'
    }
    if (!formData.civilStatus) {
      newErrors.civilStatus = 'Civil status is required'
    }
    if (!formData.nationalId.trim()) {
      newErrors.nationalId = 'ID number is required'
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
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <Card className="relative overflow-hidden border border-border bg-card p-8">
      {/* Centered watermark */}
      <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <img
          src="/olongapo.png"
          alt=""
          className="opacity-10 w-[50%] max-w-[480px] select-none"
        />
      </div>
      <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
        {/* Full Name */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Full Name *</label>
            <Input
              placeholder="Enter full name"
              value={formData.fullName}
              onChange={(e) => handleChange('fullName', e.target.value)}
              className={errors.fullName ? 'border-destructive' : ''}
            />
            {errors.fullName && (
              <p className="text-xs text-destructive">{errors.fullName}</p>
            )}
          </div>

          {/* Age */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Age *</label>
            <Input
              type="number"
              placeholder="Enter age"
              value={formData.age}
              onChange={(e) => handleChange('age', e.target.value)}
              className={errors.age ? 'border-destructive' : ''}
            />
            {errors.age && <p className="text-xs text-destructive">{errors.age}</p>}
          </div>
        </div>

        {/* Email and Civil Status */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Email *</label>
            <Input
              type="email"
              placeholder="Enter email address"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className={errors.email ? 'border-destructive' : ''}
            />
            {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Civil Status *</label>
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

        {/* Gender and Barangay */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Gender *</label>
            <Select value={formData.gender} onValueChange={(value) => handleChange('gender', value)}>
              <SelectTrigger className={errors.gender ? 'border-destructive' : ''}>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
              </SelectContent>
            </Select>
            {errors.gender && (
              <p className="text-xs text-destructive">{errors.gender}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Barangay *</label>
            <Select value={formData.barangay} onValueChange={(value) => handleChange('barangay', value)}>
              <SelectTrigger className={errors.barangay ? 'border-destructive' : ''}>
                <SelectValue placeholder="Select barangay" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Barangay 1">Barangay 1</SelectItem>
                <SelectItem value="Barangay 2">Barangay 2</SelectItem>
                <SelectItem value="Barangay 3">Barangay 3</SelectItem>
                <SelectItem value="Barangay 4">Barangay 4</SelectItem>
              </SelectContent>
            </Select>
            {errors.barangay && (
              <p className="text-xs text-destructive">{errors.barangay}</p>
            )}
          </div>
        </div>

        {/* Address and National ID */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Address</label>
            <Input
              placeholder="Enter address"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">National ID / Gov ID No. *</label>
            <Input
              placeholder="Enter ID number"
              value={formData.nationalId}
              onChange={(e) => handleChange('nationalId', e.target.value)}
              className={errors.nationalId ? 'border-destructive' : ''}
            />
            {errors.nationalId && <p className="text-xs text-destructive">{errors.nationalId}</p>}
          </div>
        </div>

        {/* Contact Number */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Contact Number *</label>
          <Input
            placeholder="09XX-XXXX-XXX"
            value={formData.contactNumber}
            onChange={(e) => handleChange('contactNumber', e.target.value)}
            className={errors.contactNumber ? 'border-destructive' : ''}
          />
          {errors.contactNumber && (
            <p className="text-xs text-destructive">{errors.contactNumber}</p>
          )}
        </div>

        {/* Type and Crop/Fish Type */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Type *</label>
            <Select value={formData.type} onValueChange={(value) => handleChange('type', value)}>
              <SelectTrigger className={errors.type ? 'border-destructive' : ''}>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Farmer">Farmer</SelectItem>
                <SelectItem value="Fisherfolk">Fisherfolk</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && <p className="text-xs text-destructive">{errors.type}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              {formData.type === 'Farmer' ? 'Crop Type' : 'Fish Type'} (Optional)
            </label>
            <Input
              placeholder={`Enter ${formData.type === 'Farmer' ? 'crop' : 'fish'} type`}
              value={formData.cropType}
              onChange={(e) => handleChange('cropType', e.target.value)}
            />
          </div>
        </div>

        {/* Education and Livelihood */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Educational Attainment</label>
            <Select value={formData.education} onValueChange={(v) => handleChange('education', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select education" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Elementary">Elementary</SelectItem>
                <SelectItem value="High School">High School</SelectItem>
                <SelectItem value="Vocational">Vocational</SelectItem>
                <SelectItem value="College">College</SelectItem>
                <SelectItem value="Post Graduate">Post Graduate</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Primary Livelihood/Commodity</label>
            <Input
              placeholder="e.g., Rice, Corn, Bangus"
              value={formData.livelihood}
              onChange={(e) => handleChange('livelihood', e.target.value)}
            />
          </div>
        </div>

        {/* Years of Experience and Area Size */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Years of Experience</label>
            <Input
              type="number"
              placeholder="Enter years of experience"
              value={formData.yearsExperience}
              onChange={(e) => handleChange('yearsExperience', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Area Size (ha or sqm)</label>
            <Input
              placeholder="Enter area size"
              value={formData.areaSize}
              onChange={(e) => handleChange('areaSize', e.target.value)}
            />
          </div>
        </div>

        {/* Household size and Registration date */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Household Size</label>
            <Input
              type="number"
              placeholder="Number of household members"
              value={formData.householdSize}
              onChange={(e) => handleChange('householdSize', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Registration Date</label>
            <Input
              type="date"
              value={formData.registrationDate}
              onChange={(e) => handleChange('registrationDate', e.target.value)}
            />
          </div>
        </div>

        {/* Emergency contact */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Emergency Contact Name</label>
            <Input
              placeholder="Enter emergency contact name"
              value={formData.emergencyName}
              onChange={(e) => handleChange('emergencyName', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Emergency Contact Number</label>
            <Input
              placeholder="09XX-XXXX-XXX"
              value={formData.emergencyContact}
              onChange={(e) => handleChange('emergencyContact', e.target.value)}
            />
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Notes / Additional Information
          </label>
          <textarea
            placeholder="Enter any additional information"
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            className="min-h-[120px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm font-medium placeholder:text-muted-foreground"
          />
        </div>

        {/* Submit Button */}
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
