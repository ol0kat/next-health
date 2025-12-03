// Patient Status and Vitals Management System

export type PatientStatus = "intake" | "vitals_pending" | "vitals_done" | "phlebotomy_pending" | "phlebotomy_done" | "labs_pending" | "labs_done" | "provider_review" | "checkout" | "completed" | "no_show" | "cancelled"

export const STATUS_LABELS: Record<PatientStatus, string> = {
  intake: "Intake",
  vitals_pending: "Awaiting Vitals",
  vitals_done: "Vitals Recorded",
  phlebotomy_pending: "Ready for Phlebotomy",
  phlebotomy_done: "Samples Drawn",
  labs_pending: "Awaiting Lab Results",
  labs_done: "Lab Results Ready",
  provider_review: "Provider Review",
  checkout: "Checkout",
  completed: "Completed",
  no_show: "No Show",
  cancelled: "Cancelled",
}

export const STATUS_COLORS: Record<PatientStatus, string> = {
  intake: "bg-blue-100 text-blue-700",
  vitals_pending: "bg-yellow-100 text-yellow-700",
  vitals_done: "bg-green-100 text-green-700",
  phlebotomy_pending: "bg-purple-100 text-purple-700",
  phlebotomy_done: "bg-green-100 text-green-700",
  labs_pending: "bg-orange-100 text-orange-700",
  labs_done: "bg-green-100 text-green-700",
  provider_review: "bg-indigo-100 text-indigo-700",
  checkout: "bg-teal-100 text-teal-700",
  completed: "bg-emerald-100 text-emerald-700",
  no_show: "bg-gray-100 text-gray-700",
  cancelled: "bg-red-100 text-red-700",
}

export interface VitalSignsEntry {
  id: string
  patient_id: string
  visit_date: string
  recorded_by: string
  recorded_at: string
  height_cm?: number
  weight_kg?: number
  bmi?: number
  temperature_celsius?: number
  systolic_bp?: number
  diastolic_bp?: number
  heart_rate?: number
  respiratory_rate?: number
  sp_o2?: number
  blood_glucose?: number
  notes?: string
  created_at: string
}

export interface InsuranceCard {
  id: string
  patient_id: string
  provider_name: string
  member_id: string
  group_number?: string
  plan_type?: string
  expiry_date: string
  is_active: boolean
  photo_url?: string
  back_photo_url?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface LabTube {
  id: string
  code: string
  test_name: string
  tube_color: string // e.g. "Red", "Blue", "Purple/EDTA", "Green", "Gray"
  volume_ml: number
  additives?: string
  draw_order: number
  instructions?: string
}

export const LAB_TUBES: LabTube[] = [
  {
    id: "1",
    code: "BT001",
    test_name: "Culture (Blood)",
    tube_color: "Yellow/SPS",
    volume_ml: 5,
    draw_order: 1,
    additives: "SPS (sodium polyanethol sulfonate)",
  },
  {
    id: "2",
    code: "BT002",
    test_name: "Coagulation (PT/INR, PTT)",
    tube_color: "Light Blue",
    volume_ml: 2.7,
    draw_order: 2,
    additives: "Sodium citrate 3.2%",
    instructions: "Fill to mark, invert 3-4 times",
  },
  {
    id: "3",
    code: "BT003",
    test_name: "CBC/Differential",
    tube_color: "Purple/EDTA",
    volume_ml: 3,
    draw_order: 3,
    additives: "EDTA (K2 or K3)",
    instructions: "Invert 8-10 times",
  },
  {
    id: "4",
    code: "BT004",
    test_name: "Chemistry/CMP",
    tube_color: "Gold/SST",
    volume_ml: 5,
    draw_order: 4,
    additives: "Serum separator gel",
    instructions: "Allow to clot 30-60 minutes",
  },
  {
    id: "5",
    code: "BT005",
    test_name: "Blood Glucose",
    tube_color: "Gray",
    volume_ml: 2,
    draw_order: 5,
    additives: "Potassium oxalate/sodium fluoride",
  },
  {
    id: "6",
    code: "BT006",
    test_name: "Lipid Panel",
    tube_color: "Red",
    volume_ml: 5,
    draw_order: 6,
    additives: "None (plain)",
  },
]

export interface VitalsChecklistItem {
  key: keyof VitalSignsEntry
  label: string
  unit: string
  optional: boolean
  normalRange?: { min: number; max: number }
}

export const VITALS_CHECKLIST: VitalsChecklistItem[] = [
  { key: "height_cm", label: "Height", unit: "cm", optional: true, normalRange: { min: 120, max: 220 } },
  { key: "weight_kg", label: "Weight", unit: "kg", optional: false, normalRange: { min: 30, max: 300 } },
  { key: "temperature_celsius", label: "Temperature", unit: "°C", optional: false, normalRange: { min: 35, max: 40 } },
  { key: "systolic_bp", label: "Systolic BP", unit: "mmHg", optional: false, normalRange: { min: 70, max: 200 } },
  { key: "diastolic_bp", label: "Diastolic BP", unit: "mmHg", optional: false, normalRange: { min: 40, max: 130 } },
  { key: "heart_rate", label: "Heart Rate", unit: "bpm", optional: false, normalRange: { min: 40, max: 180 } },
  { key: "respiratory_rate", label: "Respiratory Rate", unit: "breaths/min", optional: false, normalRange: { min: 8, max: 40 } },
  { key: "sp_o2", label: "SpO₂", unit: "%", optional: false, normalRange: { min: 90, max: 100 } },
]

export function calculateBMI(heightCm: number, weightKg: number): number {
  const heightM = heightCm / 100
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10
}

export function isOutOfRange(value: number, range?: { min: number; max: number }): boolean {
  if (!range) return false
  return value < range.min || value > range.max
}

export function getVisitStatusProgressSteps(): { step: number; status: PatientStatus; label: string }[] {
  return [
    { step: 1, status: "intake", label: "Intake" },
    { step: 2, status: "vitals_pending", label: "Vitals" },
    { step: 3, status: "phlebotomy_pending", label: "Phlebotomy" },
    { step: 4, status: "labs_pending", label: "Labs" },
    { step: 5, status: "provider_review", label: "Review" },
    { step: 6, status: "checkout", label: "Checkout" },
  ]
}
