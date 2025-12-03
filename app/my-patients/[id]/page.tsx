"use client"

import { useMemo } from "react"
import { useState, useTransition } from "react"
import { useParams, useRouter } from "next/navigation"
import { useApp } from "@/components/app-provider"
import { PatientHeader } from "@/components/patient-header"
import { LabResultsView } from "@/components/lab-results-view"
import { PrescriptionsView } from "@/components/prescriptions-view"
import { ClinicalNotesView } from "@/components/clinical-notes-view"
import { DocumentsView, type Document } from "@/components/documents-view"
import { CatalogView } from "@/components/catalog-view"
import { OrdersView, type Order } from "@/components/orders-view"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Calendar, Plus, Activity, Heart, Pill, Upload, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Prescription } from "@/types/prescription"
import { createPrescription } from "@/lib/actions/prescriptions"
import { useToast } from "@/components/ui/use-toast"

export default function PatientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const {
    patients,
    setPatients,
    unitSystem,
    setUnitSystem,
    cartItems,
    setCartItems,
    prescriptions,
    setPrescriptions,
    orders,
    setOrders,
    isLoadingPatients,
  } = useApp()

  const [showCatalog, setShowCatalog] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [isPending, startTransition] = useTransition()

  const patient = patients.find((p) => p.id === params.id || p.supabaseId === params.id)

  const patientOrders = useMemo(() => {
    if (!patient) return []
    return orders.filter((order) => order.patientId === patient.id || order.patientId === patient.supabaseId)
  }, [orders, patient])

  const documents = patient?.documents || []
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [newDoc, setNewDoc] = useState({ title: "", type: "Report" })

  if (isLoadingPatients) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
          <p className="text-muted-foreground">Loading patient data...</p>
        </div>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold">Patient Not Found</h2>
          <p className="text-muted-foreground">The patient with ID {params.id} could not be found.</p>
          <p className="text-sm text-muted-foreground">
            Please run the seed script to add Sarah Johnson to the database.
          </p>
          <Button onClick={() => router.push("/my-patients")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Patients
          </Button>
        </div>
      </div>
    )
  }

  const handleAddToCart = (testName: string) => {
    setCartItems((prev) => [...prev, testName])
    setShowCatalog(true)
  }

  const handleRemoveFromCart = (index: number) => {
    setCartItems((prev) => prev.filter((_, i) => i !== index))
  }

  const handleClearCart = () => {
    setCartItems([])
  }

  const handlePlaceOrder = (orderData: { tests: string[]; timeframe: string; notes: string }) => {
    const newOrder: Order = {
      id: `order-${Date.now()}`,
      patientId: patient.id,
      patientName: patient.name,
      tests: orderData.tests,
      date: new Date().toLocaleDateString(),
      status: "pending-payment",
      timeframe: orderData.timeframe,
      notes: orderData.notes,
    }
    setOrders((prev) => [newOrder, ...prev])
  }

  const handleCancelOrder = (orderId: string) => {
    setOrders((prev) => prev.map((order) => (order.id === orderId ? { ...order, status: "cancelled" } : order)))
  }

  const handleUploadDocument = () => {
    if (!newDoc.title) return

    const doc: Document = {
      id: Date.now(),
      title: newDoc.title,
      type: newDoc.type,
      date: new Date().toISOString().split("T")[0],
      size: "1.5 MB", // Mock size
      doctor: "Dr. Current User",
      status: "Final",
    }

    setPatients((prev) =>
      prev.map((p) =>
        p.id === patient.id || p.supabaseId === patient.id
          ? {
              ...p,
              documents: [doc, ...(p.documents || [])],
            }
          : p,
      ),
    )

    setIsUploadOpen(false)
    setNewDoc({ title: "", type: "Report" })
  }

  const handleSubmitPrescription = (prescriptionData: {
    tests: string[]
    medicines: string[]
    diagnoses: Array<{ code: string; name: string }>
    procedures: string[]
    notes: string
    timeframe: string
  }) => {
    const generatePrescriptionId = () => {
      const randomChars = Math.random().toString(36).substring(2, 10)
      return `79bdq${randomChars}-c`
    }

    startTransition(async () => {
      try {
        // Get the Supabase patient ID if available
        const supabasePatientId = (patient as any).supabaseId

        // Save each medicine as a prescription to the database
        if (supabasePatientId) {
          for (const medicine of prescriptionData.medicines) {
            // Parse medicine name and dosage (e.g., "Levothyroxine 50mcg")
            const parts = medicine.match(/^(.+?)\s*(\d+\s*(?:mg|mcg|g|mL)?)?\s*$/i)
            const medicationName = parts?.[1]?.trim() || medicine
            const dosage = parts?.[2]?.trim() || ""

            await createPrescription({
              patient_id: supabasePatientId,
              medication_name: medicationName,
              dosage_amount: dosage || "As directed",
              dosage_unit: dosage.includes("mcg") ? "mcg" : dosage.includes("mg") ? "mg" : "units",
              dosage_form: "Tablet",
              frequency: "Once daily",
              route: "Oral",
              quantity: 30,
              prescriber_name: "Dr. Current User",
              indication: prescriptionData.diagnoses.map((d) => d.name).join(", "),
              notes: prescriptionData.notes,
            })
          }

          toast({
            title: "Prescriptions Saved",
            description: `${prescriptionData.medicines.length} prescription(s) saved to database.`,
          })
        }

        // Also update local state for immediate UI feedback
        const newPrescription: Prescription = {
          ma_don_thuoc: generatePrescriptionId(),
          ngay_gio_ke_don: new Date().toISOString().replace("T", " ").substring(0, 19),
          thong_tin_don_thuoc: prescriptionData.medicines.map((med) => ({
            ten_thuoc: med,
            biet_duoc: med.split(" ")[0],
            don_vi_tinh: "Viên",
            so_luong: "30",
            cach_dung: "50 mcg. Once daily",
          })),
          chan_doan: prescriptionData.diagnoses.map((dx) => ({
            ma_chan_doan: dx.code,
            ten_chan_doan: dx.name,
          })),
          tests: prescriptionData.tests,
          procedures: prescriptionData.procedures,
          notes: prescriptionData.notes,
        }

        setPrescriptions((prev) => [newPrescription, ...prev])

        const newOrder: Order = {
          id: `order-${Date.now()}`,
          patientId: patient.id,
          patientName: patient.name,
          tests: [...prescriptionData.tests, ...prescriptionData.procedures],
          date: new Date().toLocaleDateString(),
          status: "pending-payment",
          timeframe: prescriptionData.timeframe,
          notes: prescriptionData.notes,
        }
        setOrders((prev) => [newOrder, ...prev])
      } catch (error) {
        console.error("Error submitting prescription:", error)
        toast({
          title: "Error",
          description: "Failed to save prescription. Please try again.",
          variant: "destructive",
        })
      }
    })
  }

  return (
    <>
      <PatientHeader
        onPrescribe={() => setShowCatalog(true)}
        unitSystem={unitSystem}
        onUnitChange={setUnitSystem}
        patientName={patient.name}
        patientAge={patient.age}
        patientGender={patient.gender}
      />

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto bg-muted/10 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <div className="md:col-span-2 xl:col-span-2 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Lab Results & Vitals</h2>
                </div>
                <div className="border rounded-lg bg-background p-4 shadow-sm">
                  <LabResultsView onAddToCart={handleAddToCart} unitSystem={unitSystem} patientId={patient.id} />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Scheduled Orders</h2>
                <div className="border rounded-lg bg-background p-4 shadow-sm">
                  {patientOrders.length > 0 ? (
                    <OrdersView orders={patientOrders} onCancelOrder={handleCancelOrder} />
                  ) : (
                    <div className="text-sm text-muted-foreground text-center py-2">No active orders</div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Prescriptions</h2>
                <div className="border rounded-lg bg-background p-4 shadow-sm">
                  <PrescriptionsView
                    prescriptions={prescriptions}
                    orders={patientOrders}
                    patientId={(patient as any).supabaseId}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Current Symptoms</h2>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                    <ArrowLeft className="h-4 w-4" />
                    <span className="sr-only">Edit Current Symptoms</span>
                  </Button>
                </div>
                <div className="border rounded-lg bg-background p-4 shadow-sm text-sm">
                  {patient.symptoms && patient.symptoms.length > 0 ? (
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      {patient.symptoms.map((symptom, i) => (
                        <li key={i}>{symptom}</li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-muted-foreground italic">No symptoms recorded</div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Medical History</h2>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span className="sr-only">Edit Medical History</span>
                  </Button>
                </div>
                <div className="border rounded-lg bg-background p-4 shadow-sm text-sm">
                  {patient.medicalHistory && patient.medicalHistory.length > 0 ? (
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      {patient.medicalHistory.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-muted-foreground italic">No medical history recorded</div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Family Medical History</h2>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                    <Heart className="h-4 w-4" />
                    <span className="sr-only">Edit Family Medical History</span>
                  </Button>
                </div>
                <div className="border rounded-lg bg-background p-4 shadow-sm text-sm">
                  {patient.familyHistory && patient.familyHistory.length > 0 ? (
                    patient.familyHistory.map((item, i) => (
                      <div key={i} className="flex justify-between items-center border-b pb-2 last:border-0 last:pb-0">
                        <span className="font-medium">{item}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-muted-foreground italic">No family history recorded</div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Vaccinations Records</h2>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                    <Pill className="h-4 w-4" />
                    <span className="sr-only">Edit Vaccinations Records</span>
                  </Button>
                </div>
                <div className="border rounded-lg bg-background p-4 shadow-sm text-sm">
                  <div className="space-y-2">
                    {patient.vaccinations && patient.vaccinations.length > 0 ? (
                      patient.vaccinations.map((vac, i) => (
                        <div
                          key={i}
                          className="flex justify-between items-center border-b pb-2 last:border-0 last:pb-0"
                        >
                          <span className="font-medium">{vac.name}</span>
                          <span className="text-muted-foreground text-xs">{vac.date}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-muted-foreground italic">No vaccinations recorded</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Lifestyle</h2>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                    <Activity className="h-4 w-4" />
                    <span className="sr-only">Edit Lifestyle</span>
                  </Button>
                </div>
                <div className="border rounded-lg bg-background p-4 shadow-sm text-sm">
                  {patient.lifestyle ? (
                    <div className="grid grid-cols-[100px_1fr] gap-y-2 items-center">
                      {patient.lifestyle.smoking && (
                        <>
                          <div className="text-muted-foreground">Smoking:</div>
                          <div className="font-medium">{patient.lifestyle.smoking}</div>
                        </>
                      )}
                      {patient.lifestyle.alcohol && (
                        <>
                          <div className="text-muted-foreground">Alcohol:</div>
                          <div className="font-medium">{patient.lifestyle.alcohol}</div>
                        </>
                      )}
                      {patient.lifestyle.exercise && (
                        <>
                          <div className="text-muted-foreground">Exercise:</div>
                          <div className="font-medium">{patient.lifestyle.exercise}</div>
                        </>
                      )}
                      {patient.lifestyle.diet && (
                        <>
                          <div className="text-muted-foreground">Diet:</div>
                          <div className="font-medium">{patient.lifestyle.diet}</div>
                        </>
                      )}
                      {!patient.lifestyle.smoking &&
                        !patient.lifestyle.alcohol &&
                        !patient.lifestyle.exercise &&
                        !patient.lifestyle.diet && (
                          <div className="col-span-2 text-muted-foreground italic">No lifestyle data recorded</div>
                        )}
                    </div>
                  ) : (
                    <div className="text-muted-foreground italic">No lifestyle data recorded</div>
                  )}
                </div>
              </div>

              {patient.externalHistory && patient.externalHistory.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">BHYT Medical History</h2>
                    <div className="text-xs text-purple-600 font-medium bg-purple-50 px-2 py-1 rounded">
                      Public Database
                    </div>
                  </div>
                  <div className="border border-purple-200 rounded-lg bg-purple-50/50 p-4 shadow-sm">
                    <div className="border rounded-md overflow-hidden bg-white text-xs">
                      <table className="w-full text-left">
                        <thead className="bg-purple-100">
                          <tr>
                            <th className="p-2 font-semibold">Date</th>
                            <th className="p-2 font-semibold">Facility</th>
                            <th className="p-2 font-semibold">Diagnosis</th>
                            <th className="p-2 font-semibold">Treatment</th>
                          </tr>
                        </thead>
                        <tbody>
                          {patient.externalHistory.map((record, i) => (
                            <tr key={i} className="border-t">
                              <td className="p-2 text-muted-foreground">{record.date}</td>
                              <td className="p-2">{record.facility}</td>
                              <td className="p-2 font-medium">{record.diagnosis}</td>
                              <td className="p-2 text-muted-foreground">{record.treatment}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <p className="text-xs text-purple-600 mt-2 italic">
                      This information is retrieved from the national health insurance database and is read-only.
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Recent Notes</h2>
                <div className="border rounded-lg bg-background p-4 shadow-sm">
                  <ClinicalNotesView
                    patient={patient}
                    onUpdateNotes={(notes) => {
                      setPatients((prev) => prev.map((p) => (p.id === patient.id ? { ...p, clinicalNotes: notes } : p)))
                    }}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Documents</h2>
                  <Button variant="outline" size="sm" onClick={() => setIsUploadOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Document
                  </Button>
                </div>
                <div className="border rounded-lg bg-background p-4 shadow-sm">
                  <DocumentsView documents={documents} onAddToCart={handleAddToCart} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {showCatalog && (
          <div className="w-[450px] flex-shrink-0 transition-all duration-300 ease-in-out border-l bg-background">
            <CatalogView
              onAddToCart={handleAddToCart}
              cartItems={cartItems}
              onRemoveFromCart={handleRemoveFromCart}
              onClearCart={handleClearCart}
              onPlaceOrder={(order) => {
                handlePlaceOrder(order)
                setCartItems([])
              }}
              prescriptions={prescriptions}
              onSubmitPrescription={handleSubmitPrescription}
              onClose={() => setShowCatalog(false)}
            />
          </div>
        )}
      </div>

      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="doc-title">Document Title</Label>
              <Input
                id="doc-title"
                placeholder="e.g. Blood Test Results"
                value={newDoc.title}
                onChange={(e) => setNewDoc({ ...newDoc, title: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="doc-type">Document Type</Label>
              <Select value={newDoc.type} onValueChange={(val) => setNewDoc({ ...newDoc, type: val })}>
                <SelectTrigger id="doc-type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Report">Medical Report</SelectItem>
                  <SelectItem value="Imaging">Imaging/X-Ray</SelectItem>
                  <SelectItem value="Lab">Lab Results</SelectItem>
                  <SelectItem value="Prescription">Prescription</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="doc-file">File</Label>
              <Input id="doc-file" type="file" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUploadDocument}>
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
