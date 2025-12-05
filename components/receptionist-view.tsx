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
    Activity,
    AlertTriangle,
    ArrowRight,
    Baby,
    Beaker,
    CalendarClock,
    Camera,
    Check,
    CheckCircle2,
    Clock,
    CreditCard,
    Edit2,
    Eye,
    FileSignature,
    FileText,
    Filter,
    FlaskConical,
    Globe,
    HeartPulse,
    History,
    Image as ImageIcon,
    Loader2,
    Lock,
    Mail,
    MapPin,
    Phone,
    Plus,
    PlusCircle,
    QrCode,
    RefreshCw,
    Save,
    Scale,
    ScanLine,
    Search,
    Shield,
    ShieldCheck,
    ShoppingCart,
    Siren,
    Sparkles,
    Stethoscope,
    Thermometer,
    Trash2,
    Unlock,
    User,
    Users,
    Video,
    Wallet,
    X,
    Wind,
    Zap,
} from "lucide-react";
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

export interface PrivateInsuranceData {
  id: string; // Unique ID for list management
  provider: string;
  policyNumber: string;
  expiryDate: string;
  frontImg: string | null;
  backImg: string | null;
  estimatedCoverage: number;
}

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

// --- UTILS: VIETQR PARSING LOGIC (CLIENT SIDE) ---

const BANK_BIN_MAP: Record<string, string> = {
    "970436": "vcb", // Vietcombank
    "970407": "tcb", // Techcombank
    "970415": "ctg", // VietinBank
    "970418": "bidv", // BIDV
    "970422": "mb",   // MB Bank
    "970403": "stb",  // Sacombank
    "970423": "tpb",  // TPBank
    // Add more BINs as needed
};



// --- MOCK DATA: 2025 REFORM STRUCTURE (34 Provinces, No Districts) ---
const NEW_ADMIN_UNITS = {
    provinces: [
        { id: "01", name: "Thủ đô Hà Nội" },
        { id: "02", name: "Tỉnh Hải Đông" }, // Example: Merged Hai Duong + Quang Ninh
        { id: "03", name: "Tỉnh Lào Cai" },  // Example: Merged Lao Cai + Yen Bai
        { id: "04", name: "Tỉnh Bắc Thái" }, // Example: Merged Thai Nguyen + Bac Kan
    ],
    // In a real app, fetch this via API based on provinceId
    communes: {
        "01": [
            { id: "1001", name: "Phường Ba Đình" },
            { id: "1002", name: "Phường Hoàn Kiếm" },
            { id: "1003", name: "Xã Bát Tràng" }
        ],
        "02": [
            { id: "2001", name: "Phường Hồng Gai" },
            { id: "2002", name: "Xã Bạch Đằng" }
        ],
        // ... handle other IDs
    } as Record<string, { id: string; name: string }[]>
};



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
                    <User className="h-4 w-4" /> Patient Identification & Insurance
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="grid grid-cols-1 md:grid-cols-2 divide-x divide-slate-100">
                    {/* LEFT: SCAN ACTION */}
                    <div className="p-6 flex flex-col items-center justify-center space-y-4 text-center">
                        <div className="h-14 w-14 bg-blue-50 rounded-full flex items-center justify-center mb-1">
                            {scanStep === 'idle' ? <QrCode className="h-7 w-7 text-blue-600" /> : <CheckCircle2 className="h-7 w-7 text-emerald-600" />}
                        </div>
                        {scanStep === 'idle' ? (
                            <>
                                <Button onClick={onScanComplete} className="bg-blue-600 hover:bg-blue-700 w-full max-w-xs shadow-md">
                                    <ScanLine className="mr-2 h-4 w-4" /> Scan CCCD Chip
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
                            {scanStep === 'checking-bhyt' && <Loader2 className="h-3 w-3 animate-spin text-blue-500" />}
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
                                <div className="pt-2 border-t border-slate-200">
                                    {internalAccess === 'locked' ? (
                                        <Button onClick={onInternalHistoryClick} variant="outline" size="sm" className="w-full h-7 text-xs border-amber-300 bg-amber-50 text-amber-800 border-dashed">
                                            <Lock className="h-3 w-3 mr-2" /> Unlock History
                                        </Button>
                                    ) : (
                                        <div className="text-center text-xs text-emerald-600 font-bold flex items-center justify-center gap-1">
                                            <History className="h-3 w-3" /> History Unlocked
                                        </div>
                                    )}
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

function DemographicsCard({ formData, setFormData, onCheckBHYT }: any) {

    // Logic: Get list of communes based on selected Province
    const availableCommunes = useMemo(() => {
        if (!formData.provinceId) return [];
        return NEW_ADMIN_UNITS.communes[formData.provinceId] || [];
    }, [formData.provinceId]);

    const handleProvinceChange = (val: string) => {
        setFormData({
            ...formData,
            provinceId: val,
            communeId: "", // CRITICAL: Reset commune when province changes
        });
    };

    return (
        <Card className="border-t-4 border-t-slate-500 shadow-sm h-full">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm uppercase text-slate-600 flex items-center gap-2">
                    <FileText className="h-4 w-4" /> Demographics
                </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-3">
                {/* Full Name */}
                <div className="space-y-1">
                    <Label className="text-xs text-slate-500">Full Name</Label>
                    <Input
                        value={formData.fullName}
                        onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                        className="font-bold uppercase"
                        placeholder="NGUYEN VAN A"
                    />
                </div>

                {/* ID / Passport */}
                <div className="space-y-1">
                    <Label className="text-xs text-slate-500">ID / Passport</Label>
                    <div className="flex gap-2">
                        <Input
                            value={formData.citizenId}
                            onChange={e => setFormData({ ...formData, citizenId: e.target.value })}
                            className="font-mono"
                            placeholder="079..."
                        />
                        <Button onClick={onCheckBHYT} variant="secondary" className="whitespace-nowrap bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200">
                            Check BHYT
                        </Button>
                    </div>
                </div>

                {/* DOB & Gender */}
                <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                        <Label className="text-xs text-slate-500">DOB</Label>
                        <Input
                            value={formData.dob}
                            onChange={e => setFormData({ ...formData, dob: e.target.value })}
                            placeholder="DD/MM/YYYY"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs text-slate-500">Gender</Label>
                        <Select value={formData.gender} onValueChange={(val) => setFormData({ ...formData, gender: val })}>
                            <SelectTrigger className="h-10"><SelectValue placeholder="Select" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Phone */}
                <div className="space-y-1">
                    <Label className="text-xs text-slate-500 flex items-center gap-1"><Phone className="h-3 w-3" /> Phone</Label>
                    <div className="flex gap-2">
                        <Select value={formData.phonePrefix} onValueChange={(val) => setFormData({ ...formData, phonePrefix: val })}>
                            <SelectTrigger className="w-[80px]"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="+84">🇻🇳 +84</SelectItem>
                                <SelectItem value="+1">🇺🇸 +1</SelectItem>
                                {/* Add other codes */}
                            </SelectContent>
                        </Select>
                        <Input
                            value={formData.phone}
                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="909 123 456"
                            className="flex-1"
                        />
                    </div>
                </div>

                {/* Email */}
                <div className="space-y-1">
                    <Label className="text-xs text-slate-500 flex items-center gap-1"><Mail className="h-3 w-3" /> Email</Label>
                    <Input
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        placeholder="abc@email.com"
                    />
                </div>

                {/* --- NEW ADMINISTRATIVE ADDRESS STRUCTURE (2-TIER) --- */}
                <div className="space-y-2 pt-1 border-t border-dashed border-slate-200">
                    <Label className="text-xs text-slate-500 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        Current Address (New 2025 Standard)
                    </Label>

                    {/* Tier 1 & Tier 2: Province & Commune (No District) */}
                    <div className="grid grid-cols-2 gap-2">
                        {/* Dropdown 1: Province */}
                        <Select value={formData.provinceId} onValueChange={handleProvinceChange}>
                            <SelectTrigger className="h-10 bg-slate-50">
                                <SelectValue placeholder="Province / City" />
                            </SelectTrigger>
                            <SelectContent>
                                {NEW_ADMIN_UNITS.provinces.map(prov => (
                                    <SelectItem key={prov.id} value={prov.id}>{prov.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Dropdown 2: Commune (Filtered by Province) */}
                        <Select
                            value={formData.communeId}
                            onValueChange={(val) => setFormData({ ...formData, communeId: val })}
                            disabled={!formData.provinceId} // Disable until province selected
                        >
                            <SelectTrigger className="h-10 bg-slate-50">
                                <SelectValue placeholder="Commune / Ward" />
                            </SelectTrigger>
                            <SelectContent>
                                {availableCommunes.map(comm => (
                                    <SelectItem key={comm.id} value={comm.id}>{comm.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Street Name / House Number */}
                    <Input
                        value={formData.address}
                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                        placeholder="House No, Street Name..."
                        className="h-10"
                    />
                </div>

            </CardContent>
        </Card>
    )
}

// Simple EMVCo TLV Parser
const parseVietQR = (qrString: string) => {
    try {
        let index = 0;
        const result: any = {};

        while (index < qrString.length) {
            const id = qrString.substring(index, index + 2);
            const length = parseInt(qrString.substring(index + 2, index + 4));
            const value = qrString.substring(index + 4, index + 4 + length);

            // ID 38 is the Merchant Account Information (The Payload)
            if (id === "38") {
                // Parse Sub-tags inside Tag 38
                let subIndex = 0;
                while (subIndex < value.length) {
                    const subId = value.substring(subIndex, subIndex + 2);
                    const subLen = parseInt(value.substring(subIndex + 2, subIndex + 4));
                    const subVal = value.substring(subIndex + 4, subIndex + 4 + subLen);

                    // Sub-tag 01 contains BIN and Account Number
                    if (subId === "01") {
                        let infoIndex = 0;
                        while (infoIndex < subVal.length) {
                            const infoId = subVal.substring(infoIndex, infoIndex + 2);
                            const infoLen = parseInt(subVal.substring(infoIndex + 2, infoIndex + 4));
                            const infoVal = subVal.substring(infoIndex + 4, infoIndex + 4 + infoLen);

                            if (infoId === "00") result.bin = infoVal; // Bank BIN
                            if (infoId === "01") result.accountNumber = infoVal; // Account No

                            infoIndex += 4 + infoLen;
                        }
                    }
                    subIndex += 4 + subLen;
                }
            }
            index += 4 + length;
        }
        return result;
    } catch (e) {
        console.error("Invalid QR format", e);
        return null;
    }
};

// --- COMPONENT: FINANCIAL INFO ---

export function FinancialInfoCard({ data, setData }: any) {
    const [isScanning, setIsScanning] = useState(false);
    const [scanInput, setScanInput] = useState("");
    const [scanError, setScanError] = useState("");

    const handleSimulateScan = () => {
        setScanError("");

        // Ensure you have these utility functions available in your project
        // If not, this logic will need to be adjusted to your specific parser
        const parsed = parseVietQR(scanInput);

        if (parsed && parsed.bin && parsed.accountNumber) {
            const bankCode = BANK_BIN_MAP[parsed.bin];

            if (bankCode) {
                // Update Parent State
                setData({
                    ...data,
                    bankName: bankCode,
                    bankAccount: parsed.accountNumber
                });
                setIsScanning(false); // Close modal
                setScanInput(""); // Reset input
            } else {
                setScanError(`Bank BIN ${parsed.bin} not supported in this demo.`);
            }
        } else {
            setScanError("Could not find Bank/Account info in this string.");
        }
    };

    // Sample string from your prompt for easy testing
    const sampleString = "00020101021138570010A00000072701270006970436011305010001005230208QRIBFTTA53037045802VN630462A5";

    return (
        <Card className="border-t-4 border-t-emerald-600 shadow-sm h-full relative overflow-hidden">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm uppercase text-emerald-700 flex items-center gap-2">
                    <Wallet className="h-4 w-4" /> Financial & Refund
                </CardTitle>
            </CardHeader>

            <CardContent>
                <div className="space-y-3">
                    {/* Scan Button Trigger */}
                    <Button
                        variant="secondary"
                        className="w-full h-8 text-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                        onClick={() => setIsScanning(true)}
                    >
                        <QrCode className="h-3 w-3 mr-2" /> Scan VietQR Code
                    </Button>

                    <div className="space-y-1">
                        <Label className="text-xs text-slate-500">Bank Name</Label>
                        <Select value={data.bankName} onValueChange={(v) => setData({ ...data, bankName: v })}>
                            <SelectTrigger className="h-8"><SelectValue placeholder="Select Bank" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="vcb">Vietcombank</SelectItem>
                                <SelectItem value="tcb">Techcombank</SelectItem>
                                <SelectItem value="ctg">VietinBank</SelectItem>
                                <SelectItem value="bidv">BIDV</SelectItem>
                                <SelectItem value="mb">MB Bank</SelectItem>
                                <SelectItem value="tpb">TPBank</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1">
                        <Label className="text-xs text-slate-500">Account No.</Label>
                        <Input
                            placeholder="0071000..."
                            value={data.bankAccount}
                            onChange={e => setData({ ...data, bankAccount: e.target.value })}
                            className="h-8"
                        />
                    </div>
                </div>
            </CardContent>

            {/* --- SIMULATED SCANNER OVERLAY --- */}
            {isScanning && (
                <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-10 flex flex-col p-4 animate-in fade-in duration-200">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-bold flex items-center gap-2"><QrCode className="h-4 w-4" /> Simulator</h3>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setIsScanning(false)}><X className="h-4 w-4" /></Button>
                    </div>

                    <div className="flex-1 flex flex-col gap-3">
                        <div className="text-[11px] text-slate-500">
                            Since there is no camera, paste the RAW string below.
                        </div>

                        <textarea
                            className="w-full h-24 text-[10px] p-2 border rounded bg-slate-50 font-mono resize-none"
                            placeholder="Paste VietQR String here..."
                            value={scanInput}
                            onChange={(e) => setScanInput(e.target.value)}
                        />

                        {scanError && <div className="text-[10px] text-red-500 font-medium">{scanError}</div>}

                        <div className="grid grid-cols-2 gap-2 mt-auto">
                            <Button variant="outline" size="sm" className="text-xs h-8" onClick={() => setScanInput(sampleString)}>
                                Paste Sample
                            </Button>
                            <Button size="sm" className="text-xs h-8 bg-emerald-600 hover:bg-emerald-700" onClick={handleSimulateScan}>
                                Process <ArrowRight className="h-3 w-3 ml-1" />
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </Card>
    )
}

export function PrivateInsuranceManager() {
  // Initialize with one empty card
  const [insurances, setInsurances] = useState<PrivateInsuranceData[]>([
    {
      id: "init-" + Math.random().toString(36).substr(2, 9),
      provider: "",
      policyNumber: "",
      expiryDate: "",
      frontImg: null,
      backImg: null,
      estimatedCoverage: 0.0,
    },
  ]);

  // Add a new empty card
  const addInsurance = () => {
    const newCard: PrivateInsuranceData = {
      id: "new-" + Math.random().toString(36).substr(2, 9),
      provider: "",
      policyNumber: "",
      expiryDate: "",
      frontImg: null,
      backImg: null,
      estimatedCoverage: 0.0,
    };
    setInsurances([...insurances, newCard]);
  };

  // Update a specific card by ID
  const updateInsurance = (id: string, updatedData: PrivateInsuranceData) => {
    setInsurances((prev) =>
      prev.map((item) => (item.id === id ? updatedData : item))
    );
  };

  // Remove a specific card by ID
  const removeInsurance = (id: string) => {
    setInsurances((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="w-full space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">
          Private Insurance Policies ({insurances.length})
        </h3>
      </div>

      <div className="space-y-4">
        {insurances.map((insurance) => (
          <PrivateInsuranceCard
            key={insurance.id}
            data={insurance}
            canDelete={insurances.length > 0} // Allow deleting even the last one if you want, or change to > 1
            onChange={(newData) => updateInsurance(insurance.id, newData)}
            onDelete={() => removeInsurance(insurance.id)}
          />
        ))}
      </div>

      {/* Add Button */}
      <Button
        variant="outline"
        onClick={addInsurance}
        className="w-full border-dashed border-2 h-12 text-slate-500 hover:text-sky-600 hover:border-sky-500 hover:bg-sky-50 transition-all"
      >
        <Plus className="mr-2 h-4 w-4" /> Add Another Policy
      </Button>
    </div>
  );
}

interface CardProps {
  data: PrivateInsuranceData;
  onChange: (d: PrivateInsuranceData) => void;
  onDelete: () => void;
  canDelete: boolean;
}

export function PrivateInsuranceCard({ data, onChange, onDelete, canDelete }: CardProps) {
  const { toast } = useToast();
  const [isScanning, setIsScanning] = useState(false);

  // Simulate scanning specifically for this card
  const handleScanCard = () => {
    if (data.frontImg) return; // Prevent rescanning if already done (optional)

    setIsScanning(true);
    
    setTimeout(() => {
      setIsScanning(false);
      
      // Update ONLY this card's data
      onChange({
        ...data,
        provider: "Bao Viet Insurance",
        policyNumber: `BV-${Math.floor(Math.random() * 9000) + 1000}-X`, // Randomize slightly for effect
        expiryDate: "2025-12-31",
        frontImg: "captured-front-hash",
        backImg: "captured-back-hash",
        estimatedCoverage: 0.8,
      });

      toast({ 
        title: "Policy Detected", 
        description: "Insurance details have been auto-filled." 
      });
    }, 1500);
  };

  return (
    <Card className="group border-t-4 border-t-sky-500 bg-white shadow-sm hover:shadow-md transition-all animate-in fade-in slide-in-from-bottom-2">
      {/* Header */}
      <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
        <CardTitle className="text-sm uppercase flex items-center gap-2 text-sky-600">
          <Shield className="h-4 w-4" />
          {data.provider ? data.provider : "New Policy"}
        </CardTitle>

        {canDelete && (
          <Button
            size="icon"
            variant="ghost"
            onClick={onDelete}
            className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 -mr-2"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {/* Camera / Scan Buttons */}
        <div className="grid grid-cols-2 gap-3">
          {/* Front Image Area */}
          <button
            onClick={handleScanCard}
            disabled={isScanning || !!data.frontImg}
            className={cn(
              "h-20 rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-1 transition-all relative overflow-hidden",
              data.frontImg
                ? "border-sky-500 bg-sky-50"
                : "border-slate-300 hover:border-sky-400 hover:bg-slate-50"
            )}
          >
            {isScanning ? (
              <div className="flex flex-col items-center animate-pulse">
                <div className="h-5 w-5 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mb-1"/>
                <span className="text-[10px] font-bold text-sky-500">SCANNING...</span>
              </div>
            ) : data.frontImg ? (
              <>
                <CheckCircle2 className="h-5 w-5 text-sky-500 mb-1" />
                <span className="text-[10px] uppercase font-bold text-sky-600">Front OK</span>
              </>
            ) : (
              <>
                <Camera className="h-5 w-5 text-slate-400 mb-1" />
                <span className="text-[10px] uppercase font-bold text-slate-500">Front</span>
              </>
            )}
          </button>

          {/* Back Image Area (Manual or Auto-filled) */}
          <button
            className={cn(
              "h-20 rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-1 transition-all",
              data.backImg ? "border-sky-500 bg-sky-50" : "border-slate-300"
            )}
          >
            {data.backImg ? (
              <>
                <CheckCircle2 className="h-5 w-5 text-sky-500 mb-1" />
                <span className="text-[10px] uppercase font-bold text-sky-600">Back OK</span>
              </>
            ) : (
              <>
                <Camera className="h-5 w-5 text-slate-400 mb-1" />
                <span className="text-[10px] uppercase font-bold text-slate-500">Back</span>
              </>
            )}
          </button>
        </div>

        {/* Text Inputs */}
        <div className="space-y-3">
          <Input
            value={data.provider}
            onChange={(e) => onChange({ ...data, provider: e.target.value })}
            placeholder="Provider (e.g. Bao Viet)"
            className="h-10 text-sm bg-slate-50/50"
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              value={data.policyNumber}
              onChange={(e) => onChange({ ...data, policyNumber: e.target.value })}
              placeholder="Policy #"
              className="h-10 text-sm font-mono bg-slate-50/50"
            />
            <div className="relative">
              <Input
                type="date"
                value={data.expiryDate}
                onChange={(e) => onChange({ ...data, expiryDate: e.target.value })}
                className="h-10 text-sm font-mono bg-slate-50/50 pl-9"
              />
              <CalendarIcon className="h-4 w-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Footer: Coverage Estimate */}
        <div className="flex justify-between items-center pt-2 border-t border-slate-100 mt-2">
          <span className="text-xs font-medium text-slate-500">Est. Coverage</span>
          <div className="flex items-center gap-2">
             <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-sky-500 transition-all duration-500" 
                  style={{ width: `${data.estimatedCoverage * 100}%` }}
                />
             </div>
             <span className="font-bold text-sky-600 text-sm">
                {(data.estimatedCoverage * 100).toFixed(0)}%
             </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}



// --- COMPONENT: RELATED PARTIES ---
export function RelatedPartiesCard() {
    const { toast } = useToast()
    const [scanRelativeStep, setScanRelativeStep] = useState<"idle" | "scanning">("idle")

    // Initial state mocked to match your screenshot
    const [parties, setParties] = useState<any[]>([
        {
            id: '1',
            name: "NGUYỄN THỊ MAI",
            relation: "Wife",
            roleTitle: "SPOUSE",
            phone: "0909111222",
            type: "adult",
            roles: { isEmergency: true, isGuardian: false, isPayer: true }
        },
        {
            id: '2',
            name: "TRẦN MAI ANH",
            relation: "Daughter",
            roleTitle: "CHILD",
            phone: "N/A",
            type: "child",
            roles: { isEmergency: false, isGuardian: false, isPayer: false }
        }
    ])

    const handleManualRelative = () => {
        const newPerson = {
            id: `rel-m-${Math.random()}`,
            name: "NEW PERSON",
            relation: "Relative",
            roleTitle: "OTHER",
            phone: "N/A",
            type: "adult",
            roles: { isEmergency: false, isGuardian: false, isPayer: false }
        };
        setParties(prev => [...prev, newPerson])
    }

    const handleScanRelative = () => {
        setScanRelativeStep("scanning");
        setTimeout(() => {
            setScanRelativeStep("idle");
            const newPerson = {
                id: `rel-${Math.random()}`,
                name: "SCANNED ID NAME",
                relation: "Sibling",
                roleTitle: "BROTHER",
                phone: "0908...",
                type: "adult",
                roles: { isEmergency: false, isGuardian: false, isPayer: false }
            };
            setParties(prev => [...prev, newPerson]);
            toast({ title: "Identity Linked", description: `Added ${newPerson.name}.` })
        }, 1500)
    }

    const toggleRole = (id: string, role: string) => {
        setParties(prev => prev.map(p => {
            if (p.id !== id) return p;
            return { ...p, roles: { ...p.roles, [role]: !p.roles[role] } }
        }))
    }

    const removeParty = (id: string) => {
        setParties(prev => prev.filter(p => p.id !== id));
    }

    return (
        <Card className="border-t-4 border-t-amber-500 shadow-sm bg-white w-full">
            <CardHeader className="pb-3 border-b border-slate-50 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-bold uppercase text-amber-600 flex items-center gap-2">
                    <Users className="h-4 w-4" /> Related Parties & Emergency
                </CardTitle>
                <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={handleManualRelative} className="h-8 text-xs font-semibold text-slate-700 border-slate-300 gap-2">
                        <Plus className="h-3.5 w-3.5" /> Manual
                    </Button>
                    <Button size="sm" onClick={handleScanRelative} disabled={scanRelativeStep === 'scanning'} className="bg-amber-500 hover:bg-amber-600 text-white h-8 text-xs font-semibold gap-2">
                        {scanRelativeStep === 'scanning' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ScanLine className="h-3.5 w-3.5" />}
                        Scan Relative ID
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                {parties.length === 0 ? (
                    <div className="p-10 text-center text-slate-400 text-sm italic">No related parties linked yet.</div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {parties.map(party => (
                            <div key={party.id} className="p-4 flex flex-col xl:flex-row gap-4 xl:items-center justify-between hover:bg-slate-50 transition-colors">

                                {/* Left Side: Avatar & Info */}
                                <div className="flex items-start gap-4">
                                    <div className={cn(
                                        "h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 mt-1",
                                        party.type === 'child' ? "bg-purple-100 text-purple-600" : "bg-blue-100 text-blue-600"
                                    )}>
                                        {party.type === 'child' ? <Baby className="h-6 w-6" /> : party.name.charAt(0)}
                                    </div>

                                    <div className="flex flex-col">
                                        <div className="text-sm font-bold text-slate-800 uppercase flex items-center gap-1.5">
                                            {party.name}
                                            <span className="text-slate-500 text-xs font-semibold normal-case">({party.relation})</span>
                                        </div>
                                        <div className="text-[11px] font-semibold text-slate-500 mt-0.5 uppercase tracking-wide">
                                            {party.roleTitle} <span className="mx-1">•</span> {party.phone}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Side: Role Toggles & Actions */}
                                <div className="flex flex-wrap items-center gap-2 pl-14 xl:pl-0">

                                    {/* Emergency Contact Toggle */}
                                    <button
                                        onClick={() => toggleRole(party.id, 'isEmergency')}
                                        className={cn(
                                            "px-3 py-1.5 rounded border text-[11px] font-bold flex items-center gap-1.5 transition-all",
                                            party.roles.isEmergency
                                                ? "bg-red-50 text-red-600 border-red-200"
                                                : "bg-white text-slate-400 border-slate-200 hover:border-slate-300"
                                        )}
                                    >
                                        <Siren className={cn("h-3.5 w-3.5", party.roles.isEmergency ? "fill-red-100" : "")} />
                                        Emergency Contact
                                        {party.roles.isEmergency && <span className="ml-1 text-red-500">✓</span>}
                                    </button>

                                    {/* Legal Guardian Toggle */}
                                    <button
                                        onClick={() => toggleRole(party.id, 'isGuardian')}
                                        className={cn(
                                            "px-3 py-1.5 rounded border text-[11px] font-bold flex items-center gap-1.5 transition-all",
                                            party.roles.isGuardian
                                                ? "bg-blue-50 text-blue-600 border-blue-200"
                                                : "bg-white text-slate-400 border-slate-200 hover:border-slate-300"
                                        )}
                                    >
                                        <FileSignature className="h-3.5 w-3.5" />
                                        Legal Guardian
                                    </button>

                                    {/* Bill Payer Toggle */}
                                    <button
                                        onClick={() => toggleRole(party.id, 'isPayer')}
                                        className={cn(
                                            "px-3 py-1.5 rounded border text-[11px] font-bold flex items-center gap-1.5 transition-all",
                                            party.roles.isPayer
                                                ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                                                : "bg-white text-slate-400 border-slate-200 hover:border-slate-300"
                                        )}
                                    >
                                        <CreditCard className="h-3.5 w-3.5" />
                                        Bill Payer
                                    </button>

                                    {/* Divider */}
                                    <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block"></div>

                                    {/* Delete Action */}
                                    <button
                                        onClick={() => removeParty(party.id)}
                                        className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded transition-colors"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
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
            <CardHeader className="pb-3 border-b border-slate-50"><div className="flex justify-between items-center"><CardTitle className="text-sm uppercase text-red-600 flex items-center gap-2"><Activity className="h-4 w-4" /> Vital Signs</CardTitle><div className="text-[10px] text-slate-400">Nurse: {nurseName}</div></div></CardHeader>
            <CardContent className="p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <UnitInput label="Height" unit="cm" value={vitals.height} onChange={(v: string) => handleInputChange('height', v)} />
                    <UnitInput label="Weight" unit="kg" value={vitals.weight} onChange={(v: string) => handleInputChange('weight', v)} />
                    <div className="space-y-1">
                        <Label className="text-[10px] uppercase font-semibold text-slate-500">BP</Label>
                        <div className="flex gap-1"><Input className="h-9 w-12 px-1 text-center" placeholder="120" value={vitals.bpSys} onChange={e => handleInputChange('bpSys', e.target.value)} /><span className="text-slate-300">/</span><Input className="h-9 w-12 px-1 text-center" placeholder="80" value={vitals.bpDia} onChange={e => handleInputChange('bpDia', e.target.value)} /></div>
                    </div>
                    <UnitInput label="Temp" unit="°C" value={vitals.temp} onChange={(v: string) => handleInputChange('temp', v)} />
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
            <CardHeader className="pb-2 bg-purple-50/50"><CardTitle className="text-sm uppercase text-purple-600 flex items-center gap-2"><Camera className="h-4 w-4" /> Visuals</CardTitle></CardHeader>
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
                                <button onClick={() => handleCapture(prompt.id)} className="w-full h-24 flex flex-col items-center justify-center bg-slate-50 hover:bg-purple-50 text-slate-400 hover:text-purple-600 transition-colors gap-2"><Camera className="h-6 w-6" /><span className="text-xs font-bold">{prompt.label}</span></button>
                            )}
                        </div>
                    )
                })}
            </CardContent>
        </Card>
    )
}

// --- 8. TELEHEALTH (Specialty Filter) ---

// --- 8. TELEHEALTH DISPATCH CARD (NEW CALENDAR UX) ---
function TelehealthDispatchCard({ medicalIntents: selectedIntents, requiredWaitHours = 0 }: { medicalIntents: string[], requiredWaitHours?: number }) {
    const { toast } = useToast()
    const [specialtyFilter, setSpecialtyFilter] = useState("all")
    const [bookingMode, setBookingMode] = useState<"auto" | "manual">("auto")
    const [selectedDate, setSelectedDate] = useState<Date>(new Date())
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
    const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null)

    // Calculate when results will be ready
    const resultReadyTime = useMemo(() => {
        const d = new Date()
        d.setHours(d.getHours() + requiredWaitHours)
        return d
    }, [requiredWaitHours])

    // Generate next 3 days
    const dates = useMemo(() => {
        return Array.from({ length: 3 }).map((_, i) => {
            const d = new Date()
            d.setDate(d.getDate() + i)
            return d
        })
    }, [])

    // Generate Mock Time Slots
    const timeSlots = useMemo(() => {
        const slots = []
        // Morning 8-12, Afternoon 13-17, Evening 17-21
        const periods = [
            { label: "Morning", start: 8, end: 11, icon: <Zap className="h-3 w-3" /> },
            { label: "Afternoon", start: 13, end: 16, icon: <Clock className="h-3 w-3" /> },
            { label: "Evening", start: 17, end: 20, icon: <CheckCircle2 className="h-3 w-3" /> } // Using CheckCircle just as a distinct icon placeholder or Moon
        ]

        for (const p of periods) {
            const periodSlots = []
            for (let hour = p.start; hour <= p.end; hour++) {
                const timeStr = `${hour}:00`
                // Create a comparable date object for this slot
                const slotDate = new Date(selectedDate)
                slotDate.setHours(hour, 0, 0, 0)

                // Logic: Disable if slot is BEFORE result ready time
                // Or if slot is in the past (for today)
                const isTooEarly = slotDate < resultReadyTime

                periodSlots.push({ time: timeStr, disabled: isTooEarly, date: slotDate })
            }
            slots.push({ ...p, slots: periodSlots })
        }
        return slots
    }, [selectedDate, resultReadyTime])

    // Filter Doctors
    const uniqueSpecialties = useMemo(() => ["all", ...Array.from(new Set(doctorPool.map(d => d.specialty)))], [])
    const filteredDoctors = useMemo(() => {
        let docs = [...doctorPool];
        if (specialtyFilter !== 'all') docs = docs.filter(d => d.specialty === specialtyFilter);
        return docs
    }, [specialtyFilter])

    // Auto-select best doctor for Auto Mode
    useEffect(() => {
        if (filteredDoctors.length > 0 && !selectedDoctor) setSelectedDoctor(filteredDoctors[0].id)
    }, [filteredDoctors])

    const handleBook = () => {
        const drName = doctorPool.find(d => d.id === selectedDoctor)?.name || "Assigned Doctor"
        const timeMsg = bookingMode === 'auto'
            ? `as soon as results are ready (~${requiredWaitHours}h)`
            : `on ${selectedDate.toLocaleDateString('en-GB', { weekday: 'short' })} at ${selectedSlot}`

        toast({
            title: "Telehealth Scheduled",
            description: `${drName} booked for ${timeMsg}. SMS sent to patient.`,
            className: "bg-pink-600 text-white"
        })
    }

    if (selectedIntents.length === 0) return null

    return (
        <Card className="border-t-4 border-t-pink-500 shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-50">
                <div className="flex flex-row items-center justify-between mb-3">
                    <CardTitle className="text-sm uppercase text-pink-600 flex items-center gap-2"><Video className="h-4 w-4" /> Telehealth Dispatch</CardTitle>
                    <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}><SelectTrigger className="h-7 w-36 text-xs"><SelectValue placeholder="Specialty" /></SelectTrigger><SelectContent>{uniqueSpecialties.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
                </div>

                {/* Result Wait Time Banner */}
                {requiredWaitHours > 0 && (
                    <div className="bg-amber-50 text-amber-800 text-xs px-3 py-2 rounded-md flex items-center gap-2 border border-amber-100">
                        <CalendarClock className="h-4 w-4 text-amber-600" />
                        <span>
                            <strong>Wait Time Enforced:</strong> Lab results ready by <span className="font-bold">{resultReadyTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>. Earlier slots disabled.
                        </span>
                    </div>
                )}
            </CardHeader>

            <CardContent className="p-0">
                <Tabs value={bookingMode} onValueChange={(v: any) => setBookingMode(v)} className="w-full">
                    <div className="px-4 py-2 bg-slate-50 border-b border-slate-100">
                        <TabsList className="grid w-full grid-cols-2 h-8">
                            <TabsTrigger value="auto" className="text-xs">Auto-Dispatch (Earliest)</TabsTrigger>
                            <TabsTrigger value="manual" className="text-xs">Schedule (Pick Time)</TabsTrigger>
                        </TabsList>
                    </div>

                    {/* MODE 1: AUTO DISPATCH (Classic) */}
                    <TabsContent value="auto" className="p-0 m-0">
                        <div className="max-h-48 overflow-y-auto">
                            {filteredDoctors.map(dr => (
                                <div key={dr.id} onClick={() => setSelectedDoctor(dr.id)} className={cn("p-3 border-b flex justify-between items-center cursor-pointer hover:bg-slate-50 border-l-4", selectedDoctor === dr.id ? "bg-pink-50 border-l-pink-500" : "border-l-transparent")}>
                                    <div className="flex items-center gap-3">
                                        <div className={cn("h-8 w-8 rounded-full flex items-center justify-center text-[10px]", dr.avatarColor)}>{dr.name.substring(0, 2)}</div>
                                        <div><div className="text-sm font-bold text-slate-700">{dr.name}</div><div className="text-[10px] text-slate-500">{dr.specialty}</div></div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs font-bold text-slate-700">{dr.status === 'online' ? 'Available' : 'Busy'}</div>
                                        <div className="text-[10px] text-slate-400">Queue: {dr.queueLength}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </TabsContent>

                    {/* MODE 2: MANUAL CALENDAR */}
                    <TabsContent value="manual" className="p-4 m-0 space-y-4">
                        {/* Date Selector */}
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {dates.map(date => {
                                const isSelected = date.toDateString() === selectedDate.toDateString()
                                return (
                                    <button
                                        key={date.toString()}
                                        onClick={() => setSelectedDate(date)}
                                        className={cn(
                                            "flex-1 min-w-[80px] py-2 rounded-lg border text-center transition-all",
                                            isSelected ? "bg-slate-800 text-white border-slate-800 shadow-md" : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                                        )}
                                    >
                                        <div className="text-[10px] uppercase font-bold opacity-70">{date.toLocaleDateString('en-GB', { weekday: 'short' })}</div>
                                        <div className="text-sm font-bold">{date.getDate()}</div>
                                    </button>
                                )
                            })}
                        </div>

                        {/* Time Grid */}
                        <div className="space-y-4">
                            {timeSlots.map(period => (
                                <div key={period.label}>
                                    <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                        {period.icon} {period.label}
                                    </div>
                                    <div className="grid grid-cols-4 gap-2">
                                        {period.slots.map(slot => (
                                            <button
                                                key={slot.time}
                                                disabled={slot.disabled}
                                                onClick={() => setSelectedSlot(slot.time)}
                                                className={cn(
                                                    "py-1.5 rounded text-xs font-bold border transition-all relative overflow-hidden",
                                                    slot.disabled
                                                        ? "bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed"
                                                        : selectedSlot === slot.time
                                                            ? "bg-pink-600 text-white border-pink-600 shadow-sm"
                                                            : "bg-white text-slate-700 border-slate-200 hover:border-pink-300 hover:text-pink-600"
                                                )}
                                            >
                                                {slot.time}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Selected Context */}
                        {selectedSlot && (
                            <div className="bg-pink-50 border border-pink-100 rounded p-2 text-center text-xs text-pink-800">
                                Booking <span className="font-bold">{doctorPool[0].name}</span> for <span className="font-bold">{selectedDate.toLocaleDateString()} at {selectedSlot}</span>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>

                {/* Footer Action */}
                <div className="p-3 bg-slate-50 border-t border-slate-100">
                    <Button
                        onClick={handleBook}
                        className="w-full bg-pink-600 hover:bg-pink-700"
                        disabled={bookingMode === 'manual' && !selectedSlot}
                    >
                        {bookingMode === 'auto' ? "Dispatch Now" : "Schedule Appointment"}
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}


// --- MAIN PAGE ---
export function ReceptionistView({ refreshPatients }: { refreshPatients?: () => Promise<void> } = {}) {
    const { toast } = useToast()

    // STATE
    const [scanStep, setScanStep] = useState<"idle" | "cccd" | "checking-bhyt" | "complete">("idle")
    const [scannedIdentity, setScannedIdentity] = useState<any>(null)

    const [formData, setFormData] = useState({
        fullName: "", dob: "", gender: "", citizenId: "",
        phonePrefix: "+84", phone: "", email: "", address: "", provinceId: "",
        communeId: "",
        selectedIntents: [] as string[]
    })

    const [financialData, setFinancialData] = useState({ cardLast4: "", cardExpiry: "", bankName: "", bankAccount: "" })
    const [privateInsurance, setPrivateInsurance] = useState<PrivateInsuranceData>({ provider: "", policyNumber: "", expiryDate: "", frontImg: null, backImg: null, estimatedCoverage: 0.0, isActive: false })

    const [selectedTests, setSelectedTests] = useState<LabTest[]>([])
    const [testSearchQuery, setTestSearchQuery] = useState("")
    const [internalAccess, setInternalAccess] = useState<'locked' | 'unlocked'>('locked')

    // 1. Group tests by their Intent instead of flattening them
    const suggestedProtocols = useMemo(() => {
        if (formData.selectedIntents.length === 0) return [];

        return formData.selectedIntents.map(intentId => {
            const intent = medicalIntents.find(i => i.id === intentId);
            if (!intent) return null;

            // Resolve test IDs to full test objects
            const tests = intent.recommended
                .map(tId => labTestsData.find(t => t.id === tId))
                .filter(Boolean) as LabTest[];

            if (tests.length === 0) return null;

            return {
                ...intent,
                tests
            };
        }).filter(Boolean) as Array<{ id: string; label: string; tests: LabTest[] }>;
    }, [formData.selectedIntents]);

    const filteredTests = useMemo(() => {
        if (!testSearchQuery) return [];
        const lowerQuery = testSearchQuery.toLowerCase();
        
        return labTestsData.filter(test => 
            test.name.toLowerCase().includes(lowerQuery) || 
            test.id.toLowerCase().includes(lowerQuery) ||
            (test.description && test.description.toLowerCase().includes(lowerQuery))
        );
    }, [testSearchQuery]);


    // Helper to get color styles based on intent ID (matching your screenshots)
    const getIntentStyles = (id: string) => {
        switch (id) {
            case 'chronic_diabetes': return 'border-pink-500 bg-pink-50 text-pink-700 hover:border-pink-400';
            case 'std_screening': return 'border-orange-500 bg-orange-50 text-orange-700 hover:border-orange-400';
            case 'fever_infection': return 'border-red-500 bg-red-50 text-red-700 hover:border-red-400';
            case 'prenatal': return 'border-purple-500 bg-purple-50 text-purple-700 hover:border-purple-400';
            default: return 'border-indigo-500 bg-indigo-50 text-indigo-700 hover:border-indigo-400';
        }
    };

    // Suggested Logic
    const suggestedTests = useMemo(() => {
        if (formData.selectedIntents.length === 0) return [];
        const allTestIds = new Set<string>();
        formData.selectedIntents.forEach(id => { const intent = medicalIntents.find(i => i.id === id); if (intent) intent.recommended.forEach(tId => allTestIds.add(tId)) });
        return Array.from(allTestIds).map(id => labTestsData.find(t => t.id === id)).filter(Boolean) as LabTest[]
    }, [formData.selectedIntents])

    // Helper for BHYT Fetch
    const simulateBHYTFetch = (name: string, cid: string) => {
        setScanStep("checking-bhyt");
        toast({ title: "Checking Insurance...", description: `Verifying BHYT for ${name}` });
        setTimeout(() => {
            const found = cid.startsWith("079");
            if (found) {
                setScannedIdentity((prev: any) => ({ ...prev, bhyt: { code: "DN4797915071630", coverageLabel: "80% (Lvl 4)", expiry: "31/12/2025" } }));
                toast({ title: "Insurance Verified", description: "BHYT data retrieved successfully.", className: "bg-emerald-600 text-white" });
            } else {
                toast({ title: "No Insurance Found", description: "Could not find BHYT records for this ID.", variant: "destructive" });
            }
            setScanStep("complete");
        }, 1500);
    }

    // Handlers
    const handleScanComplete = () => {
        setScanStep("cccd");
        setTimeout(() => {
            const extracted = { name: "TRẦN THỊ NGỌC LAN", dob: "15/05/1992", gender: "female", citizenId: "079192000123", address: "123 Nguyen Hue, D1" };
            setScannedIdentity(extracted);
            setFormData(prev => ({ ...prev, fullName: extracted.name, dob: extracted.dob, gender: extracted.gender, citizenId: extracted.citizenId, address: extracted.address }));
            simulateBHYTFetch(extracted.name, extracted.citizenId);
        }, 1000);
    }

    const handleManualBHYTCheck = () => {
        if (!formData.fullName || !formData.citizenId) {
            toast({ title: "Missing Info", description: "Please enter Name and ID to check insurance.", variant: "destructive" });
            return;
        }
        simulateBHYTFetch(formData.fullName, formData.citizenId);
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
        if (!patient?.bhyt) return { isCovered: false, coveragePercent: 0 };
        return { isCovered: true, coveragePercent: 0.8 }; // Mock logic
    }

    return (
        <TooltipProvider>
            <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
                {/* LEFT SCROLLABLE AREA */}
                <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
                    <div className="max-w-5xl mx-auto space-y-6 pb-24">
                        <div><h1 className="text-2xl font-bold text-slate-900">Patient Admission</h1></div>

                        {/* 1. Identity & BHYT (Unified) */}
                        <IdentityVerificationCard
                            scanStep={scanStep} onScanComplete={handleScanComplete}
                            bhytData={scannedIdentity?.bhyt} internalAccess={internalAccess}
                            onInternalHistoryClick={() => setInternalAccess('unlocked')}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* 2. Demographics (Expanded) */}
                            <div className="md:col-span-2">
                                <DemographicsCard
                                    formData={formData}
                                    setFormData={setFormData}
                                    onCheckBHYT={handleManualBHYTCheck}
                                />
                            </div>


                            {/* 6. Medical Intent (Multi Select) */}
                            <Card className="border-t-4 border-t-emerald-500 shadow-sm md:col-span-2">
                                <CardHeader className="pb-2"><CardTitle className="text-sm uppercase text-emerald-600 flex items-center gap-2"><Stethoscope className="h-4 w-4" /> Clinical Context</CardTitle></CardHeader>
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

                            {/* 9. Order Entry */}
                            <Card className="border-t-4 border-t-indigo-500 shadow-sm md:col-span-2 mb-20">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm uppercase text-indigo-600 flex items-center gap-2">
                                        <Beaker className="h-4 w-4" /> Order Entry
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">

                                    {/* Recommended Protocol Block - LOOPED per Intent */}
                                    {suggestedProtocols.length > 0 && (
                                        <div className="space-y-3 mb-4 animate-in fade-in slide-in-from-top-2">
                                            <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                                <Sparkles className="h-4 w-4 text-indigo-600" /> Recommended Protocols
                                            </h4>

                                            {suggestedProtocols.map((protocol) => {
                                                const styles = getIntentStyles(protocol.id);

                                                return (
                                                    <div key={protocol.id} className={`border-l-4 rounded-r-xl p-3 border border-l-[inherit] ${styles.split(' ').slice(0, 3).join(' ')} border-opacity-20`}>
                                                        {/* Header for this specific intent */}
                                                        <div className={`text-xs font-bold uppercase mb-2 opacity-90 ${styles.split(' ').pop()}`}>
                                                            {protocol.label}
                                                        </div>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                                            {protocol.tests.map(test => {
                                                                const eligible = checkInsuranceEligibility(test, scannedIdentity);

                                                                return (
                                                                    <button
                                                                        key={`${protocol.id}-${test.id}`} // Unique key in case test appears in multiple groups
                                                                        onClick={() => addTest(test)}
                                                                        className="text-left p-2.5 rounded-lg border bg-white border-slate-200 hover:shadow-md transition-all flex justify-between items-center group"
                                                                    >
                                                                        <div>
                                                                            <div className="text-xs font-bold text-slate-700 group-hover:text-indigo-700 transition-colors">
                                                                                {test.name}
                                                                            </div>
                                                                            <div className="text-[10px] text-slate-500 mt-0.5">
                                                                                {eligible.coveragePercent === 1.0 ? (
                                                                                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                                                                                        <ShieldCheck className="h-3 w-3" /> 100% Covered
                                                                                    </span>
                                                                                ) : (
                                                                                    formatCurrency(test.price)
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                        <PlusCircle className={`h-5 w-5 opacity-40 group-hover:opacity-100 transition-colors ${styles.replace('bg-', 'text-').replace('border-', 'text-')}`} />
                                                                    </button>
                                                                )
                                                            })}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* Search Bar (Remains the same) */}
                                    <div className="relative">
                                        <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                        <Input
                                            className="pl-10 h-10"
                                            placeholder="Search tests (e.g., 'hemo')..."
                                            value={testSearchQuery}
                                            onChange={e => setTestSearchQuery(e.target.value)}
                                        />
                                    </div>

                                    {/* Search Results (Remains the same) */}
                                    {testSearchQuery && (
                                        // ... existing search result code ...
                                        <div className="border rounded-md divide-y divide-slate-100 max-h-60 overflow-y-auto shadow-sm">
                                            {filteredTests.length > 0 ? filteredTests.map(test => (
                                                <div key={test.id} className="p-3 bg-white flex justify-between items-center hover:bg-slate-50 group cursor-pointer" onClick={() => addTest(test)}>
                                                    <div className="flex-1">
                                                        <div className="font-bold text-sm text-slate-800">{test.name}</div>
                                                        <div className="text-xs text-slate-500 italic mb-1">{test.description}</div>
                                                        <div className="flex items-center gap-3">
                                                            <Badge variant="outline" className="text-[10px] h-5 bg-slate-50 text-slate-600 border-slate-200 gap-1 font-normal">
                                                                <FlaskConical className="h-3 w-3" /> Result in {test.turnaroundHours}h
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


                            {/* 7. Vital Signs */}
                            <div className="md:col-span-2"><VitalSignsMonitor nurseName="Lan" /></div>

                            {/* 8. Visual Observations */}
                            <div className="md:col-span-2"><VisualObservationCard medicalIntents={formData.selectedIntents} /></div>


                            {/* 10. Telehealth Dispatch */}
                            <div className="md:col-span-2">
                                <TelehealthDispatchCard medicalIntents={formData.selectedIntents} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT CART */}
                <div className="w-[350px] border-l bg-white shadow-xl flex flex-col z-20">
                    <div className="p-4 border-b bg-slate-50 font-bold text-slate-800 flex items-center gap-2"><ShoppingCart className="h-5 w-5" /> Order Cart ({selectedTests.length})</div>
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