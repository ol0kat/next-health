"use client"

import type React from "react"
import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  User, QrCode, Search, Loader2, X, CheckCircle2,
  Clock, MapPin, Smartphone, History, Lock, Unlock,
  ShieldCheck, AlertCircle, ShoppingCart, Copy, FileText,
  UserPlus, Activity, Save, Beaker, FileSignature, 
  TabletSmartphone, Wifi, Lightbulb, Stethoscope, PlusCircle, Sparkles
} from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// --- MOCK DATA ---
interface LabTest {
  id: string
  name: string
  shortName?: string
  price: number
  category: string
  sampleType: string
  turnaroundHours: number
  requiresConsent?: boolean 
  popular?: boolean
  description?: string
}

const labTestsData: LabTest[] = [
  { id: "hiv", name: "HIV Ab/Ag Combo", shortName: "HIV Combo", price: 200000, category: "Serology", sampleType: "Serum", turnaroundHours: 4, requiresConsent: true, description: "Screening for HIV 1/2 antibodies & p24 antigen" }, 
  { id: "cbc", name: "Complete Blood Count", shortName: "CBC", price: 120000, category: "Hematology", sampleType: "Whole Blood", turnaroundHours: 4, popular: true, description: "Overall health, anemia, infection" },
  { id: "hba1c", name: "Hemoglobin A1c", shortName: "HbA1c", price: 180000, category: "Biochemistry", sampleType: "Whole Blood", turnaroundHours: 24, popular: true, description: "3-month average blood sugar" },
  { id: "lipid", name: "Lipid Panel", shortName: "Lipid", price: 250000, category: "Biochemistry", sampleType: "Serum", turnaroundHours: 24, popular: true, description: "Cholesterol, Triglycerides" },
  { id: "cmp", name: "Comprehensive Metabolic Panel", shortName: "CMP", price: 320000, category: "Biochemistry", sampleType: "Serum", turnaroundHours: 24, popular: true, description: "Liver & Kidney function, Electrolytes" },
  { id: "syphilis", name: "Syphilis RPR", shortName: "Syphilis", price: 150000, category: "Serology", sampleType: "Serum", turnaroundHours: 24, requiresConsent: true, description: "Screening for Syphilis" },
  { id: "urine", name: "Urinalysis", shortName: "Urine", price: 80000, category: "Microbiology", sampleType: "Urine", turnaroundHours: 2, popular: true, description: "UTI, Kidney disease" },
  { id: "dengue", name: "Dengue NS1 Ag", shortName: "Dengue", price: 250000, category: "Serology", sampleType: "Serum", turnaroundHours: 2, description: "Acute Dengue fever screening" },
]

// --- MEDICAL INTENT PROTOCOLS ---
// This maps an "Intent" to specific Test IDs
const medicalIntents = [
    { id: "general_checkup", label: "General Health Checkup", description: "Standard wellness panel for routine visits.", recommended: ["cbc", "lipid", "cmp", "hba1c", "urine"] },
    { id: "std_screening", label: "STD / Sexual Health", description: "Confidential screening protocol.", recommended: ["hiv", "syphilis"] },
    { id: "fever_infection", label: "Fever & Infection", description: "Acute febrile illness investigation.", recommended: ["cbc", "urine", "dengue"] },
    { id: "chronic_diabetes", label: "Diabetes Monitoring", description: "Quarterly check for diabetic patients.", recommended: ["hba1c", "lipid", "urine"] },
]

// Mock History
const mockBhytHistory = [
  { diagnosis: "Viêm phế quản cấp", date: "15/01/2024", facility: "79071 • Đỡ" },
  { diagnosis: "Sốt xuất huyết Dengue", date: "20/05/2023", facility: "79010 • Khỏi" }
]
const mockNextHealthOrders = [
  { id: "ORD-NX-99", date: "10/11/2023", items: ["hiv", "syphilis"], doctor: "Dr. Vo" },
  { id: "ORD-NX-88", date: "05/06/2023", items: ["cbc", "hba1c"], doctor: "Dr. Tran" }
]

const formatCurrency = (amount: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)

// --- IDENTITY CARD COMPONENT (Unchanged) ---
function IdentityVerificationCard({ data, scanStep, onClear, onInternalHistoryClick, internalAccess }: any) {
    if (scanStep === "idle" && !data.bhyt) return null
    const isComplete = scanStep === "complete"
    
    return (
      <div className="mb-6 animate-in fade-in slide-in-from-top-4 font-sans">
        <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
           <div className={cn("px-4 py-3 flex justify-between text-white text-sm font-bold uppercase tracking-wide", isComplete ? "bg-[#009860]" : "bg-blue-600")}>
               <div className="flex items-center gap-2">
                   {isComplete ? <CheckCircle2 className="h-5 w-5" /> : <Loader2 className="h-4 w-4 animate-spin"/>}
                   <span>{isComplete ? "Identity & Insurance Verified" : "Processing Verification..."}</span>
               </div>
               {isComplete && <button onClick={onClear}><X className="h-5 w-5 text-white/80 hover:text-white" /></button>}
           </div>
           <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
              <div className="p-5 space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider"><User className="h-4 w-4" /> Citizen Identity (CCCD)</div>
                <div><div className="font-bold text-xl text-slate-900 uppercase">{data.name || "..."}</div><div className="text-sm text-slate-500 mt-1 flex items-center gap-2"><Clock className="h-3.5 w-3.5"/> {data.dob}</div></div>
                <div><div className="text-xs text-slate-400 font-bold">Citizen ID Number</div><div className="font-mono text-lg text-slate-700 font-medium tracking-wide mt-1">{data.citizenId}</div></div>
              </div>
              <div className="p-5 space-y-4 bg-slate-50/30">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-500 uppercase tracking-wider"><ShieldCheck className="h-4 w-4" /> Health Insurance</div>
                {data.bhyt ? (
                    <>
                        <div><div className="text-xs text-slate-400 font-bold mb-1">Card Number</div><div className="font-bold text-xl text-blue-600 font-mono tracking-tight">{data.bhyt.code}</div></div>
                        <div className="grid grid-cols-2 gap-4"><div><div className="text-xs text-slate-400">Coverage</div><div className="font-bold text-emerald-600">{data.bhyt.coverageLabel}</div></div><div><div className="text-xs text-slate-400">Expiry</div><div className="font-medium text-slate-700">{data.bhyt.expiry}</div></div></div>
                    </>
                ) : (<div className="h-32 flex items-center justify-center text-slate-400 italic text-sm">Verifying Insurance...</div>)}
              </div>
              <div className="p-5 flex flex-col h-full justify-between bg-slate-50/50">
                <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-indigo-500 uppercase tracking-wider"><History className="h-4 w-4" /> Medical History (BHYT)</div>
                    {data.bhyt ? (
                        <div className="space-y-2">{mockBhytHistory.map((item, idx) => (<div key={idx} className="bg-white p-2 rounded border shadow-sm border-l-4 border-l-blue-500 text-xs"><div className="flex justify-between font-bold text-slate-800"><span>{item.diagnosis}</span><span className="text-[10px] text-slate-400">{item.date}</span></div><div className="text-slate-500 mt-1">{item.facility}</div></div>))}</div>
                    ) : <div className="h-20 bg-slate-200 rounded animate-pulse"/>}
                </div>
                <div className="mt-auto pt-3 border-t border-slate-200">
                    <div className="flex justify-between items-center mb-2"><span className="text-[10px] font-bold text-slate-400 uppercase">Internal Records</span>{internalAccess === 'unlocked' && <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 text-[10px] px-1 py-0">Authorized</Badge>}</div>
                    {internalAccess === 'locked' ? (
                        <Button onClick={onInternalHistoryClick} disabled={!data.bhyt} variant="outline" size="sm" className="w-full h-8 text-xs border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 border-dashed"><Lock className="h-3 w-3 mr-2" /> Request Access</Button>
                    ) : (
                        <div className="bg-emerald-50 border border-emerald-100 rounded p-2 text-center cursor-pointer hover:bg-emerald-100" onClick={onInternalHistoryClick}><div className="text-emerald-700 font-bold text-xs flex items-center justify-center gap-2"><FileText className="h-3 w-3"/> View Past Orders</div></div>
                    )}
                </div>
              </div>
           </div>
        </div>
      </div>
    )
}

// --- MAIN PAGE ---
export function ReceptionistView() {
  const { toast } = useToast()
  
  // States
  const [scanStep, setScanStep] = useState<any>("idle")
  const [scannedIdentity, setScannedIdentity] = useState<any>(null)
  
  // Form Data (Added medicalIntent)
  const [formData, setFormData] = useState<any>({ 
      fullName: "", dob: "", citizenId: "", gender: "male", 
      phone: "", address: "", emergencyContactName: "", 
      chiefComplaint: "", medicalIntent: "" 
  })
  
  // Lab Cart State
  const [selectedTests, setSelectedTests] = useState<LabTest[]>([])
  const [testSearchQuery, setTestSearchQuery] = useState("")
  const [consentStatus, setConsentStatus] = useState<Record<string, 'pending' | 'requesting' | 'signed'>>({})
  
  // Auth State
  const [internalAccess, setInternalAccess] = useState<'locked' | 'unlocked'>('locked')
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const [showInternalHistoryModal, setShowInternalHistoryModal] = useState(false)
  const [otpStep, setOtpStep] = useState<'method' | 'verify'>('method')
  const [otpInput, setOtpInput] = useState("")

  // --- LOGIC: RECOMMENDATIONS ---
  // Memoize suggestions based on selected intent
  const suggestedTests = useMemo(() => {
      if (!formData.medicalIntent) return []
      const intentObj = medicalIntents.find(i => i.id === formData.medicalIntent)
      if (!intentObj) return []
      
      // Filter out tests already in cart to avoid duplicates in the suggestion list
      return intentObj.recommended
          .map(id => labTestsData.find(t => t.id === id))
          .filter(t => t !== undefined) as LabTest[]
  }, [formData.medicalIntent])

  // Logic: Calculate total price
  const totalTestsPrice = selectedTests.reduce((sum, t) => sum + t.price, 0)
  const filteredTests = labTestsData.filter(t => t.name.toLowerCase().includes(testSearchQuery.toLowerCase())).slice(0, 5)

  // Handlers
  const processIdentityVerification = (sourceData: any) => {
      setScanStep("cccd")
      setTimeout(() => {
          const verifiedData = { 
              name: sourceData.name || formData.fullName || "TRẦN THỊ NGỌC LAN", 
              dob: sourceData.dob || formData.dob || "15/05/1992", 
              citizenId: sourceData.citizenId || formData.citizenId || "079192000123"
          }
          setScannedIdentity(verifiedData)
          setFormData((prev: any) => ({...prev, fullName: verifiedData.name, citizenId: verifiedData.citizenId, dob: verifiedData.dob}))
          setScanStep("checking-bhyt")
          setTimeout(() => {
              setScannedIdentity((prev:any) => ({
                  ...prev, 
                  bhyt: { code: "DN4797915071630", coverageLabel: "80% (Lvl 4)", expiry: "31/12/2025", hospital: "BV Hoàn Mỹ Sài Gòn (79071)" }
              }))
              setScanStep("complete")
              toast({ title: "Verification Successful", description: "Identity and Insurance confirmed." })
          }, 1200)
      }, 1000)
  }

  const addTest = (test: LabTest) => {
    if (!selectedTests.find(t => t.id === test.id)) {
        setSelectedTests(prev => [...prev, test])
        if (test.requiresConsent) {
            setConsentStatus(prev => ({ ...prev, [test.id]: 'pending' }))
        }
    }
  }

  // New: Add entire protocol
  const addAllSuggested = () => {
      let count = 0
      suggestedTests.forEach(test => {
          if (!selectedTests.find(t => t.id === test.id)) {
              addTest(test)
              count++
          }
      })
      if(count > 0) toast({ title: "Protocol Applied", description: `Added ${count} recommended tests to cart.` })
  }

  const removeTest = (id: string) => {
      setSelectedTests(prev => prev.filter(t => t.id !== id))
      const newConsent = { ...consentStatus }
      delete newConsent[id]
      setConsentStatus(newConsent)
  }

  const requestConsent = (testId: string) => {
      setConsentStatus(prev => ({ ...prev, [testId]: 'requesting' }))
      toast({ title: "Request Sent", description: "Sent to patient tablet." })
      setTimeout(() => { setConsentStatus(prev => ({ ...prev, [testId]: 'signed' })) }, 2000)
  }

  const verifyOtp = () => {
      if(otpInput === "123456") {
          setInternalAccess('unlocked')
          setShowAuthDialog(false)
          setShowInternalHistoryModal(true)
          toast({ title: "Authorized", description: "Records unlocked.", className: "bg-emerald-600 text-white" })
      } else {
          toast({ title: "Invalid Code", variant: "destructive" })
      }
  }

  return (
    <TooltipProvider>
      <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
        
        {/* --- LEFT SIDE: MAIN CONTENT --- */}
        <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
            <div className="max-w-5xl mx-auto space-y-6 pb-24">
                
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div><h1 className="text-2xl font-bold text-slate-900">Patient Admission</h1><p className="text-slate-500">Reception & Triage</p></div>
                    <Button onClick={() => processIdentityVerification({})} disabled={scanStep !== 'idle' && scanStep !== 'complete'} className={cn("min-w-[160px]", scanStep === 'idle' || scanStep === 'complete' ? "bg-blue-600 hover:bg-blue-700" : "bg-slate-800")}>
                        {scanStep !== 'idle' && scanStep !== 'complete' ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <QrCode className="mr-2 h-4 w-4"/>}
                        {scanStep === 'idle' || scanStep === 'complete' ? "Scan CCCD" : "Scanning..."}
                    </Button>
                </div>

                {/* Identity Card */}
                <IdentityVerificationCard 
                    data={scannedIdentity || {}} 
                    scanStep={scanStep} 
                    onClear={() => {setScannedIdentity(null); setScanStep('idle'); setInternalAccess('locked')}}
                    onInternalHistoryClick={() => { internalAccess === 'unlocked' ? setShowInternalHistoryModal(true) : (setShowAuthDialog(true), setOtpStep('method')) }}
                    internalAccess={internalAccess}
                />

                {/* FORM AREA */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Patient Demographics */}
                    <Card className="border-t-4 border-t-blue-500 shadow-sm md:col-span-2">
                        <CardHeader className="pb-2"><CardTitle className="text-sm uppercase text-blue-600 flex items-center gap-2"><User className="h-4 w-4"/> Patient Demographics</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><Label className="text-xs text-slate-500">Full Name</Label><Input value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="font-bold uppercase" placeholder="Enter name..."/></div>
                            <div>
                                <Label className="text-xs text-slate-500">Citizen ID (CCCD)</Label>
                                <div className="flex gap-2">
                                    <Input value={formData.citizenId} onChange={e => setFormData({...formData, citizenId: e.target.value})} className="font-mono" placeholder="000..."/>
                                    <Button onClick={() => processIdentityVerification({})} disabled={scanStep !== 'idle'} variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200">{scanStep === 'idle' ? "Check BHYT" : <Loader2 className="h-4 w-4 animate-spin"/>}</Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Clinical Intake & Intent - REDESIGNED */}
                    <Card className="border-t-4 border-t-emerald-500 shadow-sm md:col-span-2">
                        <CardHeader className="pb-2"><CardTitle className="text-sm uppercase text-emerald-600 flex items-center gap-2"><Stethoscope className="h-4 w-4"/> Clinical Intake & Intent</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            {/* NEW: Intent Selector */}
                            <div className="bg-emerald-50/50 p-4 rounded-lg border border-emerald-100">
                                <Label className="text-sm font-bold text-emerald-800 mb-2 block flex items-center gap-2">
                                    <Activity className="h-4 w-4"/> Medical Intent / Reason for Visit
                                </Label>
                                <Select value={formData.medicalIntent} onValueChange={(val) => setFormData({...formData, medicalIntent: val})}>
                                    <SelectTrigger className="bg-white border-emerald-200">
                                        <SelectValue placeholder="Select primary reason (e.g. Checkup, Symptoms...)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {medicalIntents.map(intent => (
                                            <SelectItem key={intent.id} value={intent.id}>
                                                <span className="font-semibold">{intent.label}</span> 
                                                <span className="text-slate-400 ml-2 text-xs">- {intent.description}</span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div><Label className="text-xs text-slate-500">Chief Complaint Details</Label><Textarea className="h-24" placeholder="Specific symptoms, duration, notes..." value={formData.chiefComplaint} onChange={e => setFormData({...formData, chiefComplaint: e.target.value})} /></div>
                                <div className="bg-slate-50 p-4 rounded-lg border grid grid-cols-2 gap-3">
                                    <div><Label className="text-[10px] uppercase">Height (cm)</Label><Input className="h-8 bg-white"/></div>
                                    <div><Label className="text-[10px] uppercase">Weight (kg)</Label><Input className="h-8 bg-white"/></div>
                                    <div><Label className="text-[10px] uppercase">Temp (°C)</Label><Input className="h-8 bg-white"/></div>
                                    <div><Label className="text-[10px] uppercase">BP (mmHg)</Label><Input className="h-8 bg-white"/></div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Lab Search Area & Recommendations */}
                    <Card className="border-t-4 border-t-indigo-500 shadow-sm md:col-span-2 mb-20">
                        <CardHeader className="pb-2"><CardTitle className="text-sm uppercase text-indigo-600 flex items-center gap-2"><Beaker className="h-4 w-4"/> Lab Order Entry</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            
                            {/* NEW: SUGGESTED TESTS BLOCK */}
                            {formData.medicalIntent && suggestedTests.length > 0 && (
                                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 animate-in fade-in slide-in-from-top-2">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h4 className="text-sm font-bold text-indigo-800 flex items-center gap-2">
                                                <Sparkles className="h-4 w-4 text-indigo-600 fill-indigo-200"/> 
                                                Protocol Recommendations
                                            </h4>
                                            <p className="text-xs text-indigo-600/80 mt-1">
                                                Based on intent: <span className="font-semibold">{medicalIntents.find(i => i.id === formData.medicalIntent)?.label}</span>
                                            </p>
                                        </div>
                                        <Button size="sm" onClick={addAllSuggested} className="bg-indigo-600 hover:bg-indigo-700 text-white h-7 text-xs">
                                            <PlusCircle className="h-3 w-3 mr-1.5"/> Add All
                                        </Button>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                        {suggestedTests.map(test => {
                                            const isInCart = selectedTests.some(t => t.id === test.id)
                                            return (
                                                <button 
                                                    key={test.id} 
                                                    onClick={() => !isInCart && addTest(test)}
                                                    disabled={isInCart}
                                                    className={cn("text-left p-2 rounded border transition-all flex justify-between items-center", 
                                                        isInCart ? "bg-indigo-100/50 border-indigo-100 opacity-60" : "bg-white border-indigo-200 hover:border-indigo-400 hover:shadow-sm"
                                                    )}
                                                >
                                                    <div>
                                                        <div className="text-xs font-bold text-slate-700">{test.name}</div>
                                                        <div className="text-[10px] text-slate-500">{formatCurrency(test.price)}</div>
                                                    </div>
                                                    {isInCart ? <CheckCircle2 className="h-4 w-4 text-indigo-400"/> : <PlusCircle className="h-4 w-4 text-indigo-600"/>}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Standard Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                <Input className="pl-10 h-10" placeholder="Search manual tests (HIV, CBC, Urea...)" value={testSearchQuery} onChange={e => setTestSearchQuery(e.target.value)}/>
                                {testSearchQuery && filteredTests.length > 0 && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-xl max-h-60 overflow-y-auto">
                                        {filteredTests.map(t => (
                                            <button key={t.id} onClick={() => {addTest(t); setTestSearchQuery("")}} className="w-full px-4 py-2 text-left hover:bg-slate-50 flex justify-between items-center border-b">
                                                <div className="font-bold text-sm text-slate-700">{t.name}</div>
                                                <div className="font-bold text-emerald-600 text-sm">{formatCurrency(t.price)}</div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>

        {/* --- RIGHT SIDEBAR CART (Unchanged) --- */}
        <div className="w-[400px] border-l bg-white shadow-xl flex flex-col z-20">
            <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
                <div className="flex items-center gap-2 font-bold text-slate-800"><ShoppingCart className="h-5 w-5 text-blue-600" /><span>Order Cart</span><Badge className="bg-blue-600 text-white ml-2">{selectedTests.length}</Badge></div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {selectedTests.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4 opacity-50"><FileText className="h-16 w-16" /><p>Cart is empty</p></div>
                ) : (
                    selectedTests.map((test) => (
                        <div key={test.id} className={cn("border rounded-lg p-3 relative group transition-all", test.requiresConsent && consentStatus[test.id] !== 'signed' ? "border-amber-200 bg-amber-50" : "border-slate-200 bg-white")}>
                            <div className="flex justify-between items-start mb-1"><h4 className="font-bold text-sm text-slate-800 pr-6">{test.name}</h4><button onClick={() => removeTest(test.id)} className="absolute top-2 right-2 text-slate-300 hover:text-red-500"><X className="h-4 w-4"/></button></div>
                            <div className="flex justify-between items-end"><div className="text-xs text-slate-500 flex items-center gap-1"><Lightbulb className="h-3 w-3 text-amber-500"/> {test.description?.substring(0,25)}...</div><div className="font-bold text-emerald-600 text-sm">{formatCurrency(test.price)}</div></div>
                            {test.requiresConsent && (
                                <div className="mt-3 pt-3 border-t border-amber-200/50">
                                    {consentStatus[test.id] === 'pending' && (
                                        <div className="space-y-2"><div className="flex items-center gap-1.5 text-xs text-amber-700 font-semibold animate-pulse"><AlertCircle className="h-3.5 w-3.5" /> Consent Required</div><Button size="sm" variant="outline" onClick={() => requestConsent(test.id)} className="w-full h-8 text-xs bg-white border-amber-300 text-amber-800 hover:bg-amber-100"><TabletSmartphone className="h-3.5 w-3.5 mr-2" /> Request Signature</Button></div>
                                    )}
                                    {consentStatus[test.id] === 'requesting' && (<div className="bg-white rounded border border-amber-200 p-2 flex flex-col items-center justify-center text-center gap-2"><Wifi className="h-5 w-5 text-blue-500 animate-pulse" /><span className="text-xs text-slate-500">Sent to Tablet...</span></div>)}
                                    {consentStatus[test.id] === 'signed' && (<div className="bg-emerald-100/50 rounded border border-emerald-200 p-2 flex items-center gap-2"><FileSignature className="h-4 w-4 text-emerald-600" /><div className="text-xs font-bold text-emerald-800">Digitally Signed</div></div>)}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
            <div className="p-4 border-t bg-slate-50 space-y-4">
                <div className="space-y-2">
                    <div className="flex justify-between text-sm text-slate-500"><span>Subtotal</span><span>{formatCurrency(totalTestsPrice)}</span></div>
                    {scannedIdentity?.bhyt && (<div className="flex justify-between text-sm text-emerald-600"><span>Insurance (80%)</span><span>- {formatCurrency(totalTestsPrice * 0.8)}</span></div>)}
                    <div className="flex justify-between text-lg font-bold text-slate-900 pt-2 border-t"><span>Total Due</span><span>{formatCurrency(scannedIdentity?.bhyt ? totalTestsPrice * 0.2 : totalTestsPrice)}</span></div>
                </div>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-lg h-12 shadow-lg" disabled={selectedTests.some(t => t.requiresConsent && consentStatus[t.id] !== 'signed')}><Save className="h-4 w-4 mr-2"/> Submit Order</Button>
            </div>
        </div>

        {/* --- DIALOGS (OTP & History) Unchanged --- */}
        <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader><DialogTitle className="flex items-center gap-2"><Lock className="h-5 w-5 text-amber-500"/> NeXT Health Privacy</DialogTitle></DialogHeader>
                {otpStep === 'method' ? (
                    <div className="grid grid-cols-2 gap-4 py-4"><Button variant="outline" className="h-20 flex flex-col" onClick={() => {toast({title:"OTP Sent to Zalo"}); setOtpStep('verify')}}><span className="text-blue-600 font-bold text-lg">Zalo</span></Button><Button variant="outline" className="h-20 flex flex-col" onClick={() => {toast({title:"OTP Sent to SMS"}); setOtpStep('verify')}}><Smartphone className="h-6 w-6 mb-1"/> SMS</Button></div>
                ) : (
                    <div className="space-y-4 py-4"><Input className="text-center text-3xl tracking-[0.5em]" maxLength={6} placeholder="000000" value={otpInput} onChange={e => setOtpInput(e.target.value)} /><Button onClick={verifyOtp} className="w-full bg-emerald-600">Unlock</Button></div>
                )}
            </DialogContent>
        </Dialog>

        <Dialog open={showInternalHistoryModal} onOpenChange={setShowInternalHistoryModal}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader><DialogTitle>Prior NeXT Health Orders</DialogTitle></DialogHeader>
                <div className="space-y-3 py-2 max-h-[60vh] overflow-y-auto">
                    {mockNextHealthOrders.map((order, i) => (
                        <div key={i} className="flex justify-between items-center p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                            <div><div className="font-bold text-slate-800">{order.date}</div><div className="text-xs text-slate-500 mb-2">Ref: {order.id} • {order.doctor}</div><div className="flex gap-2">{order.items.map(itemId => { const test = labTestsData.find(t => t.id === itemId); return <span key={itemId} className="px-2 py-0.5 bg-white border rounded text-[10px] uppercase font-semibold text-slate-600 shadow-sm">{test ? test.shortName : itemId}</span> })}</div></div>
                            <Button size="sm" variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50" onClick={() => { 
                                order.items.forEach(id => { const t = labTestsData.find(x => x.id === id); if(t && !selectedTests.find(x => x.id === t.id)) addTest(t) }); 
                                setShowInternalHistoryModal(false); toast({title: "Added to Cart"}) 
                            }}><Copy className="h-3.5 w-3.5 mr-2"/> Re-order</Button>
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}