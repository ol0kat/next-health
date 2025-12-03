"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Upload, Trash2, Plus, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"
import type { InsuranceCard } from "@/lib/patient-status"

interface InsuranceCardManagerProps {
  patientId: string
  cards?: InsuranceCard[]
  onCardUpdated?: (card: InsuranceCard) => void
}

export function InsuranceCardManager({ patientId, cards = [], onCardUpdated }: InsuranceCardManagerProps) {
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [editingCard, setEditingCard] = useState<InsuranceCard | null>(null)
  const [newCard, setNewCard] = useState({
    provider_name: "",
    member_id: "",
    group_number: "",
    plan_type: "",
    expiry_date: "",
  })

  const isExpired = (expiryDate: string) => new Date(expiryDate) < new Date()
  const daysUntilExpiry = (expiryDate: string) => {
    const days = Math.floor(
      (new Date(expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    )
    return days
  }

  const handleAddCard = () => {
    if (!newCard.provider_name || !newCard.member_id || !newCard.expiry_date) {
      alert("Please fill in required fields")
      return
    }

    const card: InsuranceCard = {
      id: `card_${Date.now()}`,
      patient_id: patientId,
      provider_name: newCard.provider_name,
      member_id: newCard.member_id,
      group_number: newCard.group_number,
      plan_type: newCard.plan_type,
      expiry_date: newCard.expiry_date,
      is_active: !isExpired(newCard.expiry_date),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    onCardUpdated?.(card)
    setNewCard({
      provider_name: "",
      member_id: "",
      group_number: "",
      plan_type: "",
      expiry_date: "",
    })
    setIsAddingNew(false)
  }

  const expiredCards = cards.filter((c) => isExpired(c.expiry_date))
  const expiringCards = cards.filter(
    (c) => !isExpired(c.expiry_date) && daysUntilExpiry(c.expiry_date) < 30
  )
  const activeCards = cards.filter(
    (c) => !isExpired(c.expiry_date) && daysUntilExpiry(c.expiry_date) >= 30
  )

  return (
    <div className="space-y-4">
      {/* Alerts */}
      {expiredCards.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900">
                  {expiredCards.length} Expired Insurance Card{expiredCards.length !== 1 ? "s" : ""}
                </h3>
                <p className="text-sm text-red-700 mt-1">
                  Patient has expired insurance. Update required for billing.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {expiringCards.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-900">
                  {expiringCards.length} Expiring Soon
                </h3>
                <p className="text-sm text-yellow-700 mt-1">
                  {expiringCards[0] && `${expiringCards[0].provider_name} expires in ${daysUntilExpiry(expiringCards[0].expiry_date)} days`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Cards */}
      {activeCards.length > 0 && (
        <div className="space-y-3">
          {activeCards.map((card) => (
            <Card key={card.id} className="border-emerald-200 bg-emerald-50">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-emerald-900">
                        {card.provider_name}
                      </h3>
                      <Badge variant="secondary" className="bg-emerald-600 text-white text-xs">
                        Active
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm text-emerald-800">
                      <div>
                        <span className="font-medium">Member ID:</span> {card.member_id}
                      </div>
                      {card.group_number && (
                        <div>
                          <span className="font-medium">Group:</span> {card.group_number}
                        </div>
                      )}
                      {card.plan_type && (
                        <div className="col-span-2">
                          <span className="font-medium">Plan:</span> {card.plan_type}
                        </div>
                      )}
                      <div className="col-span-2">
                        <span className="font-medium">Expires:</span> {new Date(card.expiry_date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingCard(card)}
                    >
                      <Upload className="h-3 w-3 mr-1" />
                      Photo
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        if (confirm("Delete this card?")) {
                          // Handle deletion
                        }
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Expired Cards */}
      {expiredCards.length > 0 && (
        <div className="space-y-3">
          {expiredCards.map((card) => (
            <Card key={card.id} className="border-red-200 bg-red-50 opacity-75">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-red-900">
                        {card.provider_name}
                      </h3>
                      <Badge variant="destructive" className="text-xs">
                        EXPIRED
                      </Badge>
                    </div>
                    <div className="text-sm text-red-800">
                      Expired on {new Date(card.expiry_date).toLocaleDateString()}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setEditingCard(card)}
                  >
                    Update
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add New Card */}
      {!isAddingNew && (
        <Button
          onClick={() => setIsAddingNew(true)}
          variant="outline"
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Insurance Card
        </Button>
      )}

      {isAddingNew && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Add New Insurance Card</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <div>
                <Label htmlFor="provider">Insurance Provider *</Label>
                <Input
                  id="provider"
                  placeholder="e.g. Blue Cross"
                  value={newCard.provider_name}
                  onChange={(e) =>
                    setNewCard({ ...newCard, provider_name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="memberId">Member ID *</Label>
                <Input
                  id="memberId"
                  placeholder="Member ID"
                  value={newCard.member_id}
                  onChange={(e) =>
                    setNewCard({ ...newCard, member_id: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="groupNumber">Group Number</Label>
                  <Input
                    id="groupNumber"
                    placeholder="Optional"
                    value={newCard.group_number}
                    onChange={(e) =>
                      setNewCard({ ...newCard, group_number: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="planType">Plan Type</Label>
                  <Input
                    id="planType"
                    placeholder="e.g. HMO"
                    value={newCard.plan_type}
                    onChange={(e) =>
                      setNewCard({ ...newCard, plan_type: e.target.value })
                    }
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="expiryDate">Expiry Date *</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={newCard.expiry_date}
                  onChange={(e) =>
                    setNewCard({ ...newCard, expiry_date: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button onClick={handleAddCard} className="flex-1">
                Save Card
              </Button>
              <Button
                onClick={() => {
                  setIsAddingNew(false)
                  setNewCard({
                    provider_name: "",
                    member_id: "",
                    group_number: "",
                    plan_type: "",
                    expiry_date: "",
                  })
                }}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Photo Upload Section */}
      {editingCard && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-base">
              Upload Card Photos - {editingCard.provider_name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm">Front of Card</Label>
              <div className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center cursor-pointer hover:bg-blue-100 transition-colors">
                <Upload className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <p className="text-sm text-blue-700 font-medium">Click to upload front photo</p>
                <p className="text-xs text-blue-600">PNG, JPG up to 10MB</p>
              </div>
            </div>
            <div>
              <Label className="text-sm">Back of Card</Label>
              <div className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center cursor-pointer hover:bg-blue-100 transition-colors">
                <Upload className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <p className="text-sm text-blue-700 font-medium">Click to upload back photo</p>
                <p className="text-xs text-blue-600">PNG, JPG up to 10MB</p>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                onClick={() => setEditingCard(null)}
                className="flex-1"
              >
                Done
              </Button>
              <Button
                onClick={() => setEditingCard(null)}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
