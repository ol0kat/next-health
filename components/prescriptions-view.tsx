"use client"

import { useState, useTransition } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, Copy, Loader2, X } from "lucide-react"
import type { Order } from "@/components/orders-view"
import { createPrescription } from "@/lib/actions/prescriptions"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface PrescriptionsViewProps {
  prescriptions?: Array<{
    ma_don_thuoc: string
    ngay_gio_ke_don: string
    thong_tin_don_thuoc: any[]
    chan_doan: any[]
  }>
  orders?: Order[]
  patientId?: string
}

const initialPrescriptions: any[] = []

// Common medication instructions grouped by category
const INSTRUCTION_TAGS = {
  timing: [
    { id: "with-food", label: "Take with food", icon: "🍽️" },
    { id: "empty-stomach", label: "Take on an empty stomach", icon: "⏰" },
    { id: "before-meals", label: "Take 30 min before meals", icon: "🍴" },
    { id: "after-meals", label: "Take after meals", icon: "🍽️" },
    { id: "bedtime", label: "Take at bedtime", icon: "🌙" },
    { id: "morning", label: "Take in the morning", icon: "🌅" },
  ],
  warnings: [
    { id: "no-alcohol", label: "Avoid alcohol", icon: "🚫" },
    { id: "no-driving", label: "May cause drowsiness - avoid driving", icon: "🚗" },
    { id: "no-sun", label: "Avoid prolonged sun exposure", icon: "☀️" },
    { id: "no-grapefruit", label: "Avoid grapefruit", icon: "🍊" },
    { id: "no-dairy", label: "Avoid dairy products", icon: "🥛" },
  ],
  hydration: [
    { id: "plenty-water", label: "Drink plenty of water", icon: "💧" },
    { id: "full-glass", label: "Take with a full glass of water", icon: "🥤" },
    { id: "stay-upright", label: "Stay upright for 30 min after taking", icon: "🧍" },
  ],
  completion: [
    { id: "complete-course", label: "Complete the full course", icon: "✅" },
    { id: "dont-stop", label: "Do not stop suddenly without consulting doctor", icon: "⚠️" },
    { id: "even-better", label: "Continue even if feeling better", icon: "💪" },
  ],
  storage: [
    { id: "refrigerate", label: "Keep refrigerated", icon: "❄️" },
    { id: "room-temp", label: "Store at room temperature", icon: "🏠" },
    { id: "away-light", label: "Keep away from light", icon: "🔦" },
  ],
  special: [
    { id: "shake-well", label: "Shake well before use", icon: "🔄" },
    { id: "chew", label: "Chew before swallowing", icon: "👄" },
    { id: "dont-crush", label: "Do not crush or chew", icon: "💊" },
    { id: "sublingual", label: "Place under tongue", icon: "👅" },
  ],
}

type InstructionCategory = keyof typeof INSTRUCTION_TAGS

const CATEGORY_LABELS: Record<InstructionCategory, string> = {
  timing: "Timing",
  warnings: "Warnings",
  hydration: "Hydration",
  completion: "Completion",
  storage: "Storage",
  special: "Special Instructions",
}

function isMedicineItem(itemName: string): boolean {
  const normalizedName = itemName.toLowerCase()
  const medicineKeywords = [
    "mg",
    "mcg",
    "ml",
    "tablet",
    "capsule",
    "levothyroxine",
    "metformin",
    "lisinopril",
    "atorvastatin",
    "prescription",
    "aspirin",
    "ibuprofen",
    "acetaminophen",
    "omeprazole",
    "amlodipine",
    "simvastatin",
    "losartan",
    "gabapentin",
    "hydrochlorothiazide",
    "sertraline",
    "montelukast",
    "escitalopram",
    "rosuvastatin",
    "bupropion",
    "pantoprazole",
    "duloxetine",
    "clopidogrel",
    "pravastatin",
    "carvedilol",
    "trazodone",
    "fluoxetine",
    "tramadol",
    "tamsulosin",
    "prednisone",
    "furosemide",
    "alprazolam",
  ]
  return medicineKeywords.some((keyword) => normalizedName.includes(keyword))
}

export function PrescriptionsView({ prescriptions = [], orders = [], patientId }: PrescriptionsViewProps) {
  const [localPrescriptions, setLocalPrescriptions] = useState(initialPrescriptions)
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddingRx, setIsAddingRx] = useState(false)
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  // Form state
  const [newRx, setNewRx] = useState({
    medication: "",
    dosage: "",
    frequency: "",
    duration: "",
    refills: "",
    notes: "",
    dosageUnit: "mg",
    dosageForm: "Tablet",
    route: "Oral",
    quantity: "30",
    selectedInstructions: [] as string[],
  })

  const [expandedCategory, setExpandedCategory] = useState<InstructionCategory | null>(null)

  const toggleInstruction = (instructionId: string) => {
    setNewRx((prev) => ({
      ...prev,
      selectedInstructions: prev.selectedInstructions.includes(instructionId)
        ? prev.selectedInstructions.filter((id) => id !== instructionId)
        : [...prev.selectedInstructions, instructionId],
    }))
  }

  const removeInstruction = (instructionId: string) => {
    setNewRx((prev) => ({
      ...prev,
      selectedInstructions: prev.selectedInstructions.filter((id) => id !== instructionId),
    }))
  }

  const getInstructionById = (id: string) => {
    for (const category of Object.values(INSTRUCTION_TAGS)) {
      const found = category.find((inst) => inst.id === id)
      if (found) return found
    }
    return null
  }

  const getFullInstructions = () => {
    const tagInstructions = newRx.selectedInstructions
      .map((id) => getInstructionById(id)?.label)
      .filter(Boolean)
      .join(". ")

    if (tagInstructions && newRx.notes) {
      return `${tagInstructions}. ${newRx.notes}`
    }
    return tagInstructions || newRx.notes
  }

  const handleReprescribe = (prescription: any) => {
    const newPrescription = {
      id: Date.now(),
      medication: prescription.medication,
      dosage: prescription.dosage,
      frequency: prescription.frequency || "As directed",
      lastPrescribed: new Date().toISOString().split("T")[0],
      lastFilled: "Not Filled",
      refills: prescription.refills || 0,
      status: "active" as const,
      instructions: prescription.instructions,
    }
    setLocalPrescriptions([newPrescription, ...localPrescriptions])
  }

  const handleDuplicate = (prescription: any) => {
    setNewRx({
      medication: prescription.medication,
      dosage: prescription.dosage,
      frequency: prescription.frequency,
      duration: "",
      refills: prescription.refills.toString(),
      notes: "",
      dosageUnit: "mg",
      dosageForm: "Tablet",
      route: "Oral",
      quantity: "30",
      selectedInstructions: [],
    })
    setIsAddingRx(true)
  }

  const handleAddPrescription = () => {
    if (!newRx.medication || !newRx.dosage) return

    const fullInstructions = getFullInstructions()

    startTransition(async () => {
      try {
        if (patientId) {
          const result = await createPrescription({
            patient_id: patientId,
            medication_name: newRx.medication,
            dosage_amount: newRx.dosage,
            dosage_unit: newRx.dosageUnit,
            dosage_form: newRx.dosageForm,
            frequency: newRx.frequency || "As directed",
            route: newRx.route,
            instructions: fullInstructions,
            quantity: Number.parseInt(newRx.quantity) || 30,
            days_supply: newRx.duration ? Number.parseInt(newRx.duration) : undefined,
            refills_authorized: Number.parseInt(newRx.refills) || 0,
            prescriber_name: "Dr. Current User",
          })

          if (result.error) {
            toast({
              title: "Error",
              description: `Failed to create prescription: ${result.error}`,
              variant: "destructive",
            })
            return
          }

          toast({
            title: "Prescription Created",
            description: `${newRx.medication} has been prescribed successfully.`,
          })
        }

        const prescription = {
          id: Date.now(),
          medication: newRx.medication,
          dosage: newRx.dosage,
          frequency: newRx.frequency || "As directed",
          lastPrescribed: new Date().toISOString().split("T")[0],
          lastFilled: "Not Filled",
          refills: Number.parseInt(newRx.refills) || 0,
          status: "active" as const,
          instructions: fullInstructions,
        }

        setLocalPrescriptions([prescription, ...localPrescriptions])
        setIsAddingRx(false)
        setNewRx({
          medication: "",
          dosage: "",
          frequency: "",
          duration: "",
          refills: "",
          notes: "",
          dosageUnit: "mg",
          dosageForm: "Tablet",
          route: "Oral",
          quantity: "30",
          selectedInstructions: [],
        })
        setExpandedCategory(null)
      } catch (error) {
        console.error("Error creating prescription:", error)
        toast({
          title: "Error",
          description: "An unexpected error occurred.",
          variant: "destructive",
        })
      }
    })
  }

  const medicinesFromOrders = orders
    .filter((order) => order.status !== "cancelled")
    .flatMap((order) =>
      order.tests
        .filter((test) => isMedicineItem(test))
        .map((medicine, idx) => ({
          id: `order-med-${order.id}-${idx}`,
          medication: medicine,
          dosage: "-",
          frequency: "As directed",
          lastPrescribed: order.date,
          lastFilled: "Not Filled",
          refills: 0,
          status: "active" as const,
          fromOrder: true,
          orderId: order.id,
          instructions: "",
        })),
    )

  const allPrescriptions = [
    ...medicinesFromOrders,
    ...prescriptions.map((rx, idx) => {
      const medicationName = rx.thong_tin_don_thuoc
        .map((med) =>
          med.ten_thuoc
            .replace(/\s*\d+\s*(mcg|mg|g)\s*/gi, "")
            .replace(/\s*viên\s*/gi, "")
            .trim(),
        )
        .join(", ")

      return {
        id: `rx-${idx}`,
        medication: medicationName,
        dosage: rx.thong_tin_don_thuoc[0]?.don_vi_tinh || "-",
        frequency: rx.thong_tin_don_thuoc[0]?.cach_dung || "As directed",
        lastPrescribed: new Date(rx.ngay_gio_ke_don).toLocaleDateString(),
        lastFilled: "Not Filled",
        refills: 0,
        status: "active" as const,
        nationalId: rx.ma_don_thuoc,
        instructions: "",
      }
    }),
    ...localPrescriptions,
  ]

  const filteredPrescriptions = allPrescriptions.filter((p) =>
    p.medication.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search medications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <Dialog open={isAddingRx} onOpenChange={setIsAddingRx}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Prescription
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Write New Prescription</DialogTitle>
              <DialogDescription>Create a new prescription for this patient.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="medication">Medication</Label>
                <Input
                  id="medication"
                  placeholder="e.g. Amoxicillin"
                  value={newRx.medication}
                  onChange={(e) => setNewRx({ ...newRx, medication: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="dosage">Dosage</Label>
                  <Input
                    id="dosage"
                    placeholder="e.g. 500"
                    value={newRx.dosage}
                    onChange={(e) => setNewRx({ ...newRx, dosage: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="dosageUnit">Unit</Label>
                  <Select value={newRx.dosageUnit} onValueChange={(val) => setNewRx({ ...newRx, dosageUnit: val })}>
                    <SelectTrigger id="dosageUnit">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mg">mg</SelectItem>
                      <SelectItem value="mcg">mcg</SelectItem>
                      <SelectItem value="g">g</SelectItem>
                      <SelectItem value="mL">mL</SelectItem>
                      <SelectItem value="units">units</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="dosageForm">Form</Label>
                  <Select value={newRx.dosageForm} onValueChange={(val) => setNewRx({ ...newRx, dosageForm: val })}>
                    <SelectTrigger id="dosageForm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Tablet">Tablet</SelectItem>
                      <SelectItem value="Capsule">Capsule</SelectItem>
                      <SelectItem value="Liquid">Liquid</SelectItem>
                      <SelectItem value="Injection">Injection</SelectItem>
                      <SelectItem value="Cream">Cream</SelectItem>
                      <SelectItem value="Patch">Patch</SelectItem>
                      <SelectItem value="Inhaler">Inhaler</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="frequency">Frequency</Label>
                  <Input
                    id="frequency"
                    placeholder="e.g. Twice daily"
                    value={newRx.frequency}
                    onChange={(e) => setNewRx({ ...newRx, frequency: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="route">Route</Label>
                  <Select value={newRx.route} onValueChange={(val) => setNewRx({ ...newRx, route: val })}>
                    <SelectTrigger id="route">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Oral">Oral</SelectItem>
                      <SelectItem value="Topical">Topical</SelectItem>
                      <SelectItem value="Subcutaneous">Subcutaneous</SelectItem>
                      <SelectItem value="Intramuscular">Intramuscular</SelectItem>
                      <SelectItem value="IV">IV</SelectItem>
                      <SelectItem value="Inhaled">Inhaled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    placeholder="30"
                    type="number"
                    value={newRx.quantity}
                    onChange={(e) => setNewRx({ ...newRx, quantity: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="duration">Duration (days)</Label>
                  <Input
                    id="duration"
                    placeholder="e.g. 7"
                    value={newRx.duration}
                    onChange={(e) => setNewRx({ ...newRx, duration: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="refills">Refills</Label>
                  <Input
                    id="refills"
                    placeholder="0"
                    type="number"
                    value={newRx.refills}
                    onChange={(e) => setNewRx({ ...newRx, refills: e.target.value })}
                  />
                </div>
              </div>

              {/* Instructions Section */}
              <div className="grid gap-3 pt-2">
                <Label>Patient Instructions</Label>
                
                {/* Selected Instructions Tags */}
                {newRx.selectedInstructions.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-lg">
                    {newRx.selectedInstructions.map((id) => {
                      const instruction = getInstructionById(id)
                      if (!instruction) return null
                      return (
                        <Badge
                          key={id}
                          variant="secondary"
                          className="flex items-center gap-1 pr-1"
                        >
                          <span>{instruction.icon}</span>
                          <span>{instruction.label}</span>
                          <button
                            type="button"
                            onClick={() => removeInstruction(id)}
                            className="ml-1 hover:bg-muted rounded-full p-0.5"
                          >
                            <X className="h-3 w-3" />
                            <span className="sr-only">Remove</span>
                          </button>
                        </Badge>
                      )
                    })}
                  </div>
                )}

                {/* Instruction Categories */}
                <div className="space-y-2">
                  {(Object.entries(INSTRUCTION_TAGS) as [InstructionCategory, typeof INSTRUCTION_TAGS.timing][]).map(
                    ([category, instructions]) => (
                      <div key={category} className="border rounded-lg overflow-hidden">
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedCategory(expandedCategory === category ? null : category)
                          }
                          className={cn(
                            "w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-left hover:bg-muted/50 transition-colors",
                            expandedCategory === category && "bg-muted/50"
                          )}
                        >
                          <span>{CATEGORY_LABELS[category]}</span>
                          <span className="text-muted-foreground text-xs">
                            {instructions.filter((i) => newRx.selectedInstructions.includes(i.id)).length > 0 && (
                              <Badge variant="secondary" className="ml-2 h-5 px-1.5">
                                {instructions.filter((i) => newRx.selectedInstructions.includes(i.id)).length}
                              </Badge>
                            )}
                          </span>
                        </button>
                        {expandedCategory === category && (
                          <div className="px-3 py-2 border-t bg-background">
                            <div className="flex flex-wrap gap-2">
                              {instructions.map((instruction) => (
                                <button
                                  key={instruction.id}
                                  type="button"
                                  onClick={() => toggleInstruction(instruction.id)}
                                  className={cn(
                                    "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors",
                                    newRx.selectedInstructions.includes(instruction.id)
                                      ? "bg-primary text-primary-foreground"
                                      : "bg-muted hover:bg-muted/80 text-foreground"
                                  )}
                                >
                                  <span>{instruction.icon}</span>
                                  <span>{instruction.label}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  )}
                </div>

                {/* Custom Notes */}
                <div className="grid gap-2 pt-2">
                  <Label htmlFor="notes" className="text-sm text-muted-foreground">
                    Additional Notes (optional)
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder="Add any custom instructions..."
                    value={newRx.notes}
                    onChange={(e) => setNewRx({ ...newRx, notes: e.target.value })}
                    className="min-h-[60px] resize-none"
                  />
                </div>

                {/* Preview */}
                {(newRx.selectedInstructions.length > 0 || newRx.notes) && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">
                      Instructions Preview:
                    </p>
                    <p className="text-sm text-blue-900 dark:text-blue-100">
                      {getFullInstructions()}
                    </p>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddPrescription} disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Prescription"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {filteredPrescriptions.map((prescription: any) => (
          <div key={prescription.id} className="flex items-center justify-between p-3 border rounded-lg bg-card">
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{prescription.medication}</span>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full dark:bg-green-900/30 dark:text-green-400">
                  {prescription.status}
                </span>
                {prescription.fromOrder && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full dark:bg-blue-900/30 dark:text-blue-400">
                    From Order
                  </span>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                {prescription.dosage} • {prescription.frequency}
              </div>
              {prescription.instructions && (
                <div className="text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-2 py-1 rounded mt-1 inline-block">
                  📋 {prescription.instructions}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDuplicate(prescription)}
                title="Duplicate and edit"
              >
                <Copy className="h-4 w-4" />
                <span className="sr-only">Duplicate</span>
              </Button>
            </div>
          </div>
        ))}

        {filteredPrescriptions.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">No prescriptions found.</div>
        )}
      </div>
    </div>
  )
}
