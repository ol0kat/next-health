"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { PatientHeader } from "./patient-header"
import { Sidebar } from "./sidebar"
import { LabResultsView } from "./lab-results-view"
import { PrescriptionsView } from "./prescriptions-view"
import { ClinicalNotesView } from "./clinical-notes-view"
import { DocumentsView } from "./documents-view"
import { AgendaView } from "./agenda-view"
import { BreadcrumbNav } from "./breadcrumb-nav"
import { PatientListView } from "./patient-list-view"
import { PlaceholderView } from "./placeholder-view"
import { CatalogView } from "./catalog-view"
import { OrdersView, type Order } from "./orders-view"
import { GiftIcon, HeartIcon, Copy, Check } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { SettingsView } from "./settings-view" // Import SettingsView
import { ReceptionistView } from "./receptionist-view"
import { FinanceView } from "./finance-view" // Import FinanceView

type MainView = "receptionist" | "patients" | "patient-detail" | "agenda" | "settings" | "chat" | "catalog" | "finance" | "imaging" // Added imaging type
export type UnitSystem = "US" | "SI"

export interface Prescription {
  ma_don_thuoc: string // Prescription national ID (79bdq[random]-c)
  ngay_gio_ke_don: string
  thong_tin_don_thuoc: Array<{
    ten_thuoc: string
    biet_duoc: string
    don_vi_tinh: string
    so_luong: string
    cach_dung: string
  }>
  chan_doan: Array<{
    ma_chan_doan: string
    ten_chan_doan: string
  }>
  tests?: string[]
  procedures?: string[]
  notes?: string
}

export function TelehealthDashboard() {
  const [mainView, setMainView] = useState<MainView>("patient-detail")
  const [unitSystem, setUnitSystem] = useState<UnitSystem>("US")

  const [cartItems, setCartItems] = useState<string[]>([])
  const [isCatalogOpen, setIsCatalogOpen] = useState(false)
  const [orders, setOrders] = useState<Order[]>([])
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])

  const [patients, setPatients] = useState([
    {
      id: "b2c3d4e5-f6a7-4901-bcde-f23456789012",
      name: "Sarah Johnson",
      dob: "1983-03-15",
      phone: "0912345678",
      gender: "F",
      age: 42,
      lastVisit: "Dec 10, 2024",
      examDate: "2024-12-10",
      patientStatus: "Active",
      paymentStatus: "Paid",
    },
  ])

  const [isReferOpen, setIsReferOpen] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const referralLink = "https://telehealth.app/ref/dr-smith-123"

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  const handleAddToCart = (testName: string) => {
    setCartItems((prev) => [...prev, testName])
    setIsCatalogOpen(true) // Open the catalog panel instead of cart sheet
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
      tests: orderData.tests,
      date: new Date().toLocaleDateString(),
      status: "pending-payment",
      timeframe: orderData.timeframe,
      notes: orderData.notes,
    }
    setOrders((prev) => [newOrder, ...prev])
  }

  const handleSubmitPrescription = (prescriptionData: {
    tests: string[]
    medicines: string[]
    diagnoses: Array<{ code: string; name: string }>
    procedures: string[]
    notes: string
    timeframe: string
    surgicalRouting?: { facility: string; department: string; urgency: string }
  }) => {
    // Generate national prescription ID: 79bdq[random 8 chars]-c
    const generatePrescriptionId = () => {
      const randomChars = Math.random().toString(36).substring(2, 10)
      return `79bdq${randomChars}-c`
    }

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
      patientId: "b2c3d4e5-f6a7-4901-bcde-f23456789012", // Current patient ID
      patientName: "Sarah Johnson", // Current patient name
      tests: [...prescriptionData.tests, ...prescriptionData.procedures],
      date: new Date().toLocaleDateString(),
      status: "pending-payment",
      timeframe: prescriptionData.timeframe,
      notes: prescriptionData.notes,
      ...(prescriptionData.surgicalRouting && {
        surgicalRouting: prescriptionData.surgicalRouting,
      }),
    }
    setOrders((prev) => [newOrder, ...prev])
  }

  const handleCancelOrder = (orderId: string) => {
    setOrders((prev) => prev.map((order) => (order.id === orderId ? { ...order, status: "cancelled" } : order)))
  }

  const getBreadcrumbs = () => {
    switch (mainView) {
      case "receptionist":
        return [{ label: "Receptionist", active: true }]
      case "agenda":
        return [{ label: "My Calendar", active: true }]
      case "finance":
        return [{ label: "Finance & Rewards", active: true }]
      case "settings":
        return [{ label: "Settings", active: true }]
      case "chat":
        return [{ label: "Messages", active: true }]
      case "patients":
        return [{ label: "My Patients", active: true }]
      case "patient-detail":
        return [
          { label: "My Patients", onClick: () => setMainView("patients") },
          { label: "Sarah Johnson", active: true },
        ]
      default:
        return []
    }
  }

  const getActiveSidebarItem = () => {
    if (mainView === "patient-detail") return "patients"
    return mainView
  }

  const headerActions = (
    <>
      <Dialog open={isReferOpen} onOpenChange={setIsReferOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
            <GiftIcon className="h-4 w-4" />
            Refer
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Refer a Colleague</DialogTitle>
            <DialogDescription>
              Share this unique link to refer other healthcare professionals to the platform.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2">
            <div className="grid flex-1 gap-2">
              <Label htmlFor="link" className="sr-only">
                Link
              </Label>
              <Input id="link" defaultValue={referralLink} readOnly />
            </div>
            <Button type="submit" size="sm" className="px-3" onClick={handleCopyLink}>
              {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              <span className="sr-only">Copy</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Button variant="outline" size="sm" className="gap-2 bg-transparent">
        <HeartIcon className="h-4 w-4" />
        Feedback
      </Button>
    </>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <Sidebar
        activeItem={getActiveSidebarItem()}
        onNavigate={(view) => setMainView(view as MainView)}
        unitSystem={unitSystem}
        onUnitChange={setUnitSystem}
      />

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Breadcrumbs */}
        <BreadcrumbNav items={getBreadcrumbs()} actions={headerActions} />
        {mainView === "agenda" && <AgendaView />}
        {mainView === "receptionist" && <ReceptionistView patients={patients} setPatients={setPatients} />}
        {mainView === "finance" && <FinanceView />}
        {mainView === "imaging" && <PlaceholderView title="Imaging Results" />}
        {mainView === "patients" && (
          <PatientListView patients={patients} onSelectPatient={() => setMainView("patient-detail")} />
        )}
        {mainView === "settings" && <SettingsView unitSystem={unitSystem} onUnitChange={setUnitSystem} />}
        {mainView === "chat" && <PlaceholderView title="Messages" />}
        {mainView === "patient-detail" && (
          <>
            {/* Patient Header */}
            <PatientHeader
              onPrescribe={() => setIsCatalogOpen(true)}
              unitSystem={unitSystem}
              onUnitChange={setUnitSystem}
            />

            {/* Dashboard Snapshot View + Catalog Panel */}
            <div className="flex flex-1 overflow-hidden">
              {/* Dashboard Snapshot View */}
              <div className="flex-1 overflow-y-auto bg-muted/10 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {/* Lab Results - Spans 2 columns on large screens */}
                  <div className="md:col-span-2 xl:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold">Lab Results & Vitals</h2>
                    </div>
                    <div className="border rounded-lg bg-background p-4 shadow-sm">
                      <LabResultsView
                        onAddToCart={handleAddToCart}
                        unitSystem={unitSystem}
                        patientId="b2c3d4e5-f6a7-4901-bcde-f23456789012"
                      />
                    </div>
                  </div>

                  {/* Right Column Stack */}
                  <div className="space-y-6">
                    {/* Current Symptoms Section */}
                    <div className="space-y-4">
                      <h2 className="text-lg font-semibold">Current Symptoms</h2>
                      <div className="border rounded-lg bg-background p-4 shadow-sm text-sm">
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                          <li>Persistent dry cough (3 days)</li>
                          <li>Low-grade fever (99.5°F / 37.5°C)</li>
                          <li>Fatigue and general malaise</li>
                        </ul>
                      </div>
                    </div>

                    {/* Medical History Section */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold">Medical History</h2>
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">Source: BHYT</span>
                      </div>
                      <div className="border rounded-lg bg-background p-4 shadow-sm text-sm">
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                          <li>Hypertension (Diagnosed 2019)</li>
                          <li>Type 2 Diabetes (Diagnosed 2021) - Managed</li>
                          <li>Allergy: Penicillin (Severe)</li>
                        </ul>
                      </div>
                    </div>

                    {/* Family Medical History Section */}
                    <div className="space-y-4">
                      <h2 className="text-lg font-semibold">Family Medical History</h2>
                      <div className="border rounded-lg bg-background p-4 shadow-sm text-sm">
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                          <li>Father: Hypertension, Myocardial Infarction (Age 65)</li>
                          <li>Mother: Type 2 Diabetes</li>
                          <li>Maternal Grandmother: Breast Cancer</li>
                        </ul>
                      </div>
                    </div>

                    {/* Vaccinations Records Section */}
                    <div className="space-y-4">
                      <h2 className="text-lg font-semibold">Vaccinations Records</h2>
                      <div className="border rounded-lg bg-background p-4 shadow-sm text-sm">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center border-b pb-2 last:border-0 last:pb-0">
                            <span className="font-medium">Influenza</span>
                            <span className="text-muted-foreground text-xs">Oct 15, 2024</span>
                          </div>
                          <div className="flex justify-between items-center border-b pb-2 last:border-0 last:pb-0">
                            <span className="font-medium">Tdap</span>
                            <span className="text-muted-foreground text-xs">Mar 10, 2022</span>
                          </div>
                          <div className="flex justify-between items-center border-b pb-2 last:border-0 last:pb-0">
                            <span className="font-medium">COVID-19 Bivalent</span>
                            <span className="text-muted-foreground text-xs">Nov 05, 2023</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Lifestyle Section */}
                    <div className="space-y-4">
                      <h2 className="text-lg font-semibold">Lifestyle</h2>
                      <div className="border rounded-lg bg-background p-4 shadow-sm text-sm">
                        <div className="grid grid-cols-[100px_1fr] gap-y-2 items-center">
                          <div className="text-muted-foreground">Smoking:</div>
                          <div className="font-medium">Former Smoker (Quit 2015)</div>
                          <div className="text-muted-foreground">Alcohol:</div>
                          <div className="font-medium">Social / Occasional</div>
                          <div className="text-muted-foreground">Exercise:</div>
                          <div className="font-medium">Moderate (3x/week)</div>
                          <div className="text-muted-foreground">Diet:</div>
                          <div className="font-medium">Low Sodium, Diabetic Friendly</div>
                        </div>
                      </div>
                    </div>

                    {/* Scheduled Orders section - shows when orders exist */}
                    {orders.length > 0 && (
                      <div className="space-y-4">
                        <h2 className="text-lg font-semibold">Scheduled Orders</h2>
                        <div className="border rounded-lg bg-background p-4 shadow-sm">
                          <OrdersView orders={orders} onCancelOrder={handleCancelOrder} />
                        </div>
                      </div>
                    )}

                    {/* Prescriptions */}
                    <div className="space-y-4">
                      <h2 className="text-lg font-semibold">Prescriptions</h2>
                      <div className="border rounded-lg bg-background p-4 shadow-sm">
                        <PrescriptionsView prescriptions={prescriptions} />
                      </div>
                    </div>

                    {/* Clinical Notes */}
                    <div className="space-y-4">
                      <h2 className="text-lg font-semibold">Recent Notes</h2>
                      <div className="border rounded-lg bg-background p-4 shadow-sm">
                        <ClinicalNotesView />
                      </div>
                    </div>

                    {/* Documents */}
                    <div className="space-y-4">
                      <h2 className="text-lg font-semibold">Documents</h2>
                      <div className="border rounded-lg bg-background p-4 shadow-sm">
                        <DocumentsView onAddToCart={handleAddToCart} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Catalog Panel */}
              {isCatalogOpen && (
                <div className="w-[450px] flex-shrink-0 transition-all duration-300 ease-in-out border-l bg-background">
                  <CatalogView
                    onAddToCart={handleAddToCart}
                    cartItems={cartItems}
                    onRemoveFromCart={handleRemoveFromCart}
                    onPlaceOrder={(order) => {
                      handlePlaceOrder(order)
                      setCartItems([]) // Clear cart after ordering
                    }}
                    prescriptions={prescriptions}
                    onSubmitPrescription={handleSubmitPrescription}
                    onClose={() => setIsCatalogOpen(false)}
                  />
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
