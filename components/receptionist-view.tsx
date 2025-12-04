"use client"

import type React from "react"
import { useState, useMemo, useEffect } from "react"
import { submitOrder } from "@/lib/actions/orders"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  User, QrCode, Search, Loader2, X, CheckCircle2,
  Clock, History, Lock, Unlock, ShieldCheck, 
  ShoppingCart, FileText, Activity, Save, Beaker, 
  FileSignature, Sparkles, Stethoscope, 
  PlusCircle, Edit2, Thermometer, Wind, HeartPulse, Scale,
  Camera, Image as ImageIcon, Eye, AlertTriangle, 
  Users, Trash2, Phone, Plus, ScanLine, CreditCard, Baby, Siren,
  Shield, RefreshCw, Video, CalendarClock, Zap, FlaskConical,
  Globe, Filter, Mail, MapPin, Wallet, Check
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// --- TYPES ---
interface LabTest { id: string, name: string, price: number, category: string, sampleType: string, turnaroundHours: number, requiresConsent?: boolean, popular?: boolean, description?: string, linkedCondition?: string, frequencyDays?: number }







interface VisualPrompt {
    id: string;
    label: string;
    icon: string;
    availableTags: string[];
}

interface MedicalIntent {
    id: string;
    label: string;
    recommended: string[];
    visualPrompts: VisualPrompt[];
}

interface PrivateInsuranceData { 
    provider: string; 
    policyNumber: string; 
    expiryDate: string; 
    frontImg: string | null; 
    backImg: string | null; 
    estimatedCoverage: number; 
    isActive: boolean 
}

// --- MOCK DATA ---











// --- PASTE THIS INSIDE ReceptionistView ---

  // 1. UPDATE STATE (Removed admissionType, added phonePrefix)
  const [scanStep, setScanStep] = useState<"idle" | "cccd" | "checking-bhyt" | "complete">("idle")
  const [scannedIdentity, setScannedIdentity] = useState<any>(null)
  
  const [formData, setFormData] = useState({ 
      fullName: "", dob: "", gender: "", citizenId: "", 
      phonePrefix: "+84", phone: "", email: "", address: "", // Added phonePrefix
      selectedIntents: [] as string[]
  })

  // 2. UPDATE HANDLERS (Scan & Manual BHYT Check)
  const simulateBHYTFetch = (name: string, cid: string) => {
      setScanStep("checking-bhyt");
      toast({ title: "Checking Insurance...", description: `Verifying BHYT for ${name}` });
      
      setTimeout(() => {
          // Mock Logic: If CID starts with "079", found. Else, not found.
          const found = cid.startsWith("079"); 
          
          if (found) {
              setScannedIdentity((prev:any) => ({ 
                  ...prev, 
                  bhyt: { code: "DN4797915071630", coverageLabel: "80% (Lvl 4)", expiry: "31/12/2025" } 
              }));
              toast({ title: "Insurance Verified", description: "BHYT data retrieved successfully.", className: "bg-emerald-600 text-white" });
          } else {
               toast({ title: "No Insurance Found", description: "Could not find BHYT records for this ID.", variant: "destructive" });
          }
          setScanStep("complete");
      }, 1500);
  }

  const handleScanComplete = () => {
      setScanStep("cccd");
      setTimeout(() => {
          const extracted = { name: "TRẦN THỊ NGỌC LAN", dob: "15/05/1992", gender: "female", citizenId: "079192000123", address: "123 Nguyen Hue, D1" };
          setScannedIdentity(extracted);
          setFormData(prev => ({ ...prev, fullName: extracted.name, dob: extracted.dob, gender: extracted.gender, citizenId: extracted.citizenId, address: extracted.address }));
          
          // Auto-trigger BHYT check after scan
          simulateBHYTFetch(extracted.name, extracted.citizenId);
      }, 1000);
  }

  const handleManualBHYTCheck = () => {
      if(!formData.fullName || !formData.citizenId) {
          toast({ title: "Missing Info", description: "Please enter Name and ID to check insurance.", variant: "destructive" });
          return;
      }
      simulateBHYTFetch(formData.fullName, formData.citizenId);
  }







const labTestsData: LabTest[] = [
  { id: "hiv", name: "HIV Ab/Ag Combo", price: 200000, category: "Serology", sampleType: "Serum", turnaroundHours: 4, requiresConsent: true, description: "Screening for HIV 1/2 antibodies" }, 
  { id: "cbc", name: "Complete Blood Count", price: 120000, category: "Hematology", sampleType: "Whole Blood", turnaroundHours: 4, popular: true, description: "Overall health, anemia, infection" },
  { id: "hba1c", name: "Hemoglobin A1c", price: 180000, category: "Biochemistry", sampleType: "Whole Blood", turnaroundHours: 24, popular: true, description: "3-month average blood sugar", linkedCondition: "E11", frequencyDays: 90 },
  { id: "lipid", name: "Lipid Panel", price: 250000, category: "Biochemistry", sampleType: "Serum", turnaroundHours: 24, popular: true, description: "Cholesterol, Triglycerides" },
  { id: "syphilis", name: "Syphilis RPR", price: 150000, category: "Serology", sampleType: "Serum", turnaroundHours: 24, requiresConsent: true, description: "Screening for Syphilis" },
  { id: "dengue", name: "Dengue NS1", price: 250000, category: "Serology", sampleType: "Serum", turnaroundHours: 2, description: "Acute Dengue Fever" },
  { id: "amh", name: "AMH (Anti-Mullerian Hormone)", price: 800000, category: "Hormones", sampleType: "Serum", turnaroundHours: 24, description: "Ovarian reserve testing" },
  { id: "beta_hcg", name: "Beta HCG (Quantitative)", price: 220000, category: "Hormones", sampleType: "Serum", turnaroundHours: 4, description: "Pregnancy confirmation" },
  { id: "fsh", name: "FSH", price: 150000, category: "Hormones", sampleType: "Serum", turnaroundHours: 24, description: "Follicle Stimulating Hormone" },
]

const medicalIntents: MedicalIntent[] = [
    { 
        id: "general_checkup", 
        label: "General Health Checkup", 
        recommended: ["cbc", "lipid", "hba1c"], 
        visualPrompts: [] 
    },
    { 
        id: "chronic_diabetes", 
        label: "Diabetes Monitoring", 
        recommended: ["hba1c", "lipid"], 
        visualPrompts: [
            { id: "foot_exam", label: "Foot/Ulcer Exam", icon: "foot", availableTags: ["Normal", "Ulcer", "Swelling", "Redness", "Callus", "Gangrene"] }, 
            { id: "injection_site", label: "Injection Sites", icon: "skin", availableTags: ["Normal", "Bruising", "Lipohypertrophy", "Infection", "Scarring"] }
        ] 
    },
    { 
        id: "fever_infection", 
        label: "Fever & Infection", 
        recommended: ["cbc", "dengue"], 
        visualPrompts: [
            { id: "skin_rash", label: "Skin Rash / Petechiae", icon: "skin", availableTags: ["None", "Petechiae", "Maculopapular", "Hives", "Blisters", "Diffused Redness"] }, 
            { id: "eye_exam", label: "Bloodshot Eyes / Sclera", icon: "eye", availableTags: ["Normal", "Red/Bloodshot", "Jaundice (Yellow)", "Discharge", "Pale"] }, 
            { id: "throat", label: "Throat / Tonsils", icon: "mouth", availableTags: ["Normal", "Inflamed", "White Spots (Pus)", "Swollen Tonsils", "Bleeding"] }
        ] 
    },
    { 
        id: "std_screening", 
        label: "STD / Sexual Health", 
        recommended: ["hiv", "syphilis"], 
        visualPrompts: [
            { id: "lesion", label: "Visible Lesions", icon: "skin", availableTags: ["None", "Ulcer", "Wart-like", "Blister", "Discharge", "Rash"] }
        ] 
    },
    { 
        id: "fertility", 
        label: "Fertility / IVF Support", 
        recommended: ["amh", "fsh", "cbc"], 
        visualPrompts: [] 
    },
    { 
        id: "prenatal", 
        label: "Prenatal Care (1st Trim)", 
        recommended: ["cbc", "beta_hcg", "hiv", "syphilis"], 
        visualPrompts: [] 
    },
]

// --- MOCK DOCTOR DATA ---
interface Doctor { id: string; name: string; specialty: string; status: 'online' | 'busy' | 'offline'; queueLength: number; avatarColor: string }
const doctorPool: Doctor[] = [
    { id: "dr1", name: "Dr. Vo Tuan", specialty: "Internal Medicine", status: "online", queueLength: 1, avatarColor: "bg-blue-100 text-blue-700" },
    { id: "dr2", name: "Dr. Nguyen An", specialty: "Endocrinology", status: "online", queueLength: 0, avatarColor: "bg-emerald-100 text-emerald-700" },
    { id: "dr3", name: "Dr. Le Chi", specialty: "Endocrinology", status: "busy", queueLength: 4, avatarColor: "bg-purple-100 text-purple-700" },
    { id: "dr4", name: "Dr. Tran Bao", specialty: "Infectious Disease", status: "online", queueLength: 2, avatarColor: "bg-amber-100 text-amber-700" },
    { id: "dr5", name: "Dr. Pham Hanh", specialty: "General Practice", status: "offline", queueLength: 0, avatarColor: "bg-slate-100 text-slate-700" },
    { id: "dr6", name: "Dr. Sarah Smith", specialty: "OBGYN / Fertility", status: "online", queueLength: 1, avatarColor: "bg-pink-100 text-pink-700" },
]

const formatCurrency = (amount: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)

// --- COMPONENT: IDENTITY VERIFICATION (UNIFIED FLOW) ---
function IdentityVerificationCard({ 
    onScanComplete, 
    scanStep, 
    bhytData,
    onInternalHistoryClick,
    internalAccess
}: any) {
    return (
        <Card className="border-t-4 border-t-blue-600 shadow-sm mb-6">
            <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-sm uppercase text-blue-600 flex items-center gap-2">
                    <User className="h-4 w-4"/> Patient Identification & Insurance
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="grid grid-cols-1 md:grid-cols-2 divide-x divide-slate-100">
                    {/* LEFT: SCAN ACTION */}
                    <div className="p-6 flex flex-col items-center justify-center space-y-4 text-center">
                        <div className="h-14 w-14 bg-blue-50 rounded-full flex items-center justify-center mb-1">
                            {scanStep === 'idle' ? <QrCode className="h-7 w-7 text-blue-600" /> : <CheckCircle2 className="h-7 w-7 text-emerald-600"/>}
                        </div>
                        {scanStep === 'idle' ? (
                            <>
                                <Button onClick={onScanComplete} className="bg-blue-600 hover:bg-blue-700 w-full max-w-xs shadow-md">
                                    <ScanLine className="mr-2 h-4 w-4"/> Scan CCCD Chip
                                </Button>
                                <p className="text-xs text-slate-400 max-w-[200px]">Place card on reader to auto-fill demographics & insurance.</p>
                            </>
                        ) : (
                            <div className="space-y-2">
                                <div className="text-sm font-bold text-slate-700">Chip Data Extracted</div>
                                <Button variant="outline" size="sm" onClick={onScanComplete} className="text-xs h-7">Rescan Card</Button>
                            </div>
                        )}
                    </div>
                    
                    {/* RIGHT: BHYT STATUS */}
                    <div className="p-5 bg-slate-50/50 flex flex-col justify-center">
                        <div className="flex justify-between items-center mb-3">
                            <div className="flex items-center gap-2 text-xs font-bold text-blue-500 uppercase tracking-wider">
                                <ShieldCheck className="h-4 w-4" /> Insurance (BHYT)
                            </div>
                            {scanStep === 'checking-bhyt' && <Loader2 className="h-3 w-3 animate-spin text-blue-500"/>}
                        </div>

                        {bhytData ? (
                            <div className="space-y-3 animate-in fade-in slide-in-from-right-2">
                                <div>
                                    <div className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">Card Number</div>
                                    <div className="font-bold text-xl text-blue-600 font-mono tracking-tight">{bhytData.code}</div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 bg-white border border-blue-100 p-2 rounded shadow-sm">
                                    <div>
                                        <div className="text-[9px] text-slate-400 font-bold uppercase">Benefit</div>
                                        <div className="text-sm font-bold text-slate-800">{bhytData.coverageLabel}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[9px] text-slate-400 font-bold uppercase">Expiry</div>
                                        <div className="text-sm font-bold text-slate-800">{bhytData.expiry}</div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center space-y-2 min-h-[100px] border-2 border-dashed rounded-lg border-slate-200">
                                <p className="text-xs text-slate-400 italic px-4">
                                    {scanStep === 'checking-bhyt' ? "Verifying with portal..." : "Scan ID or enter details manually to check insurance."}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
// --- COMPONENT: DEMOGRAPHICS (UPDATED) ---
function DemographicsCard({ formData, setFormData, onCheckBHYT }: any) {
    return (
        <Card className="border-t-4 border-t-slate-500 shadow-sm h-full">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm uppercase text-slate-600 flex items-center gap-2">
                    <FileText className="h-4 w-4"/> Demographics
                </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-3">
                <div className="space-y-1">
                    <Label className="text-xs text-slate-500">Full Name</Label>
                    <Input value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="font-bold uppercase" placeholder="NGUYEN VAN A"/>
                </div>
                
                {/* ID Field with Manual Check Button */}
                <div className="space-y-1">
                    <Label className="text-xs text-slate-500">ID / Passport</Label>
                    <div className="flex gap-2">
                        <Input value={formData.citizenId} onChange={e => setFormData({...formData, citizenId: e.target.value})} className="font-mono" placeholder="079..."/>
                        <Button onClick={onCheckBHYT} variant="secondary" className="whitespace-nowrap bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200">
                            Check BHYT
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                        <Label className="text-xs text-slate-500">DOB</Label>
                        <Input value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} placeholder="DD/MM/YYYY"/>
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs text-slate-500">Gender</Label>
                        <Select value={formData.gender} onValueChange={(val) => setFormData({...formData, gender: val})}>
                            <SelectTrigger className="h-10"><SelectValue placeholder="Select" /></SelectTrigger>
                            <SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem></SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Phone with Prefix */}
                <div className="space-y-1">
                    <Label className="text-xs text-slate-500 flex items-center gap-1"><Phone className="h-3 w-3"/> Phone</Label>
                    <div className="flex gap-2">
                        <Select value={formData.phonePrefix} onValueChange={(val) => setFormData({...formData, phonePrefix: val})}>
                            <SelectTrigger className="w-[80px]"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="+84">🇻🇳 +84</SelectItem>
                                <SelectItem value="+1">🇺🇸 +1</SelectItem>
                                <SelectItem value="+44">🇬🇧 +44</SelectItem>
                                <SelectItem value="+81">🇯🇵 +81</SelectItem>
                                <SelectItem value="+82">🇰🇷 +82</SelectItem>
                            </SelectContent>
                        </Select>
                        <Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="909 123 456" className="flex-1"/>
                    </div>
                </div>

                <div className="space-y-1">
                    <Label className="text-xs text-slate-500 flex items-center gap-1"><Mail className="h-3 w-3"/> Email</Label>
                    <Input value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="abc@email.com"/>
                </div>
                <div className="space-y-1">
                    <Label className="text-xs text-slate-500 flex items-center gap-1"><MapPin className="h-3 w-3"/> Address</Label>
                    <Input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="123 Street..."/>
                </div>
            </CardContent>
        </Card>
    )
}
// --- COMPONENT: FINANCIAL INFO ---
function FinancialInfoCard({ data, setData }: any) {
    return (
        <Card className="border-t-4 border-t-emerald-600 shadow-sm h-full">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm uppercase text-emerald-700 flex items-center gap-2">
                    <Wallet className="h-4 w-4"/> Financial & Refund
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="payment_method" className="w-full">
                    <TabsList className="w-full grid grid-cols-2 mb-4 h-8">
                        <TabsTrigger value="payment_method" className="text-xs">Card on File</TabsTrigger>
                        <TabsTrigger value="reimbursement" className="text-xs">Bank Refund</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="payment_method" className="space-y-4">
                        <div className="bg-slate-50 border border-dashed border-slate-300 rounded-lg p-4 flex flex-col items-center justify-center text-center">
                            {data.cardLast4 ? (
                                <div className="flex items-center gap-3 w-full">
                                    <div className="h-10 w-10 bg-emerald-100 rounded flex items-center justify-center text-emerald-600"><CreditCard className="h-6 w-6"/></div>
                                    <div className="text-left flex-1"><div className="font-bold text-slate-800 text-sm">Visa •••• {data.cardLast4}</div><div className="text-[10px] text-slate-500">Exp {data.cardExpiry}</div></div>
                                    <Button variant="ghost" size="sm" className="text-red-500 h-6 w-6 p-0" onClick={() => setData({...data, cardLast4: ""})}><Trash2 className="h-3 w-3"/></Button>
                                </div>
                            ) : (
                                <>
                                    <p className="text-[10px] text-slate-500 mb-2">No payment method.</p>
                                    <Button variant="outline" size="sm" onClick={() => setData({...data, cardLast4: "4242", cardExpiry: "12/25"})} className="h-7 text-xs"><Plus className="h-3 w-3 mr-2"/> Add Card</Button>
                                </>
                            )}
                        </div>
                    </TabsContent>
                    
                    <TabsContent value="reimbursement" className="space-y-3">
                        <div className="space-y-1">
                            <Label className="text-xs text-slate-500">Bank Name</Label>
                            <Select onValueChange={(v) => setData({...data, bankName: v})}><SelectTrigger className="h-8"><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="vcb">Vietcombank</SelectItem><SelectItem value="tcb">Techcombank</SelectItem></SelectContent></Select>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs text-slate-500">Account No.</Label>
                            <Input placeholder="0071000..." value={data.bankAccount} onChange={e => setData({...data, bankAccount: e.target.value})} className="h-8"/>
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}

// --- COMPONENT: PRIVATE INSURANCE (WITH EXPIRY) ---
function PrivateInsuranceCard({ onChange, data }: { onChange: (d: PrivateInsuranceData) => void, data: PrivateInsuranceData }) {
    const { toast } = useToast()
    const [isScanning, setIsScanning] = useState(false)
    
    const handleScanCard = () => { 
        setIsScanning(true); 
        setTimeout(() => { 
            setIsScanning(false); 
            onChange({ ...data, isActive: true, provider: "baoviet", policyNumber: "BV-8899-X", expiryDate: "2025-12-31", frontImg: "captured", backImg: "captured", estimatedCoverage: 0.8 }); 
            toast({ title: "Card Scanned", description: "Bao Viet Gold Plan detected via OCR." }) 
        }, 2000) 
    }
    
    const toggleActive = () => { if (!data.isActive) { onChange({ ...data, isActive: true }) } else { onChange({ ...data, isActive: false }) } }
    
    return ( 
        <Card className={cn("border-t-4 shadow-sm transition-all h-full", data.isActive ? "border-t-sky-500 bg-white" : "border-t-slate-200 bg-slate-50")}>
            <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
                <CardTitle className={cn("text-sm uppercase flex items-center gap-2", data.isActive ? "text-sky-600" : "text-slate-400")}>
                    <Shield className="h-4 w-4"/> Private Ins.
                </CardTitle>
                <div className="flex items-center gap-2">
                    <Button size="sm" variant={data.isActive ? "secondary" : "outline"} className="h-6 text-[10px]" onClick={toggleActive}>{data.isActive ? "Remove" : "Add"}</Button>
                </div>
            </CardHeader>
            {data.isActive && (
                <CardContent className="p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                        <button onClick={handleScanCard} className={cn("h-16 rounded border-2 border-dashed flex flex-col items-center justify-center gap-1", data.frontImg ? "border-sky-500 bg-sky-50" : "border-slate-300")}>
                            {data.frontImg ? <CheckCircle2 className="h-4 w-4 text-sky-500"/> : <Camera className="h-4 w-4 text-slate-400"/>}
                            <span className="text-[9px] uppercase font-bold text-slate-500">Front</span>
                        </button>
                        <button className={cn("h-16 rounded border-2 border-dashed flex flex-col items-center justify-center gap-1", data.backImg ? "border-sky-500 bg-sky-50" : "border-slate-300")}>
                            {data.backImg ? <CheckCircle2 className="h-4 w-4 text-sky-500"/> : <Camera className="h-4 w-4 text-slate-400"/>}
                            <span className="text-[9px] uppercase font-bold text-slate-500">Back</span>
                        </button>
                    </div>
                    <div className="space-y-2">
                        <Input value={data.policyNumber} onChange={(e) => onChange({...data, policyNumber: e.target.value})} placeholder="Policy #" className="h-8 text-xs font-mono"/>
                        <Input type="date" value={data.expiryDate} onChange={(e) => onChange({...data, expiryDate: e.target.value})} className="h-8 text-xs font-mono"/>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-500">Est. Coverage</span>
                        <span className="font-bold text-sky-600 text-sm">{(data.estimatedCoverage * 100).toFixed(0)}%</span>
                    </div>
                </CardContent>
            )}
        </Card>
    )
}

// --- COMPONENT: RELATED PARTIES ---
function RelatedPartiesCard() {
    const { toast } = useToast()
    const [parties, setParties] = useState<any[]>([])
    const [scanRelativeStep, setScanRelativeStep] = useState<"idle" | "scanning">("idle")
    
    const handleManualRelative = () => { 
        const newPerson = { id: `rel-m-${Math.random()}`, name: "NEW RELATED PARTY", relation: "other", phone: "", citizenId: "", roles: { isEmergency: false, isGuardian: false, isPayer: false } }; 
        setParties(prev => [...prev, newPerson]) 
    }
    
    const handleScanRelative = () => { 
        setScanRelativeStep("scanning"); 
        setTimeout(() => { 
            setScanRelativeStep("idle"); 
            const newPerson = { id: `rel-${Math.random()}`, name: "TRẦN MAI ANH", relation: "child", phone: "N/A", citizenId: "0792...", roles: { isEmergency: false, isGuardian: false, isPayer: false } }; 
            setParties(prev => [...prev, newPerson]); 
            toast({ title: "Identity Linked", description: `Added ${newPerson.name}.` }) 
        }, 1500) 
    }
    
    const toggleRole = (id: string, role: string) => { setParties(prev => prev.map(p => { if (p.id !== id) return p; return { ...p, roles: { ...p.roles, [role]: !p.roles[role] } } })) }
    const updatePartyName = (id: string, name: string) => setParties(prev => prev.map(p => p.id === id ? { ...p, name } : p))
    
    return ( 
        <Card className="border-t-4 border-t-amber-500 shadow-sm bg-white">
            <CardHeader className="pb-3 border-b border-slate-50 flex flex-row items-center justify-between">
                <CardTitle className="text-sm uppercase text-amber-600 flex items-center gap-2"><Users className="h-4 w-4"/> Related Parties & Emergency</CardTitle>
                <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={handleManualRelative} className="h-7 text-xs gap-2"><Plus className="h-3 w-3"/> Manual</Button>
                    <Button size="sm" onClick={handleScanRelative} disabled={scanRelativeStep === 'scanning'} className="bg-amber-500 hover:bg-amber-600 text-white h-7 text-xs gap-2">{scanRelativeStep === 'scanning' ? <Loader2 className="h-3 w-3 animate-spin"/> : <ScanLine className="h-3 w-3"/>} Scan ID</Button>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                {parties.length === 0 ? (<div className="p-6 text-center text-slate-400 text-sm italic">No related parties linked yet.</div>) : (<div className="divide-y divide-slate-100">{parties.map(party => (<div key={party.id} className="p-3 flex flex-col sm:flex-row gap-4 items-center justify-between hover:bg-slate-50"><div className="flex items-center gap-3"><div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs">{party.name.charAt(0)}</div><Input className="h-7 text-sm font-bold border-none p-0 focus-visible:ring-0 bg-transparent w-40" value={party.name} onChange={(e) => updatePartyName(party.id, e.target.value)} /></div><div className="flex gap-2"><button onClick={() => toggleRole(party.id, 'isEmergency')} className={cn("px-2 py-1 rounded border text-[10px] font-bold flex items-center gap-1", party.roles.isEmergency ? "bg-red-50 text-red-700 border-red-200" : "bg-white text-slate-400")}>{party.roles.isEmergency && <Siren className="h-3 w-3"/>} Emergency</button></div></div>))}</div>)}
            </CardContent>
        </Card> 
    )
}

// --- 6. VITAL SIGNS (Input Bug Fixed) ---
const UnitInput = ({ label, unit, value, onChange, placeholder, className, disabled = false }: any) => ( 
    <div className="relative">
        <Label className="text-[10px] uppercase font-semibold text-slate-500 mb-1 block">{label}</Label>
        <div className="relative">
            <Input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} disabled={disabled} className={cn("pr-8 h-9 font-medium focus-visible:ring-1", className)} />
            <span className="absolute right-3 top-2.5 text-[10px] text-slate-400 font-bold select-none">{unit}</span>
        </div>
    </div> 
)
function VitalSignsMonitor({ nurseName }: { nurseName: string }) {
    const { toast } = useToast()
    const [vitals, setVitals] = useState({ height: "", weight: "", temp: "", bpSys: "", bpDia: "", pulse: "", spo2: "" })
    const handleInputChange = (field: string, value: string) => setVitals(prev => ({ ...prev, [field]: value }))
    const saveVitals = () => { toast({ title: "Vitals Recorded", description: `Captured by ${nurseName}` }); setVitals({ height: "", weight: "", temp: "", bpSys: "", bpDia: "", pulse: "", spo2: "" }) }
    return ( 
        <Card className="border-t-4 border-t-red-500 shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-50"><div className="flex justify-between items-center"><CardTitle className="text-sm uppercase text-red-600 flex items-center gap-2"><Activity className="h-4 w-4"/> Vital Signs</CardTitle><div className="text-[10px] text-slate-400">Nurse: {nurseName}</div></div></CardHeader>
            <CardContent className="p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <UnitInput label="Height" unit="cm" value={vitals.height} onChange={(v:string) => handleInputChange('height', v)} />
                    <UnitInput label="Weight" unit="kg" value={vitals.weight} onChange={(v:string) => handleInputChange('weight', v)} />
                    <div className="space-y-1">
                        <Label className="text-[10px] uppercase font-semibold text-slate-500">BP</Label>
                        <div className="flex gap-1"><Input className="h-9 w-12 px-1 text-center" placeholder="120" value={vitals.bpSys} onChange={e=>handleInputChange('bpSys', e.target.value)}/><span className="text-slate-300">/</span><Input className="h-9 w-12 px-1 text-center" placeholder="80" value={vitals.bpDia} onChange={e=>handleInputChange('bpDia', e.target.value)}/></div>
                    </div>
                    <UnitInput label="Temp" unit="°C" value={vitals.temp} onChange={(v:string) => handleInputChange('temp', v)} />
                </div>
                <Button onClick={saveVitals} className="w-full mt-4 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200">Record Vitals</Button>
            </CardContent>
        </Card> 
    )
}

// --- 7. VISUAL OBSERVATIONS (Tags & Multi-Intent) ---
function VisualObservationCard({ medicalIntents: selectedIntents }: { medicalIntents: string[] }) {
    const { toast } = useToast()
    const [capturedImages, setCapturedImages] = useState<Record<string, { tags: string[], captured: boolean }>>({})
    
    const combinedPrompts = useMemo(() => { 
        const allPrompts: VisualPrompt[] = []; 
        const seenIds = new Set(); 
        selectedIntents.forEach(intentId => { 
            const intent = medicalIntents.find(i => i.id === intentId); 
            if (intent) { 
                intent.visualPrompts.forEach(p => { 
                    if (!seenIds.has(p.id)) { seenIds.add(p.id); allPrompts.push(p) } 
                }) 
            } 
        }); 
        return allPrompts 
    }, [selectedIntents])
    
    if (!selectedIntents.length || combinedPrompts.length === 0) return null
    
    const handleCapture = (promptId: string) => { setCapturedImages(prev => ({ ...prev, [promptId]: { tags: [], captured: true } })); toast({ title: "Captured", description: "Select tags." }) }
    const toggleTag = (promptId: string, tag: string) => { setCapturedImages(prev => { const current = prev[promptId]?.tags || []; const updated = current.includes(tag) ? current.filter(t => t !== tag) : [...current, tag]; return { ...prev, [promptId]: { ...prev[promptId], tags: updated } } }) }
    
    return ( 
        <Card className="border-t-4 border-t-purple-500 shadow-sm">
            <CardHeader className="pb-2 bg-purple-50/50"><CardTitle className="text-sm uppercase text-purple-600 flex items-center gap-2"><Camera className="h-4 w-4"/> Visuals</CardTitle></CardHeader>
            <CardContent className="p-3 grid grid-cols-2 gap-3">
                {combinedPrompts.map(prompt => { 
                    const data = capturedImages[prompt.id]; 
                    const tags = prompt.availableTags; 
                    return (
                        <div key={prompt.id} className="border rounded p-2 text-center">
                            {data?.captured ? (
                                <div className="space-y-2">
                                    <div className="h-24 bg-slate-900 rounded flex items-center justify-center text-white text-xs">IMG Captured</div>
                                    <div className="flex flex-wrap gap-1 justify-center">{tags.map(tag => (<button key={tag} onClick={() => toggleTag(prompt.id, tag)} className={cn("text-[9px] px-1.5 py-0.5 rounded border", data.tags.includes(tag) ? "bg-purple-600 text-white" : "bg-white")}>{tag}</button>))}</div>
                                </div>
                            ) : (
                                <button onClick={() => handleCapture(prompt.id)} className="w-full h-24 flex flex-col items-center justify-center bg-slate-50 hover:bg-purple-50 text-slate-400 hover:text-purple-600 transition-colors gap-2"><Camera className="h-6 w-6"/><span className="text-xs font-bold">{prompt.label}</span></button>
                            )}
                        </div>
                    ) 
                })}
            </CardContent>
        </Card> 
    )
}

// --- 8. TELEHEALTH (Specialty Filter) ---
function TelehealthDispatchCard({ medicalIntents: selectedIntents }: { medicalIntents: string[] }) {
    const { toast } = useToast()
    const [specialtyFilter, setSpecialtyFilter] = useState("all")
    const uniqueSpecialties = useMemo(() => ["all", ...Array.from(new Set(doctorPool.map(d => d.specialty)))], [])
    
    const filteredDoctors = useMemo(() => { 
        let docs = [...doctorPool]; 
        if (specialtyFilter !== 'all') docs = docs.filter(d => d.specialty === specialtyFilter); 
        return docs 
    }, [specialtyFilter])
    
    if (selectedIntents.length === 0) return null
    
    return ( 
        <Card className="border-t-4 border-t-pink-500 shadow-sm">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm uppercase text-pink-600 flex items-center gap-2"><Video className="h-4 w-4"/> Telehealth</CardTitle>
                <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}><SelectTrigger className="h-7 w-32 text-xs"><SelectValue placeholder="Specialty" /></SelectTrigger><SelectContent>{uniqueSpecialties.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
            </CardHeader>
            <CardContent className="p-0 max-h-40 overflow-y-auto">
                {filteredDoctors.map(dr => (
                    <div key={dr.id} className="p-2 border-b flex justify-between items-center hover:bg-slate-50">
                        <div className="flex items-center gap-2">
                            <div className={cn("h-6 w-6 rounded-full flex items-center justify-center text-[10px]", dr.avatarColor)}>{dr.name.substring(0,2)}</div>
                            <div><div className="text-xs font-bold">{dr.name}</div><div className="text-[9px] text-slate-500">{dr.specialty}</div></div>
                        </div>
                        <Button size="sm" variant="ghost" className="h-6 text-[10px]" onClick={() => toast({title: "Booked"})}>Book</Button>
                    </div>
                ))}
            </CardContent>
        </Card> 
    )
}

// --- MAIN PAGE ---
export function ReceptionistView({ refreshPatients }: { refreshPatients?: () => Promise<void> } = {}) {
  const { toast } = useToast()
  
  // STATE
  const [admissionType, setAdmissionType] = useState<"citizen" | "foreigner">("citizen")
  const [scanStep, setScanStep] = useState<"idle" | "cccd" | "checking-bhyt" | "complete">("idle")
  
  const [scannedIdentity, setScannedIdentity] = useState<any>(null)
  const [formData, setFormData] = useState({ 
      fullName: "", dob: "", gender: "", citizenId: "", 
      phone: "", email: "", address: "",
      selectedIntents: [] as string[] // Clinical Intents
  })
  
  const [financialData, setFinancialData] = useState({ cardLast4: "", cardExpiry: "", bankName: "", bankAccount: "" })
  const [privateInsurance, setPrivateInsurance] = useState<PrivateInsuranceData>({ provider: "", policyNumber: "", expiryDate: "", frontImg: null, backImg: null, estimatedCoverage: 0.0, isActive: false })
  
  const [selectedTests, setSelectedTests] = useState<LabTest[]>([])
  const [testSearchQuery, setTestSearchQuery] = useState("")
  const [internalAccess, setInternalAccess] = useState<'locked' | 'unlocked'>('locked')

  // Search Logic
  const filteredTests = useMemo(() => {
    if (!testSearchQuery) return []
    return labTestsData.filter(t => t.name.toLowerCase().includes(testSearchQuery.toLowerCase()))
  }, [testSearchQuery])
  
  // Suggested Logic
  const suggestedTests = useMemo(() => { 
      if (formData.selectedIntents.length === 0) return []; 
      const allTestIds = new Set<string>();
      formData.selectedIntents.forEach(id => { const intent = medicalIntents.find(i => i.id === id); if(intent) intent.recommended.forEach(tId => allTestIds.add(tId)) });
      return Array.from(allTestIds).map(id => labTestsData.find(t => t.id === id)).filter(Boolean) as LabTest[] 
  }, [formData.selectedIntents])

  // Scan Logic
  const handleScanComplete = () => {
      setScanStep("cccd");
      setTimeout(() => {
          const extracted = { name: "TRẦN THỊ NGỌC LAN", dob: "15/05/1992", gender: "female", citizenId: "079192000123", address: "123 Nguyen Hue, D1" };
          setScannedIdentity(extracted);
          setFormData(prev => ({ ...prev, fullName: extracted.name, dob: extracted.dob, gender: extracted.gender, citizenId: extracted.citizenId, address: extracted.address }));
          setScanStep("checking-bhyt");
          setTimeout(() => {
              setScannedIdentity((prev:any) => ({ ...prev, bhyt: { code: "DN4797915071630", coverageLabel: "80%", expiry: "31/12/2025" } }));
              setScanStep("complete");
              toast({ title: "Scan Complete", description: "Identity & Insurance retrieved." });
          }, 1000);
      }, 1000);
  }

  const toggleIntent = (id: string) => {
    setFormData(prev => {
        const current = prev.selectedIntents || []
        const updated = current.includes(id) ? current.filter(i => i !== id) : [...current, id]
        return { ...prev, selectedIntents: updated }
    })
  }

  const addTest = (test: LabTest) => { 
      if (!selectedTests.find(t => t.id === test.id)) { setSelectedTests(prev => [...prev, test]); setTestSearchQuery(""); }
  }

  const checkInsuranceEligibility = (test: LabTest, patient: any) => {
      if(!patient?.bhyt) return { isCovered: false, coveragePercent: 0 };
      return { isCovered: true, coveragePercent: 0.8 }; // Mock logic
  }

  return (
    <TooltipProvider>
      <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
        {/* LEFT SCROLLABLE AREA */}
        <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
            <div className="max-w-5xl mx-auto space-y-6 pb-24">
                <div><h1 className="text-2xl font-bold text-slate-900">Patient Admission</h1></div>
                
                {/* 1. Identity (Dual Flow) */}
<IdentityVerificationCard 
    scanStep={scanStep} 
    onScanComplete={handleScanComplete}
    bhytData={scannedIdentity?.bhyt} 
    internalAccess={internalAccess}
    onInternalHistoryClick={() => setInternalAccess('unlocked')}
/>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 2. Demographics (Expanded) */}
                    <div className="md:col-span-2">
                      <DemographicsCard 
    formData={formData} 
    setFormData={setFormData} 
    onCheckBHYT={handleManualBHYTCheck} // Pass the handler
/>
                    </div>

                    {/* 3. Financial Info */}
                    <div className="md:col-span-1">
                        <FinancialInfoCard data={financialData} setData={setFinancialData} />
                    </div>

                    {/* 4. Private Insurance */}
                    <div className="md:col-span-1">
                        <PrivateInsuranceCard data={privateInsurance} onChange={setPrivateInsurance} />
                    </div>
                    
                    {/* 5. Related Parties */}
                    <div className="md:col-span-2">
                        <RelatedPartiesCard />
                    </div>

                    {/* 6. Medical Intent (Multi Select) */}
                    <Card className="border-t-4 border-t-emerald-500 shadow-sm md:col-span-2">
                        <CardHeader className="pb-2"><CardTitle className="text-sm uppercase text-emerald-600 flex items-center gap-2"><Stethoscope className="h-4 w-4"/> Clinical Context</CardTitle></CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {medicalIntents.map(intent => {
                                    const isSelected = formData.selectedIntents.includes(intent.id)
                                    return (
                                        <button key={intent.id} onClick={() => toggleIntent(intent.id)} className={cn("px-3 py-1.5 rounded-full text-xs font-semibold border transition-all flex items-center gap-2", isSelected ? "bg-emerald-600 text-white border-emerald-600 shadow-sm" : "bg-white text-slate-600 border-slate-200")}>
                                            {isSelected && <Check className="h-3 w-3" />}{intent.label}
                                        </button>
                                    )
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* 7. Vital Signs */}
                    <div className="md:col-span-2"><VitalSignsMonitor nurseName="Lan" /></div>

                    {/* 8. Visual Observations */}
                    <div className="md:col-span-2"><VisualObservationCard medicalIntents={formData.selectedIntents} /></div>

                    {/* 9. Order Entry (Fixed Search UI & Recs) */}
                    <Card className="border-t-4 border-t-indigo-500 shadow-sm md:col-span-2 mb-20">
                        <CardHeader className="pb-2"><CardTitle className="text-sm uppercase text-indigo-600 flex items-center gap-2"><Beaker className="h-4 w-4"/> Order Entry</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            {/* Recommended Protocol Block */}
                            {suggestedTests.length > 0 && (
                                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-4 animate-in fade-in slide-in-from-top-2">
                                    <h4 className="text-sm font-bold text-indigo-800 mb-3 flex items-center gap-2"><Sparkles className="h-4 w-4 text-indigo-600"/> Recommended Protocol</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                        {suggestedTests.map(test => { 
                                            const eligible = checkInsuranceEligibility(test, scannedIdentity); 
                                            return (
                                                <button key={test.id} onClick={() => addTest(test)} className="text-left p-2.5 rounded-lg border bg-white border-indigo-200 hover:border-indigo-400 hover:shadow-md transition-all flex justify-between items-center group">
                                                    <div>
                                                        <div className="text-xs font-bold text-slate-700 group-hover:text-indigo-700 transition-colors">{test.name}</div>
                                                        <div className="text-[10px] text-slate-500 mt-0.5">{eligible.coveragePercent === 1.0 ? (<span className="text-emerald-600 font-bold flex items-center gap-1"><ShieldCheck className="h-3 w-3"/> 100% Covered</span>) : (formatCurrency(test.price))}</div>
                                                    </div>
                                                    <PlusCircle className="h-5 w-5 text-indigo-300 group-hover:text-indigo-600 transition-colors"/>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Search Bar */}
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                <Input className="pl-10 h-10" placeholder="Search tests (e.g., 'hemo')..." value={testSearchQuery} onChange={e => setTestSearchQuery(e.target.value)}/>
                            </div>
                            
                            {/* Search Results */}
                            {testSearchQuery && (
                                <div className="border rounded-md divide-y divide-slate-100 max-h-60 overflow-y-auto shadow-sm">
                                    {filteredTests.length > 0 ? filteredTests.map(test => (
                                        <div key={test.id} className="p-3 bg-white flex justify-between items-center hover:bg-slate-50 group cursor-pointer" onClick={() => addTest(test)}>
                                            <div className="flex-1">
                                                <div className="font-bold text-sm text-slate-800">{test.name}</div>
                                                <div className="text-xs text-slate-500 italic mb-1">{test.description}</div>
                                                <div className="flex items-center gap-3">
                                                    <Badge variant="outline" className="text-[10px] h-5 bg-slate-50 text-slate-600 border-slate-200 gap-1 font-normal">
                                                        <FlaskConical className="h-3 w-3"/> Result in {test.turnaroundHours}h
                                                    </Badge>
                                                    <span className="text-xs font-bold text-blue-600">{formatCurrency(test.price)}</span>
                                                </div>
                                            </div>
                                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-indigo-600 hover:bg-indigo-50"><PlusCircle className="h-5 w-5" /></Button>
                                        </div>
                                    )) : (<div className="p-4 text-center text-sm text-slate-400">No tests found.</div>)}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* 10. Telehealth Dispatch */}
                    <div className="md:col-span-2">
                        <TelehealthDispatchCard medicalIntents={formData.selectedIntents} />
                    </div>
                </div>
            </div>
        </div>

        {/* RIGHT CART */}
        <div className="w-[350px] border-l bg-white shadow-xl flex flex-col z-20">
             <div className="p-4 border-b bg-slate-50 font-bold text-slate-800 flex items-center gap-2"><ShoppingCart className="h-5 w-5"/> Order Cart ({selectedTests.length})</div>
             <div className="flex-1 p-4 space-y-2 overflow-y-auto">
                 {selectedTests.map(t => (
                     <div key={t.id} className="p-2 border rounded text-sm flex justify-between items-center bg-slate-50">
                         <span>{t.name}</span>
                         <span className="font-bold">{formatCurrency(t.price)}</span>
                     </div>
                 ))}
                 {selectedTests.length === 0 && <div className="text-center text-slate-400 text-sm mt-10">Empty Cart</div>}
             </div>
             <div className="p-4 border-t bg-slate-50">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">Submit Order</Button>
             </div>
        </div>
      </div>
    </TooltipProvider>
  )
}