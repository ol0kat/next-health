"use client"

import { useState } from 'react'
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Video, 
  User, 
  Clock, 
  Calendar as CalendarIcon, 
  MapPin, 
  FileText,
  ExternalLink,
  MoreHorizontal,
  Phone
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from '@/lib/utils'

// --- Types & Mock Data ---

type AppointmentType = 'In-Person' | 'Video Call'

interface Appointment {
  id: number
  patientId: string
  patientName: string
  patientAvatar?: string
  type: AppointmentType
  reason: string
  day: number // 0 = Mon
  startHour: number
  duration: number // hours
  status: 'confirmed' | 'checked-in' | 'completed' | 'cancelled'
}

const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 1,
    patientId: 'P001',
    patientName: 'Sarah Johnson',
    type: 'In-Person',
    reason: 'Post-surgery Follow-up',
    day: 0, 
    startHour: 10,
    duration: 1,
    status: 'checked-in'
  },
  {
    id: 2,
    patientId: 'P002',
    patientName: 'Michael Chen',
    type: 'In-Person',
    reason: 'Initial Consultation',
    day: 1, 
    startHour: 14,
    duration: 1,
    status: 'confirmed'
  },
  {
    id: 3,
    patientId: 'P003',
    patientName: 'Emma Wilson',
    type: 'In-Person',
    reason: 'Lab Results Review',
    day: 2,
    startHour: 11,
    duration: 0.5,
    status: 'confirmed'
  },
  {
    id: 5,
    patientId: 'P001', // Same patient
    patientName: 'Sarah Johnson',
    type: 'Video Call',
    reason: 'Emergency Consultation',
    day: 4, 
    startHour: 15,
    duration: 1,
    status: 'confirmed'
  },
]

const HOURS = Array.from({ length: 13 }, (_, i) => i + 8) // 8 AM to 8 PM
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
const DATES = ['4', '5', '6', '7', '8']

// --- Component ---

export function AgendaView() {
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS)
  
  // Dialog States
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  
  // Selection States
  const [selectedSlot, setSelectedSlot] = useState<{day: number, hour: number} | null>(null)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  
  // Form States (Basic)
  const [newPatientName, setNewPatientName] = useState("")
  const [newType, setNewType] = useState<AppointmentType>("In-Person")

  // --- Actions ---

  const handleSlotClick = (dayIndex: number, hour: number) => {
    setSelectedSlot({ day: dayIndex, hour })
    setNewType("In-Person") // reset default
    setNewPatientName("")
    setIsBookingOpen(true)
  }

  const handleAppointmentClick = (e: React.MouseEvent, apt: Appointment) => {
    e.stopPropagation() // Prevent triggering the slot click
    setSelectedAppointment(apt)
    setIsDetailsOpen(true)
  }

  const handleCreateAppointment = () => {
    if (!selectedSlot || !newPatientName) return

    const newApt: Appointment = {
      id: Date.now(),
      patientId: 'NEW', // In real app, this would be linked
      patientName: newPatientName,
      type: newType,
      reason: 'General Consultation',
      day: selectedSlot.day,
      startHour: selectedSlot.hour,
      duration: 1,
      status: 'confirmed'
    }

    setAppointments([...appointments, newApt])
    setIsBookingOpen(false)
  }

  // Determine styling based on type and status
  const getAppointmentStyle = (apt: Appointment) => {
    const baseStyle = "absolute left-1 right-1 rounded-md p-2 text-xs border shadow-sm cursor-pointer transition-all hover:shadow-md hover:scale-[1.02] z-10 flex flex-col gap-1 overflow-hidden"
    
    if (apt.type === 'Video Call') {
      return cn(baseStyle, "bg-purple-50 border-purple-200 text-purple-900 border-l-4 border-l-purple-500")
    }
    return cn(baseStyle, "bg-blue-50 border-blue-200 text-blue-900 border-l-4 border-l-blue-500")
  }

  return (
    <div className="flex flex-col h-full bg-background rounded-lg border shadow-sm overflow-hidden">
      
      {/* 1. Header Toolbar */}
      <div className="flex items-center justify-between p-4 border-b bg-card">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-muted-foreground" />
            December 2023
          </h2>
          <div className="flex items-center rounded-md border bg-background shadow-sm">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="outline" size="sm" className="hidden sm:flex">Today</Button>
        </div>
        
        <div className="flex items-center gap-2">
           {/* Legend (Hidden on mobile) */}
           <div className="hidden md:flex items-center gap-4 text-xs text-muted-foreground mr-4">
              <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"></div>In-Person</div>
              <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-purple-500"></div>Video</div>
           </div>
          <Button onClick={() => {
             setSelectedSlot({ day: 0, hour: 9 }) // Default to Mon 9am
             setIsBookingOpen(true)
          }}>
            <Plus className="w-4 h-4 mr-2" />
            New Appointment
          </Button>
        </div>
      </div>

      {/* 2. Calendar Grid */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-slate-950">
        
        {/* Days Header */}
        <div className="grid grid-cols-6 border-b divide-x">
          <div className="p-4 bg-muted/30 text-xs font-medium text-muted-foreground text-center pt-8">
            TIME (GMT+7)
          </div>
          {DAYS.map((day, i) => (
            <div key={day} className="p-3 text-center group hover:bg-muted/20 transition-colors">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">{day}</div>
              <div className={cn(
                "text-xl font-semibold w-8 h-8 rounded-full flex items-center justify-center mx-auto",
                DATES[i] === '8' ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30" : "text-foreground group-hover:bg-muted"
              )}>
                {DATES[i]}
              </div>
            </div>
          ))}
        </div>

        {/* Scrollable Time Grid */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-6 relative min-h-[1040px]"> {/* 13 hours * 80px */}
            
            {/* Time Column */}
            <div className="border-r bg-muted/5 divide-y">
              {HOURS.map((hour) => (
                <div key={hour} className="h-20 p-2 text-xs text-muted-foreground text-right relative">
                  <span className="-top-3 relative bg-background px-1 rounded">
                    {hour > 12 ? `${hour - 12} PM` : `${hour} ${hour === 12 ? 'PM' : 'AM'}`}
                  </span>
                </div>
              ))}
            </div>

            {/* Day Columns */}
            {DAYS.map((day, dayIndex) => (
              <div key={day} className="border-r relative divide-y hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                
                {/* Current Time Indicator (Visual Polish) */}
                {dayIndex === 4 && (
                    <div className="absolute w-full border-t-2 border-red-500 z-20 pointer-events-none flex items-center" style={{ top: '650px' }}>
                        <div className="w-2 h-2 bg-red-500 rounded-full -ml-1"></div>
                    </div>
                )}

                {/* Empty Slots (Click Targets) */}
                {HOURS.map((hour) => (
                  <div 
                    key={hour} 
                    className="h-20 cursor-pointer hover:bg-primary/5 transition-colors relative group"
                    onClick={() => handleSlotClick(dayIndex, hour)}
                  >
                     <div className="hidden group-hover:flex absolute inset-0 items-center justify-center">
                        <Plus className="h-4 w-4 text-primary/30" />
                     </div>
                  </div>
                ))}
                
                {/* Appointment Cards */}
                {appointments
                  .filter(apt => apt.day === dayIndex)
                  .map(apt => (
                    <div
                      key={apt.id}
                      className={getAppointmentStyle(apt)}
                      onClick={(e) => handleAppointmentClick(e, apt)}
                      style={{
                        top: `${(apt.startHour - 8) * 80 + 2}px`,
                        height: `${apt.duration * 80 - 4}px`
                      }}
                    >
                      <div className="flex justify-between items-start">
                         <span className="font-semibold truncate">{apt.patientName}</span>
                         {apt.type === 'Video Call' ? <Video className="h-3 w-3 shrink-0" /> : <User className="h-3 w-3 shrink-0" />}
                      </div>
                      <div className="text-[10px] opacity-80 line-clamp-1">{apt.reason}</div>
                      <div className="mt-auto text-[10px] font-mono opacity-70 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {apt.startHour}:00 - {apt.startHour + apt.duration}:00
                      </div>
                    </div>
                  ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Receptionist: Booking Dialog */}
      <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>New Appointment</DialogTitle>
            <DialogDescription>
               {selectedSlot && `${DAYS[selectedSlot.day]}, Dec ${DATES[selectedSlot.day]} at ${selectedSlot.hour}:00`}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
               <Label>Patient Name</Label>
               <Input 
                 placeholder="Search or enter name..." 
                 value={newPatientName}
                 onChange={(e) => setNewPatientName(e.target.value)}
                 autoFocus
               />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="grid gap-2">
                 <Label>Type</Label>
                 <Tabs defaultValue={newType} onValueChange={(v) => setNewType(v as AppointmentType)} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="In-Person">Clinic</TabsTrigger>
                        <TabsTrigger value="Video Call">Video</TabsTrigger>
                    </TabsList>
                 </Tabs>
               </div>
               <div className="grid gap-2">
                  <Label>Duration</Label>
                  <Select defaultValue="1">
                     <SelectTrigger>
                        <SelectValue placeholder="Select" />
                     </SelectTrigger>
                     <SelectContent>
                        <SelectItem value="0.5">30 mins</SelectItem>
                        <SelectItem value="1">1 Hour</SelectItem>
                        <SelectItem value="1.5">1.5 Hours</SelectItem>
                     </SelectContent>
                  </Select>
               </div>
            </div>
            <div className="grid gap-2">
               <Label>Reason for Visit</Label>
               <Input placeholder="e.g. Cough, Annual Checkup" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBookingOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateAppointment}>Book Appointment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 4. Doctor: Appointment Details & Context Switch */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          {selectedAppointment && (
             <>
               <DialogHeader>
                 <div className="flex items-center justify-between">
                    <Badge variant={selectedAppointment.type === 'Video Call' ? 'secondary' : 'default'} className="mb-2">
                       {selectedAppointment.type}
                    </Badge>
                    <Badge variant="outline" className={
                       selectedAppointment.status === 'checked-in' ? 'text-green-600 border-green-200 bg-green-50' : ''
                    }>
                       {selectedAppointment.status}
                    </Badge>
                 </div>
                 <DialogTitle className="text-2xl flex items-center gap-2">
                    {selectedAppointment.patientName}
                 </DialogTitle>
                 <DialogDescription className="flex items-center gap-2 mt-1">
                    <Clock className="h-3 w-3" />
                    {DAYS[selectedAppointment.day]} at {selectedAppointment.startHour}:00 ({selectedAppointment.duration}hr)
                 </DialogDescription>
               </DialogHeader>

               <div className="grid gap-6 py-4">
                  {/* Patient Quick Stats (Fake) */}
                  <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                     <Avatar className="h-10 w-10">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedAppointment.patientId}`} />
                        <AvatarFallback>P</AvatarFallback>
                     </Avatar>
                     <div className="flex-1">
                        <div className="text-sm font-medium">Last Visit: Nov 12, 2023</div>
                        <div className="text-xs text-muted-foreground">Dr. Smith • Follow-up</div>
                     </div>
                     <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                  </div>

                  <div className="space-y-3">
                     <div className="flex gap-2 text-sm">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold w-24">Reason:</span>
                        <span>{selectedAppointment.reason}</span>
                     </div>
                     <div className="flex gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold w-24">Location:</span>
                        <span>{selectedAppointment.type === 'Video Call' ? 'Telehealth Platform' : 'Room 302'}</span>
                     </div>
                  </div>

                  {/* Context Switch Actions */}
                  <div className="grid grid-cols-2 gap-3">
                     {selectedAppointment.type === 'Video Call' ? (
                        <Button className="w-full bg-purple-600 hover:bg-purple-700">
                           <Video className="h-4 w-4 mr-2" />
                           Join Call
                        </Button>
                     ) : (
                        <Button className="w-full" variant="secondary">
                           <User className="h-4 w-4 mr-2" />
                           Check In
                        </Button>
                     )}
                     
                     <Button 
                        variant="default" 
                        className="w-full border-primary"
                        onClick={() => {
                           if (selectedAppointment.patientId === 'P001') {
                              window.open('/my-patients/b2c3d4e5-f6a7-4901-bcde-f23456789012', '_blank')
                           } else {
                              alert(`Patient ID ${selectedAppointment.patientId} not mapped yet`)
                           }
                           setIsDetailsOpen(false)
                        }}
                     >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open Patient File
                     </Button>
                  </div>
               </div>
             </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
