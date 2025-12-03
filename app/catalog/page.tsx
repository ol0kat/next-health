"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { useApp, type Patient } from "@/components/app-provider"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Search,
  ChevronDown,
  FlaskConical,
  X,
  ArrowUpDown,
  GitCompare,
  Plus,
  Check,
  Info,
  ShoppingCart,
  User,
  UserPlus,
  Trash2,
  ChevronRight,
  Droplets,
  TestTube,
  Pill,
  Stethoscope,
  FileText,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface LabTest {
  id: string
  name: string
  shortName?: string
  labCompany: string
  sampleType: string
  category: string
  subcategory?: string
  price: number
  turnaroundDays: number
  description: string
  biomarkers?: string[]
  popular?: boolean
  requiresFasting?: boolean
  homeCollection?: boolean
  catalogType: "lab" | "pharma" | "procedure" | "icd10"
}

const labTests: LabTest[] = [
  // Lab Tests
  {
    id: "1",
    name: "Comprehensive Thyroid Panel",
    shortName: "Thyroid Panel",
    labCompany: "Access Med Labs",
    sampleType: "Serum",
    category: "Thyroid",
    price: 89,
    turnaroundDays: 3,
    description: "Complete thyroid function assessment including TSH, Free T4, Free T3, and thyroid antibodies.",
    biomarkers: ["TSH", "Free T4", "Free T3", "TPO Antibodies", "Thyroglobulin Ab"],
    popular: true,
    requiresFasting: false,
    homeCollection: true,
    catalogType: "lab",
  },
  {
    id: "2",
    name: "TSH",
    labCompany: "Access Med Labs",
    sampleType: "Serum",
    category: "Thyroid",
    price: 29,
    turnaroundDays: 2,
    description: "Thyroid-stimulating hormone test to evaluate thyroid function.",
    biomarkers: ["TSH"],
    popular: true,
    requiresFasting: false,
    homeCollection: true,
    catalogType: "lab",
  },
  {
    id: "3",
    name: "Free T4",
    labCompany: "Access Med Labs",
    sampleType: "Serum",
    category: "Thyroid",
    price: 35,
    turnaroundDays: 2,
    description: "Measures unbound thyroxine hormone levels.",
    biomarkers: ["Free T4"],
    requiresFasting: false,
    homeCollection: true,
    catalogType: "lab",
  },
  {
    id: "4",
    name: "Thyroid Peroxidase Antibodies",
    shortName: "TPO Antibodies",
    labCompany: "Diagnostic Solutions",
    sampleType: "Serum",
    category: "Thyroid",
    price: 45,
    turnaroundDays: 4,
    description: "Detects antibodies against thyroid peroxidase enzyme.",
    biomarkers: ["TPO Antibodies"],
    requiresFasting: false,
    homeCollection: true,
    catalogType: "lab",
  },
  {
    id: "5",
    name: "Comprehensive Metabolic Panel",
    shortName: "CMP",
    labCompany: "Access Med Labs",
    sampleType: "Serum",
    category: "Metabolic",
    price: 49,
    turnaroundDays: 2,
    description: "14-test panel measuring glucose, electrolytes, kidney and liver function.",
    biomarkers: [
      "Glucose",
      "BUN",
      "Creatinine",
      "Sodium",
      "Potassium",
      "Chloride",
      "CO2",
      "Calcium",
      "Total Protein",
      "Albumin",
      "Bilirubin",
      "Alkaline Phosphatase",
      "AST",
      "ALT",
    ],
    popular: true,
    requiresFasting: true,
    homeCollection: true,
    catalogType: "lab",
  },
  {
    id: "6",
    name: "Hemoglobin A1c",
    shortName: "HbA1c",
    labCompany: "Access Med Labs",
    sampleType: "Whole Blood",
    category: "Metabolic",
    subcategory: "Diabetes",
    price: 39,
    turnaroundDays: 2,
    description: "Measures average blood sugar over the past 2-3 months.",
    biomarkers: ["Hemoglobin A1c"],
    popular: true,
    requiresFasting: false,
    homeCollection: true,
    catalogType: "lab",
  },
  {
    id: "7",
    name: "Fasting Insulin",
    labCompany: "Access Med Labs",
    sampleType: "Serum",
    category: "Metabolic",
    subcategory: "Diabetes",
    price: 35,
    turnaroundDays: 2,
    description: "Measures insulin levels to assess insulin resistance.",
    biomarkers: ["Insulin"],
    requiresFasting: true,
    homeCollection: true,
    catalogType: "lab",
  },
  {
    id: "8",
    name: "Fasting Glucose",
    labCompany: "Access Med Labs",
    sampleType: "Serum",
    category: "Metabolic",
    subcategory: "Diabetes",
    price: 15,
    turnaroundDays: 1,
    description: "Measures blood glucose levels after fasting.",
    biomarkers: ["Glucose"],
    popular: true,
    requiresFasting: true,
    homeCollection: true,
    catalogType: "lab",
  },
  {
    id: "9",
    name: "Lipid Panel",
    labCompany: "Access Med Labs",
    sampleType: "Serum",
    category: "Cardiovascular",
    price: 45,
    turnaroundDays: 2,
    description: "Measures cholesterol levels including HDL, LDL, and triglycerides.",
    biomarkers: ["Total Cholesterol", "HDL", "LDL", "Triglycerides", "VLDL"],
    popular: true,
    requiresFasting: true,
    homeCollection: true,
    catalogType: "lab",
  },
  {
    id: "10",
    name: "Advanced Lipid Panel",
    labCompany: "Diagnostic Solutions",
    sampleType: "Serum",
    category: "Cardiovascular",
    price: 129,
    turnaroundDays: 5,
    description: "Detailed cardiovascular risk assessment with particle size and number.",
    biomarkers: ["LDL Particle Number", "Small Dense LDL", "HDL Particle Number", "Lipoprotein(a)", "ApoB"],
    requiresFasting: true,
    homeCollection: true,
    catalogType: "lab",
  },
  {
    id: "11",
    name: "High-Sensitivity CRP",
    shortName: "hs-CRP",
    labCompany: "Access Med Labs",
    sampleType: "Serum",
    category: "Cardiovascular",
    subcategory: "Inflammation",
    price: 35,
    turnaroundDays: 2,
    description: "Measures inflammation levels associated with cardiovascular risk.",
    biomarkers: ["hs-CRP"],
    requiresFasting: false,
    homeCollection: true,
    catalogType: "lab",
  },
  {
    id: "12",
    name: "GI-MAP",
    labCompany: "Diagnostic Solutions",
    sampleType: "Stool",
    category: "GI / Gut Health",
    price: 399,
    turnaroundDays: 14,
    description:
      "Comprehensive stool analysis using DNA technology to detect pathogens, bacteria, parasites, and digestive markers.",
    biomarkers: ["H. Pylori", "Parasites", "Bacteria", "Yeast", "Digestive Enzymes", "Gut Immunity"],
    popular: true,
    requiresFasting: false,
    homeCollection: true,
    catalogType: "lab",
  },
  {
    id: "13",
    name: "DUTCH Complete",
    labCompany: "Precision Analytical",
    sampleType: "Dried Urine",
    category: "Hormones",
    price: 399,
    turnaroundDays: 10,
    description: "Comprehensive hormone metabolite testing including cortisol, estrogen, progesterone, and androgens.",
    biomarkers: [
      "Cortisol",
      "Cortisone",
      "Estradiol",
      "Estrone",
      "Estriol",
      "Progesterone",
      "Testosterone",
      "DHEA-S",
      "Melatonin",
    ],
    popular: true,
    requiresFasting: false,
    homeCollection: true,
    catalogType: "lab",
  },
  {
    id: "14",
    name: "Female Hormone Panel",
    labCompany: "Access Med Labs",
    sampleType: "Serum",
    category: "Hormones",
    subcategory: "Female Health",
    price: 149,
    turnaroundDays: 3,
    description: "Comprehensive female hormone assessment for fertility and cycle health.",
    biomarkers: ["Estradiol", "Progesterone", "FSH", "LH", "Prolactin", "DHEA-S"],
    requiresFasting: false,
    homeCollection: true,
    catalogType: "lab",
  },
  {
    id: "15",
    name: "Testosterone, Free & Total",
    labCompany: "Access Med Labs",
    sampleType: "Serum",
    category: "Hormones",
    subcategory: "Male Health",
    price: 69,
    turnaroundDays: 3,
    description: "Measures both free and total testosterone levels.",
    biomarkers: ["Total Testosterone", "Free Testosterone", "SHBG"],
    popular: true,
    requiresFasting: false,
    homeCollection: true,
    catalogType: "lab",
  },
  {
    id: "16",
    name: "Vitamin D, 25-Hydroxy",
    labCompany: "Access Med Labs",
    sampleType: "Serum",
    category: "Vitamins & Nutrients",
    price: 55,
    turnaroundDays: 3,
    description: "Measures vitamin D levels to assess deficiency or sufficiency.",
    biomarkers: ["25-Hydroxy Vitamin D"],
    popular: true,
    requiresFasting: false,
    homeCollection: true,
    catalogType: "lab",
  },
  {
    id: "17",
    name: "Iron Panel",
    labCompany: "Access Med Labs",
    sampleType: "Serum",
    category: "Vitamins & Nutrients",
    price: 65,
    turnaroundDays: 2,
    description: "Comprehensive iron status assessment including ferritin and TIBC.",
    biomarkers: ["Iron", "Ferritin", "TIBC", "Iron Saturation"],
    requiresFasting: true,
    homeCollection: true,
    catalogType: "lab",
  },
  {
    id: "18",
    name: "Vitamin B12 & Folate",
    labCompany: "Access Med Labs",
    sampleType: "Serum",
    category: "Vitamins & Nutrients",
    price: 59,
    turnaroundDays: 2,
    description: "Measures B12 and folate levels for energy and neurological health.",
    biomarkers: ["Vitamin B12", "Folate"],
    requiresFasting: false,
    homeCollection: true,
    catalogType: "lab",
  },
  {
    id: "19",
    name: "Complete Blood Count (CBC)",
    shortName: "CBC",
    labCompany: "Access Med Labs",
    sampleType: "Whole Blood",
    category: "Hematology",
    price: 25,
    turnaroundDays: 1,
    description: "Measures red blood cells, white blood cells, and platelets.",
    biomarkers: ["RBC", "WBC", "Hemoglobin", "Hematocrit", "Platelets", "MCV", "MCH", "MCHC"],
    popular: true,
    requiresFasting: false,
    homeCollection: true,
    catalogType: "lab",
  },
  {
    id: "20",
    name: "CBC with Differential",
    labCompany: "Access Med Labs",
    sampleType: "Whole Blood",
    category: "Hematology",
    price: 35,
    turnaroundDays: 1,
    description: "CBC plus detailed white blood cell breakdown.",
    biomarkers: [
      "RBC",
      "WBC",
      "Hemoglobin",
      "Hematocrit",
      "Platelets",
      "Neutrophils",
      "Lymphocytes",
      "Monocytes",
      "Eosinophils",
      "Basophils",
    ],
    requiresFasting: false,
    homeCollection: true,
    catalogType: "lab",
  },
  {
    id: "21",
    name: "Basic Metabolic Panel",
    shortName: "BMP",
    labCompany: "Access Med Labs",
    sampleType: "Serum",
    category: "Metabolic",
    price: 35,
    turnaroundDays: 1,
    description: "8-test panel for kidney function and electrolytes.",
    biomarkers: ["Glucose", "BUN", "Creatinine", "Sodium", "Potassium", "Chloride", "CO2", "Calcium"],
    popular: true,
    requiresFasting: true,
    homeCollection: true,
    catalogType: "lab",
  },
  {
    id: "22",
    name: "Liver Function Panel",
    labCompany: "Access Med Labs",
    sampleType: "Serum",
    category: "Liver",
    price: 45,
    turnaroundDays: 2,
    description: "Comprehensive liver enzyme and function assessment.",
    biomarkers: ["AST", "ALT", "ALP", "GGT", "Bilirubin", "Albumin", "Total Protein"],
    requiresFasting: false,
    homeCollection: true,
    catalogType: "lab",
  },
  {
    id: "23",
    name: "Food Sensitivity Panel",
    labCompany: "Diagnostic Solutions",
    sampleType: "Serum",
    category: "Allergy & Immunity",
    price: 299,
    turnaroundDays: 10,
    description: "Tests for IgG reactions to 96 common foods.",
    biomarkers: ["96 Food IgG Antibodies"],
    requiresFasting: false,
    homeCollection: true,
    catalogType: "lab",
  },
  {
    id: "24",
    name: "Environmental Allergy Panel",
    labCompany: "Diagnostic Solutions",
    sampleType: "Serum",
    category: "Allergy & Immunity",
    price: 199,
    turnaroundDays: 7,
    description: "Tests for IgE reactions to common environmental allergens.",
    biomarkers: ["Dust Mites", "Mold", "Pollen", "Pet Dander", "Grasses"],
    requiresFasting: false,
    homeCollection: true,
    catalogType: "lab",
  },
  // Pharma
  {
    id: "p1",
    name: "Levothyroxine 50mcg",
    labCompany: "Generic",
    sampleType: "N/A",
    category: "Thyroid Medication",
    price: 15,
    turnaroundDays: 1,
    description: "Thyroid hormone replacement therapy for hypothyroidism.",
    popular: true,
    catalogType: "pharma",
  },
  {
    id: "p2",
    name: "Metformin 500mg",
    labCompany: "Generic",
    sampleType: "N/A",
    category: "Diabetes Medication",
    price: 12,
    turnaroundDays: 1,
    description: "First-line medication for type 2 diabetes management.",
    popular: true,
    catalogType: "pharma",
  },
  {
    id: "p3",
    name: "Lisinopril 10mg",
    labCompany: "Generic",
    sampleType: "N/A",
    category: "Cardiovascular Medication",
    price: 10,
    turnaroundDays: 1,
    description: "ACE inhibitor for hypertension and heart failure.",
    popular: true,
    catalogType: "pharma",
  },
  {
    id: "p4",
    name: "Atorvastatin 20mg",
    labCompany: "Generic",
    sampleType: "N/A",
    category: "Cardiovascular Medication",
    price: 18,
    turnaroundDays: 1,
    description: "Statin medication for cholesterol management.",
    popular: true,
    catalogType: "pharma",
  },
  {
    id: "p5",
    name: "Omeprazole 20mg",
    labCompany: "Generic",
    sampleType: "N/A",
    category: "GI Medication",
    price: 14,
    turnaroundDays: 1,
    description: "Proton pump inhibitor for acid reflux and GERD.",
    catalogType: "pharma",
  },
  {
    id: "p6",
    name: "Amlodipine 5mg",
    labCompany: "Generic",
    sampleType: "N/A",
    category: "Cardiovascular Medication",
    price: 11,
    turnaroundDays: 1,
    description: "Calcium channel blocker for hypertension.",
    catalogType: "pharma",
  },
  // Procedures
  {
    id: "pr1",
    name: "ECG / EKG",
    labCompany: "In-House",
    sampleType: "N/A",
    category: "Cardiac Procedures",
    price: 75,
    turnaroundDays: 1,
    description: "Electrocardiogram to measure heart electrical activity.",
    popular: true,
    catalogType: "procedure",
  },
  {
    id: "pr2",
    name: "Ultrasound - Thyroid",
    labCompany: "Imaging Center",
    sampleType: "N/A",
    category: "Imaging",
    price: 250,
    turnaroundDays: 3,
    description: "Diagnostic ultrasound imaging of the thyroid gland.",
    popular: true,
    catalogType: "procedure",
  },
  {
    id: "pr3",
    name: "X-Ray - Chest",
    labCompany: "Imaging Center",
    sampleType: "N/A",
    category: "Imaging",
    price: 120,
    turnaroundDays: 2,
    description: "Chest X-ray for lung and heart evaluation.",
    catalogType: "procedure",
  },
  {
    id: "pr4",
    name: "Echocardiogram",
    labCompany: "Cardiology Center",
    sampleType: "N/A",
    category: "Cardiac Procedures",
    price: 450,
    turnaroundDays: 5,
    description: "Ultrasound imaging of the heart structure and function.",
    catalogType: "procedure",
  },
  {
    id: "pr5",
    name: "Stress Test",
    labCompany: "Cardiology Center",
    sampleType: "N/A",
    category: "Cardiac Procedures",
    price: 350,
    turnaroundDays: 3,
    description: "Exercise stress test to evaluate heart function under exertion.",
    catalogType: "procedure",
  },
  {
    id: "pr6",
    name: "Bone Density Scan (DEXA)",
    labCompany: "Imaging Center",
    sampleType: "N/A",
    category: "Imaging",
    price: 200,
    turnaroundDays: 3,
    description: "Dual-energy X-ray absorptiometry for osteoporosis screening.",
    catalogType: "procedure",
  },
  {
    id: "icd1",
    name: "E03.9 - Hypothyroidism, unspecified",
    shortName: "Hypothyroidism",
    labCompany: "ICD-10",
    sampleType: "N/A",
    category: "Endocrine Diagnoses",
    price: 0,
    turnaroundDays: 0,
    description: "Diagnosis code for unspecified hypothyroidism.",
    popular: true,
    catalogType: "icd10",
  },
  {
    id: "icd2",
    name: "E11.9 - Type 2 diabetes mellitus without complications",
    shortName: "Type 2 Diabetes",
    labCompany: "ICD-10",
    sampleType: "N/A",
    category: "Endocrine Diagnoses",
    price: 0,
    turnaroundDays: 0,
    description: "Diagnosis code for type 2 diabetes mellitus without complications.",
    popular: true,
    catalogType: "icd10",
  },
  {
    id: "icd3",
    name: "I10 - Essential (primary) hypertension",
    shortName: "Hypertension",
    labCompany: "ICD-10",
    sampleType: "N/A",
    category: "Cardiovascular Diagnoses",
    price: 0,
    turnaroundDays: 0,
    description: "Diagnosis code for essential primary hypertension.",
    popular: true,
    catalogType: "icd10",
  },
  {
    id: "icd4",
    name: "R00.0 - Tachycardia, unspecified",
    shortName: "Tachycardia",
    labCompany: "ICD-10",
    sampleType: "N/A",
    category: "Cardiovascular Diagnoses",
    price: 0,
    turnaroundDays: 0,
    description: "Diagnosis code for unspecified tachycardia.",
    catalogType: "icd10",
  },
  {
    id: "icd5",
    name: "E78.5 - Hyperlipidemia, unspecified",
    shortName: "Hyperlipidemia",
    labCompany: "ICD-10",
    sampleType: "N/A",
    category: "Metabolic Diagnoses",
    price: 0,
    turnaroundDays: 0,
    description: "Diagnosis code for unspecified hyperlipidemia.",
    popular: true,
    catalogType: "icd10",
  },
  {
    id: "icd6",
    name: "K21.0 - Gastro-esophageal reflux disease with esophagitis",
    shortName: "GERD",
    labCompany: "ICD-10",
    sampleType: "N/A",
    category: "GI Diagnoses",
    price: 0,
    turnaroundDays: 0,
    description: "Diagnosis code for GERD with esophagitis.",
    catalogType: "icd10",
  },
  {
    id: "icd7",
    name: "D50.9 - Iron deficiency anemia, unspecified",
    shortName: "Iron Deficiency Anemia",
    labCompany: "ICD-10",
    sampleType: "N/A",
    category: "Hematologic Diagnoses",
    price: 0,
    turnaroundDays: 0,
    description: "Diagnosis code for unspecified iron deficiency anemia.",
    catalogType: "icd10",
  },
  {
    id: "icd8",
    name: "E55.9 - Vitamin D deficiency, unspecified",
    shortName: "Vitamin D Deficiency",
    labCompany: "ICD-10",
    sampleType: "N/A",
    category: "Nutritional Diagnoses",
    price: 0,
    turnaroundDays: 0,
    description: "Diagnosis code for unspecified vitamin D deficiency.",
    popular: true,
    catalogType: "icd10",
  },
]

const getCatalogTypeIcon = (catalogType: string) => {
  switch (catalogType) {
    case "lab":
      return <FlaskConical className="h-4 w-4 text-blue-600" />
    case "pharma":
      return <Pill className="h-4 w-4 text-green-600" />
    case "procedure":
      return <Stethoscope className="h-4 w-4 text-red-600" />
    case "icd10":
      return <FileText className="h-4 w-4 text-amber-600" />
    default:
      return <FlaskConical className="h-4 w-4" />
  }
}

const getCatalogTypeBadgeColor = (catalogType: string) => {
  switch (catalogType) {
    case "lab":
      return "bg-blue-50 text-blue-700 border-blue-200"
    case "pharma":
      return "bg-green-50 text-green-700 border-green-200"
    case "procedure":
      return "bg-red-50 text-red-700 border-red-200"
    case "icd10":
      return "bg-amber-50 text-amber-700 border-amber-200"
    default:
      return "bg-gray-50 text-gray-700 border-gray-200"
  }
}

const getCatalogTypeLabel = (catalogType: string) => {
  switch (catalogType) {
    case "lab":
      return "Lab Test"
    case "pharma":
      return "Pharma"
    case "procedure":
      return "Procedure"
    case "icd10":
      return "ICD-10"
    default:
      return "Other"
  }
}

// Category icons mapping
const categoryIcons: Record<string, React.ReactNode> = {
  Thyroid: <FlaskConical className="h-4 w-4" />,
  Metabolic: <TestTube className="h-4 w-4" />,
  Cardiovascular: <FlaskConical className="h-4 w-4" />,
  "GI / Gut Health": <FlaskConical className="h-4 w-4" />,
  Hormones: <FlaskConical className="h-4 w-4" />,
  "Vitamins & Nutrients": <FlaskConical className="h-4 w-4" />,
  Hematology: <Droplets className="h-4 w-4" />,
  Liver: <FlaskConical className="h-4 w-4" />,
  "Allergy & Immunity": <FlaskConical className="h-4 w-4" />,
}

const categories = [...new Set(labTests.map((t) => t.category))]
const labCompanies = [...new Set(labTests.map((t) => t.labCompany))]
const sampleTypes = [...new Set(labTests.filter((t) => t.sampleType !== "N/A").map((t) => t.sampleType))]

const catalogTypes = [
  { value: "lab", label: "Lab Tests", icon: <FlaskConical className="h-4 w-4 text-blue-600" /> },
  { value: "pharma", label: "Pharma", icon: <Pill className="h-4 w-4 text-green-600" /> },
  { value: "procedure", label: "Procedures", icon: <Stethoscope className="h-4 w-4 text-red-600" /> },
  { value: "icd10", label: "ICD-10", icon: <FileText className="h-4 w-4 text-amber-600" /> },
]

type SortOption = "popular" | "price-low" | "price-high" | "name-asc" | "name-desc" | "turnaround"

export default function CatalogPage() {
  const { patients, setPatients, cartItems, setCartItems, orders, setOrders } = useApp()

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedLabCompanies, setSelectedLabCompanies] = useState<string[]>([])
  const [selectedSampleTypes, setSelectedSampleTypes] = useState<string[]>([])
  const [selectedCatalogTypes, setSelectedCatalogTypes] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<SortOption>("popular")

  // Compare state
  const [compareItems, setCompareItems] = useState<string[]>([])
  const [showCompareDialog, setShowCompareDialog] = useState(false)

  // Test detail state
  const [selectedTest, setSelectedTest] = useState<LabTest | null>(null)

  // Order panel state
  const [showOrderPanel, setShowOrderPanel] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [patientSearchQuery, setPatientSearchQuery] = useState("")
  const [showPatientSearch, setShowPatientSearch] = useState(false)
  const [showCreatePatient, setShowCreatePatient] = useState(false)
  const [orderNotes, setOrderNotes] = useState("")
  const [orderTimeframe, setOrderTimeframe] = useState("asap")

  // New patient form
  const [newPatientForm, setNewPatientForm] = useState({
    name: "",
    phone: "",
    dob: "",
    gender: "male",
  })

  const filteredTests = useMemo(() => {
    let result = [...labTests]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (test) =>
          test.name.toLowerCase().includes(query) ||
          test.shortName?.toLowerCase().includes(query) ||
          test.category.toLowerCase().includes(query) ||
          test.biomarkers?.some((b) => b.toLowerCase().includes(query)) ||
          test.description.toLowerCase().includes(query),
      )
    }

    // Catalog type filter
    if (selectedCatalogTypes.length > 0) {
      result = result.filter((test) => selectedCatalogTypes.includes(test.catalogType))
    }

    // Category filter
    if (selectedCategories.length > 0) {
      result = result.filter((test) => selectedCategories.includes(test.category))
    }

    // Lab company filter
    if (selectedLabCompanies.length > 0) {
      result = result.filter((test) => selectedLabCompanies.includes(test.labCompany))
    }

    // Sample type filter
    if (selectedSampleTypes.length > 0) {
      result = result.filter((test) => selectedSampleTypes.includes(test.sampleType))
    }

    const catalogTypeOrder: Record<string, number> = { lab: 0, pharma: 1, procedure: 2, icd10: 3 }

    switch (sortBy) {
      case "popular":
        result.sort((a, b) => {
          const typeCompare = (catalogTypeOrder[a.catalogType] ?? 4) - (catalogTypeOrder[b.catalogType] ?? 4)
          if (typeCompare !== 0) return typeCompare
          return (b.popular ? 1 : 0) - (a.popular ? 1 : 0)
        })
        break
      case "price-low":
        result.sort((a, b) => {
          const typeCompare = (catalogTypeOrder[a.catalogType] ?? 4) - (catalogTypeOrder[b.catalogType] ?? 4)
          if (typeCompare !== 0) return typeCompare
          return a.price - b.price
        })
        break
      case "price-high":
        result.sort((a, b) => {
          const typeCompare = (catalogTypeOrder[a.catalogType] ?? 4) - (catalogTypeOrder[b.catalogType] ?? 4)
          if (typeCompare !== 0) return typeCompare
          return b.price - a.price
        })
        break
      case "name-asc":
        result.sort((a, b) => {
          const typeCompare = (catalogTypeOrder[a.catalogType] ?? 4) - (catalogTypeOrder[b.catalogType] ?? 4)
          if (typeCompare !== 0) return typeCompare
          return a.name.localeCompare(b.name)
        })
        break
      case "name-desc":
        result.sort((a, b) => {
          const typeCompare = (catalogTypeOrder[a.catalogType] ?? 4) - (catalogTypeOrder[b.catalogType] ?? 4)
          if (typeCompare !== 0) return typeCompare
          return b.name.localeCompare(a.name)
        })
        break
      case "turnaround":
        result.sort((a, b) => {
          const typeCompare = (catalogTypeOrder[a.catalogType] ?? 4) - (catalogTypeOrder[b.catalogType] ?? 4)
          if (typeCompare !== 0) return typeCompare
          return a.turnaroundDays - b.turnaroundDays
        })
        break
    }

    return result
  }, [searchQuery, selectedCategories, selectedLabCompanies, selectedSampleTypes, selectedCatalogTypes, sortBy])

  const compareTestData = useMemo(() => {
    return labTests.filter((t) => compareItems.includes(t.id))
  }, [compareItems])

  // Filtered patients for search
  const filteredPatients = useMemo(() => {
    if (!patientSearchQuery) return patients
    const query = patientSearchQuery.toLowerCase()
    return patients.filter(
      (p) => p.name.toLowerCase().includes(query) || p.phone.includes(query) || p.id.toLowerCase().includes(query),
    )
  }, [patients, patientSearchQuery])

  const hasActiveFilters =
    selectedCategories.length > 0 ||
    selectedLabCompanies.length > 0 ||
    selectedSampleTypes.length > 0 ||
    selectedCatalogTypes.length > 0

  const clearFilters = () => {
    setSelectedCategories([])
    setSelectedLabCompanies([])
    setSelectedSampleTypes([])
    setSelectedCatalogTypes([])
    setSearchQuery("")
  }

  const toggleCompare = (testId: string) => {
    setCompareItems((prev) => {
      if (prev.includes(testId)) {
        return prev.filter((id) => id !== testId)
      }
      if (prev.length >= 4) {
        toast.error("Maximum 4 tests can be compared")
        return prev
      }
      return [...prev, testId]
    })
  }

  const handleAddToCart = (testName: string) => {
    if (!cartItems.includes(testName)) {
      setCartItems([...cartItems, testName])
      setShowOrderPanel(true) // Always open the panel when adding
      toast.success(`${testName} added to order`)
    }
  }

  const handleRemoveFromCart = (testName: string) => {
    setCartItems(cartItems.filter((item) => item !== testName))
    if (cartItems.length === 1) {
      setShowOrderPanel(false)
    }
  }

  const handleClearCart = () => {
    setCartItems([])
    setShowOrderPanel(false)
    setSelectedPatient(null)
  }

  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient)
    setShowPatientSearch(false)
    setPatientSearchQuery("")
  }

  const handleCreatePatient = () => {
    if (!newPatientForm.name || !newPatientForm.phone) {
      toast.error("Name and phone are required")
      return
    }

    const newPatient: Patient = {
      id: `PT-${Date.now()}`,
      name: newPatientForm.name.toUpperCase(),
      phone: newPatientForm.phone,
      dob: newPatientForm.dob || "",
      gender: newPatientForm.gender === "male" ? "Male" : "Female",
      examDate: new Date().toISOString().split("T")[0],
      patientStatus: "Waiting",
      paymentStatus: "Pending",
    }

    setPatients([...patients, newPatient])
    setSelectedPatient(newPatient)
    setShowCreatePatient(false)
    setNewPatientForm({ name: "", phone: "", dob: "", gender: "male" })
    toast.success("Patient created successfully")
  }

  const handlePlaceOrder = () => {
    if (!selectedPatient) {
      toast.error("Please select a patient")
      return
    }

    if (cartItems.length === 0) {
      toast.error("Please add tests to the order")
      return
    }

    const newOrder = {
      id: `ORD-${Date.now()}`,
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      tests: [...cartItems],
      date: new Date().toLocaleDateString(),
      status: "pending-payment",
      timeframe: orderTimeframe,
      notes: orderNotes,
    }

    setOrders([...orders, newOrder])

    toast.success("Order placed successfully", {
      description: `${cartItems.length} item(s) ordered for ${selectedPatient.name}. Ready for processing.`,
    })

    // Reset state
    setCartItems([])
    setSelectedPatient(null)
    setOrderNotes("")
    setOrderTimeframe("asap")
    setShowOrderPanel(false)
  }

  const getSampleTypeBadgeColor = (sampleType: string) => {
    switch (sampleType) {
      case "Serum":
        return "bg-red-50 text-red-700 border-red-200"
      case "Whole Blood":
        return "bg-rose-50 text-rose-700 border-rose-200"
      case "Stool":
        return "bg-amber-50 text-amber-700 border-amber-200"
      case "Urine":
        return "bg-yellow-50 text-yellow-700 border-yellow-200"
      case "Dried Urine":
        return "bg-orange-50 text-orange-700 border-orange-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  const calculateTotal = () => {
    return cartItems.reduce((total, itemName) => {
      const test = labTests.find((t) => t.name === itemName)
      return total + (test?.price || 0)
    }, 0)
  }

  const groupedTests = useMemo(() => {
    const groups: { type: string; label: string; tests: LabTest[] }[] = []
    // Updated type order to include icd10
    const typeOrder = ["lab", "pharma", "procedure", "icd10"]
    const typeLabels: Record<string, string> = {
      lab: "Lab Tests",
      pharma: "Pharma",
      procedure: "Procedures",
      icd10: "ICD-10 Codes",
    }

    typeOrder.forEach((type) => {
      const testsOfType = filteredTests.filter((t) => t.catalogType === type)
      if (testsOfType.length > 0) {
        groups.push({ type, label: typeLabels[type], tests: testsOfType })
      }
    })

    return groups
  }, [filteredTests])

  return (
    <div className="flex h-screen bg-background">
      {/* Main Catalog Area */}
      <div
        className={cn(
          "flex-1 flex flex-col overflow-hidden transition-all duration-300",
          showOrderPanel ? "mr-[420px]" : "",
        )}
      >
        {/* Header */}
        <div className="border-b bg-background">
          <div className="p-6 pb-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold">Catalog</h1>
                <p className="text-muted-foreground text-sm mt-1">
                  Search and order lab tests, medications, and procedures for your patients
                </p>
              </div>
              {cartItems.length > 0 && !showOrderPanel && (
                <Button onClick={() => setShowOrderPanel(true)} className="gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  View Order ({cartItems.length})
                </Button>
              )}
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tests, medications, procedures, or biomarkers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11"
              />
            </div>
          </div>

          {/* Filters Row */}
          <div className="px-6 pb-4 flex flex-wrap items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1.5 bg-transparent">
                  Type
                  {selectedCatalogTypes.length > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                      {selectedCatalogTypes.length}
                    </Badge>
                  )}
                  <ChevronDown className="h-3.5 w-3.5 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {catalogTypes.map((type) => (
                  <DropdownMenuCheckboxItem
                    key={type.value}
                    checked={selectedCatalogTypes.includes(type.value)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedCatalogTypes([...selectedCatalogTypes, type.value])
                      } else {
                        setSelectedCatalogTypes(selectedCatalogTypes.filter((t) => t !== type.value))
                      }
                    }}
                  >
                    <span className="flex items-center gap-2">
                      {type.icon}
                      {type.label}
                    </span>
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Category Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1.5 bg-transparent">
                  <FlaskConical className="h-3.5 w-3.5" />
                  Category
                  {selectedCategories.length > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                      {selectedCategories.length}
                    </Badge>
                  )}
                  <ChevronDown className="h-3.5 w-3.5 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {categories.map((category) => (
                  <DropdownMenuCheckboxItem
                    key={category}
                    checked={selectedCategories.includes(category)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedCategories([...selectedCategories, category])
                      } else {
                        setSelectedCategories(selectedCategories.filter((c) => c !== category))
                      }
                    }}
                  >
                    {category}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Lab Company Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1.5 bg-transparent">
                  Lab
                  {selectedLabCompanies.length > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                      {selectedLabCompanies.length}
                    </Badge>
                  )}
                  <ChevronDown className="h-3.5 w-3.5 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {labCompanies.map((lab) => (
                  <DropdownMenuCheckboxItem
                    key={lab}
                    checked={selectedLabCompanies.includes(lab)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedLabCompanies([...selectedLabCompanies, lab])
                      } else {
                        setSelectedLabCompanies(selectedLabCompanies.filter((l) => l !== lab))
                      }
                    }}
                  >
                    {lab}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Sample Type Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1.5 bg-transparent">
                  <Droplets className="h-3.5 w-3.5" />
                  Sample
                  {selectedSampleTypes.length > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                      {selectedSampleTypes.length}
                    </Badge>
                  )}
                  <ChevronDown className="h-3.5 w-3.5 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                {sampleTypes.map((type) => (
                  <DropdownMenuCheckboxItem
                    key={type}
                    checked={selectedSampleTypes.includes(type)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedSampleTypes([...selectedSampleTypes, type])
                      } else {
                        setSelectedSampleTypes(selectedSampleTypes.filter((t) => t !== type))
                      }
                    }}
                  >
                    {type}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Sort Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1.5 bg-transparent">
                  <ArrowUpDown className="h-3.5 w-3.5" />
                  Sort
                  <ChevronDown className="h-3.5 w-3.5 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuRadioGroup value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                  <DropdownMenuRadioItem value="popular">Most Popular</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="price-low">Price: Low to High</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="price-high">Price: High to Low</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="name-asc">Name: A to Z</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="name-desc">Name: Z to A</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="turnaround">Fastest Turnaround</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" className="h-8 text-muted-foreground" onClick={clearFilters}>
                <X className="h-3.5 w-3.5 mr-1" />
                Clear filters
              </Button>
            )}

            {/* Compare Button */}
            {compareItems.length > 0 && (
              <Button size="sm" className="h-8 ml-auto gap-1.5" onClick={() => setShowCompareDialog(true)}>
                <GitCompare className="h-3.5 w-3.5" />
                Compare ({compareItems.length})
              </Button>
            )}
          </div>
        </div>

        {/* Results Count */}
        <div className="px-6 py-2 border-b bg-muted/20 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {filteredTests.length} item{filteredTests.length !== 1 ? "s" : ""} found
          </span>
          {compareItems.length > 0 && (
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setCompareItems([])}>
              Clear comparison
            </Button>
          )}
        </div>

        {/* Test List with Section Headers */}
        <ScrollArea className="flex-1">
          <div>
            {groupedTests.map((group) => (
              <div key={group.type}>
                <div
                  className={cn(
                    "sticky top-0 z-10 px-6 py-2 border-b font-medium text-sm flex items-center gap-2",
                    group.type === "lab" && "bg-blue-50 text-blue-800 border-blue-100",
                    group.type === "pharma" && "bg-green-50 text-green-800 border-green-100",
                    group.type === "procedure" && "bg-red-50 text-red-800 border-red-100",
                    group.type === "icd10" && "bg-amber-50 text-amber-800 border-amber-100",
                  )}
                >
                  {getCatalogTypeIcon(group.type)}
                  {group.label}
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {group.tests.length}
                  </Badge>
                </div>
                <div className="divide-y">
                  {group.tests.map((test) => (
                    <div
                      key={test.id}
                      className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors group"
                    >
                      {/* Compare Checkbox */}
                      <Checkbox
                        checked={compareItems.includes(test.id)}
                        onCheckedChange={() => toggleCompare(test.id)}
                        className="data-[state=checked]:bg-primary"
                      />

                      {/* Type Icon */}
                      <div className="flex-shrink-0">{getCatalogTypeIcon(test.catalogType)}</div>

                      {/* Test Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <button
                            onClick={() => setSelectedTest(test)}
                            className="font-medium text-foreground hover:text-primary hover:underline text-left"
                          >
                            {test.name}
                          </button>
                          {test.popular && (
                            <Badge variant="secondary" className="text-xs">
                              Popular
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">{test.labCompany}</div>
                      </div>

                      {/* Sample Type (only for lab tests) */}
                      {test.catalogType === "lab" && (
                        <div className="hidden sm:block">
                          <Badge className={getSampleTypeBadgeColor(test.sampleType)} variant="outline">
                            {test.sampleType}
                          </Badge>
                          {test.requiresFasting && (
                            <div className="text-xs text-muted-foreground mt-1">Fasting required</div>
                          )}
                        </div>
                      )}

                      {/* Price */}
                      <div className="text-right min-w-[80px]">
                        <div className="font-semibold">${test.price}</div>
                        <div className="text-xs text-muted-foreground">{test.turnaroundDays}d turnaround</div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedTest(test)}>
                          <Info className="h-4 w-4" />
                          <span className="sr-only">View details</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 bg-transparent"
                          onClick={() => handleAddToCart(test.name)}
                          disabled={cartItems.includes(test.name)}
                        >
                          {cartItems.includes(test.name) ? (
                            <>
                              <Check className="h-3.5 w-3.5 mr-1.5" />
                              Added
                            </>
                          ) : (
                            <>
                              <Plus className="h-3.5 w-3.5 mr-1.5" />
                              Add
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {filteredTests.length === 0 && (
              <div className="p-12 text-center">
                <FlaskConical className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium mb-2">No items found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search or filters to find what you're looking for.
                </p>
                <Button variant="outline" onClick={clearFilters}>
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Right Order Panel */}
      {showOrderPanel && (
        <div className="fixed right-0 top-0 bottom-0 w-[420px] bg-background border-l shadow-lg flex flex-col z-50">
          {/* Panel Header */}
          <div className="p-4 border-b flex items-center justify-between bg-muted/30">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              <h2 className="font-semibold">New Order</h2>
              <Badge variant="secondary">{cartItems.length}</Badge>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setShowOrderPanel(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-4 space-y-6">
              {/* Patient Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Patient</Label>
                {selectedPatient ? (
                  <div className="p-3 border rounded-lg bg-muted/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">{selectedPatient.name}</div>
                          <div className="text-sm text-muted-foreground">{selectedPatient.phone}</div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setSelectedPatient(null)}>
                        Change
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {showPatientSearch ? (
                      <div className="space-y-2">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search by name, phone, or ID..."
                            value={patientSearchQuery}
                            onChange={(e) => setPatientSearchQuery(e.target.value)}
                            className="pl-10"
                            autoFocus
                          />
                        </div>
                        <div className="border rounded-lg max-h-48 overflow-y-auto">
                          {filteredPatients.length > 0 ? (
                            filteredPatients.map((patient) => (
                              <button
                                key={patient.id}
                                onClick={() => handleSelectPatient(patient)}
                                className="w-full p-3 text-left hover:bg-muted/50 flex items-center gap-3 border-b last:border-0"
                              >
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                  <User className="h-4 w-4 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium truncate">{patient.name}</div>
                                  <div className="text-xs text-muted-foreground">{patient.phone}</div>
                                </div>
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                              </button>
                            ))
                          ) : (
                            <div className="p-4 text-center text-sm text-muted-foreground">No patients found</div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 bg-transparent"
                            onClick={() => {
                              setShowPatientSearch(false)
                              setPatientSearchQuery("")
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 gap-1 bg-transparent"
                            onClick={() => {
                              setShowPatientSearch(false)
                              setShowCreatePatient(true)
                            }}
                          >
                            <UserPlus className="h-3.5 w-3.5" />
                            New Patient
                          </Button>
                        </div>
                      </div>
                    ) : showCreatePatient ? (
                      <div className="space-y-3 p-3 border rounded-lg bg-muted/20">
                        <div className="font-medium text-sm">Create New Patient</div>
                        <div className="space-y-2">
                          <Input
                            placeholder="Full Name *"
                            value={newPatientForm.name}
                            onChange={(e) => setNewPatientForm({ ...newPatientForm, name: e.target.value })}
                          />
                          <Input
                            placeholder="Phone Number *"
                            value={newPatientForm.phone}
                            onChange={(e) => setNewPatientForm({ ...newPatientForm, phone: e.target.value })}
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              type="date"
                              placeholder="Date of Birth"
                              value={newPatientForm.dob}
                              onChange={(e) => setNewPatientForm({ ...newPatientForm, dob: e.target.value })}
                            />
                            <Select
                              value={newPatientForm.gender}
                              onValueChange={(v) => setNewPatientForm({ ...newPatientForm, gender: v })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 bg-transparent"
                            onClick={() => {
                              setShowCreatePatient(false)
                              setNewPatientForm({ name: "", phone: "", dob: "", gender: "male" })
                            }}
                          >
                            Cancel
                          </Button>
                          <Button size="sm" className="flex-1" onClick={handleCreatePatient}>
                            Create Patient
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="flex-1 justify-start gap-2 bg-transparent"
                          onClick={() => setShowPatientSearch(true)}
                        >
                          <Search className="h-4 w-4" />
                          Search Patients
                        </Button>
                        <Button
                          variant="outline"
                          className="gap-2 bg-transparent"
                          onClick={() => setShowCreatePatient(true)}
                        >
                          <UserPlus className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <Separator />

              {/* Order Items - Grouped by type */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Order Items</Label>
                {cartItems.length > 0 ? (
                  <div className="space-y-4">
                    {/* Group cart items by catalog type */}
                    {["lab", "pharma", "procedure", "icd10"].map((type) => {
                      const itemsOfType = cartItems.filter((itemName) => {
                        const test = labTests.find((t) => t.name === itemName)
                        return test?.catalogType === type
                      })
                      if (itemsOfType.length === 0) return null
                      return (
                        <div key={type} className="space-y-2">
                          <div
                            className={cn(
                              "text-xs font-medium uppercase tracking-wide flex items-center gap-1.5",
                              type === "lab" && "text-blue-600",
                              type === "pharma" && "text-green-600",
                              type === "procedure" && "text-red-600",
                              type === "icd10" && "text-amber-600",
                            )}
                          >
                            {getCatalogTypeIcon(type)}
                            {getCatalogTypeLabel(type)}
                          </div>
                          <div className="space-y-2">
                            {itemsOfType.map((itemName) => {
                              const test = labTests.find((t) => t.name === itemName)
                              return (
                                <div
                                  key={itemName}
                                  className="flex items-center gap-3 p-2 border rounded-lg bg-muted/20"
                                >
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-sm truncate">{itemName}</div>
                                    <div className="text-xs text-muted-foreground">${test?.price || 0}</div>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                    onClick={() => handleRemoveFromCart(itemName)}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="p-4 border border-dashed rounded-lg text-center text-sm text-muted-foreground">
                    No items added yet
                  </div>
                )}
              </div>

              <Separator />

              {/* Timeframe */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Timeframe</Label>
                <Select value={orderTimeframe} onValueChange={setOrderTimeframe}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asap">ASAP</SelectItem>
                    <SelectItem value="within-week">Within 1 Week</SelectItem>
                    <SelectItem value="within-month">Within 1 Month</SelectItem>
                    <SelectItem value="routine">Routine / No Rush</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Notes */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Notes (Optional)</Label>
                <Textarea
                  placeholder="Add any special instructions or notes..."
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          </ScrollArea>

          {/* Panel Footer */}
          <div className="p-4 border-t bg-muted/30 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total</span>
              <span className="font-semibold text-lg">${calculateTotal()}</span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 bg-transparent" onClick={handleClearCart}>
                Clear All
              </Button>
              <Button
                className="flex-1"
                onClick={handlePlaceOrder}
                disabled={!selectedPatient || cartItems.length === 0}
              >
                Place Order
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Test Detail Dialog */}
      <Dialog open={!!selectedTest} onOpenChange={(open) => !open && setSelectedTest(null)}>
        <DialogContent className="max-w-2xl">
          {selectedTest && (
            <>
              <DialogHeader>
                <div className="flex items-start gap-3">
                  {getCatalogTypeIcon(selectedTest.catalogType)}
                  <div className="flex-1">
                    <DialogTitle className="text-xl">{selectedTest.name}</DialogTitle>
                    <DialogDescription className="mt-1">
                      {selectedTest.labCompany} • {selectedTest.category}
                    </DialogDescription>
                  </div>
                  <Badge className={getCatalogTypeBadgeColor(selectedTest.catalogType)} variant="outline">
                    {getCatalogTypeLabel(selectedTest.catalogType)}
                  </Badge>
                </div>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                <p className="text-muted-foreground">{selectedTest.description}</p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-3 bg-muted/30 rounded-lg text-center">
                    <div className="text-2xl font-bold">${selectedTest.price}</div>
                    <div className="text-xs text-muted-foreground">Price</div>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg text-center">
                    <div className="text-2xl font-bold">{selectedTest.turnaroundDays}</div>
                    <div className="text-xs text-muted-foreground">Days Turnaround</div>
                  </div>
                  {selectedTest.catalogType === "lab" && (
                    <>
                      <div className="p-3 bg-muted/30 rounded-lg text-center">
                        <div className="text-sm font-medium">{selectedTest.sampleType}</div>
                        <div className="text-xs text-muted-foreground">Sample Type</div>
                      </div>
                      <div className="p-3 bg-muted/30 rounded-lg text-center">
                        <div className="text-sm font-medium">{selectedTest.requiresFasting ? "Yes" : "No"}</div>
                        <div className="text-xs text-muted-foreground">Fasting Required</div>
                      </div>
                    </>
                  )}
                </div>

                {selectedTest.biomarkers && selectedTest.biomarkers.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Biomarkers Tested</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedTest.biomarkers.map((biomarker) => (
                        <Badge key={biomarker} variant="secondary">
                          {biomarker}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter className="mt-6">
                <Button variant="outline" onClick={() => setSelectedTest(null)}>
                  Close
                </Button>
                <Button
                  onClick={() => {
                    handleAddToCart(selectedTest.name)
                    setSelectedTest(null)
                  }}
                  disabled={cartItems.includes(selectedTest.name)}
                >
                  {cartItems.includes(selectedTest.name) ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Added to Order
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Add to Order
                    </>
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Compare Dialog */}
      <Dialog open={showCompareDialog} onOpenChange={setShowCompareDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Compare Items</DialogTitle>
            <DialogDescription>Side-by-side comparison of selected items</DialogDescription>
          </DialogHeader>

          {compareTestData.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 font-medium">Feature</th>
                    {compareTestData.map((test) => (
                      <th key={test.id} className="text-left p-2 font-medium min-w-[180px]">
                        <div className="flex items-center gap-2">
                          {getCatalogTypeIcon(test.catalogType)}
                          {test.shortName || test.name}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-2 text-muted-foreground">Type</td>
                    {compareTestData.map((test) => (
                      <td key={test.id} className="p-2">
                        <Badge className={getCatalogTypeBadgeColor(test.catalogType)} variant="outline">
                          {getCatalogTypeLabel(test.catalogType)}
                        </Badge>
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="p-2 text-muted-foreground">Price</td>
                    {compareTestData.map((test) => (
                      <td key={test.id} className="p-2 font-semibold">
                        ${test.price}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="p-2 text-muted-foreground">Lab/Provider</td>
                    {compareTestData.map((test) => (
                      <td key={test.id} className="p-2">
                        {test.labCompany}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="p-2 text-muted-foreground">Turnaround</td>
                    {compareTestData.map((test) => (
                      <td key={test.id} className="p-2">
                        {test.turnaroundDays} days
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="p-2 text-muted-foreground">Sample Type</td>
                    {compareTestData.map((test) => (
                      <td key={test.id} className="p-2">
                        {test.sampleType}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="p-2 text-muted-foreground">Fasting</td>
                    {compareTestData.map((test) => (
                      <td key={test.id} className="p-2">
                        {test.requiresFasting ? "Required" : "Not required"}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-2 text-muted-foreground align-top">Biomarkers</td>
                    {compareTestData.map((test) => (
                      <td key={test.id} className="p-2">
                        {test.biomarkers ? (
                          <div className="flex flex-wrap gap-1">
                            {test.biomarkers.slice(0, 5).map((b) => (
                              <Badge key={b} variant="secondary" className="text-xs">
                                {b}
                              </Badge>
                            ))}
                            {test.biomarkers.length > 5 && (
                              <Badge variant="outline" className="text-xs">
                                +{test.biomarkers.length - 5} more
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">N/A</span>
                        )}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCompareDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
