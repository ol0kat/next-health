// Comprehensive medication database with standard dosing guidelines
export interface MedicationGuide {
  id: string
  name: string
  commonDosages: Array<{
    dosage: string
    dosageUnit: string
    dosageForm: string
    frequency: string
    indication?: string
  }>
  defaultDosage: {
    dosage: string
    dosageUnit: string
    dosageForm: string
    frequency: string
  }
  route: string
  standardQuantity: number
  standardDuration: number // in days
  defaultRefills: number
  instructionTags: string[] // instruction IDs from INSTRUCTION_TAGS
  warnings: string[]
  contraindications?: string[]
  category: string
}

export const MEDICATION_DATABASE: Record<string, MedicationGuide> = {
  "amoxicillin": {
    id: "amoxicillin",
    name: "Amoxicillin",
    category: "Antibiotic - Penicillin",
    route: "Oral",
    commonDosages: [
      {
        dosage: "500",
        dosageUnit: "mg",
        dosageForm: "Capsule",
        frequency: "Three times daily",
        indication: "Bacterial infections",
      },
      {
        dosage: "875",
        dosageUnit: "mg",
        dosageForm: "Tablet",
        frequency: "Twice daily",
        indication: "Moderate infections",
      },
      {
        dosage: "250",
        dosageUnit: "mg",
        dosageForm: "Capsule",
        frequency: "Three times daily",
        indication: "Mild infections",
      },
    ],
    defaultDosage: {
      dosage: "500",
      dosageUnit: "mg",
      dosageForm: "Capsule",
      frequency: "Three times daily",
    },
    standardQuantity: 21,
    standardDuration: 7,
    defaultRefills: 0,
    instructionTags: ["with-food", "complete-course", "no-alcohol"],
    warnings: ["May cause allergic reaction", "Not for penicillin-allergic patients"],
  },
  "metformin": {
    id: "metformin",
    name: "Metformin",
    category: "Antidiabetic",
    route: "Oral",
    commonDosages: [
      {
        dosage: "500",
        dosageUnit: "mg",
        dosageForm: "Tablet",
        frequency: "Twice daily",
        indication: "Initial therapy",
      },
      {
        dosage: "1000",
        dosageUnit: "mg",
        dosageForm: "Tablet",
        frequency: "Twice daily",
        indication: "Maintenance",
      },
      {
        dosage: "1000",
        dosageUnit: "mg",
        dosageForm: "Tablet",
        frequency: "Three times daily",
        indication: "Maximum dosing",
      },
    ],
    defaultDosage: {
      dosage: "500",
      dosageUnit: "mg",
      dosageForm: "Tablet",
      frequency: "Twice daily",
    },
    standardQuantity: 60,
    standardDuration: 30,
    defaultRefills: 11,
    instructionTags: ["with-food", "full-glass", "stay-upright", "dont-stop"],
    warnings: ["Monitor renal function", "Risk of lactic acidosis"],
  },
  "lisinopril": {
    id: "lisinopril",
    name: "Lisinopril",
    category: "ACE Inhibitor - Antihypertensive",
    route: "Oral",
    commonDosages: [
      {
        dosage: "5",
        dosageUnit: "mg",
        dosageForm: "Tablet",
        frequency: "Once daily",
        indication: "Initial therapy",
      },
      {
        dosage: "10",
        dosageUnit: "mg",
        dosageForm: "Tablet",
        frequency: "Once daily",
        indication: "Standard dosing",
      },
      {
        dosage: "20",
        dosageUnit: "mg",
        dosageForm: "Tablet",
        frequency: "Once daily",
        indication: "Maintenance",
      },
    ],
    defaultDosage: {
      dosage: "10",
      dosageUnit: "mg",
      dosageForm: "Tablet",
      frequency: "Once daily",
    },
    standardQuantity: 30,
    standardDuration: 30,
    defaultRefills: 11,
    instructionTags: ["morning", "empty-stomach", "dont-stop"],
    warnings: ["May cause persistent dry cough", "Monitor blood pressure"],
  },
  "atorvastatin": {
    id: "atorvastatin",
    name: "Atorvastatin",
    category: "Statin - Lipid Lowering",
    route: "Oral",
    commonDosages: [
      {
        dosage: "10",
        dosageUnit: "mg",
        dosageForm: "Tablet",
        frequency: "Once daily",
        indication: "Initial therapy",
      },
      {
        dosage: "20",
        dosageUnit: "mg",
        dosageForm: "Tablet",
        frequency: "Once daily",
        indication: "Standard dosing",
      },
      {
        dosage: "40",
        dosageUnit: "mg",
        dosageForm: "Tablet",
        frequency: "Once daily",
        indication: "High-risk patients",
      },
    ],
    defaultDosage: {
      dosage: "20",
      dosageUnit: "mg",
      dosageForm: "Tablet",
      frequency: "Once daily",
    },
    standardQuantity: 30,
    standardDuration: 30,
    defaultRefills: 11,
    instructionTags: ["bedtime", "complete-course", "no-grapefruit"],
    warnings: ["Monitor liver function", "Avoid grapefruit juice"],
  },
  "levothyroxine": {
    id: "levothyroxine",
    name: "Levothyroxine",
    category: "Thyroid Hormone",
    route: "Oral",
    commonDosages: [
      {
        dosage: "25",
        dosageUnit: "mcg",
        dosageForm: "Tablet",
        frequency: "Once daily",
        indication: "Initial therapy",
      },
      {
        dosage: "50",
        dosageUnit: "mcg",
        dosageForm: "Tablet",
        frequency: "Once daily",
        indication: "Standard dosing",
      },
      {
        dosage: "75",
        dosageUnit: "mcg",
        dosageForm: "Tablet",
        frequency: "Once daily",
        indication: "Maintenance",
      },
    ],
    defaultDosage: {
      dosage: "50",
      dosageUnit: "mcg",
      dosageForm: "Tablet",
      frequency: "Once daily",
    },
    standardQuantity: 30,
    standardDuration: 30,
    defaultRefills: 11,
    instructionTags: ["morning", "empty-stomach", "dont-stop"],
    warnings: ["Take on empty stomach", "Monitor TSH levels"],
  },
  "omeprazole": {
    id: "omeprazole",
    name: "Omeprazole",
    category: "Proton Pump Inhibitor",
    route: "Oral",
    commonDosages: [
      {
        dosage: "20",
        dosageUnit: "mg",
        dosageForm: "Capsule",
        frequency: "Once daily",
        indication: "GERD",
      },
      {
        dosage: "40",
        dosageUnit: "mg",
        dosageForm: "Capsule",
        frequency: "Once daily",
        indication: "Ulcer disease",
      },
    ],
    defaultDosage: {
      dosage: "20",
      dosageUnit: "mg",
      dosageForm: "Capsule",
      frequency: "Once daily",
    },
    standardQuantity: 30,
    standardDuration: 30,
    defaultRefills: 5,
    instructionTags: ["morning", "before-meals", "complete-course"],
    warnings: ["Long-term use increases fracture risk", "Monitor B12 levels"],
  },
  "ibuprofen": {
    id: "ibuprofen",
    name: "Ibuprofen",
    category: "NSAID - Pain/Anti-inflammatory",
    route: "Oral",
    commonDosages: [
      {
        dosage: "200",
        dosageUnit: "mg",
        dosageForm: "Tablet",
        frequency: "Every 4-6 hours as needed",
        indication: "Pain relief",
      },
      {
        dosage: "400",
        dosageUnit: "mg",
        dosageForm: "Tablet",
        frequency: "Every 6-8 hours as needed",
        indication: "Moderate pain/inflammation",
      },
      {
        dosage: "600",
        dosageUnit: "mg",
        dosageForm: "Tablet",
        frequency: "Three times daily",
        indication: "Arthritis",
      },
    ],
    defaultDosage: {
      dosage: "400",
      dosageUnit: "mg",
      dosageForm: "Tablet",
      frequency: "Every 6-8 hours as needed",
    },
    standardQuantity: 30,
    standardDuration: 7,
    defaultRefills: 0,
    instructionTags: ["with-food", "full-glass", "no-alcohol"],
    warnings: ["GI upset common", "Increased cardiovascular risk with long-term use", "Contraindicated in severe renal disease"],
  },
  "aspirin": {
    id: "aspirin",
    name: "Aspirin",
    category: "Antiplatelet/NSAID",
    route: "Oral",
    commonDosages: [
      {
        dosage: "81",
        dosageUnit: "mg",
        dosageForm: "Tablet",
        frequency: "Once daily",
        indication: "Cardiovascular protection",
      },
      {
        dosage: "325",
        dosageUnit: "mg",
        dosageForm: "Tablet",
        frequency: "Every 4-6 hours as needed",
        indication: "Pain/fever",
      },
    ],
    defaultDosage: {
      dosage: "81",
      dosageUnit: "mg",
      dosageForm: "Tablet",
      frequency: "Once daily",
    },
    standardQuantity: 30,
    standardDuration: 30,
    defaultRefills: 11,
    instructionTags: ["with-food", "complete-course"],
    warnings: ["Bleeding risk", "Do not use in patients with aspirin allergy"],
  },
  "losartan": {
    id: "losartan",
    name: "Losartan",
    category: "ARB - Antihypertensive",
    route: "Oral",
    commonDosages: [
      {
        dosage: "25",
        dosageUnit: "mg",
        dosageForm: "Tablet",
        frequency: "Once daily",
        indication: "Initial therapy",
      },
      {
        dosage: "50",
        dosageUnit: "mg",
        dosageForm: "Tablet",
        frequency: "Once daily",
        indication: "Standard dosing",
      },
    ],
    defaultDosage: {
      dosage: "50",
      dosageUnit: "mg",
      dosageForm: "Tablet",
      frequency: "Once daily",
    },
    standardQuantity: 30,
    standardDuration: 30,
    defaultRefills: 11,
    instructionTags: ["morning", "dont-stop"],
    warnings: ["Monitor potassium levels", "Monitor renal function"],
  },
  "sertraline": {
    id: "sertraline",
    name: "Sertraline",
    category: "SSRI - Antidepressant",
    route: "Oral",
    commonDosages: [
      {
        dosage: "50",
        dosageUnit: "mg",
        dosageForm: "Tablet",
        frequency: "Once daily",
        indication: "Initial therapy",
      },
      {
        dosage: "100",
        dosageUnit: "mg",
        dosageForm: "Tablet",
        frequency: "Once daily",
        indication: "Maintenance",
      },
    ],
    defaultDosage: {
      dosage: "50",
      dosageUnit: "mg",
      dosageForm: "Tablet",
      frequency: "Once daily",
    },
    standardQuantity: 30,
    standardDuration: 30,
    defaultRefills: 11,
    instructionTags: ["morning", "dont-stop", "no-alcohol"],
    warnings: ["Suicidal thoughts in young patients", "Serotonin syndrome risk"],
  },
  "amlodipine": {
    id: "amlodipine",
    name: "Amlodipine",
    category: "Calcium Channel Blocker",
    route: "Oral",
    commonDosages: [
      {
        dosage: "2.5",
        dosageUnit: "mg",
        dosageForm: "Tablet",
        frequency: "Once daily",
        indication: "Initial therapy",
      },
      {
        dosage: "5",
        dosageUnit: "mg",
        dosageForm: "Tablet",
        frequency: "Once daily",
        indication: "Standard dosing",
      },
      {
        dosage: "10",
        dosageUnit: "mg",
        dosageForm: "Tablet",
        frequency: "Once daily",
        indication: "Maximum dosing",
      },
    ],
    defaultDosage: {
      dosage: "5",
      dosageUnit: "mg",
      dosageForm: "Tablet",
      frequency: "Once daily",
    },
    standardQuantity: 30,
    standardDuration: 30,
    defaultRefills: 11,
    instructionTags: ["morning", "dont-stop"],
    warnings: ["Peripheral edema common", "Do not stop abruptly"],
  },
}

export function getMedicationGuide(medicationName: string): MedicationGuide | null {
  const normalized = medicationName.toLowerCase().trim()
  return MEDICATION_DATABASE[normalized] || null
}

export function searchMedications(query: string): MedicationGuide[] {
  const normalized = query.toLowerCase().trim()
  if (!normalized) return []

  return Object.values(MEDICATION_DATABASE).filter(
    (med) =>
      med.name.toLowerCase().includes(normalized) ||
      med.category.toLowerCase().includes(normalized) ||
      med.id.includes(normalized)
  )
}

export function getCommonMedications(): MedicationGuide[] {
  return Object.values(MEDICATION_DATABASE)
}
