"use client"

import type React from "react"
import type { UnitSystem } from "./telehealth-dashboard"
import { useApp } from "./app-provider"
import { useState, forwardRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  ArrowUp,
  ArrowDown,
  Check,
  Search,
  TrendingUpIcon,
  AlertCircle,
  AlertTriangle,
  PersonStandingIcon,
  MoreVertical,
  Upload,
  Download,
  Mail,
  ChevronDown,
  ChevronRight,
  Calendar,
  Clock,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
} from "recharts"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

const SARAH_JOHNSON_SUPABASE_ID = "b2c3d4e5-f6a7-4901-bcde-f23456789012"
const SARAH_JOHNSON_LOCAL_ID = "PT-2024-002"

// Unified data structure for both Labs and Vitals
const labDataForSarahJohnson = [
  // --- Vital Signs --- (keeping all results)
  {
    test: "Heart Rate",
    category: "Vital Signs",
    unit: "bpm",
    trend: "stable" as const,
    results: [
      { date: "2025-01-15", value: 72, id: "V001", status: "normal" as const },
      { date: "2025-04-20", value: 75, id: "V002", status: "normal" as const },
      { date: "2025-07-10", value: 70, id: "V003", status: "normal" as const },
      { date: "2025-10-15", value: 74, id: "V004", status: "normal" as const },
    ],
    referenceRange: { min: 60, max: 100 },
  },
  {
    test: "Blood Pressure",
    category: "Vital Signs",
    unit: "mmHg",
    trend: "stable" as const,
    isCombined: true,
    results: [
      { date: "2025-01-15", value: 118, diastolic: 78, id: "V005", status: "normal" as const },
      { date: "2025-04-20", value: 122, diastolic: 82, id: "V006", status: "borderline" as const },
      { date: "2025-07-10", value: 119, diastolic: 79, id: "V007", status: "normal" as const },
      { date: "2025-10-15", value: 120, diastolic: 80, id: "V008", status: "normal" as const },
    ],
    referenceRange: { min: 90, max: 120 },
    secondaryReferenceRange: { min: 60, max: 80 },
  },
  {
    test: "Respiratory Rate",
    category: "Vital Signs",
    unit: "breaths/min",
    trend: "stable" as const,
    results: [
      { date: "2025-01-15", value: 16, id: "V013", status: "normal" as const },
      { date: "2025-04-20", value: 18, id: "V014", status: "normal" as const },
      { date: "2025-07-10", value: 17, id: "V015", status: "normal" as const },
      { date: "2025-10-15", value: 16, id: "V016", status: "normal" as const },
    ],
    referenceRange: { min: 12, max: 20 },
  },
  {
    test: "Oxygen Saturation",
    category: "Vital Signs",
    unit: "%",
    trend: "stable" as const,
    results: [
      { date: "2025-01-15", value: 98, id: "V017", status: "normal" as const },
      { date: "2025-04-20", value: 99, id: "V018", status: "normal" as const },
      { date: "2025-07-10", value: 98, id: "V019", status: "normal" as const },
      { date: "2025-10-15", value: 99, id: "V020", status: "normal" as const },
    ],
    referenceRange: { min: 95, max: 100 },
  },
  {
    test: "Weight",
    category: "Vital Signs",
    unit: "kg",
    trend: "improving" as const,
    results: [
      { date: "2025-01-15", value: 84.0, id: "V025", status: "high" as const },
      { date: "2025-04-20", value: 82.5, id: "V026", status: "high" as const },
      { date: "2025-07-10", value: 80.7, id: "V027", status: "borderline" as const },
      { date: "2025-10-15", value: 79.4, id: "V028", status: "normal" as const },
    ],
    referenceRange: { min: 55, max: 80 },
  },
  {
    test: "BMI",
    category: "Vital Signs",
    unit: "kg/m²",
    trend: "improving" as const,
    results: [
      { date: "2025-01-15", value: 28.5, id: "V029", status: "high" as const },
      { date: "2025-04-20", value: 28.0, id: "V030", status: "high" as const },
      { date: "2025-07-10", value: 27.4, id: "V031", status: "borderline" as const },
      { date: "2025-10-15", value: 26.9, id: "V032", status: "borderline" as const },
    ],
    referenceRange: { min: 18.5, max: 24.9 },
  },
  {
    test: "Body Temperature",
    category: "Vital Signs",
    unit: "°C",
    trend: "stable" as const,
    results: [
      { date: "2025-01-15", value: 36.6, id: "V033", status: "normal" as const },
      { date: "2025-04-20", value: 36.8, id: "V034", status: "normal" as const },
      { date: "2025-07-10", value: 37.0, id: "V035", status: "normal" as const },
      { date: "2025-10-15", value: 36.7, id: "V036", status: "normal" as const },
    ],
    referenceRange: { min: 36.1, max: 37.2 },
  },

  // --- Thyroid --- (with some missing data and pending results with ETAs)
  {
    test: "TSH",
    category: "Thyroid",
    unit: "mIU/L",
    trend: "stable" as const,
    results: [
      { date: "2025-01-15", value: 2.8, id: "T001", status: "normal" as const },
      { date: "2025-04-20", value: 2.9, id: "T002", status: "normal" as const },
      { date: "2025-07-10", value: 2.7, id: "T003", status: "normal" as const },
      { date: "2025-10-15", value: null, id: "T004", status: "pending" as const, pendingTime: "2h" },
    ],
    referenceRange: { min: 0.5, max: 5.0 },
  },
  {
    test: "TSH Receptor Ab",
    category: "Thyroid",
    unit: "IU/L",
    trend: "improving" as const,
    results: [
      { date: "2025-01-15", value: 1.9, id: "T005", status: "high" as const },
      { date: "2025-04-20", value: null, id: "T006", status: "not-tested" as const },
      { date: "2025-07-10", value: 1.2, id: "T007", status: "borderline" as const },
      { date: "2025-10-15", value: null, id: "T008", status: "pending" as const, pendingTime: "45m" },
    ],
    referenceRange: { min: 0, max: 1.0 },
  },
  {
    test: "Total T4 (TT4)",
    category: "Thyroid",
    unit: "μg/dL",
    trend: "worsening" as const,
    results: [
      { date: "2025-01-15", value: 7.2, id: "T009", status: "normal" as const },
      { date: "2025-04-20", value: 6.8, id: "T010", status: "normal" as const },
      { date: "2025-07-10", value: null, id: "T011", status: "not-tested" as const },
      { date: "2025-10-15", value: null, id: "T012", status: "pending" as const, pendingTime: "1d" },
    ],
    referenceRange: { min: 5.0, max: 12.0 },
  },
  {
    test: "Free T4",
    category: "Thyroid",
    unit: "ng/dL",
    trend: "stable" as const,
    results: [
      { date: "2025-01-15", value: 1.2, id: "T013", status: "normal" as const },
      { date: "2025-04-20", value: 1.3, id: "T014", status: "normal" as const },
      { date: "2025-07-10", value: 1.2, id: "T015", status: "normal" as const },
      { date: "2025-10-15", value: null, id: "T016", status: "pending" as const, pendingTime: "3h" },
    ],
    referenceRange: { min: 0.8, max: 1.8 },
  },

  // --- Metabolism --- (with missing data)
  {
    test: "Glucose",
    category: "Metabolism",
    unit: "mg/dL",
    trend: "stable" as const,
    results: [
      { date: "2025-01-15", value: 95, id: "T017", status: "normal" as const },
      { date: "2025-04-20", value: null, id: "T018", status: "not-tested" as const },
      { date: "2025-07-10", value: 92, id: "T019", status: "normal" as const },
      { date: "2025-10-15", value: 94, id: "T020", status: "normal" as const },
    ],
    referenceRange: { min: 70, max: 99 },
  },

  // --- Nutrition --- (with missing data and pending)
  {
    test: "Vitamin D",
    category: "Nutrition",
    unit: "ng/mL",
    trend: "improving" as const,
    results: [
      { date: "2025-01-15", value: 22, id: "T021", status: "low" as const },
      { date: "2025-04-20", value: 28, id: "T022", status: "low" as const },
      { date: "2025-07-10", value: null, id: "T023", status: "not-tested" as const },
      { date: "2025-10-15", value: null, id: "T024", status: "pending" as const, pendingTime: "4h" },
    ],
    referenceRange: { min: 30, max: 100 },
  },
]

type LabResult = {
  date: string
  value: number | null
  id: string
  status: "normal" | "high" | "low" | "borderline" | "pending" | "not-tested"
  diastolic?: number
  pendingTime?: string
}

type LabData = {
  test: string
  category: string
  unit: string
  trend: "stable" | "improving" | "worsening"
  results: LabResult[]
  referenceRange: { min: number; max: number }
  isCombined?: boolean
  secondaryReferenceRange?: { min: number; max: number }
}

const convertValue = (
  value: number | null,
  unit: string,
  system: UnitSystem
): { value: number | null; unit: string } => {
  if (value === null) return { value: null, unit }
  if (system === "US") return { value, unit }

  switch (unit) {
    case "mg/dL":
      return { value: Number((value * 0.0555).toFixed(2)), unit: "mmol/L" }
    case "μg/dL":
      return { value: Number((value * 12.87).toFixed(1)), unit: "nmol/L" }
    case "ng/dL":
      return { value: Number((value * 12.87).toFixed(1)), unit: "pmol/L" }
    case "ng/mL":
      return { value: Number((value * 2.496).toFixed(1)), unit: "nmol/L" }
    case "kg":
      return { value, unit }
    case "°C":
      return { value, unit }
    default:
      return { value, unit }
  }
}

const getResultBadge = (
  value: number | null,
  unit: string,
  status: "normal" | "high" | "low" | "borderline" | "pending" | "not-tested",
  system: UnitSystem,
  diastolic?: number,
  pendingTime?: string
) => {
  // Handle pending status with time
  if (status === "pending") {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-sky-50 text-sky-700 border-sky-200">
        <Clock className="w-3 h-3" />
        <span>{pendingTime || "Pending"}</span>
      </div>
    )
  }

  // Handle not-tested status
  if (status === "not-tested" || value === null) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-400 border border-gray-200">
        <span>—</span>
      </div>
    )
  }

  const styles = {
    normal: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100",
    high: "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100",
    low: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100",
    borderline: "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100",
  }

  const icons = {
    normal: <Check className="w-3 h-3" />,
    high: <ArrowUp className="w-3 h-3" />,
    low: <ArrowDown className="w-3 h-3" />,
    borderline: <AlertTriangle className="w-3 h-3" />,
  }

  const displayMain = convertValue(value, unit, system)
  const displayDiastolic = diastolic ? convertValue(diastolic, unit, system) : null

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border cursor-pointer transition-colors ${styles[status]}`}
    >
      {icons[status]}
      {displayMain.value}
      {displayDiastolic ? `/${displayDiastolic.value}` : ""} {displayMain.unit}
    </div>
  )
}

const LabTrendModal = ({
  lab,
  children,
  onAddToCart,
  unitSystem,
}: {
  lab: LabData
  children: React.ReactNode
  onAddToCart: (testName: string) => void
  unitSystem: UnitSystem
}) => {
  // Filter out null values for the chart
  const validResults = lab.results.filter(
    (r) => r.value !== null && r.status !== "pending" && r.status !== "not-tested"
  )
  const sortedResults = [...validResults].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  const chartData = sortedResults.map((r) => {
    const converted = convertValue(r.value, lab.unit, unitSystem)
    const convertedDiastolic = r.diastolic ? convertValue(r.diastolic, lab.unit, unitSystem) : null
    return {
      ...r,
      value: converted.value,
      diastolic: convertedDiastolic?.value,
      originalUnit: converted.unit,
    }
  })

  const currentUnit = chartData[0]?.originalUnit || lab.unit
  const refMin = convertValue(lab.referenceRange.min, lab.unit, unitSystem).value!
  const refMax = convertValue(lab.referenceRange.max, lab.unit, unitSystem).value!

  const allValues = chartData
    .flatMap((r) => (lab.isCombined ? [r.value, r.diastolic] : [r.value]))
    .filter((v) => v !== null) as number[]
  const minValue = Math.min(...allValues, refMin)
  const maxValue = Math.max(...allValues, refMax)
  const padding = (maxValue - minValue) * 0.2
  const yDomain = [Math.max(0, minValue - padding), maxValue + padding]

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div>
              <div className="text-lg font-semibold">{lab.test}</div>
              <div className="text-sm text-muted-foreground font-normal">measured in {currentUnit}</div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="h-64 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <ReferenceArea y1={refMin} y2={refMax} fill="#10b981" fillOpacity={0.1} />
              <ReferenceLine y={refMin} stroke="#10b981" strokeDasharray="5 5" strokeOpacity={0.7} />
              <ReferenceLine y={refMax} stroke="#10b981" strokeDasharray="5 5" strokeOpacity={0.7} />
              <XAxis
                dataKey="date"
                tickFormatter={(date) =>
                  new Date(date).toLocaleDateString("en-US", { month: "2-digit", year: "numeric" })
                }
                stroke="#9ca3af"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis domain={yDomain} stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} dx={-10} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload
                    return (
                      <div className="bg-white border rounded-lg shadow-lg p-3">
                        <div className="text-sm font-medium">{new Date(data.date).toLocaleDateString()}</div>
                        {lab.isCombined ? (
                          <>
                            <div className="text-sm text-muted-foreground">
                              Systolic:{" "}
                              <span className="font-medium text-foreground">
                                {data.value} {currentUnit}
                              </span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Diastolic:{" "}
                              <span className="font-medium text-foreground">
                                {data.diastolic} {currentUnit}
                              </span>
                            </div>
                          </>
                        ) : (
                          <div className="text-sm text-muted-foreground">
                            Value:{" "}
                            <span className="font-medium text-foreground">
                              {data.value} {currentUnit}
                            </span>
                          </div>
                        )}
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#6366f1"
                strokeWidth={2}
                dot={(props: any) => {
                  const { cx, cy, payload } = props
                  let fill = "#10b981"
                  if (payload.status === "high") fill = "#f43f5e"
                  if (payload.status === "low") fill = "#f59e0b"
                  if (payload.status === "borderline") fill = "#f97316"
                  return <circle cx={cx} cy={cy} r={5} fill={fill} stroke="white" strokeWidth={2} />
                }}
                activeDot={{ r: 7, strokeWidth: 0 }}
              />
              {lab.isCombined && (
                <Line
                  type="monotone"
                  dataKey="diastolic"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={(props: any) => {
                    const { cx, cy, payload } = props
                    let fill = "#10b981"
                    if (payload.status === "high") fill = "#f43f5e"
                    if (payload.status === "low") fill = "#f59e0b"
                    if (payload.status === "borderline") fill = "#f97316"
                    return <circle cx={cx} cy={cy} r={5} fill={fill} stroke="white" strokeWidth={2} />
                  }}
                  activeDot={{ r: 7, strokeWidth: 0 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </DialogContent>
    </Dialog>
  )
}

const TrendSparkline = forwardRef<
  HTMLButtonElement,
  { lab: LabData } & React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ lab, ...props }, ref) => {
  const getDotColor = (status: string) => {
    switch (status) {
      case "normal":
        return "bg-emerald-500"
      case "high":
        return "bg-rose-500"
      case "low":
        return "bg-amber-500"
      case "borderline":
        return "bg-orange-500"
      case "pending":
        return "bg-sky-400"
      case "not-tested":
        return "bg-gray-300"
      default:
        return "bg-gray-300"
    }
  }

  // Filter only valid numeric values for positioning calculation
  const validResults = lab.results.filter(
    (r) => r.value !== null && r.status !== "pending" && r.status !== "not-tested"
  )
  const values = validResults.map((r) => r.value as number)
  const minVal = values.length > 0 ? Math.min(...values) : 0
  const maxVal = values.length > 0 ? Math.max(...values) : 100
  const range = maxVal - minVal

  const getVerticalPosition = (value: number | null, status: string) => {
    if (value === null || status === "pending" || status === "not-tested") return 50
    if (range === 0) return 50
    return ((value - minVal) / range) * 100
  }

  const dotSpacing = 12
  const svgWidth = lab.results.length * dotSpacing
  const svgHeight = 16
  const padding = 4

  // Only draw line through valid results
  const validPointsWithIndex = lab.results
    .map((result, idx) => ({
      result,
      idx,
      isValid: result.value !== null && result.status !== "pending" && result.status !== "not-tested",
    }))
    .filter((p) => p.isValid)

  const points = validPointsWithIndex
    .map(({ result, idx }) => {
      const position = getVerticalPosition(result.value, result.status)
      const x = idx * dotSpacing + padding
      const y = svgHeight - (position / 100) * 12 - 4
      return `${x},${y}`
    })
    .join(" ")

  return (
    <button
      ref={ref}
      className="relative flex items-center h-4 hover:opacity-80 transition-opacity cursor-pointer"
      style={{ width: `${svgWidth + padding}px` }}
      {...props}
    >
      {points.length > 1 && (
        <svg
          className="absolute inset-0"
          width={svgWidth + padding}
          height={svgHeight}
          style={{ overflow: "visible" }}
        >
          <polyline points={points} fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      )}

      {lab.results.map((result, idx) => {
        const position = getVerticalPosition(result.value, result.status)
        const bottomOffset = (position / 100) * 12
        const isInvalid = result.status === "pending" || result.status === "not-tested"
        return (
          <div
            key={idx}
            className={`absolute w-2 h-2 rounded-full ${getDotColor(result.status)}`}
            style={{
              left: `${idx * dotSpacing + padding - 4}px`,
              bottom: `${isInvalid ? 4 : bottomOffset}px`,
            }}
          />
        )
      })}
    </button>
  )
})
TrendSparkline.displayName = "TrendSparkline"

export function LabResultsView({
  onAddToCart,
  unitSystem = "US",
  patientId,
}: {
  onAddToCart?: (testName: string) => void
  unitSystem?: UnitSystem
  patientId?: string
}) {
  const system = unitSystem || "US"
  const [searchTerm, setSearchTerm] = useState("")
  const [collapsedCategories, setCollapsedCategories] = useState<string[]>([])
  const [selectedDateRange, setSelectedDateRange] = useState("all")
  const [selectedSystem, setSelectedSystem] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const { patients } = useApp()
  const patient = patients.find((p) => p.id === patientId)

  const buildPatientLabData = (): LabData[] => {
    const isSarahJohnson =
      patientId === SARAH_JOHNSON_LOCAL_ID ||
      patientId === SARAH_JOHNSON_SUPABASE_ID ||
      patient?.name === "Sarah Johnson"

    if (isSarahJohnson) {
      return labDataForSarahJohnson as LabData[]
    }

    // For other patients, only show vitals if they were captured
    if (!patient?.vitals) {
      return []
    }

    const capturedDate = patient.vitals.capturedAt
      ? new Date(patient.vitals.capturedAt).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0]

    const vitalSigns: LabData[] = []

    if (patient.vitals.pulse) {
      const pulseValue = Number.parseFloat(patient.vitals.pulse)
      const status = pulseValue >= 60 && pulseValue <= 100 ? "normal" : pulseValue > 100 ? "high" : "low"
      vitalSigns.push({
        test: "Heart Rate",
        category: "Vital Signs",
        unit: "bpm",
        trend: "stable" as const,
        results: [
          { date: capturedDate, value: pulseValue, id: `V-${patient.id}-001`, status: status as const },
        ],
        referenceRange: { min: 60, max: 100 },
      })
    }

    if (patient.vitals.bp) {
      const bpParts = patient.vitals.bp.split("/")
      if (bpParts.length === 2) {
        const systolic = Number.parseFloat(bpParts[0])
        const diastolic = Number.parseFloat(bpParts[1])
        const status =
          systolic >= 90 && systolic <= 120 && diastolic >= 60 && diastolic <= 80 ? "normal" : "borderline"
        vitalSigns.push({
          test: "Blood Pressure",
          category: "Vital Signs",
          unit: "mmHg",
          trend: "stable" as const,
          isCombined: true,
          results: [
            {
              date: capturedDate,
              value: systolic,
              diastolic: diastolic,
              id: `V-${patient.id}-002`,
              status: status as const,
            },
          ],
          referenceRange: { min: 90, max: 120 },
          secondaryReferenceRange: { min: 60, max: 80 },
        })
      }
    }

    if (patient.vitals.respRate) {
      const respValue = Number.parseFloat(patient.vitals.respRate)
      const status = respValue >= 12 && respValue <= 20 ? "normal" : respValue > 20 ? "high" : "low"
      vitalSigns.push({
        test: "Respiratory Rate",
        category: "Vital Signs",
        unit: "breaths/min",
        trend: "stable" as const,
        results: [
          { date: capturedDate, value: respValue, id: `V-${patient.id}-003`, status: status as const },
        ],
        referenceRange: { min: 12, max: 20 },
      })
    }

    if (patient.vitals.spo2) {
      const spo2Value = Number.parseFloat(patient.vitals.spo2)
      const status = spo2Value >= 95 ? "normal" : spo2Value >= 90 ? "borderline" : "low"
      vitalSigns.push({
        test: "Oxygen Saturation",
        category: "Vital Signs",
        unit: "%",
        trend: "stable" as const,
        results: [
          { date: capturedDate, value: spo2Value, id: `V-${patient.id}-004`, status: status as const },
        ],
        referenceRange: { min: 95, max: 100 },
      })
    }

    if (patient.vitals.weight) {
      const weightValue = Number.parseFloat(patient.vitals.weight)
      const status = weightValue >= 55 && weightValue <= 80 ? "normal" : weightValue > 80 ? "high" : "low"
      vitalSigns.push({
        test: "Weight",
        category: "Vital Signs",
        unit: "kg",
        trend: "stable" as const,
        results: [
          { date: capturedDate, value: weightValue, id: `V-${patient.id}-005`, status: status as const },
        ],
        referenceRange: { min: 55, max: 80 },
      })
    }

    if (patient.vitals.bmi) {
      const bmiValue = Number.parseFloat(patient.vitals.bmi)
      const status = bmiValue >= 18.5 && bmiValue <= 24.9 ? "normal" : bmiValue > 24.9 ? "high" : "low"
      vitalSigns.push({
        test: "BMI",
        category: "Vital Signs",
        unit: "kg/m²",
        trend: "stable" as const,
        results: [
          { date: capturedDate, value: bmiValue, id: `V-${patient.id}-006`, status: status as const },
        ],
        referenceRange: { min: 18.5, max: 24.9 },
      })
    }

    if (patient.vitals.temp) {
      const tempValue = Number.parseFloat(patient.vitals.temp)
      const status = tempValue >= 36.1 && tempValue <= 37.2 ? "normal" : tempValue > 37.2 ? "high" : "low"
      vitalSigns.push({
        test: "Body Temperature",
        category: "Vital Signs",
        unit: "°C",
        trend: "stable" as const,
        results: [
          { date: capturedDate, value: tempValue, id: `V-${patient.id}-007`, status: status as const },
        ],
        referenceRange: { min: 36.1, max: 37.2 },
      })
    }

    return vitalSigns
  }

  const labData = buildPatientLabData()

  if (labData.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <PersonStandingIcon className="w-6 h-6 text-muted-foreground" />
          </div>
          <h3 className="font-medium text-lg mb-1">No lab results available</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Lab results will appear here after vitals are captured or tests are ordered
          </p>
        </CardContent>
      </Card>
    )
  }

  const allDates = labData[0].results.map((r) => r.date)

  const visibleDates = allDates.filter((dateStr) => {
    if (selectedDateRange === "all") return true
    const date = new Date(dateStr)
    const now = new Date("2025-11-20")
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    if (selectedDateRange === "3m") return diffDays <= 90
    if (selectedDateRange === "6m") return diffDays <= 180
    if (selectedDateRange === "1y") return diffDays <= 365
    return true
  })

  const filteredData = labData.filter((item) => {
    const matchesSearch = item.test.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSystem = selectedSystem === "all" || item.category === selectedSystem
    const latestResult = item.results[item.results.length - 1]
    let matchesStatus = true
    if (selectedStatus === "normal") matchesStatus = latestResult.status === "normal"
    if (selectedStatus === "outside-optimal") matchesStatus = latestResult.status === "borderline"
    if (selectedStatus === "abnormal")
      matchesStatus = latestResult.status === "high" || latestResult.status === "low"
    return matchesSearch && matchesSystem && matchesStatus
  })

  const groupedData = filteredData.reduce(
    (acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = []
      }
      acc[item.category].push(item)
      return acc
    },
    {} as Record<string, typeof filteredData>
  )

  const categoryOrder = [
    "Vital Signs",
    "Thyroid",
    "Metabolism",
    "Nutrition",
    "Blood",
    "Cardiovascular",
    "Respiratory",
    "General",
  ]

  const sortedCategories = Object.keys(groupedData).sort((a, b) => {
    const indexA = categoryOrder.indexOf(a)
    const indexB = categoryOrder.indexOf(b)
    if (indexA !== -1 && indexB !== -1) return indexA - indexB
    if (indexA !== -1) return -1
    if (indexB !== -1) return 1
    return a.localeCompare(b)
  })

  const toggleCategory = (category: string) => {
    if (collapsedCategories.includes(category)) {
      setCollapsedCategories(collapsedCategories.filter((c) => c !== category))
    } else {
      setCollapsedCategories([...collapsedCategories, category])
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search labs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-white h-10"
          />
        </div>

        <Select value={selectedDateRange} onValueChange={setSelectedDateRange}>
          <SelectTrigger className="w-[140px] h-10 bg-white">
            <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="3m">Last 3 Months</SelectItem>
            <SelectItem value="6m">Last 6 Months</SelectItem>
            <SelectItem value="1y">Last Year</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedSystem} onValueChange={setSelectedSystem}>
          <SelectTrigger className="w-[140px] h-10 bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Body System</SelectItem>
            <SelectItem value="Vital Signs">Vital Signs</SelectItem>
            <SelectItem value="Thyroid">Thyroid</SelectItem>
            <SelectItem value="Metabolism">Metabolism</SelectItem>
            <SelectItem value="Nutrition">Nutrition</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-[150px] h-10 bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              <span className="flex items-center gap-2">All Markers</span>
            </SelectItem>
            <SelectItem value="normal">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Normal
              </span>
            </SelectItem>
            <SelectItem value="outside-optimal">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500" />
                Outside Optimal
              </span>
            </SelectItem>
            <SelectItem value="abnormal">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                Abnormal
              </span>
            </SelectItem>
          </SelectContent>
        </Select>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="h-10 w-10 bg-white">
              <MoreVertical className="w-4 h-4" />
              <span className="sr-only">More options</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Upload className="w-4 h-4 mr-2" />
              Import Results
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Download className="w-4 h-4 mr-2" />
              Export Results
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Mail className="w-4 h-4 mr-2" />
              Request Past Results
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="border rounded-lg overflow-hidden bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="text-left py-3 px-4 font-medium text-muted-foreground w-[200px]">Test</th>
              <th className="text-center py-3 px-2 font-medium text-muted-foreground w-[80px]">Trend</th>
              {visibleDates.map((date) => (
                <th key={date} className="text-center py-3 px-2 font-medium text-muted-foreground min-w-[120px]">
                  {new Date(date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedCategories.map((category) => (
              <>
                <tr
                  key={category}
                  className="bg-muted/20 cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => toggleCategory(category)}
                >
                  <td colSpan={visibleDates.length + 2} className="py-2 px-4">
                    <div className="flex items-center gap-2 font-medium text-muted-foreground">
                      {collapsedCategories.includes(category) ? (
                        <ChevronRight className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                      {category}
                    </div>
                  </td>
                </tr>
                {!collapsedCategories.includes(category) &&
                  groupedData[category].map((item) => (
                    <tr key={item.test} className="border-b last:border-b-0 hover:bg-muted/10 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-medium text-foreground">{item.test}</div>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <LabTrendModal lab={item} onAddToCart={() => {}} unitSystem={system}>
                          <TrendSparkline lab={item} />
                        </LabTrendModal>
                      </td>
                      {visibleDates.map((date) => {
                        const result = item.results.find((r) => r.date === date)
                        return (
                          <td key={date} className="py-3 px-2 text-center">
                            {result ? (
                              <div className="flex justify-center">
                                {result.status === "pending" || result.status === "not-tested" ? (
                                  getResultBadge(
                                    result.value,
                                    item.unit,
                                    result.status,
                                    system,
                                    result.diastolic,
                                    result.pendingTime
                                  )
                                ) : (
                                  <LabTrendModal lab={item} onAddToCart={() => {}} unitSystem={system}>
                                    {getResultBadge(
                                      result.value,
                                      item.unit,
                                      result.status,
                                      system,
                                      result.diastolic
                                    )}
                                  </LabTrendModal>
                                )}
                              </div>
                            ) : (
                              <div className="flex justify-center">
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-400 border border-gray-200">
                                  <span>—</span>
                                </div>
                              </div>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
              </>
            ))}
            {sortedCategories.length === 0 && (
              <tr>
                <td colSpan={visibleDates.length + 2} className="py-8 text-center text-muted-foreground">
                  No results found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
