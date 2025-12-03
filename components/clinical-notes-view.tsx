"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Plus, 
  Search, 
  Mic, 
  Square, 
  Play, 
  Pause, 
  RotateCcw, 
  Save, 
  FileAudio,
  Clock,
  Trash2
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import type { Patient } from "@/components/app-provider"
import { cn } from "@/lib/utils"

// --- Types ---

interface TranscriptSegment {
  id: string
  text: string
  startTime: number
  endTime: number
}

interface AudioNote {
  id: number
  title: string
  type: string
  date: string
  duration: number
  transcript: TranscriptSegment[]
  audioUrl: string | null // blob url
  tags: string[]
}

const NOTE_TYPES = ["Consultation", "Follow-up", "Lab Review", "Prescription", "Referral"]

// --- Helper: Format seconds to MM:SS ---
const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

interface ClinicalNotesViewProps {
  patient: Patient
  onUpdateNotes: (notes: any[]) => void
}

export function ClinicalNotesView({ patient, onUpdateNotes }: ClinicalNotesViewProps) {
  // We cast the incoming notes to our enhanced AudioNote type for this prototype
  const notes = (patient.clinicalNotes || []) as unknown as AudioNote[]
  
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddingNote, setIsAddingNote] = useState(false)
  
  // --- Recorder State ---
  const [isRecording, setIsRecording] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [transcriptSegments, setTranscriptSegments] = useState<TranscriptSegment[]>([])
  const [currentTranscript, setCurrentTranscript] = useState("") // Interim text
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  
  // --- Playback State ---
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  
  // --- Form State ---
  const [noteTitle, setNoteTitle] = useState("")
  const [noteType, setNoteType] = useState("Consultation")
  
  // --- Refs ---
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(0)
  
  // --- Initialize Speech Recognition & Setup ---
  useEffect(() => {
    // Cleanup blob URLs on unmount to avoid memory leaks
    return () => {
      notes.forEach(note => {
        if (note.audioUrl) URL.revokeObjectURL(note.audioUrl)
      })
    }
  }, [])

  // --- Recording Logic ---

  const startRecording = async () => {
    try {
      // 1. Start Audio Stream (Voice Memo)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        setAudioBlob(blob)
        // Set duration based on elapsed time (approx)
        setDuration(elapsedTime)
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()

      // 2. Start Speech Recognition (Transcript)
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition()
        recognitionRef.current = recognition
        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang = 'en-US'
        
        // We need to sync text with audio time. 
        // We'll use a refined timestamping strategy.
        let segmentStartTime = 0

        recognition.onstart = () => {
           startTimeRef.current = Date.now()
        }

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          let interim = ''
          const now = (Date.now() - startTimeRef.current) / 1000 // Convert to seconds

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i]
            const text = result[0].transcript

            if (result.isFinal) {
              // Create a finalized segment
              const newSegment: TranscriptSegment = {
                id: Math.random().toString(36).substr(2, 9),
                text: text.trim(),
                startTime: segmentStartTime,
                endTime: now
              }
              
              setTranscriptSegments(prev => [...prev, newSegment])
              segmentStartTime = now // Reset start time for next segment
              setCurrentTranscript("")
            } else {
              interim += text
            }
          }
          setCurrentTranscript(interim)
        }

        recognition.start()
      }

      // 3. UI Updates
      setIsRecording(true)
      setElapsedTime(0)
      setTranscriptSegments([])
      setAudioBlob(null)
      
      timerRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1)
      }, 1000)

    } catch (error) {
      console.error("Error accessing microphone:", error)
      alert("Microphone access denied or not supported.")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    setIsRecording(false)
  }

  // --- Playback Logic ---

  const handlePlayPause = () => {
    if (!audioRef.current && audioBlob) {
      const url = URL.createObjectURL(audioBlob)
      const audio = new Audio(url)
      audioRef.current = audio
      
      audio.ontimeupdate = () => {
        setCurrentTime(audio.currentTime)
      }
      
      audio.onended = () => {
        setIsPlaying(false)
        setCurrentTime(0)
      }
      
      audio.onloadedmetadata = () => {
         if (audio.duration !== Infinity) {
             setDuration(audio.duration)
         }
      }
    }

    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const jumpToTime = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time
      setCurrentTime(time)
      if (!isPlaying) {
        audioRef.current.play()
        setIsPlaying(true)
      }
    } else if (audioBlob) {
        // Initialize audio if not yet created (edge case)
        handlePlayPause()
        setTimeout(() => {
            if (audioRef.current) {
                 audioRef.current.currentTime = time
                 audioRef.current.play() 
                 setIsPlaying(true)
            }
        }, 100)
    }
  }

  const handleSave = () => {
    if (!noteTitle) {
        alert("Please add a title")
        return
    }

    // Convert blob to URL for the "fake" backend
    const audioUrl = audioBlob ? URL.createObjectURL(audioBlob) : null
    
    // If there is lingering interim text, force add it as a segment
    let finalSegments = [...transcriptSegments]
    if (currentTranscript.trim()) {
        finalSegments.push({
            id: "final-fragment",
            text: currentTranscript,
            startTime: finalSegments.length > 0 ? finalSegments[finalSegments.length -1].endTime : 0,
            endTime: elapsedTime
        })
    }

    const newNote: AudioNote = {
      id: Date.now(),
      title: noteTitle,
      type: noteType,
      date: new Date().toISOString().split('T')[0],
      duration: elapsedTime,
      transcript: finalSegments,
      audioUrl: audioUrl,
      tags: ["New"]
    }

    onUpdateNotes([newNote, ...notes])
    resetForm()
    setIsAddingNote(false)
  }

  const resetForm = () => {
    setNoteTitle("")
    setNoteType("Consultation")
    setTranscriptSegments([])
    setCurrentTranscript("")
    setAudioBlob(null)
    setElapsedTime(0)
    setCurrentTime(0)
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
  }

  const handleClose = (open: boolean) => {
    if (!open) {
        if (isRecording) stopRecording()
        resetForm()
    }
    setIsAddingNote(open)
  }

  // --- Filtering ---
  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    note.transcript?.some(s => s.text.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="space-y-6">
      {/* Search and Add Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Input 
            placeholder="Search transcripts..." 
            className="pl-9 bg-background" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        </div>
        <Button onClick={() => setIsAddingNote(true)} className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          New Consultation
        </Button>
      </div>

      {/* Note List */}
      <div className="grid gap-4">
        {filteredNotes.length === 0 ? (
           <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
             <Mic className="h-10 w-10 mx-auto mb-3 opacity-20" />
             <p>No audio notes found.</p>
           </div>
        ) : (
           filteredNotes.map((note) => (
             <NoteCard key={note.id} note={note} />
           ))
        )}
      </div>

      {/* The Advanced Recorder Dialog */}
      <Dialog open={isAddingNote} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl h-[80vh] flex flex-col p-0 gap-0 overflow-hidden">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle>New Audio Consultation</DialogTitle>
            <DialogDescription>Record the session. Audio and text will be synced.</DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex flex-col bg-slate-50/50 dark:bg-slate-900/50">
             {/* Metadata Inputs */}
             <div className="grid grid-cols-2 gap-4 p-6 pb-2">
               <div className="space-y-2">
                 <Label>Title</Label>
                 <Input 
                   placeholder="e.g. Annual Checkup - John Doe" 
                   value={noteTitle}
                   onChange={e => setNoteTitle(e.target.value)}
                 />
               </div>
               <div className="space-y-2">
                 <Label>Type</Label>
                 <select 
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    value={noteType}
                    onChange={e => setNoteType(e.target.value)}
                 >
                    {NOTE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                 </select>
               </div>
             </div>

             <Separator className="my-2" />

             {/* Main Content Area */}
             <div className="flex-1 flex flex-col min-h-0 relative">
                
                {/* 1. Empty State */}
                {!isRecording && !audioBlob && transcriptSegments.length === 0 && (
                   <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
                      <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                        <Mic className="h-8 w-8 text-slate-400" />
                      </div>
                      <p>Ready to record</p>
                   </div>
                )}

                {/* 2. Recording State (Visualizer) */}
                {isRecording && (
                  <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8">
                     <div className="text-4xl font-mono font-medium tabular-nums tracking-widest text-primary">
                        {formatTime(elapsedTime)}
                     </div>
                     {/* Fake Visualizer */}
                     <div className="flex items-center justify-center gap-1 h-12">
                        {[...Array(10)].map((_, i) => (
                           <div 
                              key={i} 
                              className="w-2 bg-primary/60 rounded-full animate-pulse"
                              style={{ 
                                height: `${Math.random() * 100}%`,
                                animationDuration: `${0.5 + Math.random()}s`
                              }}
                           />
                        ))}
                     </div>
                     <p className="text-sm text-muted-foreground animate-pulse">Recording audio & generating transcript...</p>
                  </div>
                )}

                {/* 3. Review State (Player + Transcript) */}
                {(audioBlob || (!isRecording && transcriptSegments.length > 0)) && (
                   <div className="flex flex-col h-full">
                      {/* Audio Player Bar */}
                      <div className="px-6 py-4 bg-background border-b flex items-center gap-4">
                         <Button 
                            variant="secondary" size="icon" className="h-10 w-10 shrink-0 rounded-full"
                            onClick={handlePlayPause}
                         >
                            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-1" />}
                         </Button>
                         
                         <div className="flex-1 space-y-1">
                            <Slider 
                               value={[currentTime]} 
                               max={duration} 
                               step={0.1}
                               onValueChange={(val) => {
                                  if (audioRef.current) audioRef.current.currentTime = val[0]
                                  setCurrentTime(val[0])
                               }}
                               className="cursor-pointer"
                            />
                            <div className="flex justify-between text-xs text-muted-foreground font-mono">
                               <span>{formatTime(currentTime)}</span>
                               <span>{formatTime(duration)}</span>
                            </div>
                         </div>
                      </div>

                      {/* Interactive Transcript */}
                      <ScrollArea className="flex-1 p-6">
                        <div className="space-y-4">
                           {transcriptSegments.map((segment, idx) => {
                              const isActive = currentTime >= segment.startTime && currentTime < segment.endTime
                              return (
                                 <div 
                                    key={idx}
                                    onClick={() => jumpToTime(segment.startTime)}
                                    className={cn(
                                       "p-3 rounded-lg text-sm leading-relaxed cursor-pointer transition-colors border",
                                       isActive 
                                          ? "bg-primary/10 border-primary/20 text-foreground shadow-sm" 
                                          : "bg-transparent border-transparent text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800"
                                    )}
                                 >
                                    <div className="flex gap-3">
                                       <span className="text-xs font-mono text-primary/50 shrink-0 mt-1 select-none">
                                          {formatTime(segment.startTime)}
                                       </span>
                                       <span>{segment.text}</span>
                                    </div>
                                 </div>
                              )
                           })}
                           {currentTranscript && (
                              <div className="p-3 rounded-lg text-sm text-muted-foreground italic border border-dashed border-slate-200 ml-12">
                                 {currentTranscript}...
                              </div>
                           )}
                        </div>
                      </ScrollArea>
                   </div>
                )}
             </div>

             {/* Footer Controls */}
             <div className="p-4 bg-background border-t flex items-center justify-between">
                {isRecording ? (
                   <Button variant="destructive" onClick={stopRecording} className="w-full sm:w-auto">
                      <Square className="h-4 w-4 mr-2 fill-current" /> Stop Recording
                   </Button>
                ) : (
                   <div className="flex gap-2 w-full justify-between">
                      <Button variant="ghost" onClick={() => resetForm()} disabled={!audioBlob}>
                         <Trash2 className="h-4 w-4 mr-2" /> Discard
                      </Button>
                      
                      <div className="flex gap-2">
                        {!audioBlob && (
                           <Button variant="default" onClick={startRecording} className="bg-red-500 hover:bg-red-600 text-white">
                              <Mic className="h-4 w-4 mr-2" /> Start Recording
                           </Button>
                        )}
                        {audioBlob && (
                           <Button onClick={handleSave}>
                              <Save className="h-4 w-4 mr-2" /> Save to Patient Notes
                           </Button>
                        )}
                      </div>
                   </div>
                )}
             </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// --- Subcomponent: Note Card ---

function NoteCard({ note }: { note: AudioNote }) {
  const [expanded, setExpanded] = useState(false)
  
  // Quick preview text
  const previewText = note.transcript?.map(t => t.text).join(' ').slice(0, 150) + "..."

  return (
    <Card className="group transition-all hover:shadow-md border-slate-200 dark:border-slate-800">
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div className="space-y-1">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
             {note.title}
             <Badge variant="outline" className="font-normal text-xs">{note.type}</Badge>
          </CardTitle>
          <CardDescription className="flex items-center gap-3 text-xs">
            <span className="flex items-center"><Clock className="h-3 w-3 mr-1"/> {note.date}</span>
            <span className="flex items-center"><FileAudio className="h-3 w-3 mr-1"/> {formatTime(note.duration)}</span>
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
         <div className="text-sm text-muted-foreground bg-slate-50 dark:bg-slate-900/50 p-3 rounded-md border mb-3">
            {expanded ? (
               <div className="space-y-2">
                  {note.transcript.map((seg, i) => (
                     <p key={i}><span className="text-xs font-mono text-primary/40 mr-2">{formatTime(seg.startTime)}</span>{seg.text}</p>
                  ))}
               </div>
            ) : (
               <p>{previewText}</p>
            )}
         </div>
         
         <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)} className="text-xs">
               {expanded ? "Show Less" : "Read Full Transcript"}
            </Button>
            
            {/* Simple Inline Player for the list view */}
            {note.audioUrl && (
               <audio controls className="h-8 w-48" src={note.audioUrl} />
            )}
         </div>
      </CardContent>
    </Card>
  )
}
