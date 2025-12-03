"use client"

import type React from "react"
import { Suspense } from "react"
import { Sidebar } from "@/components/sidebar"
import { BreadcrumbNav } from "@/components/breadcrumb-nav"
import { usePathname, useRouter } from "next/navigation"
import { useApp } from "@/components/app-provider"
import { Button } from "@/components/ui/button"
import { GiftIcon, HeartIcon, Copy, Check } from "lucide-react"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { KycWarningBanner } from "@/components/kyc-warning-banner"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { unitSystem, setUnitSystem } = useApp()
  const [isReferOpen, setIsReferOpen] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const referralLink = "https://telehealth.app/ref/dr-smith-123"

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  const getActiveSidebarItem = () => {
    if (pathname.includes("/receptionist")) return "receptionist"
    if (pathname.includes("/my-patients")) return "patients"
    if (pathname.includes("/agenda")) return "agenda"
    if (pathname.includes("/catalog")) return "catalog"
    if (pathname.includes("/finance")) return "finance"
    if (pathname.includes("/messages")) return "chat"
    if (pathname.includes("/settings")) return "settings"
    return ""
  }

  const getBreadcrumbs = () => {
    if (pathname.includes("/receptionist")) return [{ label: "Receptionist", active: true }]
    if (pathname.includes("/agenda")) return [{ label: "My Calendar", active: true }]
    if (pathname.includes("/finance")) return [{ label: "Finance & Rewards", active: true }]
    if (pathname.includes("/settings")) return [{ label: "Settings", active: true }]
    if (pathname.includes("/messages")) return [{ label: "Messages", active: true }]
    if (pathname.includes("/catalog")) return [{ label: "Catalog", active: true }]

    if (pathname === "/my-patients") {
      return [{ label: "My Patients", active: true }]
    }

    if (pathname.includes("/my-patients/")) {
      return [
        { label: "My Patients", href: "/my-patients" },
        { label: "Patient Details", active: true },
      ]
    }

    return []
  }

  const headerActions = (
    <>
      <Dialog open={isReferOpen} onOpenChange={setIsReferOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
            <GiftIcon className="h-4 w-4" />
            Refer
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Refer a Colleague</DialogTitle>
            <DialogDescription>
              Share this unique link to refer other healthcare professionals to the platform.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2">
            <div className="grid flex-1 gap-2">
              <Label htmlFor="link" className="sr-only">
                Link
              </Label>
              <Input id="link" defaultValue={referralLink} readOnly />
            </div>
            <Button type="submit" size="sm" className="px-3" onClick={handleCopyLink}>
              {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              <span className="sr-only">Copy</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Button variant="outline" size="sm" className="gap-2 bg-transparent">
        <HeartIcon className="h-4 w-4" />
        Feedback
      </Button>
    </>
  )

  const handleNavigate = (view: string) => {
    switch (view) {
      case "receptionist":
        router.push("/receptionist")
        break
      case "patients":
        router.push("/my-patients")
        break
      case "agenda":
        router.push("/agenda")
        break
      case "catalog":
        router.push("/catalog")
        break
      case "finance":
        router.push("/finance")
        break
      case "chat":
        router.push("/messages")
        break
      case "settings":
        router.push("/settings")
        break
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        activeItem={getActiveSidebarItem()}
        onNavigate={handleNavigate}
        unitSystem={unitSystem}
        onUnitChange={setUnitSystem}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Suspense fallback={null}>
          <KycWarningBanner />
        </Suspense>
        <BreadcrumbNav items={getBreadcrumbs()} actions={headerActions} />
        {children}
      </div>
    </div>
  )
}
