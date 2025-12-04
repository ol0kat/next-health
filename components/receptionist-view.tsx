"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TooltipProvider } from "@/components/ui/tooltip"
// ... keep your existing icon imports
import {
  UserPlus, QrCode, Search, Save, Loader2, X, Beaker, CheckCircle2,
  User, Clock, MapPin, Activity, Check, Phone as PhoneIcon,
  ShoppingCart, AlertCircle, TabletSmartphone, Wifi, FileSignature,
  Lock, Unlock, Send, Smartphone, History, Eye, Copy
} from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

// --- EXISTING MOCK DATA & HELPERS REMAIN THE SAME ---
// (Assuming LabTest interface and labTestsData are here as per your original code)

interface LabTest {
  id: string
  name: string
  shortName?: string
  price: number
  category: string
  sampleType: string
  turnaroundHours: number
  description: string
  requiresFasting?: boolean
  popular?: boolean
  requiresConsent?: boolean 
}

const labTestsData: LabTest[] = [
  { id: "hiv", name: "HIV Ab/Ag Combo", shortName: "HIV Combo", price: 200000, category: "Serology", sampleType: "Serum", turnaroundHours: 4, description: "4th Gen screening for HIV-1/2 antibodies and p24 antigen.", requiresConsent: true }, 
  { id: "cbc", name: "Complete Blood Count", shortName: "CBC", price: 120000, category: "Hematology", sampleType: "Whole Blood", turnaroundHours: 4, description: "Evaluates overall health; detects anemia, infection, etc.", popular: true },
  { id: "hba1c", name: "Hemoglobin A1c", shortName: "HbA1c", price: 180000, category: "Biochemistry", sampleType: "Whole Blood", turnaroundHours: 24, description: "Average blood sugar over past 3 months.", popular: true },
  // ... rest of your data
]

// --- NEW MOCK DATA: Historical Orders ---
const mockPastOrders = [
  { id: "ORD-001", date: "2023-11-10", items: ["cbc", "hba1c"], doctor: "Dr. Nguyen" },
  { id: "ORD-002", date: "2023-08-15", items: ["lipid", "cmp"], doctor: "Dr. Tran" }
]

// --- HELPERS ---
const formatCurrency = (amount: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
const getResultDate = (hours: number) => { const d = new Date(); d.setHours(d.getHours() + hours); return d }
const formatDateFriendly = (date: Date) => {
  const diff = date.getDate() - new Date().getDate()
  const time = date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  if (diff === 0) return `Today by ${time}`; if (diff === 1) return `Tomorrow by ${time}`
  return `${date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`
}

// --- COMPONENTS ---
function PhoneInput({ value, onChange, className, error }: any) {
  return (
    <div className={cn("flex rounded-md border bg-white", error && "border-red-500")}>
       <div className="flex items-center px-3 border-r bg-slate-50 text-slate-500 text-sm">🇻🇳 +84</div>
       <Input className="border-0 focus-visible:ring-0" placeholder="90..." value={value} onChange={e => onChange(e.target.value)} />
    </div>
  )
}

// Updated Identity Card to handle History Trigger
function IdentityVerificationCard({ data, scanStep, onClear, onHistoryClick, historyAccess }: any) {
    if (!data.name && scanStep === "idle") return null
    const isComplete = scanStep === "complete"
    
    return (
      <div className="mb-6 animate-in fade-in slide-in-from-top-4">
        <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
           <div className={cn("px-4 py-2 flex justify-between text-white text-sm font-bold", isComplete ? "bg-emerald-600" : "bg-blue-600")}>
               <span>{isComplete ? "IDENTITY & INSURANCE VERIFIED" : "PROCESSING..."}</span>
               {isComplete && <button onClick={onClear}><X className="h-4 w-4 text-white/80 hover:text-white" /></button>}
           </div>
           <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="text-xs text-slate-400 font-bold mb-1">PATIENT</div>
                <div className="font-bold text-lg">{data.name || "SCANNING..."}</div>
                <div className="text-sm text-slate-500">{data.citizenId}</div>
              </div>
              <div>
                <div className="text-xs text-slate-400 font-bold mb-1">INSURANCE</div>
                {data.bhyt ? <div className="text-sm"><span className="font-mono font-bold text-blue-600">{data.bhyt.code}</span><br/>Coverage: {data.bhyt.coverage * 100}%</div> : <div className="text-sm text-slate-300 italic">Pending...</div>}
              </div>
              
              {/* --- UPDATED HISTORY COLUMN --- */}
              <div>
                <div className="text-xs text-slate-400 font-bold mb-1 flex items-center gap-1">
                    MEDICAL HISTORY
                    {historyAccess === 'unlocked' ? <Unlock className="h-3 w-3 text-emerald-500"/> : <Lock className="h-3 w-3 text-amber-500"/>}
                </div>
                {scanStep !== 'complete' ? (
                     <div className="text-sm text-slate-300 italic">Pending scan...</div>
                ) : (
                    <div>
                        {historyAccess === 'locked' ? (
                             <Button onClick={onHistoryClick} variant="outline" size="sm" className="h-8 text-xs border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:text-amber-800">
                                <Lock className="h-3 w-3 mr-1.5" /> Request Access
                             </Button>
                        ) : (
                            <div className="text-sm text-emerald-700 flex flex-col gap-1">
                                <span className="font-bold flex items-center gap-1"><CheckCircle2 className="h-3 w-3"/> Authorized</span>
                                <span className="text-xs text-slate-500">{mockPastOrders.length} records retrieved</span>
                            </div>
                        )}
                    </div>
                )}
              </div>
           </div>
        </div>
      </div>
    )
}

export function ReceptionistView({ patients, setPatients }: any) {
  const { toast } = useToast()
  
  // Scanned Data State
  const [scanStep, setScanStep] = useState<any>("idle")
  const [scannedIdentity, setScannedIdentity] = useState<any>(null)
  
  // Form State
  const [formData, setFormData] = useState<any>({ fullName: "", dob: "", citizenId: "", gender: "male", phone: "", address: "", emergencyContactName: "", emergencyContactPhone: "", chiefComplaint: "", height: "", weight: "", temp: "", bp: "", pulse: "", spo2: "" })
  
  // Lab Selection State
  const [testSearchQuery, setTestSearchQuery] = useState("")
  const [selectedTests, setSelectedTests] = useState<LabTest[]>([])
  const [showTestSearch, setShowTestSearch] = useState(false)
  const [consentStatus, setConsentStatus] = useState<Record<string, 'pending' | 'requesting' | 'signed'>>({})

  // --- NEW: HISTORY ACCESS STATES ---
  const [historyAccess, setHistoryAccess] = useState<'locked' | 'unlocked'>('locked')
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const [otpStep, setOtpStep] = useState<'method' | 'verify'>('method')
  const [otpInput, setOtpInput] = useState("")
  const [showHistoryModal, setShowHistoryModal] = useState(false)

  // Logic Helpers
  const totalTestsPrice = selectedTests.reduce((sum, t) => sum + t.price, 0)
  const filteredTests = labTestsData.filter(t => t.name.toLowerCase().includes(testSearchQuery.toLowerCase())).slice(0, 5)

  // Handlers
  const handleScanProcess = () => {
    setScanStep("cccd"); setTimeout(() => {
      const data = { fullName: "TRẦN THỊ NGỌC LAN", dob: "1992-05-15", citizenId: "079192000123", gender: "female", name: "TRẦN THỊ NGỌC LAN" }
      setScannedIdentity(data); setFormData((p:any) => ({...p, ...data}));
      setScanStep("checking-bhyt"); setTimeout(() => {
        setScannedIdentity((p:any) => ({...p, bhyt: { code: "DN4797...", coverage: 0.8 }}));
        setScanStep("complete")
      }, 1000)
    }, 1000)
  }

  const addTest = (test: LabTest) => {
    if (!selectedTests.find(t => t.id === test.id)) {
        setSelectedTests([...selectedTests, test])
        if (test.requiresConsent) {
            setConsentStatus(prev => ({ ...prev, [test.id]: 'pending' }))
        }
    }
    setTestSearchQuery(""); setShowTestSearch(false)
  }

  const removeTest = (id: string) => {
      setSelectedTests(prev => prev.filter(t => t.id !== id))
      const newConsent = { ...consentStatus }
      delete newConsent[id]
      setConsentStatus(newConsent)
  }

  const requestConsent = (testId: string) => {
      setConsentStatus(prev => ({ ...prev, [testId]: 'requesting' }))
      toast({ title: "Consent Request Sent", description: "Waiting for patient signature...", className: "bg-blue-600 text-white" })
      setTimeout(() => {
          setConsentStatus(prev => ({ ...prev, [testId]: 'signed' }))
          toast({ title: "Consent Signed", className: "bg-emerald-600 text-white" })
      }, 2000)
  }

  // --- NEW: HISTORY AUTH HANDLERS ---
  const handleHistoryRequest = () => {
    setShowAuthDialog(true)
    setOtpStep('method')
  }

  const sendOtp = (method: 'zalo' | 'sms') => {
      // Simulate API call to send OTP
      toast({ 
          title: `OTP Sent via ${method === 'zalo' ? 'Zalo' : 'SMS'}`, 
          description: `Patient ${formData.fullName} has been messaged.`,
      })
      setOtpStep('verify')
  }

  const verifyOtp = () => {
      if(otpInput === "123456") { // Mock validation
          setHistoryAccess('unlocked')
          setShowAuthDialog(false)
          setShowHistoryModal(true) // Immediately show history
          toast({ title: "Access Authorized", description: "Patient history unlocked securely.", className: "bg-emerald-600 text-white" })
      } else {
          toast({ title: "Invalid OTP", variant: "destructive" })
      }
  }

  const reorderPastItems = (itemIds: string[]) => {
      itemIds.forEach(id => {
          const test = labTestsData.find(t => t.id === id)
          if(test) addTest(test)
      })
      setShowHistoryModal(false)
      toast({ title: "Orders Added", description: "Past items added to current cart." })
  }

  return (
    <TooltipProvider>
      <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
        
        {/* MAIN CONTENT */}
        <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
            <div className="max-w-5xl mx-auto space-y-6 pb-24">
                
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div><h1 className="text-2xl font-bold text-slate-900">Patient Admission</h1><p className="text-slate-500">Reception & Triage</p></div>
                    <Button onClick={handleScanProcess} disabled={scanStep !== 'idle' && scanStep !== 'complete'} className={cn("min-w-[160px]", scanStep === 'idle' || scanStep === 'complete' ? "bg-blue-600 hover:bg-blue-700" : "bg-slate-800")}>
                        {scanStep !== 'idle' && scanStep !== 'complete' ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <QrCode className="mr-2 h-4 w-4"/>}
                        {scanStep === 'idle' || scanStep === 'complete' ? "Scan CCCD" : "Scanning..."}
                    </Button>
                </div>

                {/* Identity Card with new History Trigger */}
                <IdentityVerificationCard 
                    data={scannedIdentity || {}} 
                    scanStep={scanStep} 
                    onClear={() => {setScannedIdentity(null); setScanStep('idle'); setHistoryAccess('locked')}}
                    onHistoryClick={handleHistoryRequest}
                    historyAccess={historyAccess}
                />
                
                {/* --- HISTORY VIEW BUTTON (Only visible if unlocked) --- */}
                {historyAccess === 'unlocked' && (
                     <div className="flex justify-end">
                         <Button onClick={() => setShowHistoryModal(true)} variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">
                             <History className="h-4 w-4 mr-2" /> View Past Orders
                         </Button>
                     </div>
                )}

                {/* REST OF YOUR FORM (Demographics, Contact, Clinical, Test Search) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Patient Info */}
                    <Card className="border-t-4 border-t-blue-500 shadow-sm md:col-span-2">
                        <CardHeader className="pb-2"><CardTitle className="text-sm uppercase text-blue-600 flex items-center gap-2"><User className="h-4 w-4"/> Patient Demographics</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4">
                            <div><Label className="text-xs text-slate-500">Full Name</Label><Input value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="font-bold uppercase"/></div>
                            <div><Label className="text-xs text-slate-500">Citizen ID</Label><Input value={formData.citizenId} onChange={e => setFormData({...formData, citizenId: e.target.value})} className="font-mono"/></div>
                            {/* ... other demographic fields ... */}
                        </CardContent>
                    </Card>

                    {/* ... Contact, Clinical Cards ... */}

                     {/* Lab Search Area */}
                     <Card className="border-t-4 border-t-indigo-500 shadow-sm md:col-span-2 mb-20">
                        <CardHeader className="pb-2"><CardTitle className="text-sm uppercase text-indigo-600 flex items-center gap-2"><Search className="h-4 w-4"/> Add Lab Tests</CardTitle></CardHeader>
                        <CardContent>
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                <Input 
                                    className="pl-10 h-10" 
                                    placeholder="Search tests (HIV, CBC, HbA1c...)"
                                    value={testSearchQuery}
                                    onChange={e => {setTestSearchQuery(e.target.value); setShowTestSearch(true)}}
                                    onFocus={() => setShowTestSearch(true)}
                                />
                                {showTestSearch && filteredTests.length > 0 && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-xl max-h-60 overflow-y-auto">
                                        {filteredTests.map(t => (
                                            <button key={t.id} onClick={() => addTest(t)} className="w-full px-4 py-2 text-left hover:bg-slate-50 flex justify-between items-center border-b">
                                                <div className="flex-1">
                                                    <div className="font-bold text-sm text-slate-700 flex items-center gap-2">{t.name}</div>
                                                </div>
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

        {/* --- RIGHT SIDEBAR CART (Keep your existing Cart implementation) --- */}
        <div className="w-[400px] border-l bg-white shadow-xl flex flex-col z-20">
             {/* ... (Your existing Cart Code) ... */}
             <div className="p-4 border-b bg-slate-50"><h3 className="font-bold flex gap-2"><ShoppingCart className="h-5 w-5"/> Order Cart ({selectedTests.length})</h3></div>
             <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {selectedTests.map(t => (
                    <div key={t.id} className="border p-2 rounded flex justify-between">
                        <span className="text-sm font-bold">{t.name}</span>
                        <Button variant="ghost" size="sm" onClick={() => removeTest(t.id)}><X className="h-4 w-4"/></Button>
                    </div>
                ))}
             </div>
        </div>

        {/* --- DIALOG 1: HISTORY ACCESS AUTHORIZATION --- */}
        <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Access Protected History</DialogTitle>
                    <DialogDescription>
                        To view past orders for <b>{formData.fullName}</b>, you must obtain authorization via the patient's registered device.
                    </DialogDescription>
                </DialogHeader>

                {otpStep === 'method' ? (
                    <div className="grid grid-cols-2 gap-4 py-4">
                        <Button variant="outline" className="h-24 flex flex-col gap-2 hover:bg-blue-50 hover:border-blue-500" onClick={() => sendOtp('zalo')}>
                            <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">Z</div>
                            <span>Via Zalo</span>
                        </Button>
                        <Button variant="outline" className="h-24 flex flex-col gap-2 hover:bg-green-50 hover:border-green-500" onClick={() => sendOtp('sms')}>
                            <Smartphone className="h-8 w-8 text-slate-600" />
                            <span>Via SMS</span>
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4 py-4">
                        <div className="text-center text-sm text-slate-500">
                            Enter the 6-digit code sent to <br/><span className="font-bold text-slate-800">{formData.phone || "09xxxxxx"}</span>
                        </div>
                        <div className="flex justify-center">
                            <Input 
                                className="text-center text-2xl tracking-[0.5em] font-mono w-48" 
                                maxLength={6} 
                                value={otpInput}
                                onChange={e => setOtpInput(e.target.value)}
                                placeholder="000000" 
                            />
                        </div>
                        <div className="text-center text-xs text-blue-600 cursor-pointer hover:underline" onClick={() => setOtpStep('method')}>Resend Code</div>
                    </div>
                )}

                <DialogFooter>
                    {otpStep === 'verify' && (
                        <Button onClick={verifyOtp} className="w-full bg-emerald-600 hover:bg-emerald-700">Verify & Unlock</Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>

        {/* --- DIALOG 2: HISTORICAL ORDERS VIEW --- */}
        <Dialog open={showHistoryModal} onOpenChange={setShowHistoryModal}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2"><History className="h-5 w-5 text-blue-600"/> Prior Orders</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    {mockPastOrders.map((order) => (
                        <div key={order.id} className="border rounded-lg p-4 hover:bg-slate-50 transition-colors flex justify-between items-center">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-bold text-slate-800">{order.date}</span>
                                    <Badge variant="secondary" className="text-xs">{order.id}</Badge>
                                </div>
                                <div className="text-sm text-slate-500 mb-2">Prescribed by {order.doctor}</div>
                                <div className="flex gap-1 flex-wrap">
                                    {order.items.map(itemId => {
                                        const test = labTestsData.find(t => t.id === itemId)
                                        return test ? (
                                            <span key={itemId} className="text-[10px] bg-white border px-2 py-0.5 rounded text-slate-600">{test.shortName}</span>
                                        ) : null
                                    })}
                                </div>
                            </div>
                            <Button size="sm" onClick={() => reorderPastItems(order.items)} className="bg-blue-600 hover:bg-blue-700">
                                <Copy className="h-3.5 w-3.5 mr-2" />
                                Re-Order
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