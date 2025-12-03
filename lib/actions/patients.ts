"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export interface CreatePatientInput {
  first_name: string
  middle_name?: string
  last_name: string
  date_of_birth: string
  gender?: string
  phone_primary?: string
  phone_secondary?: string
  email?: string
  address_street?: string
  address_city?: string
  address_state?: string
  address_zip?: string
  address_country?: string
  blood_type?: string
  allergies?: string[]
  medical_notes?: string
  insurance_provider?: string
  insurance_policy_number?: string
  insurance_group_number?: string
  citizen_id?: string
  bhyt_card_number?: string
  bhyt_coverage_level?: number
  bhyt_registered_facility_code?: string
  bhyt_registered_facility_name?: string
  bhyt_valid_from?: string
  bhyt_valid_to?: string
  bhyt_issuing_agency?: string
  bhyt_primary_site_code?: string
  bhyt_primary_site_name?: string
  bhyt_continuous_5yr_start?: string
  bhyt_new_card_number?: string
  bhyt_new_valid_from?: string
  bhyt_new_valid_to?: string
  bhyt_status?: string
  // Guardian information
  guardian?: {
    first_name: string
    last_name: string
    relationship: string
    phone_primary: string
    phone_secondary?: string
    email?: string
    address_street?: string
    address_city?: string
    is_emergency_contact?: boolean
    is_legal_guardian?: boolean
  }
}

export async function createPatient(input: CreatePatientInput) {
  const supabase = await createClient()

  let primary_guardian_id: string | undefined

  // Create guardian first if provided
  if (input.guardian) {
    const { data: guardianData, error: guardianError } = await supabase
      .from("guardians")
      .insert({
        first_name: input.guardian.first_name,
        last_name: input.guardian.last_name,
        relationship: input.guardian.relationship,
        phone_primary: input.guardian.phone_primary,
        phone_secondary: input.guardian.phone_secondary,
        email: input.guardian.email,
        address_street: input.guardian.address_street,
        address_city: input.guardian.address_city,
        is_emergency_contact: input.guardian.is_emergency_contact ?? true,
        is_legal_guardian: input.guardian.is_legal_guardian ?? false,
      })
      .select()
      .single()

    if (guardianError) {
      console.error("Error creating guardian:", guardianError)
      return { error: guardianError.message }
    }
    primary_guardian_id = guardianData.id
  }

  // Create patient with BHYT fields
  const { data, error } = await supabase
    .from("patients")
    .insert({
      first_name: input.first_name,
      middle_name: input.middle_name,
      last_name: input.last_name,
      date_of_birth: input.date_of_birth,
      gender: input.gender,
      phone_primary: input.phone_primary,
      phone_secondary: input.phone_secondary,
      email: input.email,
      address_street: input.address_street,
      address_city: input.address_city,
      address_state: input.address_state,
      address_zip: input.address_zip,
      address_country: input.address_country || "Vietnam",
      blood_type: input.blood_type,
      allergies: input.allergies,
      medical_notes: input.medical_notes,
      insurance_provider: input.insurance_provider,
      insurance_policy_number: input.insurance_policy_number,
      insurance_group_number: input.insurance_group_number,
      // BHYT fields
      citizen_id: input.citizen_id,
      bhyt_card_number: input.bhyt_card_number,
      bhyt_coverage_level: input.bhyt_coverage_level,
      bhyt_registered_facility_code: input.bhyt_registered_facility_code,
      bhyt_registered_facility_name: input.bhyt_registered_facility_name,
      bhyt_valid_from: input.bhyt_valid_from,
      bhyt_valid_to: input.bhyt_valid_to,
      bhyt_issuing_agency: input.bhyt_issuing_agency,
      bhyt_primary_site_code: input.bhyt_primary_site_code,
      bhyt_primary_site_name: input.bhyt_primary_site_name,
      bhyt_continuous_5yr_start: input.bhyt_continuous_5yr_start,
      bhyt_new_card_number: input.bhyt_new_card_number,
      bhyt_new_valid_from: input.bhyt_new_valid_from,
      bhyt_new_valid_to: input.bhyt_new_valid_to,
      bhyt_status: input.bhyt_status || "unknown",
      primary_guardian_id,
      is_active: true,
    })
    .select(`
      *,
      primary_guardian:guardians!patients_primary_guardian_id_fkey(*)
    `)
    .single()

  if (error) {
    console.error("Error creating patient:", error)
    return { error: error.message }
  }

  revalidatePath("/my-patients")
  revalidatePath("/receptionist")

  return { data }
}

export async function getPatients() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("patients")
    .select(`
      *,
      primary_guardian:guardians!patients_primary_guardian_id_fkey(*),
      secondary_guardian:guardians!patients_secondary_guardian_id_fkey(*)
    `)
    .eq("is_active", true)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching patients:", error)
    return { error: error.message, data: [] }
  }

  return { data: data || [] }
}

export async function getPatientById(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("patients")
    .select(`
      *,
      primary_guardian:guardians!patients_primary_guardian_id_fkey(*),
      secondary_guardian:guardians!patients_secondary_guardian_id_fkey(*),
      visits(
        *,
        vital_signs(*),
        blood_work(*)
      ),
      prescriptions(*),
      patient_diagnoses(
        *,
        disease:diseases(*),
        icd10:icd10_codes(*)
      )
    `)
    .eq("id", id)
    .single()

  if (error) {
    console.error("Error fetching patient:", error)
    return { error: error.message }
  }

  return { data }
}

export async function updatePatient(id: string, input: Partial<CreatePatientInput>) {
  const supabase = await createClient()

  const updateData: Record<string, unknown> = {}

  // Only include fields that are provided
  if (input.first_name !== undefined) updateData.first_name = input.first_name
  if (input.middle_name !== undefined) updateData.middle_name = input.middle_name
  if (input.last_name !== undefined) updateData.last_name = input.last_name
  if (input.date_of_birth !== undefined) updateData.date_of_birth = input.date_of_birth
  if (input.gender !== undefined) updateData.gender = input.gender
  if (input.phone_primary !== undefined) updateData.phone_primary = input.phone_primary
  if (input.email !== undefined) updateData.email = input.email
  if (input.address_street !== undefined) updateData.address_street = input.address_street
  if (input.address_city !== undefined) updateData.address_city = input.address_city
  if (input.address_state !== undefined) updateData.address_state = input.address_state
  if (input.blood_type !== undefined) updateData.blood_type = input.blood_type
  if (input.allergies !== undefined) updateData.allergies = input.allergies
  if (input.medical_notes !== undefined) updateData.medical_notes = input.medical_notes
  // BHYT fields
  if (input.citizen_id !== undefined) updateData.citizen_id = input.citizen_id
  if (input.bhyt_card_number !== undefined) updateData.bhyt_card_number = input.bhyt_card_number
  if (input.bhyt_coverage_level !== undefined) updateData.bhyt_coverage_level = input.bhyt_coverage_level
  if (input.bhyt_registered_facility_code !== undefined)
    updateData.bhyt_registered_facility_code = input.bhyt_registered_facility_code
  if (input.bhyt_registered_facility_name !== undefined)
    updateData.bhyt_registered_facility_name = input.bhyt_registered_facility_name
  if (input.bhyt_valid_from !== undefined) updateData.bhyt_valid_from = input.bhyt_valid_from
  if (input.bhyt_valid_to !== undefined) updateData.bhyt_valid_to = input.bhyt_valid_to
  if (input.bhyt_status !== undefined) updateData.bhyt_status = input.bhyt_status

  const { data, error } = await supabase.from("patients").update(updateData).eq("id", id).select().single()

  if (error) {
    console.error("Error updating patient:", error)
    return { error: error.message }
  }

  revalidatePath("/my-patients")
  revalidatePath(`/my-patients/${id}`)

  return { data }
}

export async function updatePatientBHYT(
  id: string,
  bhytData: {
    bhyt_card_number?: string
    bhyt_coverage_level?: number
    bhyt_registered_facility_code?: string
    bhyt_registered_facility_name?: string
    bhyt_valid_from?: string
    bhyt_valid_to?: string
    bhyt_issuing_agency?: string
    bhyt_primary_site_code?: string
    bhyt_primary_site_name?: string
    bhyt_continuous_5yr_start?: string
    bhyt_new_card_number?: string
    bhyt_new_valid_from?: string
    bhyt_new_valid_to?: string
    bhyt_status?: string
  },
) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("patients")
    .update({
      ...bhytData,
      bhyt_last_checked: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Error updating patient BHYT:", error)
    return { error: error.message }
  }

  revalidatePath("/my-patients")
  revalidatePath(`/my-patients/${id}`)

  return { data }
}

export async function deletePatient(id: string) {
  const supabase = await createClient()

  const { error } = await supabase.from("patients").update({ is_active: false }).eq("id", id)

  if (error) {
    console.error("Error deleting patient:", error)
    return { error: error.message }
  }

  revalidatePath("/my-patients")

  return { success: true }
}

export async function lookupBHYT(citizenId: string, dob: string, name: string) {
  // This is a mock implementation - in production, this would call the actual BHYT API
  // For now, return mock data based on the input

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Mock response - in production, replace with actual API call
  const mockResponse = {
    valid: true,
    card_number: `DN${citizenId.slice(-10)}`,
    coverage_level: 80,
    registered_facility_code: "79071",
    registered_facility_name: "BV Hoàn Mỹ Sài Gòn",
    valid_from: "2024-01-01",
    valid_to: "2025-12-31",
    issuing_agency: "BHXH TP.HCM",
    primary_site_code: "79071",
    primary_site_name: "BV Hoàn Mỹ Sài Gòn",
    continuous_5yr_start: "2019-12-01",
    new_card_number: null,
    new_valid_from: null,
    new_valid_to: null,
    patient_name: name,
    patient_gender: "F",
    patient_dob: dob,
  }

  return { data: mockResponse }
}
