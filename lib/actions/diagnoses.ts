"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export interface CreateDiagnosisInput {
  patient_id: string
  disease_id?: string
  icd10_id: string
  visit_id?: string
  diagnosed_by?: string
  status?: string
  severity?: string
  is_primary?: boolean
  notes?: string
}

export async function createPatientDiagnosis(input: CreateDiagnosisInput) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("patient_diagnoses")
    .insert({
      patient_id: input.patient_id,
      disease_id: input.disease_id,
      icd10_id: input.icd10_id,
      visit_id: input.visit_id,
      diagnosis_date: new Date().toISOString().split("T")[0],
      diagnosed_by: input.diagnosed_by,
      status: input.status || "active",
      severity: input.severity,
      is_primary: input.is_primary || false,
      notes: input.notes,
    })
    .select(`
      *,
      disease:diseases(*),
      icd10:icd10_codes(*)
    `)
    .single()

  if (error) {
    console.error("Error creating diagnosis:", error)
    return { error: error.message }
  }

  revalidatePath(`/my-patients/${input.patient_id}`)

  return { data }
}

export async function getICD10Codes(searchTerm?: string) {
  const supabase = await createClient()

  let query = supabase.from("icd10_codes").select("*").eq("is_active", true).order("code")

  if (searchTerm) {
    query = query.or(`code.ilike.%${searchTerm}%,short_description.ilike.%${searchTerm}%`)
  }

  const { data, error } = await query.limit(50)

  if (error) {
    console.error("Error fetching ICD-10 codes:", error)
    return { error: error.message, data: [] }
  }

  return { data: data || [] }
}

export async function getDiseases(searchTerm?: string) {
  const supabase = await createClient()

  let query = supabase
    .from("diseases")
    .select(`
      *,
      primary_icd10:icd10_codes(*)
    `)
    .eq("is_active", true)
    .order("name")

  if (searchTerm) {
    query = query.or(`name.ilike.%${searchTerm}%,common_name.ilike.%${searchTerm}%`)
  }

  const { data, error } = await query.limit(50)

  if (error) {
    console.error("Error fetching diseases:", error)
    return { error: error.message, data: [] }
  }

  return { data: data || [] }
}

export async function getDiagnosesByPatient(patientId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("patient_diagnoses")
    .select(`
      *,
      disease:diseases(*),
      icd10:icd10_codes(*),
      visit:visits(*)
    `)
    .eq("patient_id", patientId)
    .order("diagnosis_date", { ascending: false })

  if (error) {
    console.error("Error fetching diagnoses:", error)
    return { error: error.message, data: [] }
  }

  return { data: data || [] }
}
