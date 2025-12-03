"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, Loader2, CreditCard, Building2, Calendar, Star, User } from "lucide-react"
import { lookupBHYT } from "@/lib/actions/patients"

interface BHYTData {
  valid: boolean
  card_number: string
  coverage_level: number
  registered_facility_code: string
  registered_facility_name: string
  valid_from: string
  valid_to: string
  issuing_agency: string
  primary_site_code: string
  primary_site_name: string
  continuous_5yr_start: string | null
  new_card_number: string | null
  new_valid_from: string | null
  new_valid_to: string | null
  patient_name: string
  patient_gender: string
  patient_dob: string
}

interface BHYTLookupProps {
  onSelect?: (data: BHYTData) => void
  initialCitizenId?: string
  initialDob?: string
  initialName?: string
}

export function BHYTLookup({ onSelect, initialCitizenId = "", initialDob = "", initialName = "" }: BHYTLookupProps) {
  const [citizenId, setCitizenId] = useState(initialCitizenId)
  const [dob, setDob] = useState(initialDob)
  const [name, setName] = useState(initialName)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<BHYTData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleLookup = async () => {
    if (!citizenId || !dob || !name) {
      setError("Vui lòng nhập đầy đủ thông tin")
      return
    }

    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await lookupBHYT(citizenId, dob, name)
      if (response.data) {
        setResult(response.data)
      }
    } catch (err) {
      setError("Không thể tra cứu thông tin BHYT. Vui lòng thử lại.")
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "N/A"
    return new Date(dateStr).toLocaleDateString("vi-VN")
  }

  const getCoverageLevelLabel = (level: number) => {
    if (level >= 100) return "Level 1 - 100%"
    if (level >= 95) return "Level 2 - 95%"
    if (level >= 80) return "Level 4 - 80%"
    return `Level - ${level}%`
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Tra cứu BHYT
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="citizenId">CCCD / Mã thẻ BHYT</Label>
              <Input
                id="citizenId"
                placeholder="Nhập CCCD hoặc mã thẻ BHYT"
                value={citizenId}
                onChange={(e) => setCitizenId(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dob">Ngày sinh</Label>
              <Input id="dob" type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Họ và tên</Label>
              <Input id="name" placeholder="Nhập họ và tên" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
          </div>

          <Button onClick={handleLookup} disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang tra cứu...
              </>
            ) : (
              "Tra cứu BHYT"
            )}
          </Button>

          {error && <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">{error}</div>}
        </CardContent>
      </Card>

      {result && (
        <Card className={result.valid ? "border-green-500" : "border-red-500"}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                {result.valid ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                {result.valid ? "VALID" : "INVALID"} - Health Insurance Check
              </CardTitle>
              <Badge variant={result.valid ? "default" : "destructive"} className={result.valid ? "bg-green-500" : ""}>
                {result.valid ? "Hợp lệ" : "Không hợp lệ"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Patient Info */}
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="h-4 w-4" />
              <span className="font-medium text-foreground">{result.patient_name}</span>
              <span>({result.patient_gender})</span>
              <span>|</span>
              <span>{new Date(result.patient_dob).getFullYear()}</span>
            </div>

            {/* Card Info */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CreditCard className="h-4 w-4" />
                <span className="font-medium">CARD INFO:</span>
              </div>
              <div className="ml-6 space-y-1 text-sm">
                <p>
                  <span className="text-muted-foreground">Number:</span>{" "}
                  <span className="font-mono font-medium">{result.card_number}</span>
                </p>
                <p>
                  <span className="text-muted-foreground">Coverage:</span>{" "}
                  <span className="font-medium">
                    {result.coverage_level}% ({getCoverageLevelLabel(result.coverage_level)})
                  </span>
                </p>
                <p>
                  <span className="text-muted-foreground">Registered At:</span>{" "}
                  <span className="font-medium">
                    {result.registered_facility_name} ({result.registered_facility_code})
                  </span>
                </p>
                <p>
                  <span className="text-muted-foreground">Expiry:</span>{" "}
                  <span className="font-medium">{formatDate(result.valid_to)}</span>
                </p>
              </div>
            </div>

            {/* Benefits */}
            {result.continuous_5yr_start && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Star className="h-4 w-4" />
                  <span className="font-medium">BENEFITS:</span>
                </div>
                <div className="ml-6 space-y-1 text-sm">
                  <p>
                    <span className="text-muted-foreground">5-Year Continuous:</span>{" "}
                    <span className="font-medium text-green-600">
                      Active since {formatDate(result.continuous_5yr_start)}
                    </span>
                  </p>
                </div>
              </div>
            )}

            {/* Additional Details */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Building2 className="h-4 w-4" />
                <span className="font-medium">ADDITIONAL DETAILS:</span>
              </div>
              <div className="ml-6 space-y-1 text-sm">
                <p>
                  <span className="text-muted-foreground">Issuing Agency:</span>{" "}
                  <span className="font-medium">{result.issuing_agency}</span>
                </p>
                <p>
                  <span className="text-muted-foreground">Primary Site:</span>{" "}
                  <span className="font-medium">
                    {result.primary_site_name} ({result.primary_site_code})
                  </span>
                </p>
                <p>
                  <span className="text-muted-foreground">Valid Period:</span>{" "}
                  <span className="font-medium">
                    {formatDate(result.valid_from)} - {formatDate(result.valid_to)}
                  </span>
                </p>
              </div>
            </div>

            {/* New Card Info (if available) */}
            {result.new_card_number && (
              <div className="space-y-2 pt-2 border-t">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span className="font-medium">NEW CARD INFO:</span>
                </div>
                <div className="ml-6 space-y-1 text-sm">
                  <p>
                    <span className="text-muted-foreground">New Number:</span>{" "}
                    <span className="font-mono font-medium">{result.new_card_number}</span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Valid Period:</span>{" "}
                    <span className="font-medium">
                      {formatDate(result.new_valid_from)} - {formatDate(result.new_valid_to)}
                    </span>
                  </p>
                </div>
              </div>
            )}

            {onSelect && (
              <Button onClick={() => onSelect(result)} className="w-full mt-4">
                Sử dụng thông tin này
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
