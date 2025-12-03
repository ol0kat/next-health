"use client"

import { useApp } from "@/components/app-provider"
import { PatientListView } from "@/components/patient-list-view"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

export default function MyPatientsPage() {
  const { patients, refreshPatients, isLoadingPatients } = useApp()
  const router = useRouter()

  useEffect(() => {
    refreshPatients()
  }, [refreshPatients])

  if (isLoadingPatients && patients.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading patients...</p>
        </div>
      </div>
    )
  }

  return <PatientListView patients={patients} onSelectPatient={(id) => router.push(`/my-patients/${id}`)} />
}
