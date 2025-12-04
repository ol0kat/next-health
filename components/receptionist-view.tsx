"use client"

import type React from "react"
import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import {
  User, QrCode, Search, Loader2, X, CheckCircle2,
  Clock, History, Lock, Unlock, ShieldCheck, 
  ShoppingCart, FileText, Activity, Save, Beaker, 
  FileSignature, Sparkles, Stethoscope, 
  PlusCircle, Edit2, Thermometer, Wind, HeartPulse, Scale,
  Camera, Image as ImageIcon, Eye, AlertTriangle, 
  Users, Star, Trash2, Phone, Plus, ScanLine, CreditCard, Baby, Siren,
  Shield, UploadCloud, RefreshCw, Video, CalendarClock, Signal, Zap
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

// --- TYPES ---
interface LabTest { id: string, name: string, price: number, category: string, sampleType: string, turnaroundHours: number, requiresConsent?: boolean, popular?: boolean, description?: string, linkedCondition?: string, frequencyDays?: number }

// --- MOCK DATA ---
const labTestsData: LabTest[] = [
  { id: "hiv", name: "HIV Ab/Ag Combo", price: 200000, category: "Serology", sampleType: "Serum", turnaroundHours: 4, requiresConsent: true, description: "Screening for HIV 1/2 antibodies" }, 
  { id: "cbc", name: "Complete Blood Count", price: 120000, category: "Hematology", sampleType: "Whole Blood", turnaroundHours: 4, popular: true, description: "Overall health, anemia, infection" },
  { id: "hba1c", name: "Hemoglobin A1c", price: 180000, category: "Biochemistry", sampleType: "Whole Blood", turnaroundHours: 24, popular: true, description: "3-month average blood sugar", linkedCondition: "E11", frequencyDays: 90 },
  { id: "lipid", name: "Lipid Panel", price: 250000, category: "Biochemistry", sampleType: "Serum", turnaroundHours: 24, popular: true, description: "Cholesterol, Triglycerides" },
  { id: "syphilis", name: "Syphilis RPR", price: 150000, category: "Serology", sampleType: "Serum", turnaroundHours: 24, requiresConsent: true, description: "Screening for Syphilis" },
  { id: "dengue", name: "Dengue NS1", price: 250000, category: "Serology", sampleType: "Serum", turnaroundHours: 2, description: "Acute Dengue Fever" },
]

const medicalIntents = [
    { id: "general_checkup", label: "General Health Checkup", recommended: ["cbc", "lipid", "hba1c"], visualPrompts: [] },
    { id: "chronic_diabetes", label: "Diabetes Monitoring", recommended: ["hba1c", "lipid"], visualPrompts: [{ id: "foot_exam", label: "Foot/Ulcer Exam", icon: "foot" }, { id: "injection_site", label: "Injection Sites", icon: "skin" }] },
    { id: "fever_infection", label: "Fever & Infection", recommended: ["cbc", "dengue"], visualPrompts: [{ id: "skin_rash", label: "Skin Rash / Petechiae", icon: "skin" }, { id: "eye_exam", label: "Bloodshot Eyes / Sclera", icon: "eye" }, { id: "throat", label: "Throat / Tonsils", icon: "mouth" }] },
    { id: "std_screening", label: "STD / Sexual Health", recommended: ["hiv", "syphilis"], visualPrompts: [{ id: "lesion", label: "Visible Lesions", icon: "skin" }] },
]

// --- MOCK DOCTOR DATA ---
interface Doctor {
    id: string
    name: string
    specialty: string
    status: 'online' | 'busy' | 'offline'
    queueLength: number
    nextAvailableSlot: string
    avatarColor: string
}

const doctorPool: Doctor[] = [
    { id: "dr1", name: "Dr. Vo Tuan", specialty: "Internal Medicine", status: "online", queueLength: 1, nextAvailableSlot: "Now", avatarColor: "bg-blue-100 text-blue-700" },
    { id: "dr2", name: "Dr. Nguyen An", specialty: "Endocrinology", status: "online", queueLength: 0, nextAvailableSlot: "Now", avatarColor: "bg-emerald-100 text-emerald-700" },
    { id: "dr3", name: "Dr. Le Chi", specialty: "Endocrinology", status: "busy", queueLength: 4, nextAvailableSlot: "14:30", avatarColor: "bg-purple-100 text-purple-700" },
    { id: "dr4", name: "Dr. Tran Bao", specialty: "Infectious Disease", status: "online", queueLength: 2, nextAvailableSlot: "10:15", avatarColor: "bg-amber-100 text-amber-700" },
    { id: "dr5", name: "Dr. Pham Hanh", specialty: "General Practice", status: "offline", queueLength: 0, nextAvailableSlot: "Tomorrow", avatarColor: "bg-slate-100 text-slate-700" },
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

// --- VITAL SIGNS (Unchanged) ---
function VitalSignsMonitor({ patientAge, historicalHeight, nurseName }: { patientAge: number | null, historicalHeight: string, nurseName: string }) {
    const { toast } = useToast()
    const [vitals, setVitals] = useState({ height: "", weight: "", temp: "", bpSys: "", bpDia: "", pulse: "", spo2: "", resp: "" })
    const [isHeightLocked, setIsHeightLocked] = useState(false)
    const [vitalHistory, setVitalHistory] = useState<any[]>([])
    useEffect(() => { if (patientAge && patientAge >= 18 && historicalHeight) { setVitals(prev => ({ ...prev, height: historicalHeight })); setIsHeightLocked(true) } else { setIsHeightLocked(false) } }, [patientAge, historicalHeight])
    const bmi = useMemo(() => { const h = parseFloat(vitals.height)/100; const w = parseFloat(vitals.weight); return (h>0 && w>0) ? (w/(h*h)).toFixed(1) : "" }, [vitals.height, vitals.weight])
    const handleInputChange = (field: string, value: string) => setVitals(prev => ({ ...prev, [field]: value }))
    const saveVitals = () => { if (!Object.values(vitals).some(val => val !== "")) return; setVitalHistory(prev => [{id: Math.random(), timestamp: new Date(), recordedBy: nurseName, bmi: bmi, ...vitals}, ...prev]); toast({ title: "Vitals Recorded", description: `Captured by ${nurseName}` }); setVitals(prev => ({ ...prev, weight: "", temp: "", bpSys: "", bpDia: "", pulse: "", spo2: "", resp: "", height: isHeightLocked ? prev.height : "" })) }
    const UnitInput = ({ label, unit, value, onChange, placeholder, className, disabled = false }: any) => ( <div className="relative"><Label className="text-[10px] uppercase font-semibold text-slate-500 mb-1 block">{label}</Label><div className="relative"><Input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} disabled={disabled} className={cn("pr-8 h-9 font-medium focus-visible:ring-1", className)} /><span className="absolute right-3 top-2.5 text-[10px] text-slate-400 font-bold select-none">{unit}</span></div></div> )
    return ( <Card className="border-t-4 border-t-red-500 shadow-sm bg-white overflow-hidden"><div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white"><div className="flex items-center gap-2 text-red-600 font-bold text-sm uppercase tracking-wide"><Activity className="h-4 w-4"/> Vital Signs</div><div className="text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded">Press <span className="font-bold text-slate-700">Enter</span> to save</div></div><CardContent className="p-0"><div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-100" onKeyDown={e => e.key === 'Enter' && saveVitals()}><div className="p-5 space-y-4"><div className="flex items-center gap-2 mb-2"><Scale className="h-4 w-4 text-slate-400"/><span className="text-xs font-bold text-slate-700 uppercase">Body</span></div><div className="grid grid-cols-2 gap-3"><UnitInput label="Height" unit="cm" placeholder="--" value={vitals.height} onChange={(v: string) => handleInputChange('height', v)} disabled={isHeightLocked} className={isHeightLocked ? "bg-slate-50 text-slate-600" : ""} /><UnitInput label="Weight" unit="kg" placeholder="--" value={vitals.weight} onChange={(v: string) => handleInputChange('weight', v)} className="font-bold text-slate-900"/></div><div className="flex justify-between items-center bg-slate-50 rounded px-3 py-1.5 border border-slate-100"><span className="text-[10px] font-bold text-slate-500 uppercase">BMI Score</span><span className={cn("text-xs font-bold", !bmi ? "text-slate-300" : Number(bmi) > 25 ? "text-red-600" : "text-emerald-600")}>{bmi || "--"}</span></div></div><div className="p-5 space-y-4"><div className="flex items-center gap-2 mb-2"><HeartPulse className="h-4 w-4 text-slate-400"/><span className="text-xs font-bold text-slate-700 uppercase">Circulation</span></div><div className="space-y-3"><div><Label className="text-[10px] uppercase font-semibold text-slate-500 mb-1 block">Blood Pressure</Label><div className="flex items-center gap-1"><Input value={vitals.bpSys} onChange={e => handleInputChange('bpSys', e.target.value)} className="h-9 w-16 text-center font-medium placeholder:text-slate-200" placeholder="120"/><span className="text-slate-300">/</span><Input value={vitals.bpDia} onChange={e => handleInputChange('bpDia', e.target.value)} className="h-9 w-16 text-center font-medium placeholder:text-slate-200" placeholder="80"/><span className="text-[10px] text-slate-400 ml-1 font-bold">mmHg</span></div></div><UnitInput label="Pulse Rate" unit="bpm" placeholder="--" value={vitals.pulse} onChange={(v: string) => handleInputChange('pulse', v)} /></div></div><div className="p-5 space-y-4"><div className="flex items-center gap-2 mb-2"><Wind className="h-4 w-4 text-slate-400"/><span className="text-xs font-bold text-slate-700 uppercase">Respiratory</span></div><div className="space-y-3"><UnitInput label="SpO2" unit="%" placeholder="98" value={vitals.spo2} onChange={(v: string) => handleInputChange('spo2', v)} className="text-blue-600 font-bold"/><UnitInput label="Breathing Rate" unit="rpm" placeholder="16" value={vitals.resp} onChange={(v: string) => handleInputChange('resp', v)} /></div></div><div className="p-5 flex flex-col justify-between bg-slate-50/30"><div className="space-y-4"><div className="flex items-center gap-2 mb-2"><Thermometer className="h-4 w-4 text-slate-400"/><span className="text-xs font-bold text-slate-700 uppercase">Temp</span></div><UnitInput label="Celcius" unit="°C" placeholder="36.5" value={vitals.temp} onChange={(v: string) => handleInputChange('temp', v)} /></div><Button onClick={saveVitals} className="w-full bg-red-600 hover:bg-red-700 text-white shadow-sm mt-4">Record Entry</Button></div></div>{vitalHistory.length > 0 && (<div className="border-t border-slate-100"><Table><TableHeader><TableRow className="hover:bg-transparent border-none"><TableHead className="h-9 text-[10px] uppercase font-bold text-slate-400 pl-6 w-[120px]">Time / Nurse</TableHead><TableHead className="h-9 text-[10px] uppercase font-bold text-slate-400 text-right">BP (mmHg)</TableHead><TableHead className="h-9 text-[10px] uppercase font-bold text-slate-400 text-right">HR (bpm)</TableHead><TableHead className="h-9 text-[10px] uppercase font-bold text-slate-400 text-right">SpO2 (%)</TableHead><TableHead className="h-9 text-[10px] uppercase font-bold text-slate-400 text-right">Temp (°C)</TableHead><TableHead className="h-9 text-[10px] uppercase font-bold text-slate-400 text-right pr-6">BMI</TableHead></TableRow></TableHeader><TableBody>{vitalHistory.map((record:any) => (<TableRow key={record.id} className="h-10 hover:bg-slate-50 border-t border-slate-50"><TableCell className="pl-6 py-2"><div className="font-bold text-slate-700 text-xs">{record.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div><div className="text-[9px] text-slate-400 font-medium">{record.recordedBy}</div></TableCell><TableCell className="text-right py-2 text-xs font-mono text-slate-600">{record.bpSys}/{record.bpDia}</TableCell><TableCell className="text-right py-2 text-xs font-mono text-slate-600">{record.pulse}</TableCell><TableCell className="text-right py-2 text-xs font-bold text-blue-600">{record.spo2}</TableCell><TableCell className="text-right py-2 text-xs font-mono text-slate-600">{record.temp}</TableCell><TableCell className="text-right py-2 text-xs font-mono pr-6">{record.bmi}</TableCell></TableRow>))}</TableBody></Table></div>)}</CardContent></Card> )
}

// --- RELATED PARTIES (Unchanged) ---
function RelatedPartiesCard() {
    const { toast } = useToast()
    const [parties, setParties] = useState<any[]>([])
    const [scanRelativeStep, setScanRelativeStep] = useState<"idle" | "scanning">("idle")
    const handleScanRelative = () => { setScanRelativeStep("scanning"); setTimeout(() => { setScanRelativeStep("idle"); const isFirst = parties.length === 0; const newPerson = isFirst ? { id: "rel-01", name: "NGUYỄN THỊ MAI (Wife)", relation: "spouse", phone: "0909111222", citizenId: "0791...", roles: { isEmergency: true, isGuardian: false, isPayer: true } } : { id: "rel-02", name: "TRẦN MAI ANH (Daughter)", relation: "child", phone: "N/A", citizenId: "0792...", roles: { isEmergency: false, isGuardian: false, isPayer: false } }; setParties(prev => [...prev, newPerson]); toast({ title: "Identity Linked", description: `Added ${newPerson.name} to related parties.` }) }, 1500) }
    const toggleRole = (id: string, role: string) => { setParties(prev => prev.map(p => { if (p.id !== id) return p; return { ...p, roles: { ...p.roles, [role]: !p.roles[role] } } })) }
    const removeParty = (id: string) => setParties(prev => prev.filter(p => p.id !== id))
    return ( <Card className="border-t-4 border-t-amber-500 shadow-sm bg-white"><CardHeader className="pb-3 border-b border-slate-50 flex flex-row items-center justify-between"><CardTitle className="text-sm uppercase text-amber-600 flex items-center gap-2"><Users className="h-4 w-4"/> Related Parties & Emergency</CardTitle><div className="flex gap-2"><Button size="sm" variant="outline" className="h-8 text-xs gap-2"><Plus className="h-3 w-3"/> Manual</Button><Button size="sm" onClick={handleScanRelative} disabled={scanRelativeStep === 'scanning'} className="bg-amber-500 hover:bg-amber-600 text-white h-8 text-xs gap-2">{scanRelativeStep === 'scanning' ? <Loader2 className="h-3 w-3 animate-spin"/> : <ScanLine className="h-3 w-3"/>} Scan Relative ID</Button></div></CardHeader><CardContent className="p-0">{parties.length === 0 ? (<div className="p-8 text-center text-slate-400 text-sm italic">No related parties linked yet. Scan a family member's ID to link.</div>) : (<div className="divide-y divide-slate-100">{parties.map(party => (<div key={party.id} className="p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between hover:bg-slate-50 transition-colors"><div className="flex items-center gap-3 min-w-[200px]"><div className={cn("h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold border-2", party.relation === 'child' ? "bg-purple-100 text-purple-600 border-purple-200" : "bg-blue-100 text-blue-600 border-blue-200")}>{party.relation === 'child' ? <Baby className="h-5 w-5"/> : party.name.charAt(0)}</div><div><div className="text-sm font-bold text-slate-800 flex items-center gap-2">{party.name}</div><div className="text-[10px] text-slate-500 uppercase font-semibold flex items-center gap-2">{party.relation} • {party.phone}</div></div></div><div className="flex flex-wrap gap-2 items-center"><button onClick={() => toggleRole(party.id, 'isEmergency')} className={cn("px-2 py-1 rounded border text-[10px] font-bold flex items-center gap-1.5 transition-all", party.roles.isEmergency ? "bg-red-50 border-red-200 text-red-700 shadow-sm" : "bg-white border-slate-200 text-slate-400 hover:border-slate-300")}><Siren className="h-3 w-3"/> Emergency Contact {party.roles.isEmergency && <CheckCircle2 className="h-3 w-3 ml-1"/>}</button><button onClick={() => toggleRole(party.id, 'isGuardian')} className={cn("px-2 py-1 rounded border text-[10px] font-bold flex items-center gap-1.5 transition-all", party.roles.isGuardian ? "bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm" : "bg-white border-slate-200 text-slate-400 hover:border-slate-300")}><FileSignature className="h-3 w-3"/> Legal Guardian</button><button onClick={() => toggleRole(party.id, 'isPayer')} className={cn("px-2 py-1 rounded border text-[10px] font-bold flex items-center gap-1.5 transition-all", party.roles.isPayer ? "bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm" : "bg-white border-slate-200 text-slate-400 hover:border-slate-300")}><CreditCard className="h-3 w-3"/> Bill Payer</button><div className="h-4 w-px bg-slate-200 mx-1"></div><button onClick={() => removeParty(party.id)} className="text-slate-300 hover:text-red-500"><Trash2 className="h-4 w-4"/></button></div></div>))}</div>)}</CardContent></Card> )
}

// --- VISUAL OBSERVATION (Unchanged) ---
function VisualObservationCard({ medicalIntent }: { medicalIntent: string }) {
    const { toast } = useToast()
    const [capturedImages, setCapturedImages] = useState<Record<string, { note: string, captured: boolean }>>({})
    const intentData = medicalIntents.find(i => i.id === medicalIntent)
    const prompts = intentData?.visualPrompts || []
    if (!medicalIntent || prompts.length === 0) return null
    const handleCapture = (promptId: string) => { setCapturedImages(prev => ({ ...prev, [promptId]: { note: "", captured: true } })); toast({ title: "Image Captured", description: "Visual record added to session." }) }
    const handleNote = (promptId: string, text: string) => { setCapturedImages(prev => ({ ...prev, [promptId]: { ...prev[promptId], note: text } })) }
    return (
        <Card className="border-t-4 border-t-purple-500 shadow-sm animate-in fade-in slide-in-from-top-4">
            <CardHeader className="pb-3 border-b border-slate-50 bg-slate-50/50"><div className="flex justify-between items-center"><CardTitle className="text-sm uppercase text-purple-600 flex items-center gap-2"><Camera className="h-4 w-4"/> Visual Observations</CardTitle><Badge variant="outline" className="text-purple-600 border-purple-200 bg-purple-50">Protocol: {intentData?.label}</Badge></div></CardHeader>
            <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">{prompts.map(prompt => { const data = capturedImages[prompt.id]; return (<div key={prompt.id} className={cn("border rounded-xl p-3 transition-all", data?.captured ? "bg-white border-purple-200 shadow-sm" : "bg-slate-50 border-dashed border-slate-300 hover:border-purple-400 hover:bg-purple-50")}>{data?.captured ? (<div className="space-y-3"><div className="relative aspect-video bg-slate-900 rounded-lg flex items-center justify-center overflow-hidden group"><ImageIcon className="h-8 w-8 text-white/50" /><div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Button variant="secondary" size="sm" className="h-7 text-xs" onClick={() => handleCapture(prompt.id)}>Retake</Button></div><div className="absolute top-2 left-2"><Badge className="bg-emerald-600 text-[10px]">Captured</Badge></div></div><div className="space-y-1"><Label className="text-[10px] uppercase font-bold text-slate-500">Observation Notes</Label><Input value={data.note} onChange={e => handleNote(prompt.id, e.target.value)} className="h-8 text-xs bg-slate-50" placeholder={`Describe ${prompt.label.toLowerCase()}...`} /></div></div>) : (<button onClick={() => handleCapture(prompt.id)} className="w-full h-full flex flex-col items-center justify-center py-6 text-center space-y-2 group"><div className="h-10 w-10 bg-white rounded-full flex items-center justify-center shadow-sm border group-hover:scale-110 transition-transform text-purple-600">{prompt.icon === 'eye' ? <Eye className="h-5 w-5"/> : <Camera className="h-5 w-5"/>}</div><div><div className="text-sm font-bold text-slate-700">{prompt.label}</div><div className="text-[10px] text-slate-400 flex items-center justify-center gap-1"><AlertTriangle className="h-3 w-3"/> Required for Protocol</div></div></button>)}</div>) })}</CardContent>
        </Card>
    )
}

// --- PRIVATE INSURANCE (Unchanged) ---
interface PrivateInsuranceData { provider: string; policyNumber: string; frontImg: string | null; backImg: string | null; estimatedCoverage: number; isActive: boolean }
function PrivateInsuranceCard({ onChange, data }: { onChange: (d: PrivateInsuranceData) => void, data: PrivateInsuranceData }) {
    const { toast } = useToast()
    const [isScanning, setIsScanning] = useState(false)
    const providers = [{ id: "pvi", name: "PVI Insurance", color: "bg-yellow-600" }, { id: "baoviet", name: "Bao Viet Insurance", color: "bg-blue-600" }, { id: "manulife", name: "Manulife", color: "bg-emerald-600" }, { id: "liberty", name: "Liberty Insurance", color: "bg-indigo-600" }]
    const handleScanCard = () => { setIsScanning(true); setTimeout(() => { setIsScanning(false); onChange({ ...data, isActive: true, provider: "baoviet", policyNumber: "BV-88992200-X", frontImg: "captured", backImg: "captured", estimatedCoverage: 0.8 }); toast({ title: "Card Scanned", description: "Bao Viet Gold Plan detected via OCR." }) }, 2000) }
    const toggleActive = () => { if (!data.isActive) { onChange({ ...data, isActive: true }) } else { onChange({ ...data, isActive: false }) } }
    return ( <Card className={cn("border-t-4 shadow-sm transition-all", data.isActive ? "border-t-sky-500 bg-white" : "border-t-slate-200 bg-slate-50")}><CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between"><CardTitle className={cn("text-sm uppercase flex items-center gap-2", data.isActive ? "text-sky-600" : "text-slate-400")}><Shield className="h-4 w-4"/> Private Insurance (Optional)</CardTitle><div className="flex items-center gap-2">{data.isActive && <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">Verifying...</Badge>} <Button size="sm" variant={data.isActive ? "secondary" : "outline"} className="h-8 text-xs" onClick={toggleActive}>{data.isActive ? "Remove" : "Add Insurance"}</Button></div></CardHeader>{data.isActive && (<CardContent className="p-5 animate-in slide-in-from-top-2"><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div className="space-y-4"><Label className="text-xs font-bold text-slate-500 uppercase">Physical Card Capture</Label><div className="grid grid-cols-2 gap-3"><button onClick={handleScanCard} className={cn("aspect-[1.58/1] rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all hover:bg-sky-50", data.frontImg ? "border-sky-500 bg-sky-50/50" : "border-slate-300")}>{isScanning ? <Loader2 className="h-6 w-6 animate-spin text-sky-500"/> : data.frontImg ? <CheckCircle2 className="h-6 w-6 text-sky-500"/> : <Camera className="h-6 w-6 text-slate-400"/>}<span className="text-[10px] font-bold text-slate-500 uppercase">Front Side</span></button><button className={cn("aspect-[1.58/1] rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all hover:bg-sky-50", data.backImg ? "border-sky-500 bg-sky-50/50" : "border-slate-300")}>{data.backImg ? <CheckCircle2 className="h-6 w-6 text-sky-500"/> : <Camera className="h-6 w-6 text-slate-400"/>}<span className="text-[10px] font-bold text-slate-500 uppercase">Back Side</span></button></div>{data.frontImg ? (<div className="text-[10px] text-sky-600 flex items-center gap-1"><CheckCircle2 className="h-3 w-3"/> Images uploaded to Claims Center</div>) : (<Button size="sm" className="w-full bg-sky-500 hover:bg-sky-600 text-white" onClick={handleScanCard}><ScanLine className="h-4 w-4 mr-2"/> Scan Card (OCR)</Button>)}</div><div className="space-y-4"><div className="space-y-1"><Label className="text-xs font-semibold text-slate-500">Provider</Label><Select value={data.provider} onValueChange={(val) => onChange({...data, provider: val})}><SelectTrigger className="bg-white"><SelectValue placeholder="Select Provider" /></SelectTrigger><SelectContent>{providers.map(p => (<SelectItem key={p.id} value={p.id}><div className="flex items-center gap-2"><div className={cn("h-2 w-2 rounded-full", p.color)}></div>{p.name}</div></SelectItem>))}</SelectContent></Select></div><div className="space-y-1"><Label className="text-xs font-semibold text-slate-500">Policy Number</Label><Input value={data.policyNumber} onChange={(e) => onChange({...data, policyNumber: e.target.value})} placeholder="Enter or Scan..." className="font-mono bg-white"/></div><div className="pt-2 bg-slate-50 p-3 rounded border border-slate-100"><div className="flex justify-between items-center mb-2"><Label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1"><RefreshCw className="h-3 w-3"/> Est. Direct Billing</Label><span className="text-sm font-bold text-sky-600">{(data.estimatedCoverage * 100).toFixed(0)}%</span></div><Slider defaultValue={[data.estimatedCoverage]} max={1} step={0.05} onValueChange={(vals) => onChange({...data, estimatedCoverage: vals[0]})} className="py-2"/><div className="text-[9px] text-slate-400 mt-1 italic">*Estimate only. Final coverage pending TPA approval.</div></div></div></div></CardContent>)}</Card>)
}

// --- NEW COMPONENT: TELEHEALTH DISPATCH CARD ---
function TelehealthDispatchCard({ medicalIntent }: { medicalIntent: string }) {
    const { toast } = useToast()
    const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null)
    const [bookingState, setBookingState] = useState<'idle' | 'booking' | 'booked'>('idle')
    const [searchQuery, setSearchQuery] = useState("")

    // 1. FILTERING LOGIC: Best Match
    const filteredDoctors = useMemo(() => {
        let docs = [...doctorPool]
        
        // Filter by relevance (Basic logic for demo)
        if (medicalIntent === 'chronic_diabetes') {
            docs = docs.filter(d => d.specialty === 'Endocrinology' || d.specialty === 'Internal Medicine')
        } else if (medicalIntent === 'fever_infection') {
            docs = docs.filter(d => d.specialty === 'Infectious Disease' || d.specialty === 'General Practice')
        }
        
        // Filter by Search
        if (searchQuery) {
            docs = docs.filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()))
        }

        // Sort: Online > Low Queue > Busy > Offline
        return docs.sort((a, b) => {
             const statusScore = (s:string) => s === 'online' ? 0 : s === 'busy' ? 1 : 2
             if (statusScore(a.status) !== statusScore(b.status)) return statusScore(a.status) - statusScore(b.status)
             return a.queueLength - b.queueLength
        })
    }, [medicalIntent, searchQuery])

    // 2. AUTO-ASSIGN LOGIC (Best available doctor)
    const autoAssignedDr = useMemo(() => {
        return filteredDoctors.find(d => d.status === 'online') || filteredDoctors[0]
    }, [filteredDoctors])

    // Select auto-assigned doctor initially
    useEffect(() => {
        if(autoAssignedDr && !selectedDoctor && bookingState === 'idle') {
            setSelectedDoctor(autoAssignedDr.id)
        }
    }, [autoAssignedDr, bookingState])

    const handleBook = () => {
        if(!selectedDoctor) return
        setBookingState('booking')
        setTimeout(() => {
            setBookingState('booked')
            const dr = doctorPool.find(d => d.id === selectedDoctor)
            toast({ 
                title: "Telehealth Confirmed", 
                description: `Appointment booked with ${dr?.name}. Link sent to patient.`
            })
        }, 1500)
    }

    if (!medicalIntent) return null

    return (
        <Card className="border-t-4 border-t-pink-500 shadow-sm animate-in fade-in slide-in-from-top-4">
            <CardHeader className="pb-3 border-b border-slate-50 flex flex-row items-center justify-between">
                <CardTitle className="text-sm uppercase text-pink-600 flex items-center gap-2">
                    <Video className="h-4 w-4"/> Telehealth Dispatch
                </CardTitle>
                <div className="flex gap-2">
                    <Input 
                        placeholder="Search doctors..." 
                        className="h-8 w-40 text-xs" 
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
            </CardHeader>
            <CardContent className="p-0">
                {bookingState === 'booked' ? (
                    <div className="p-8 text-center space-y-3 bg-pink-50/50">
                        <div className="mx-auto h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="h-6 w-6 text-green-600"/>
                        </div>
                        <div className="text-pink-900 font-bold">Booking Confirmed</div>
                        <p className="text-xs text-slate-500">
                             Video link has been SMS'd to the patient.<br/>
                             Expected start: <b>{doctorPool.find(d => d.id === selectedDoctor)?.nextAvailableSlot}</b>
                        </p>
                        <Button variant="outline" size="sm" onClick={() => setBookingState('idle')}>Book Another</Button>
                    </div>
                ) : (
                    <>
                         {/* DOCTOR LIST */}
                         <div className="max-h-[200px] overflow-y-auto divide-y divide-slate-50">
                             {filteredDoctors.map(dr => {
                                 const isSelected = selectedDoctor === dr.id
                                 const isBestMatch = dr.id === autoAssignedDr?.id
                                 return (
                                     <div 
                                        key={dr.id}
                                        onClick={() => setSelectedDoctor(dr.id)}
                                        className={cn("p-3 flex items-center justify-between cursor-pointer transition-colors border-l-4", 
                                            isSelected ? "bg-pink-50 border-l-pink-500" : "hover:bg-slate-50 border-l-transparent"
                                        )}
                                     >
                                         <div className="flex items-center gap-3">
                                             <div className={cn("h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs relative", dr.avatarColor)}>
                                                 {dr.name.split(" ").pop()?.substring(0,2)}
                                                 {/* Status Dot */}
                                                 <div className={cn("absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white", 
                                                    dr.status === 'online' ? "bg-green-500" : dr.status === 'busy' ? "bg-amber-500" : "bg-slate-300"
                                                 )}></div>
                                             </div>
                                             <div>
                                                 <div className="flex items-center gap-2">
                                                     <span className="text-sm font-bold text-slate-700">{dr.name}</span>
                                                     {isBestMatch && <Badge className="h-4 px-1 text-[9px] bg-pink-100 text-pink-700 hover:bg-pink-100 border-pink-200">Auto-Suggest</Badge>}
                                                 </div>
                                                 <div className="text-xs text-slate-500">{dr.specialty}</div>
                                             </div>
                                         </div>

                                         <div className="text-right">
                                             <div className="text-xs font-medium text-slate-600">
                                                 {dr.status === 'online' ? <span className="text-green-600 flex items-center gap-1"><Signal className="h-3 w-3"/> Available</span> : 
                                                  dr.status === 'busy' ? <span className="text-amber-600 flex items-center gap-1"><Clock className="h-3 w-3"/> In Call</span> : 
                                                  <span className="text-slate-400">Offline</span>}
                                             </div>
                                             <div className="text-[10px] text-slate-400">
                                                 Queue: {dr.queueLength} • Next: {dr.nextAvailableSlot}
                                             </div>
                                         </div>
                                     </div>
                                 )
                             })}
                         </div>

                         {/* ACTION FOOTER */}
                         <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                             <div className="text-xs text-slate-500">
                                 Selected: <span className="font-bold text-slate-700">{doctorPool.find(d => d.id === selectedDoctor)?.name || "None"}</span>
                             </div>
                             <Button 
                                size="sm" 
                                className="bg-pink-600 hover:bg-pink-700 text-white"
                                onClick={handleBook}
                                disabled={!selectedDoctor || bookingState === 'booking'}
                             >
                                 {bookingState === 'booking' ? <Loader2 className="h-4 w-4 animate-spin"/> : <Zap className="h-4 w-4 mr-2"/>}
                                 Book Telehealth
                             </Button>
                         </div>
                    </>
                )}
            </CardContent>
        </Card>
    )
}

// --- MAIN PAGE ---
export function ReceptionistView() {
  const { toast } = useToast()
  const [scanStep, setScanStep] = useState<any>("idle")
  const [scannedIdentity, setScannedIdentity] = useState<any>(null)
  const [formData, setFormData] = useState<any>({ fullName: "", dob: "", citizenId: "", gender: "male", medicalIntent: "" })
  const [selectedTests, setSelectedTests] = useState<LabTest[]>([])
  const [testSearchQuery, setTestSearchQuery] = useState("")
  const [consentStatus, setConsentStatus] = useState<Record<string, 'pending' | 'requesting' | 'signed'>>({})
  const [internalAccess, setInternalAccess] = useState<'locked' | 'unlocked'>('locked')
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const [showInternalHistoryModal, setShowInternalHistoryModal] = useState(false)
  const [otpStep, setOtpStep] = useState<'method' | 'verify'>('method')
  const [otpInput, setOtpInput] = useState("")

  const [privateInsurance, setPrivateInsurance] = useState<PrivateInsuranceData>({
      provider: "", policyNumber: "", frontImg: null, backImg: null, estimatedCoverage: 0.0, isActive: false
  })

  // LOGIC & CALCULATIONS
  const checkInsuranceEligibility = (test: LabTest, patient: any) => {
      let bhytResult = { isCovered: false, coveragePercent: 0, reason: "" }
      if(patient && patient.bhyt) {
          if (test.linkedCondition && patient.chronicConditionCode === test.linkedCondition) {
              if (test.id === 'hba1c') {
                  if (patient.activeReferral) bhytResult = { isCovered: true, coveragePercent: 1.0, reason: "Diabetes Plan (BHYT)" }
                  else bhytResult = { isCovered: false, coveragePercent: 0, reason: "BHYT (Missing Referral)" }
              }
          } else {
              bhytResult = { isCovered: true, coveragePercent: 0.8, reason: "Standard BHYT" }
          }
      }
      return bhytResult
  }

  const cartTotals = useMemo(() => {
      let subtotal = 0, bhytCoverageAmount = 0, privateCoverageAmount = 0, finalPatientDue = 0
      selectedTests.forEach(test => {
          subtotal += test.price
          const bhytCheck = checkInsuranceEligibility(test, scannedIdentity)
          const bhytAmt = bhytCheck.isCovered ? test.price * bhytCheck.coveragePercent : 0
          bhytCoverageAmount += bhytAmt
          const remainder = test.price - bhytAmt
          let privateAmt = 0
          if (privateInsurance.isActive && remainder > 0) privateAmt = remainder * privateInsurance.estimatedCoverage
          privateCoverageAmount += privateAmt
          finalPatientDue += (remainder - privateAmt)
      })
      return { subtotal, bhytCoverageAmount, privateCoverageAmount, finalPatientDue }
  }, [selectedTests, scannedIdentity, privateInsurance])

  const processIdentityVerification = (sourceData: any) => {
      setScanStep("cccd")
      setTimeout(() => {
          const verifiedData = { name: sourceData.name || formData.fullName || "TRẦN THỊ NGỌC LAN", dob: "15/05/1992", age: 33, citizenId: sourceData.citizenId || formData.citizenId || "079192000123" }
          setScannedIdentity(verifiedData)
          setFormData((prev: any) => ({...prev, fullName: verifiedData.name, citizenId: verifiedData.citizenId}))
          setScanStep("checking-bhyt")
          setTimeout(() => {
              setScannedIdentity((prev:any) => ({ ...prev, bhyt: { code: "DN4797915071630", coverageLabel: "80% (Lvl 4)", expiry: "31/12/2025" }, chronicCondition: "Type 2 Diabetes", chronicConditionCode: "E11", activeReferral: "TD-2401-99", historicalHeight: "165" }))
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
  const suggestedTests = useMemo(() => { if (!formData.medicalIntent) return []; const intentObj = medicalIntents.find(i => i.id === formData.medicalIntent); return intentObj ? intentObj.recommended.map(id => labTestsData.find(t => t.id === id)).filter(Boolean) as LabTest[] : [] }, [formData.medicalIntent])

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

                <IdentityVerificationCard 
                    data={scannedIdentity || {}} scanStep={scanStep} 
                    onClear={() => {setScannedIdentity(null); setScanStep('idle'); setInternalAccess('locked')}}
                    onInternalHistoryClick={() => { internalAccess === 'unlocked' ? setShowInternalHistoryModal(true) : (setShowAuthDialog(true), setOtpStep('method')) }}
                    internalAccess={internalAccess}
                />

                <PrivateInsuranceCard data={privateInsurance} onChange={setPrivateInsurance} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="border-t-4 border-t-blue-500 shadow-sm md:col-span-2"><CardHeader className="pb-2"><CardTitle className="text-sm uppercase text-blue-600 flex items-center gap-2"><User className="h-4 w-4"/> Demographics</CardTitle></CardHeader><CardContent className="grid grid-cols-2 gap-4"><div><Label className="text-xs text-slate-500">Full Name</Label><Input value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="font-bold uppercase"/></div><div><Label className="text-xs text-slate-500">Citizen ID</Label><div className="flex gap-2"><Input value={formData.citizenId} onChange={e => setFormData({...formData, citizenId: e.target.value})} className="font-mono"/><Button onClick={() => processIdentityVerification({})} disabled={scanStep !== 'idle'} variant="secondary">Check</Button></div></div></CardContent></Card>
                    <div className="md:col-span-2"><RelatedPartiesCard /></div>
                    <Card className="border-t-4 border-t-emerald-500 shadow-sm md:col-span-2"><CardHeader className="pb-2"><CardTitle className="text-sm uppercase text-emerald-600 flex items-center gap-2"><Stethoscope className="h-4 w-4"/> Clinical Context</CardTitle></CardHeader><CardContent className="space-y-4"><div className="bg-emerald-50/50 p-4 rounded-lg border border-emerald-100"><Label className="text-sm font-bold text-emerald-800 mb-2 block flex items-center gap-2"><Activity className="h-4 w-4"/> Medical Intent</Label><Select value={formData.medicalIntent} onValueChange={(val) => setFormData({...formData, medicalIntent: val})}><SelectTrigger className="bg-white border-emerald-200"><SelectValue placeholder="Select intent..." /></SelectTrigger><SelectContent>{medicalIntents.map(i => <SelectItem key={i.id} value={i.id}>{i.label}</SelectItem>)}</SelectContent></Select></div>{formData.medicalIntent === 'chronic_diabetes' && scannedIdentity?.activeReferral && (<div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-r shadow-sm"><div className="flex items-start gap-3"><div className="bg-blue-100 p-2 rounded-full"><Sparkles className="h-5 w-5 text-blue-600" /></div><div><h4 className="font-bold text-blue-900 text-sm mb-1">Suggested Script</h4><p className="text-sm text-blue-800 italic">"Mr./Ms. {formData.fullName.split(' ').pop()}, evidently you have already been classified as a diabetic, and you have no diabetes testing in the last 90 days. We can serve you a diabetes test today which you don't have to make a charge for under BHYT Insurance."</p></div></div></div>)}</CardContent></Card>
                    <div className="md:col-span-2"><VitalSignsMonitor nurseName="Nurse Lan" patientAge={scannedIdentity?.age} historicalHeight={scannedIdentity?.historicalHeight} /></div>
                    <div className="md:col-span-2"><VisualObservationCard medicalIntent={formData.medicalIntent} /></div>

                    {/* --- NEW: TELEHEALTH DISPATCHER --- */}
                    <div className="md:col-span-2">
                        <TelehealthDispatchCard medicalIntent={formData.medicalIntent} />
                    </div>

                    <Card className="border-t-4 border-t-indigo-500 shadow-sm md:col-span-2 mb-20"><CardHeader className="pb-2"><CardTitle className="text-sm uppercase text-indigo-600 flex items-center gap-2"><Beaker className="h-4 w-4"/> Order Entry</CardTitle></CardHeader><CardContent className="space-y-4">{suggestedTests.length > 0 && (<div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4"><h4 className="text-sm font-bold text-indigo-800 mb-3 flex items-center gap-2"><Sparkles className="h-4 w-4"/> Recommended Protocol</h4><div className="grid grid-cols-1 md:grid-cols-3 gap-2">{suggestedTests.map(test => { const eligible = checkInsuranceEligibility(test, scannedIdentity); return (<button key={test.id} onClick={() => addTest(test)} className="text-left p-2 rounded border bg-white border-indigo-200 hover:border-indigo-400 flex justify-between items-center group"><div><div className="text-xs font-bold text-slate-700">{test.name}</div><div className="text-[10px] text-slate-500">{eligible.coveragePercent === 1.0 ? <span className="text-emerald-600 font-bold">100% Covered</span> : formatCurrency(test.price)}</div></div><PlusCircle className="h-4 w-4 text-indigo-400 group-hover:text-indigo-600"/></button>)})}</div></div>)}<div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><Input className="pl-10 h-10" placeholder="Search tests..." value={testSearchQuery} onChange={e => setTestSearchQuery(e.target.value)}/></div></CardContent></Card>
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
                                <div className="flex justify-between items-end mt-2"><div className="text-xs text-slate-500 max-w-[60%]">{isFullyCovered && <div className="text-emerald-600 font-bold">BHYT Full Coverage</div>}{eligibility.reason}</div><div className="text-right">{isFullyCovered ? (<><div className="text-[10px] text-slate-400 line-through">{formatCurrency(test.price)}</div><div className="font-bold text-emerald-600 text-sm">0 ₫</div></>) : (<div className="font-bold text-slate-800 text-sm">{formatCurrency(test.price)}</div>)}</div></div>
                                {test.requiresConsent && (<div className="mt-3 pt-3 border-t border-amber-200/50">{consentStatus[test.id] !== 'signed' ? <Button size="sm" variant="outline" onClick={() => requestConsent(test.id)} className="w-full h-8 text-xs">Request Signature</Button> : <div className="text-xs text-emerald-600 font-bold flex items-center gap-1"><FileSignature className="h-3 w-3"/> Signed</div>}</div>)}
                            </div>
                        )
                    })
                )}
            </div>
            <div className="p-4 border-t bg-slate-50 space-y-4">
                <div className="space-y-2">
                    <div className="flex justify-between text-sm text-slate-500"><span>Subtotal</span><span>{formatCurrency(cartTotals.subtotal)}</span></div>
                    {scannedIdentity?.bhyt && (<div className="flex justify-between text-sm text-emerald-600"><span className="flex items-center gap-1"><ShieldCheck className="h-3 w-3"/> BHYT Pays</span><span>- {formatCurrency(cartTotals.bhytCoverageAmount)}</span></div>)}
                    {privateInsurance.isActive && cartTotals.privateCoverageAmount > 0 && (<div className="flex justify-between text-sm text-sky-600"><span className="flex items-center gap-1"><Shield className="h-3 w-3"/> Private Ins. (~{(privateInsurance.estimatedCoverage*100).toFixed(0)}%)</span><span>- {formatCurrency(cartTotals.privateCoverageAmount)}</span></div>)}
                    <div className="flex justify-between text-lg font-bold text-slate-900 pt-2 border-t"><span>Final Patient Due</span><span>{formatCurrency(cartTotals.finalPatientDue)}</span></div>
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