"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Mail,
  Calendar,
  Trash2,
  FlaskConical,
  Stethoscope,
  Pill,
  FileText,
  Bell,
  MessageSquare,
  CalendarPlus,
  Check,
  Building2,
} from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

export type OrderStatus = "pending-payment" | "ordered" | "cancelled"

export interface Order {
  id: string
  patientId?: string
  patientName?: string
  tests: string[]
  date: string
  status: OrderStatus
  timeframe: string
  notes?: string
  surgicalRouting?: {
    facility: string
    department: string
    urgency: string
  }
}

interface OrdersViewProps {
  orders: Order[]
  onCancelOrder?: (orderId: string) => void
}

const labTests = [
  // Lab Tests (blue)
  { name: "TSH", type: "test" },
  { name: "TSH Receptor Ab", type: "test" },
  { name: "Total T4 (TT4)", type: "test" },
  { name: "Free T4", type: "test" },
  { name: "Glucose", type: "test" },
  { name: "Vitamin D", type: "test" },
  // Procedures (red) - consolidated procedure and surgical
  { name: "ECG", type: "procedure" },
  { name: "Ultrasound", type: "procedure" },
  { name: "Surgery Consultation", type: "procedure" },
  { name: "X-Ray", type: "procedure" },
  { name: "Thyroidectomy", type: "procedure" },
  { name: "Biopsy - Fine Needle Aspiration", type: "procedure" },
  { name: "Laparoscopic Cholecystectomy", type: "procedure" },
  { name: "Colonoscopy", type: "procedure" },
  // Pharmacology (green)
  { name: "Levothyroxine 50mcg", type: "medicine" },
  { name: "Metformin 500mg", type: "medicine" },
  { name: "Lisinopril 10mg", type: "medicine" },
  { name: "Atorvastatin 20mg", type: "medicine" },
  // Assessment / Diagnoses (orange)
  { name: "E03.9 Hypothyroidism, unspecified", type: "diagnosis" },
  { name: "E11.9 Type 2 diabetes mellitus", type: "diagnosis" },
  { name: "I10 Essential (primary) hypertension", type: "diagnosis" },
  { name: "R00.0 Tachycardia, unspecified", type: "diagnosis" },
]

function generateICSFile(order: Order): string {
  const now = new Date()
  const appointmentDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  const endDate = new Date(appointmentDate.getTime() + 60 * 60 * 1000)

  const formatDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"
  }

  const testsList = order.tests.join(", ")

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//NeXT Health//Lab Tests//EN
BEGIN:VEVENT
UID:${order.id}@nexthealth.com
DTSTAMP:${formatDate(now)}
DTSTART:${formatDate(appointmentDate)}
DTEND:${formatDate(endDate)}
SUMMARY:Lab Tests Appointment - NeXT Health
DESCRIPTION:Scheduled tests: ${testsList}${order.notes ? `\\n\\nNotes: ${order.notes}` : ""}
LOCATION:NeXT Health Clinic
STATUS:CONFIRMED
BEGIN:VALARM
TRIGGER:-P1D
ACTION:DISPLAY
DESCRIPTION:Reminder: Lab tests appointment tomorrow
END:VALARM
BEGIN:VALARM
TRIGGER:-PT2H
ACTION:DISPLAY
DESCRIPTION:Reminder: Lab tests appointment in 2 hours
END:VALARM
END:VEVENT
END:VCALENDAR`
}

function downloadICSFile(order: Order) {
  const icsContent = generateICSFile(order)
  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `lab-appointment-${order.id}.ics`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function OrdersView({ orders, onCancelOrder }: OrdersViewProps) {
  const [sentReminders, setSentReminders] = useState<Record<string, { email?: boolean; sms?: boolean }>>({})

  const handleSendEmailReminder = (order: Order) => {
    setSentReminders((prev) => ({
      ...prev,
      [order.id]: { ...prev[order.id], email: true },
    }))
    toast.success("Email reminder sent", {
      description: `Reminder sent to ${order.patientName || "patient"} for scheduled tests.`,
    })
  }

  const handleSendSMSReminder = (order: Order) => {
    setSentReminders((prev) => ({
      ...prev,
      [order.id]: { ...prev[order.id], sms: true },
    }))
    toast.success("SMS reminder sent", {
      description: `Text message sent to ${order.patientName || "patient"}'s phone.`,
    })
  }

  const handleDownloadCalendar = (order: Order) => {
    downloadICSFile(order)
    toast.success("Calendar file downloaded", {
      description: "Patient can add this to their phone calendar.",
    })
  }

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "pending-payment":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50">
            Pending Payment
          </Badge>
        )
      case "ordered":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 hover:bg-green-50">
            Ordered
          </Badge>
        )
      case "cancelled":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 hover:bg-red-50">
            Cancelled
          </Badge>
        )
      default:
        return null
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "test":
        return <FlaskConical className="h-3.5 w-3.5 text-blue-600" /> // Lab Tests = blue
      case "diagnosis":
        return <FileText className="h-3.5 w-3.5 text-orange-600" /> // Assessment/Diagnoses = orange
      case "medicine":
        return <Pill className="h-3.5 w-3.5 text-green-600" /> // Pharmacology = green
      case "procedure":
        return <Stethoscope className="h-3.5 w-3.5 text-red-600" /> // Procedures = red
      default:
        return <FileText className="h-3.5 w-3.5 text-slate-400" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "test":
        return "Lab Tests"
      case "diagnosis":
        return "Assessment / Diagnoses"
      case "medicine":
        return "Pharmacology"
      case "procedure":
        return "Procedures"
      default:
        return "Other"
    }
  }

  const getTypeBgColor = (type: string) => {
    switch (type) {
      case "test":
        return "bg-blue-50 border-blue-200 text-blue-700"
      case "diagnosis":
        return "bg-orange-50 border-orange-200 text-orange-700"
      case "medicine":
        return "bg-green-50 border-green-200 text-green-700"
      case "procedure":
        return "bg-red-50 border-red-200 text-red-700"
      default:
        return "bg-slate-50 border-slate-200 text-slate-700"
    }
  }

  const getFacilityLabel = (facility: string) => {
    switch (facility) {
      case "central-hospital":
        return "Central Hospital"
      case "university-medical":
        return "University Medical Center"
      case "surgical-center":
        return "Ambulatory Surgical Center"
      default:
        return facility
    }
  }

  const getDepartmentLabel = (department: string) => {
    switch (department) {
      case "general-surgery":
        return "General Surgery"
      case "endocrine-surgery":
        return "Endocrine Surgery"
      case "gi-surgery":
        return "GI Surgery"
      case "cardiothoracic":
        return "Cardiothoracic Surgery"
      default:
        return department
    }
  }

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case "emergency":
        return <Badge className="bg-red-600 text-white">Emergency</Badge>
      case "urgent":
        return <Badge className="bg-orange-500 text-white">Urgent</Badge>
      default:
        return <Badge variant="secondary">Routine</Badge>
    }
  }

  if (orders.length === 0) {
    return <div className="text-center py-6 text-muted-foreground text-sm">No scheduled orders yet.</div>
  }

  const categoryOrder = ["test", "diagnosis", "medicine", "procedure"]

  const getItemType = (itemName: string): string => {
    const normalizedName = itemName.toLowerCase()

    // Check for ICD-10 codes (diagnoses) - pattern like E03.9, I10, R00.0, etc.
    if (/^[a-z]\d{2}(\.\d+)?/i.test(itemName.trim())) {
      return "diagnosis"
    }

    // Check for procedure keywords
    const procedureKeywords = [
      "ultrasound",
      "ecg",
      "x-ray",
      "xray",
      "surgery",
      "biopsy",
      "thyroidectomy",
      "cholecystectomy",
      "colonoscopy",
      "mri",
      "ct scan",
      "procedure",
      "consultation",
    ]
    if (procedureKeywords.some((keyword) => normalizedName.includes(keyword))) {
      return "procedure"
    }

    // Check for medicine keywords
    const medicineKeywords = [
      "mg",
      "mcg",
      "ml",
      "tablet",
      "capsule",
      "levothyroxine",
      "metformin",
      "lisinopril",
      "atorvastatin",
      "prescription",
    ]
    if (medicineKeywords.some((keyword) => normalizedName.includes(keyword))) {
      return "medicine"
    }

    // Check for lab test keywords
    const testKeywords = [
      "tsh",
      "t4",
      "t3",
      "glucose",
      "vitamin",
      "blood",
      "urine",
      "panel",
      "cbc",
      "lipid",
      "a1c",
      "creatinine",
      "bun",
      "ast",
      "alt",
      "cholesterol",
    ]
    if (testKeywords.some((keyword) => normalizedName.includes(keyword))) {
      return "test"
    }

    // Check exact match in labTests array
    const exactMatch = labTests.find((t) => t.name.toLowerCase() === normalizedName)
    if (exactMatch) {
      return exactMatch.type === "surgical" ? "procedure" : exactMatch.type
    }

    // Check partial match in labTests array
    const partialMatch = labTests.find(
      (t) => normalizedName.includes(t.name.toLowerCase()) || t.name.toLowerCase().includes(normalizedName),
    )
    if (partialMatch) {
      return partialMatch.type === "surgical" ? "procedure" : partialMatch.type
    }

    return "other"
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => {
        const groupedItems = order.tests.reduce(
          (acc, itemName) => {
            const type = getItemType(itemName)
            if (!acc[type]) acc[type] = []
            acc[type].push(itemName)
            return acc
          },
          {} as Record<string, string[]>,
        )

        const reminderStatus = sentReminders[order.id] || {}

        return (
          <div
            key={order.id}
            className={`border rounded-lg p-4 space-y-3 ${
              order.status === "cancelled" ? "opacity-60 bg-slate-50" : "bg-white"
            }`}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">Order #{order.id.slice(-6)}</span>
                  {getStatusBadge(order.status)}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>{order.date}</span>
                  <span className="text-slate-300">|</span>
                  <span>{order.timeframe}</span>
                </div>
              </div>

              {/* Actions Dropdown */}
              {order.status !== "cancelled" && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Bell className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => handleSendEmailReminder(order)}>
                      <Mail className="h-4 w-4 mr-2" />
                      Send Email Reminder
                      {reminderStatus.email && <Check className="h-3 w-3 ml-auto text-green-600" />}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSendSMSReminder(order)}>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Send SMS Reminder
                      {reminderStatus.sms && <Check className="h-3 w-3 ml-auto text-green-600" />}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleDownloadCalendar(order)}>
                      <CalendarPlus className="h-4 w-4 mr-2" />
                      Download Calendar (.ics)
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onCancelOrder?.(order.id)}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Cancel Order
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {/* Reminder badges */}
            {(reminderStatus.email || reminderStatus.sms) && (
              <div className="flex gap-2">
                {reminderStatus.email && (
                  <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                    <Mail className="h-3 w-3 mr-1" />
                    Email Sent
                  </Badge>
                )}
                {reminderStatus.sms && (
                  <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                    <MessageSquare className="h-3 w-3 mr-1" />
                    SMS Sent
                  </Badge>
                )}
              </div>
            )}

            <div className="space-y-3">
              {categoryOrder.map((type) => {
                const items = groupedItems[type]
                if (!items || items.length === 0) return null
                return (
                  <div key={type} className="space-y-1.5">
                    <div
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium border ${getTypeBgColor(type)}`}
                    >
                      {getTypeIcon(type)}
                      {getTypeLabel(type)}
                    </div>
                    {items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm pl-1">
                        {getTypeIcon(type)}
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                )
              })}
              {/* Other items not in the 4 categories */}
              {groupedItems["other"] && groupedItems["other"].length > 0 && (
                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium border bg-slate-50 border-slate-200 text-slate-700">
                    <FileText className="h-3.5 w-3.5" />
                    Other
                  </div>
                  {groupedItems["other"].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm pl-1">
                      <FileText className="h-3.5 w-3.5 text-slate-400" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Surgical Routing Info */}
            {order.surgicalRouting && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-red-600" />
                  <span className="font-medium text-sm text-red-900">Surgical Referral</span>
                  {getUrgencyBadge(order.surgicalRouting.urgency)}
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">Facility:</span>
                    <p className="font-medium">{getFacilityLabel(order.surgicalRouting.facility)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Department:</span>
                    <p className="font-medium">{getDepartmentLabel(order.surgicalRouting.department)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            {order.notes && (
              <div className="text-xs text-muted-foreground bg-slate-50 p-2 rounded">
                <span className="font-medium">Notes:</span> {order.notes}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
