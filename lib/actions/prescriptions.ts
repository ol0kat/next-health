"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export interface CreatePrescriptionInput {
  patient_id: string
  visit_id?: string
  medication_name: string
  generic_name?: string
  dosage_amount: string
  dosage_unit: string
  dosage_form: string
  frequency: string
  route: string
  instructions?: string
  take_with_food?: boolean
  quantity: number
  days_supply?: number
  refills_authorized?: number
  prescriber_name: string
  prescriber_npi?: string
  pharmacy_name?: string
  pharmacy_phone?: string
  icd10_id?: string
  indication?: string
  is_controlled_substance?: boolean
  controlled_substance_schedule?: string
  notes?: string
}

export async function createPrescription(input: CreatePrescriptionInput) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("prescriptions")
    .insert({
      patient_id: input.patient_id,
      visit_id: input.visit_id,
      medication_name: input.medication_name,
      generic_name: input.generic_name,
      dosage_amount: input.dosage_amount,
      dosage_unit: input.dosage_unit,
      dosage_form: input.dosage_form,
      frequency: input.frequency,
      route: input.route,
      instructions: input.instructions,
      take_with_food: input.take_with_food,
      quantity: input.quantity,
      days_supply: input.days_supply,
      refills_authorized: input.refills_authorized || 0,
      refills_remaining: input.refills_authorized || 0,
      prescribed_date: new Date().toISOString().split("T")[0],
      prescriber_name: input.prescriber_name,
      prescriber_npi: input.prescriber_npi,
      pharmacy_name: input.pharmacy_name,
      pharmacy_phone: input.pharmacy_phone,
      icd10_id: input.icd10_id,
      indication: input.indication,
      is_controlled_substance: input.is_controlled_substance || false,
      controlled_substance_schedule: input.controlled_substance_schedule,
      status: "active",
      notes: input.notes,
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating prescription:", error)
    return { error: error.message }
  }

  revalidatePath(`/my-patients/${input.patient_id}`)

  return { data }
}

export async function getPrescriptionsByPatient(patientId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("prescriptions")
    .select(`
      *,
      visit:visits(*),
      icd10:icd10_codes(*)
    `)
    .eq("patient_id", patientId)
    .order("prescribed_date", { ascending: false })

  if (error) {
    console.error("Error fetching prescriptions:", error)
    return { error: error.message, data: [] }
  }

  return { data: data || [] }
}

export async function updatePrescription(
  id: string,
  input: Partial<CreatePrescriptionInput> & { status?: string; discontinued_reason?: string },
) {
  const supabase = await createClient()

  const updateData: Record<string, unknown> = { ...input }

  if (input.status === "discontinued") {
    updateData.discontinued_date = new Date().toISOString().split("T")[0]
  }

  const { data, error } = await supabase.from("prescriptions").update(updateData).eq("id", id).select().single()

  if (error) {
    console.error("Error updating prescription:", error)
    return { error: error.message }
  }

  return { data }
}

export async function discontinuePrescription(id: string, reason: string) {
  return updatePrescription(id, {
    status: "discontinued",
    discontinued_reason: reason,
  })
}
