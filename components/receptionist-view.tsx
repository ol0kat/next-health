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
  Receipt
} from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { TooltipProvider } from "@/components/ui/tooltip"
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

// --- MOCK DATA: Lab Tests (Enhanced with VND & Time) ---
interface LabTest {
  id: string
  name: string
  shortName?: string
  price: number // VND
  category: string
  sampleType: string
  turnaroundHours: number
  description: string
  requiresFasting?: boolean
  popular?: boolean
}

const labTestsData: LabTest[] = [
  { id: "cbc", name: "Complete Blood Count", shortName: "CBC", price: 120000, category: "Hematology", sampleType: "Whole Blood", turnaroundHours: 4, description: "Evaluates overall health; detects anemia, infection, etc.", popular: true },
  { id: "hba1c", name: "Hemoglobin A1c", shortName: "HbA1c", price: 180000, category: "Biochemistry", sampleType: "Whole Blood", turnaroundHours: 24, description: "Average blood sugar over past 3 months.", popular: true },
  { id: "lipid", name: "Lipid Panel", shortName: "Lipid", price: 250000, category: "Biochemistry", sampleType: "Serum", turnaroundHours: 24, description: "Cholesterol & triglycerides. Heart health check.", requiresFasting: true, popular: true },
  { id: "cmp", name: "Comprehensive Metabolic Panel", shortName: "CMP", price: 320000, category: "Biochemistry", sampleType: "Serum", turnaroundHours: 24, description: "Kidney/liver function, electrolytes, fluid balance.", requiresFasting: true, popular: true },
  { id: "tsh", name: "Thyroid Stimulating Hormone", shortName: "TSH", price: 150000, category: "Endocrinology", sampleType: "Serum", turnaroundHours: 24, description: "Thyroid function screening.", popular: true },
  { id: "urine", name: "Urinalysis", shortName: "Urine", price: 80000, category: "Microbiology", sampleType: "Urine", turnaroundHours: 2, description: "Detects UTIs, kidney disease.", popular: true },
  { id: "vitd", name: "Vitamin D Total", shortName: "Vit D", price: 450000, category: "Special Chem", sampleType: "Serum", turnaroundHours: 48, description: "Bone health & immune function." },
  { id: "crp", name: "C-Reactive Protein (CRP)", shortName: "CRP", price: 160000, category: "Immunology", sampleType: "Serum", turnaroundHours: 24, description: "Inflammation marker." },
]

// --- MOCK DATA: Address & Countries ---
const vnLocations: Record<string, { label: string, districts: Record<string, { label: string, wards: string[] }> }> = {
  "hcm": {
    label: "TP. Hồ Chí Minh",
    districts: {
      "quan1": { label: "Quận 1", wards: ["Phường Bến Nghé", "Phường Bến Thành", "Phường Đa Kao"] },
      "quan3": { label: "Quận 3", wards: ["Phường Võ Thị Sáu", "Phường 1", "Phường 2"] }
    }
  },
  "hanoi": {
    label: "TP. Hà Nội",
    districts: {
      "badinh": { label: "Quận Ba Đình", wards: ["Phường Phúc Xá", "Phường Trúc Bạch"] },
      "dongda": { label: "Quận Đống Đa", wards: ["Phường Láng Hạ", "Phường Láng Thượng"] }
    }
  }
}

const countryCodes = [
  { value: "vn", label: "Vietnam", code: "+84", flag: "🇻🇳" },
  { value: "us", label: "United States", code: "+1", flag: "🇺🇸" },
  { value: "gb", label: "United Kingdom", code: "+44", flag: "🇬🇧" },
  { value: "fr", label: "France", code: "+33", flag: "🇫🇷" },
]

// --- HELPER: Formatters ---
const formatCurrency = (amount: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)

const getResultDate = (hours: number) => {
  const date = new Date()
  date.setHours(date.getHours() + hours)
  return date
}

const formatDateFriendly = (date: Date) => {
  const now = new Date()
  const diffDays = date.getDate() - now.getDate()
  const timeStr = date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  
  if (diffDays === 0) return `Today by ${timeStr}`
  if (diffDays === 1) return `Tomorrow by ${timeStr}`
  return `${date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}`
}

// --- COMPONENTS ---

function PhoneInput({ value, onChange, className, error, defaultCountry = "vn" }: any) {
  const [open, setOpen] = useState(false)
  const initialCountry = countryCodes.find(c => c.value === defaultCountry) || countryCodes[0]
  const [selectedCountry, setSelectedCountry] = useState(initialCountry)
  const [isTouched, setIsTouched] = useState(false)
  const isValid = value.length >= 9 && value.length <= 11 
  const showError = (error || (isTouched && !isValid))

  return (
    <div className={cn("space-y-1", className)}>
      <div className={cn("flex items-center rounded-md border bg-transparent shadow-sm transition-colors focus-within:ring-1 focus-within:ring-ring", showError ? "border-red-500 focus-within:ring-red-500" : "border-input")}>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" role="combobox" aria-expanded={open} className="flex gap-1 rounded-r-none border-r px-3 hover:bg-transparent">
              <span className="text-lg">{selectedCountry.flag}</span>
              <span className="text-muted-foreground text-xs font-medium">{selectedCountry.code}</span>
              <ChevronsUpDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[240px] p-0" align="start">
            <Command>
              <CommandInput placeholder="Search country..." />
              <CommandList>
                <CommandEmpty>No country found.</CommandEmpty>
                <CommandGroup>
                  {countryCodes.map((country) => (
                    <CommandItem key={country.value} value={country.label} onSelect={() => { setSelectedCountry(country); setOpen(false); }}>
                      <Check className={cn("mr-2 h-4 w-4", selectedCountry.value === country.value ? "opacity-100" : "opacity-0")} />
                      <span className="mr-2 text-lg">{country.flag}</span>
                      {country.label} ({country.code})
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <Input className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 rounded-l-none pl-2" placeholder="Enter phone number" value={value} onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))} onBlur={() => setIsTouched(true)} maxLength={15} />
      </div>
      {showError && <p className="text-[10px] font-medium text-red-500 animate-in slide-in-from-top-1">Invalid phone number.</p>}
    </div>
  )
}

function IdentityVerificationCard({ data, scanStep, onClear }: any) {
  if (!data.name && scanStep === "idle") return null
  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return "..."
    const date = new Date(dateStr)
    const age = new Date().getFullYear() - date.getFullYear()
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()} - ${age} years old`
  }
  const formatKCBDate = (dateStr: string) => {
    if (!dateStr || dateStr.length !== 12) return dateStr
    return `${dateStr.substring(6, 8)}/${dateStr.substring(4, 6)}/${dateStr.substring(0, 4)}`
  }

  const isComplete = scanStep === "complete"
  let statusColor = "bg-slate-500"; let statusText = "PROCESSING..."; let statusIcon = <Loader2 className="h-4 w-4 animate-spin" />
  
  if (scanStep === "cccd") { statusText = "SCANNING CCCD..." }
  else if (scanStep === "checking-bhyt") { statusText = "VERIFYING INSURANCE (BHYT)..."; statusColor = "bg-blue-600" }
  else if (scanStep === "checking-history") { statusText = "RETRIEVING MEDICAL HISTORY..."; statusColor = "bg-indigo-600" }
  else if (isComplete) { statusColor = "bg-emerald-600"; statusText = `IDENTITY & INSURANCE VERIFIED`; statusIcon = <CheckCircle2 className="h-4 w-4" /> }

  return (
    <div className="mb-6 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="bg-white dark:bg-slate-900 border rounded-xl overflow-hidden shadow-lg transition-all duration-300">
        <div className={cn("px-4 py-2 flex items-center justify-between text-white font-medium text-sm transition-colors duration-500", statusColor)}>
          <div className="flex items-center gap-2">{statusIcon}<span className="uppercase tracking-wide font-semibold">{statusText}</span></div>
          {isComplete && <Button variant="ghost" size="sm" onClick={onClear} className="h-6 w-6 p-0 text-white/80 hover:text-white hover:bg-white/20"><X className="h-4 w-4" /></Button>}
        </div>
        <div className="p-0 grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x">
          <div className="md:col-span-4 p-5 bg-slate-50/50 space-y-4">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider"><User className="h-3 w-3" /> Citizen Identity (CCCD)</div>
            {scanStep === "cccd" ? <div className="space-y-2 py-2"><div className="h-6 w-3/4 bg-slate-200 rounded animate-pulse" /><div className="h-4 w-1/2 bg-slate-200 rounded animate-pulse" /></div> : (
              <>
                <div className="space-y-1"><h3 className="text-xl font-bold text-slate-900 uppercase">{data.name}</h3><div className="flex items-center gap-1 font-medium text-sm text-slate-600"><Clock className="h-3.5 w-3.5 text-slate-400" />{formatDateDisplay(data.dob)}</div></div>
                <div className="pt-2"><div className="text-xs text-slate-500 mb-0.5">Citizen ID Number</div><div className="font-mono text-base font-medium tracking-wide text-slate-800">{data.citizenId}</div></div>
              </>
            )}
          </div>
          <div className="md:col-span-4 p-5 bg-white space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-24 bg-blue-50 rounded-full -mr-10 -mt-10 opacity-50 pointer-events-none"></div>
            <div className="flex items-center gap-2 text-blue-600 text-xs font-bold uppercase tracking-wider relative z-10"><ShieldCheck className="h-3 w-3" /> Health Insurance</div>
            {(scanStep === "cccd" || scanStep === "checking-bhyt") ? <div className="space-y-2 py-2 opacity-60"><div className="flex items-center gap-2 text-sm text-blue-600 animate-pulse"><Loader2 className="h-3 w-3 animate-spin" /> Checking Database...</div><div className="h-8 w-full bg-slate-100 rounded" /></div> : data.bhyt ? (
              <div className="relative z-10 space-y-3">
                <div className="space-y-1"><div className="text-xs text-slate-500">Card Number</div><div className="font-mono text-lg font-bold text-blue-700 tracking-wider">{data.bhyt.code}</div></div>
                <div className="grid grid-cols-2 gap-4"><div><div className="text-xs text-slate-500">Coverage</div><div className="font-bold text-emerald-600">{data.bhyt.coverage * 100}% (Lvl 4)</div></div><div><div className="text-xs text-slate-500">Expiry</div><div className="font-medium text-slate-700">{data.bhyt.expiry}</div></div></div>
                <div className="pt-2 border-t border-dashed border-slate-200"><div className="flex items-start gap-2"><MapPin className="h-3.5 w-3.5 text-slate-400 mt-0.5" /><div className="text-sm font-medium text-slate-800 leading-tight">{data.bhyt.facility}</div></div></div>
              </div>
            ) : <div className="h-full flex items-center justify-center text-sm text-muted-foreground">No Insurance Found</div>}
          </div>
          <div className="md:col-span-4 p-5 bg-slate-50/30 space-y-4 border-l">
            <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider"><History className="h-3 w-3" /> Medical History (BHYT)</div>
            {(!data.history) ? <div className="h-full flex flex-col items-center justify-center space-y-3 min-h-[140px]"><Activity className="h-8 w-8 mb-2 opacity-20 text-slate-400" /><p className="text-xs text-slate-400">Waiting for verify...</p></div> : (
               <div className="space-y-3">{data.history.map((record:any, idx:number) => (
                  <div key={idx} className="bg-white p-2.5 rounded border shadow-sm text-xs space-y-1 relative overflow-hidden hover:border-indigo-300 transition-colors">
                     <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-400"></div>
                     <div className="flex justify-between font-semibold text-slate-700"><span>{record.tenBenh}</span><span className="text-slate-500 font-normal">{formatKCBDate(record.ngayVao)}</span></div>
                     <div className="text-slate-500 truncate pr-2">{record.maCSKCB} • {record.kqDieuTri}</div>
                  </div>
               ))}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export function ReceptionistView({ patients, setPatients }: any) {
  const { toast } = useToast()
  const [scanStep, setScanStep] = useState<"idle" | "cccd" | "checking-bhyt" | "checking-history" | "complete">("idle")
  const [scannedIdentity, setScannedIdentity] = useState<any>(null)
  
  // Data States
  const [formData, setFormData] = useState({ fullName: "", dob: "", gender: "male", citizenId: "", hiCode: "", phone: "", email: "", contactMethod: "phone", examDate: new Date().toISOString().split("T")[0], examTime: new Date().toTimeString().slice(0, 5), consultationFee: "0", symptom: "", medicalHistory: "", relativeName: "", relativePhone: "", relativeRelation: "other", height: "", weight: "", temp: "", bp: "" })
  const [address, setAddress] = useState({ city: "", district: "", ward: "", street: "" })
  
  // Lab Order States
  const [testSearchQuery, setTestSearchQuery] = useState("")
  const [selectedTests, setSelectedTests] = useState<LabTest[]>([])
  const [showTestSearch, setShowTestSearch] = useState(false)

  // Derived Lab Data
  const totalTestsPrice = useMemo(() => selectedTests.reduce((sum, t) => sum + t.price, 0), [selectedTests])
  const filteredTests = useMemo(() => {
    if (!testSearchQuery.trim()) return []
    const query = testSearchQuery.toLowerCase()
    return labTestsData.filter((test) => test.name.toLowerCase().includes(query) || test.shortName?.toLowerCase().includes(query)).slice(0, 8)
  }, [testSearchQuery])

  const timeline = useMemo(() => {
    if (selectedTests.length === 0) return null
    const times = selectedTests.map(t => t.turnaroundHours)
    const minTime = Math.min(...times)
    const maxTime = Math.max(...times)
    return {
      firstResult: formatDateFriendly(getResultDate(minTime)),
      finalResult: formatDateFriendly(getResultDate(maxTime)),
      isSameDay: getResultDate(minTime).getDate() === getResultDate(maxTime).getDate()
    }
  }, [selectedTests])

  // Handlers
  const addTest = (test: LabTest) => {
    if (!selectedTests.find((t) => t.id === test.id)) setSelectedTests([...selectedTests, test])
    setTestSearchQuery(""); setShowTestSearch(false)
  }
  const removeTest = (testId: string) => setSelectedTests(selectedTests.filter((t) => t.id !== testId))

  const handleScanProcess = () => {
    setScanStep("cccd"); setTimeout(() => {
      const cccdData = { fullName: "TRẦN THỊ NGỌC LAN", dob: "1992-05-15", gender: "female", citizenId: "079192000123" }
      setScannedIdentity({ ...cccdData }); setFormData(prev => ({ ...prev, ...cccdData })); setAddress({ city: "hcm", district: "quan1", ward: "Phường Bến Nghé", street: "15 Lê Duẩn" })
      setScanStep("checking-bhyt"); setTimeout(() => {
        const bhytData = { code: "DN4797915071630", coverage: 0.8, facility: "BV Hoàn Mỹ Sài Gòn (79071)", expiry: "31/12/2025" }
        setScannedIdentity((prev: any) => prev ? ({ ...prev, bhyt: { status: "Active", ...bhytData } }) : null); setFormData(prev => ({ ...prev, hiCode: bhytData.code }))
        setScanStep("checking-history"); setTimeout(() => {
          const historyData = [{ maHoSo: "HS001", maCSKCB: "79071", ngayVao: "202401150800", ngayRa: "202401151600", tenBenh: "Viêm phế quản cấp", tinhTrang: "Ổn định", kqDieuTri: "Đỡ" }, { maHoSo: "HS002", maCSKCB: "79010", ngayVao: "202305200930", ngayRa: "202305251400", tenBenh: "Sốt xuất huyết Dengue", tinhTrang: "Ra viện", kqDieuTri: "Khỏi" }]
          setScannedIdentity((prev: any) => prev ? ({ ...prev, history: historyData }) : null); setScanStep("complete"); toast({ title: "Verification Complete", description: "Identity, Insurance, & History retrieved." })
        }, 2000)
      }, 2000)
    }, 1500)
  }

  const districtOptions = address.city ? vnLocations[address.city]?.districts || {} : {}
  const wardOptions = address.district && districtOptions[address.district] ? districtOptions[address.district].wards : []

  return (
    <TooltipProvider>
      <div className="flex-1 overflow-y-auto bg-slate-50/50 p-6">
        <div className="max-w-[1600px] mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div><h1 className="text-2xl font-bold tracking-tight text-slate-900">Patient Reception</h1><p className="text-muted-foreground">National Database Connected</p></div>
            <Button size="lg" className={cn("relative overflow-hidden transition-all shadow-md min-w-[200px]", scanStep !== "idle" && scanStep !== "complete" ? "bg-slate-800" : "bg-blue-600 hover:bg-blue-700")} onClick={handleScanProcess} disabled={scanStep !== "idle" && scanStep !== "complete"}>
               {scanStep !== "idle" && scanStep !== "complete" ? <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> Processing...</> : <><QrCode className="h-5 w-5 mr-2" /> Start CCCD Scan</>}
            </Button>
          </div>

          <IdentityVerificationCard data={scannedIdentity || { name: "", gender: "", dob: "", citizenId: "" }} scanStep={scanStep} onClear={() => { setScannedIdentity(null); setScanStep("idle"); setFormData(prev => ({ ...prev, fullName: "", dob: "", citizenId: "", hiCode: "" })); setAddress({ city: "", district: "", ward: "", street: "" }) }} />

          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-8 space-y-6">
              <Card className="border-t-4 border-t-blue-600 shadow-sm">
                <CardHeader className="pb-3"><CardTitle className="text-base uppercase tracking-wide text-blue-600 flex items-center gap-2"><User className="h-4 w-4" /> Patient Information</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2 space-y-1.5"><Label className="text-xs font-semibold text-slate-500">Full Name</Label><Input placeholder="NGUYỄN VĂN A" className="font-medium uppercase" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} /></div>
                  <div className="space-y-1.5"><Label className="text-xs font-semibold text-slate-500">DOB</Label><Input type="date" value={formData.dob} onChange={(e) => setFormData({ ...formData, dob: e.target.value })} /></div>
                  <div className="space-y-1.5"><Label className="text-xs font-semibold text-slate-500">Gender</Label><div className="flex items-center gap-4 h-10 px-3 border rounded-md bg-white"><label className="flex items-center gap-2 text-sm cursor-pointer hover:text-blue-600"><input type="radio" name="gender" className="accent-blue-600 w-4 h-4" checked={formData.gender === "male"} onChange={() => setFormData({ ...formData, gender: "male" })} /> Male</label><label className="flex items-center gap-2 text-sm cursor-pointer hover:text-pink-600"><input type="radio" name="gender" className="accent-pink-600 w-4 h-4" checked={formData.gender === "female"} onChange={() => setFormData({ ...formData, gender: "female" })} /> Female</label></div></div>
                  <div className="space-y-1.5"><Label className="text-xs font-semibold text-slate-500">Citizen ID</Label><div className="relative"><Input className="pl-8" value={formData.citizenId} onChange={(e) => setFormData({ ...formData, citizenId: e.target.value })} /><ScanLine className="h-4 w-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" /></div></div>
                  <div className="space-y-1.5"><Label className="text-xs font-semibold text-slate-500">BHYT Code</Label><div className="relative"><Input className="pl-8 font-mono text-blue-700 font-medium" value={formData.hiCode} onChange={(e) => setFormData({ ...formData, hiCode: e.target.value })} /><ShieldCheck className="h-4 w-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-blue-400" /></div></div>
                </CardContent>
              </Card>

              <Card className="border-t-4 border-t-purple-600 shadow-sm">
                <CardHeader className="pb-3"><CardTitle className="text-base uppercase tracking-wide text-purple-600 flex items-center gap-2"><MapPin className="h-4 w-4" /> Contact & Residence</CardTitle></CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="space-y-1.5"><Label className="text-xs font-semibold text-slate-500">Phone Number <span className="text-red-500">*</span></Label><PhoneInput value={formData.phone} onChange={(val: string) => setFormData({...formData, phone: val})} /></div><div className="space-y-1.5"><Label className="text-xs font-semibold text-slate-500">Email Address</Label><div className="relative"><Input className="pl-8" placeholder="email@example.com" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} /><Mail className="h-4 w-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" /></div></div></div>
                  <div className="space-y-2"><Label className="text-xs font-semibold text-slate-500">Preferred Communication</Label><RadioGroup defaultValue="phone" value={formData.contactMethod} onValueChange={(val) => setFormData({...formData, contactMethod: val})} className="flex items-center gap-6"><div className="flex items-center space-x-2"><RadioGroupItem value="phone" id="r-phone" /><Label htmlFor="r-phone" className="flex items-center gap-2 cursor-pointer font-normal"><PhoneIcon className="h-3 w-3" /> Phone / SMS</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="email" id="r-email" /><Label htmlFor="r-email" className="flex items-center gap-2 cursor-pointer font-normal"><Mail className="h-3 w-3" /> Email</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="zalo" id="r-zalo" /><Label htmlFor="r-zalo" className="flex items-center gap-2 cursor-pointer font-normal">Zalo</Label></div></RadioGroup></div>
                  <div className="h-px bg-slate-100 my-2" />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-1.5"><Label className="text-xs font-semibold text-slate-500">City / Province</Label><Select value={address.city} onValueChange={(v) => setAddress({ ...address, city: v, district: "", ward: "" })}><SelectTrigger><SelectValue placeholder="Select City" /></SelectTrigger><SelectContent><SelectItem value="hcm">TP. Hồ Chí Minh</SelectItem><SelectItem value="hanoi">TP. Hà Nội</SelectItem></SelectContent></Select></div><div className="space-y-1.5"><Label className="text-xs font-semibold text-slate-500">District</Label><Select value={address.district} onValueChange={(v) => setAddress({ ...address, district: v, ward: "" })} disabled={!address.city}><SelectTrigger><SelectValue placeholder="Select District" /></SelectTrigger><SelectContent>{Object.entries(districtOptions).map(([key, val]: any) => (<SelectItem key={key} value={key}>{val.label}</SelectItem>))}</SelectContent></Select></div><div className="space-y-1.5"><Label className="text-xs font-semibold text-slate-500">Ward</Label><Select value={address.ward} onValueChange={(v) => setAddress({ ...address, ward: v })} disabled={!address.district}><SelectTrigger><SelectValue placeholder="Select Ward" /></SelectTrigger><SelectContent>{wardOptions.map((ward: string) => (<SelectItem key={ward} value={ward}>{ward}</SelectItem>))}</SelectContent></Select></div><div className="md:col-span-3 space-y-1.5"><Label className="text-xs font-semibold text-slate-500">Street Name & House Number</Label><div className="relative"><Input className="pl-8" placeholder="e.g. 15 Le Duan" value={address.street} onChange={(e) => setAddress({ ...address, street: e.target.value })} /><Home className="h-4 w-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" /></div></div></div>
                </CardContent>
              </Card>

              {/* NEW LAB SHOPPING CART EXPERIENCE */}
              <Card className="border-t-4 border-t-emerald-600 shadow-md overflow-hidden">
                 <CardHeader className="bg-emerald-50/30 pb-4 border-b">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-emerald-700 text-base uppercase flex items-center gap-2 tracking-wide">
                            <Beaker className="h-5 w-5" /> Lab Test Orders
                        </CardTitle>
                        {selectedTests.length > 0 && (
                             <Badge variant="outline" className="bg-white border-emerald-200 text-emerald-700 font-normal">
                                <ShoppingCart className="h-3 w-3 mr-1" /> {selectedTests.length} tests selected
                             </Badge>
                        )}
                    </div>
                 </CardHeader>
                 
                 <CardContent className="p-0">
                   {/* 1. Search & Quick Add */}
                   <div className="p-5 space-y-4 bg-white">
                      <div className="relative">
                         <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                         <Input 
                           placeholder="Search tests (e.g. HbA1c, CBC, Thyroid...)" 
                           className="pl-10 h-11 text-base shadow-sm border-slate-300 focus-visible:ring-emerald-500 transition-all"
                           value={testSearchQuery}
                           onChange={(e) => { setTestSearchQuery(e.target.value); setShowTestSearch(true) }}
                           onFocus={() => setShowTestSearch(true)}
                         />
                         
                         {/* Rich Dropdown Results */}
                         {showTestSearch && filteredTests.length > 0 && (
                            <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-xl max-h-80 overflow-y-auto divide-y animate-in fade-in zoom-in-95 duration-200">
                              {filteredTests.map((test) => (
                                <button key={test.id} onClick={() => addTest(test)} className="w-full px-4 py-3 text-left hover:bg-emerald-50 flex items-start justify-between group transition-colors">
                                  <div>
                                    <div className="font-semibold text-slate-800 flex items-center gap-2">
                                        {test.name}
                                        {test.popular && <Badge variant="secondary" className="text-[10px] h-4 px-1 bg-amber-100 text-amber-700 hover:bg-amber-100">Popular</Badge>}
                                    </div>
                                    <div className="text-xs text-slate-500 mt-0.5 line-clamp-1">{test.description}</div>
                                  </div>
                                  <div className="flex flex-col items-end gap-1">
                                    <span className="font-bold text-emerald-600 text-sm">{formatCurrency(test.price)}</span>
                                    <span className="text-[10px] text-slate-400 flex items-center gap-1"><Clock className="h-3 w-3" /> {test.turnaroundHours}h</span>
                                  </div>
                                </button>
                              ))}
                            </div>
                         )}
                      </div>

                      {/* Quick Tags Pills */}
                      <div className="flex flex-wrap gap-2">
                        {labTestsData.filter(t => t.popular).slice(0, 5).map(test => (
                            <button
                                key={test.id}
                                onClick={() => addTest(test)}
                                disabled={!!selectedTests.find(t => t.id === test.id)}
                                className={cn(
                                    "px-3 py-1.5 rounded-full text-xs font-medium border transition-all flex items-center gap-1",
                                    selectedTests.find(t => t.id === test.id) 
                                        ? "bg-emerald-100 text-emerald-700 border-emerald-200 opacity-50 cursor-not-allowed"
                                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200"
                                )}
                            >
                                <Plus className="h-3 w-3" /> {test.shortName || test.name}
                            </button>
                        ))}
                      </div>
                   </div>

                   {/* 2. Amazon-Style Cart List */}
                   <div className="border-t bg-slate-50/50 min-h-[150px]">
                      {selectedTests.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                            <ShoppingCart className="h-10 w-10 mb-2 opacity-20" />
                            <p className="text-sm">No tests ordered yet</p>
                        </div>
                      ) : (
                        <div className="divide-y">
                            {selectedTests.map((test) => (
                                <div key={test.id} className="p-4 bg-white hover:bg-slate-50 transition-colors group relative">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-bold text-slate-800 text-sm">{test.name}</h4>
                                                {test.requiresFasting && (
                                                    <Badge variant="outline" className="text-[10px] h-5 px-1.5 bg-amber-50 text-amber-700 border-amber-200 gap-1">
                                                        <AlertCircle className="h-3 w-3" /> Fasting
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-500 leading-relaxed pr-8">{test.description}</p>
                                            <div className="flex items-center gap-3 text-xs text-slate-400 mt-2">
                                                <span className="flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded"><Beaker className="h-3 w-3" /> {test.sampleType}</span>
                                                <span className="flex items-center gap-1 bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded"><Clock className="h-3 w-3" /> Result: {formatDateFriendly(getResultDate(test.turnaroundHours))}</span>
                                            </div>
                                        </div>
                                        <div className="text-right flex flex-col items-end justify-between self-stretch">
                                            <div className="font-bold text-slate-700">{formatCurrency(test.price)}</div>
                                            <Button variant="ghost" size="sm" onClick={() => removeTest(test.id)} className="h-7 w-7 p-0 text-slate-300 hover:text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                      )}
                   </div>

                   {/* 3. Nurse Script & Timeline Footer */}
                   {selectedTests.length > 0 && timeline && (
                       <div className="bg-slate-900 text-white p-5 border-t border-slate-800">
                          <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                              <div className="space-y-2 flex-1">
                                  <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 flex items-center gap-2">
                                      <CalendarClock className="h-3 w-3" /> Patient Expectation Script
                                  </div>
                                  <div className="bg-slate-800/50 p-3 rounded-lg border-l-2 border-emerald-500">
                                      <p className="text-xs text-slate-300 italic leading-relaxed">
                                          "Based on these tests, your <span className="text-emerald-400 font-semibold">first results</span> (like {selectedTests.find(t => t.turnaroundHours <= 4)?.shortName || 'CBC'}) will be ready by <span className="text-white font-medium">{timeline.firstResult}</span>. 
                                          {!timeline.isSameDay && <span> The <span className="text-blue-400 font-semibold">complete report</span> will be finalized by <span className="text-white font-medium">{timeline.finalResult}</span>.</span>} "
                                      </p>
                                  </div>
                              </div>
                          </div>
                       </div>
                   )}
                 </CardContent>
              </Card>

              <Card className="border-t-4 border-t-emerald-600 shadow-sm">
                <CardHeader className="pb-3"><CardTitle className="text-base uppercase tracking-wide text-emerald-600 flex items-center gap-2"><Clock className="h-4 w-4" /> Clinical Intake</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-4">
                      <div className="space-y-1.5"><Label className="text-xs font-semibold">Chief Complaint</Label><Textarea className="min-h-[80px]" placeholder="Symptoms..." value={formData.symptom} onChange={(e) => setFormData({ ...formData, symptom: e.target.value })} /></div>
                      <div className="space-y-1.5"><Label className="text-xs font-semibold">Medical History</Label><Textarea className="min-h-[80px]" placeholder="Past conditions..." value={formData.medicalHistory} onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })} /></div>
                   </div>
                   <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 space-y-3">
                      <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2"><div className="h-2 w-2 rounded-full bg-red-500"></div> Quick Vitals</div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1"><Label className="text-[10px] text-slate-500 uppercase">Height (cm)</Label><Input className="h-8 bg-white" value={formData.height} onChange={e => setFormData({...formData, height: e.target.value})} /></div>
                        <div className="space-y-1"><Label className="text-[10px] text-slate-500 uppercase">Weight (kg)</Label><Input className="h-8 bg-white" value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} /></div>
                        <div className="space-y-1"><Label className="text-[10px] text-slate-500 uppercase">Temp (°C)</Label><Input className="h-8 bg-white" value={formData.temp} onChange={e => setFormData({...formData, temp: e.target.value})} /></div>
                        <div className="space-y-1"><Label className="text-[10px] text-slate-500 uppercase">BP (mmHg)</Label><Input className="h-8 bg-white" value={formData.bp} onChange={e => setFormData({...formData, bp: e.target.value})} /></div>
                      </div>
                   </div>
                </CardContent>
              </Card>
            </div>

            {/* SIDE PANEL BILLING SUMMARY */}
            <div className="col-span-12 lg:col-span-4 space-y-6">
              <Card className="border-t-4 border-t-amber-500 shadow-sm">
                <CardHeader className="pb-3"><CardTitle className="text-base uppercase tracking-wide text-amber-600 flex items-center gap-2"><UserPlus className="h-4 w-4" /> Emergency Contact</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1.5"><Label className="text-xs">Relative Name</Label><Input value={formData.relativeName} onChange={e => setFormData({...formData, relativeName: e.target.value})} placeholder="Name" /></div>
                  <div className="space-y-1.5"><Label className="text-xs">Relationship</Label><Select value={formData.relativeRelation} onValueChange={v => setFormData({...formData, relativeRelation: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="parent">Parent</SelectItem><SelectItem value="spouse">Spouse</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent></Select></div>
                  <div className="space-y-1.5"><Label className="text-xs">Phone</Label><PhoneInput value={formData.relativePhone} onChange={(val: string) => setFormData({...formData, relativePhone: val})} /></div>
                </CardContent>
              </Card>
              
              {/* BILLING CART CARD */}
              <Card className="shadow-lg border-0 ring-1 ring-slate-200 bg-white">
                <CardHeader className="pb-3 border-b bg-slate-50/50">
                  <CardTitle className="text-sm font-bold uppercase text-slate-600 flex items-center gap-2">
                      <Receipt className="h-4 w-4" /> Billing Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                   <div className="space-y-2">
                       <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-500">Consultation Fee</span>
                          <span className="font-medium text-slate-900">0 VND</span>
                       </div>
                       
                       {/* Dynamic Lab Breakdown */}
                       <div className="flex justify-between items-start text-sm">
                          <span className="text-slate-500">Lab Tests ({selectedTests.length})</span>
                          <span className="font-medium text-slate-900">{formatCurrency(totalTestsPrice)}</span>
                       </div>
                       
                       {selectedTests.length > 0 && (
                          <div className="pl-2 border-l-2 border-slate-100 space-y-1 mt-1">
                             {selectedTests.map(t => (
                                 <div key={t.id} className="flex justify-between text-xs text-slate-400">
                                     <span className="truncate max-w-[150px]">{t.shortName || t.name}</span>
                                     <span>{formatCurrency(t.price)}</span>
                                 </div>
                             ))}
                          </div>
                       )}
                   </div>
                   
                   <div className="h-px bg-slate-100 my-2" />
                   
                   <div className="flex justify-between items-center">
                       <span className="text-base font-bold text-slate-900">Total</span>
                       <span className="text-xl font-bold text-blue-600">{formatCurrency(totalTestsPrice)}</span>
                   </div>

                   {scannedIdentity?.bhyt?.status === "Active" && (
                     <div className="bg-emerald-50 text-emerald-700 p-2 rounded text-xs flex items-center gap-2 border border-emerald-100">
                        <Check className="h-3 w-3" /> Insurance Coverage Applied (80%)
                     </div>
                   )}

                   <Button className="w-full mt-2 bg-slate-900 hover:bg-slate-800 text-white font-bold h-11 shadow-md">
                     <Save className="mr-2 h-4 w-4" /> Complete Registration
                   </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}