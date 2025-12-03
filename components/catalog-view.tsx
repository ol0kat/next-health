"use client"

import {
  X,
  FlaskConical,
  Stethoscope,
  Pill,
  FileText,
  Sparkles,
  Loader2,
  Check,
  MessageSquare,
  Smartphone,
  Plus,
  Clock,
  ShieldCheck,
  ClipboardList,
  HelpCircle,
  AlertCircle,
  Scissors,
  Building2,
  ThumbsUp,
  ThumbsDown,
  SkipForward,
  Search,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge" // Added Badge

interface LabTest {
  id: string
  name: string
  type: "test" | "procedure" | "medicine" | "diagnosis"
  price?: number
  bodySystem: string
  code?: string
}

interface MedicalHistory {
  maHoSo: string
  maCSKCB: string
  ngayVao: string
  ngayRa: string
  tenBenh: string
  tinhTrang: string
  kqDieuTri: string
  lyDoVV: string
}

interface AIRecommendation {
  id: string
  name: string
  reason: string
  type: "diagnosis" | "medicine" | "procedure" | "test"
  code?: string // For ICD-10 codes
  dosage?: string // For medicines
}

interface AISuggestedQuestion {
  id: string
  question: string
  category: "history" | "symptoms" | "lifestyle"
  quickReplies: Array<{ label: string; value: string }> // Add quick reply options for each question
}

interface AISuggestedTest {
  id: string
  name: string
  reason: string
  type: "test" | "procedure"
}

interface AIFollowUpTest {
  // New interface for follow-up tests generated after answering questions
  id: string
  name: string
  reason: string
  type: "test" | "procedure"
  triggeredBy: string // Question ID that triggered this suggestion
}

interface SurgicalRouting {
  facility: string
  department: string
  urgency: "routine" | "urgent" | "emergency"
}

interface CatalogViewProps {
  onAddToCart?: (testName: string) => void
  cartItems?: string[]
  onRemoveFromCart?: (index: number) => void
  onClearCart?: () => void
  onPlaceOrder?: (order: { tests: string[]; timeframe: string; notes: string }) => void
  prescriptions?: Array<{
    ma_don_thuoc: string
    ngay_gio_ke_don: string
    thong_tin_don_thuoc: any[]
    chan_doan: any[]
  }>
  onSubmitPrescription?: (data: {
    tests: string[]
    medicines: string[]
    diagnoses: Array<{ code: string; name: string }>
    procedures: string[]
    notes: string
    timeframe: string
    surgicalRouting?: SurgicalRouting // Added surgicalRouting to the type
  }) => void
  onClose?: () => void
  patientId?: string // Added patientId
  patientName?: string // Added patientName
}

const labTests: LabTest[] = [
  { id: "1", name: "TSH", type: "test", price: 450000, bodySystem: "Endocrine" },
  { id: "2", name: "TSH Receptor Ab", type: "test", price: 1200000, bodySystem: "Endocrine" },
  { id: "3", name: "Total T4 (TT4)", type: "test", price: 350000, bodySystem: "Metabolic" },
  { id: "4", name: "Free T4", type: "test", price: 350000, bodySystem: "Endocrine" },
  { id: "5", name: "Glucose", type: "test", price: 150000, bodySystem: "Metabolic" },
  { id: "6", name: "Vitamin D", type: "test", price: 550000, bodySystem: "Metabolic" },
  { id: "7", name: "ECG", type: "procedure", price: 1500000, bodySystem: "Cardiovascular" },
  { id: "8", name: "Ultrasound", type: "procedure", price: 3000000, bodySystem: "Imaging" },
  { id: "9", name: "Surgery Consultation", type: "procedure", price: 5000000, bodySystem: "General" },
  { id: "10", name: "X-Ray", type: "procedure", price: 1200000, bodySystem: "Imaging" },
  // Medicines
  { id: "11", name: "Levothyroxine 50mcg", type: "medicine", price: 150000, bodySystem: "Endocrine" },
  { id: "12", name: "Metformin 500mg", type: "medicine", price: 100000, bodySystem: "Metabolic" },
  { id: "13", name: "Lisinopril 10mg", type: "medicine", price: 120000, bodySystem: "Cardiovascular" },
  { id: "14", name: "Atorvastatin 20mg", type: "medicine", price: 200000, bodySystem: "Cardiovascular" },
  // ICD-10 Codes
  { id: "15", name: "E03.9 Hypothyroidism, unspecified", type: "diagnosis", code: "E03.9", bodySystem: "Endocrine" },
  { id: "16", name: "E11.9 Type 2 diabetes mellitus", type: "diagnosis", code: "E11.9", bodySystem: "Metabolic" },
  {
    id: "17",
    name: "I10 Essential (primary) hypertension",
    type: "diagnosis",
    code: "I10",
    bodySystem: "Cardiovascular",
  },
  { id: "18", name: "R00.0 Tachycardia, unspecified", type: "diagnosis", code: "R00.0", bodySystem: "Cardiovascular" },
  { id: "19", name: "Thyroidectomy", type: "procedure", price: 15000000, bodySystem: "Surgical" },
  { id: "20", name: "Biopsy - Fine Needle Aspiration", type: "procedure", price: 2500000, bodySystem: "Surgical" },
  { id: "21", name: "Laparoscopic Cholecystectomy", type: "procedure", price: 20000000, bodySystem: "Surgical" },
  { id: "22", name: "Colonoscopy", type: "procedure", price: 5000000, bodySystem: "Surgical" },
]

export function CatalogView({
  onAddToCart,
  cartItems = [],
  onRemoveFromCart,
  onClearCart,
  onPlaceOrder,
  prescriptions = [],
  onSubmitPrescription,
  onClose,
  patientId, // Added patientId
  patientName, // Added patientName
}: CatalogViewProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [timeframe, setTimeframe] = useState("3 months")
  const [notes, setNotes] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [analysisExplanation, setAnalysisExplanation] = useState("")

  const [insuranceType, setInsuranceType] = useState<"public" | "private">("public")
  const [insuranceStatus, setInsuranceStatus] = useState<"idle" | "verifying" | "verified" | "error">("idle")
  const [coverageDetails, setCoverageDetails] = useState<{ total: number; covered: number; patientPay: number } | null>(
    null,
  )
  const [isCheckingIn, setIsCheckingIn] = useState(false)
  const [bhytCheckedIn, setBhytCheckedIn] = useState(false)
  const [isCheckingHistory, setIsCheckingHistory] = useState(false)
  const [historyChecked, setHistoryChecked] = useState(false)
  const [medicalHistory, setMedicalHistory] = useState<MedicalHistory[]>([])

  // Consent Dialog State
  const [showConsentDialog, setShowConsentDialog] = useState(false)
  const [consentStep, setConsentStep] = useState<"initial" | "sending" | "waiting">("initial")

  const [isSubmitting, setIsSubmitting] = useState(false)

  // New state for timing per item and patient instructions
  const [itemTimings, setItemTimings] = useState<Record<string, string>>({})
  const [patientInstructions, setPatientInstructions] = useState("")
  const [followUpValue, setFollowUpValue] = useState("4")
  const [followUpUnit, setFollowUpUnit] = useState("weeks")
  const [diagnosisSearch, setDiagnosisSearch] = useState("")
  const [labSearch, setLabSearch] = useState("")
  const [rxSearch, setRxSearch] = useState("")
  const [procedureSearch, setProcedureSearch] = useState("")

  const [aiSuggestedQuestions, setAiSuggestedQuestions] = useState<AISuggestedQuestion[]>([])
  const [aiSuggestedTests, setAiSuggestedTests] = useState<AISuggestedTest[]>([])
  const [answeredQuestions, setAnsweredQuestions] = useState<Record<string, string>>({}) // Changed to Record to store the answer value
  const [isProcessingAnswer, setIsProcessingAnswer] = useState<string | null>(null) // Track which question is being processed
  const [aiFollowUpTests, setAiFollowUpTests] = useState<AIFollowUpTest[]>([]) // New state for follow-up tests from answers
  const [surgicalRouting, setSurgicalRouting] = useState<SurgicalRouting | null>(null) // State for surgical routing details
  const [showSurgicalRouting, setShowSurgicalRouting] = useState(false) // State to control visibility of surgical routing section

  const [aiRecommendedDiagnoses, setAiRecommendedDiagnoses] = useState<AIRecommendation[]>([])
  const [aiRecommendedMedicines, setAiRecommendedMedicines] = useState<AIRecommendation[]>([])
  const [aiRecommendedProcedures, setAiRecommendedProcedures] = useState<AIRecommendation[]>([])

  const [panelState, setPanelState] = useState<"idle" | "questions" | "recommendations">("idle")

  const [aiSuggestedDiagnoses] = useState([
    { code: "E03.9", name: "Hypothyroidism, unspecified" },
    { code: "E55.9", name: "Vitamin D Deficiency" },
    { code: "E78.5", name: "Hyperlipidemia, unspecified" },
  ])

  const [aiSuggestedOrders] = useState([
    { name: "Levothyroxine 50mcg", type: "medicine" as const },
    { name: "TSH w/ Reflex to T4", type: "test" as const },
    { name: "Lipid Panel", type: "test" as const },
  ])

  useEffect(() => {
    if (cartItems.length > 0) {
      setInsuranceStatus("idle")
      setCoverageDetails(null)
      // This ensures the check-in status persists when items are added via the rule engine.
    }
  }, [cartItems])

  useEffect(() => {
    const hasSurgicalProcedure = cartItems.some((item) => {
      const test = labTests.find((t) => t.name === item)
      return test?.bodySystem === "Surgical"
    })
    setShowSurgicalRouting(hasSurgicalProcedure)
  }, [cartItems])

  const calculateTotal = () => {
    return cartItems.reduce((total, itemName) => {
      const item = labTests.find((t) => t.name === itemName)
      return total + (item?.price || 0)
    }, 0)
  }

  const verifyInsurance = () => {
    setInsuranceStatus("verifying")

    setTimeout(() => {
      const total = calculateTotal()

      if (insuranceType === "public") {
        // Public BHYT - covers ~80% of approved items
        const covered = Math.floor(total * 0.8)
        const patientPay = total - covered

        setCoverageDetails({
          total,
          covered,
          patientPay,
        })
        setInsuranceStatus("verified")
        toast.success("BHYT Insurance Verified", {
          description: "State insurance coverage details have been updated.",
        })
      } else {
        // Private insurance - covers ~60% with limits
        const covered = Math.floor(total * 0.6)
        const patientPay = total - covered

        setCoverageDetails({
          total,
          covered,
          patientPay,
        })
        setInsuranceStatus("verified")
        toast.success("Private Insurance Verified", {
          description: "Coverage details have been updated. Check remaining limits.",
        })
      }
    }, 1500)
  }

  const filteredLabTests = labTests.filter((test) => {
    if (!labSearch) return false
    return test.type === "test" && test.name.toLowerCase().includes(labSearch.toLowerCase())
  })

  const filteredDiagnoses = labTests.filter((test) => {
    if (!diagnosisSearch) return false
    return (
      test.type === "diagnosis" &&
      (test.name.toLowerCase().includes(diagnosisSearch.toLowerCase()) ||
        (test.code && test.code.toLowerCase().includes(diagnosisSearch.toLowerCase())))
    )
  })

  const filteredMedicines = labTests.filter((test) => {
    if (!rxSearch) return false
    return test.type === "medicine" && test.name.toLowerCase().includes(rxSearch.toLowerCase())
  })

  const filteredProcedures = labTests.filter((test) => {
    if (!procedureSearch) return false
    return test.type === "procedure" && test.name.toLowerCase().includes(procedureSearch.toLowerCase())
  })

  const handleAddFromSearch = (item: LabTest) => {
    if (!cartItems.includes(item.name)) {
      onAddToCart?.(item.name)
      toast.success(`${item.type.charAt(0).toUpperCase() + item.type.slice(1)} added`, {
        description: item.name,
      })
    }
    // Clear search after adding
    if (item.type === "test") setLabSearch("")
    if (item.type === "diagnosis") setDiagnosisSearch("")
    if (item.type === "medicine") setRxSearch("")
    if (item.type === "procedure") setProcedureSearch("")
  }

  const filteredTests = labTests.filter((test) => {
    if (!searchQuery) return false
    return (
      test.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (test.code && test.code.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  })

  const groupedResults = filteredTests.reduce(
    (acc, test) => {
      const type = test.type
      if (!acc[type]) acc[type] = []
      acc[type].push(test)
      return acc
    },
    {} as Record<string, LabTest[]>,
  )

  const groupedCartItems = cartItems.reduce(
    (acc, itemName) => {
      const test = labTests.find((t) => t.name === itemName)
      const type = test ? test.type : "other"
      if (!acc[type]) acc[type] = []
      acc[type].push(itemName)
      return acc
    },
    {} as Record<string, string[]>,
  )

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "test":
        return { label: "Lab Tests", icon: FlaskConical }
      case "procedure":
        return { label: "Procedures", icon: Stethoscope }
      case "medicine":
        return { label: "Medicines", icon: Pill }
      case "diagnosis":
        return { label: "ICD-10 Codes", icon: FileText }
      default:
        return { label: "Other", icon: FileText }
    }
  }

  // Grouped items within the cart (used for displaying added items)
  const groupedItems = {
    tests: cartItems.filter((item) => labTests.find((t) => t.name === item && t.type === "test")),
    procedures: cartItems.filter((item) => labTests.find((t) => t.name === item && t.type === "procedure")),
    medicines: cartItems.filter((item) => labTests.find((t) => t.name === item && t.type === "medicine")),
    diagnoses: cartItems.filter((item) => labTests.find((t) => t.name === item && t.type === "diagnosis")),
  }

  const setItemTiming = (itemName: string, timing: string) => {
    setItemTimings((prev) => ({ ...prev, [itemName]: timing }))
  }

  const isDiagnosisAdded = (code: string) => {
    return cartItems.some((item) => {
      const test = labTests.find((t) => t.name === item)
      return test?.code === code
    })
  }

  const isOrderAdded = (name: string) => cartItems.includes(name)

  const getContextualSuggestions = () => {
    const addedDiagnoses = groupedItems.diagnoses
    if (addedDiagnoses.length === 0) return []

    // Return suggestions that aren't already added
    return aiSuggestedOrders.filter((order) => !isOrderAdded(order.name))
  }

  const contextualSuggestions = getContextualSuggestions()

  const handleSchedule = () => {
    if (cartItems.length === 0) return

    setIsSubmitting(true)

    // Simulate API push delay
    setTimeout(() => {
      // Categorize items
      const tests = cartItems.filter((item) => labTests.find((t) => t.name === item && t.type === "test"))
      const procedures = cartItems.filter((item) => labTests.find((t) => t.name === item && t.type === "procedure"))
      const medicines = cartItems.filter((item) => labTests.find((t) => t.name === item && t.type === "medicine"))
      const diagnoses = cartItems
        .filter((item) => labTests.find((t) => t.name === item && t.type === "diagnosis"))
        .map((item) => {
          const dx = labTests.find((t) => t.name === item)
          return {
            code: dx?.code || "",
            name: dx?.name || item,
          }
        })

      onSubmitPrescription?.({
        tests,
        medicines,
        diagnoses,
        procedures,
        notes: patientInstructions || notes, // Use patientInstructions if available, otherwise use general notes
        timeframe,
        surgicalRouting: surgicalRouting || undefined, // Pass undefined if no surgical routing is selected
      })

      setIsSubmitting(false)

      toast.success("Order Created Successfully", {
        description: "Orders have been signed and sent. View them under Scheduled Orders.",
      })

      // Clear the cart but keep the panel open. The user can close it manually.
      onClearCart?.()
      // Reset panel state after successful scheduling
      setPanelState("idle")
    }, 1500)
  }

  const runRuleEngine = () => {
    setIsAnalyzing(true)
    setShowSuggestions(false)
    setAnalysisExplanation("")
    setAiSuggestedQuestions([]) // Clear previous questions
    setAiSuggestedTests([]) // Clear previous tests
    setAiFollowUpTests([]) // Clear follow-up tests
    setAnsweredQuestions({}) // Clear answered questions
    setAiRecommendedDiagnoses([])
    setAiRecommendedMedicines([])
    setAiRecommendedProcedures([])

    // Simulate longer AI analysis delay (4.25s)
    setTimeout(() => {
      setIsAnalyzing(false)
      setShowSuggestions(true)
      setPanelState("questions")

      setAiSuggestedQuestions([
        {
          id: "q1",
          question: "Has the patient experienced any recent weight changes (gain or loss)?",
          category: "symptoms",
          quickReplies: [
            { label: "Weight Gain", value: "gain" },
            { label: "Weight Loss", value: "loss" },
            { label: "No Change", value: "none" },
          ],
        },
        {
          id: "q2",
          question: "Is there a family history of thyroid disorders?",
          category: "history",
          quickReplies: [
            { label: "Yes", value: "yes" },
            { label: "No", value: "no" },
            { label: "Unknown", value: "unknown" },
          ],
        },
        {
          id: "q3",
          question: "Has the patient noticed any neck swelling or difficulty swallowing?",
          category: "symptoms",
          quickReplies: [
            { label: "Yes", value: "yes" },
            { label: "No", value: "no" },
          ],
        },
        {
          id: "q4",
          question: "Is the patient currently taking any thyroid medication or supplements?",
          category: "history",
          quickReplies: [
            { label: "Yes", value: "yes" },
            { label: "No", value: "no" },
            { label: "Unsure", value: "unsure" },
          ],
        },
      ])

      // setAiSuggestedTests, setAiRecommendedDiagnoses, etc. are set when transitioning to recommendations state

      toast.success("Clinical Analysis Complete", {
        description: "Please answer the follow-up questions to refine recommendations.",
      })
    }, 4250)
  }

  const handleSkipQuestions = () => {
    setPanelState("recommendations")

    // Set default recommendations when skipping questions
    setAiSuggestedTests([
      {
        id: "t1",
        name: "Thyroid Ultrasound",
        reason: "To evaluate thyroid gland structure and detect nodules",
        type: "procedure",
      },
      {
        id: "t2",
        name: "Thyroid Peroxidase Antibodies (TPO)",
        reason: "To confirm autoimmune thyroiditis (Hashimoto's)",
        type: "test",
      },
    ])

    setAiRecommendedDiagnoses([
      {
        id: "dx-init-1",
        name: "E03.9 Hypothyroidism, unspecified",
        code: "E03.9",
        reason: "TSH elevated at 8.5 mIU/L consistent with primary hypothyroidism",
        type: "diagnosis",
      },
    ])

    setAiRecommendedMedicines([
      {
        id: "rx-init-1",
        name: "Levothyroxine 50mcg",
        dosage: "50mcg once daily in the morning",
        reason: "First-line treatment for hypothyroidism; start low and titrate",
        type: "medicine",
      },
    ])

    toast.info("Questions Skipped", {
      description: "Showing general recommendations. Answer questions for more personalized suggestions.",
    })
  }

  const allQuestionsAnswered =
    aiSuggestedQuestions.length > 0 && aiSuggestedQuestions.every((q) => answeredQuestions[q.id] !== undefined)

  useEffect(() => {
    if (allQuestionsAnswered && panelState === "questions") {
      // Small delay before transitioning to show the final answered state
      const timer = setTimeout(() => {
        setPanelState("recommendations")

        // Add baseline recommendations if not already added via answers
        if (aiSuggestedTests.length === 0) {
          setAiSuggestedTests([
            {
              id: "t1",
              name: "Thyroid Ultrasound",
              reason: "To evaluate thyroid gland structure and detect nodules",
              type: "procedure",
            },
            {
              id: "t2",
              name: "Thyroid Peroxidase Antibodies (TPO)",
              reason: "To confirm autoimmune thyroiditis (Hashimoto's)",
              type: "test",
            },
          ])
        }

        if (aiRecommendedDiagnoses.length === 0) {
          setAiRecommendedDiagnoses([
            {
              id: "dx-init-1",
              name: "E03.9 Hypothyroidism, unspecified",
              code: "E03.9",
              reason: "TSH elevated at 8.5 mIU/L consistent with primary hypothyroidism",
              type: "diagnosis",
            },
          ])
        }

        if (aiRecommendedMedicines.length === 0) {
          setAiRecommendedMedicines([
            {
              id: "rx-init-1",
              name: "Levothyroxine 50mcg",
              dosage: "50mcg once daily in the morning",
              reason: "First-line treatment for hypothyroidism; start low and titrate",
              type: "medicine",
            },
          ])
        }

        toast.success("All Questions Answered", {
          description: "AI recommendations are now available.",
        })
      }, 800)

      return () => clearTimeout(timer)
    }
  }, [
    allQuestionsAnswered,
    panelState,
    aiSuggestedTests.length,
    aiRecommendedDiagnoses.length,
    aiRecommendedMedicines.length,
  ])

  const suggestedItems = ["E03.9 Hypothyroidism, unspecified", "TSH", "Free T4", "Total T4 (TT4)"]

  const handleAddSuggestion = (itemName: string) => {
    if (!cartItems.includes(itemName)) {
      onAddToCart?.(itemName)
    }
  }

  const handleAddAllSuggestions = () => {
    suggestedItems.forEach((item) => {
      if (!cartItems.includes(item)) {
        onAddToCart?.(item)
      }
    })
    toast.success("Protocol Added", { description: "All suggested items have been added to the order." })
  }

  const handleSendConsentRequest = () => {
    setConsentStep("sending")
    // Simulate sending SMS delay
    setTimeout(() => {
      setConsentStep("waiting")
      // Simulate waiting for patient response delay
      setTimeout(() => {
        setConsentStep("initial")
        setShowConsentDialog(false)
        toast.success("Patient Consent Granted", {
          description: "Access to medical history has been authorized.",
        })
      }, 3000)
    }, 2000)
  }

  const handleQuickReply = (questionId: string, answer: string) => {
    setIsProcessingAnswer(questionId)
    setAnsweredQuestions((prev) => ({ ...prev, [questionId]: answer }))

    // Simulate AI reasoning delay
    setTimeout(() => {
      setIsProcessingAnswer(null)

      const newFollowUpTests: AIFollowUpTest[] = []
      const newDiagnoses: AIRecommendation[] = []
      const newMedicines: AIRecommendation[] = []
      const newProcedures: AIRecommendation[] = []

      if (questionId === "q1") {
        if (answer === "gain") {
          newFollowUpTests.push({
            id: `fu-${Date.now()}-1`,
            name: "Lipid Panel",
            reason: "Weight gain with hypothyroidism may affect cholesterol levels",
            type: "test",
            triggeredBy: questionId,
          })
          newFollowUpTests.push({
            id: `fu-${Date.now()}-2`,
            name: "HbA1c",
            reason: "Screen for metabolic syndrome associated with weight gain",
            type: "test",
            triggeredBy: questionId,
          })
          newDiagnoses.push({
            id: `dx-${Date.now()}-1`,
            name: "E66.9 Obesity, unspecified",
            code: "E66.9",
            reason: "Weight gain may indicate obesity requiring formal diagnosis",
            type: "diagnosis",
          })
          newMedicines.push({
            id: `rx-${Date.now()}-1`,
            name: "Metformin 500mg",
            dosage: "500mg twice daily",
            reason: "May help with metabolic regulation and weight management",
            type: "medicine",
          })
        } else if (answer === "loss") {
          newFollowUpTests.push({
            id: `fu-${Date.now()}-1`,
            name: "T3 (Triiodothyronine)",
            reason: "Unexplained weight loss may indicate hyperthyroid state",
            type: "test",
            triggeredBy: questionId,
          })
          newDiagnoses.push({
            id: `dx-${Date.now()}-1`,
            name: "E05.90 Thyrotoxicosis, unspecified",
            code: "E05.90",
            reason: "Weight loss with thyroid abnormalities suggests hyperthyroidism",
            type: "diagnosis",
          })
          newMedicines.push({
            id: `rx-${Date.now()}-1`,
            name: "Methimazole 10mg",
            dosage: "10mg once daily",
            reason: "First-line treatment for hyperthyroidism",
            type: "medicine",
          })
        }
      } else if (questionId === "q2" && answer === "yes") {
        newFollowUpTests.push({
          id: `fu-${Date.now()}-1`,
          name: "Thyroglobulin Antibodies (TgAb)",
          reason: "Family history suggests genetic predisposition to autoimmune thyroid disease",
          type: "test",
          triggeredBy: questionId,
        })
        newDiagnoses.push({
          id: `dx-${Date.now()}-1`,
          name: "E06.3 Autoimmune thyroiditis",
          code: "E06.3",
          reason: "Family history increases likelihood of Hashimoto's thyroiditis",
          type: "diagnosis",
        })
      } else if (questionId === "q3" && answer === "yes") {
        newFollowUpTests.push({
          id: `fu-${Date.now()}-1`,
          name: "Thyroid Ultrasound",
          reason: "Neck swelling requires imaging to rule out goiter or nodules",
          type: "procedure",
          triggeredBy: questionId,
        })
        newFollowUpTests.push({
          id: `fu-${Date.now()}-2`,
          name: "Fine Needle Aspiration Biopsy",
          reason: "If nodules detected, may need cytology evaluation",
          type: "procedure",
          triggeredBy: questionId,
        })
        newProcedures.push({
          id: `proc-${Date.now()}-1`,
          name: "Thyroidectomy Consultation",
          reason: "Surgical evaluation if nodules are suspicious",
          type: "procedure",
        })
        newDiagnoses.push({
          id: `dx-${Date.now()}-1`,
          name: "E04.9 Nontoxic goiter, unspecified",
          code: "E04.9",
          reason: "Neck swelling consistent with thyroid enlargement",
          type: "diagnosis",
        })
      } else if (questionId === "q4" && answer === "yes") {
        newFollowUpTests.push({
          id: `fu-${Date.now()}-1`,
          name: "Medication Review",
          reason: "Current thyroid medication may need dose adjustment based on TSH levels",
          type: "procedure",
          triggeredBy: questionId,
        })
        newMedicines.push({
          id: `rx-${Date.now()}-1`,
          name: "Levothyroxine 75mcg",
          dosage: "Adjust from current dose",
          reason: "TSH levels suggest dose titration may be needed",
          type: "medicine",
        })
      }

      // Add all new recommendations to state
      if (newFollowUpTests.length > 0) {
        setAiFollowUpTests((prev) => [...prev, ...newFollowUpTests])
      }
      if (newDiagnoses.length > 0) {
        setAiRecommendedDiagnoses((prev) => [...prev, ...newDiagnoses])
      }
      if (newMedicines.length > 0) {
        setAiRecommendedMedicines((prev) => [...prev, ...newMedicines])
      }
      if (newProcedures.length > 0) {
        setAiRecommendedProcedures((prev) => [...prev, ...newProcedures])
      }

      const totalNew = newFollowUpTests.length + newDiagnoses.length + newMedicines.length + newProcedures.length
      if (totalNew > 0) {
        toast.success("AI Analysis Updated", {
          description: `Based on response, ${totalNew} recommendation(s) added.`,
        })
      } else {
        toast.info("Response Recorded", {
          description: "No additional recommendations for this response.",
        })
      }
    }, 1500)
  }

  const handleAddRecommendation = (rec: AIRecommendation) => {
    const itemName = rec.type === "diagnosis" ? rec.name : rec.name
    if (!cartItems.includes(itemName)) {
      onAddToCart?.(itemName)
      toast.success(`${rec.type.charAt(0).toUpperCase() + rec.type.slice(1)} added`, { description: rec.name })
    }
  }

  const handleAddFollowUpTest = (test: AIFollowUpTest) => {
    if (!cartItems.includes(test.name)) {
      onAddToCart?.(test.name)
      toast.success("Test added", { description: test.name })
    }
  }

  // Removed the old handleQuestionAsked function as it's replaced by handleQuickReply

  const handleAddSuggestedTest = (test: AISuggestedTest) => {
    if (!cartItems.includes(test.name)) {
      onAddToCart?.(test.name)
      toast.success("Test added", { description: test.name })
    }
  }

  return (
    <div className="flex flex-col h-full bg-background border-l w-[400px]">
      <div className="flex-1 overflow-y-auto">
        {/* Section 1: AI Clinical Assistant Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-white">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="flex-1 space-y-2">
              <h2 className="font-semibold">AI Clinical Assistant</h2>
              <p className="text-sm text-white/80">
                {panelState === "idle" && "Click below to analyze patient data and generate recommendations."}
                {panelState === "questions" &&
                  "Please answer the follow-up questions for personalized recommendations."}
                {panelState === "recommendations" && "Review AI recommendations and add to your order."}
              </p>
              {panelState === "idle" && (
                <Button
                  onClick={runRuleEngine}
                  disabled={isAnalyzing}
                  size="sm"
                  className="bg-white text-indigo-700 hover:bg-white/90 w-full"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Auto-Draft Assessment & Plan
                    </>
                  )}
                </Button>
              )}
              {isAnalyzing && (
                <div className="flex items-center gap-2 text-sm text-white/80">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing patient data...
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {panelState === "idle" && !isAnalyzing && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-16 w-16 rounded-full bg-indigo-50 flex items-center justify-center mb-4">
                <Sparkles className="h-8 w-8 text-indigo-400" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Ready for AI Analysis</h3>
              <p className="text-sm text-muted-foreground max-w-[280px]">
                Click "Auto-Draft Assessment & Plan" above to analyze patient data and get AI-powered clinical
                recommendations.
              </p>
            </div>
          )}

          {panelState === "questions" && aiSuggestedQuestions.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HelpCircle className="h-4 w-4 text-amber-600" />
                  <h3 className="font-semibold text-sm">Suggested Follow-up Questions</h3>
                  <Badge variant="secondary" className="text-xs">
                    AI
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-muted-foreground hover:text-foreground"
                  onClick={handleSkipQuestions}
                >
                  <SkipForward className="h-3 w-3 mr-1" />
                  Skip
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">
                Ask the patient these questions for more accurate recommendations, or skip to see general suggestions.
              </p>

              <div className="space-y-2">
                {aiSuggestedQuestions.map((q) => {
                  const isAnswered = answeredQuestions[q.id] !== undefined
                  const isProcessing = isProcessingAnswer === q.id
                  const answer = answeredQuestions[q.id]

                  return (
                    <div
                      key={q.id}
                      className={`p-3 rounded-lg border transition-colors ${
                        isAnswered ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="text-sm">{q.question}</p>
                            <Badge variant="outline" className="mt-1 text-xs capitalize">
                              {q.category}
                            </Badge>
                          </div>
                          {isAnswered && <Check className="h-4 w-4 text-green-600 shrink-0" />}
                        </div>

                        {!isAnswered && !isProcessing && (
                          <div className="flex flex-wrap gap-2 pt-1">
                            {q.quickReplies.map((reply) => (
                              <Button
                                key={reply.value}
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs bg-white hover:bg-amber-100 hover:border-amber-400"
                                onClick={() => handleQuickReply(q.id, reply.value)}
                              >
                                {reply.value === "yes" && <ThumbsUp className="h-3 w-3 mr-1" />}
                                {reply.value === "no" && <ThumbsDown className="h-3 w-3 mr-1" />}
                                {reply.label}
                              </Button>
                            ))}
                          </div>
                        )}

                        {isProcessing && (
                          <div className="flex items-center gap-2 pt-1 text-sm text-muted-foreground">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            AI analyzing response...
                          </div>
                        )}

                        {isAnswered && !isProcessing && (
                          <div className="pt-1">
                            <Badge variant="secondary" className="text-xs">
                              Answered: {q.quickReplies.find((r) => r.value === answer)?.label || answer}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="pt-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>Progress</span>
                  <span>
                    {Object.keys(answeredQuestions).length} / {aiSuggestedQuestions.length} answered
                  </span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-green-500 transition-all duration-300"
                    style={{ width: `${(Object.keys(answeredQuestions).length / aiSuggestedQuestions.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {panelState === "recommendations" && (
            <>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <FlaskConical className="h-4 w-4 text-blue-600" />
                  <h3 className="font-semibold text-sm">Lab Tests</h3>
                </div>

                {/* Lab Search */}
                <div className="relative">
                  <input
                    type="text"
                    value={labSearch}
                    onChange={(e) => setLabSearch(e.target.value)}
                    placeholder="Search Lab Tests..."
                    className="w-full rounded-lg border border-slate-200 p-2.5 pl-9 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                </div>

                {/* Lab Search Results */}
                {labSearch && filteredLabTests.length > 0 && (
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {filteredLabTests.map((test) => (
                      <div
                        key={test.id}
                        className={`p-3 rounded-lg border transition-colors ${
                          isOrderAdded(test.name)
                            ? "bg-blue-50 border-blue-200"
                            : "bg-slate-50 border-slate-200 hover:border-blue-300"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <FlaskConical className="h-3.5 w-3.5 text-blue-600" />
                              <p className="text-sm font-medium">{test.name}</p>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">{test.bodySystem}</p>
                          </div>
                          {isOrderAdded(test.name) ? (
                            <Check className="h-4 w-4 text-blue-600 shrink-0" />
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs shrink-0 bg-transparent hover:bg-blue-50 hover:border-blue-300"
                              onClick={() => handleAddFromSearch(test)}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Add
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {labSearch && filteredLabTests.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-2">No lab tests found for "{labSearch}"</p>
                )}

                {/* Suggested Additional Testing - includes AI recommendations and added items */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-3.5 w-3.5 text-blue-600" />
                    <span className="text-xs font-medium text-blue-700">Suggested Additional Testing</span>
                    <Badge variant="secondary" className="text-xs">
                      AI
                    </Badge>
                  </div>

                  {/* AI Follow-up Tests */}
                  {aiFollowUpTests
                    .filter((t) => t.type === "test")
                    .map((test) => (
                      <div
                        key={test.id}
                        className={`p-3 rounded-lg border transition-colors ${
                          isOrderAdded(test.name)
                            ? "bg-blue-50 border-blue-200"
                            : "bg-slate-50 border-slate-200 hover:border-blue-300"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <FlaskConical className="h-3.5 w-3.5 text-blue-600" />
                              <p className="text-sm font-medium">{test.name}</p>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">{test.reason}</p>
                          </div>
                          {isOrderAdded(test.name) ? (
                            <div className="flex items-center gap-2">
                              <Check className="h-4 w-4 text-blue-600 shrink-0" />
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-slate-400 hover:text-red-500"
                                onClick={() => {
                                  const originalIndex = cartItems.indexOf(test.name)
                                  if (originalIndex !== -1) onRemoveFromCart?.(originalIndex)
                                }}
                              >
                                <X className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs shrink-0 bg-transparent hover:bg-blue-50 hover:border-blue-300"
                              onClick={() => handleAddFollowUpTest(test)}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Add
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}

                  {/* AI Suggested Tests */}
                  {aiSuggestedTests.map((test) => (
                    <div
                      key={test.id}
                      className={`p-3 rounded-lg border transition-colors ${
                        isOrderAdded(test.name)
                          ? "bg-blue-50 border-blue-200"
                          : "bg-slate-50 border-slate-200 hover:border-blue-300"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            {test.type === "test" ? (
                              <FlaskConical className="h-3.5 w-3.5 text-blue-600" />
                            ) : (
                              <Stethoscope className="h-3.5 w-3.5 text-blue-600" />
                            )}
                            <p className="text-sm font-medium">{test.name}</p>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{test.reason}</p>
                        </div>
                        {isOrderAdded(test.name) ? (
                          <div className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-blue-600 shrink-0" />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-slate-400 hover:text-red-500"
                              onClick={() => {
                                const originalIndex = cartItems.indexOf(test.name)
                                if (originalIndex !== -1) onRemoveFromCart?.(originalIndex)
                              }}
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs shrink-0 bg-transparent hover:bg-blue-50 hover:border-blue-300"
                            onClick={() => handleAddSuggestedTest(test)}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}

                  {groupedItems.tests
                    .filter(
                      (item) =>
                        !aiSuggestedTests.some((t) => t.name === item) && !aiFollowUpTests.some((t) => t.name === item),
                    )
                    .map((item, idx) => (
                      <div key={idx} className="p-3 rounded-lg border bg-blue-50 border-blue-200">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <FlaskConical className="h-3.5 w-3.5 text-blue-600" />
                              <p className="text-sm font-medium">{item}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-blue-600 shrink-0" />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-slate-400 hover:text-red-500"
                              onClick={() => {
                                const originalIndex = cartItems.indexOf(item)
                                if (originalIndex !== -1) onRemoveFromCart?.(originalIndex)
                              }}
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}

                  {aiSuggestedTests.length === 0 &&
                    aiFollowUpTests.filter((t) => t.type === "test").length === 0 &&
                    groupedItems.tests.length === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-2">
                        No lab tests suggested yet. Use search above or answer questions for recommendations.
                      </p>
                    )}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-amber-600" />
                  <h3 className="font-semibold text-sm">Assessment / Diagnoses</h3>
                </div>

                {/* Diagnosis Search */}
                <div className="relative">
                  <input
                    type="text"
                    value={diagnosisSearch}
                    onChange={(e) => setDiagnosisSearch(e.target.value)}
                    placeholder="Search ICD-10 or Diagnosis..."
                    className="w-full rounded-lg border border-slate-200 p-2.5 pl-9 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                </div>

                {/* Diagnosis Search Results */}
                {diagnosisSearch && filteredDiagnoses.length > 0 && (
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {filteredDiagnoses.map((test) => (
                      <div
                        key={test.id}
                        className={`p-3 rounded-lg border transition-colors ${
                          isOrderAdded(test.name)
                            ? "bg-amber-50 border-amber-200"
                            : "bg-slate-50 border-slate-200 hover:border-amber-300"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <ClipboardList className="h-3.5 w-3.5 text-amber-600" />
                              <p className="text-sm font-medium">{test.name}</p>
                            </div>
                            {test.code && (
                              <Badge variant="outline" className="mt-1 text-xs">
                                ICD-10: {test.code}
                              </Badge>
                            )}
                          </div>
                          {isOrderAdded(test.name) ? (
                            <Check className="h-4 w-4 text-amber-600 shrink-0" />
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs shrink-0 bg-transparent hover:bg-amber-50 hover:border-amber-300"
                              onClick={() => handleAddFromSearch(test)}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Add
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {diagnosisSearch && filteredDiagnoses.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-2">
                    No diagnoses found for "{diagnosisSearch}"
                  </p>
                )}

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                    <span className="text-xs font-medium text-amber-700">AI-Recommended Diagnoses</span>
                    <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-700">
                      AI
                    </Badge>
                  </div>

                  {aiRecommendedDiagnoses.map((rec) => (
                    <div
                      key={rec.id}
                      className={`p-3 rounded-lg border transition-colors ${
                        isOrderAdded(rec.name)
                          ? "bg-amber-50 border-amber-200"
                          : "bg-slate-50 border-slate-200 hover:border-amber-300"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <ClipboardList className="h-3.5 w-3.5 text-amber-600" />
                            <p className="text-sm font-medium">{rec.name}</p>
                          </div>
                          {rec.code && (
                            <Badge variant="outline" className="mt-1 text-xs">
                              ICD-10: {rec.code}
                            </Badge>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">{rec.reason}</p>
                        </div>
                        {isOrderAdded(rec.name) ? (
                          <div className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-amber-600 shrink-0" />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-slate-400 hover:text-red-500"
                              onClick={() => {
                                const originalIndex = cartItems.indexOf(rec.name)
                                if (originalIndex !== -1) onRemoveFromCart?.(originalIndex)
                              }}
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs shrink-0 bg-transparent hover:bg-amber-50 hover:border-amber-300"
                            onClick={() => handleAddRecommendation(rec)}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Items added from search that aren't in AI recommendations */}
                  {groupedItems.diagnoses
                    .filter((item) => !aiRecommendedDiagnoses.some((r) => r.name === item))
                    .map((item, idx) => (
                      <div key={idx} className="p-3 rounded-lg border bg-amber-50 border-amber-200">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <ClipboardList className="h-3.5 w-3.5 text-amber-600" />
                              <p className="text-sm font-medium">{item}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-amber-600 shrink-0" />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-slate-400 hover:text-red-500"
                              onClick={() => {
                                const originalIndex = cartItems.indexOf(item)
                                if (originalIndex !== -1) onRemoveFromCart?.(originalIndex)
                              }}
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}

                  {aiRecommendedDiagnoses.length === 0 && groupedItems.diagnoses.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-2">
                      No diagnoses suggested yet. Use search above or answer questions for recommendations.
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Pill className="h-4 w-4 text-green-600" />
                  <h3 className="font-semibold text-sm">Pharmacology</h3>
                </div>

                {/* Medicine Search */}
                <div className="relative">
                  <input
                    type="text"
                    value={rxSearch}
                    onChange={(e) => setRxSearch(e.target.value)}
                    placeholder="Search Medications..."
                    className="w-full rounded-lg border border-slate-200 p-2.5 pl-9 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                </div>

                {/* Medicine Search Results */}
                {rxSearch && filteredMedicines.length > 0 && (
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {filteredMedicines.map((test) => (
                      <div
                        key={test.id}
                        className={`p-3 rounded-lg border transition-colors ${
                          isOrderAdded(test.name)
                            ? "bg-green-50 border-green-200"
                            : "bg-slate-50 border-slate-200 hover:border-green-300"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Pill className="h-3.5 w-3.5 text-green-600" />
                              <p className="text-sm font-medium">{test.name}</p>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">{test.bodySystem}</p>
                          </div>
                          {isOrderAdded(test.name) ? (
                            <Check className="h-4 w-4 text-green-600 shrink-0" />
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs shrink-0 bg-transparent hover:bg-green-50 hover:border-green-300"
                              onClick={() => handleAddFromSearch(test)}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Add
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {rxSearch && filteredMedicines.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-2">
                    No medications found for "{rxSearch}"
                  </p>
                )}

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5 text-green-600" />
                    <span className="text-xs font-medium text-green-700">AI-Recommended Prescriptions</span>
                    <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                      AI
                    </Badge>
                  </div>

                  {aiRecommendedMedicines.map((rec) => (
                    <div
                      key={rec.id}
                      className={`p-3 rounded-lg border transition-colors ${
                        isOrderAdded(rec.name)
                          ? "bg-green-50 border-green-200"
                          : "bg-slate-50 border-slate-200 hover:border-green-300"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Pill className="h-3.5 w-3.5 text-green-600" />
                            <p className="text-sm font-medium">{rec.name}</p>
                          </div>
                          {rec.dosage && (
                            <Badge variant="outline" className="mt-1 text-xs bg-green-50">
                              {rec.dosage}
                            </Badge>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">{rec.reason}</p>
                          <div className="flex items-center gap-1 mt-1.5">
                            <ShieldCheck className="h-3 w-3 text-green-600" />
                            <span className="text-xs text-green-700">Interaction Check: Safe</span>
                          </div>
                        </div>
                        {isOrderAdded(rec.name) ? (
                          <div className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-600 shrink-0" />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-slate-400 hover:text-red-500"
                              onClick={() => {
                                const originalIndex = cartItems.indexOf(rec.name)
                                if (originalIndex !== -1) onRemoveFromCart?.(originalIndex)
                              }}
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs shrink-0 bg-transparent hover:bg-green-50 hover:border-green-300"
                            onClick={() => handleAddRecommendation(rec)}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Items added from search that aren't in AI recommendations */}
                  {groupedItems.medicines
                    .filter((item) => !aiRecommendedMedicines.some((r) => r.name === item))
                    .map((item, idx) => (
                      <div key={idx} className="p-3 rounded-lg border bg-green-50 border-green-200">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Pill className="h-3.5 w-3.5 text-green-600" />
                              <p className="text-sm font-medium">{item}</p>
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              <ShieldCheck className="h-3 w-3 text-green-600" />
                              <span className="text-xs text-green-700">Interaction Check: Safe</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-600 shrink-0" />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-slate-400 hover:text-red-500"
                              onClick={() => {
                                const originalIndex = cartItems.indexOf(item)
                                if (originalIndex !== -1) onRemoveFromCart?.(originalIndex)
                              }}
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}

                  {aiRecommendedMedicines.length === 0 && groupedItems.medicines.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-2">
                      No medications suggested yet. Use search above or answer questions for recommendations.
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Stethoscope className="h-4 w-4 text-rose-600" />
                  <h3 className="font-semibold text-sm">Procedures</h3>
                </div>

                {/* Procedure Search */}
                <div className="relative">
                  <input
                    type="text"
                    value={procedureSearch}
                    onChange={(e) => setProcedureSearch(e.target.value)}
                    placeholder="Search Procedures..."
                    className="w-full rounded-lg border border-slate-200 p-2.5 pl-9 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  />
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                </div>

                {/* Procedure Search Results */}
                {procedureSearch && filteredProcedures.length > 0 && (
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {filteredProcedures.map((test) => {
                      const isSurgical = test.bodySystem === "Surgical"
                      return (
                        <div
                          key={test.id}
                          className={`p-3 rounded-lg border transition-colors ${
                            isOrderAdded(test.name)
                              ? "bg-rose-50 border-rose-200"
                              : "bg-slate-50 border-slate-200 hover:border-rose-300"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                {isSurgical ? (
                                  <Scissors className="h-3.5 w-3.5 text-rose-600" />
                                ) : (
                                  <Stethoscope className="h-3.5 w-3.5 text-rose-600" />
                                )}
                                <p className="text-sm font-medium">{test.name}</p>
                                {isSurgical && (
                                  <Badge variant="outline" className="text-xs bg-rose-100 text-rose-700">
                                    Surgical
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5">{test.bodySystem}</p>
                            </div>
                            {isOrderAdded(test.name) ? (
                              <Check className="h-4 w-4 text-rose-600 shrink-0" />
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs shrink-0 bg-transparent hover:bg-rose-50 hover:border-rose-300"
                                onClick={() => handleAddFromSearch(test)}
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                Add
                              </Button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {procedureSearch && filteredProcedures.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-2">
                    No procedures found for "{procedureSearch}"
                  </p>
                )}

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5 text-rose-600" />
                    <span className="text-xs font-medium text-rose-700">AI-Recommended Procedures</span>
                    <Badge variant="secondary" className="text-xs bg-rose-100 text-rose-700">
                      AI
                    </Badge>
                  </div>

                  {/* AI Follow-up Procedures */}
                  {aiFollowUpTests
                    .filter((t) => t.type === "procedure")
                    .map((test) => (
                      <div
                        key={test.id}
                        className={`p-3 rounded-lg border transition-colors ${
                          isOrderAdded(test.name)
                            ? "bg-rose-50 border-rose-200"
                            : "bg-slate-50 border-slate-200 hover:border-rose-300"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Stethoscope className="h-3.5 w-3.5 text-rose-600" />
                              <p className="text-sm font-medium">{test.name}</p>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">{test.reason}</p>
                          </div>
                          {isOrderAdded(test.name) ? (
                            <div className="flex items-center gap-2">
                              <Check className="h-4 w-4 text-rose-600 shrink-0" />
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-slate-400 hover:text-red-500"
                                onClick={() => {
                                  const originalIndex = cartItems.indexOf(test.name)
                                  if (originalIndex !== -1) onRemoveFromCart?.(originalIndex)
                                }}
                              >
                                <X className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs shrink-0 bg-transparent hover:bg-rose-50 hover:border-rose-300"
                              onClick={() => handleAddFollowUpTest(test)}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Add
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}

                  {/* AI Recommended Procedures */}
                  {aiRecommendedProcedures.map((rec) => (
                    <div
                      key={rec.id}
                      className={`p-3 rounded-lg border transition-colors ${
                        isOrderAdded(rec.name)
                          ? "bg-rose-50 border-rose-200"
                          : "bg-slate-50 border-slate-200 hover:border-rose-300"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Scissors className="h-3.5 w-3.5 text-rose-600" />
                            <p className="text-sm font-medium">{rec.name}</p>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{rec.reason}</p>
                        </div>
                        {isOrderAdded(rec.name) ? (
                          <div className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-rose-600 shrink-0" />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-slate-400 hover:text-red-500"
                              onClick={() => {
                                const originalIndex = cartItems.indexOf(rec.name)
                                if (originalIndex !== -1) onRemoveFromCart?.(originalIndex)
                              }}
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs shrink-0 bg-transparent hover:bg-rose-50 hover:border-rose-300"
                            onClick={() => handleAddRecommendation(rec)}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Items added from search that aren't in AI recommendations */}
                  {groupedItems.procedures
                    .filter(
                      (item) =>
                        !aiRecommendedProcedures.some((r) => r.name === item) &&
                        !aiFollowUpTests.some((t) => t.name === item),
                    )
                    .map((item, idx) => {
                      const isSurgical = labTests.find((t) => t.name === item)?.bodySystem === "Surgical"
                      return (
                        <div key={idx} className="p-3 rounded-lg border bg-rose-50 border-rose-200">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                {isSurgical ? (
                                  <Scissors className="h-3.5 w-3.5 text-rose-600" />
                                ) : (
                                  <Stethoscope className="h-3.5 w-3.5 text-rose-600" />
                                )}
                                <p className="text-sm font-medium">{item}</p>
                                {isSurgical && (
                                  <Badge variant="outline" className="text-xs bg-rose-100 text-rose-700">
                                    Surgical
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Check className="h-4 w-4 text-rose-600 shrink-0" />
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-slate-400 hover:text-red-500"
                                onClick={() => {
                                  const originalIndex = cartItems.indexOf(item)
                                  if (originalIndex !== -1) onRemoveFromCart?.(originalIndex)
                                }}
                              >
                                <X className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      )
                    })}

                  {aiRecommendedProcedures.length === 0 &&
                    aiFollowUpTests.filter((t) => t.type === "procedure").length === 0 &&
                    groupedItems.procedures.length === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-2">
                        No procedures suggested yet. Use search above or answer questions for recommendations.
                      </p>
                    )}
                </div>

                {/* Surgical Routing */}
                {showSurgicalRouting && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg space-y-3">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-rose-600" />
                      <span className="text-sm font-medium">Surgical Routing</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Select
                        value={surgicalRouting?.facility || ""}
                        onValueChange={(val) =>
                          setSurgicalRouting((prev) => ({
                            ...prev!,
                            facility: val,
                            department: prev?.department || "",
                            urgency: prev?.urgency || "routine",
                          }))
                        }
                      >
                        <SelectTrigger className="h-8 text-xs bg-white">
                          <SelectValue placeholder="Facility" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="main">Main Hospital</SelectItem>
                          <SelectItem value="surgical-center">Surgical Center</SelectItem>
                          <SelectItem value="outpatient">Outpatient Clinic</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select
                        value={surgicalRouting?.urgency || "routine"}
                        onValueChange={(val) =>
                          setSurgicalRouting((prev) => ({
                            ...prev!,
                            urgency: val as "routine" | "urgent" | "emergency",
                            facility: prev?.facility || "",
                            department: prev?.department || "",
                          }))
                        }
                      >
                        <SelectTrigger className="h-8 text-xs bg-white">
                          <SelectValue placeholder="Urgency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="routine">Routine</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                          <SelectItem value="emergency">Emergency</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>

              {/* Patient Instructions */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-slate-600" />
                  <h3 className="font-semibold text-sm">Patient Instructions</h3>
                </div>
                <Textarea
                  value={patientInstructions}
                  onChange={(e) => setPatientInstructions(e.target.value)}
                  placeholder="Add instructions for the patient..."
                  className="min-h-[80px] text-sm"
                />
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-muted-foreground">Follow-up in</span>
                  <Input
                    type="number"
                    value={followUpValue}
                    onChange={(e) => setFollowUpValue(e.target.value)}
                    className="w-16 h-8 text-sm"
                  />
                  <Select value={followUpUnit} onValueChange={setFollowUpUnit}>
                    <SelectTrigger className="w-24 h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="days">Days</SelectItem>
                      <SelectItem value="weeks">Weeks</SelectItem>
                      <SelectItem value="months">Months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Sticky Footer - Only show in recommendations state with items */}
      {panelState === "recommendations" && cartItems.length > 0 && (
        <div className="border-t bg-background p-4 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total Items</span>
            <span className="font-semibold">{cartItems.length}</span>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" className="flex-1" onClick={onClearCart}>
              Save Draft
            </Button>
            <Button
              className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              onClick={handleSchedule}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing...
                </>
              ) : (
                "Sign & Send Orders"
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Consent Dialog */}
      <Dialog open={showConsentDialog} onOpenChange={setShowConsentDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Patient Consent Required</DialogTitle>
            <DialogDescription>
              Accessing medical history from the National Database requires patient authorization via SMS.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                <Smartphone className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium">Mobile Number</p>
                <p className="text-sm text-muted-foreground">*******8888</p>
              </div>
            </div>

            {consentStep === "initial" && (
              <div className="p-4 border rounded-lg bg-slate-50 text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  We will send an SMS to the patient's registered phone number.
                </p>
                <p className="text-xs text-muted-foreground">The patient must reply "Y" to authorize access.</p>
              </div>
            )}

            {(consentStep === "sending" || consentStep === "waiting") && (
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <div className="self-end bg-blue-600 text-white rounded-2xl rounded-tr-sm px-4 py-2 text-sm max-w-[80%]">
                    Please reply Y to authorize Dr. Sarah Johnson to view your medical history.
                  </div>
                  {consentStep === "waiting" && (
                    <div className="self-start bg-slate-200 text-slate-800 rounded-2xl rounded-tl-sm px-4 py-2 text-sm">
                      <div className="flex gap-1">
                        <span>.</span>
                        <span>.</span>
                        <span>.</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  {consentStep === "sending" ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Sending SMS...
                    </>
                  ) : (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Waiting for patient reply...
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            {consentStep === "initial" ? (
              <div className="flex gap-2 w-full">
                <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setShowConsentDialog(false)}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={handleSendConsentRequest}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send Request
                </Button>
              </div>
            ) : (
              <Button variant="outline" className="w-full bg-transparent" onClick={() => setShowConsentDialog(false)}>
                Cancel
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
