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
  TabletSmartphone, Wifi, Sparkles, Stethoscope, PlusCircle,
  Video, CalendarCheck, Receipt, ArrowRight
} from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// --- ENHANCED DATA MODELS ---

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
  // New Insurance Rules
  linkedCondition?: string // ICD-10 or condition ID
  frequencyDays?: number // How often BHYT pays for this
}

const labTestsData: LabTest[] = [
  { id: "hiv", name: "HIV Ab/Ag Combo", shortName: "HIV Combo", price: 200000, category: "Serology", sampleType: "Serum", turnaroundHours: 4, requiresConsent: true, description: "Screening for HIV 1/2 antibodies & p24 antigen" }, 
  { id: "cbc", name: "Complete Blood Count", shortName: "CBC", price: 120000, category: "Hematology", sampleType: "Whole Blood", turnaroundHours: 4, popular: true, description: "Overall health, anemia, infection" },
  
  // Diabetes Test with BHYT Rules
  { id: "hba1c", name: "Hemoglobin A1c", shortName: "HbA1c", price: 180000, category: "Biochemistry", sampleType: "Whole Blood", turnaroundHours: 24, popular: true, description: "3-month average blood sugar", 
    linkedCondition: "E11", // Type 2 Diabetes
    frequencyDays: 90 // Covered once every 90 days
  },
  
  { id: "lipid", name: "Lipid Panel", shortName: "Lipid", price: 250000, category: "Biochemistry", sampleType: "Serum", turnaroundHours: 24, popular: true, description: "Cholesterol, Triglycerides" },
  { id: "cmp", name: "Comprehensive Metabolic Panel", shortName: "CMP", price: 320000, category: "Biochemistry", sampleType: "Serum", turnaroundHours: 24, popular: true, description: "Liver & Kidney function, Electrolytes" },
  { id: "syphilis", name: "Syphilis RPR", shortName: "Syphilis", price: 150000, category: "Serology", sampleType: "Serum", turnaroundHours: 24, requiresConsent: true, description: "Screening for Syphilis" },
]

const medicalIntents = [
    { id: "general_checkup", label: "General Health Checkup", recommended: ["cbc", "lipid", "cmp", "hba1c"] },
    { id: "chronic_diabetes", label: "Diabetes Monitoring", recommended: ["hba1c", "lipid"] }, // Nurse selects this for diabetic patient
    { id: "std_screening", label: "STD / Sexual Health", recommended: ["hiv", "syphilis"] },
]

// Mock Histories
const mockBhytHistory = [
  { diagnosis: "Type 2 Diabetes (E11)", date: "Active", facility: "Chronic Program" },
  { diagnosis: "Sốt xuất huyết Dengue", date: "20/05/2023", facility: "79010 • Khỏi" }
]
const mockNextHealthOrders = [
  { id: "ORD-NX-99", date: "10/11/2023", items: ["hiv", "syphilis"], doctor: "Dr. Vo" },
  { id: "ORD-NX-88", date: "05/06/2023", items: ["cbc", "hba1c"], doctor: "Dr. Tran" } // Note: HbA1c done > 90 days ago
]

const formatCurrency = (amount: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)

// --- COMPONENT: IDENTITY CARD (Updated with Chronic/Referral Info) ---
function IdentityVerificationCard({ data, scanStep, onClear, onInternalHistoryClick, internalAccess }: any) {
    if (scanStep === "idle" && !data.bhyt) return null
    const isComplete = scanStep === "complete"
    
    return (
      <div className="mb-6 animate-in fade-in slide-in-from-top-4 font-sans">
        <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
           <div className={cn("px-4 py-3 flex justify-between text-white text-sm font-bold uppercase tracking-wide", isComplete ? "bg-[#009860]" : "bg-blue-600")}>
               <div className="flex items-center gap-2">{isComplete ? <CheckCircle2 className="h-5 w-5" /> : <Loader2 className="h-4 w-4 animate-spin"/>}<span>{isComplete ? "Identity & Insurance Verified" : "Processing Verification..."}</span></div>
               {isComplete && <button onClick={onClear}><X className="h-5 w-5 text-white/80 hover:text-white" /></button>}
           </div>
           <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
              {/* Identity */}
              <div className="p-5 space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider"><User className="h-4 w-4" /> Citizen Identity</div>
                <div><div className="font-bold text-xl text-slate-900 uppercase">{data.name || "..."}</div><div className="text-sm text-slate-500 mt-1 flex items-center gap-2"><Clock className="h-3.5 w-3.5"/> {data.dob}</div></div>
                <div><div className="text-xs text-slate-400 font-bold">Citizen ID</div><div className="font-mono text-lg text-slate-700 font-medium tracking-wide mt-1">{data.citizenId}</div></div>
              </div>
              
              {/* Insurance & Chronic Status */}
              <div className="p-5 space-y-3 bg-slate-50/30">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-500 uppercase tracking-wider"><ShieldCheck className="h-4 w-4" /> BHYT & Programs</div>
                {data.bhyt ? (
                    <>
                        <div><div className="text-xs text-slate-400 font-bold mb-1">Card Number</div><div className="font-bold text-xl text-blue-600 font-mono tracking-tight">{data.bhyt.code}</div></div>
                        <div className="flex justify-between items-center bg-blue-50 border border-blue-100 p-2 rounded">
                            <div><div className="text-[10px] text-blue-600 font-bold uppercase">Chronic Condition</div><div className="text-sm font-bold text-slate-800">{data.chronicCondition || "None"}</div></div>
                            {data.activeReferral && (
                                <TooltipProvider>
                                    <div className="text-right"><div className="text-[10px] text-blue-600 font-bold uppercase flex items-center gap-1 justify-end"><Video className="h-3 w-3"/> Tele-Referral</div><div className="text-sm font-bold text-emerald-600">{data.activeReferral}</div></div>
                                </TooltipProvider>
                            )}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1">Expiry: {data.bhyt.expiry}</div>
                    </>
                ) : (<div className="h-32 flex items-center justify-center text-slate-400 italic text-sm">Verifying...</div>)}
              </div>
              
              {/* History */}
              <div className="p-5 flex flex-col h-full justify-between bg-slate-50/50">
                <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-indigo-500 uppercase tracking-wider"><History className="h-4 w-4" /> Medical History</div>
                    {data.bhyt ? (
                        <div className="space-y-2">{mockBhytHistory.map((item, idx) => (<div key={idx} className="bg-white p-2 rounded border shadow-sm border-l-4 border-l-blue-500 text-xs"><div className="flex justify-between font-bold text-slate-800"><span>{item.diagnosis}</span><span className="text-[10px] text-slate-400">{item.date}</span></div></div>))}</div>
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
  const [formData, setFormData] = useState<any>({ fullName: "", dob: "", citizenId: "", gender: "male", medicalIntent: "" })
  
  // Cart
  const [selectedTests, setSelectedTests] = useState<LabTest[]>([])
  const [testSearchQuery, setTestSearchQuery] = useState("")
  const [consentStatus, setConsentStatus] = useState<Record<string, 'pending' | 'requesting' | 'signed'>>({})
  
  // Auth
  const [internalAccess, setInternalAccess] = useState<'locked' | 'unlocked'>('locked')
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const [showInternalHistoryModal, setShowInternalHistoryModal] = useState(false)
  const [otpStep, setOtpStep] = useState<'method' | 'verify'>('method')
  const [otpInput, setOtpInput] = useState("")

  // --- ENGINE: INSURANCE ADJUDICATION ---
  const checkInsuranceEligibility = (test: LabTest, patient: any) => {
      // Rule 0: No patient data = No coverage
      if(!patient || !patient.bhyt) return { isCovered: false, reason: "No Insurance" }

      // Rule 1: Specific Chronic Condition Mapping
      if (test.linkedCondition && patient.chronicConditionCode === test.linkedCondition) {
          
          // Rule 2: Frequency Check (Mocking "Last Test Date")
          // In real app, we check mockNextHealthOrders history
          // Here we hardcode HbA1c as "due"
          if (test.id === 'hba1c') {
             // Check if referral exists
             if (patient.activeReferral) {
                 return { 
                     isCovered: true, 
                     coveragePercent: 1.0, // 100% Coverage by Insurer
                     reason: "Diabetes Plan (90 days elapsed)" 
                 }
             } else {
                 return { isCovered: false, reason: "Missing Referral" }
             }
          }
      }

      // Default: Standard Co-pay (e.g. 80%)
      return { isCovered: true, coveragePercent: 0.8, reason: "Standard BHYT" }
  }

  // Calculate Totals based on Adjudication
  const cartTotals = useMemo(() => {
      let subtotal = 0
      let insuranceCoverage = 0
      let patientDue = 0

      selectedTests.forEach(test => {
          subtotal += test.price
          const eligibility = checkInsuranceEligibility(test, scannedIdentity)
          
          if (eligibility.isCovered) {
              const coveredAmount = test.price * (eligibility.coveragePercent || 0)
              insuranceCoverage += coveredAmount
              patientDue += (test.price - coveredAmount)
          } else {
              patientDue += test.price
          }
      })
      return { subtotal, insuranceCoverage, patientDue }
  }, [selectedTests, scannedIdentity])

  // Process Verification (Simulate Chronic Patient)
  const processIdentityVerification = (sourceData: any) => {
      setScanStep("cccd")
      setTimeout(() => {
          const verifiedData = { 
              name: sourceData.name || formData.fullName || "TRẦN THỊ NGỌC LAN", 
              dob: "15/05/1992", 
              citizenId: "079192000123"
          }
          setScannedIdentity(verifiedData)
          setFormData((prev: any) => ({...prev, fullName: verifiedData.name, citizenId: verifiedData.citizenId}))
          setScanStep("checking-bhyt")
          
          setTimeout(() => {
              // --- MOCK BHYT RETURN WITH CHRONIC DATA ---
              setScannedIdentity((prev:any) => ({
                  ...prev, 
                  bhyt: { code: "DN4797915071630", coverageLabel: "80% (Lvl 4)", expiry: "31/12/2025", hospital: "BV Hoàn Mỹ" },
                  chronicCondition: "Type 2 Diabetes", // Human readable
                  chronicConditionCode: "E11", // ICD-10
                  activeReferral: "TD-2401-99" // Teledoc ID
              }))
              // Auto-select Intent if diabetic
              setFormData((prev:any) => ({...prev, medicalIntent: 'chronic_diabetes'}))
              
              setScanStep("complete")
              toast({ title: "Chronic Profile Found", description: "Patient eligible for Diabetes Management Program." })
          }, 1200)
      }, 1000)
  }

  // ... (Add Test, Remove Test, Auth logic same as before)
  const addTest = (test: LabTest) => { if (!selectedTests.find(t => t.id === test.id)) { setSelectedTests(prev => [...prev, test]); if (test.requiresConsent) setConsentStatus(prev => ({ ...prev, [test.id]: 'pending' })) }}
  const removeTest = (id: string) => { setSelectedTests(prev => prev.filter(t => t.id !== id)); const n = {...consentStatus}; delete n[id]; setConsentStatus(n) }
  const requestConsent = (testId: string) => { setConsentStatus(prev => ({ ...prev, [testId]: 'requesting' })); setTimeout(() => { setConsentStatus(prev => ({ ...prev, [testId]: 'signed' })) }, 2000) }
  const verifyOtp = () => { if(otpInput === "123456") { setInternalAccess('unlocked'); setShowAuthDialog(false); setShowInternalHistoryModal(true) } }

  // Derive suggested tests
  const suggestedTests = useMemo(() => {
      if (!formData.medicalIntent) return []
      const intentObj = medicalIntents.find(i => i.id === formData.medicalIntent)
      return intentObj ? intentObj.recommended.map(id => labTestsData.find(t => t.id === id)).filter(Boolean) as LabTest[] : []
  }, [formData.medicalIntent])

  return (
    <TooltipProvider>
      <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
        
        {/* LEFT CONTENT */}
        <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
            <div className="max-w-5xl mx-auto space-y-6 pb-24">
                
                {/* Header Actions */}
                <div className="flex justify-between items-center">
                    <div><h1 className="text-2xl font-bold text-slate-900">Patient Admission</h1><p className="text-slate-500">Reception & Triage</p></div>
                    <Button onClick={() => processIdentityVerification({})} disabled={scanStep !== 'idle' && scanStep !== 'complete'} className={cn("min-w-[160px]", scanStep === 'idle' || scanStep === 'complete' ? "bg-blue-600 hover:bg-blue-700" : "bg-slate-800")}>
                        {scanStep !== 'idle' && scanStep !== 'complete' ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <QrCode className="mr-2 h-4 w-4"/>}
                        {scanStep === 'idle' || scanStep === 'complete' ? "Scan CCCD" : "Scanning..."}
                    </Button>
                </div>

                {/* Enhanced Identity Card */}
                <IdentityVerificationCard 
                    data={scannedIdentity || {}} 
                    scanStep={scanStep} 
                    onClear={() => {setScannedIdentity(null); setScanStep('idle'); setInternalAccess('locked')}}
                    onInternalHistoryClick={() => { internalAccess === 'unlocked' ? setShowInternalHistoryModal(true) : (setShowAuthDialog(true), setOtpStep('method')) }}
                    internalAccess={internalAccess}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Demographics (Simplified for brevity) */}
                    <Card className="border-t-4 border-t-blue-500 shadow-sm md:col-span-2">
                        <CardHeader className="pb-2"><CardTitle className="text-sm uppercase text-blue-600 flex items-center gap-2"><User className="h-4 w-4"/> Demographics</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4">
                            <div><Label className="text-xs text-slate-500">Full Name</Label><Input value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="font-bold uppercase"/></div>
                            <div>
                                <Label className="text-xs text-slate-500">Citizen ID</Label>
                                <div className="flex gap-2"><Input value={formData.citizenId} onChange={e => setFormData({...formData, citizenId: e.target.value})} className="font-mono"/><Button onClick={() => processIdentityVerification({})} disabled={scanStep !== 'idle'} variant="secondary">Check</Button></div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Clinical Intake */}
                    <Card className="border-t-4 border-t-emerald-500 shadow-sm md:col-span-2">
                        <CardHeader className="pb-2"><CardTitle className="text-sm uppercase text-emerald-600 flex items-center gap-2"><Stethoscope className="h-4 w-4"/> Clinical Decision Support</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="bg-emerald-50/50 p-4 rounded-lg border border-emerald-100">
                                <Label className="text-sm font-bold text-emerald-800 mb-2 block flex items-center gap-2"><Activity className="h-4 w-4"/> Medical Intent</Label>
                                <Select value={formData.medicalIntent} onValueChange={(val) => setFormData({...formData, medicalIntent: val})}>
                                    <SelectTrigger className="bg-white border-emerald-200"><SelectValue placeholder="Select intent..." /></SelectTrigger>
                                    <SelectContent>{medicalIntents.map(i => <SelectItem key={i.id} value={i.id}>{i.label}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            
                            {/* --- THE NURSE SCRIPT ALERT --- */}
                            {formData.medicalIntent === 'chronic_diabetes' && scannedIdentity?.activeReferral && (
                                <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-r shadow-sm animate-in fade-in slide-in-from-left-2">
                                    <div className="flex items-start gap-3">
                                        <div className="bg-blue-100 p-2 rounded-full"><Sparkles className="h-5 w-5 text-blue-600" /></div>
                                        <div>
                                            <h4 className="font-bold text-blue-900 text-sm mb-1">Suggested Script for Patient</h4>
                                            <p className="text-sm text-blue-800 italic leading-relaxed">
                                                "Mr./Ms. {formData.fullName.split(' ').pop()}, evidently you have already been classified as a diabetic, and you have no diabetes testing in the last 90 days. We can serve you a diabetes test today which you don't have to make a charge for under BHYT Insurance."
                                            </p>
                                            <div className="mt-3 flex gap-2">
                                                 <Badge className="bg-white text-blue-700 hover:bg-blue-100 border border-blue-200"><CheckCircle2 className="h-3 w-3 mr-1"/> Teledoc Pre-Check Valid</Badge>
                                                 <Badge className="bg-white text-blue-700 hover:bg-blue-100 border border-blue-200"><CalendarCheck className="h-3 w-3 mr-1"/> 90-Day Window Open</Badge>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Lab Search Area */}
                    <Card className="border-t-4 border-t-indigo-500 shadow-sm md:col-span-2 mb-20">
                        <CardHeader className="pb-2"><CardTitle className="text-sm uppercase text-indigo-600 flex items-center gap-2"><Beaker className="h-4 w-4"/> Order Entry</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            {/* Suggestions */}
                            {suggestedTests.length > 0 && (
                                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
                                    <h4 className="text-sm font-bold text-indigo-800 mb-3 flex items-center gap-2"><Sparkles className="h-4 w-4"/> Recommended Protocol</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                        {suggestedTests.map(test => {
                                            const eligible = checkInsuranceEligibility(test, scannedIdentity)
                                            return (
                                                <button key={test.id} onClick={() => addTest(test)} className="text-left p-2 rounded border bg-white border-indigo-200 hover:border-indigo-400 flex justify-between items-center group">
                                                    <div>
                                                        <div className="text-xs font-bold text-slate-700">{test.name}</div>
                                                        <div className="text-[10px] text-slate-500">
                                                            {eligible.coveragePercent === 1.0 ? <span className="text-emerald-600 font-bold">100% Covered</span> : formatCurrency(test.price)}
                                                        </div>
                                                    </div>
                                                    <PlusCircle className="h-4 w-4 text-indigo-400 group-hover:text-indigo-600"/>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}
                            {/* Search */}
                            <div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><Input className="pl-10 h-10" placeholder="Search tests..." value={testSearchQuery} onChange={e => setTestSearchQuery(e.target.value)}/></div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>

        {/* RIGHT CART (Updated Pricing Logic) */}
        <div className="w-[400px] border-l bg-white shadow-xl flex flex-col z-20">
            <div className="p-4 border-b bg-slate-50 flex justify-between items-center"><div className="flex items-center gap-2 font-bold text-slate-800"><ShoppingCart className="h-5 w-5 text-blue-600" /><span>Order Cart</span><Badge className="bg-blue-600 text-white ml-2">{selectedTests.length}</Badge></div></div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {selectedTests.length === 0 ? (<div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4 opacity-50"><FileText className="h-16 w-16" /><p>Cart is empty</p></div>) : (
                    selectedTests.map((test) => {
                        const eligibility = checkInsuranceEligibility(test, scannedIdentity)
                        const isFullyCovered = eligibility.coveragePercent === 1.0
                        return (
                            <div key={test.id} className={cn("border rounded-lg p-3 relative", test.requiresConsent && consentStatus[test.id] !== 'signed' ? "border-amber-200 bg-amber-50" : "border-slate-200 bg-white")}>
                                <div className="flex justify-between items-start mb-1"><h4 className="font-bold text-sm text-slate-800 pr-6">{test.name}</h4><button onClick={() => removeTest(test.id)} className="absolute top-2 right-2 text-slate-300 hover:text-red-500"><X className="h-4 w-4"/></button></div>
                                
                                {/* PRICE ROW */}
                                <div className="flex justify-between items-end mt-2">
                                    <div className="text-xs text-slate-500 max-w-[60%]">
                                        {isFullyCovered && <div className="text-emerald-600 font-bold flex items-center gap-1"><Receipt className="h-3 w-3"/> BHYT Full Coverage</div>}
                                        {eligibility.reason}
                                    </div>
                                    <div className="text-right">
                                        {isFullyCovered ? (
                                            <>
                                                <div className="text-[10px] text-slate-400 line-through">{formatCurrency(test.price)}</div>
                                                <div className="font-bold text-emerald-600 text-sm">0 ₫</div>
                                            </>
                                        ) : (
                                            <div className="font-bold text-slate-800 text-sm">{formatCurrency(test.price)}</div>
                                        )}
                                    </div>
                                </div>
                                {/* Consent Block (abbreviated) */}
                                {test.requiresConsent && (<div className="mt-3 pt-3 border-t border-amber-200/50">{consentStatus[test.id] !== 'signed' ? <Button size="sm" variant="outline" onClick={() => requestConsent(test.id)} className="w-full h-8 text-xs">Request Signature</Button> : <div className="text-xs text-emerald-600 font-bold flex items-center gap-1"><FileSignature className="h-3 w-3"/> Signed</div>}</div>)}
                            </div>
                        )
                    })
                )}
            </div>
            
            {/* CART TOTALS (REAL TIME MATH) */}
            <div className="p-4 border-t bg-slate-50 space-y-4">
                <div className="space-y-2">
                    <div className="flex justify-between text-sm text-slate-500"><span>Subtotal</span><span>{formatCurrency(cartTotals.subtotal)}</span></div>
                    {scannedIdentity?.bhyt && (
                        <div className="flex justify-between text-sm text-emerald-600">
                            <span className="flex items-center gap-1"><ShieldCheck className="h-3 w-3"/> Insurance Pays</span>
                            <span>- {formatCurrency(cartTotals.insuranceCoverage)}</span>
                        </div>
                    )}
                    <div className="flex justify-between text-lg font-bold text-slate-900 pt-2 border-t"><span>Patient Responsibility</span><span>{formatCurrency(cartTotals.patientDue)}</span></div>
                </div>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-lg h-12 shadow-lg" disabled={selectedTests.some(t => t.requiresConsent && consentStatus[t.id] !== 'signed')}><Save className="h-4 w-4 mr-2"/> Submit Order</Button>
            </div>
        </div>
        
        {/* Dialogs kept from previous (History Auth, Internal Orders) */}
        <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}><DialogContent><DialogHeader><DialogTitle>Privacy Check</DialogTitle></DialogHeader><div className="space-y-4 py-4"><Input placeholder="Enter OTP" value={otpInput} onChange={e => setOtpInput(e.target.value)} /><Button onClick={verifyOtp}>Unlock</Button></div></DialogContent></Dialog>
        <Dialog open={showInternalHistoryModal} onOpenChange={setShowInternalHistoryModal}><DialogContent className="sm:max-w-[600px]"><DialogHeader><DialogTitle>Past Orders</DialogTitle></DialogHeader><div className="space-y-3 max-h-[50vh] overflow-y-auto">{mockNextHealthOrders.map((o,i)=><div key={i} className="border p-4 rounded flex justify-between"><div>{o.date} - {o.doctor}</div><Button size="sm" onClick={()=>{o.items.forEach(id=>{const t=labTestsData.find(x=>x.id===id);if(t)addTest(t)});setShowInternalHistoryModal(false)}} variant="outline">Re-Order</Button></div>)}</div></DialogContent></Dialog>
      </div>
    </TooltipProvider>
  )
}