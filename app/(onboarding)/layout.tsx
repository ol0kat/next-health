import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Join NeXT Health - Professional Telehealth Platform",
  description: "You've been invited to join the leading telehealth platform for healthcare professionals",
}

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">{children}</div>
}
