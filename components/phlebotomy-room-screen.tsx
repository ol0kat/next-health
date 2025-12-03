"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"
import {
  VITALS_CHECKLIST,
  LAB_TUBES,
  calculateBMI,
  isOutOfRange,
  type VitalSignsEntry,
} from "@/lib/patient-status"
import { AlertCircle, Check, Printer, AlertTriangle, Activity } from "lucide-react"

interface PhlebotomyRoomProps {
  patientId: string
  patientName: string
  previousHeightCm?: number
  onVitalsSaved?: (vitals: VitalSignsEntry) => void
}

export function PhlebotomyRoomScreen({ patientId, patientName, previousHeightCm, onVitalsSaved }: PhlebotomyRoomProps) {
  const [vitals, setVitals] = useState<Partial<VitalSignsEntry>>({
    patient_id: patientId,
    height_cm: previousHeightCm,
    recorded_by: "Nurse Name", // TODO: Get from auth
    recorded_at: new Date().toISOString(),
  })

  const [completedFields, setCompletedFields] = useState<Set<string>>(new Set())
  const [selectedTubes, setSelectedTubes] = useState<Set<string>>(new Set())
  const [showPharmacyReview, setShowPharmacyReview] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const inputRefs = useRef<Record<string, HTMLInputElement>>({})

  const remainingFields = VITALS_CHECKLIST.filter(
    (item) => !item.optional && !completedFields.has(item.key)
  ).length

  const handleVitalInput = (key: keyof VitalSignsEntry, value: string) => {
    const numValue = parseFloat(value)
    
    if (!isNaN(numValue)) {
      setVitals((prev) => ({
        ...prev,
        [key]: numValue,
      }))
      
      // Mark as completed
      setCompletedFields((prev) => new Set([...prev, key]))

      // Calculate BMI if we have height and weight
      if (key === "weight_kg" && vitals.height_cm) {
        const bmi = calculateBMI(vitals.height_cm, numValue)
        setVitals((prev) => ({ ...prev, bmi }))
      } else if (key === "height_cm" && vitals.weight_kg) {
        const bmi = calculateBMI(numValue, vitals.weight_kg)
        setVitals((prev) => ({ ...prev, bmi }))
      }

      // Move to next field
      const nextField = VITALS_CHECKLIST.find(
        (item) =>
          !item.optional &&
          !completedFields.has(item.key) &&
          item.key !== key
      )

      if (nextField) {
        setTimeout(() => {
          inputRefs.current[nextField.key]?.focus()
        }, 100)
      }
    }
  }

  const handleTubeToggle = (tubeId: string) => {
    setSelectedTubes((prev) => {
      const next = new Set(prev)
      next.has(tubeId) ? next.delete(tubeId) : next.add(tubeId)
      return next
    })
  }

  const handlePrintBarcodes = () => {
    const selectedLabTubes = LAB_TUBES.filter((t) => selectedTubes.has(t.id))
    if (selectedLabTubes.length === 0) return

    const printContent = `
      <html>
        <head>
          <title>Lab Tube Barcodes - ${patientName}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .barcode-label { 
              border: 2px solid #333; 
              padding: 15px; 
              margin: 10px 0; 
              page-break-inside: avoid;
              width: 400px;
            }
            .patient-info { font-weight: bold; font-size: 14px; margin-bottom: 10px; }
            .tube-info { font-size: 12px; margin: 5px 0; }
            .barcode { font-size: 24px; font-weight: bold; font-family: 'Courier New'; letter-spacing: 2px; margin: 10px 0; }
            .color-band { height: 20px; margin: 5px 0; border-radius: 3px; }
          </style>
        </head>
        <body>
          <h2>Lab Collection Order for ${patientName}</h2>
          <p><strong>Draw Order - Follow this sequence:</strong></p>
          ${selectedLabTubes
            .sort((a, b) => a.draw_order - b.draw_order)
            .map(
              (tube) => `
            <div class="barcode-label">
              <div class="patient-info">
                📋 ${tube.test_name}
                <br/>Order: #${tube.draw_order}
              </div>
              <div class="tube-info">
                <strong>Tube:</strong> ${tube.tube_color}
              </div>
              <div class="tube-info">
                <strong>Volume:</strong> ${tube.volume_ml} mL
              </div>
              ${tube.additives ? `<div class="tube-info"><strong>Additives:</strong> ${tube.additives}</div>` : ""}
              ${tube.instructions ? `<div class="tube-info"><strong>Instructions:</strong> ${tube.instructions}</div>` : ""}
              <div class="barcode">${tube.code}</div>
            </div>
          `
            )
            .join("")}
        </body>
      </html>
    `

    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(printContent)
      printWindow.document.close()
      printWindow.print()
    }
  }

  const handleSaveVitals = () => {
    if (remainingFields > 0) {
      alert("Please complete all required vital signs")
      return
    }

    const recordedVitals: VitalSignsEntry = {
      id: `vitals_${Date.now()}`,
      patient_id: patientId,
      visit_date: new Date().toISOString().split("T")[0],
      recorded_by: vitals.recorded_by || "Unknown",
      recorded_at: new Date().toISOString(),
      height_cm: vitals.height_cm,
      weight_kg: vitals.weight_kg,
      bmi: vitals.bmi,
      temperature_celsius: vitals.temperature_celsius,
      systolic_bp: vitals.systolic_bp,
      diastolic_bp: vitals.diastolic_bp,
      heart_rate: vitals.heart_rate,
      respiratory_rate: vitals.respiratory_rate,
      sp_o2: vitals.sp_o2,
      blood_glucose: vitals.blood_glucose,
      notes: vitals.notes,
      created_at: new Date().toISOString(),
    }

    onVitalsSaved?.(recordedVitals)
    setShowConfirmation(true)
  }

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Phlebotomy Room</h1>
          <p className="text-muted-foreground">Vital Signs & Sample Collection</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-slate-900">{patientName}</div>
          <div className="text-sm text-muted-foreground">Patient ID: {patientId.slice(0, 8)}</div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left: Vital Signs Entry */}
        <div className="col-span-7 space-y-4">
          <Card className="border-2 border-blue-200 bg-white shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b">
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-600" />
                Vital Signs Entry
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {/* Height - Optional if previous exists */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">
                    Height
                    {!previousHeightCm && <span className="text-red-500 ml-1">*</span>}
                    {previousHeightCm && (
                      <span className="text-xs text-emerald-600 ml-2">
                        ✓ Previous: {previousHeightCm}cm
                      </span>
                    )}
                  </Label>
                  {completedFields.has("height_cm") && (
                    <Check className="h-4 w-4 text-emerald-600" />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    ref={(el) => {
                      if (el) inputRefs.current["height_cm"] = el
                    }}
                    type="number"
                    placeholder={previousHeightCm ? "Press Enter to keep" : "Enter height"}
                    defaultValue={previousHeightCm || ""}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const value = (e.target as HTMLInputElement).value
                        if (value) {
                          handleVitalInput("height_cm", value)
                        } else if (previousHeightCm) {
                          setCompletedFields((prev) => new Set([...prev, "height_cm"]))
                        }
                      }
                    }}
                    className="font-mono text-lg"
                    disabled={previousHeightCm && !completedFields.has("height_cm")}
                  />
                  <span className="text-sm font-medium text-slate-500 w-12">cm</span>
                </div>
              </div>

              {/* Required Vitals */}
              {VITALS_CHECKLIST.filter((item) => !item.optional).map((item) => {
                const value = vitals[item.key]
                const isOutOfNormalRange =
                  value !== undefined && isOutOfRange(value, item.normalRange)
                const isCompleted = completedFields.has(item.key)

                return (
                  <div key={item.key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        {item.label}
                        <span className="text-red-500">*</span>
                        {isCompleted && <Check className="h-4 w-4 text-emerald-600" />}
                      </Label>
                      {isOutOfNormalRange && (
                        <span className="flex items-center gap-1 text-xs text-orange-600">
                          <AlertTriangle className="h-3 w-3" />
                          Out of range
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        ref={(el) => {
                          if (el) inputRefs.current[item.key] = el
                        }}
                        type="number"
                        step="0.1"
                        placeholder={`Enter ${item.label.toLowerCase()}`}
                        value={value || ""}
                        onChange={(e) => {
                          // Don't auto-submit on change, wait for Enter
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleVitalInput(item.key, (e.target as HTMLInputElement).value)
                          }
                        }}
                        className={cn(
                          "font-mono text-lg",
                          isOutOfNormalRange && "border-orange-300 bg-orange-50"
                        )}
                      />
                      <span className="text-sm font-medium text-slate-500 w-16">
                        {item.unit}
                      </span>
                    </div>
                  </div>
                )
              })}

              {/* BMI Display */}
              {vitals.bmi && (
                <div className="p-3 bg-slate-100 rounded-lg">
                  <div className="text-xs text-muted-foreground">Calculated BMI</div>
                  <div className="text-2xl font-bold text-slate-900">{vitals.bmi}</div>
                </div>
              )}

              {/* Progress */}
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    Progress
                  </span>
                  <span className="text-sm font-bold text-slate-900">
                    {completedFields.size} / {VITALS_CHECKLIST.filter((i) => !i.optional).length}
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-emerald-600 h-2 rounded-full transition-all"
                    style={{
                      width: `${((completedFields.size / VITALS_CHECKLIST.filter((i) => !i.optional).length) * 100)}%`,
                    }}
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2 pt-2">
                <Label className="text-sm font-medium">Observations / Notes</Label>
                <Textarea
                  placeholder="Any relevant observations during vitals collection..."
                  value={vitals.notes || ""}
                  onChange={(e) =>
                    setVitals((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  className="min-h-[80px] resize-none"
                />
              </div>

              {/* Save Button */}
              <Button
                onClick={handleSaveVitals}
                disabled={remainingFields > 0}
                className={cn(
                  "w-full font-bold py-6 text-lg",
                  remainingFields === 0
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-slate-300 cursor-not-allowed"
                )}
              >
                {remainingFields === 0
                  ? `✓ Record Vitals & Proceed (${remainingFields} remaining)`
                  : `Record Vitals (${remainingFields} remaining)`}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right: Lab Tubes & Collection */}
        <div className="col-span-5 space-y-4">
          {/* Pharmacy Review Alert */}
          <Card className="border-2 border-red-200 bg-red-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                Pharmacy & Drug Interactions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="text-muted-foreground">
                Checking patient medication history for potential interactions...
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowPharmacyReview(!showPharmacyReview)}
              >
                {showPharmacyReview ? "Hide" : "View"} Pharmacy Review
              </Button>
              {showPharmacyReview && (
                <div className="p-3 bg-white rounded border space-y-2 text-xs">
                  <p>✓ No critical interactions detected</p>
                  <p>• Patient on Metformin - Monitor glucose levels</p>
                  <p>• Patient on Lisinopril - May affect electrolytes</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Lab Collection Order */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🧪 Lab Collection Order
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Draw in this order to prevent contamination
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {LAB_TUBES.map((tube) => (
                <div
                  key={tube.id}
                  onClick={() => handleTubeToggle(tube.id)}
                  className={cn(
                    "p-3 border rounded-lg cursor-pointer transition-all",
                    selectedTubes.has(tube.id)
                      ? "border-blue-500 bg-blue-50 shadow-md"
                      : "border-slate-200 hover:border-slate-300"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "w-6 h-6 rounded border-2 mt-0.5 flex items-center justify-center",
                        selectedTubes.has(tube.id)
                          ? "bg-blue-500 border-blue-500"
                          : "border-slate-300"
                      )}
                    >
                      {selectedTubes.has(tube.id) && (
                        <Check className="h-3 w-3 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          #{tube.draw_order}
                        </Badge>
                        <span className="font-medium text-sm">{tube.test_name}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        🔴 {tube.tube_color} • {tube.volume_ml}mL
                      </div>
                      {tube.additives && (
                        <div className="text-xs text-slate-600 mt-1">
                          Additives: {tube.additives}
                        </div>
                      )}
                      {tube.instructions && (
                        <div className="text-xs text-blue-600 mt-1 font-medium">
                          ℹ️ {tube.instructions}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              <Button
                onClick={handlePrintBarcodes}
                disabled={selectedTubes.size === 0}
                className="w-full gap-2"
                variant="outline"
              >
                <Printer className="h-4 w-4" />
                Print Barcodes ({selectedTubes.size})
              </Button>
            </CardContent>
          </Card>

          {/* Medical History Quick Reference */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">📋 Quick Reference</CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-2">
              <div>
                <span className="font-medium">Allergies:</span> NKDA
              </div>
              <div>
                <span className="font-medium">Current Meds:</span> Metformin, Lisinopril
              </div>
              <div>
                <span className="font-medium">Last Visit:</span> 3 weeks ago
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>✓ Vitals Recorded</AlertDialogTitle>
            <AlertDialogDescription>
              All vital signs have been recorded and timestamped. Patient is ready for
              phlebotomy sample collection.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogAction>Continue to Next Patient</AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
