import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Mic, MicOff, Video, VideoOff, Monitor, Phone, MessageSquare } from 'lucide-react'

export function VideoCallView() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Video Section */}
      <div className="lg:col-span-2 space-y-4">
        {/* Patient Video - Large */}
        

        {/* Doctor Video - Small */}
        <Card className="overflow-hidden">
          <CardContent className="p-0 aspect-video bg-muted relative">
            <div className="absolute inset-0 flex items-center justify-center bg-primary/10">
              <Avatar className="w-24 h-24">
                <AvatarFallback className="text-2xl bg-primary text-primary-foreground">DR</AvatarFallback>
              </Avatar>
            </div>
            <div className="absolute bottom-4 left-4">
              <div className="bg-black/70 backdrop-blur-sm px-3 py-2 rounded-lg">
                <span className="text-white font-medium">Dr. Michael Roberts (You)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call Controls */}
        <div className="flex items-center justify-center gap-3">
          <Button size="lg" variant="outline" className="rounded-full w-14 h-14">
            <Mic className="w-5 h-5" />
          </Button>
          <Button size="lg" variant="outline" className="rounded-full w-14 h-14">
            <Video className="w-5 h-5" />
          </Button>
          <Button size="lg" variant="outline" className="rounded-full w-14 h-14">
            <Monitor className="w-5 h-5" />
          </Button>
          <Button size="lg" variant="outline" className="rounded-full w-14 h-14">
            <MessageSquare className="w-5 h-5" />
          </Button>
          <Button size="lg" variant="destructive" className="rounded-full w-14 h-14">
            <Phone className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Side Panel */}
      <div className="space-y-4">
        

        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold text-foreground mb-4">Telehealth Transcript</h3>
            <div className="space-y-2">
              
              
              
            </div>
          </CardContent>
        </Card>

        
      </div>
    </div>
  )
}
