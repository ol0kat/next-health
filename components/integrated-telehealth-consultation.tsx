"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Phone,
  MessageSquare,
  Plus,
  Send,
  AlertCircle,
  TrendingUp,
  Pill,
  FileText,
  Users,
  Lightbulb,
  X,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

// Type definitions for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number
  results: SpeechRecognitionResultList
}

interface SpeechRecognitionResultList {
  length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
  length: number
  item(index: number): SpeechRecognitionAlternative
  [index: number]: SpeechRecognitionAlternative
  isFinal: boolean
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
}

interface TranscriptMessage {
  id: string
  speaker: "doctor" | "patient"
  text: string
  timestamp: Date
}

interface SuggestedQuestion {
  id: string
  question: string
  category: string
  relevance: "high" | "medium" | "low"
  status: "pending" | "added" | "answered"
}

interface MedicalHistoryItem {
  id: string
  category: string
  content: string
  source: "transcript" | "manual"
  timestamp: Date
}

export function IntegratedTelehealthConsultation() {
  // Call State
  const [isCallActive, setIsCallActive] = useState(false)
  const [isMicOn, setIsMicOn] = useState(true)
  const [isVideoOn, setIsVideoOn] = useState(true)

  // Transcript & Recording
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([
    {
      id: "1",
      speaker: "patient",
      text: "Good morning doctor, I've been experiencing some headaches lately.",
      timestamp: new Date(Date.now() - 5000),
    },
  ])
  const [currentTranscriptText, setCurrentTranscriptText] = useState("")
  const [isRecording, setIsRecording] = useState(true)

  // Medical History
  const [medicalHistory, setMedicalHistory] = useState<MedicalHistoryItem[]>([
    {
      id: "1",
      category: "Chief Complaint",
      content: "Headaches for past 2 weeks",
      source: "transcript",
      timestamp: new Date(Date.now() - 5000),
    },
  ])

  // Suggested Questions (AI-generated)
  const [suggestedQuestions, setSuggestedQuestions] = useState<SuggestedQuestion[]>([
    {
      id: "1",
      question: "When did the headaches start? Is this a new onset?",
      category: "Onset & Timeline",
      relevance: "high",
      status: "pending",
    },
    {
      id: "2",
      question: "Have you had any visual disturbances or aura?",
      category: "Associated Symptoms",
      relevance: "high",
      status: "pending",
    },
    {
      id: "3",
      question: "Any history of migraines in your family?",
      category: "Family History",
      relevance: "medium",
      status: "pending",
    },
    {
      id: "4",
      question: "Are there any triggers you've noticed? (stress, certain foods, weather)",
      category: "Triggers",
      relevance: "medium",
      status: "pending",
    },
    {
      id: "5",
      question: "Have you tried any over-the-counter pain relief?",
      category: "Previous Treatment",
      relevance: "low",
      status: "pending",
    },
  ])

  // Active Tab for side panel
  const [activeSideTab, setActiveSideTab] = useState<"labs" | "prescription" | "history" | "questions">(
    "questions"
  )

  // Prescription State
  const [prescriptionDraft, setPrescriptionDraft] = useState({
    medications: [""],
    diagnoses: [""],
    instructions: "",
  })

  // Speech Recognition Setup
  const recognitionRef = useRef<any>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)

  useEffect(() => {
    // Initialize speech recognition if call is active
    if (isCallActive && isRecording) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition()
        recognitionRef.current = recognition
        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang = "en-US"

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          let interim = ""

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript

            if (event.results[i].isFinal) {
              // Add finalized message to transcript
              addTranscriptMessage("doctor", transcript)
              // AI: Analyze for medical history and suggest questions
              analyzeTranscriptForSuggestions(transcript)
            } else {
              interim += transcript
            }
          }
          setCurrentTranscriptText(interim)
        }

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error("Speech recognition error:", event.error)
        }

        recognition.start()

        return () => {
          recognition.stop()
        }
      }
    }
  }, [isCallActive, isRecording])

  const startCall = () => {
    setIsCallActive(true)
    setIsMicOn(true)
    setIsVideoOn(true)
  }

  const endCall = () => {
    setIsCallActive(false)
    setIsRecording(false)
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
  }

  const addTranscriptMessage = (speaker: "doctor" | "patient", text: string) => {
    const newMessage: TranscriptMessage = {
      id: Math.random().toString(36),
      speaker,
      text,
      timestamp: new Date(),
    }
    setTranscript((prev) => [...prev, newMessage])
  }

  const analyzeTranscriptForSuggestions = (text: string) => {
    // Simple keyword-based analysis (in production, use AI/LLM)
    const lowerText = text.toLowerCase()

    // Extract potential medical history items
    if (
      lowerText.includes("pain") ||
      lowerText.includes("symptom") ||
      lowerText.includes("feel")
    ) {
      const newHistoryItem: MedicalHistoryItem = {
        id: Math.random().toString(36),
        category: "Symptoms",
        content: text,
        source: "transcript",
        timestamp: new Date(),
      }
      setMedicalHistory((prev) => [...prev, newHistoryItem])
    }

    // Auto-mark answered questions
    if (
      lowerText.includes("started") ||
      lowerText.includes("began") ||
      lowerText.includes("week") ||
      lowerText.includes("day")
    ) {
      setSuggestedQuestions((prev) =>
        prev.map((q) =>
          q.id === "1" ? { ...q, status: "answered" } : q
        )
      )
    }
  }

  const addSuggestedQuestionToHistory = (question: SuggestedQuestion) => {
    const newHistoryItem: MedicalHistoryItem = {
      id: Math.random().toString(36),
      category: question.category,
      content: question.question,
      source: "manual",
      timestamp: new Date(),
    }
    setMedicalHistory((prev) => [...prev, newHistoryItem])

    setSuggestedQuestions((prev) =>
      prev.map((q) => (q.id === question.id ? { ...q, status: "added" } : q))
    )
  }

  const removeSuggestedQuestion = (id: string) => {
    setSuggestedQuestions((prev) => prev.filter((q) => q.id !== id))
  }

  const updatePrescription = (
    field: "medications" | "diagnoses" | "instructions",
    index: number | null,
    value: string
  ) => {
    setPrescriptionDraft((prev) => {
      if (field === "instructions") {
        return { ...prev, instructions: value }
      }
      const arr = [...prev[field]]
      if (index !== null) {
        arr[index] = value
      }
      return { ...prev, [field]: arr }
    })
  }

  const addPrescriptionField = (field: "medications" | "diagnoses") => {
    setPrescriptionDraft((prev) => ({
      ...prev,
      [field]: [...prev[field], ""],
    }))
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Main Video Section */}
      <div className="flex-1 flex flex-col">
        {/* Video Call Area */}
        <div className="flex-1 bg-muted relative rounded-lg m-4 overflow-hidden">
          {isCallActive ? (
            <>
              {/* Patient Video (Large) */}
              <div className="w-full h-4/5 bg-slate-900 flex items-center justify-center relative">
                <Avatar className="w-32 h-32">
                  <AvatarFallback className="text-4xl bg-blue-600 text-white">
                    PT
                  </AvatarFallback>
                </Avatar>
                <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur px-3 py-2 rounded-lg">
                  <p className="text-white font-semibold">Sarah Johnson</p>
                  <p className="text-gray-300 text-sm">Patient</p>
                </div>
              </div>

              {/* Doctor Video (Small - Picture in Picture) */}
              <div className="absolute bottom-4 right-4 w-32 h-24 bg-slate-700 rounded-lg border border-slate-600 flex items-center justify-center overflow-hidden">
                <Avatar className="w-16 h-16">
                  <AvatarFallback className="text-xl bg-green-600 text-white">
                    DR
                  </AvatarFallback>
                </Avatar>
                <div className="absolute bottom-2 left-2 text-xs text-white bg-black/60 px-2 py-1 rounded">
                  You
                </div>
              </div>

              {/* Call Controls */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-3">
                <Button
                  size="lg"
                  variant={isMicOn ? "outline" : "secondary"}
                  className="rounded-full w-14 h-14"
                  onClick={() => setIsMicOn(!isMicOn)}
                >
                  {isMicOn ? (
                    <Mic className="w-5 h-5" />
                  ) : (
                    <MicOff className="w-5 h-5" />
                  )}
                </Button>
                <Button
                  size="lg"
                  variant={isVideoOn ? "outline" : "secondary"}
                  className="rounded-full w-14 h-14"
                  onClick={() => setIsVideoOn(!isVideoOn)}
                >
                  {isVideoOn ? (
                    <Video className="w-5 h-5" />
                  ) : (
                    <VideoOff className="w-5 h-5" />
                  )}
                </Button>
                <Button
                  size="lg"
                  variant={isRecording ? "outline" : "secondary"}
                  className="rounded-full w-14 h-14"
                  onClick={() => setIsRecording(!isRecording)}
                >
                  <MessageSquare className="w-5 h-5" />
                </Button>
                <Button
                  size="lg"
                  variant="destructive"
                  className="rounded-full w-14 h-14"
                  onClick={endCall}
                >
                  <Phone className="w-5 h-5" />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <Avatar className="w-24 h-24">
                <AvatarFallback className="text-3xl bg-blue-600 text-white">
                  PT
                </AvatarFallback>
              </Avatar>
              <h3 className="text-xl font-semibold">Sarah Johnson</h3>
              <Button size="lg" onClick={startCall} className="gap-2">
                <Phone className="w-5 h-5" /> Start Call
              </Button>
            </div>
          )}
        </div>

        {/* Real-time Transcript Area */}
        {isCallActive && (
          <Card className="m-4 mt-0 max-h-32 flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Live Transcript
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
              <ScrollArea className="h-full pr-4">
                <div className="space-y-2 text-sm">
                  {transcript.slice(-5).map((msg) => (
                    <div key={msg.id} className="flex gap-2">
                      <span
                        className={cn(
                          "font-semibold min-w-fit",
                          msg.speaker === "doctor"
                            ? "text-green-600"
                            : "text-blue-600"
                        )}
                      >
                        {msg.speaker === "doctor" ? "You" : "Patient"}:
                      </span>
                      <span className="text-muted-foreground flex-1">{msg.text}</span>
                    </div>
                  ))}
                  {currentTranscriptText && (
                    <div className="flex gap-2 italic text-gray-400">
                      <span className="font-semibold min-w-fit text-green-600">
                        You:
                      </span>
                      <span>{currentTranscriptText}</span>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Right Side Panel - Integrated Information */}
      <div className="w-96 border-l bg-card flex flex-col">
        <Tabs
          value={activeSideTab}
          onValueChange={(v) =>
            setActiveSideTab(v as "labs" | "prescription" | "history" | "questions")
          }
          className="flex-1 flex flex-col"
        >
          <TabsList className="w-full rounded-none border-b justify-start bg-muted p-0 h-12">
            <TabsTrigger
              value="questions"
              className="rounded-none data-[state=active]:bg-background"
            >
              <Lightbulb className="w-4 h-4 mr-2" />
              Questions
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="rounded-none data-[state=active]:bg-background"
            >
              <FileText className="w-4 h-4 mr-2" />
              History
            </TabsTrigger>
            <TabsTrigger
              value="labs"
              className="rounded-none data-[state=active]:bg-background"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Labs
            </TabsTrigger>
            <TabsTrigger
              value="prescription"
              className="rounded-none data-[state=active]:bg-background"
            >
              <Pill className="w-4 h-4 mr-2" />
              Rx
            </TabsTrigger>
          </TabsList>

          {/* Suggested Questions Tab */}
          <TabsContent value="questions" className="flex-1 overflow-hidden p-4 flex flex-col">
            <ScrollArea className="flex-1">
              <div className="space-y-3 pr-4">
                {suggestedQuestions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No suggested questions at this time
                  </p>
                ) : (
                  suggestedQuestions.map((q) => (
                    <div
                      key={q.id}
                      className={cn(
                        "p-3 rounded-lg border text-sm space-y-2 transition-all",
                        q.status === "pending"
                          ? "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900"
                          : q.status === "answered"
                            ? "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900 opacity-60"
                            : "bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900"
                      )}
                    >
                      <div className="flex items-start gap-2 justify-between">
                        <div className="flex-1">
                          <p className="font-medium leading-snug">{q.question}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {q.category}
                          </p>
                        </div>
                        <Badge
                          variant={
                            q.relevance === "high"
                              ? "default"
                              : q.relevance === "medium"
                                ? "secondary"
                                : "outline"
                          }
                          className="text-xs shrink-0"
                        >
                          {q.relevance}
                        </Badge>
                      </div>
                      {q.status === "pending" && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-7"
                            onClick={() => addSuggestedQuestionToHistory(q)}
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Ask
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-xs h-7 text-muted-foreground"
                            onClick={() => removeSuggestedQuestion(q.id)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                      {q.status === "answered" && (
                        <Badge variant="outline" className="text-xs bg-green-100 text-green-800">
                          ✓ Answered
                        </Badge>
                      )}
                      {q.status === "added" && (
                        <Badge variant="outline" className="text-xs bg-amber-100 text-amber-800">
                          ✓ Added to history
                        </Badge>
                      )}
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Medical History Tab */}
          <TabsContent value="history" className="flex-1 overflow-hidden p-4 flex flex-col">
            <ScrollArea className="flex-1">
              <div className="space-y-2 pr-4">
                {medicalHistory.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No medical history captured</p>
                ) : (
                  medicalHistory.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-lg bg-muted text-sm space-y-1"
                    >
                      <div className="flex items-center gap-2 justify-between">
                        <Badge variant="outline" className="text-xs">
                          {item.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {item.source === "transcript" ? "Auto-captured" : "Manual"}
                        </span>
                      </div>
                      <p className="leading-snug">{item.content}</p>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Lab Results Tab */}
          <TabsContent value="labs" className="flex-1 overflow-hidden p-4 flex flex-col">
            <ScrollArea className="flex-1">
              <div className="space-y-3 pr-4">
                <Card className="p-3">
                  <p className="font-semibold text-sm mb-2">Recent Labs (Sarah Johnson)</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span>Blood Pressure</span>
                      <Badge variant="outline">120/80 mmHg</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Heart Rate</span>
                      <Badge variant="outline">72 bpm</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Temperature</span>
                      <Badge variant="outline">98.6°F</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Glucose</span>
                      <Badge variant="secondary">95 mg/dL</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Cholesterol</span>
                      <Badge variant="secondary">185 mg/dL</Badge>
                    </div>
                  </div>
                </Card>
                <Button variant="outline" className="w-full text-xs" size="sm">
                  View Full Lab Report
                </Button>
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Prescription Tab */}
          <TabsContent value="prescription" className="flex-1 overflow-hidden p-4 flex flex-col">
            <ScrollArea className="flex-1">
              <div className="space-y-4 pr-4">
                {/* Diagnoses */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Diagnoses</label>
                  {prescriptionDraft.diagnoses.map((diagnosis, idx) => (
                    <div key={idx} className="flex gap-2">
                      <Input
                        placeholder="ICD-10 code / diagnosis"
                        value={diagnosis}
                        onChange={(e) =>
                          updatePrescription("diagnoses", idx, e.target.value)
                        }
                        className="text-xs h-8"
                      />
                    </div>
                  ))}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => addPrescriptionField("diagnoses")}
                    className="text-xs h-8"
                  >
                    <Plus className="w-3 h-3 mr-1" /> Add Diagnosis
                  </Button>
                </div>

                {/* Medications */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Medications</label>
                  {prescriptionDraft.medications.map((med, idx) => (
                    <div key={idx} className="flex gap-2">
                      <Input
                        placeholder="Medication name & dosage"
                        value={med}
                        onChange={(e) =>
                          updatePrescription("medications", idx, e.target.value)
                        }
                        className="text-xs h-8"
                      />
                    </div>
                  ))}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => addPrescriptionField("medications")}
                    className="text-xs h-8"
                  >
                    <Plus className="w-3 h-3 mr-1" /> Add Medication
                  </Button>
                </div>

                {/* Instructions */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Instructions</label>
                  <Textarea
                    placeholder="Special instructions & follow-up"
                    value={prescriptionDraft.instructions}
                    onChange={(e) =>
                      updatePrescription("instructions", null, e.target.value)
                    }
                    className="text-xs min-h-20"
                  />
                </div>

                <Button className="w-full text-xs h-8">
                  <Send className="w-3 h-3 mr-2" /> Send Prescription
                </Button>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
