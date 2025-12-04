"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export interface SubmitOrderInput {
  patient: {
    fullName: string
    citizenId: string
    dob?: string
    age?: number
    phone?: string
    address?: string
    medicalIntent?: string
  }
  tests: Array<{
    id: string
    name: string
    price: number
    turnaroundHours: number
    requiresConsent?: boolean
  }>
  insurance: {
    bhytCode?: string
    bhytCoverage?: number
    privateInsuranceActive?: boolean
    estimatedPrivateCoverage?: number
  }
  costs: {
    subtotal: number
    bhytCoverageAmount: number
    privateCoverageAmount: number
    finalPatientDue: number
  }
}

export async function submitOrder(input: SubmitOrderInput) {
  try {
    const supabase = await createClient()

    // 1. Check if patient exists
    const { data: existingPatient } = await supabase
      .from("patients")
      .select("id")
      .eq("citizen_id", input.patient.citizenId)
      .single()

    let patientId: string

    if (existingPatient) {
      // Patient exists - use existing ID
      patientId = existingPatient.id
    } else {
      // Create new patient
      const [firstName, ...lastNameParts] = input.patient.fullName.split(" ")
      const lastName = lastNameParts.join(" ") || firstName

      const { data: newPatient, error: patientError } = await supabase
        .from("patients")
        .insert({
          first_name: firstName,
          last_name: lastName,
          citizen_id: input.patient.citizenId,
          phone_primary: input.patient.phone,
          address_street: input.patient.address,
          date_of_birth: input.patient.dob,
          bhyt_card_number: input.insurance.bhytCode,
          bhyt_coverage_level: input.insurance.bhytCoverage ? Math.round(input.insurance.bhytCoverage * 100) : 80,
          medical_notes: input.patient.medicalIntent ? `Medical Intent: ${input.patient.medicalIntent}` : null,
          is_active: true,
        })
        .select("id")
        .single()

      if (patientError) throw patientError
      if (!newPatient) throw new Error("Failed to create patient")

      patientId = newPatient.id
    }

    // 2. Create order
    const orderTestIds = input.tests.map(t => t.id).join(", ")
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        patient_id: patientId,
        status: "pending",
        tests_ordered: orderTestIds,
        total_amount: input.costs.subtotal,
        insurance_coverage: input.costs.bhytCoverageAmount + input.costs.privateCoverageAmount,
        patient_owes: input.costs.finalPatientDue,
        notes: `Tests: ${input.tests.map(t => t.name).join(", ")}`,
      })
      .select("id")
      .single()

    if (orderError) throw orderError
    if (!order) throw new Error("Failed to create order")

    // 3. Update patient's scheduled orders (via patient_visits or similar)
    const maxTurnaroundHours = Math.max(...input.tests.map(t => t.turnaroundHours))
    const scheduledDate = new Date()
    scheduledDate.setHours(scheduledDate.getHours() + maxTurnaroundHours)

    const { error: visitError } = await supabase
      .from("patient_visits")
      .insert({
        patient_id: patientId,
        visit_type: "lab_order",
        status: "scheduled",
        scheduled_date: scheduledDate.toISOString(),
        notes: `Lab order: ${orderTestIds}`,
      })

    if (visitError) {
      // If patient_visits doesn't exist, we can skip this error for now
      console.warn("Could not create visit record:", visitError)
    }

    // Revalidate paths
    revalidatePath("/my-patients")
    revalidatePath("/orders")
    revalidatePath(`/my-patients/${patientId}`)

    return {
      success: true,
      patientId,
      orderId: order.id,
      isNewPatient: !existingPatient,
    }
  } catch (error) {
    console.error("Error submitting order:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to submit order",
    }
  }
}
