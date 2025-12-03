"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, MoreHorizontal } from "lucide-react"

interface PatientListViewProps {
  patients: Array<{
    id: string
    name: string
    dob: string
    phone: string
    gender?: string
    age?: number
    lastVisit?: string
    examDate: string
    patientStatus: string
    paymentStatus: string
  }>
  onSelectPatient: (id: string) => void
}

export function PatientListView({ patients, onSelectPatient }: PatientListViewProps) {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">My Patients</h2>
        
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Search patients..." className="pl-8" />
        </div>
      </div>

      <div className="border rounded-lg">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">ID</th>
              <th className="px-4 py-3 font-medium">Age/Gender</th>
              <th className="px-4 py-3 font-medium">Last Visit</th>
              <th className="px-4 py-3 font-medium">Patient Status</th>
              <th className="px-4 py-3 font-medium">Payment Status</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {patients.map((patient) => {
              const initials = patient.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .substring(0, 2)

              return (
                <tr
                  key={patient.id}
                  className="hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => onSelectPatient(patient.id)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{patient.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{patient.id}</td>
                  <td className="px-4 py-3">
                    {patient.age || "--"} / {patient.gender || "-"}
                  </td>
                  <td className="px-4 py-3">{patient.lastVisit || "--"}</td>
                  <td className="px-4 py-3">
                    <Badge
                      variant="outline"
                      className={
                        patient.patientStatus === "Waiting for reception"
                          ? "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400"
                          : patient.patientStatus === "Waiting for examination"
                            ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400"
                            : patient.patientStatus === "Examined"
                              ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400"
                              : patient.patientStatus === "Cancelled"
                                ? "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400"
                                : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      }
                    >
                      {patient.patientStatus}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant="outline"
                      className={
                        patient.paymentStatus === "Paid"
                          ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400"
                          : patient.paymentStatus === "No payment"
                            ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400"
                            : patient.paymentStatus === "Unpaid"
                              ? "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400"
                              : patient.paymentStatus === "Partially paid"
                                ? "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400"
                                : patient.paymentStatus === "Cancelled"
                                  ? "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400"
                                  : patient.paymentStatus === "Refunded"
                                    ? "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400"
                                    : "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400"
                      }
                    >
                      {patient.paymentStatus}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              )
            })}
            {patients.length === 0 && (
              <tr>
                <td colSpan={7} className="h-24 text-center text-muted-foreground">
                  No patients found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
