import { OnboardingView } from "@/components/onboarding-view"
import { Suspense } from "react"

export default function OnboardingPage() {
  return (
    <Suspense fallback={<OnboardingLoading />}>
      <OnboardingView />
    </Suspense>
  )
}

function OnboardingLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-emerald-100" />
        <div className="h-4 w-32 bg-emerald-100 rounded" />
      </div>
    </div>
  )
}
