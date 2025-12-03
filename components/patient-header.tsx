"use client"

import { useState, useRef } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Activity,
  Video,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Maximize2,
  Mic,
  MicOff,
  Minimize2,
  VideoOff,
  User,
  X,
  GripHorizontal,
  Plus,
  Settings,
  Pill,
  AlertTriangle,
  History,
  FileWarning,
  ChevronDown
} from "lucide-react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { cn } from "@/lib/utils"
import Draggable from "react-draggable"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu"

// --- Mock Data Types ---
type UnitSystem = "US" | "SI"

interface Interaction {
  severity: "High" | "Moderate" | "Low"
  description: string
}

interface MedicalProfile {
  conditions: string[]
  pastHistory: string[]
  interactions: Interaction[]
  allergies: string[]
}

// --- Mock Data ---
const MOCK_PROFILE: MedicalProfile = {
  conditions: ["Hypertension (Primary)", "T2 Diabetes", "Hyperlipidemia"],
  pastHistory: ["Appendectomy (2015)", "Gestational Diabetes (2018)", "Former Smoker"],
  allergies: ["Penicillin", "Latex"],
  interactions: [
    { severity: "High", description: "Lisinopril + Potassium Supplements (Hyperkalemia Risk)" },
    { severity: "Moderate", description: "Metformin + Contrast Media" }
  ]
}

interface PatientHeaderProps {
  onPrescribe?: () => void
  unitSystem?: UnitSystem
  onUnitChange?: (system: UnitSystem) => void
  patientName?: string
  patientAge?: number
  patientGender?: string
}

export function PatientHeader({
  onPrescribe,
  unitSystem = "US",
  onUnitChange,
  patientName = "Sarah Johnson",
  patientAge = 42,
  patientGender = "Female",
}: PatientHeaderProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [showContent, setShowContent] = useState(false)
  const [isCallActive, setIsCallActive] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const nodeRef = useRef(null)

  const handleSummarize = () => {
    setIsGenerating(true)
    setShowContent(false)
    setTimeout(() => {
      setIsGenerating(false)
      setShowContent(true)
    }, 2000)
  }

  // Helper to determine alert level color
  const getInteractionColor = (interactions: Interaction[]) => {
    if (interactions.some(i => i.severity === "High")) return "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800 animate-pulse"
    if (interactions.length > 0) return "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300"
    return "bg-green-50 text-green-700 border-green-200"
  }

  return (
    // Sticky Header Container
    <div className="sticky top-0 z-50 w-full flex flex-col bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b shadow-sm">
      
      {/* TOP ROW: Identity & Controls */}
      <div className="px-6 py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 w-full">
        {/* Left: Avatar & Name */}
        <div className="flex items-center gap-4 shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="w-14 h-14 cursor-pointer hover:ring-2 ring-primary/20 transition-all">
                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                  {patientName.split(" ").map(n => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel>System Preferences</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup value={unitSystem} onValueChange={(val) => onUnitChange?.(val as UnitSystem)}>
                <DropdownMenuRadioItem value="US">US Units (mg/dL)</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="SI">SI Units (mmol/L)</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold tracking-tight">{patientName}</h1>
              {/* AI Summary Sheet Trigger */}
              <Sheet>
                  <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
                    <SheetHeader>
                      <SheetTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-400">
                        <Sparkles className="h-5 w-5" />
                        AI Health Summary
                      </SheetTitle>
                      <SheetDescription>
                        Comprehensive analysis based on {patientName}'s recent vitals, lab results, and clinical
                        history.
                      </SheetDescription>
                    </SheetHeader>

                    <div className="mt-8">
                      {isGenerating ? (
                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                          <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                          <p className="text-sm text-muted-foreground animate-pulse">Analyzing patient data...</p>
                        </div>
                      ) : showContent ? (
                        <div className="space-y-6">
                          {/* Key Findings */}
                          <div className="space-y-3">
                            <h3 className="font-semibold flex items-center gap-2">
                              <Activity className="h-4 w-4 text-blue-500" />
                              Key Findings
                            </h3>
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-sm space-y-2">
                              <p>• Blood pressure is slightly elevated (132/87) compared to last visit.</p>
                              <p>• Thyroid markers indicate stable function with medication.</p>
                              <p>• Vitamin D levels have improved and are now within optimal range.</p>
                            </div>
                          </div>

                          {/* Risk Assessment */}
                          <div className="space-y-3">
                            <h3 className="font-semibold flex items-center gap-2">
                              <AlertCircle className="h-4 w-4 text-orange-500" />
                              Risk Assessment
                            </h3>
                            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg text-sm space-y-2">
                              <p>
                                • <span className="font-medium">Cardiovascular:</span> Moderate risk due to elevated BP
                                and family history.
                              </p>
                              <p>
                                • <span className="font-medium">Metabolic:</span> Low risk. Glucose levels are optimal.
                              </p>
                            </div>
                          </div>

                          {/* Recommendations */}
                          <div className="space-y-3">
                            <h3 className="font-semibold flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                              Suggested Actions
                            </h3>
                            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-sm space-y-2">
                              <p>1. Continue current Levothyroxine dosage (88mcg).</p>
                              <p>2. Schedule follow-up BP check in 2 weeks.</p>
                              <p>3. Recommend lifestyle modifications for stress management.</p>
                            </div>
                          </div>

                          <div className="pt-4 border-t">
                            <p className="text-xs text-muted-foreground italic">
                              Generated by AI Assistant. Please review all findings clinically.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center space-y-4 text-muted-foreground">
                          <Sparkles className="h-12 w-12 text-muted-foreground/20" />
                          <p>Click the button to generate a new summary.</p>
                          <Button onClick={handleSummarize} variant="outline" className="gap-2">
                            Generate Summary
                          </Button>
                        </div>
                      )}
                    </div>
                  </SheetContent>
              </Sheet>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
               <span className="font-medium text-foreground">{patientAge} yrs</span>
               <span className="text-xs text-muted-foreground mx-1">|</span>
               <span className="font-medium text-foreground">{patientGender}</span>
               <span className="text-xs text-muted-foreground mx-1">|</span>
               <span>DOB: 04/12/1981</span>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3 shrink-0">
          <Button variant="outline" size="sm" className="gap-2 border-dashed" onClick={onPrescribe}>
            <Plus className="h-4 w-4" />
            Orders
          </Button>

          {/* Telehealth Logic (unchanged from your snippet) */}
          <Dialog open={isCallActive} onOpenChange={setIsCallActive}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                  <Video className="h-4 w-4" />
                  Connect
                </Button>
              </DialogTrigger>
              <DialogContent
                className={cn(
                  "p-0 gap-0 transition-all duration-300 ease-in-out border-none bg-transparent shadow-none overflow-visible sm:max-w-none w-auto h-auto",
                )}
                onInteractOutside={(e) => e.preventDefault()}
              >
                <Draggable
                  nodeRef={nodeRef}
                  handle=".drag-handle"
                  defaultPosition={{ x: 0, y: 0 }}
                  position={isExpanded ? { x: 0, y: 0 } : undefined}
                  onStop={(e, data) => !isExpanded && setPosition({ x: data.x, y: data.y })}
                  disabled={isExpanded}
                >
                  <div
                    ref={nodeRef}
                    className={cn(
                      "bg-[#1f1f1f] text-white overflow-hidden shadow-2xl rounded-lg flex flex-col",
                      isExpanded ? "fixed inset-4 w-auto h-auto z-[100]" : "w-[400px] h-[350px] relative",
                    )}
                  >
                    {/* Top Bar */}
                    <div className="flex items-start justify-between mb-4 drag-handle cursor-move p-4 pb-0">
                      <div className="text-sm font-medium text-zinc-300 tracking-wide select-none">00:37</div>
                      <div className="absolute left-1/2 -translate-x-1/2 top-4 text-zinc-500">
                        <GripHorizontal className="h-4 w-4" />
                      </div>
                      <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
                        onPointerDown={(e) => e.stopPropagation()}
                      >
                        {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                      </button>
                    </div>

                    <div className="flex items-center justify-end gap-4 mb-8 px-4">
                      <button className="text-white hover:text-zinc-300 transition-colors">
                        <VideoOff className="h-5 w-5" />
                      </button>
                      <button
                        className={cn("transition-colors", isMuted ? "text-red-500" : "text-white hover:text-zinc-300")}
                        onClick={() => setIsMuted(!isMuted)}
                      >
                        {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                      </button>
                      <button
                        className="bg-red-500/20 hover:bg-red-500/40 text-red-500 rounded-md p-1 transition-colors border border-red-500/50"
                        onClick={() => setIsCallActive(false)}
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="flex-1 flex items-center justify-center pb-8">
                      <div className="w-24 h-24 rounded-full bg-zinc-200 flex items-center justify-center overflow-hidden">
                        <User className="h-12 w-12 text-zinc-400" />
                      </div>
                    </div>
                  </div>
                </Draggable>
              </DialogContent>
            </Dialog>
        </div>
      </div>

      {/* BOTTOM ROW: The "Frieze Pane" Clinical Snapshot */}
      {/* This section stays visible to provide context while scrolling */}
      <div className="flex items-stretch border-t bg-muted/30 min-h-[52px]">
        
        {/* 1. SAFETY ALERTS / PHARMA INTERACTIONS */}
        <HoverCard openDelay={200}>
          <HoverCardTrigger asChild>
            <div className={cn(
                "flex items-center gap-3 px-6 py-2 border-r cursor-help transition-colors",
                getInteractionColor(MOCK_PROFILE.interactions)
              )}>
              <FileWarning className="h-5 w-5 shrink-0" />
              <div className="flex flex-col">
                <span className="text-xs font-bold uppercase tracking-wider">Safety Alerts</span>
                <span className="text-sm font-semibold leading-none">
                  {MOCK_PROFILE.interactions.length} Drug Interactions
                </span>
              </div>
            </div>
          </HoverCardTrigger>
          <HoverCardContent className="w-80 p-0" align="start">
            <div className="bg-destructive text-destructive-foreground p-3 font-semibold flex items-center gap-2">
               <AlertTriangle className="h-4 w-4" />
               Potential Liabilities
            </div>
            <div className="p-4 space-y-3">
              {MOCK_PROFILE.interactions.map((int, i) => (
                <div key={i} className="flex gap-3 items-start text-sm">
                   <div className={cn("mt-1 h-2 w-2 rounded-full shrink-0", int.severity === "High" ? "bg-red-500" : "bg-orange-400")} />
                   <div>
                     <span className={cn("font-bold text-xs border px-1 rounded mr-2", int.severity === "High" ? "border-red-500 text-red-500" : "border-orange-500 text-orange-500")}>
                        {int.severity}
                     </span>
                     <span>{int.description}</span>
                   </div>
                </div>
              ))}
              <div className="border-t pt-2 mt-2">
                 <p className="text-xs font-semibold text-muted-foreground">Allergies:</p>
                 <div className="flex flex-wrap gap-1 mt-1">
                    {MOCK_PROFILE.allergies.map(alg => (
                       <Badge key={alg} variant="outline" className="text-red-600 border-red-200 bg-red-50">
                          {alg}
                       </Badge>
                    ))}
                 </div>
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>

        {/* 2. ACTIVE CONDITIONS */}
        <HoverCard openDelay={200}>
          <HoverCardTrigger asChild>
            <div className="flex flex-1 items-center gap-3 px-6 py-2 border-r hover:bg-muted/50 transition-colors cursor-pointer group">
              <Activity className="h-4 w-4 text-blue-500" />
              <div className="flex flex-col">
                 <span className="text-xs text-muted-foreground font-medium group-hover:text-foreground">Active Conditions</span>
                 <div className="flex gap-2 mt-0.5 overflow-hidden h-6">
                    {MOCK_PROFILE.conditions.slice(0, 3).map(c => (
                       <Badge key={c} variant="secondary" className="px-1.5 py-0 text-[10px] h-5 whitespace-nowrap">
                          {c}
                       </Badge>
                    ))}
                    {MOCK_PROFILE.conditions.length > 3 && (
                       <span className="text-xs text-muted-foreground">+{MOCK_PROFILE.conditions.length - 3}</span>
                    )}
                 </div>
              </div>
            </div>
          </HoverCardTrigger>
          <HoverCardContent className="w-72">
             <div className="flex items-center gap-2 mb-3">
                <Activity className="h-4 w-4 text-blue-500" />
                <h4 className="font-semibold text-sm">Problem List</h4>
             </div>
             <ul className="space-y-2">
                {MOCK_PROFILE.conditions.map(c => (
                   <li key={c} className="text-sm flex items-center justify-between border-b pb-1 last:border-0">
                      <span>{c}</span>
                      <span className="text-[10px] bg-blue-100 text-blue-700 px-1 rounded">Active</span>
                   </li>
                ))}
             </ul>
          </HoverCardContent>
        </HoverCard>

        {/* 3. MEDICAL HISTORY SUMMARY */}
        <HoverCard openDelay={200}>
          <HoverCardTrigger asChild>
             <div className="hidden lg:flex items-center gap-3 px-6 py-2 hover:bg-muted/50 transition-colors cursor-pointer">
                <History className="h-4 w-4 text-muted-foreground" />
                <div className="flex flex-col">
                   <span className="text-xs text-muted-foreground font-medium">History Highlights</span>
                   <span className="text-sm truncate max-w-[200px] text-foreground/80">
                      {MOCK_PROFILE.pastHistory[0]}, {MOCK_PROFILE.pastHistory[1]}...
                   </span>
                </div>
                <ChevronDown className="h-3 w-3 text-muted-foreground ml-auto" />
             </div>
          </HoverCardTrigger>
          <HoverCardContent align="end" className="w-80">
             <div className="flex items-center gap-2 mb-3">
                <History className="h-4 w-4 text-muted-foreground" />
                <h4 className="font-semibold text-sm">Past Medical History</h4>
             </div>
             <ul className="space-y-2 text-sm text-muted-foreground">
                {MOCK_PROFILE.pastHistory.map((h, i) => (
                   <li key={i} className="flex items-start gap-2">
                      <span className="block mt-1.5 w-1 h-1 rounded-full bg-zinc-400" />
                      {h}
                   </li>
                ))}
             </ul>
          </HoverCardContent>
        </HoverCard>

      </div>
    </div>
  )
}
