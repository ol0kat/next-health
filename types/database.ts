// ============================================
// TypeScript Types for NeXT Health Database
// ============================================

export interface Guardian {
  id: string
  first_name: string
  last_name: string
  relationship: string
  phone_primary: string
  phone_secondary?: string
  email?: string
  address_street?: string
  address_city?: string
  address_state?: string
  address_zip?: string
  address_country?: string
  is_emergency_contact: boolean
  is_legal_guardian: boolean
  notes?: string
  created_at: string
  updated_at: string
}

export interface Patient {
  id: string
  first_name: string
  middle_name?: string
  last_name: string
  date_of_birth: string
  gender?: string
  ssn_last_four?: string
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
  primary_guardian_id?: string
  secondary_guardian_id?: string
  is_active: boolean
  created_at: string
  updated_at: string
  // Joined relations
  primary_guardian?: Guardian
  secondary_guardian?: Guardian
}

export interface ICD10Code {
  id: string
  code: string
  short_description: string
  long_description?: string
  category?: string
  subcategory?: string
  is_billable: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Disease {
  id: string
  name: string
  common_name?: string
  description?: string
  symptoms?: string[]
  risk_factors?: string[]
  prevention?: string
  treatment_overview?: string
  primary_icd10_id?: string
  disease_type?: string
  body_system?: string
  severity_level?: string
  is_communicable: boolean
  is_active: boolean
  created_at: string
  updated_at: string
  // Joined relations
  primary_icd10?: ICD10Code
}

export interface Visit {
  id: string
  patient_id: string
  visit_date: string
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
  status: "scheduled" | "checked-in" | "in-progress" | "completed" | "cancelled" | "no-show"
  checkout_time?: string
  billing_code?: string
  copay_amount?: number
  copay_collected: boolean
  created_at: string
  updated_at: string
  // Joined relations
  patient?: Patient
  vital_signs?: VitalSigns[]
  blood_work?: BloodWork[]
}

export interface VitalSigns {
  id: string
  visit_id: string
  patient_id: string
  recorded_at: string
  temperature_f?: number
  temperature_method?: string
  heart_rate_bpm?: number
  heart_rate_rhythm?: string
  respiratory_rate?: number
  blood_pressure_systolic?: number
  blood_pressure_diastolic?: number
  blood_pressure_position?: string
  oxygen_saturation?: number
  oxygen_supplemental: boolean
  oxygen_flow_rate?: number
  height_inches?: number
  weight_lbs?: number
  bmi?: number
  pain_level?: number
  pain_location?: string
  blood_glucose_mg_dl?: number
  blood_glucose_timing?: string
  notes?: string
  recorded_by?: string
  created_at: string
}

export interface BloodWork {
  id: string
  visit_id: string
  patient_id: string
  lab_name?: string
  specimen_collected_at?: string
  results_received_at?: string
  order_number?: string
  // CBC
  wbc?: number
  rbc?: number
  hemoglobin?: number
  hematocrit?: number
  platelet_count?: number
  mcv?: number
  mch?: number
  mchc?: number
  rdw?: number
  // BMP
  glucose?: number
  glucose_fasting?: boolean
  bun?: number
  creatinine?: number
  sodium?: number
  potassium?: number
  chloride?: number
  co2?: number
  calcium?: number
  // Lipid Panel
  total_cholesterol?: number
  ldl_cholesterol?: number
  hdl_cholesterol?: number
  triglycerides?: number
  // Liver Function
  ast?: number
  alt?: number
  alp?: number
  bilirubin_total?: number
  albumin?: number
  // Thyroid
  tsh?: number
  t3?: number
  t4?: number
  free_t4?: number
  // Other
  hba1c?: number
  vitamin_d?: number
  vitamin_b12?: number
  iron?: number
  ferritin?: number
  psa?: number
  urinalysis_performed: boolean
  urinalysis_notes?: string
  status: "pending" | "partial" | "complete" | "cancelled"
  interpretation?: string
  critical_values: boolean
  critical_values_notified: boolean
  notes?: string
  created_at: string
  updated_at: string
}

export interface Prescription {
  id: string
  patient_id: string
  visit_id?: string
  medication_name: string
  generic_name?: string
  ndc_code?: string
  dosage_amount: string
  dosage_unit: string
  dosage_form: string
  frequency: string
  route: string
  instructions?: string
  take_with_food?: boolean
  quantity: number
  days_supply?: number
  refills_authorized: number
  refills_remaining: number
  prescribed_date: string
  start_date?: string
  end_date?: string
  prescriber_name: string
  prescriber_npi?: string
  prescriber_dea?: string
  pharmacy_name?: string
  pharmacy_phone?: string
  pharmacy_address?: string
  diagnosis_id?: string
  icd10_id?: string
  indication?: string
  is_controlled_substance: boolean
  controlled_substance_schedule?: string
  brand_medically_necessary: boolean
  dispense_as_written: boolean
  status: "active" | "completed" | "discontinued" | "cancelled" | "on-hold"
  discontinued_reason?: string
  discontinued_date?: string
  notes?: string
  created_at: string
  updated_at: string
  // Joined relations
  patient?: Patient
  visit?: Visit
  diagnosis?: Disease
  icd10?: ICD10Code
}

export interface PatientDiagnosis {
  id: string
  patient_id: string
  disease_id?: string
  icd10_id: string
  visit_id?: string
  diagnosis_date: string
  diagnosed_by?: string
  status: "active" | "resolved" | "chronic" | "in-remission" | "ruled-out"
  severity?: string
  is_primary: boolean
  resolution_date?: string
  resolution_notes?: string
  notes?: string
  created_at: string
  updated_at: string
  // Joined relations
  patient?: Patient
  disease?: Disease
  icd10?: ICD10Code
  visit?: Visit
}

export interface VisitDiagnosis {
  id: string
  visit_id: string
  patient_diagnosis_id: string
  is_primary: boolean
  sequence_number?: number
  created_at: string
  // Joined relations
  visit?: Visit
  patient_diagnosis?: PatientDiagnosis
}
