"use client"

import type React from "react"
import { useState, useMemo, useTransition } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  UserPlus,
  QrCode,
  Search,
  Save,
  Loader2,
  X,
  Beaker,
  CheckCircle2,
  ScanLine,
  User,
  Clock,
  MapPin,
  ShieldCheck,
  History,
  Activity,
  ChevronsUpDown,
  Check,
  Mail,
  Phone as PhoneIcon,
  Home,
  ShoppingCart,
  Plus,
  Trash2,
  AlertCircle,
  CalendarClock,
  Receipt,
  FileSignature,
  TabletSmartphone,
  Wifi
} from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

// --- MOCK DATA: Lab Tests (Added HIV with Consent Flag) ---
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
  requiresConsent?: boolean // <--- NEW FLAG
}

const labTestsData: LabTest[] = [
  { id: "hiv", name: "HIV Ab/Ag Combo", shortName: "HIV Combo", price: 200000, category: "Serology", sampleType: "Serum", turnaroundHours: 4, description: "4th Gen screening for HIV-1/2 antibodies and p24 antigen.", requiresConsent: true }, // <--- CONSENT REQUIRED
  { id: "cbc", name: "Complete Blood Count", shortName: "CBC", price: 120000, category: "Hematology", sampleType: "Whole Blood", turnaroundHours: 4, description: "Evaluates overall health; detects anemia, infection, etc.", popular: true },
  { id: "hba1c", name: "Hemoglobin A1c", shortName: "HbA1c", price: 180000, category: "Biochemistry", sampleType: "Whole Blood", turnaroundHours: 24, description: "Average blood sugar over past 3 months.", popular: true },
  { id: "lipid", name: "Lipid Panel", shortName: "Lipid", price: 250000, category: "Biochemistry", sampleType: "Serum", turnaroundHours: 24, description: "Cholesterol & triglycerides. Heart health check.", requiresFasting: true, popular: true },
  { id: "cmp", name: "Comprehensive Metabolic Panel", shortName: "CMP", price: 320000, category: "Biochemistry", sampleType: "Serum", turnaroundHours: 24, description: "Kidney/liver function, electrolytes, fluid balance.", requiresFasting: true, popular: true },
  { id: "tsh", name: "Thyroid Stimulating Hormone", shortName: "TSH", price: 150000, category: "Endocrinology", sampleType: "Serum", turnaroundHours: 24, description: "Thyroid function screening.", popular: true },
  { id: "urine", name: "Urinalysis", shortName: "Urine", price: 80000, category: "Microbiology", sampleType: "Urine", turnaroundHours: 2, description: "Detects UTIs, kidney disease.", popular: true },
]

// --- MOCK DATA: Locations & Country Codes ---
const vnLocations: Record<string, { label: string, districts: Record<string, { label: string, wards: string[] }> }> = {
  "hcm": { label: "TP. Hồ Chí Minh", districts: { "quan1": { label: "Quận 1", wards: ["Phường Bến Nghé", "Phường Bến Thành"] } } },
  "hanoi": { label: "TP. Hà Nội", districts: { "badinh": { label: "Quận Ba Đình", wards: ["Phường Phúc Xá"] } } }
}
const countryCodes = [{ value: "vn", label: "Vietnam", code: "+84", flag: "🇻🇳" }, { value: "us", label: "USA", code: "+1", flag: "🇺🇸" }]

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
  // (Simplified Phone Input for brevity)
  return (
    <div className={cn("flex rounded-md border bg-white", error && "border-red-500")}>
       <div className="flex items-center px-3 border-r bg-slate-50 text-slate-500 text-sm">🇻🇳 +84</div>
       <Input className="border-0 focus-visible:ring-0" placeholder="90..." value={value} onChange={e => onChange(e.target.value)} />
    </div>
  )
}

function IdentityVerificationCard({ data, scanStep, onClear }: any) {
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
              <div><div className="text-xs text-slate-400 font-bold mb-1">PATIENT</div><div className="font-bold text-lg">{data.name || "SCANNING..."}</div><div className="text-sm text-slate-500">{data.citizenId}</div></div>
              <div><div className="text-xs text-slate-400 font-bold mb-1">INSURANCE</div>{data.bhyt ? <div className="text-sm"><span className="font-mono font-bold text-blue-600">{data.bhyt.code}</span><br/>Coverage: {data.bhyt.coverage * 100}%</div> : <div className="text-sm text-slate-300 italic">Pending...</div>}</div>
              <div><div className="text-xs text-slate-400 font-bold mb-1">HISTORY</div>{data.history ? <div className="text-xs bg-slate-100 p-2 rounded">{data.history.length} records found.</div> : <div className="text-sm text-slate-300 italic">Pending...</div>}</div>
           </div>
        </div>
      </div>
    )
}

export function ReceptionistView({ patients, setPatients }: any) {
  const { toast } = useToast()
  const [scanStep, setScanStep] = useState<any>("idle")
  const [scannedIdentity, setScannedIdentity] = useState<any>(null)
  
  // States
  const [formData, setFormData] = useState<any>({ fullName: "", dob: "", citizenId: "", gender: "male" })
  const [testSearchQuery, setTestSearchQuery] = useState("")
  const [selectedTests, setSelectedTests] = useState<LabTest[]>([])
  const [showTestSearch, setShowTestSearch] = useState(false)
  
  // Consent State: Record<testId, 'pending' | 'requesting' | 'signed'>
  const [consentStatus, setConsentStatus] = useState<Record<string, 'pending' | 'requesting' | 'signed'>>({})

  // Logic
  const totalTestsPrice = selectedTests.reduce((sum, t) => sum + t.price, 0)
  const filteredTests = labTestsData.filter(t => t.name.toLowerCase().includes(testSearchQuery.toLowerCase())).slice(0, 5)

  const handleScanProcess = () => {
    setScanStep("cccd"); setTimeout(() => {
      const data = { fullName: "TRẦN THỊ NGỌC LAN", dob: "1992-05-15", citizenId: "079192000123", gender: "female" }
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
      // cleanup consent status
      const newConsent = { ...consentStatus }
      delete newConsent[id]
      setConsentStatus(newConsent)
  }

  // --- DIGITAL CONSENT HANDLER ---
  const requestConsent = (testId: string) => {
      setConsentStatus(prev => ({ ...prev, [testId]: 'requesting' }))
      
      // Simulate sending to tablet
      toast({
          title: "Consent Request Sent",
          description: "Waiting for patient signature on tablet...",
          className: "bg-blue-600 text-white border-none"
      })

      setTimeout(() => {
          setConsentStatus(prev => ({ ...prev, [testId]: 'signed' }))
          toast({
              title: "Consent Signed",
              description: "Digital signature received securely.",
              className: "bg-emerald-600 text-white border-none"
          })
      }, 2500)
  }

  return (
    <TooltipProvider>
      <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
        
        {/* MAIN CONTENT (SCROLLABLE) */}
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

                <IdentityVerificationCard data={scannedIdentity || {}} scanStep={scanStep} onClear={() => {setScannedIdentity(null); setScanStep('idle')}} />

                {/* FORM GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Patient Info */}
                    <Card className="border-t-4 border-t-blue-500 shadow-sm md:col-span-2">
                        <CardHeader className="pb-2"><CardTitle className="text-sm uppercase text-blue-600 flex items-center gap-2"><User className="h-4 w-4"/> Patient Demographics</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4">
                            <div><Label className="text-xs text-slate-500">Full Name</Label><Input value={formData.fullName} className="font-bold uppercase"/></div>
                            <div><Label className="text-xs text-slate-500">Citizen ID</Label><Input value={formData.citizenId} className="font-mono"/></div>
                            <div><Label className="text-xs text-slate-500">DOB</Label><Input type="date" value={formData.dob}/></div>
                            <div><Label className="text-xs text-slate-500">Gender</Label><div className="flex gap-4 pt-2"><label className="flex items-center gap-2 text-sm"><input type="radio" checked={formData.gender === 'male'} readOnly/> Male</label><label className="flex items-center gap-2 text-sm"><input type="radio" checked={formData.gender === 'female'} readOnly/> Female</label></div></div>
                        </CardContent>
                    </Card>

                    {/* Contact (Moved from Right) */}
                    <Card className="border-t-4 border-t-purple-500 shadow-sm">
                        <CardHeader className="pb-2"><CardTitle className="text-sm uppercase text-purple-600 flex items-center gap-2"><MapPin className="h-4 w-4"/> Contact Info</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div><Label className="text-xs text-slate-500">Phone</Label><PhoneInput value="" onChange={()=>{}} /></div>
                            <div><Label className="text-xs text-slate-500">Address</Label><Input placeholder="Street address..." /></div>
                        </CardContent>
                    </Card>

                    {/* Emergency Contact (Moved from Right) */}
                    <Card className="border-t-4 border-t-amber-500 shadow-sm">
                        <CardHeader className="pb-2"><CardTitle className="text-sm uppercase text-amber-600 flex items-center gap-2"><UserPlus className="h-4 w-4"/> Emergency Contact</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div><Label className="text-xs text-slate-500">Name</Label><Input placeholder="Relative name" /></div>
                            <div><Label className="text-xs text-slate-500">Phone</Label><PhoneInput value="" onChange={()=>{}} /></div>
                        </CardContent>
                    </Card>

                    {/* Clinical */}
                    <Card className="border-t-4 border-t-emerald-500 shadow-sm md:col-span-2">
                        <CardHeader className="pb-2"><CardTitle className="text-sm uppercase text-emerald-600 flex items-center gap-2"><Clock className="h-4 w-4"/> Clinical Intake</CardTitle></CardHeader>
                        <CardContent className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div><Label className="text-xs text-slate-500">Chief Complaint</Label><Textarea className="h-20" placeholder="Symptoms..." /></div>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-lg border space-y-3">
                                <div className="text-sm font-bold text-slate-700 flex items-center gap-2"><Activity className="h-4 w-4 text-red-500"/> Vitals</div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div><Label className="text-[10px] uppercase">Height (cm)</Label><Input className="h-8 bg-white"/></div>
                                    <div><Label className="text-[10px] uppercase">Weight (kg)</Label><Input className="h-8 bg-white"/></div>
                                    <div><Label className="text-[10px] uppercase">Temp (°C)</Label><Input className="h-8 bg-white"/></div>
                                    <div><Label className="text-[10px] uppercase">BP (mmHg)</Label><Input className="h-8 bg-white"/></div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

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
                                                <div>
                                                    <div className="font-bold text-sm text-slate-700 flex items-center gap-2">
                                                        {t.name}
                                                        {t.requiresConsent && <Badge variant="destructive" className="h-4 text-[10px] px-1">Consent</Badge>}
                                                    </div>
                                                    <div className="text-xs text-slate-500">{t.description}</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-bold text-emerald-600 text-sm">{formatCurrency(t.price)}</div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-2 mt-4 flex-wrap">
                                <span className="text-xs text-slate-500 py-1.5">Quick Add:</span>
                                {labTestsData.filter(t => t.popular).map(t => (
                                    <button key={t.id} onClick={() => addTest(t)} className="px-3 py-1 rounded-full bg-slate-100 text-xs hover:bg-blue-50 hover:text-blue-600 border border-transparent hover:border-blue-200 transition-colors">
                                        + {t.shortName}
                                    </button>
                                ))}
                                <button onClick={() => addTest(labTestsData.find(t => t.id === 'hiv')!)} className="px-3 py-1 rounded-full bg-red-50 text-red-600 text-xs hover:bg-red-100 border border-red-100 transition-colors font-medium">
                                    + HIV Combo (Consent)
                                </button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>

        {/* --- RIGHT SIDEBAR CART (STICKY) --- */}
        <div className="w-[400px] border-l bg-white shadow-xl flex flex-col z-20">
            {/* Cart Header */}
            <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
                <div className="flex items-center gap-2 font-bold text-slate-800">
                    <ShoppingCart className="h-5 w-5 text-blue-600" />
                    <span>Order Cart</span>
                    <Badge className="bg-blue-600 text-white hover:bg-blue-700 ml-2">{selectedTests.length}</Badge>
                </div>
                <div className="text-xs text-slate-500">{new Date().toLocaleDateString()}</div>
            </div>

            {/* Cart Items (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {selectedTests.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4 opacity-50">
                        <Receipt className="h-16 w-16" />
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
                                <div className="text-xs text-slate-500 space-y-1">
                                    <div className="flex items-center gap-1"><Beaker className="h-3 w-3"/> {test.sampleType}</div>
                                    <div className="flex items-center gap-1"><Clock className="h-3 w-3"/> {test.turnaroundHours}h turnaround</div>
                                </div>
                                <div className="font-bold text-emerald-600 text-sm">{formatCurrency(test.price)}</div>
                            </div>

                            {/* --- DIGITAL CONSENT BLOCK --- */}
                            {test.requiresConsent && (
                                <div className="mt-3 pt-3 border-t border-amber-200/50">
                                    {consentStatus[test.id] === 'pending' && (
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-1.5 text-xs text-amber-700 font-semibold animate-pulse">
                                                <AlertCircle className="h-3.5 w-3.5" />
                                                Physician/Patient Consent Required
                                            </div>
                                            <Button 
                                                size="sm" 
                                                variant="outline" 
                                                onClick={() => requestConsent(test.id)}
                                                className="w-full h-8 text-xs bg-white border-amber-300 text-amber-800 hover:bg-amber-100"
                                            >
                                                <TabletSmartphone className="h-3.5 w-3.5 mr-2" />
                                                Request Digital Signature
                                            </Button>
                                        </div>
                                    )}

                                    {consentStatus[test.id] === 'requesting' && (
                                        <div className="bg-white rounded border border-amber-200 p-2 flex flex-col items-center justify-center text-center gap-2">
                                            <Wifi className="h-5 w-5 text-blue-500 animate-pulse" />
                                            <span className="text-xs text-slate-500">Sent to Patient Tablet...</span>
                                            <span className="text-[10px] text-slate-400">Waiting for input</span>
                                        </div>
                                    )}

                                    {consentStatus[test.id] === 'signed' && (
                                        <div className="bg-emerald-100/50 rounded border border-emerald-200 p-2 flex items-center gap-2">
                                            <div className="bg-emerald-100 p-1 rounded-full"><FileSignature className="h-4 w-4 text-emerald-600" /></div>
                                            <div className="flex-1">
                                                <div className="text-xs font-bold text-emerald-800">Digitally Signed</div>
                                                <div className="text-[10px] text-emerald-600">{new Date().toLocaleTimeString()} by Patient</div>
                                            </div>
                                            <Check className="h-4 w-4 text-emerald-600" />
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
                    <div className="flex justify-between text-sm text-slate-500">
                        <span>Subtotal</span>
                        <span>{formatCurrency(totalTestsPrice)}</span>
                    </div>
                    {scannedIdentity?.bhyt && (
                        <div className="flex justify-between text-sm text-emerald-600">
                            <span>Insurance (80%)</span>
                            <span>- {formatCurrency(totalTestsPrice * 0.8)}</span>
                        </div>
                    )}
                    <div className="flex justify-between text-lg font-bold text-slate-900 pt-2 border-t">
                        <span>Total Due</span>
                        <span>{formatCurrency(scannedIdentity?.bhyt ? totalTestsPrice * 0.2 : totalTestsPrice)}</span>
                    </div>
                </div>
                
                {/* Block Checkout if Consent Missing */}
                <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-lg h-12 shadow-lg"
                    disabled={selectedTests.some(t => t.requiresConsent && consentStatus[t.id] !== 'signed')}
                >
                    {selectedTests.some(t => t.requiresConsent && consentStatus[t.id] !== 'signed') ? (
                        <span className="flex items-center gap-2"><AlertCircle className="h-4 w-4"/> Complete Consent First</span>
                    ) : (
                        <span className="flex items-center gap-2"><Save className="h-4 w-4"/> Submit Order</span>
                    )}
                </Button>
            </div>
        </div>
      </div>
    </TooltipProvider>
  )
}