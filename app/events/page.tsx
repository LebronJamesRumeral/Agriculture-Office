'use client'

import { AppLayout } from '@/components/app-layout'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, MapPin, Users, QrCode, Plus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import * as React from 'react'
import { mockRecords } from '@/lib/mock-data'
import * as XLSX from 'xlsx'

type EventItem = {
  id: number
  title: string
  date: string
  time: string
  venue: string
  audience: string
  description: string
}

type AttendanceRecord = {
  id: number
  name: string
  type: string
  barangay: string
  contactNumber: string
  cropType: string
  timestamp: string
}

const initialEvents: EventItem[] = [
  {
    id: 1,
    title: 'Olongapo Coastal Resource Summit',
    date: 'February 10, 2026',
    time: '9:00 AM – 3:00 PM',
    venue: 'Olongapo City Hall Plaza',
    audience: 'Fisherfolks & Farmers — everyone invited',
    description:
      'Updates on coastal management, community consultation, and programs supporting local fisherfolks and farmers.',
  },
  {
    id: 2,
    title: 'Integrated Farming & Aquaculture Fair',
    date: 'February 17, 2026',
    time: '8:00 AM – 5:00 PM',
    venue: 'Barangay Barretto Covered Court, Olongapo City',
    audience: 'Fisherfolks & Farmers — open to all',
    description:
      'Hands-on demos, seedling and fingerling distribution, and sign-ups for training opportunities.',
  },
  {
    id: 3,
    title: 'Disaster Preparedness & Livelihood Workshop',
    date: 'February 24, 2026',
    time: '1:00 PM – 4:30 PM',
    venue: 'Olongapo Convention Center',
    audience: 'Fisherfolks & Farmers — everyone invited',
    description:
      'Community DRR training, emergency aid programs overview, and resilient livelihood planning.',
  },
  {
    id: 4,
    title: 'Citywide Registry Day: Fisherfolk & Farmer Enrollment',
    date: 'March 2, 2026',
    time: '8:00 AM – 4:00 PM',
    venue: 'Olongapo City Agriculture Office',
    audience: 'Open invitation to all fisherfolks and farmers',
    description:
      'On-site registration and updates for city programs and assistance. Bring valid ID.',
  },
]

function EventDialogBody({
  event,
  attendees,
  isDone,
  onRecordAttendance,
  onExport,
}: {
  event: EventItem
  attendees: AttendanceRecord[]
  isDone: boolean
  onRecordAttendance: (member: any) => void
  onExport: () => void
}) {
  const [scanning, setScanning] = React.useState(false)
  const [qrText, setQrText] = React.useState<string | null>(null)
  const [memberName, setMemberName] = React.useState<string | null>(null)
  const videoRef = React.useRef<HTMLVideoElement | null>(null)
  const scannerRef = React.useRef<any>(null)
  const lastAddedIdRef = React.useRef<number | null>(null)

  const findMember = (text: string) => {
    const norm = text.trim().toLowerCase()
    const idMatch = text.match(/\b(\d{1,5})\b/)
    if (idMatch) {
      const id = parseInt(idMatch[1], 10)
      const byId = mockRecords.find((r) => r.id === id)
      if (byId) return byId
    }
    const byName = mockRecords.find((r) => r.name.toLowerCase() === norm)
    return byName || null
  }

  React.useEffect(() => {
    let mounted = true
    async function startScanner() {
      if (!videoRef.current) return
      const { default: QrScanner } = await import('qr-scanner')
      scannerRef.current = new QrScanner(
        videoRef.current,
        (result: any) => {
          const data = (typeof result === 'string' ? result : (result?.data ?? '')).toString()
          if (!mounted) return
          setQrText(data)
          const member = findMember(data)
          setMemberName(member ? member.name : null)
          if (!isDone && member && member.id !== lastAddedIdRef.current) {
            onRecordAttendance(member)
            lastAddedIdRef.current = member.id
          }
        }
      )
      try {
        await scannerRef.current.start()
      } catch (err) {
        console.error('Camera start failed', err)
      }
    }
    if (scanning && !isDone) {
      startScanner()
    }
    return () => {
      mounted = false
      if (scannerRef.current) {
        scannerRef.current.stop()
        scannerRef.current.destroy()
        scannerRef.current = null
      }
    }
  }, [scanning, isDone])

  return (
    <>
      <DialogHeader>
        <DialogTitle>{event.title}</DialogTitle>
        <DialogDescription>{event.audience}</DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <div className="flex items-center gap-3 text-sm">
          <Calendar className="size-4" />
          <span className="font-medium">{event.date}</span>
          <span className="text-muted-foreground">•</span>
          <span className="text-muted-foreground">{event.time}</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <MapPin className="size-4" />
          <span className="font-medium">{event.venue}</span>
        </div>
        <div className="flex items-start gap-3 text-sm">
          <Users className="mt-0.5 size-4" />
          <p className="text-muted-foreground">{event.description}</p>
        </div>

        {/* Attendance Scanner */}
        <div className="mt-4 space-y-3">
          {!isDone ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium">
                <QrCode className="size-4" />
                <span>Attendance Scanner</span>
              </div>
              {!scanning ? (
                <Button variant="outline" onClick={() => setScanning(true)}>
                  Get Attendance
                </Button>
              ) : (
                <Button variant="destructive" onClick={() => setScanning(false)}>
                  Stop Scanning
                </Button>
              )}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Event completed — attendance is closed.</p>
          )}

          {scanning && !isDone && (
            <div className="rounded-md border p-3">
              <video
                ref={videoRef}
                className="aspect-video w-full rounded-md bg-black/50"
                muted
              />
              <p className="mt-2 text-xs text-muted-foreground">
                Point the camera at a member QR code.
              </p>
            </div>
          )}

          {qrText && (
            <div className="rounded-md border bg-muted/30 p-3 text-sm">
              <p className="font-medium">Scanned: <span className="font-normal">{qrText}</span></p>
              {memberName ? (
                <p className="text-green-600 dark:text-green-400">Member: {memberName}</p>
              ) : (
                <p className="text-destructive">Not a member</p>
              )}
            </div>
          )}

          {/* Attendees List */}
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Attendees ({attendees.length})</p>
              <Button size="sm" variant="secondary" onClick={onExport}>
                Download Attendance
              </Button>
            </div>
            {attendees.length === 0 ? (
              <p className="text-xs text-muted-foreground">No attendees yet.</p>
            ) : (
              <div className="max-h-52 overflow-auto rounded-md border">
                <ul className="divide-y">
                  {attendees.map((a) => (
                    <li key={`${a.id}-${a.timestamp}`} className="flex items-center justify-between p-2 text-sm">
                      <div className="flex flex-col">
                        <span className="font-medium">{a.name}</span>
                        <span className="text-muted-foreground text-xs">{a.type} • {a.barangay}</span>
                      </div>
                      <span className="text-muted-foreground text-xs">
                        {new Date(a.timestamp).toLocaleString()}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      <DialogFooter>
        <DialogClose asChild>
          <Button>Close</Button>
        </DialogClose>
      </DialogFooter>
    </>
  )
}

export default function EventsPage() {
  const [items, setItems] = React.useState<EventItem[]>(initialEvents)
  const [addOpen, setAddOpen] = React.useState(false)
  const [attendeesByEvent, setAttendeesByEvent] = React.useState<Record<number, AttendanceRecord[]>>({})

  function parseEndDate(dateStr: string, timeRange: string): Date {
    const base = new Date(dateStr)
    const parts = timeRange.split(/–|—|-/)
    const end = (parts[1] ?? parts[0]).trim()
    const m = end.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/i)
    if (isNaN(base.getTime())) return new Date()
    if (m) {
      let h = parseInt(m[1], 10)
      const min = m[2] ? parseInt(m[2], 10) : 0
      const ampm = m[3].toUpperCase()
      if (ampm === 'PM' && h !== 12) h += 12
      if (ampm === 'AM' && h === 12) h = 0
      base.setHours(h, min, 0, 0)
      return base
    }
    base.setHours(23, 59, 0, 0)
    return base
  }

  function isEventDone(event: EventItem): boolean {
    const end = parseEndDate(event.date, event.time)
    return end.getTime() < Date.now()
  }

  const addSchema = z.object({
    title: z.string().min(3, 'Title is required'),
    date: z.string().min(1, 'Date is required'),
    time: z.string().min(1, 'Time is required'),
    venue: z.string().min(3, 'Venue is required'),
    audience: z.string().min(3, 'Audience is required'),
    description: z.string().min(10, 'Description is required'),
  })

  type AddEventValues = z.infer<typeof addSchema>

  const form = useForm<AddEventValues>({
    resolver: zodResolver(addSchema),
    defaultValues: {
      title: '',
      date: '',
      time: '',
      venue: '',
      audience: 'Fisherfolks & Farmers — everyone invited',
      description: '',
    },
  })

  const onAdd = (values: AddEventValues) => {
    const nextId = (items[0]?.id ?? 0) + 1
    const newEvent: EventItem = { id: nextId, ...values }
    setItems((prev) => [newEvent, ...prev])
    setAddOpen(false)
    form.reset()
  }

  function recordAttendance(eventId: number, member: any) {
    setAttendeesByEvent((prev) => {
      const list = prev[eventId] ?? []
      if (list.some((a) => a.id === member.id)) {
        return prev
      }
      const next: AttendanceRecord = {
        id: member.id,
        name: member.name,
        type: member.type,
        barangay: member.barangay,
        contactNumber: member.contactNumber,
        cropType: member.cropType,
        timestamp: new Date().toISOString(),
      }
      return { ...prev, [eventId]: [next, ...list] }
    })
  }

  function exportAttendees(event: EventItem) {
    const rows = (attendeesByEvent[event.id] ?? []).map((a) => ({
      ID: a.id,
      Name: a.name,
      Type: a.type,
      Barangay: a.barangay,
      Contact: a.contactNumber,
      Crop: a.cropType,
      Timestamp: new Date(a.timestamp).toLocaleString(),
      Event: event.title,
      Date: event.date,
      Time: event.time,
      Venue: event.venue,
    }))
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(rows)
    XLSX.utils.book_append_sheet(wb, ws, 'Attendees')
    const out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([out], { type: 'application/octet-stream' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${event.title} - Attendees.xlsx`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <AppLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Events</h1>
            <p className="text-muted-foreground">
              Upcoming activities in Olongapo for fisherfolks and farmers.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="size-4" />
                  Add Event
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Event</DialogTitle>
                  <DialogDescription>Provide event details below.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form className="space-y-4" onSubmit={form.handleSubmit(onAdd)}>
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Event Title</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Olongapo Coastal Resource Summit" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="time"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Time</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. 9:00 AM – 3:00 PM" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="venue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Venue</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Olongapo City Hall Plaza" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="audience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Audience</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Fisherfolks & Farmers — everyone invited" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Brief details about the event" rows={4} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button type="button" variant="outline">Cancel</Button>
                      </DialogClose>
                      <Button type="submit">Add Event</Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {items.map((event) => (
            <Card key={event.id} className="border border-border">
              <CardHeader className="border-b">
                <CardTitle className="text-xl">
                  {event.title}
                </CardTitle>
                <CardDescription className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">Open Invite</Badge>
                  <span className="sr-only">Audience</span>
                  <span>{event.audience}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 py-4">
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="size-4" />
                  <span className="font-medium">{event.date}</span>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground">{event.time}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="size-4" />
                  <span className="font-medium">{event.venue}</span>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <Users className="mt-0.5 size-4" />
                  <p className="text-muted-foreground">{event.description}</p>
                </div>
              </CardContent>
              <CardFooter className="border-t justify-end gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">View Details</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <EventDialogBody
                      event={event}
                      attendees={attendeesByEvent[event.id] ?? []}
                      isDone={isEventDone(event)}
                      onRecordAttendance={(member) => recordAttendance(event.id, member)}
                      onExport={() => exportAttendees(event)}
                    />
                  </DialogContent>
                </Dialog>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  )
}
