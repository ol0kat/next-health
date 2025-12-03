"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export interface CreateVisitInput {
  patient_id: string
  visit_type: string
  visit_reason?: string
  provider_name?: string
  provider_specialty?: string
  facility_name?: string
  chief_complaint?: string
  subjective_notes?: string
  objective_notes?: string
  assessment?: string
  plan?: string
  status?: string
  copay_amount?: number
}

export interface CreateVitalSignsInput {
  visit_id: string
  patient_id: string
  temperature_f?: number
  temperature_method?: string
  heart_rate_bpm?: number
  respiratory_rate?: number
  blood_pressure_systolic?: number
  blood_pressure_diastolic?: number
  oxygen_saturation?: number
  height_inches?: number
  weight_lbs?: number
  bmi?: number
  pain_level?: number
  blood_glucose_mg_dl?: number
  notes?: string
  recorded_by?: string
}

export interface CreateBloodWorkInput {
  visit_id: string
  patient_id: string
  lab_name?: string
  order_number?: string
  // CBC
  wbc?: number
  rbc?: number
  hemoglobin?: number
  hematocrit?: number
  platelet_count?: number
  // BMP
  glucose?: number
  glucose_fasting?: boolean
  bun?: number
  creatinine?: number
  sodium?: number
  potassium?: number
  // Lipid Panel
  total_cholesterol?: number
  ldl_cholesterol?: number
  hdl_cholesterol?: number
  triglycerides?: number
  // Liver Function
  ast?: number
  alt?: number
  // Thyroid
  tsh?: number
  t4?: number
  free_t4?: number
  // A1C
  hba1c?: number
  // Other
  vitamin_d?: number
  status?: string
  notes?: string
}

export async function createVisit(input: CreateVisitInput) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("visits")
    .insert({
      patient_id: input.patient_id,
      visit_type: input.visit_type,
      visit_reason: input.visit_reason,
      provider_name: input.provider_name,
      provider_specialty: input.provider_specialty,
      facility_name: input.facility_name,
      chief_complaint: input.chief_complaint,
      subjective_notes: input.subjective_notes,
      objective_notes: input.objective_notes,
      assessment: input.assessment,
      plan: input.plan,
      status: input.status || "scheduled",
      copay_amount: input.copay_amount,
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating visit:", error)
    return { error: error.message }
  }

  revalidatePath(`/my-patients/${input.patient_id}`)

  return { data }
}

export async function createVitalSigns(input: CreateVitalSignsInput) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("vital_signs")
    .insert({
      visit_id: input.visit_id,
      patient_id: input.patient_id,
      temperature_f: input.temperature_f,
      temperature_method: input.temperature_method,
      heart_rate_bpm: input.heart_rate_bpm,
      respiratory_rate: input.respiratory_rate,
      blood_pressure_systolic: input.blood_pressure_systolic,
      blood_pressure_diastolic: input.blood_pressure_diastolic,
      oxygen_saturation: input.oxygen_saturation,
      height_inches: input.height_inches,
      weight_lbs: input.weight_lbs,
      bmi: input.bmi,
      pain_level: input.pain_level,
      blood_glucose_mg_dl: input.blood_glucose_mg_dl,
      notes: input.notes,
      recorded_by: input.recorded_by,
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating vital signs:", error)
    return { error: error.message }
  }

  revalidatePath(`/my-patients/${input.patient_id}`)

  return { data }
}

export async function createBloodWork(input: CreateBloodWorkInput) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("blood_work")
    .insert({
      visit_id: input.visit_id,
      patient_id: input.patient_id,
      lab_name: input.lab_name,
      order_number: input.order_number,
      wbc: input.wbc,
      rbc: input.rbc,
      hemoglobin: input.hemoglobin,
      hematocrit: input.hematocrit,
      platelet_count: input.platelet_count,
      glucose: input.glucose,
      glucose_fasting: input.glucose_fasting,
      bun: input.bun,
      creatinine: input.creatinine,
      sodium: input.sodium,
      potassium: input.potassium,
      total_cholesterol: input.total_cholesterol,
      ldl_cholesterol: input.ldl_cholesterol,
      hdl_cholesterol: input.hdl_cholesterol,
      triglycerides: input.triglycerides,
      ast: input.ast,
      alt: input.alt,
      tsh: input.tsh,
      t4: input.t4,
      free_t4: input.free_t4,
      hba1c: input.hba1c,
      vitamin_d: input.vitamin_d,
      status: input.status || "pending",
      notes: input.notes,
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating blood work:", error)
    return { error: error.message }
  }

  revalidatePath(`/my-patients/${input.patient_id}`)

  return { data }
}

export async function getVisitsByPatient(patientId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("visits")
    .select(`
      *,
      vital_signs(*),
      blood_work(*),
      visit_diagnoses(
        *,
        patient_diagnosis:patient_diagnoses(
          *,
          disease:diseases(*),
          icd10:icd10_codes(*)
        )
      )
    `)
    .eq("patient_id", patientId)
    .order("visit_date", { ascending: false })

  if (error) {
    console.error("Error fetching visits:", error)
    return { error: error.message, data: [] }
  }

  return { data: data || [] }
}

export async function updateVisit(id: string, input: Partial<CreateVisitInput>) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("visits")
    .update({
      ...input,
      checkout_time: input.status === "completed" ? new Date().toISOString() : undefined,
    })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Error updating visit:", error)
    return { error: error.message }
  }

  return { data }
}

export async function getLabResultsByPatient(patientId: string) {
  const supabase = await createClient()

  // Fetch blood work
  const { data: bloodWork, error: bloodWorkError } = await supabase
    .from("blood_work")
    .select("*")
    .eq("patient_id", patientId)
    .order("specimen_collected_at", { ascending: true })

  if (bloodWorkError) {
    console.error("Error fetching blood work:", bloodWorkError)
    return { error: bloodWorkError.message, data: null }
  }

  // Fetch vital signs
  const { data: vitalSigns, error: vitalSignsError } = await supabase
    .from("vital_signs")
    .select("*, visits(visit_date)")
    .eq("patient_id", patientId)
    .order("recorded_at", { ascending: true })

  if (vitalSignsError) {
    console.error("Error fetching vital signs:", vitalSignsError)
    return { error: vitalSignsError.message, data: null }
  }

  return {
    data: {
      bloodWork: bloodWork || [],
      vitalSigns: vitalSigns || [],
    },
  }
}
