"use client"

import { useState } from "react"
import { InsuranceCardManager } from "@/components/insurance-card-manager"
import { AlertCircle } from "lucide-react"

export default function PhlebotomyPage() {
  const [activeTab, setActiveTab] = useState<"vitals" | "insurance">("vitals")

  // Demo patient data
  const demoPatientId = "patient_123"
  const demoPatientName = "Sarah Johnson"

  return (
    <div className="w-full">
      {activeTab === "vitals" ? (
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <div>
              <h2 className="font-semibold text-yellow-900">Phlebotomy vitals module</h2>
              <p className="text-sm text-yellow-700">This module is being refactored. Please use the Receptionist view for vital signs capture.</p>
            </div>
          </div>
        </div>
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
