"use client"

import { useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Video, Shield, FileText, ChevronRight, CheckCircle2, Stethoscope, ArrowRight, Play } from "lucide-react"

export function OnboardingView() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isExploring, setIsExploring] = useState(false)

  // Get referrer info from URL params (e.g., /onboarding?ref=dr-smith-123)
  const refCode = searchParams.get("ref") || "dr-smith-123"

  // In production, this would fetch from database based on refCode
  const referrer = {
    name: "Dr. Smith",
    specialty: "Internal Medicine",
    avatar: null,
    initials: "DS",
  }

  const handleCreateAccount = () => {
    // Navigate to signup with referrer context
    router.push(`/signup?ref=${refCode}`)
  }

  const handleExplore = () => {
    setIsExploring(true)
    // Navigate to dashboard in explore mode
    router.push("/my-patients?mode=explore")
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
            <Stethoscope className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-lg text-foreground">NeXT Health</span>
        </div>
        <Button variant="ghost" size="sm" className="text-muted-foreground">
          Already have an account? <span className="text-emerald-600 ml-1 font-medium">Sign in</span>
        </Button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-32">
        <div className="max-w-2xl w-full text-center space-y-8">
          {/* Referrer Badge */}
          <div className="flex justify-center">
            <Badge
              variant="secondary"
              className="px-4 py-2 bg-emerald-100 text-emerald-700 border-emerald-200 text-sm font-medium"
            >
              Invited by a colleague
            </Badge>
          </div>

          {/* Hero Section */}
          <div className="space-y-6">
            {/* Referrer Avatar */}
            <div className="flex justify-center">
              <div className="relative">
                <Avatar className="w-20 h-20 border-4 border-white shadow-lg">
                  <AvatarImage src={referrer.avatar || undefined} />
                  <AvatarFallback className="bg-emerald-500 text-white text-xl font-semibold">
                    {referrer.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>

            {/* Main Headline */}
            <div className="space-y-3">
              <h1 className="text-4xl font-bold text-foreground tracking-tight text-balance">
                {referrer.name} invites you to join <span className="text-emerald-600">NeXT Health</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-lg mx-auto text-pretty">
                The modern telehealth platform built for healthcare professionals. Start seeing patients online in
                minutes.
              </p>
            </div>
          </div>

          {/* Value Props */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <Card className="border-0 shadow-sm bg-white/80 backdrop-blur">
              <CardContent className="pt-6 pb-5 px-5 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                  <Video className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Flexible Telehealth</h3>
                  <p className="text-sm text-muted-foreground mt-1">HD video consultations with built-in scheduling</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-white/80 backdrop-blur">
              <CardContent className="pt-6 pb-5 px-5 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                  <Shield className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Guaranteed Payments</h3>
                  <p className="text-sm text-muted-foreground mt-1">Secure transactions with automatic invoicing</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-white/80 backdrop-blur">
              <CardContent className="pt-6 pb-5 px-5 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                  <FileText className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Digital Records</h3>
                  <p className="text-sm text-muted-foreground mt-1">Complete patient history at your fingertips</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Explore CTA */}
          <div className="pt-4">
            <Button
              variant="ghost"
              className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 gap-2"
              onClick={handleExplore}
            >
              <Play className="w-4 h-4" />
              Explore the platform first
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </main>

      {/* Sticky Bottom CTA Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-emerald-100 px-6 py-4 shadow-lg">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          <div className="hidden sm:block">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Free to join</span> · No credit card required
            </p>
          </div>
          <Button
            size="lg"
            className="bg-emerald-500 hover:bg-emerald-600 text-white gap-2 px-8 w-full sm:w-auto"
            onClick={handleCreateAccount}
          >
            Create Professional Account
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Trust Indicators */}
      <div className="fixed bottom-20 left-0 right-0 px-6 pb-2">
        <div className="max-w-2xl mx-auto flex items-center justify-center gap-6 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            HIPAA Compliant
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            256-bit Encryption
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            SOC 2 Certified
          </span>
        </div>
      </div>
    </div>
  )
}
