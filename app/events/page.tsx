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
import { 
  Calendar, 
  MapPin, 
  Users, 
  QrCode, 
  Plus,
  Clock,
  Download,
  Camera,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Filter,
  Search
} from 'lucide-react'
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
import * as XLSX from 'xlsx'
import { supabase } from '@/lib/supabase'
import { buildDisplayName, mapRecordRow, type RecordItem, type RecordRow } from '@/lib/records'
import { cn } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

type EventItem = {
  id: number
  title: string
  date: string
  time: string
  venue: string
  audience: string
  description: string
  status?: 'upcoming' | 'ongoing' | 'completed'
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
    audience: 'Fisherfolks & Farmers',
    description:
      'Updates on coastal management, community consultation, and programs supporting local fisherfolks and farmers.',
  },
  {
    id: 2,
    title: 'Integrated Farming & Aquaculture Fair',
    date: 'February 17, 2026',
    time: '8:00 AM – 5:00 PM',
    venue: 'Barangay Barretto Covered Court',
    audience: 'Fisherfolks & Farmers',
    description:
      'Hands-on demos, seedling and fingerling distribution, and sign-ups for training opportunities.',
  },
  {
    id: 3,
    title: 'Disaster Preparedness & Livelihood Workshop',
    date: 'February 24, 2026',
    time: '1:00 PM – 4:30 PM',
    venue: 'Olongapo Convention Center',
    audience: 'Fisherfolks & Farmers',
    description:
      'Community DRR training, emergency aid programs overview, and resilient livelihood planning.',
  },
  {
    id: 4,
    title: 'Citywide Registry Day: Fisherfolk & Farmer Enrollment',
    date: 'March 2, 2026',
    time: '8:00 AM – 4:00 PM',
    venue: 'Olongapo City Agriculture Office',
    audience: 'Open to all',
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
  records,
}: {
  event: EventItem
  attendees: AttendanceRecord[]
  isDone: boolean
  onRecordAttendance: (member: RecordItem) => void
  onExport: () => void
  records: RecordItem[]
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
      const byId = records.find((r) => r.id === id)
      if (byId) return byId
    }
    const byName = records.find((r) => buildDisplayName(r).toLowerCase() === norm)
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
      <DialogHeader className="space-y-3">
        <div className="flex items-start justify-between">
          <DialogTitle className="text-xl">{event.title}</DialogTitle>
          <Badge variant={isDone ? "secondary" : "default"} className={cn(
            "ml-2",
            isDone ? "bg-slate-500/10 text-slate-600" : "bg-green-500/10 text-green-600"
          )}>
            {isDone ? 'Completed' : 'Upcoming'}
          </Badge>
        </div>
        <DialogDescription>{event.audience}</DialogDescription>
      </DialogHeader>
      
      <div className="space-y-6">
        {/* Event Details */}
        <div className="grid gap-3 rounded-lg bg-muted/30 p-4">
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="h-4 w-4 text-primary" />
            <span className="font-medium text-foreground">{event.date}</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {event.time}
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="font-medium text-foreground">{event.venue}</span>
          </div>
          <div className="flex items-start gap-3 text-sm">
            <Users className="mt-0.5 h-4 w-4 text-primary" />
            <p className="text-muted-foreground">{event.description}</p>
          </div>
        </div>

        {/* Attendance Scanner */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-primary/10 p-2">
                <QrCode className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-foreground">Attendance Scanner</h4>
                <p className="text-xs text-muted-foreground">Scan QR codes to record attendance</p>
              </div>
            </div>
            {!isDone && (
              <Button
                variant={scanning ? "destructive" : "default"}
                size="sm"
                onClick={() => setScanning(!scanning)}
                className={cn(
                  "gap-2",
                  scanning ? "bg-destructive/90 hover:bg-destructive" : "bg-primary/90 hover:bg-primary"
                )}
              >
                {scanning ? (
                  <>
                    <XCircle className="h-4 w-4" />
                    Stop
                  </>
                ) : (
                  <>
                    <Camera className="h-4 w-4" />
                    Start Scanner
                  </>
                )}
              </Button>
            )}
          </div>

          {scanning && !isDone && (
            <Card className="overflow-hidden border border-border/50">
              <div className="relative aspect-video bg-black">
                <video
                  ref={videoRef}
                  className="h-full w-full object-cover"
                  muted
                />
                <div className="absolute inset-0 border-2 border-primary/50 pointer-events-none" />
              </div>
              <div className="p-3 text-center">
                <p className="text-xs text-muted-foreground">
                  Position QR code within the frame
                </p>
              </div>
            </Card>
          )}

          {qrText && (
            <Card className={cn(
              "border p-3",
              memberName ? "border-green-500/20 bg-green-500/5" : "border-destructive/20 bg-destructive/5"
            )}>
              <div className="flex items-start gap-3">
                {memberName ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                ) : (
                  <XCircle className="h-5 w-5 text-destructive shrink-0" />
                )}
                <div className="flex-1">
                  <p className="text-xs font-medium text-foreground">Scanned Data</p>
                  <p className="text-xs text-muted-foreground break-all">{qrText}</p>
                  {memberName && (
                    <p className="mt-1 text-xs font-medium text-green-600">
                      ✓ {memberName} recorded
                    </p>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Attendees List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <h4 className="text-sm font-medium text-foreground">
                  Attendees ({attendees.length})
                </h4>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={onExport}
                disabled={attendees.length === 0}
                className="gap-2"
              >
                <Download className="h-3 w-3" />
                Export
              </Button>
            </div>
            
            {attendees.length === 0 ? (
              <div className="rounded-lg border border-dashed p-6 text-center">
                <Users className="mx-auto h-8 w-8 text-muted-foreground/50" />
                <p className="mt-2 text-xs text-muted-foreground">No attendees yet</p>
              </div>
            ) : (
              <div className="max-h-64 overflow-auto rounded-lg border divide-y">
                {attendees.map((a) => (
                  <div key={`${a.id}-${a.timestamp}`} className="p-3 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">{a.name}</p>
                        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                          <Badge variant="secondary" className="px-1 py-0 text-[10px]">
                            {a.type}
                          </Badge>
                          <span>•</span>
                          <span>{a.barangay}</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(a.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Close</Button>
        </DialogClose>
      </DialogFooter>
    </>
  )
}

export default function EventsPage() {
  const [items, setItems] = React.useState<EventItem[]>(initialEvents)
  const [addOpen, setAddOpen] = React.useState(false)
  const [attendeesByEvent, setAttendeesByEvent] = React.useState<Record<number, AttendanceRecord[]>>({})
  const [records, setRecords] = React.useState<RecordItem[]>([])
  const [searchQuery, setSearchQuery] = React.useState('')
  const [filterStatus, setFilterStatus] = React.useState<'all' | 'upcoming' | 'completed'>('all')

  React.useEffect(() => {
    let mounted = true
    const loadRecords = async () => {
      const { data, error } = await supabase
        .from('records')
        .select('*')
        .order('id', { ascending: false })
      if (!mounted) return
      if (error) {
        console.error('Failed to load records', error)
        setRecords([])
        return
      }
      setRecords((data ?? []).map((row) => mapRecordRow(row as RecordRow)))
    }

    loadRecords()
    return () => {
      mounted = false
    }
  }, [])

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

  // Filter events
  const filteredEvents = React.useMemo(() => {
    return items.filter(event => {
      const done = isEventDone(event)
      const matchesStatus = filterStatus === 'all' || 
        (filterStatus === 'upcoming' && !done) ||
        (filterStatus === 'completed' && done)
      
      const matchesSearch = searchQuery === '' || 
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase())
      
      return matchesStatus && matchesSearch
    })
  }, [items, searchQuery, filterStatus])

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
      audience: 'Fisherfolks & Farmers',
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

  function recordAttendance(eventId: number, member: RecordItem) {
    setAttendeesByEvent((prev) => {
      const list = prev[eventId] ?? []
      if (list.some((a) => a.id === member.id)) {
        return prev
      }
      const memberName = buildDisplayName(member) || member.name
      const next: AttendanceRecord = {
        id: member.id,
        name: memberName,
        type: member.type || 'N/A',
        barangay: member.barangay,
        contactNumber: member.contactNumber || '',
        cropType: member.cropType || '',
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Events & Attendance
            </h1>
            <p className="text-sm text-muted-foreground md:text-base">
              Manage upcoming activities and track attendance
            </p>
          </div>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary">
                <Plus className="h-4 w-4" />
                Add Event
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add New Event</DialogTitle>
                <DialogDescription>
                  Fill in the details below to create a new event.
                </DialogDescription>
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
                        <FormLabel>Target Audience</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Fisherfolks & Farmers" {...field} />
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
                    <Button type="submit">Create Event</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filter */}
        <Card className="border border-border/50 bg-gradient-to-br from-background via-background to-muted/20 p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 border-border/50 bg-background/50"
              />
            </div>
            <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
              <SelectTrigger className="w-[180px] border-border/50 bg-background/50">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Events Grid */}
        {filteredEvents.length === 0 ? (
          <Card className="border border-border/50 bg-gradient-to-br from-background via-background to-muted/20 p-12 text-center">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold text-foreground">No events found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {searchQuery || filterStatus !== 'all' 
                ? 'Try adjusting your search or filters' 
                : 'Get started by creating your first event'}
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredEvents.map((event) => {
              const done = isEventDone(event)
              const attendeeCount = attendeesByEvent[event.id]?.length || 0
              
              return (
                <Card 
                  key={event.id} 
                  className="group relative overflow-hidden border border-border/50 bg-gradient-to-br from-background via-background to-muted/20 transition-all hover:shadow-md"
                >
                  {/* Status Indicator */}
                  <div className={cn(
                    "absolute right-0 top-0 h-20 w-20 translate-x-8 -translate-y-8 rounded-full transition-transform group-hover:scale-150",
                    done ? "bg-slate-500/5" : "bg-green-500/5"
                  )} />
                  
                  <CardHeader className="space-y-2">
                    <div className="flex items-start justify-between">
                      <Badge variant={done ? "secondary" : "default"} className={cn(
                        done ? "bg-slate-500/10 text-slate-600" : "bg-green-500/10 text-green-600"
                      )}>
                        {done ? 'Completed' : 'Upcoming'}
                      </Badge>
                      {attendeeCount > 0 && (
                        <Badge variant="outline" className="gap-1">
                          <Users className="h-3 w-3" />
                          {attendeeCount}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg leading-snug line-clamp-2">
                      {event.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-1">
                      {event.audience}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-primary shrink-0" />
                      <span className="font-medium text-foreground">{event.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-primary shrink-0" />
                      <span className="text-muted-foreground">{event.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-primary shrink-0" />
                      <span className="text-muted-foreground line-clamp-1">{event.venue}</span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {event.description}
                    </p>
                  </CardContent>
                  
                  <CardFooter className="border-t border-border/50 pt-4">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full gap-2">
                          <QrCode className="h-4 w-4" />
                          Manage Attendance
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                        <EventDialogBody
                          event={event}
                          attendees={attendeesByEvent[event.id] ?? []}
                          isDone={done}
                          onRecordAttendance={(member) => recordAttendance(event.id, member)}
                          onExport={() => exportAttendees(event)}
                          records={records}
                        />
                      </DialogContent>
                    </Dialog>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </AppLayout>
  )
}