"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ShoppingCart, Clock, CheckCircle2, AlertCircle, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"

interface Order {
  id: string
  patient_id: string
  patient_name?: string
  status: string
  tests_ordered: string
  total_amount: number
  patient_owes: number
  created_at: string
  notes?: string
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  completed: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-slate-100 text-slate-800",
}

const statusIcons: Record<string, any> = {
  pending: Clock,
  processing: ShoppingCart,
  completed: CheckCircle2,
  cancelled: AlertCircle,
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error

      // Fetch patient names for each order
      const enrichedOrders = await Promise.all(
        (data || []).map(async (order: any) => {
          const { data: patient } = await supabase
            .from("patients")
            .select("first_name, last_name")
            .eq("id", order.patient_id)
            .single()

          return {
            ...order,
            patient_name: patient
              ? `${patient.first_name} ${patient.last_name}`.trim()
              : "Unknown",
          }
        })
      )

      setOrders(enrichedOrders)
    } catch (error) {
      console.error("Error fetching orders:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredOrders = orders.filter(
    (order) =>
      order.patient_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.tests_ordered?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount)

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Lab Orders</h1>
          <p className="text-slate-600 mt-1">
            {orders.length} total orders • {orders.filter((o) => o.status === "pending").length} pending
          </p>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by patient name, order ID, or tests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Orders Table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12 text-slate-500">
                Loading orders...
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="flex items-center justify-center py-12 text-slate-500">
                No orders found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-[100px]">Order ID</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Tests Ordered</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Total Amount</TableHead>
                      <TableHead className="text-right">Patient Due</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => {
                      const StatusIcon = statusIcons[order.status] || AlertCircle
                      return (
                        <TableRow key={order.id} className="hover:bg-slate-50">
                          <TableCell className="font-mono text-sm font-bold text-blue-600">
                            {order.id.substring(0, 8)}...
                          </TableCell>
                          <TableCell className="font-medium">
                            {order.patient_name}
                          </TableCell>
                          <TableCell className="text-sm text-slate-600">
                            <div className="line-clamp-2">
                              {order.tests_ordered?.substring(0, 50)}
                              {order.tests_ordered?.length > 50 ? "..." : ""}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={cn("capitalize", statusColors[order.status] || "bg-slate-100")}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {order.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-bold">
                            {formatCurrency(order.total_amount)}
                          </TableCell>
                          <TableCell className="text-right font-bold text-slate-900">
                            {formatCurrency(order.patient_owes)}
                          </TableCell>
                          <TableCell className="text-sm text-slate-600">
                            {formatDate(order.created_at)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                // Could navigate to order details
                              }}
                            >
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Total Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {orders.length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {orders.filter((o) => o.status === "pending").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">
                {orders.filter((o) => o.status === "completed").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(
                  orders.reduce((sum, o) => sum + o.total_amount, 0)
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}
