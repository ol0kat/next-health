"use client"

import { SettingsView } from "@/components/settings-view"
import { useApp } from "@/components/app-provider"

export default function SettingsPage() {
  const { unitSystem, setUnitSystem } = useApp()
  return <SettingsView unitSystem={unitSystem} onUnitChange={setUnitSystem} />
}
