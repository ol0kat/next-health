"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Download,
  FileText,
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface ImagingFinding {
  id: string
  bodyArea: string
  testType: string
  date: string
  abnormalityLevel: "normal" | "slightly-abnormal" | "very-abnormal"
  keyFindings: string[]
  radiologistNotes: string
  comparison: string // "stable", "improved", "worsened"
  requiresFollowUp: boolean
  followUpRecommendation?: string
}

const IMAGING_RESULTS: ImagingFinding[] = [
  {
    id: "img001",
    bodyArea: "Chest",
    testType: "X-Ray",
    date: "2025-01-15",
    abnormalityLevel: "very-abnormal",
    keyFindings: [
      "Left lower lobe consolidation",
      "Small left pleural effusion",
      "Heart size at upper limit of normal",
    ],
    radiologistNotes: "Findings consistent with pneumonia. Recommend clinical correlation and follow-up imaging.",
    comparison: "worsened",
    requiresFollowUp: true,
    followUpRecommendation: "Follow-up chest X-ray in 2-4 weeks",
  },
  {
    id: "img002",
    bodyArea: "Abdomen",
    testType: "CT",
    date: "2025-01-10",
    abnormalityLevel: "slightly-abnormal",
    keyFindings: ["Small gallstones noted", "No acute findings"],
    radiologistNotes: "Incidental cholelithiasis. No signs of cholecystitis.",
    comparison: "stable",
    requiresFollowUp: false,
  },
  {
    id: "img003",
    bodyArea: "Knee",
    testType: "MRI",
    date: "2024-12-28",
    abnormalityLevel: "slightly-abnormal",
    keyFindings: [
      "Grade 2 chondromalacia patellae",
      "Small joint effusion",
      "No meniscal tear",
    ],
    radiologistNotes: "Mild degenerative changes. Recommend conservative management.",
    comparison: "stable",
    requiresFollowUp: false,
  },
  {
    id: "img004",
    bodyArea: "Brain",
    testType: "MRI",
    date: "2024-12-15",
    abnormalityLevel: "normal",
    keyFindings: ["No acute intracranial abnormality", "No mass or midline shift"],
    radiologistNotes: "Unremarkable MRI head.",
    comparison: "stable",
    requiresFollowUp: false,
  },
  {
    id: "img005",
    bodyArea: "Lumbar Spine",
    testType: "X-Ray",
    date: "2024-12-10",
    abnormalityLevel: "slightly-abnormal",
    keyFindings: ["L4-L5 disc space narrowing", "Mild degenerative changes"],
    radiologistNotes: "Chronic degenerative disc disease.",
    comparison: "stable",
    requiresFollowUp: false,
  },
]

const getAbnormalityIcon = (level: string) => {
  switch (level) {
    case "very-abnormal":
      return <AlertCircle className="w-5 h-5" />
    case "slightly-abnormal":
      return <AlertTriangle className="w-5 h-5" />
    case "normal":
      return <CheckCircle className="w-5 h-5" />
    default:
      return null
  }
}

const getAbnormalityColor = (level: string) => {
  switch (level) {
    case "very-abnormal":
      return "bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900"
    case "slightly-abnormal":
      return "bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900"
    case "normal":
      return "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900"
    default:
      return ""
  }
}

const getAbnormalityBadgeColor = (level: string) => {
  switch (level) {
    case "very-abnormal":
      return "destructive"
    case "slightly-abnormal":
      return "secondary"
    case "normal":
      return "outline"
    default:
      return "default"
  }
}

const getComparisonBadge = (comparison: string) => {
  const colors = {
    improved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    stable: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200",
    worsened: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  }
  return colors[comparison as keyof typeof colors] || colors.stable
}

export function ImagingResultsView() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterAbnormality, setFilterAbnormality] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Filter results
  const filteredResults = IMAGING_RESULTS.filter((result) => {
    const matchesSearch =
      result.bodyArea.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.testType.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = !filterAbnormality || result.abnormalityLevel === filterAbnormality
    return matchesSearch && matchesFilter
  })

  // Sort by abnormality level (very-abnormal first)
  const sortedResults = [...filteredResults].sort((a, b) => {
    const order = { "very-abnormal": 0, "slightly-abnormal": 1, normal: 2 }
    return order[a.abnormalityLevel as keyof typeof order] - order[b.abnormalityLevel as keyof typeof order]
  })

  // Count by severity
  const counts = {
    veryAbnormal: IMAGING_RESULTS.filter((r) => r.abnormalityLevel === "very-abnormal").length,
    slightlyAbnormal: IMAGING_RESULTS.filter((r) => r.abnormalityLevel === "slightly-abnormal").length,
    normal: IMAGING_RESULTS.filter((r) => r.abnormalityLevel === "normal").length,
  }

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Imaging Results Summary</h2>
        <p className="text-muted-foreground text-sm">
          Quick overview of abnormality flags - focus on what matters
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className={cn("border-2", counts.veryAbnormal > 0 ? "border-red-300 bg-red-50 dark:bg-red-950/20" : "")}>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">VERY ABNORMAL</p>
                <p className="text-3xl font-bold text-red-600 dark:text-red-400">{counts.veryAbnormal}</p>
                <p className="text-xs text-muted-foreground mt-1">Requires attention</p>
              </div>
              <AlertCircle className="w-10 h-10 text-red-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className={cn("border-2", counts.slightlyAbnormal > 0 ? "border-amber-300 bg-amber-50 dark:bg-amber-950/20" : "")}>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">SLIGHTLY ABNORMAL</p>
                <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">{counts.slightlyAbnormal}</p>
                <p className="text-xs text-muted-foreground mt-1">Monitor</p>
              </div>
              <AlertTriangle className="w-10 h-10 text-amber-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className={cn("border-2", counts.normal > 0 ? "border-green-300 bg-green-50 dark:bg-green-950/20" : "")}>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">NORMAL</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">{counts.normal}</p>
                <p className="text-xs text-muted-foreground mt-1">No action needed</p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter & Search */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search body area or test type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={filterAbnormality === "very-abnormal" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterAbnormality(filterAbnormality === "very-abnormal" ? null : "very-abnormal")}
            className={filterAbnormality === "very-abnormal" ? "bg-red-600 hover:bg-red-700" : ""}
          >
            <AlertCircle className="w-4 h-4 mr-2" />
            Critical
          </Button>
          <Button
            variant={filterAbnormality === "slightly-abnormal" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterAbnormality(filterAbnormality === "slightly-abnormal" ? null : "slightly-abnormal")}
            className={filterAbnormality === "slightly-abnormal" ? "bg-amber-600 hover:bg-amber-700" : ""}
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            Caution
          </Button>
        </div>
      </div>

      {/* Results List */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="space-y-3 pr-4">
            {sortedResults.length === 0 ? (
              <Card>
                <CardContent className="pt-8 text-center">
                  <p className="text-muted-foreground">No imaging results found</p>
                </CardContent>
              </Card>
            ) : (
              sortedResults.map((result) => (
                <Card
                  key={result.id}
                  className={cn(
                    "border-2 cursor-pointer transition-all hover:shadow-md",
                    getAbnormalityColor(result.abnormalityLevel),
                    expandedId === result.id && "ring-2 ring-primary"
                  )}
                  onClick={() => setExpandedId(expandedId === result.id ? null : result.id)}
                >
                  {/* Collapsed View - Quick Scan */}
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className="mt-1">
                        {getAbnormalityIcon(result.abnormalityLevel)}
                      </div>

                      {/* Main Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <h3 className="font-bold text-lg">{result.bodyArea}</h3>
                          <Badge variant="outline" className="text-xs">
                            {result.testType}
                          </Badge>
                          <Badge
                            variant={getAbnormalityBadgeColor(result.abnormalityLevel)}
                            className="text-xs font-semibold"
                          >
                            {result.abnormalityLevel === "very-abnormal"
                              ? "VERY ABNORMAL"
                              : result.abnormalityLevel === "slightly-abnormal"
                                ? "SLIGHTLY ABNORMAL"
                                : "NORMAL"}
                          </Badge>
                        </div>

                        {/* Key Findings - Scannable List */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                          {result.keyFindings.map((finding, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-sm">
                              <span className="text-muted-foreground mt-0.5">•</span>
                              <span className="font-medium leading-snug">{finding}</span>
                            </div>
                          ))}
                        </div>

                        {/* Quick Status Bar */}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            📅 {new Date(result.date).toLocaleDateString()}
                          </span>
                          <span className={cn("px-2 py-0.5 rounded text-xs font-semibold", getComparisonBadge(result.comparison))}>
                            {result.comparison.toUpperCase()}
                          </span>
                          {result.requiresFollowUp && (
                            <span className="flex items-center gap-1 text-orange-600 dark:text-orange-400 font-semibold">
                              🚩 Follow-up needed
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Expand Icon */}
                      <div className="mt-1">
                        {expandedId === result.id ? (
                          <ChevronDown className="w-5 h-5 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                    </div>

                    {/* Expanded View - Full Details */}
                    {expandedId === result.id && (
                      <div className="mt-4 pt-4 border-t space-y-3">
                        <div>
                          <h4 className="font-semibold text-sm mb-2">Radiologist Notes</h4>
                          <p className="text-sm text-muted-foreground leading-relaxed">{result.radiologistNotes}</p>
                        </div>

                        {result.requiresFollowUp && result.followUpRecommendation && (
                          <div className="bg-orange-100/50 dark:bg-orange-900/20 border border-orange-300 dark:border-orange-800 rounded p-3">
                            <p className="text-sm font-semibold text-orange-900 dark:text-orange-200 mb-1">
                              Follow-up Recommendation
                            </p>
                            <p className="text-sm text-orange-800 dark:text-orange-300">{result.followUpRecommendation}</p>
                          </div>
                        )}

                        <div className="flex gap-2 pt-2">
                          <Button size="sm" variant="outline" className="text-xs">
                            <Download className="w-3 h-3 mr-1" />
                            Download Report
                          </Button>
                          <Button size="sm" variant="outline" className="text-xs">
                            <FileText className="w-3 h-3 mr-1" />
                            View Full Images
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
