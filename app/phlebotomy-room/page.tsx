"use client"

import { useState } from "react"
import { PhlebotomyRoomScreen } from "@/components/phlebotomy-room-screen"
import { InsuranceCardManager } from "@/components/insurance-card-manager"

export default function PhlebotomyPage() {
  const [activeTab, setActiveTab] = useState<"vitals" | "insurance">("vitals")

  // Demo patient data
  const demoPatientId = "patient_123"
  const demoPatientName = "Sarah Johnson"
  const demoHeight = 165 // cm from previous visit

  return (
    <div className="w-full">
      {activeTab === "vitals" ? (
        <PhlebotomyRoomScreen
          patientId={demoPatientId}
          patientName={demoPatientName}
          previousHeightCm={demoHeight}
          onVitalsSaved={(vitals) => {
            console.log("Vitals saved:", vitals)
            alert("Vitals recorded successfully!")
          }}
        />
      ) : (
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-slate-900">Insurance Card Management</h1>
            <p className="text-muted-foreground">Patient: {demoPatientName}</p>
          </div>
          <InsuranceCardManager
            patientId={demoPatientId}
            cards={[]}
          />
        </div>
      )}

      {/* Tab Navigation */}
      <div className="fixed bottom-6 right-6 flex gap-2 bg-white rounded-lg shadow-lg p-2 border">
        <button
          onClick={() => setActiveTab("vitals")}
          className={`px-4 py-2 rounded ${
            activeTab === "vitals"
              ? "bg-blue-600 text-white"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          Vitals
        </button>
        <button
          onClick={() => setActiveTab("insurance")}
          className={`px-4 py-2 rounded ${
            activeTab === "insurance"
              ? "bg-blue-600 text-white"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          Insurance
        </button>
      </div>
    </div>
  )
}
