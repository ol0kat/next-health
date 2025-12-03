"use client"

import { useSearchParams } from "next/navigation"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function KycWarningBanner() {
  const searchParams = useSearchParams()
  const isExploreMode = searchParams.get("mode") === "explore"

  if (!isExploreMode) return null

  return (
    <div className="sticky top-0 z-50 flex items-center justify-between gap-4 bg-amber-50 border-b border-amber-200 px-4 py-2.5">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium text-amber-900">You are exploring in demo mode</span>
          <span className="text-xs text-amber-700">
            Complete your verification to unlock all features and start seeing patients.
          </span>
        </div>
      </div>
      <Button asChild size="sm" className="bg-amber-600 hover:bg-amber-700 text-white shrink-0">
        <Link href="/signup">Complete Verification</Link>
      </Button>
    </div>
  )
}
