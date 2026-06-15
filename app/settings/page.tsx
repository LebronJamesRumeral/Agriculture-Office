'use client'

import { AppLayout } from '@/components/app-layout'
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
import { useState } from 'react'
import { toast } from 'sonner'
import { 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Settings as SettingsIcon,
  Database,
  Save,
  RefreshCw,
  Shield,
  Clock,
  Globe,
  HardDrive
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

export default function SettingsPage() {
  const [officeInfo, setOfficeInfo] = useState({
    officeName: 'Olongapo City Agriculture Office',
    contactEmail: 'agriculture@olongapo.gov.ph',
    phoneNumber: '+63-47-226-2331',
    address: 'Olongapo City, Philippines',
    barangay: 'Barangay 1',
    city: 'Olongapo',
    province: 'Zambales',
    zipCode: '2200'
  })

  const [activeTab, setActiveTab] = useState('general')

  const handleSaveOfficeInfo = () => {
    toast.success('Office information saved successfully!')
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Settings
            </h1>
            <p className="text-sm text-muted-foreground md:text-base">
              Manage system configuration and user preferences
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Settings Tabs */}
        <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="general" className="gap-2">
              <Building2 className="h-4 w-4" />
              General
            </TabsTrigger>
            <TabsTrigger value="system" className="gap-2">
              <Database className="h-4 w-4" />
              System
            </TabsTrigger>
          </TabsList>

          {/* General Settings Tab */}
          <TabsContent value="general" className="space-y-4">
            <Card className="border border-border/50 bg-gradient-to-br from-background via-background to-muted/20 overflow-hidden">
              <div className="absolute right-0 top-0 h-32 w-32 translate-x-12 -translate-y-12 rounded-full bg-primary/5" />
              
              <div className="relative p-6">
                <div className="mb-6 flex items-center gap-2">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">Office Information</h2>
                    <p className="text-sm text-muted-foreground">Update your office details and contact information</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="officeName" className="text-sm font-medium">
                        Office Name
                      </Label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="officeName"
                          value={officeInfo.officeName}
                          onChange={(e) =>
                            setOfficeInfo({ ...officeInfo, officeName: e.target.value })
                          }
                          className="pl-9 border-border/50 bg-background/50"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactEmail" className="text-sm font-medium">
                        Contact Email
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="contactEmail"
                          type="email"
                          value={officeInfo.contactEmail}
                          onChange={(e) =>
                            setOfficeInfo({
                              ...officeInfo,
                              contactEmail: e.target.value,
                            })
                          }
                          className="pl-9 border-border/50 bg-background/50"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber" className="text-sm font-medium">
                        Phone Number
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="phoneNumber"
                          value={officeInfo.phoneNumber}
                          onChange={(e) =>
                            setOfficeInfo({
                              ...officeInfo,
                              phoneNumber: e.target.value,
                            })
                          }
                          className="pl-9 border-border/50 bg-background/50"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address" className="text-sm font-medium">
                        Street Address
                      </Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="address"
                          value={officeInfo.address}
                          onChange={(e) =>
                            setOfficeInfo({ ...officeInfo, address: e.target.value })
                          }
                          className="pl-9 border-border/50 bg-background/50"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="barangay" className="text-sm font-medium">
                        Barangay
                      </Label>
                      <Input
                        id="barangay"
                        value={officeInfo.barangay}
                        onChange={(e) =>
                          setOfficeInfo({ ...officeInfo, barangay: e.target.value })
                        }
                        className="border-border/50 bg-background/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city" className="text-sm font-medium">
                        City
                      </Label>
                      <Input
                        id="city"
                        value={officeInfo.city}
                        onChange={(e) =>
                          setOfficeInfo({ ...officeInfo, city: e.target.value })
                        }
                        className="border-border/50 bg-background/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zipCode" className="text-sm font-medium">
                        ZIP Code
                      </Label>
                      <Input
                        id="zipCode"
                        value={officeInfo.zipCode}
                        onChange={(e) =>
                          setOfficeInfo({ ...officeInfo, zipCode: e.target.value })
                        }
                        className="border-border/50 bg-background/50"
                      />
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="flex justify-end">
                    <Button
                      onClick={handleSaveOfficeInfo}
                      className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary"
                    >
                      <Save className="h-4 w-4" />
                      Save Changes
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Additional General Settings */}
            <Card className="border border-border/50 bg-gradient-to-br from-background via-background to-muted/20 p-6">
              <div className="mb-4 flex items-center gap-2">
                <div className="rounded-lg bg-amber-500/10 p-2">
                  <Globe className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Regional Settings</h3>
                  <p className="text-sm text-muted-foreground">Configure location-based preferences</p>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Time Zone</Label>
                  <Select defaultValue="asia-manila">
                    <SelectTrigger className="border-border/50 bg-background/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asia-manila">Asia/Manila (GMT+8)</SelectItem>
                      <SelectItem value="asia-singapore">Asia/Singapore (GMT+8)</SelectItem>
                      <SelectItem value="asia-tokyo">Asia/Tokyo (GMT+9)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Date Format</Label>
                  <Select defaultValue="mdy">
                    <SelectTrigger className="border-border/50 bg-background/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mdy">MM/DD/YYYY</SelectItem>
                      <SelectItem value="dmy">DD/MM/YYYY</SelectItem>
                      <SelectItem value="ymd">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* System Tab */}
          <TabsContent value="system" className="space-y-4">
            <Card className="border border-border/50 bg-gradient-to-br from-background via-background to-muted/20 overflow-hidden">
              <div className="absolute right-0 top-0 h-32 w-32 translate-x-12 -translate-y-12 rounded-full bg-primary/5" />
              
              <div className="relative p-6">
                <div className="mb-6 flex items-center gap-2">
                  <div className="rounded-lg bg-purple-500/10 p-2">
                    <Database className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">System Information</h2>
                    <p className="text-sm text-muted-foreground">Details about your system configuration</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-lg border border-border/50 bg-muted/30 p-4">
                      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <HardDrive className="h-4 w-4 text-primary" />
                        System Name
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">Olongapo Agriculture Registry</p>
                    </div>

                    <div className="rounded-lg border border-border/50 bg-muted/30 p-4">
                      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <SettingsIcon className="h-4 w-4 text-primary" />
                        Version
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">1.1.1</p>
                    </div>

                    <div className="rounded-lg border border-border/50 bg-muted/30 p-4">
                      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <Clock className="h-4 w-4 text-primary" />
                        Last Updated
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">February 27, 2026</p>
                    </div>

                    <div className="rounded-lg border border-border/50 bg-muted/30 p-4">
                      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <Shield className="h-4 w-4 text-primary" />
                        Environment
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        <span className="inline-flex items-center rounded-full bg-green-500/10 px-2 py-1 text-xs font-medium text-green-600">
                          Production
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  )
}