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
import { CheckCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function SettingsPage() {
  const [officeInfo, setOfficeInfo] = useState({
    officeName: 'Olongapo City Agriculture Office',
    contactEmail: 'agriculture@olongapo.gov.ph',
    phoneNumber: '+63-47-226-2331',
    address: 'Olongapo City, Philippines',
  })

  const [saved, setSaved] = useState(false)

  const handleSaveOfficeInfo = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <AppLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">
            Manage system configuration and user preferences
          </p>
        </div>

        {/* Success Message */}
        {saved && (
          <Alert className="border-green-500 bg-green-500/10">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              Settings saved successfully!
            </AlertDescription>
          </Alert>
        )}

        {/* Office Information */}
        <Card className="border border-border bg-card p-6">
          <h2 className="mb-6 text-xl font-semibold text-foreground">
            Office Information
          </h2>

          <div className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Office Name
                </label>
                <Input
                  value={officeInfo.officeName}
                  onChange={(e) =>
                    setOfficeInfo({ ...officeInfo, officeName: e.target.value })
                  }
                  className="border-border bg-background"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Contact Email
                </label>
                <Input
                  type="email"
                  value={officeInfo.contactEmail}
                  onChange={(e) =>
                    setOfficeInfo({
                      ...officeInfo,
                      contactEmail: e.target.value,
                    })
                  }
                  className="border-border bg-background"
                />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Phone Number
                </label>
                <Input
                  value={officeInfo.phoneNumber}
                  onChange={(e) =>
                    setOfficeInfo({
                      ...officeInfo,
                      phoneNumber: e.target.value,
                    })
                  }
                  className="border-border bg-background"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Address
                </label>
                <Input
                  value={officeInfo.address}
                  onChange={(e) =>
                    setOfficeInfo({ ...officeInfo, address: e.target.value })
                  }
                  className="border-border bg-background"
                />
              </div>
            </div>

            <Button
              onClick={handleSaveOfficeInfo}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 md:w-auto"
            >
              Save Changes
            </Button>
          </div>
        </Card>

        {/* System Preferences */}
        <Card className="border border-border bg-card p-6">
          <h2 className="mb-6 text-xl font-semibold text-foreground">
            System Preferences
          </h2>

          <div className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Records Per Page
                </label>
                <Select defaultValue="10">
                  <SelectTrigger className="border-border bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 Records</SelectItem>
                    <SelectItem value="10">10 Records</SelectItem>
                    <SelectItem value="20">20 Records</SelectItem>
                    <SelectItem value="50">50 Records</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Default View
                </label>
                <Select defaultValue="table">
                  <SelectTrigger className="border-border bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="table">Table View</SelectItem>
                    <SelectItem value="card">Card View</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Notification Preferences
              </label>
              <Select defaultValue="all">
                <SelectTrigger className="border-border bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Notifications</SelectItem>
                  <SelectItem value="important">Important Only</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleSaveOfficeInfo}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 md:w-auto"
            >
              Save Preferences
            </Button>
          </div>
        </Card>

        {/* System Information */}
        <Card className="border border-border bg-card p-6">
          <h2 className="mb-6 text-xl font-semibold text-foreground">
            System Information
          </h2>

          <div className="space-y-4 text-sm">
            <div className="flex justify-between border-b border-border pb-3">
              <span className="font-medium text-foreground">System Name</span>
              <span className="text-muted-foreground">
                Olongapo Agriculture Registry
              </span>
            </div>
            <div className="flex justify-between border-b border-border pb-3">
              <span className="font-medium text-foreground">Version</span>
              <span className="text-muted-foreground">1.0.0</span>
            </div>
            <div className="flex justify-between border-b border-border pb-3">
              <span className="font-medium text-foreground">Last Updated</span>
              <span className="text-muted-foreground">January 27, 2026</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-foreground">Environment</span>
              <span className="text-muted-foreground">Production</span>
            </div>
          </div>
        </Card>
      </div>
    </AppLayout>
  )
}
