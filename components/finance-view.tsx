"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
  Wallet,
  CreditCard,
  Building2,
  TrendingUp,
  History,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  Users,
  Gift,
  Clock,
  UserCheck,
  Copy,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const referrals = [
  {
    id: "ref-001",
    name: "Dr. Binh Nguyen",
    email: "binh.nguyen@medical.vn",
    avatar: null,
    specialty: "Internal Medicine",
    referredDate: "2025-01-28",
    status: "kyc_pending",
    kycStep: 2, // On step 2 of 4
    totalSteps: 4,
    rewardEarned: null,
    potentialReward: "500,000",
  },
  {
    id: "ref-002",
    name: "Dr. Linh Tran",
    email: "linh.tran@hospital.vn",
    avatar: null,
    specialty: "Pediatrics",
    referredDate: "2025-01-15",
    status: "active",
    kycStep: 4,
    totalSteps: 4,
    rewardEarned: "500,000",
    potentialReward: null,
    firstOrderDate: "2025-01-20",
  },
  {
    id: "ref-003",
    name: "Dr. Minh Hoang",
    email: "minh.hoang@clinic.vn",
    avatar: null,
    specialty: "Dermatology",
    referredDate: "2025-01-10",
    status: "active",
    kycStep: 4,
    totalSteps: 4,
    rewardEarned: "500,000",
    potentialReward: null,
    firstOrderDate: "2025-01-12",
  },
  {
    id: "ref-004",
    name: "Dr. Hoa Pham",
    email: "hoa.pham@medical.vn",
    avatar: null,
    specialty: "Cardiology",
    referredDate: "2025-01-05",
    status: "invited",
    kycStep: 0,
    totalSteps: 4,
    rewardEarned: null,
    potentialReward: "500,000",
  },
]

export function FinanceView() {
  const [isEditingBank, setIsEditingBank] = useState(false)
  const [copied, setCopied] = useState(false)
  const [bankDetails, setBankDetails] = useState({
    bankName: "Vietcombank",
    accountName: "DR SARAH JOHNSON",
    accountNumber: "**** **** **** 8888",
    branch: "Hanoi Main Branch",
  })

  const referralLink = "https://nexthealth.app/onboarding?ref=dr-smith-123"

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const referralStats = {
    total: referrals.length,
    active: referrals.filter((r) => r.status === "active").length,
    pending: referrals.filter((r) => r.status === "kyc_pending").length,
    invited: referrals.filter((r) => r.status === "invited").length,
    totalEarned: referrals.reduce(
      (sum, r) => sum + (r.rewardEarned ? Number.parseInt(r.rewardEarned.replace(/,/g, "")) : 0),
      0,
    ),
    potentialEarnings: referrals.reduce(
      (sum, r) => sum + (r.potentialReward ? Number.parseInt(r.potentialReward.replace(/,/g, "")) : 0),
      0,
    ),
  }

  const transactions = [
    {
      id: "TRX-9823",
      date: "2024-03-20",
      patient: "Hoàng Trọng Sang",
      test: "Thyroid Panel (TSH, T3, T4)",
      lab: "Diag Center - Cao Thắng",
      amount: "150,000",
      status: "pending",
    },
    {
      id: "TRX-9822",
      date: "2024-03-19",
      patient: "Nguyễn Thị Mai",
      test: "MRI Brain Scan",
      lab: "Bernard Clinic",
      amount: "450,000",
      status: "pending",
    },
    {
      id: "TRX-9821",
      date: "2024-03-15",
      patient: "Trần Văn Hùng",
      test: "General Health Checkup",
      lab: "Doctor Check",
      amount: "300,000",
      status: "paid",
    },
    {
      id: "TRX-9820",
      date: "2024-03-12",
      patient: "Lê Thị Lan",
      test: "Diabetes Screening",
      lab: "Diag Center - Cao Thắng",
      amount: "80,000",
      status: "paid",
    },
    {
      id: "TRX-9819",
      date: "2024-03-10",
      patient: "Phạm Minh Tuấn",
      test: "Liver Function Tests",
      lab: "Medic Hòa Hảo",
      amount: "120,000",
      status: "paid",
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200">
            <UserCheck className="w-3 h-3 mr-1" />
            Active
          </Badge>
        )
      case "kyc_pending":
        return (
          <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200">
            <Clock className="w-3 h-3 mr-1" />
            KYC In Progress
          </Badge>
        )
      case "invited":
        return (
          <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-100 border-slate-200">
            <Clock className="w-3 h-3 mr-1" />
            Invited
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <div className="flex-1 overflow-y-auto bg-muted/10 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Finance & Rewards</h1>
            <p className="text-muted-foreground">Manage your bank details and track your commission rewards.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2 bg-transparent">
              <History className="h-4 w-4" />
              Export Statement
            </Button>
            <Button className="gap-2">
              <ArrowUpRight className="h-4 w-4" />
              Request Payout
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">₫15,450,000</div>
              <p className="text-xs text-muted-foreground">+12.5% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Payout</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">₫2,850,000</div>
              <p className="text-xs text-muted-foreground">Available for withdrawal</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tests Ordered</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">142</div>
              <p className="text-xs text-muted-foreground">Across 5 partner labs</p>
            </CardContent>
          </Card>
          <Card className="border-emerald-200 bg-emerald-50/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-emerald-700">Referral Bonuses</CardTitle>
              <Gift className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">₫{referralStats.totalEarned.toLocaleString()}</div>
              <p className="text-xs text-emerald-600/70">
                +₫{referralStats.potentialEarnings.toLocaleString()} pending
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="referrals" className="gap-2">
              <Users className="h-4 w-4" />
              My Referrals
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                {referrals.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="bank-details">Bank Details</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Commission Rewards</CardTitle>
                <CardDescription>Your rewards for ordering lab tests at our partner facilities.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Test / Procedure</TableHead>
                      <TableHead>Lab Facility</TableHead>
                      <TableHead className="text-right">Commission Reward</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((trx) => (
                      <TableRow key={trx.id}>
                        <TableCell className="font-medium">{trx.date}</TableCell>
                        <TableCell>{trx.patient}</TableCell>
                        <TableCell>{trx.test}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="bg-blue-50 text-blue-700 hover:bg-blue-50 border-blue-200"
                          >
                            {trx.lab}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium text-green-600">+₫{trx.amount}</TableCell>
                        <TableCell className="text-right">
                          <Badge
                            variant={trx.status === "paid" ? "default" : "secondary"}
                            className={
                              trx.status === "paid"
                                ? "bg-green-500 hover:bg-green-600"
                                : "bg-amber-500 hover:bg-amber-600 text-white"
                            }
                          >
                            {trx.status === "paid" ? "Paid" : "Pending"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="referrals" className="space-y-4">
            {/* Referral Link Card */}
            <Card className="border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-emerald-800">Invite Colleagues</CardTitle>
                    <CardDescription className="text-emerald-600/80">
                      Earn ₫500,000 for each doctor who completes KYC and places their first order
                    </CardDescription>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Gift className="h-6 w-6 text-emerald-600" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input value={referralLink} readOnly className="bg-white border-emerald-200 text-sm font-mono" />
                  <Button
                    onClick={handleCopyLink}
                    variant="outline"
                    className="shrink-0 border-emerald-300 text-emerald-700 hover:bg-emerald-100 bg-transparent"
                  >
                    {copied ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Link
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Referral Stats */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                      <UserCheck className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{referralStats.active}</p>
                      <p className="text-sm text-muted-foreground">Active Referrals</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{referralStats.pending}</p>
                      <p className="text-sm text-muted-foreground">Completing KYC</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                      <Users className="h-5 w-5 text-slate-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{referralStats.invited}</p>
                      <p className="text-sm text-muted-foreground">Awaiting Sign-up</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Referrals Table */}
            <Card>
              <CardHeader>
                <CardTitle>Your Referral Network</CardTitle>
                <CardDescription>Track the onboarding progress of doctors you've invited</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Doctor</TableHead>
                      <TableHead>Specialty</TableHead>
                      <TableHead>Invited On</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>KYC Progress</TableHead>
                      <TableHead className="text-right">Reward</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {referrals.map((referral) => (
                      <TableRow key={referral.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarImage src={referral.avatar || undefined} />
                              <AvatarFallback className="bg-emerald-100 text-emerald-700 text-sm">
                                {referral.name
                                  .split(" ")
                                  .slice(1)
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{referral.name}</p>
                              <p className="text-xs text-muted-foreground">{referral.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{referral.specialty}</TableCell>
                        <TableCell className="text-muted-foreground">{referral.referredDate}</TableCell>
                        <TableCell>{getStatusBadge(referral.status)}</TableCell>
                        <TableCell>
                          <div className="w-32 space-y-1">
                            <Progress value={(referral.kycStep / referral.totalSteps) * 100} className="h-2" />
                            <p className="text-xs text-muted-foreground">
                              Step {referral.kycStep} of {referral.totalSteps}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {referral.rewardEarned ? (
                            <span className="font-medium text-emerald-600">+₫{referral.rewardEarned}</span>
                          ) : (
                            <span className="text-muted-foreground text-sm">₫{referral.potentialReward} pending</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bank-details">
            <Card>
              <CardHeader>
                <CardTitle>Bank Account Information (KYC)</CardTitle>
                <CardDescription>Provide your bank details to receive commission payouts.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3 items-start">
                  <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium text-yellow-800">Verification Required</h4>
                    <p className="text-sm text-yellow-700">
                      Please ensure the account name matches your registered doctor profile exactly. KYC verification
                      typically takes 1-2 business days.
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Bank Name</Label>
                    {isEditingBank ? (
                      <Select defaultValue="vcb">
                        <SelectTrigger>
                          <SelectValue placeholder="Select Bank" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="vcb">Vietcombank</SelectItem>
                          <SelectItem value="tcb">Techcombank</SelectItem>
                          <SelectItem value="mb">MB Bank</SelectItem>
                          <SelectItem value="acb">ACB</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/50">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        {bankDetails.bankName}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Branch</Label>
                    {isEditingBank ? (
                      <Input defaultValue={bankDetails.branch} />
                    ) : (
                      <div className="p-2 border rounded-md bg-muted/50">{bankDetails.branch}</div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Account Number</Label>
                    {isEditingBank ? (
                      <Input defaultValue={bankDetails.accountNumber} />
                    ) : (
                      <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/50 font-mono">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        {bankDetails.accountNumber}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Account Holder Name</Label>
                    {isEditingBank ? (
                      <Input defaultValue={bankDetails.accountName} />
                    ) : (
                      <div className="p-2 border rounded-md bg-muted/50">{bankDetails.accountName}</div>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end border-t p-6">
                {isEditingBank ? (
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setIsEditingBank(false)}>
                      Cancel
                    </Button>
                    <Button onClick={() => setIsEditingBank(false)}>Save Changes</Button>
                  </div>
                ) : (
                  <Button onClick={() => setIsEditingBank(true)}>Edit Details</Button>
                )}
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
