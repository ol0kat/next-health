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
  ShieldCheck, AlertCircle, ShoppingCart, Copy, FileText, ChevronRight
} from "lucide-react"
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

// --- MOCK DATA ---
const mockBhytHistory = [
  { diagnosis: "Viêm phế quản cấp", date: "15/01/2024", facility: "79071 • Đỡ" },
  { diagnosis: "Sốt xuất huyết Dengue", date: "20/05/2023", facility: "79010 • Khỏi" }
]

const mockNextHealthOrders = [
  { id: "ORD-NX-99", date: "10/11/2023", items: ["HIV Combo", "Syphilis RPR"], doctor: "Dr. Vo" },
  { id: "ORD-NX-88", date: "05/06/2023", items: ["General Wellness Panel"], doctor: "Dr. Tran" }
]

// --- COMPONENT: IDENTITY CARD (MATCHING SCREENSHOT) ---
function IdentityVerificationCard({ data, scanStep, onClear, onInternalHistoryClick, internalAccess }: any) {
    if (!data.name && scanStep === "idle") return null
    const isComplete = scanStep === "complete"
    
    return (
      <div className="mb-6 animate-in fade-in slide-in-from-top-4 font-sans">
        <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
           {/* Header - Green to match screenshot */}
           <div className={cn("px-4 py-3 flex justify-between text-white text-sm font-bold uppercase tracking-wide", isComplete ? "bg-[#009860]" : "bg-blue-600")}>
               <div className="flex items-center gap-2">
                   {isComplete ? <CheckCircle2 className="h-5 w-5" /> : <Loader2 className="h-4 w-4 animate-spin"/>}
                   <span>{isComplete ? "Identity & Insurance Verified" : "Processing..."}</span>
               </div>
               {isComplete && <button onClick={onClear}><X className="h-5 w-5 text-white/80 hover:text-white" /></button>}
           </div>

           {/* 3 Columns Content */}
           <div className="p-0 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
              
              {/* COL 1: CCCD */}
              <div className="p-5 space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <User className="h-4 w-4" /> Citizen Identity (CCCD)
                </div>
                <div>
                    <div className="font-bold text-xl text-slate-900 uppercase">{data.name || "SCANNING..."}</div>
                    <div className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5"/> {data.dob} • {data.age} years old
                    </div>
                </div>
                <div>
                    <div className="text-xs text-slate-400 font-bold">Citizen ID Number</div>
                    <div className="font-mono text-lg text-slate-700 font-medium tracking-wide mt-1">{data.citizenId}</div>
                </div>
              </div>

              {/* COL 2: BHYT (INSURANCE) */}
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
                        <div className="text-xs text-slate-500 pt-2 border-t border-dashed mt-2 flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {data.bhyt.hospital}
                        </div>
                    </>
                ) : (
                    <div className="h-32 flex items-center justify-center text-slate-400 italic text-sm">Verifying Insurance...</div>
                )}
              </div>
              
              {/* COL 3: HISTORY (SPLIT VIEW) */}
              <div className="p-5 flex flex-col h-full justify-between bg-slate-50/50">
                
                {/* 3.1: National History (Always Visible per Screenshot) */}
                <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-indigo-500 uppercase tracking-wider">
                        <History className="h-4 w-4" /> Medical History (BHYT)
                    </div>
                    
                    {data.bhyt ? (
                        <div className="space-y-3">
                            {mockBhytHistory.map((item, idx) => (
                                <div key={idx} className="bg-white p-2 rounded border shadow-sm border-l-4 border-l-blue-500">
                                    <div className="flex justify-between items-start">
                                        <div className="font-bold text-sm text-slate-800">{item.diagnosis}</div>
                                        <div className="text-[10px] text-slate-400">{item.date}</div>
                                    </div>
                                    <div className="text-xs text-slate-500 mt-1">{item.facility}</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-2 opacity-50">
                            <div className="h-12 bg-slate-200 rounded animate-pulse"></div>
                            <div className="h-12 bg-slate-200 rounded animate-pulse"></div>
                        </div>
                    )}
                </div>

                {/* 3.2: INTERNAL NeXT Health History (Locked) */}
                <div className="mt-2 pt-3 border-t border-slate-200">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Internal Records (NeXT Health)</span>
                        {internalAccess === 'unlocked' && <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 text-[10px] px-1 py-0 border-emerald-200">Authorized</Badge>}
                    </div>

                    {internalAccess === 'locked' ? (
                        <Button 
                            onClick={onInternalHistoryClick} 
                            disabled={!data.bhyt}
                            variant="outline" 
                            size="sm" 
                            className="w-full h-9 text-xs border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 hover:text-amber-900 border-dashed"
                        >
                            <Lock className="h-3 w-3 mr-2" /> Request Access (OTP)
                        </Button>
                    ) : (
                        <div className="bg-emerald-50 border border-emerald-100 rounded p-2 text-center cursor-pointer hover:bg-emerald-100 transition-colors" onClick={onInternalHistoryClick}>
                            <div className="text-emerald-700 font-bold text-sm flex items-center justify-center gap-2">
                                <FileText className="h-4 w-4"/> View {mockNextHealthOrders.length} Past Orders
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

// --- MAIN PAGE COMPONENT ---
export function ReceptionistView() {
  const { toast } = useToast()
  
  // State: Scan Flow
  const [scanStep, setScanStep] = useState<any>("idle")
  const [scannedIdentity, setScannedIdentity] = useState<any>(null)
  
  // State: Internal History Access
  const [internalAccess, setInternalAccess] = useState<'locked' | 'unlocked'>('locked')
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const [showInternalHistoryModal, setShowInternalHistoryModal] = useState(false)
  const [otpStep, setOtpStep] = useState<'method' | 'verify'>('method')
  const [otpInput, setOtpInput] = useState("")

  // State: Cart (Simplified for demo)
  const [cartCount, setCartCount] = useState(0)

  // HANDLER: Simulate Scan
  const handleScanProcess = () => {
    setScanStep("cccd")
    
    // Simulate API Delay
    setTimeout(() => {
      // Step 1: Basic Info
      const basicData = { 
          name: "TRẦN THỊ NGỌC LAN", 
          dob: "15/05/1992", 
          age: 33,
          citizenId: "079192000123"
      }
      setScannedIdentity(basicData)
      setScanStep("checking-bhyt")
      
      setTimeout(() => {
        // Step 2: Insurance & Gov History Found
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
      }, 1200)
    }, 1000)
  }

  // HANDLER: Internal Access Request
  const handleInternalAccessClick = () => {
      if(internalAccess === 'unlocked') {
          setShowInternalHistoryModal(true)
      } else {
          setShowAuthDialog(true)
          setOtpStep('method')
      }
  }

  const sendOtp = (method: string) => {
      toast({ title: `OTP Sent via ${method}`, description: "Code sent to patient's registered phone." })
      setOtpStep('verify')
  }

  const verifyOtp = () => {
      if(otpInput === "123456") {
          setInternalAccess('unlocked')
          setShowAuthDialog(false)
          setShowInternalHistoryModal(true)
          toast({ title: "Authorized", description: "Internal NeXT Health records unlocked.", className: "bg-emerald-600 text-white" })
      } else {
          toast({ title: "Wrong Code", variant: "destructive" })
      }
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-slate-50 p-6 font-sans">
            <div className="max-w-5xl mx-auto space-y-6">
                
                {/* Header Actions */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Patient Admission</h1>
                        <p className="text-slate-500">Scan card to retrieve National & Internal records</p>
                    </div>
                    <Button 
                        onClick={handleScanProcess} 
                        disabled={scanStep !== 'idle' && scanStep !== 'complete'} 
                        className={cn("min-w-[160px] shadow-lg shadow-blue-900/20", scanStep === 'idle' || scanStep === 'complete' ? "bg-blue-600 hover:bg-blue-700" : "bg-slate-800")}
                    >
                        {scanStep !== 'idle' && scanStep !== 'complete' ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <QrCode className="mr-2 h-4 w-4"/>}
                        {scanStep === 'idle' || scanStep === 'complete' ? "Scan CCCD" : "Scanning..."}
                    </Button>
                </div>

                {/* --- THE REDESIGNED CARD --- */}
                <IdentityVerificationCard 
                    data={scannedIdentity || {}} 
                    scanStep={scanStep} 
                    onClear={() => {setScannedIdentity(null); setScanStep('idle'); setInternalAccess('locked')}}
                    onInternalHistoryClick={handleInternalAccessClick}
                    internalAccess={internalAccess}
                />

                {/* Placeholder for Main Form (Just to show layout) */}
                <div className="grid grid-cols-3 gap-6 opacity-50 blur-[1px] pointer-events-none select-none">
                     <div className="col-span-2 h-64 bg-white rounded-xl border border-dashed border-slate-300 flex items-center justify-center text-slate-400">Clinical Intake Form</div>
                     <div className="h-64 bg-white rounded-xl border border-dashed border-slate-300 flex items-center justify-center text-slate-400">Vitals</div>
                </div>
            </div>

            {/* --- DIALOG 1: OTP AUTH FOR NEXT HEALTH ORDERS --- */}
            <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2"><Lock className="h-5 w-5 text-amber-500"/> NeXT Health Privacy Protocol</DialogTitle>
                        <DialogDescription>
                            To view <b>internal orders</b> placed at this clinic, the patient must authorize access via OTP.
                        </DialogDescription>
                    </DialogHeader>

                    {otpStep === 'method' ? (
                        <div className="grid grid-cols-2 gap-4 py-4">
                            <button className="p-4 border rounded-xl hover:bg-blue-50 hover:border-blue-500 transition-all group text-left" onClick={() => sendOtp('Zalo')}>
                                <div className="text-blue-600 font-bold text-lg mb-1 group-hover:scale-110 transition-transform origin-left">Zalo</div>
                                <div className="text-xs text-slate-500">Instant message</div>
                            </button>
                            <button className="p-4 border rounded-xl hover:bg-slate-50 hover:border-slate-500 transition-all group text-left" onClick={() => sendOtp('SMS')}>
                                <div className="text-slate-700 font-bold text-lg mb-1 group-hover:scale-110 transition-transform origin-left flex items-center gap-2"><Smartphone className="h-4 w-4"/> SMS</div>
                                <div className="text-xs text-slate-500">Carrier charge applies</div>
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6 py-2">
                            <div className="text-center">
                                <Label className="text-slate-500 mb-2 block">Enter verification code</Label>
                                <Input 
                                    className="text-center text-3xl tracking-[0.5em] font-mono h-14 border-slate-300 focus:border-emerald-500 focus:ring-emerald-500" 
                                    maxLength={6} 
                                    placeholder="••••••" 
                                    value={otpInput}
                                    onChange={e => setOtpInput(e.target.value)}
                                />
                            </div>
                            <Button onClick={verifyOtp} className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 text-lg">
                                <Unlock className="h-4 w-4 mr-2" /> Unlock Records
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* --- DIALOG 2: INTERNAL HISTORY LIST --- */}
            <Dialog open={showInternalHistoryModal} onOpenChange={setShowInternalHistoryModal}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-emerald-700">
                            <ShieldCheck className="h-5 w-5"/> Prior NeXT Health Orders
                        </DialogTitle>
                        <DialogDescription>
                            Orders placed specifically at this clinic facility.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 py-2 max-h-[60vh] overflow-y-auto">
                        {mockNextHealthOrders.map((order, i) => (
                            <div key={i} className="flex justify-between items-center p-4 border rounded-lg hover:bg-slate-50 group transition-colors">
                                <div>
                                    <div className="font-bold text-slate-800">{order.date}</div>
                                    <div className="text-xs text-slate-500 mb-2">Ref: {order.id} • {order.doctor}</div>
                                    <div className="flex gap-2">
                                        {order.items.map(t => (
                                            <span key={t} className="px-2 py-0.5 bg-white border rounded text-[10px] uppercase font-semibold text-slate-600 shadow-sm">{t}</span>
                                        ))}
                                    </div>
                                </div>
                                <Button size="sm" variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50" onClick={() => {setShowInternalHistoryModal(false); toast({title: "Added to Cart"})}}>
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