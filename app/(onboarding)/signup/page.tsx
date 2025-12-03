import { Suspense } from "react"
import { SignupWizard } from "@/components/signup-wizard"

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <SignupWizard />
    </Suspense>
  )
}
