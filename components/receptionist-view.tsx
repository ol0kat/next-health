"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TooltipProvider } from "@/components/ui/tooltip"
import {
  User, QrCode, Search, Loader2, X, CheckCircle2,
  Clock, MapPin, Smartphone, History, Lock, Unlock,
  ShieldCheck, AlertCircle, ShoppingCart, Copy, FileText,
  UserPlus, Activity, Trash2, Save, Beaker, FileSignature, TabletSmartphone, Wifi
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
}

const labTestsData: LabTest[] = [
  { id: "hiv", name: "HIV Ab/Ag Combo", shortName: "HIV Combo", price: 200000, category: "Serology", sampleType: "Serum", turnaroundHours: 4, requiresConsent: true }, 
  { id: "cbc", name: "Complete Blood Count", shortName: "CBC", price: 120000, category: "Hematology", sampleType: "Whole Blood", turnaroundHours: 4, popular: true },
  { id: "hba1c", name: "Hemoglobin A1c", shortName: "HbA1c", price: 180000, category: "Biochemistry", sampleType: "Whole Blood", turnaroundHours: 24, popular: true },
  { id: "lipid", name: "Lipid Panel", shortName: "Lipid", price: 250000, category: "Biochemistry", sampleType: "Serum", turnaroundHours: 24, popular: true },
  { id: "cmp", name: "Comprehensive Metabolic Panel", shortName: "CMP", price: 320000, category: "Biochemistry", sampleType: "Serum", turnaroundHours: 24, popular: true },
  { id: "syphilis", name: "Syphilis RPR", shortName: "Syphilis", price: 150000, category: "Serology", sampleType: "Serum", turnaroundHours: 24, requiresConsent: true },
]

// Mock History for BHYT (National)
const mockBhytHistory = [
  { diagnosis: "Viêm phế quản cấp", date: "15/01/2024", facility: "79071 • Đỡ" },
  { diagnosis: "Sốt xuất huyết Dengue", date: "20/05/2023", facility: "79010 • Khỏi" }
]

// Mock History for Internal (Locked) - Using IDs that match labTestsData
const mockNextHealthOrders = [
  { id: "ORD-NX-99", date: "10/11/2023", items: ["hiv", "syphilis"], doctor: "Dr. Vo" },
  { id: "ORD-NX-88", date: "05/06/2023", items: ["cbc", "hba1c"], doctor: "Dr. Tran" }
]

const formatCurrency = (amount: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)

// --- COMPONENT: IDENTITY CARD (Green Header) ---
function IdentityVerificationCard({ data, scanStep, onClear, onInternalHistoryClick, internalAccess }: any) {
    // Only show if we are scanning OR if verification is complete
    if (scanStep === "idle" && !data.bhyt) return null
    
    const isComplete = scanStep === "complete"
    
    return (
      <div className="mb-6 animate-in fade-in slide-in-from-top-4 font-sans">
        <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
           {/* Header */}
           <div className={cn("px-4 py-3 flex justify-between text-white text-sm font-bold uppercase tracking-wide", isComplete ? "bg-[#009860]" : "bg-blue-600")}>
               <div className="flex items-center gap-2">
                   {isComplete ? <CheckCircle2 className="h-5 w-5" /> : <Loader2 className="h-4 w-4 animate-spin"/>}
                   <span>{isComplete ? "Identity & Insurance Verified" : "Processing Verification..."}</span>
               </div>
               {isComplete && <button onClick={onClear}><X className="h-5 w-5 text-white/80 hover:text-white" /></button>}
           </div>

           {/* 3 Columns Content */}
           <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
              {/* COL 1: CCCD */}
              <div className="p-5 space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <User className="h-4 w-4" /> Citizen Identity (CCCD)
                </div>
                <div>
                    <div className="font-bold text-xl text-slate-900 uppercase">{data.name || "..."}</div>
                    <div className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5"/> {data.dob}
                    </div>
                </div>
                <div>
                    <div className="text-xs text-slate-400 font-bold">Citizen ID Number</div>
                    <div className="font-mono text-lg text-slate-700 font-medium tracking-wide mt-1">{data.citizenId}</div>
                </div>
              </div>

              {/* COL 2: BHYT */}
              <div className="p-5 space-y-4 bg-slate-50/30">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-500 uppercase tracking-wider">
                    <ShieldCheck className="h-4 w-4" /> Health Insurance
                </div>
                {data.bhyt ? (
                    <>
                        <div>
                            <div className="text-xs text-slate-400 font-bold mb-1">Card Number</div>
                            <div className="font-bold text-xl text-blue-600 font-mono tracking-tight">{data.bhyt.code}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <div className="text-xs text-slate-400">Coverage</div>
                                <div className="font-bold text-emerald-600">{data.bhyt.coverageLabel}</div>
                            </div>
                            <div>
                                <div className="text-xs text-slate-400">Expiry</div>
                                <div className="font-medium text-slate-700">{data.bhyt.expiry}</div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="h-32 flex items-center justify-center text-slate-400 italic text-sm">Verifying Insurance...</div>
                )}
              </div>
              
              {/* COL 3: HISTORY */}
              <div className="p-5 flex flex-col h-full justify-between bg-slate-50/50">
                {/* 3.1: National History */}
                <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-indigo-500 uppercase tracking-wider">
                        <History className="h-4 w-4" /> Medical History (BHYT)
                    </div>
                    {data.bhyt ? (
                        <div className="space-y-2">
                            {mockBhytHistory.map((item, idx) => (
                                <div key={idx} className="bg-white p-2 rounded border shadow-sm border-l-4 border-l-blue-500 text-xs">
                                    <div className="flex justify-between font-bold text-slate-800">
                                        <span>{item.diagnosis}</span>
                                        <span className="text-[10px] text-slate-400">{item.date}</span>
                                    </div>
                                    <div className="text-slate-500 mt-1">{item.facility}</div>
                                </div>
                            ))}
                        </div>
                    ) : <div className="h-20 bg-slate-200 rounded animate-pulse"/>}
                </div>

                {/* 3.2: Internal History (Locked) */}
                <div className="mt-auto pt-3 border-t border-slate-200">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Internal Records</span>
                        {internalAccess === 'unlocked' && <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 text-[10px] px-1 py-0">Authorized</Badge>}
                    </div>
                    {internalAccess === 'locked' ? (
                        <Button onClick={onInternalHistoryClick} disabled={!data.bhyt} variant="outline" size="sm" className="w-full h-8 text-xs border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 border-dashed">
                            <Lock className="h-3 w-3 mr-2" /> Request Access
                        </Button>
                    ) : (
                        <div className="bg-emerald-50 border border-emerald-100 rounded p-2 text-center cursor-pointer hover:bg-emerald-100" onClick={onInternalHistoryClick}>
                            <div className="text-emerald-700 font-bold text-xs flex items-center justify-center gap-2">
                                <FileText className="h-3 w-3"/> View Past Orders
                            </div>
                        </div>
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
  
  // Form Data
  const [formData, setFormData] = useState<any>({ fullName: "", dob: "", citizenId: "", gender: "male", phone: "", address: "", emergencyContactName: "", chiefComplaint: "" })
  
  // Lab Cart State
  const [selectedTests, setSelectedTests] = useState<LabTest[]>([])
  const [testSearchQuery, setTestSearchQuery] = useState("")
  const [consentStatus, setConsentStatus] = useState<Record<string, 'pending' | 'requesting' | 'signed'>>({})
  
  // History Auth State
  const [internalAccess, setInternalAccess] = useState<'locked' | 'unlocked'>('locked')
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const [showInternalHistoryModal, setShowInternalHistoryModal] = useState(false)
  const [otpStep, setOtpStep] = useState<'method' | 'verify'>('method')
  const [otpInput, setOtpInput] = useState("")

  // Derived
  const totalTestsPrice = selectedTests.reduce((sum, t) => sum + t.price, 0)
  const filteredTests = labTestsData.filter(t => t.name.toLowerCase().includes(testSearchQuery.toLowerCase())).slice(0, 5)

  // --- LOGIC: PROCESS IDENTITY (Used by both Scan and Manual) ---
  const processIdentityVerification = (sourceData: any) => {
      setScanStep("cccd")
      
      // 1. Simulate finding Citizen Data
      setTimeout(() => {
          const verifiedData = { 
              name: sourceData.name || formData.fullName || "TRẦN THỊ NGỌC LAN", 
              dob: sourceData.dob || formData.dob || "15/05/1992", 
              citizenId: sourceData.citizenId || formData.citizenId || "079192000123"
          }
          
          setScannedIdentity(verifiedData)
          setFormData((prev: any) => ({...prev, fullName: verifiedData.name, citizenId: verifiedData.citizenId, dob: verifiedData.dob}))
          setScanStep("checking-bhyt")

          // 2. Simulate finding Insurance
          setTimeout(() => {
              setScannedIdentity((prev:any) => ({
                  ...prev, 
                  bhyt: { 
                      code: "DN4797915071630", 
                      coverageLabel: "80% (Lvl 4)", 
                      expiry: "31/12/2025",
                      hospital: "BV Hoàn Mỹ Sài Gòn (79071)"
                  }
              }))
              setScanStep("complete")
              toast({ title: "Verification Successful", description: "Identity and Insurance confirmed." })
          }, 1200)
      }, 1000)
  }

  // Handler: Scan Button
  const handleScanProcess = () => {
    // Pass mock data for scan
    processIdentityVerification({ name: "TRẦN THỊ NGỌC LAN", dob: "15/05/1992", citizenId: "079192000123" })
  }

  // Handler: Manual Verify Button
  const handleManualVerify = () => {
      if(!formData.citizenId || !formData.fullName) {
          toast({ title: "Missing Information", description: "Please enter at least Name and Citizen ID to verify.", variant: "destructive" })
          return
      }
      processIdentityVerification({})
  }

  // Handler: Add Test to Cart
  const addTest = (test: LabTest) => {
    if (!selectedTests.find(t => t.id === test.id)) {
        setSelectedTests([...selectedTests, test])
        if (test.requiresConsent) {
            setConsentStatus(prev => ({ ...prev, [test.id]: 'pending' }))
        }
    }
    setTestSearchQuery("")
  }

  // Handler: Re-Order from History
  const handleReorder = (itemIds: string[]) => {
      let addedCount = 0;
      itemIds.forEach(id => {
          const test = labTestsData.find(t => t.id === id)
          if(test && !selectedTests.find(existing => existing.id === test.id)) {
              addTest(test)
              addedCount++
          }
      })
      setShowInternalHistoryModal(false)
      if(addedCount > 0) {
        toast({ title: "Orders Added", description: `Successfully added ${addedCount} items from history.` })
      } else {
        toast({ title: "No New Items", description: "Selected items are already in your cart.", variant: "secondary" })
      }
  }

  // Handler: Remove Test
  const removeTest = (id: string) => {
      setSelectedTests(prev => prev.filter(t => t.id !== id))
      const newConsent = { ...consentStatus }
      delete newConsent[id]
      setConsentStatus(newConsent)
  }

  // Handler: Consent Simulation
  const requestConsent = (testId: string) => {
      setConsentStatus(prev => ({ ...prev, [testId]: 'requesting' }))
      toast({ title: "Request Sent", description: "Sent to patient tablet." })
      setTimeout(() => {
          setConsentStatus(prev => ({ ...prev, [testId]: 'signed' }))
      }, 2000)
  }

  // Handler: Unlock History
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
                
                {/* Page Header */}
                <div className="flex justify-between items-center">
                    <div><h1 className="text-2xl font-bold text-slate-900">Patient Admission</h1><p className="text-slate-500">Reception & Triage</p></div>
                    <Button onClick={handleScanProcess} disabled={scanStep !== 'idle' && scanStep !== 'complete'} className={cn("min-w-[160px]", scanStep === 'idle' || scanStep === 'complete' ? "bg-blue-600 hover:bg-blue-700" : "bg-slate-800")}>
                        {scanStep !== 'idle' && scanStep !== 'complete' ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <QrCode className="mr-2 h-4 w-4"/>}
                        {scanStep === 'idle' || scanStep === 'complete' ? "Scan CCCD" : "Scanning..."}
                    </Button>
                </div>

                {/* Identity Card (Shows after scan/verify) */}
                <IdentityVerificationCard 
                    data={scannedIdentity || {}} 
                    scanStep={scanStep} 
                    onClear={() => {setScannedIdentity(null); setScanStep('idle'); setInternalAccess('locked')}}
                    onInternalHistoryClick={() => {
                        internalAccess === 'unlocked' ? setShowInternalHistoryModal(true) : (setShowAuthDialog(true), setOtpStep('method'))
                    }}
                    internalAccess={internalAccess}
                />

                {/* MANUAL ENTRY FORMS (Restored) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Patient Demographics */}
                    <Card className="border-t-4 border-t-blue-500 shadow-sm md:col-span-2">
                        <CardHeader className="pb-2"><CardTitle className="text-sm uppercase text-blue-600 flex items-center gap-2"><User className="h-4 w-4"/> Patient Demographics</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label className="text-xs text-slate-500">Full Name</Label>
                                <Input value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="font-bold uppercase" placeholder="Enter name..."/>
                            </div>
                            <div>
                                <Label className="text-xs text-slate-500">Citizen ID (CCCD)</Label>
                                <div className="flex gap-2">
                                    <Input value={formData.citizenId} onChange={e => setFormData({...formData, citizenId: e.target.value})} className="font-mono" placeholder="000..."/>
                                    {/* Manual Verification Button */}
                                    <Button onClick={handleManualVerify} disabled={scanStep !== 'idle'} variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200">
                                        {scanStep === 'idle' ? "Check BHYT" : <Loader2 className="h-4 w-4 animate-spin"/>}
                                    </Button>
                                </div>
                            </div>
                            <div><Label className="text-xs text-slate-500">DOB</Label><Input type="date" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})}/></div>
                            <div><Label className="text-xs text-slate-500">Gender</Label><div className="flex gap-4 pt-2"><label className="flex items-center gap-2 text-sm"><input type="radio" checked={formData.gender === 'male'} onChange={() => setFormData({...formData, gender: 'male'})}/> Male</label><label className="flex items-center gap-2 text-sm"><input type="radio" checked={formData.gender === 'female'} onChange={() => setFormData({...formData, gender: 'female'})}/> Female</label></div></div>
                        </CardContent>
                    </Card>

                    {/* Contact & Emergency Cards */}
                    <Card className="border-t-4 border-t-purple-500 shadow-sm">
                        <CardHeader className="pb-2"><CardTitle className="text-sm uppercase text-purple-600 flex items-center gap-2"><MapPin className="h-4 w-4"/> Contact Info</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div><Label className="text-xs text-slate-500">Phone</Label><Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="09..." /></div>
                            <div><Label className="text-xs text-slate-500">Address</Label><Input placeholder="Address..." value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} /></div>
                        </CardContent>
                    </Card>

                    <Card className="border-t-4 border-t-amber-500 shadow-sm">
                        <CardHeader className="pb-2"><CardTitle className="text-sm uppercase text-amber-600 flex items-center gap-2"><UserPlus className="h-4 w-4"/> Emergency Contact</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div><Label className="text-xs text-slate-500">Name</Label><Input placeholder="Relative name" value={formData.emergencyContactName} onChange={e => setFormData({...formData, emergencyContactName: e.target.value})} /></div>
                            <div><Label className="text-xs text-slate-500">Phone</Label><Input placeholder="Relative phone" /></div>
                        </CardContent>
                    </Card>

                    {/* Clinical Intake */}
                    <Card className="border-t-4 border-t-emerald-500 shadow-sm md:col-span-2">
                        <CardHeader className="pb-2"><CardTitle className="text-sm uppercase text-emerald-600 flex items-center gap-2"><Activity className="h-4 w-4"/> Clinical Intake</CardTitle></CardHeader>
                        <CardContent className="grid md:grid-cols-2 gap-6">
                            <div><Label className="text-xs text-slate-500">Chief Complaint</Label><Textarea className="h-24" placeholder="Symptoms..." value={formData.chiefComplaint} onChange={e => setFormData({...formData, chiefComplaint: e.target.value})} /></div>
                            <div className="bg-slate-50 p-4 rounded-lg border grid grid-cols-2 gap-3">
                                <div><Label className="text-[10px] uppercase">Height (cm)</Label><Input className="h-8 bg-white"/></div>
                                <div><Label className="text-[10px] uppercase">Weight (kg)</Label><Input className="h-8 bg-white"/></div>
                                <div><Label className="text-[10px] uppercase">Temp (°C)</Label><Input className="h-8 bg-white"/></div>
                                <div><Label className="text-[10px] uppercase">BP (mmHg)</Label><Input className="h-8 bg-white"/></div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Lab Search Area */}
                    <Card className="border-t-4 border-t-indigo-500 shadow-sm md:col-span-2 mb-20">
                        <CardHeader className="pb-2"><CardTitle className="text-sm uppercase text-indigo-600 flex items-center gap-2"><Search className="h-4 w-4"/> Add Lab Tests</CardTitle></CardHeader>
                        <CardContent>
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                <Input className="pl-10 h-10" placeholder="Search tests (HIV, CBC...)" value={testSearchQuery} onChange={e => setTestSearchQuery(e.target.value)}/>
                                {testSearchQuery && filteredTests.length > 0 && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-xl max-h-60 overflow-y-auto">
                                        {filteredTests.map(t => (
                                            <button key={t.id} onClick={() => addTest(t)} className="w-full px-4 py-2 text-left hover:bg-slate-50 flex justify-between items-center border-b">
                                                <div className="font-bold text-sm text-slate-700">{t.name}</div>
                                                <div className="font-bold text-emerald-600 text-sm">{formatCurrency(t.price)}</div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-2 mt-4 flex-wrap">
                                {labTestsData.filter(t => t.popular).map(t => (
                                    <button key={t.id} onClick={() => addTest(t)} className="px-3 py-1 rounded-full bg-slate-100 text-xs hover:bg-blue-50 hover:text-blue-600 border border-transparent hover:border-blue-200 transition-colors">
                                        + {t.shortName}
                                    </button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>

        {/* --- RIGHT SIDEBAR CART (Restored) --- */}
        <div className="w-[400px] border-l bg-white shadow-xl flex flex-col z-20">
            {/* Cart Header */}
            <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
                <div className="flex items-center gap-2 font-bold text-slate-800">
                    <ShoppingCart className="h-5 w-5 text-blue-600" />
                    <span>Order Cart</span>
                    <Badge className="bg-blue-600 text-white ml-2">{selectedTests.length}</Badge>
                </div>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {selectedTests.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4 opacity-50">
                        <FileText className="h-16 w-16" />
                        <p>Cart is empty</p>
                    </div>
                ) : (
                    selectedTests.map((test) => (
                        <div key={test.id} className={cn("border rounded-lg p-3 relative group transition-all", 
                            test.requiresConsent && consentStatus[test.id] !== 'signed' ? "border-amber-200 bg-amber-50" : "border-slate-200 bg-white"
                        )}>
                            <div className="flex justify-between items-start mb-1">
                                <h4 className="font-bold text-sm text-slate-800 pr-6">{test.name}</h4>
                                <button onClick={() => removeTest(test.id)} className="absolute top-2 right-2 text-slate-300 hover:text-red-500"><X className="h-4 w-4"/></button>
                            </div>
                            <div className="flex justify-between items-end">
                                <div className="text-xs text-slate-500 flex items-center gap-1"><Beaker className="h-3 w-3"/> {test.sampleType}</div>
                                <div className="font-bold text-emerald-600 text-sm">{formatCurrency(test.price)}</div>
                            </div>

                            {/* Digital Consent Block */}
                            {test.requiresConsent && (
                                <div className="mt-3 pt-3 border-t border-amber-200/50">
                                    {consentStatus[test.id] === 'pending' && (
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-1.5 text-xs text-amber-700 font-semibold animate-pulse">
                                                <AlertCircle className="h-3.5 w-3.5" />
                                                Consent Required
                                            </div>
                                            <Button size="sm" variant="outline" onClick={() => requestConsent(test.id)} className="w-full h-8 text-xs bg-white border-amber-300 text-amber-800 hover:bg-amber-100">
                                                <TabletSmartphone className="h-3.5 w-3.5 mr-2" /> Request Signature
                                            </Button>
                                        </div>
                                    )}
                                    {consentStatus[test.id] === 'requesting' && (
                                        <div className="bg-white rounded border border-amber-200 p-2 flex flex-col items-center justify-center text-center gap-2">
                                            <Wifi className="h-5 w-5 text-blue-500 animate-pulse" />
                                            <span className="text-xs text-slate-500">Sent to Tablet...</span>
                                        </div>
                                    )}
                                    {consentStatus[test.id] === 'signed' && (
                                        <div className="bg-emerald-100/50 rounded border border-emerald-200 p-2 flex items-center gap-2">
                                            <FileSignature className="h-4 w-4 text-emerald-600" />
                                            <div className="text-xs font-bold text-emerald-800">Digitally Signed</div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Cart Footer */}
            <div className="p-4 border-t bg-slate-50 space-y-4">
                <div className="space-y-2">
                    <div className="flex justify-between text-sm text-slate-500"><span>Subtotal</span><span>{formatCurrency(totalTestsPrice)}</span></div>
                    {scannedIdentity?.bhyt && (
                        <div className="flex justify-between text-sm text-emerald-600"><span>Insurance (80%)</span><span>- {formatCurrency(totalTestsPrice * 0.8)}</span></div>
                    )}
                    <div className="flex justify-between text-lg font-bold text-slate-900 pt-2 border-t">
                        <span>Total Due</span>
                        <span>{formatCurrency(scannedIdentity?.bhyt ? totalTestsPrice * 0.2 : totalTestsPrice)}</span>
                    </div>
                </div>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-lg h-12 shadow-lg" disabled={selectedTests.some(t => t.requiresConsent && consentStatus[t.id] !== 'signed')}>
                    <Save className="h-4 w-4 mr-2"/> Submit Order
                </Button>
            </div>
        </div>

        {/* --- DIALOG 1: OTP AUTH --- */}
        <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2"><Lock className="h-5 w-5 text-amber-500"/> NeXT Health Privacy</DialogTitle>
                </DialogHeader>
                {otpStep === 'method' ? (
                    <div className="grid grid-cols-2 gap-4 py-4">
                        <Button variant="outline" className="h-20 flex flex-col" onClick={() => {toast({title:"OTP Sent to Zalo"}); setOtpStep('verify')}}>
                            <span className="text-blue-600 font-bold text-lg">Zalo</span>
                        </Button>
                        <Button variant="outline" className="h-20 flex flex-col" onClick={() => {toast({title:"OTP Sent to SMS"}); setOtpStep('verify')}}>
                            <Smartphone className="h-6 w-6 mb-1"/> SMS
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4 py-4">
                        <Input className="text-center text-3xl tracking-[0.5em]" maxLength={6} placeholder="000000" value={otpInput} onChange={e => setOtpInput(e.target.value)} />
                        <Button onClick={verifyOtp} className="w-full bg-emerald-600">Unlock</Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>

        {/* --- DIALOG 2: INTERNAL HISTORY LIST --- */}
        <Dialog open={showInternalHistoryModal} onOpenChange={setShowInternalHistoryModal}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Prior NeXT Health Orders</DialogTitle>
                    <DialogDescription>Select orders to copy to the current cart.</DialogDescription>
                </DialogHeader>
                <div className="space-y-3 py-2 max-h-[60vh] overflow-y-auto">
                    {mockNextHealthOrders.map((order, i) => (
                        <div key={i} className="flex justify-between items-center p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                            <div>
                                <div className="font-bold text-slate-800">{order.date}</div>
                                <div className="text-xs text-slate-500 mb-2">Ref: {order.id} • {order.doctor}</div>
                                <div className="flex gap-2">
                                    {order.items.map(itemId => {
                                        const test = labTestsData.find(t => t.id === itemId)
                                        return <span key={itemId} className="px-2 py-0.5 bg-white border rounded text-[10px] uppercase font-semibold text-slate-600 shadow-sm">{test ? test.shortName : itemId}</span>
                                    })}
                                </div>
                            </div>
                            <Button size="sm" variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50" onClick={() => handleReorder(order.items)}>
                                <Copy className="h-3.5 w-3.5 mr-2"/> Re-order
                            </Button>
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>

      </div>
    </TooltipProvider>
  )
}