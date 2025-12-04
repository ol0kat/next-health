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
  Clock, Lock, ShieldCheck, 
  ShoppingCart, FileText, Activity, Save, Beaker, 
  FileSignature, Sparkles, Stethoscope, 
  PlusCircle, Thermometer, Wind, HeartPulse, Scale,
  Camera, Image as ImageIcon, Eye, AlertTriangle, 
  Users, Trash2, Phone, Plus, ScanLine, CreditCard, Baby, Siren,
  Shield, RefreshCw, Video, CalendarClock, Zap, FlaskConical,
  Globe, Filter, Mail, MapPin, Landmark, Wallet
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// --- TYPES ---
interface LabTest { id: string, name: string, price: number, category: string, sampleType: string, turnaroundHours: number, requiresConsent?: boolean, popular?: boolean, description?: string, linkedCondition?: string, frequencyDays?: number }

interface VisualPrompt { id: string; label: string; icon: string; availableTags: string[]; }
interface MedicalIntent { id: string; label: string; recommended: string[]; visualPrompts: VisualPrompt[]; }

// --- MOCK DATA ---
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
    { id: "general_checkup", label: "General Health Checkup", recommended: ["cbc", "lipid", "hba1c"], visualPrompts: [] },
    { id: "chronic_diabetes", label: "Diabetes Monitoring", recommended: ["hba1c", "lipid"], visualPrompts: [{ id: "foot_exam", label: "Foot/Ulcer Exam", icon: "foot", availableTags: ["Normal", "Ulcer", "Swelling", "Redness", "Callus", "Gangrene"] }, { id: "injection_site", label: "Injection Sites", icon: "skin", availableTags: ["Normal", "Bruising", "Lipohypertrophy", "Infection", "Scarring"] }] },
    { id: "fever_infection", label: "Fever & Infection", recommended: ["cbc", "dengue"], visualPrompts: [{ id: "skin_rash", label: "Skin Rash / Petechiae", icon: "skin", availableTags: ["None", "Petechiae", "Maculopapular", "Hives", "Blisters", "Diffused Redness"] }, { id: "eye_exam", label: "Bloodshot Eyes / Sclera", icon: "eye", availableTags: ["Normal", "Red/Bloodshot", "Jaundice (Yellow)", "Discharge", "Pale"] }, { id: "throat", label: "Throat / Tonsils", icon: "mouth", availableTags: ["Normal", "Inflamed", "White Spots (Pus)", "Swollen Tonsils", "Bleeding"] }] },
    { id: "std_screening", label: "STD / Sexual Health", recommended: ["hiv", "syphilis"], visualPrompts: [{ id: "lesion", label: "Visible Lesions", icon: "skin", availableTags: ["None", "Ulcer", "Wart-like", "Blister", "Discharge", "Rash"] }] },
    { id: "fertility", label: "Fertility / IVF Support", recommended: ["amh", "fsh", "cbc"], visualPrompts: [] },
    { id: "prenatal", label: "Prenatal Care (1st Trim)", recommended: ["cbc", "beta_hcg", "hiv", "syphilis"], visualPrompts: [] },
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

// --- IDENTITY CARD (REFACTORED FOR 2 FLOWS) ---
function IdentityVerificationCard({ 
    admissionType, 
    setAdmissionType, 
    onScanComplete, 
    scanStep, 
    bhytData,
    onInternalHistoryClick,
    internalAccess
}: any) {
    const isCitizen = admissionType === 'citizen';
    const isComplete = scanStep === "complete";

    return (
        <Card className="border-t-4 border-t-blue-600 shadow-sm mb-6">
            <CardHeader className="pb-3 border-b border-slate-100">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-sm uppercase text-blue-600 flex items-center gap-2">
                        <User className="h-4 w-4"/> Patient Identification
                    </CardTitle>
                    <Tabs value={admissionType} onValueChange={setAdmissionType} className="w-[300px]">
                        <TabsList className="grid w-full grid-cols-2 h-8">
                            <TabsTrigger value="citizen" className="text-xs">Citizen (CCCD)</TabsTrigger>
                            <TabsTrigger value="foreigner" className="text-xs">Foreigner / Manual</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                {isCitizen ? (
                    // FLOW 1: CITIZEN
                    <div className="grid grid-cols-1 md:grid-cols-2 divide-x divide-slate-100">
                        <div className="p-6 flex flex-col items-center justify-center space-y-4 text-center">
                            {scanStep === 'idle' ? (
                                <>
                                    <div className="h-16 w-16 bg-blue-50 rounded-full flex items-center justify-center mb-2">
                                        <QrCode className="h-8 w-8 text-blue-600" />
                                    </div>
                                    <Button onClick={onScanComplete} className="bg-blue-600 hover:bg-blue-700 w-full max-w-xs">
                                        <ScanLine className="mr-2 h-4 w-4"/> Scan CCCD Chip
                                    </Button>
                                    <p className="text-xs text-slate-400">Place card on reader to auto-fill demographics & BHYT</p>
                                </>
                            ) : (
                                <div className="space-y-2">
                                    <div className="inline-flex items-center gap-2 text-emerald-600 font-bold bg-emerald-50 px-4 py-2 rounded-full text-sm">
                                        <CheckCircle2 className="h-5 w-5"/> Identity Verified
                                    </div>
                                    <p className="text-xs text-slate-500">Data extracted successfully.</p>
                                </div>
                            )}
                        </div>
                        
                        <div className="p-5 bg-slate-50/50">
                            {/* BHYT SECTION - Only shows for Citizen flow */}
                            <div className="flex items-center gap-2 text-xs font-bold text-blue-500 uppercase tracking-wider mb-4">
                                <ShieldCheck className="h-4 w-4" /> Insurance (BHYT)
                            </div>
                            {scanStep === 'idle' ? (
                                <div className="h-24 flex items-center justify-center text-slate-400 text-sm italic border-2 border-dashed rounded-lg">
                                    Waiting for ID Scan...
                                </div>
                            ) : bhytData ? (
                                <div className="space-y-3 animate-in fade-in">
                                    <div>
                                        <div className="text-xs text-slate-400 font-bold mb-1">Card Number</div>
                                        <div className="font-bold text-xl text-blue-600 font-mono tracking-tight">{bhytData.code}</div>
                                    </div>
                                    <div className="flex justify-between items-center bg-blue-50 border border-blue-100 p-2 rounded">
                                        <div>
                                            <div className="text-[10px] text-blue-600 font-bold uppercase">Benefit Level</div>
                                            <div className="text-sm font-bold text-slate-800">{bhytData.coverageLabel}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[10px] text-blue-600 font-bold uppercase">Expiry</div>
                                            <div className="text-sm font-bold text-slate-800">{bhytData.expiry}</div>
                                        </div>
                                    </div>
                                    <div className="pt-2 border-t border-slate-200">
                                        {internalAccess === 'locked' ? (
                                            <Button onClick={onInternalHistoryClick} variant="outline" size="sm" className="w-full h-7 text-xs border-amber-300 bg-amber-50 text-amber-800 border-dashed">
                                                <Lock className="h-3 w-3 mr-2" /> Unlock History
                                            </Button>
                                        ) : (
                                            <div className="text-center text-xs text-emerald-600 font-bold flex items-center justify-center gap-1">
                                                <History className="h-3 w-3"/> History Unlocked
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-amber-600 text-sm font-bold flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4"/> No BHYT Found
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    // FLOW 2: FOREIGNER / MANUAL
                    <div className="p-6 bg-slate-50/30">
                        <div className="flex items-start gap-4">
                            <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
                                <Globe className="h-6 w-6 text-amber-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800">International / Manual Admission</h3>
                                <p className="text-sm text-slate-500 mb-2">BHYT Insurance is not available for this admission type.</p>
                                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Manual Entry Mode</Badge>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

// --- DEMOGRAPHICS CARD (Expanded) ---
function DemographicsCard({ formData, setFormData, isLocked }: any) {
    return (
        <Card className="border-t-4 border-t-slate-500 shadow-sm">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm uppercase text-slate-600 flex items-center gap-2">
                    <FileText className="h-4 w-4"/> Patient Demographics
                </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Row 1 */}
                <div className="space-y-1">
                    <Label className="text-xs text-slate-500">Full Name</Label>
                    <Input 
                        value={formData.fullName} 
                        onChange={e => setFormData({...formData, fullName: e.target.value})} 
                        className="font-bold uppercase"
                        placeholder="NGUYEN VAN A"
                    />
                </div>
                <div className="space-y-1">
                    <Label className="text-xs text-slate-500">Identity Number (CCCD/Passport)</Label>
                    <Input 
                        value={formData.citizenId} 
                        onChange={e => setFormData({...formData, citizenId: e.target.value})} 
                        className="font-mono"
                        placeholder="079..."
                    />
                </div>

                {/* Row 2 */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <Label className="text-xs text-slate-500">Date of Birth</Label>
                        <Input 
                            value={formData.dob} 
                            onChange={e => setFormData({...formData, dob: e.target.value})} 
                            placeholder="DD/MM/YYYY"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs text-slate-500">Gender</Label>
                        <Select value={formData.gender} onValueChange={(val) => setFormData({...formData, gender: val})}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="space-y-1">
                    <Label className="text-xs text-slate-500 flex items-center gap-1"><Phone className="h-3 w-3"/> Phone Number</Label>
                    <Input 
                        value={formData.phone} 
                        onChange={e => setFormData({...formData, phone: e.target.value})} 
                        placeholder="090..."
                    />
                </div>

                {/* Row 3 */}
                <div className="space-y-1">
                    <Label className="text-xs text-slate-500 flex items-center gap-1"><Mail className="h-3 w-3"/> Email (Optional)</Label>
                    <Input 
                        value={formData.email} 
                        onChange={e => setFormData({...formData, email: e.target.value})} 
                        placeholder="patient@example.com"
                    />
                </div>
                <div className="space-y-1">
                    <Label className="text-xs text-slate-500 flex items-center gap-1"><MapPin className="h-3 w-3"/> Current Address</Label>
                    <Input 
                        value={formData.address} 
                        onChange={e => setFormData({...formData, address: e.target.value})} 
                        placeholder="123 Street, District 1, HCMC"
                    />
                </div>
            </CardContent>
        </Card>
    )
}

// --- FINANCIAL & PAYMENT CARD (New) ---
function FinancialInfoCard({ data, setData }: any) {
    return (
        <Card className="border-t-4 border-t-emerald-600 shadow-sm">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm uppercase text-emerald-700 flex items-center gap-2">
                    <Wallet className="h-4 w-4"/> Financial & Reimbursement
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="payment_method" className="w-full">
                    <TabsList className="w-full grid grid-cols-2 mb-4">
                        <TabsTrigger value="payment_method">Card on File</TabsTrigger>
                        <TabsTrigger value="reimbursement">Bank Refund Info</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="payment_method" className="space-y-4">
                        <div className="bg-slate-50 border border-dashed border-slate-300 rounded-lg p-4 flex flex-col items-center justify-center text-center">
                            {data.cardLast4 ? (
                                <div className="flex items-center gap-3 w-full">
                                    <div className="h-10 w-10 bg-emerald-100 rounded flex items-center justify-center text-emerald-600">
                                        <CreditCard className="h-6 w-6"/>
                                    </div>
                                    <div className="text-left flex-1">
                                        <div className="font-bold text-slate-800">Visa ending in •••• {data.cardLast4}</div>
                                        <div className="text-xs text-slate-500">Expires {data.cardExpiry}</div>
                                    </div>
                                    <Button variant="ghost" size="sm" className="text-red-500" onClick={() => setData({...data, cardLast4: ""})}>Remove</Button>
                                </div>
                            ) : (
                                <>
                                    <p className="text-sm text-slate-500 mb-3">No payment method on file for self-pay portions.</p>
                                    <Button variant="outline" size="sm" onClick={() => setData({...data, cardLast4: "4242", cardExpiry: "12/25"})}>
                                        <Plus className="h-3 w-3 mr-2"/> Add Credit/Debit Card
                                    </Button>
                                </>
                            )}
                        </div>
                    </TabsContent>
                    
                    <TabsContent value="reimbursement" className="space-y-3">
                        <div className="space-y-1">
                            <Label className="text-xs text-slate-500">Bank Name</Label>
                            <Select onValueChange={(v) => setData({...data, bankName: v})}>
                                <SelectTrigger><SelectValue placeholder="Select Bank" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="vcb">Vietcombank</SelectItem>
                                    <SelectItem value="tcb">Techcombank</SelectItem>
                                    <SelectItem value="acb">ACB</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs text-slate-500">Account Number</Label>
                            <Input placeholder="e.g. 0071000..." value={data.bankAccount} onChange={e => setData({...data, bankAccount: e.target.value})} />
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}

// --- UNIT INPUT (Helper) ---
const UnitInput = ({ label, unit, value, onChange, placeholder, className, disabled = false }: any) => ( 
  <div className="relative">
    <Label className="text-[10px] uppercase font-semibold text-slate-500 mb-1 block">{label}</Label>
    <div className="relative">
      <Input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} disabled={disabled} className={cn("pr-8 h-9 font-medium focus-visible:ring-1", className)} />
      <span className="absolute right-3 top-2.5 text-[10px] text-slate-400 font-bold select-none">{unit}</span>
    </div>
  </div> 
)

// --- MAIN PAGE COMPONENT ---
export function ReceptionistView({ refreshPatients }: { refreshPatients?: () => Promise<void> } = {}) {
  const { toast } = useToast()
  
  // STATE MANAGEMENT
  const [admissionType, setAdmissionType] = useState<"citizen" | "foreigner">("citizen")
  const [scanStep, setScanStep] = useState<"idle" | "cccd" | "checking-bhyt" | "complete">("idle")
  
  // Core Data
  const [scannedIdentity, setScannedIdentity] = useState<any>(null)
  const [formData, setFormData] = useState({ 
      fullName: "", dob: "", gender: "", citizenId: "", 
      phone: "", email: "", address: "",
      selectedIntents: [] as string[] 
  })
  
  // Financial Data
  const [financialData, setFinancialData] = useState({ cardLast4: "", cardExpiry: "", bankName: "", bankAccount: "" })

  const [selectedTests, setSelectedTests] = useState<LabTest[]>([])
  const [testSearchQuery, setTestSearchQuery] = useState("")
  const [privateInsurance, setPrivateInsurance] = useState<any>({ isActive: false, provider: "", policyNumber: "", expiryDate: "", estimatedCoverage: 0 })
  const [internalAccess, setInternalAccess] = useState<'locked' | 'unlocked'>('locked')

  // LOGIC: Filter tests based on search
  const filteredTests = useMemo(() => {
    if (!testSearchQuery) return []
    return labTestsData.filter(t => 
        t.name.toLowerCase().includes(testSearchQuery.toLowerCase()) || 
        t.id.includes(testSearchQuery.toLowerCase())
    )
  }, [testSearchQuery])

  // LOGIC: Scan Flow
  const handleScanComplete = () => {
      setScanStep("cccd");
      // Simulate scanning delay
      setTimeout(() => {
          // 1. Mock Extracted Data
          const extracted = { 
              name: "TRẦN THỊ NGỌC LAN", 
              dob: "15/05/1992", 
              gender: "female",
              citizenId: "079192000123",
              address: "123 Nguyen Hue, Ben Nghe, D1"
          };
          
          // 2. Populate Identity State
          setScannedIdentity(extracted);
          
          // 3. Populate Form State (Auto-fill)
          setFormData(prev => ({
              ...prev, 
              fullName: extracted.name,
              dob: extracted.dob,
              gender: extracted.gender,
              citizenId: extracted.citizenId,
              address: extracted.address
          }));

          // 4. Trigger BHYT Check
          setScanStep("checking-bhyt");
          setTimeout(() => {
              setScannedIdentity((prev:any) => ({ 
                  ...prev, 
                  bhyt: { code: "DN4797915071630", coverageLabel: "80% (Lvl 4)", expiry: "31/12/2025" }, 
                  chronicCondition: "Type 2 Diabetes", 
                  activeReferral: "TD-2401-99"
              }));
              setScanStep("complete");
              toast({ title: "Scan Complete", description: "Identity and Insurance data retrieved." });
          }, 1200);

      }, 1000);
  }

  const addTest = (test: LabTest) => { 
      if (!selectedTests.find(t => t.id === test.id)) { 
          setSelectedTests(prev => [...prev, test]); 
          setTestSearchQuery(""); 
      }
  }

  return (
    <TooltipProvider>
      <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
        {/* LEFT CONTENT */}
        <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
            <div className="max-w-5xl mx-auto space-y-6 pb-24">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Patient Admission</h1>
                    <p className="text-slate-500">Reception & Triage • Nurse: <b>Lan Nguyen</b></p>
                </div>
                
                {/* 1. Identity & Admission Type */}
                <IdentityVerificationCard 
                    admissionType={admissionType}
                    setAdmissionType={setAdmissionType}
                    scanStep={scanStep}
                    onScanComplete={handleScanComplete}
                    bhytData={scannedIdentity?.bhyt}
                    internalAccess={internalAccess}
                    onInternalHistoryClick={() => setInternalAccess('unlocked')} // Simplified for demo
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 2. Demographics (Expanded) */}
                    <div className="md:col-span-2">
                        <DemographicsCard 
                            formData={formData} 
                            setFormData={setFormData}
                            isLocked={admissionType === 'citizen' && scanStep === 'complete'}
                        />
                    </div>

                    {/* 3. Financial Info (New) */}
                    <div className="md:col-span-1">
                        <FinancialInfoCard data={financialData} setData={setFinancialData} />
                    </div>

                    {/* 4. Private Insurance (Existing) */}
                    <div className="md:col-span-1">
                        {/* Simplified reuse of your existing component logic */}
                        <div className="p-4 bg-white border rounded-lg shadow-sm border-t-4 border-t-sky-500 h-full">
                            <h3 className="text-sm font-bold text-sky-600 uppercase flex gap-2 mb-4"><Shield className="h-4 w-4"/> Private Insurance</h3>
                            {/* ... (Reuse your existing PrivateInsuranceCard logic here or import it) ... */}
                             <Button variant="outline" size="sm" className="w-full">Manage Private Policy</Button>
                        </div>
                    </div>

                    {/* 5. Order Entry (Updated Search Result) */}
                    <Card className="border-t-4 border-t-indigo-500 shadow-sm md:col-span-2 mb-20">
                        <CardHeader className="pb-2"><CardTitle className="text-sm uppercase text-indigo-600 flex items-center gap-2"><Beaker className="h-4 w-4"/> Order Entry</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                <Input className="pl-10 h-10" placeholder="Search tests (e.g., 'hemo')..." value={testSearchQuery} onChange={e => setTestSearchQuery(e.target.value)}/>
                            </div>
                            
                            {/* UPDATED SEARCH RESULTS with Turnaround Badge */}
                            {testSearchQuery && (
                                <div className="border rounded-md divide-y divide-slate-100 max-h-60 overflow-y-auto shadow-sm">
                                    {filteredTests.length > 0 ? filteredTests.map(test => (
                                        <div key={test.id} className="p-3 bg-white flex justify-between items-center hover:bg-slate-50 group cursor-pointer" onClick={() => addTest(test)}>
                                            <div className="flex-1">
                                                <div className="font-bold text-sm text-slate-800">{test.name}</div>
                                                <div className="text-xs text-slate-500 italic mb-1">{test.description}</div>
                                                
                                                {/* MOVED TURNAROUND TIME HERE */}
                                                <div className="flex items-center gap-3">
                                                    <Badge variant="outline" className="text-[10px] h-5 bg-slate-50 text-slate-600 border-slate-200 gap-1 font-normal">
                                                        <FlaskConical className="h-3 w-3"/> Result in {test.turnaroundHours}h
                                                    </Badge>
                                                    <span className="text-xs font-bold text-blue-600">{formatCurrency(test.price)}</span>
                                                </div>
                                            </div>
                                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-indigo-600 hover:bg-indigo-50">
                                                <PlusCircle className="h-5 w-5" />
                                            </Button>
                                        </div>
                                    )) : (
                                        <div className="p-4 text-center text-sm text-slate-400">No tests found matching "{testSearchQuery}"</div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>

        {/* RIGHT CART (Simplified for brevity) */}
        <div className="w-[400px] border-l bg-white shadow-xl flex flex-col z-20">
             <div className="p-4 border-b bg-slate-50 font-bold text-slate-800 flex items-center gap-2">
                 <ShoppingCart className="h-5 w-5"/> Order Cart ({selectedTests.length})
             </div>
             <div className="flex-1 p-4">
                 {selectedTests.map(t => (
                     <div key={t.id} className="mb-2 p-2 border rounded text-sm flex justify-between">
                         <span>{t.name}</span>
                         <span className="font-bold">{formatCurrency(t.price)}</span>
                     </div>
                 ))}
             </div>
        </div>
      </div>
    </TooltipProvider>
  )
}