"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useRef, type ReactNode, useCallback } from "react"
import { getPatients } from "@/lib/actions/patients"

export type UnitSystem = "US" | "SI"

export interface Patient {
  id: string
  supabaseId: string
  name: string
  dob: string
  phone: string
  gender?: string
  age?: number
  lastVisit?: string
  examDate: string
  patientStatus: string
  paymentStatus: string
  citizenId?: string
  bhytCardNumber?: string
  bhytCoverageLevel?: number
  bhytRegisteredFacility?: string
  bhytValidTo?: string
  bhytStatus?: string
  symptoms?: string[]
  medicalHistory?: string[]
  familyHistory?: string[]
  vaccinations?: Array<{ name: string; date: string }>
  lifestyle?: {
    smoking?: string
    alcohol?: string
    exercise?: string
    diet?: string
  }
  occupation?: string
  address?: string
  hiCode?: string
  email?: string
  vitals?: {
    height?: string
    weight?: string
    temp?: string
    bp?: string
    pulse?: string
    respRate?: string
    spo2?: string
    bmi?: string
    capturedAt?: string
  }
  externalHistory?: Array<{
    date: string
    facility: string
    diagnosis: string
    treatment: string
  }>
  documents?: Array<{
    id: number
    title: string
    type: string
    date: string
    size: string
    doctor: string
    status: string
  }>
  clinicalNotes?: Array<{
    id: number
    date: string
    title: string
    type: string
    content: string
    tags: string[]
  }>
}

export interface Prescription {
  ma_don_thuoc: string
  ngay_gio_ke_don: string
  thong_tin_don_thuoc: Array<{
    ten_thuoc: string
    biet_duoc: string
    don_vi_tinh: string
    so_luong: string
    cach_dung: string
  }>
  chan_doan: Array<{
    ma_chan_doan: string
    ten_chan_doan: string
  }>
  tests?: string[]
  procedures?: string[]
  notes?: string
}

export interface Order {
  id: string
  patientId: string
  patientName?: string
  tests: string[]
  date: string
  status: string
  timeframe: string
  notes: string
}

interface AppContextType {
  patients: Patient[]
  setPatients: React.Dispatch<React.SetStateAction<Patient[]>>
  refreshPatients: () => Promise<void>
  isLoadingPatients: boolean
  unitSystem: UnitSystem
  setUnitSystem: React.Dispatch<React.SetStateAction<UnitSystem>>
  cartItems: string[]
  setCartItems: React.Dispatch<React.SetStateAction<string[]>>
  prescriptions: Prescription[]
  setPrescriptions: React.Dispatch<React.SetStateAction<Prescription[]>>
  orders: Order[]
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>
}

const AppContext = createContext<AppContextType | undefined>(undefined)

function transformDbPatient(dbPatient: Record<string, unknown>): Patient {
  const firstName = (dbPatient.first_name as string) || ""
  const middleName = (dbPatient.middle_name as string) || ""
  const lastName = (dbPatient.last_name as string) || ""
  const fullName = [firstName, middleName, lastName].filter(Boolean).join(" ")

  const dob = dbPatient.date_of_birth as string
  const age = dob ? Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : undefined

  const supabaseId = dbPatient.id as string

  return {
    id: supabaseId,
    supabaseId: supabaseId,
    name: fullName.toUpperCase(),
    dob: dob || "",
    phone: (dbPatient.phone_primary as string) || "",
    gender: (dbPatient.gender as string) || undefined,
    age,
    lastVisit: dbPatient.updated_at
      ? new Date(dbPatient.updated_at as string).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : undefined,
    examDate: dbPatient.created_at ? new Date(dbPatient.created_at as string).toISOString().split("T")[0] : "",
    patientStatus: "Active",
    paymentStatus: "Unpaid",
    citizenId: (dbPatient.citizen_id as string) || undefined,
    bhytCardNumber: (dbPatient.bhyt_card_number as string) || undefined,
    bhytCoverageLevel: (dbPatient.bhyt_coverage_level as number) || undefined,
    bhytRegisteredFacility: (dbPatient.bhyt_registered_facility_name as string) || undefined,
    bhytValidTo: (dbPatient.bhyt_valid_to as string) || undefined,
    bhytStatus: (dbPatient.bhyt_status as string) || undefined,
    address:
      [dbPatient.address_street, dbPatient.address_city, dbPatient.address_state].filter(Boolean).join(", ") ||
      undefined,
    email: (dbPatient.email as string) || undefined,
    medicalHistory: (dbPatient.allergies as string[])?.map((a) => `Allergy: ${a}`) || [],
    documents: [],
    clinicalNotes: [],
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [unitSystem, setUnitSystem] = useState<UnitSystem>("US")
  const [cartItems, setCartItems] = useState<string[]>([])
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [isLoadingPatients, setIsLoadingPatients] = useState(true)

  const isHydrated = useRef(false)
  const hasLoadedData = useRef(false)

  const refreshPatients = useCallback(async () => {
    setIsLoadingPatients(true)
    try {
      const result = await getPatients()
      if (result.data && !result.error) {
        const transformedPatients = result.data.map(transformDbPatient)
        setPatients(transformedPatients)
      }
    } catch (error) {
      console.error("Error fetching patients:", error)
    } finally {
      setIsLoadingPatients(false)
    }
  }, [])

  useEffect(() => {
    if (hasLoadedData.current) return
    hasLoadedData.current = true

    refreshPatients()

    const savedOrders = localStorage.getItem("orders_data")
    if (savedOrders) {
      try {
        const parsed = JSON.parse(savedOrders)
        setOrders(parsed)
      } catch (e) {
        console.error("Failed to parse orders data", e)
      }
    }

    const savedPrescriptions = localStorage.getItem("prescriptions_data")
    if (savedPrescriptions) {
      try {
        const parsed = JSON.parse(savedPrescriptions)
        setPrescriptions(parsed)
      } catch (e) {
        console.error("Failed to parse prescriptions data", e)
      }
    }

    setTimeout(() => {
      isHydrated.current = true
    }, 100)
  }, [refreshPatients])

  useEffect(() => {
    if (isHydrated.current) {
      localStorage.setItem("orders_data", JSON.stringify(orders))
    }
  }, [orders])

  useEffect(() => {
    if (isHydrated.current) {
      localStorage.setItem("prescriptions_data", JSON.stringify(prescriptions))
    }
  }, [prescriptions])

  return (
    <AppContext.Provider
      value={{
        patients,
        setPatients,
        refreshPatients,
        isLoadingPatients,
        unitSystem,
        setUnitSystem,
        cartItems,
        setCartItems,
        prescriptions,
        setPrescriptions,
        orders,
        setOrders,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider")
  }
  return context
}
