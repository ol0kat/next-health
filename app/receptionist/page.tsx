"use client"

import { useApp } from "@/components/app-provider"
import { ReceptionistView } from "@/components/receptionist-view"

export default function ReceptionistPage() {
  const { patients, setPatients, refreshPatients } = useApp()
  return <ReceptionistView patients={patients} setPatients={setPatients} refreshPatients={refreshPatients} />
}
