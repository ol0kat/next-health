"use client"

import type React from "react"
import { useState, useMemo, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  User, QrCode, Search, Loader2, X, CheckCircle2,
  Clock, History, Lock, Unlock, ShieldCheck, 
  ShoppingCart, Copy, FileText, Activity, Save, Beaker, 
  FileSignature, TabletSmartphone, Wifi, Sparkles, Stethoscope, 
  PlusCircle, Video, ArrowDown, Edit2, Thermometer, Wind, HeartPulse, Scale
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// --- TYPES & MOCK DATA ---
interface VitalRecord {
  id: string
  timestamp: Date
  recordedBy: string
  height: string
  weight: string
  bmi: string
  temp: string
  bpSys: string
  bpDia: string
  pulse: string
  spo2: string
  resp: string
}

// ... (LabTest interface and labTestsData remain the same as previous) ...
interface LabTest { id: string, name: string, price: number, category: string, sampleType: string, turnaroundHours: number, requiresConsent?: boolean, popular?: boolean, description?: string, linkedCondition?: string, frequencyDays?: number }

const labTestsData: LabTest[] = [
  { id: "hiv", name: "HIV Ab/Ag Combo", price: 200000, category: "Serology", sampleType: "Serum", turnaroundHours: 4, requiresConsent: true, description: "Screening for HIV 1/2 antibodies & p24 antigen" }, 
  { id: "cbc", name: "Complete Blood Count", price: 120000, category: "Hematology", sampleType: "Whole Blood", turnaroundHours: 4, popular: true, description: "Overall health, anemia, infection" },
  { id: "hba1c", name: "Hemoglobin A1c", price: 180000, category: "Biochemistry", sampleType: "Whole Blood", turnaroundHours: 24, popular: true, description: "3-month average blood sugar", linkedCondition: "E11", frequencyDays: 90 },
  { id: "lipid", name: "Lipid Panel", price: 250000, category: "Biochemistry", sampleType: "Serum", turnaroundHours: 24, popular: true, description: "Cholesterol, Triglycerides" },
  { id: "syphilis", name: "Syphilis RPR", price: 150000, category: "Serology", sampleType: "Serum", turnaroundHours: 24, requiresConsent: true, description: "Screening for Syphilis" },
]

const medicalIntents = [
    { id: "general_checkup", label: "General Health Checkup", recommended: ["cbc", "lipid", "hba1c"] },
    { id: "chronic_diabetes", label: "Diabetes Monitoring", recommended: ["hba1c", "lipid"] },
    { id: "std_screening", label: "STD / Sexual Health", recommended: ["hiv", "syphilis"] },
]

const formatCurrency = (amount: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)

// --- COMPONENT: IDENTITY CARD (Unchanged) ---
function IdentityVerificationCard({ data, scanStep, onClear, onInternalHistoryClick, internalAccess }: any) {
    if (scanStep === "idle" && !data.bhyt) return null
    const isComplete = scanStep === "complete"
    return (
      <div className="mb-6 animate-in fade-in slide-in-from-top-4 font-sans">
        <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
           <div className={cn("px-4 py-3 flex justify-between text-white text-sm font-bold uppercase tracking-wide", isComplete ? "bg-[#009860]" : "bg-blue-600")}>
               <div className="flex items-center gap-2">{isComplete ? <CheckCircle2 className="h-5 w-5" /> : <Loader2 className="h-4 w-4 animate-spin"/>}<span>{isComplete ? "Identity & Insurance Verified" : "Processing..."}</span></div>
               {isComplete && <button onClick={onClear}><X className="h-5 w-5 text-white/80 hover:text-white" /></button>}
           </div>
           <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
              <div className="p-5 space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider"><User className="h-4 w-4" /> Citizen Identity</div>
                <div><div className="font-bold text-xl text-slate-900 uppercase">{data.name || "..."}</div><div className="text-sm text-slate-500 mt-1 flex items-center gap-2"><Clock className="h-3.5 w-3.5"/> {data.dob} ({data.age} yrs)</div></div>
                <div><div className="text-xs text-slate-400 font-bold">Citizen ID</div><div className="font-mono text-lg text-slate-700 font-medium tracking-wide mt-1">{data.citizenId}</div></div>
              </div>
              <div className="p-5 space-y-3 bg-slate-50/30">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-500 uppercase tracking-wider"><ShieldCheck className="h-4 w-4" /> BHYT & Programs</div>
                {data.bhyt ? (
                    <>
                        <div><div className="text-xs text-slate-400 font-bold mb-1">Card Number</div><div className="font-bold text-xl text-blue-600 font-mono tracking-tight">{data.bhyt.code}</div></div>
                        <div className="flex justify-between items-center bg-blue-50 border border-blue-100 p-2 rounded"><div><div className="text-[10px] text-blue-600 font-bold uppercase">Chronic Condition</div><div className="text-sm font-bold text-slate-800">{data.chronicCondition || "None"}</div></div></div>
                    </>
                ) : (<div className="h-32 flex items-center justify-center text-slate-400 italic text-sm">Verifying...</div>)}
              </div>
              <div className="p-5 flex flex-col h-full justify-between bg-slate-50/50">
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

// --- REWORKED COMPONENT: VITAL SIGNS MONITOR ---
function VitalSignsMonitor({ patientAge, historicalHeight, nurseName }: { patientAge: number | null, historicalHeight: string, nurseName: string }) {
    const { toast } = useToast()
    
    // State for current input
    const [vitals, setVitals] = useState({
        height: "", weight: "", temp: "", bpSys: "", bpDia: "", pulse: "", spo2: "", resp: ""
    })
    const [isHeightLocked, setIsHeightLocked] = useState(false)
    
    // State for History Log
    const [vitalHistory, setVitalHistory] = useState<VitalRecord[]>([])

    // Effect: Smart Height Logic
    useEffect(() => {
        if (patientAge && patientAge >= 18 && historicalHeight) {
            setVitals(prev => ({ ...prev, height: historicalHeight }))
            setIsHeightLocked(true)
        } else {
            setIsHeightLocked(false)
        }
    }, [patientAge, historicalHeight])

    // Derived: BMI Calculation
    const bmi = useMemo(() => {
        const h = parseFloat(vitals.height) / 100 // convert cm to m
        const w = parseFloat(vitals.weight)
        if (h > 0 && w > 0) return (w / (h * h)).toFixed(1)
        return ""
    }, [vitals.height, vitals.weight])

    const handleInputChange = (field: string, value: string) => {
        setVitals(prev => ({ ...prev, [field]: value }))
    }

    const saveVitals = () => {
        const hasData = Object.values(vitals).some(val => val !== "")
        if (!hasData) return

        const newRecord: VitalRecord = {
            id: Math.random().toString(36).substr(2, 9),
            timestamp: new Date(),
            recordedBy: nurseName,
            bmi: bmi,
            ...vitals
        }

        setVitalHistory(prev => [newRecord, ...prev])
        toast({ title: "Vitals Recorded", description: `Captured by ${nurseName}` })
        
        setVitals(prev => ({ 
            ...prev, 
            weight: "", temp: "", bpSys: "", bpDia: "", pulse: "", spo2: "", resp: "",
            height: isHeightLocked ? prev.height : "" 
        }))
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault() 
            saveVitals()
        }
    }

    // Helper for input with unit suffix
    const UnitInput = ({ label, unit, value, onChange, placeholder, className, disabled = false }: any) => (
        <div className="relative">
            <Label className="text-[10px] uppercase font-semibold text-slate-500 mb-1 block">{label}</Label>
            <div className="relative">
                <Input 
                    value={value} 
                    onChange={e => onChange(e.target.value)} 
                    placeholder={placeholder}
                    disabled={disabled}
                    className={cn("pr-8 h-9 font-medium focus-visible:ring-1", className)} 
                />
                <span className="absolute right-3 top-2.5 text-[10px] text-slate-400 font-bold select-none">{unit}</span>
            </div>
        </div>
    )

    return (
        <Card className="border-t-4 border-t-red-500 shadow-sm bg-white overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
                <div className="flex items-center gap-2 text-red-600 font-bold text-sm uppercase tracking-wide">
                    <Activity className="h-4 w-4"/> Vital Signs
                </div>
                <div className="text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded">
                    Press <span className="font-bold text-slate-700">Enter</span> to save
                </div>
            </div>

            <CardContent className="p-0">
                {/* INPUT AREA: CLEAN GRID WITH DIVIDERS */}
                <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-100" onKeyDown={handleKeyDown}>
                    
                    {/* SECTION 1: ANTHRO */}
                    <div className="p-5 space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                             <Scale className="h-4 w-4 text-slate-400"/>
                             <span className="text-xs font-bold text-slate-700 uppercase">Body</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <UnitInput 
                                label="Height" unit="cm" placeholder="--"
                                value={vitals.height} 
                                onChange={(v: string) => handleInputChange('height', v)}
                                disabled={isHeightLocked}
                                className={isHeightLocked ? "bg-slate-50 text-slate-600" : ""}
                            />
                            <UnitInput 
                                label="Weight" unit="kg" placeholder="--"
                                value={vitals.weight} 
                                onChange={(v: string) => handleInputChange('weight', v)}
                                className="font-bold text-slate-900"
                            />
                        </div>
                        <div className="flex justify-between items-center bg-slate-50 rounded px-3 py-1.5 border border-slate-100">
                            <span className="text-[10px] font-bold text-slate-500 uppercase">BMI Score</span>
                            <span className={cn("text-xs font-bold", !bmi ? "text-slate-300" : Number(bmi) > 25 ? "text-red-600" : "text-emerald-600")}>
                                {bmi || "--"}
                            </span>
                        </div>
                    </div>

                    {/* SECTION 2: CIRCULATION */}
                    <div className="p-5 space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                             <HeartPulse className="h-4 w-4 text-slate-400"/>
                             <span className="text-xs font-bold text-slate-700 uppercase">Circulation</span>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <Label className="text-[10px] uppercase font-semibold text-slate-500 mb-1 block">Blood Pressure</Label>
                                <div className="flex items-center gap-1">
                                    <Input 
                                        value={vitals.bpSys} 
                                        onChange={e => handleInputChange('bpSys', e.target.value)} 
                                        className="h-9 w-16 text-center font-medium placeholder:text-slate-200" 
                                        placeholder="120"
                                    />
                                    <span className="text-slate-300">/</span>
                                    <Input 
                                        value={vitals.bpDia} 
                                        onChange={e => handleInputChange('bpDia', e.target.value)} 
                                        className="h-9 w-16 text-center font-medium placeholder:text-slate-200" 
                                        placeholder="80"
                                    />
                                    <span className="text-[10px] text-slate-400 ml-1 font-bold">mmHg</span>
                                </div>
                            </div>
                            <UnitInput 
                                label="Pulse Rate" unit="bpm" placeholder="--"
                                value={vitals.pulse} 
                                onChange={(v: string) => handleInputChange('pulse', v)}
                            />
                        </div>
                    </div>

                    {/* SECTION 3: RESPIRATORY */}
                    <div className="p-5 space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                             <Wind className="h-4 w-4 text-slate-400"/>
                             <span className="text-xs font-bold text-slate-700 uppercase">Respiratory</span>
                        </div>
                        <div className="space-y-3">
                            <UnitInput 
                                label="SpO2" unit="%" placeholder="98"
                                value={vitals.spo2} 
                                onChange={(v: string) => handleInputChange('spo2', v)}
                                className="text-blue-600 font-bold"
                            />
                            <UnitInput 
                                label="Breathing Rate" unit="rpm" placeholder="16"
                                value={vitals.resp} 
                                onChange={(v: string) => handleInputChange('resp', v)}
                            />
                        </div>
                    </div>

                    {/* SECTION 4: TEMP & ACTION */}
                    <div className="p-5 flex flex-col justify-between bg-slate-50/30">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Thermometer className="h-4 w-4 text-slate-400"/>
                                <span className="text-xs font-bold text-slate-700 uppercase">Temp</span>
                            </div>
                            <UnitInput 
                                label="Celcius" unit="°C" placeholder="36.5"
                                value={vitals.temp} 
                                onChange={(v: string) => handleInputChange('temp', v)}
                            />
                        </div>
                        <Button onClick={saveVitals} className="w-full bg-red-600 hover:bg-red-700 text-white shadow-sm mt-4">
                            Record Entry
                        </Button>
                    </div>
                </div>

                {/* LOG HISTORY */}
                {vitalHistory.length > 0 && (
                    <div className="border-t border-slate-100">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent border-none">
                                    <TableHead className="h-9 text-[10px] uppercase font-bold text-slate-400 pl-6 w-[120px]">Time / Nurse</TableHead>
                                    <TableHead className="h-9 text-[10px] uppercase font-bold text-slate-400 text-right">BP (mmHg)</TableHead>
                                    <TableHead className="h-9 text-[10px] uppercase font-bold text-slate-400 text-right">HR (bpm)</TableHead>
                                    <TableHead className="h-9 text-[10px] uppercase font-bold text-slate-400 text-right">SpO2 (%)</TableHead>
                                    <TableHead className="h-9 text-[10px] uppercase font-bold text-slate-400 text-right">Temp (°C)</TableHead>
                                    <TableHead className="h-9 text-[10px] uppercase font-bold text-slate-400 text-right pr-6">BMI</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {vitalHistory.map(record => (
                                    <TableRow key={record.id} className="h-10 hover:bg-slate-50 border-t border-slate-50">
                                        <TableCell className="pl-6 py-2">
                                            <div className="font-bold text-slate-700 text-xs">{record.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                                            <div className="text-[9px] text-slate-400 font-medium">{record.recordedBy}</div>
                                        </TableCell>
                                        <TableCell className="text-right py-2 text-xs font-mono text-slate-600">{record.bpSys}/{record.bpDia}</TableCell>
                                        <TableCell className="text-right py-2 text-xs font-mono text-slate-600">{record.pulse}</TableCell>
                                        <TableCell className="text-right py-2 text-xs font-bold text-blue-600">{record.spo2}</TableCell>
                                        <TableCell className="text-right py-2 text-xs font-mono text-slate-600">{record.temp}</TableCell>
                                        <TableCell className="text-right py-2 text-xs font-mono pr-6">{record.bmi}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

// --- MAIN PAGE ---
export function ReceptionistView() {
  const { toast } = useToast()
  
  // States
  const [scanStep, setScanStep] = useState<any>("idle")
  const [scannedIdentity, setScannedIdentity] = useState<any>(null)
  const [formData, setFormData] = useState<any>({ fullName: "", dob: "", citizenId: "", gender: "male", medicalIntent: "" })
  
  // Cart & Logic
  const [selectedTests, setSelectedTests] = useState<LabTest[]>([])
  const [testSearchQuery, setTestSearchQuery] = useState("")
  const [consentStatus, setConsentStatus] = useState<Record<string, 'pending' | 'requesting' | 'signed'>>({})
  const [internalAccess, setInternalAccess] = useState<'locked' | 'unlocked'>('locked')
  
  // Modals
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const [showInternalHistoryModal, setShowInternalHistoryModal] = useState(false)
  const [otpStep, setOtpStep] = useState<'method' | 'verify'>('method')
  const [otpInput, setOtpInput] = useState("")

  // --- ENGINE: INSURANCE ---
  const checkInsuranceEligibility = (test: LabTest, patient: any) => {
      if(!patient || !patient.bhyt) return { isCovered: false, reason: "No Insurance" }
      if (test.linkedCondition && patient.chronicConditionCode === test.linkedCondition) {
          if (test.id === 'hba1c') {
             if (patient.activeReferral) return { isCovered: true, coveragePercent: 1.0, reason: "Diabetes Plan (90 days elapsed)" }
             else return { isCovered: false, reason: "Missing Referral" }
          }
      }
      return { isCovered: true, coveragePercent: 0.8, reason: "Standard BHYT" }
  }

  const cartTotals = useMemo(() => {
      let subtotal = 0, insuranceCoverage = 0, patientDue = 0
      selectedTests.forEach(test => {
          subtotal += test.price
          const eligibility = checkInsuranceEligibility(test, scannedIdentity)
          if (eligibility.isCovered) {
              const coveredAmount = test.price * (eligibility.coveragePercent || 0)
              insuranceCoverage += coveredAmount
              patientDue += (test.price - coveredAmount)
          } else { patientDue += test.price }
      })
      return { subtotal, insuranceCoverage, patientDue }
  }, [selectedTests, scannedIdentity])

  // --- PROCESS SCAN ---
  const processIdentityVerification = (sourceData: any) => {
      setScanStep("cccd")
      setTimeout(() => {
          const verifiedData = { 
              name: sourceData.name || formData.fullName || "TRẦN THỊ NGỌC LAN", 
              dob: "15/05/1992", age: 33, 
              citizenId: sourceData.citizenId || formData.citizenId || "079192000123"
          }
          setScannedIdentity(verifiedData)
          setFormData((prev: any) => ({...prev, fullName: verifiedData.name, citizenId: verifiedData.citizenId}))
          setScanStep("checking-bhyt")
          setTimeout(() => {
              setScannedIdentity((prev:any) => ({
                  ...prev, 
                  bhyt: { code: "DN4797915071630", coverageLabel: "80% (Lvl 4)", expiry: "31/12/2025" },
                  chronicCondition: "Type 2 Diabetes", chronicConditionCode: "E11", activeReferral: "TD-2401-99",
                  historicalHeight: "165" // Mocking historical height from backend
              }))
              setFormData((prev:any) => ({...prev, medicalIntent: 'chronic_diabetes'}))
              setScanStep("complete")
              toast({ title: "Profile Loaded", description: "Insurance and History retrieved." })
          }, 1200)
      }, 1000)
  }

  const addTest = (test: LabTest) => { if (!selectedTests.find(t => t.id === test.id)) { setSelectedTests(prev => [...prev, test]); if (test.requiresConsent) setConsentStatus(prev => ({ ...prev, [test.id]: 'pending' })) }}
  const removeTest = (id: string) => { setSelectedTests(prev => prev.filter(t => t.id !== id)); const n = {...consentStatus}; delete n[id]; setConsentStatus(n) }
  const requestConsent = (testId: string) => { setConsentStatus(prev => ({ ...prev, [testId]: 'requesting' })); setTimeout(() => { setConsentStatus(prev => ({ ...prev, [testId]: 'signed' })) }, 2000) }
  const verifyOtp = () => { if(otpInput === "123456") { setInternalAccess('unlocked'); setShowAuthDialog(false); setShowInternalHistoryModal(true) } }

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
                
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div><h1 className="text-2xl font-bold text-slate-900">Patient Admission</h1><p className="text-slate-500">Reception & Triage • Nurse: <b>Lan Nguyen</b></p></div>
                    <Button onClick={() => processIdentityVerification({})} disabled={scanStep !== 'idle' && scanStep !== 'complete'} className={cn("min-w-[160px]", scanStep === 'idle' || scanStep === 'complete' ? "bg-blue-600 hover:bg-blue-700" : "bg-slate-800")}>
                        {scanStep !== 'idle' && scanStep !== 'complete' ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <QrCode className="mr-2 h-4 w-4"/>}
                        {scanStep === 'idle' || scanStep === 'complete' ? "Scan CCCD" : "Scanning..."}
                    </Button>
                </div>

                {/* Identity Card */}
                <IdentityVerificationCard 
                    data={scannedIdentity || {}} scanStep={scanStep} 
                    onClear={() => {setScannedIdentity(null); setScanStep('idle'); setInternalAccess('locked')}}
                    onInternalHistoryClick={() => { internalAccess === 'unlocked' ? setShowInternalHistoryModal(true) : (setShowAuthDialog(true), setOtpStep('method')) }}
                    internalAccess={internalAccess}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Clinical Intake */}
                    <Card className="border-t-4 border-t-emerald-500 shadow-sm md:col-span-2">
                        <CardHeader className="pb-2"><CardTitle className="text-sm uppercase text-emerald-600 flex items-center gap-2"><Stethoscope className="h-4 w-4"/> Clinical Context</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="bg-emerald-50/50 p-4 rounded-lg border border-emerald-100">
                                <Label className="text-sm font-bold text-emerald-800 mb-2 block flex items-center gap-2"><Activity className="h-4 w-4"/> Medical Intent</Label>
                                <Select value={formData.medicalIntent} onValueChange={(val) => setFormData({...formData, medicalIntent: val})}>
                                    <SelectTrigger className="bg-white border-emerald-200"><SelectValue placeholder="Select intent..." /></SelectTrigger>
                                    <SelectContent>{medicalIntents.map(i => <SelectItem key={i.id} value={i.id}>{i.label}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            
                            {/* --- NURSE SCRIPT --- */}
                            {formData.medicalIntent === 'chronic_diabetes' && scannedIdentity?.activeReferral && (
                                <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-r shadow-sm">
                                    <div className="flex items-start gap-3">
                                        <div className="bg-blue-100 p-2 rounded-full"><Sparkles className="h-5 w-5 text-blue-600" /></div>
                                        <div>
                                            <h4 className="font-bold text-blue-900 text-sm mb-1">Suggested Script</h4>
                                            <p className="text-sm text-blue-800 italic">"Mr./Ms. {formData.fullName.split(' ').pop()}, evidently you have already been classified as a diabetic, and you have no diabetes testing in the last 90 days. We can serve you a diabetes test today which you don't have to make a charge for under BHYT Insurance."</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* --- REPLACED: NEW VITAL SIGNS MONITOR --- */}
                    <div className="md:col-span-2">
                        <VitalSignsMonitor 
                            nurseName="Nurse Lan"
                            patientAge={scannedIdentity?.age}
                            historicalHeight={scannedIdentity?.historicalHeight}
                        />
                    </div>

                    {/* Lab Search Area */}
                    <Card className="border-t-4 border-t-indigo-500 shadow-sm md:col-span-2 mb-20">
                        <CardHeader className="pb-2"><CardTitle className="text-sm uppercase text-indigo-600 flex items-center gap-2"><Beaker className="h-4 w-4"/> Order Entry</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            {suggestedTests.length > 0 && (
                                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
                                    <h4 className="text-sm font-bold text-indigo-800 mb-3 flex items-center gap-2"><Sparkles className="h-4 w-4"/> Recommended Protocol</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                        {suggestedTests.map(test => {
                                            const eligible = checkInsuranceEligibility(test, scannedIdentity)
                                            return (
                                                <button key={test.id} onClick={() => addTest(test)} className="text-left p-2 rounded border bg-white border-indigo-200 hover:border-indigo-400 flex justify-between items-center group">
                                                    <div><div className="text-xs font-bold text-slate-700">{test.name}</div><div className="text-[10px] text-slate-500">{eligible.coveragePercent === 1.0 ? <span className="text-emerald-600 font-bold">100% Covered</span> : formatCurrency(test.price)}</div></div>
                                                    <PlusCircle className="h-4 w-4 text-indigo-400 group-hover:text-indigo-600"/>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}
                            <div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><Input className="pl-10 h-10" placeholder="Search tests..." value={testSearchQuery} onChange={e => setTestSearchQuery(e.target.value)}/></div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>

        {/* RIGHT CART */}
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
                                <div className="flex justify-between items-end mt-2">
                                    <div className="text-xs text-slate-500 max-w-[60%]">{isFullyCovered && <div className="text-emerald-600 font-bold">BHYT Full Coverage</div>}{eligibility.reason}</div>
                                    <div className="text-right">{isFullyCovered ? (<><div className="text-[10px] text-slate-400 line-through">{formatCurrency(test.price)}</div><div className="font-bold text-emerald-600 text-sm">0 ₫</div></>) : (<div className="font-bold text-slate-800 text-sm">{formatCurrency(test.price)}</div>)}</div>
                                </div>
                                {test.requiresConsent && (<div className="mt-3 pt-3 border-t border-amber-200/50">{consentStatus[test.id] !== 'signed' ? <Button size="sm" variant="outline" onClick={() => requestConsent(test.id)} className="w-full h-8 text-xs">Request Signature</Button> : <div className="text-xs text-emerald-600 font-bold flex items-center gap-1"><FileSignature className="h-3 w-3"/> Signed</div>}</div>)}
                            </div>
                        )
                    })
                )}
            </div>
            <div className="p-4 border-t bg-slate-50 space-y-4">
                <div className="space-y-2">
                    <div className="flex justify-between text-sm text-slate-500"><span>Subtotal</span><span>{formatCurrency(cartTotals.subtotal)}</span></div>
                    {scannedIdentity?.bhyt && (<div className="flex justify-between text-sm text-emerald-600"><span className="flex items-center gap-1"><ShieldCheck className="h-3 w-3"/> Insurance Pays</span><span>- {formatCurrency(cartTotals.insuranceCoverage)}</span></div>)}
                    <div className="flex justify-between text-lg font-bold text-slate-900 pt-2 border-t"><span>Patient Due</span><span>{formatCurrency(cartTotals.patientDue)}</span></div>
                </div>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-lg h-12 shadow-lg" disabled={selectedTests.some(t => t.requiresConsent && consentStatus[t.id] !== 'signed')}><Save className="h-4 w-4 mr-2"/> Submit Order</Button>
            </div>
        </div>
        
        <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}><DialogContent><DialogHeader><DialogTitle>Privacy Check</DialogTitle></DialogHeader><div className="space-y-4 py-4"><Input placeholder="Enter OTP" value={otpInput} onChange={e => setOtpInput(e.target.value)} /><Button onClick={verifyOtp}>Unlock</Button></div></DialogContent></Dialog>
        <Dialog open={showInternalHistoryModal} onOpenChange={setShowInternalHistoryModal}><DialogContent className="sm:max-w-[600px]"><DialogHeader><DialogTitle>Past Orders</DialogTitle></DialogHeader><div className="space-y-3 max-h-[50vh] overflow-y-auto"><div className="border p-4 rounded flex justify-between"><div>10/11/2023 - Dr. Vo</div><Button size="sm" onClick={()=>{setShowInternalHistoryModal(false)}} variant="outline">Re-Order</Button></div></div></DialogContent></Dialog>
      </div>
    </TooltipProvider>
  )
}