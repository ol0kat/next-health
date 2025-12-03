"use client"

import { useState, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  User,
  Award,
  Building2,
  FileSignature,
  Upload,
  Check,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Shield,
  CreditCard,
  ChevronLeft,
} from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

const steps = [
  { id: 1, name: "Identity", icon: User, description: "eKYC Verification" },
  { id: 2, name: "Credentials", icon: Award, description: "Professional License" },
  { id: 3, name: "Banking", icon: CreditCard, description: "Payout Setup" },
  { id: 4, name: "Agreement", icon: FileSignature, description: "Digital Signature" },
]

const vietnameseBanks = [
  "Vietcombank",
  "VietinBank",
  "BIDV",
  "Techcombank",
  "MB Bank",
  "ACB",
  "VPBank",
  "Sacombank",
  "HDBank",
  "TPBank",
  "OCB",
  "SHB",
  "SeABank",
  "LienVietPostBank",
  "MSB",
  "VIB",
  "Nam A Bank",
  "Bac A Bank",
  "PVcomBank",
  "Eximbank",
]

interface FormData {
  // Step 1: Identity
  idFront: File | null
  idBack: File | null
  fullName: string
  dateOfBirth: string
  taxCode: string
  // Step 2: Credentials
  certificate: File | null
  certificateNumber: string
  workplace: string
  // Step 3: Banking
  bankName: string
  branchName: string
  accountNumber: string
  accountHolderName: string
  // Step 4: Agreement
  agreedToTerms: boolean
}

export function SignupWizard() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const referrer = searchParams.get("ref") || "colleague"
  const [currentStep, setCurrentStep] = useState(1)
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false)
  const contractRef = useRef<HTMLDivElement>(null)

  const [formData, setFormData] = useState<FormData>({
    idFront: null,
    idBack: null,
    fullName: "",
    dateOfBirth: "",
    taxCode: "",
    certificate: null,
    certificateNumber: "",
    workplace: "",
    bankName: "",
    branchName: "",
    accountNumber: "",
    accountHolderName: "",
    agreedToTerms: false,
  })

  const [idFrontPreview, setIdFrontPreview] = useState<string | null>(null)
  const [idBackPreview, setIdBackPreview] = useState<string | null>(null)
  const [certificatePreview, setCertificatePreview] = useState<string | null>(null)

  const handleFileUpload = (field: "idFront" | "idBack" | "certificate", file: File | null) => {
    setFormData((prev) => ({ ...prev, [field]: file }))
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        if (field === "idFront") setIdFrontPreview(result)
        else if (field === "idBack") setIdBackPreview(result)
        else setCertificatePreview(result)
      }
      reader.readAsDataURL(file)
    } else {
      if (field === "idFront") setIdFrontPreview(null)
      else if (field === "idBack") setIdBackPreview(null)
      else setCertificatePreview(null)
    }
  }

  const handleScroll = () => {
    if (contractRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = contractRef.current
      if (scrollTop + clientHeight >= scrollHeight - 20) {
        setHasScrolledToBottom(true)
      }
    }
  }

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.idFront && formData.idBack && formData.fullName && formData.dateOfBirth && formData.taxCode)
      case 2:
        return !!(formData.certificate && formData.certificateNumber && formData.workplace)
      case 3:
        return !!(formData.bankName && formData.branchName && formData.accountNumber && formData.accountHolderName)
      case 4:
        return formData.agreedToTerms && hasScrolledToBottom
      default:
        return false
    }
  }

  const getFieldStatus = (value: string | File | null): "empty" | "valid" => {
    if (!value) return "empty"
    if (typeof value === "string" && value.trim() === "") return "empty"
    return "valid"
  }

  const nameMismatch =
    formData.accountHolderName &&
    formData.fullName &&
    formData.accountHolderName.toLowerCase().trim() !== formData.fullName.toLowerCase().trim()

  const handleNext = () => {
    if (currentStep < 4 && isStepValid(currentStep)) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = () => {
    // Handle form submission
    console.log("Form submitted:", formData)
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href={`/onboarding?ref=${referrer}`}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="text-sm">Back</span>
          </Link>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-emerald-600" />
            <span className="font-semibold text-foreground">NeXT Health</span>
          </div>
          <div className="w-16" /> {/* Spacer for centering */}
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Stepper */}
        <nav aria-label="Progress" className="mb-8">
          <ol className="flex items-center justify-between">
            {steps.map((step, stepIdx) => (
              <li key={step.id} className={cn("relative flex-1", stepIdx !== steps.length - 1 && "pr-8")}>
                {stepIdx !== steps.length - 1 && (
                  <div
                    className={cn(
                      "absolute top-5 left-[calc(50%+20px)] right-0 h-0.5",
                      currentStep > step.id ? "bg-emerald-500" : "bg-border",
                    )}
                    aria-hidden="true"
                  />
                )}
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "relative flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all",
                      currentStep > step.id
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : currentStep === step.id
                          ? "border-emerald-500 bg-white text-emerald-600"
                          : "border-border bg-white text-muted-foreground",
                    )}
                  >
                    {currentStep > step.id ? <Check className="h-5 w-5" /> : <step.icon className="h-5 w-5" />}
                  </div>
                  <div className="mt-2 text-center">
                    <p
                      className={cn(
                        "text-sm font-medium",
                        currentStep >= step.id ? "text-foreground" : "text-muted-foreground",
                      )}
                    >
                      {step.name}
                    </p>
                    <p className="text-xs text-muted-foreground hidden sm:block">{step.description}</p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </nav>

        {/* Step Content */}
        <Card className="border-0 shadow-lg">
          {/* Step 1: Identity */}
          {currentStep === 1 && (
            <>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-emerald-600" />
                  Identity Verification (eKYC)
                </CardTitle>
                <CardDescription>
                  Upload your Citizen ID card to verify your identity. This information is encrypted and secured.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* ID Upload */}
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Front */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      Citizen ID (Front)
                      {getFieldStatus(formData.idFront) === "valid" && <Check className="h-4 w-4 text-emerald-500" />}
                    </Label>
                    <label
                      className={cn(
                        "flex flex-col items-center justify-center h-40 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
                        idFrontPreview
                          ? "border-emerald-500 bg-emerald-50"
                          : "border-border hover:border-emerald-300 hover:bg-emerald-50/50",
                      )}
                    >
                      {idFrontPreview ? (
                        <img
                          src={idFrontPreview || "/placeholder.svg"}
                          alt="ID Front"
                          className="h-full object-contain p-2"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <Upload className="h-8 w-8" />
                          <span className="text-sm">Click to upload front</span>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload("idFront", e.target.files?.[0] || null)}
                      />
                    </label>
                  </div>
                  {/* Back */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      Citizen ID (Back)
                      {getFieldStatus(formData.idBack) === "valid" && <Check className="h-4 w-4 text-emerald-500" />}
                    </Label>
                    <label
                      className={cn(
                        "flex flex-col items-center justify-center h-40 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
                        idBackPreview
                          ? "border-emerald-500 bg-emerald-50"
                          : "border-border hover:border-emerald-300 hover:bg-emerald-50/50",
                      )}
                    >
                      {idBackPreview ? (
                        <img
                          src={idBackPreview || "/placeholder.svg"}
                          alt="ID Back"
                          className="h-full object-contain p-2"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <Upload className="h-8 w-8" />
                          <span className="text-sm">Click to upload back</span>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload("idBack", e.target.files?.[0] || null)}
                      />
                    </label>
                  </div>
                </div>

                {/* Personal Info */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="flex items-center gap-2">
                      Full Name (as shown on ID)
                      {getFieldStatus(formData.fullName) === "valid" && <Check className="h-4 w-4 text-emerald-500" />}
                    </Label>
                    <Input
                      id="fullName"
                      placeholder="Nguyễn Văn A"
                      value={formData.fullName}
                      onChange={(e) => setFormData((prev) => ({ ...prev, fullName: e.target.value }))}
                      className={cn(
                        getFieldStatus(formData.fullName) === "valid" &&
                          "border-emerald-500 focus-visible:ring-emerald-500",
                      )}
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="dob" className="flex items-center gap-2">
                        Date of Birth
                        {getFieldStatus(formData.dateOfBirth) === "valid" && (
                          <Check className="h-4 w-4 text-emerald-500" />
                        )}
                      </Label>
                      <Input
                        id="dob"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => setFormData((prev) => ({ ...prev, dateOfBirth: e.target.value }))}
                        className={cn(
                          getFieldStatus(formData.dateOfBirth) === "valid" &&
                            "border-emerald-500 focus-visible:ring-emerald-500",
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="taxCode" className="flex items-center gap-2">
                        Personal Tax Code (Mã số thuế)
                        {getFieldStatus(formData.taxCode) === "valid" && <Check className="h-4 w-4 text-emerald-500" />}
                      </Label>
                      <Input
                        id="taxCode"
                        placeholder="1234567890"
                        value={formData.taxCode}
                        onChange={(e) => setFormData((prev) => ({ ...prev, taxCode: e.target.value }))}
                        className={cn(
                          getFieldStatus(formData.taxCode) === "valid" &&
                            "border-emerald-500 focus-visible:ring-emerald-500",
                        )}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </>
          )}

          {/* Step 2: Credentials */}
          {currentStep === 2 && (
            <>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-emerald-600" />
                  Professional Credentials
                </CardTitle>
                <CardDescription>
                  Upload your Practicing Certificate (CCHN) for compliance verification.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Certificate Upload */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    Practicing Certificate (CCHN)
                    {getFieldStatus(formData.certificate) === "valid" && <Check className="h-4 w-4 text-emerald-500" />}
                  </Label>
                  <label
                    className={cn(
                      "flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
                      certificatePreview
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-border hover:border-emerald-300 hover:bg-emerald-50/50",
                    )}
                  >
                    {certificatePreview ? (
                      <img
                        src={certificatePreview || "/placeholder.svg"}
                        alt="Certificate"
                        className="h-full object-contain p-2"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Upload className="h-10 w-10" />
                        <span className="text-sm">Click to upload your practicing certificate</span>
                        <span className="text-xs">Supports JPG, PNG, PDF (max 10MB)</span>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={(e) => handleFileUpload("certificate", e.target.files?.[0] || null)}
                    />
                  </label>
                </div>

                {/* Certificate Details */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="certNumber" className="flex items-center gap-2">
                      Certificate Number
                      {getFieldStatus(formData.certificateNumber) === "valid" && (
                        <Check className="h-4 w-4 text-emerald-500" />
                      )}
                    </Label>
                    <Input
                      id="certNumber"
                      placeholder="CCHN-XXXXX-XXXX"
                      value={formData.certificateNumber}
                      onChange={(e) => setFormData((prev) => ({ ...prev, certificateNumber: e.target.value }))}
                      className={cn(
                        getFieldStatus(formData.certificateNumber) === "valid" &&
                          "border-emerald-500 focus-visible:ring-emerald-500",
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="workplace" className="flex items-center gap-2">
                      Current Workplace
                      {getFieldStatus(formData.workplace) === "valid" && <Check className="h-4 w-4 text-emerald-500" />}
                    </Label>
                    <Input
                      id="workplace"
                      placeholder="Hospital or Clinic Name"
                      value={formData.workplace}
                      onChange={(e) => setFormData((prev) => ({ ...prev, workplace: e.target.value }))}
                      className={cn(
                        getFieldStatus(formData.workplace) === "valid" &&
                          "border-emerald-500 focus-visible:ring-emerald-500",
                      )}
                    />
                    <p className="text-xs text-muted-foreground">
                      Required for conflict of interest checks per healthcare regulations.
                    </p>
                  </div>
                </div>
              </CardContent>
            </>
          )}

          {/* Step 3: Banking */}
          {currentStep === 3 && (
            <>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-emerald-600" />
                  Banking Information
                </CardTitle>
                <CardDescription>Set up your payout account for receiving payments.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="bankName" className="flex items-center gap-2">
                      Bank Name
                      {getFieldStatus(formData.bankName) === "valid" && <Check className="h-4 w-4 text-emerald-500" />}
                    </Label>
                    <Select
                      value={formData.bankName}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, bankName: value }))}
                    >
                      <SelectTrigger
                        className={cn(
                          getFieldStatus(formData.bankName) === "valid" && "border-emerald-500 focus:ring-emerald-500",
                        )}
                      >
                        <SelectValue placeholder="Select your bank" />
                      </SelectTrigger>
                      <SelectContent>
                        {vietnameseBanks.map((bank) => (
                          <SelectItem key={bank} value={bank}>
                            {bank}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="branchName" className="flex items-center gap-2">
                      Branch Name
                      {getFieldStatus(formData.branchName) === "valid" && (
                        <Check className="h-4 w-4 text-emerald-500" />
                      )}
                    </Label>
                    <Input
                      id="branchName"
                      placeholder="e.g., Hà Nội - Cầu Giấy"
                      value={formData.branchName}
                      onChange={(e) => setFormData((prev) => ({ ...prev, branchName: e.target.value }))}
                      className={cn(
                        getFieldStatus(formData.branchName) === "valid" &&
                          "border-emerald-500 focus-visible:ring-emerald-500",
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountNumber" className="flex items-center gap-2">
                    Account Number
                    {getFieldStatus(formData.accountNumber) === "valid" && (
                      <Check className="h-4 w-4 text-emerald-500" />
                    )}
                  </Label>
                  <Input
                    id="accountNumber"
                    placeholder="Enter your bank account number"
                    value={formData.accountNumber}
                    onChange={(e) => setFormData((prev) => ({ ...prev, accountNumber: e.target.value }))}
                    className={cn(
                      getFieldStatus(formData.accountNumber) === "valid" &&
                        "border-emerald-500 focus-visible:ring-emerald-500",
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountHolder" className="flex items-center gap-2">
                    Account Holder Name
                    {getFieldStatus(formData.accountHolderName) === "valid" && !nameMismatch && (
                      <Check className="h-4 w-4 text-emerald-500" />
                    )}
                    {nameMismatch && <AlertTriangle className="h-4 w-4 text-amber-500" />}
                  </Label>
                  <Input
                    id="accountHolder"
                    placeholder="Name as shown on bank account"
                    value={formData.accountHolderName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, accountHolderName: e.target.value }))}
                    className={cn(
                      getFieldStatus(formData.accountHolderName) === "valid" && !nameMismatch
                        ? "border-emerald-500 focus-visible:ring-emerald-500"
                        : nameMismatch
                          ? "border-amber-500 focus-visible:ring-amber-500"
                          : "",
                    )}
                  />
                </div>

                {nameMismatch && (
                  <Alert className="border-amber-200 bg-amber-50">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-amber-800">
                      The account holder name doesn't match your identity name ("{formData.fullName}"). Please ensure
                      the name matches exactly to avoid payment issues.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </>
          )}

          {/* Step 4: Agreement */}
          {currentStep === 4 && (
            <>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSignature className="h-5 w-5 text-emerald-600" />
                  Professional Cooperation Agreement
                </CardTitle>
                <CardDescription>Please review and sign the agreement to complete your registration.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Contract Preview */}
                <div className="border rounded-lg bg-muted/30">
                  <div className="p-3 border-b bg-muted/50 flex items-center justify-between">
                    <span className="text-sm font-medium">Contract Preview</span>
                    <Badge variant="outline" className="text-xs">
                      Scroll to read
                    </Badge>
                  </div>
                  <div
                    ref={contractRef}
                    onScroll={handleScroll}
                    className="h-72 overflow-y-auto p-6 text-sm leading-relaxed space-y-4"
                  >
                    <h3 className="text-lg font-bold text-center">PROFESSIONAL COOPERATION AGREEMENT</h3>
                    <p className="text-center text-muted-foreground">Contract No: NXT-2025-XXXXX</p>

                    <div className="space-y-2">
                      <p className="font-semibold">BETWEEN:</p>
                      <p>
                        <strong>Party A:</strong> NeXT Health Platform Ltd.
                        <br />
                        Address: 123 Healthcare Street, District 1, Ho Chi Minh City
                        <br />
                        Tax Code: 0123456789
                      </p>
                    </div>

                    <div className="space-y-2 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                      <p className="font-semibold text-emerald-700">Party B (Professional):</p>
                      <p>
                        <strong>Full Name:</strong>{" "}
                        <span className="text-emerald-600">{formData.fullName || "[Not provided]"}</span>
                        <br />
                        <strong>ID Number:</strong>{" "}
                        <span className="text-emerald-600">{formData.taxCode || "[Not provided]"}</span>
                        <br />
                        <strong>Certificate:</strong>{" "}
                        <span className="text-emerald-600">{formData.certificateNumber || "[Not provided]"}</span>
                        <br />
                        <strong>Bank Account:</strong>{" "}
                        <span className="text-emerald-600">
                          {formData.bankName} - {formData.accountNumber || "[Not provided]"}
                        </span>
                        <br />
                        <strong>Account Holder:</strong>{" "}
                        <span className="text-emerald-600">{formData.accountHolderName || "[Not provided]"}</span>
                      </p>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-semibold">ARTICLE 1: SCOPE OF COOPERATION</h4>
                      <p>
                        Party B agrees to provide telehealth consultation services through Party A's platform in
                        accordance with Vietnamese healthcare regulations and the Ministry of Health guidelines.
                      </p>

                      <h4 className="font-semibold">ARTICLE 2: RIGHTS AND OBLIGATIONS</h4>
                      <p>
                        2.1. Party B shall maintain a valid practicing certificate throughout the cooperation period.
                        <br />
                        2.2. Party B shall provide accurate information regarding their qualifications and workplace.
                        <br />
                        2.3. Party A shall facilitate patient connections and handle payment processing.
                        <br />
                        2.4. Party A shall remit payments to Party B within 15 business days of service completion.
                      </p>

                      <h4 className="font-semibold">ARTICLE 3: REVENUE SHARING</h4>
                      <p>
                        Party B shall receive 80% of the consultation fee, with Party A retaining 20% as platform
                        service fee. All fees are subject to applicable taxes.
                      </p>

                      <h4 className="font-semibold">ARTICLE 4: CONFIDENTIALITY</h4>
                      <p>
                        Both parties agree to maintain strict confidentiality of patient information in compliance with
                        healthcare privacy laws and HIPAA-equivalent regulations.
                      </p>

                      <h4 className="font-semibold">ARTICLE 5: TERMINATION</h4>
                      <p>
                        Either party may terminate this agreement with 30 days written notice. Pending consultations
                        must be completed before termination takes effect.
                      </p>

                      <h4 className="font-semibold">ARTICLE 6: DISPUTE RESOLUTION</h4>
                      <p>
                        Any disputes arising from this agreement shall be resolved through negotiation. If negotiation
                        fails, disputes shall be submitted to the competent court in Ho Chi Minh City.
                      </p>

                      <div className="pt-6 border-t mt-6">
                        <p className="text-center text-muted-foreground">
                          This agreement is made electronically and is legally binding upon digital signature.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {!hasScrolledToBottom && (
                  <p className="text-sm text-muted-foreground text-center">
                    Please scroll to the bottom of the contract to continue
                  </p>
                )}

                {/* Agreement Checkbox */}
                <div className="flex items-start gap-3 p-4 border rounded-lg bg-muted/30">
                  <Checkbox
                    id="agree"
                    checked={formData.agreedToTerms}
                    onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, agreedToTerms: checked === true }))}
                    disabled={!hasScrolledToBottom}
                    className="mt-0.5"
                  />
                  <Label htmlFor="agree" className="text-sm leading-relaxed cursor-pointer">
                    I have read and understood the Professional Cooperation Agreement. I confirm that all information
                    provided is accurate and I agree to be bound by the terms and conditions.
                  </Label>
                </div>
              </CardContent>
            </>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between p-6 border-t bg-muted/30">
            <Button variant="outline" onClick={handleBack} disabled={currentStep === 1}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Step {currentStep} of {steps.length}
              </span>
            </div>

            {currentStep < 4 ? (
              <Button
                onClick={handleNext}
                disabled={!isStepValid(currentStep)}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Continue
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={!isStepValid(4)} className="bg-emerald-600 hover:bg-emerald-700">
                <FileSignature className="h-4 w-4 mr-2" />
                Sign & Complete
              </Button>
            )}
          </div>
        </Card>

        {/* Trust Footer */}
        <div className="mt-8 flex items-center justify-center gap-6 text-muted-foreground">
          <div className="flex items-center gap-2 text-xs">
            <Shield className="h-4 w-4" />
            <span>256-bit Encryption</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Building2 className="h-4 w-4" />
            <span>HIPAA Compliant</span>
          </div>
        </div>
      </div>
    </div>
  )
}
