import { Activity, Heart, Thermometer, Weight } from 'lucide-react'
import { Card } from '@/components/ui/card'

export function PatientVitals() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 pb-2">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-full">
          <Heart className="w-5 h-5 text-red-600 dark:text-red-400" />
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Heart Rate</p>
          <p className="text-lg font-semibold">75 bpm</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-full">
          <Thermometer className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Temperature</p>
          <p className="text-lg font-semibold">37.0°C</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-full">
          <Activity className="w-5 h-5 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Blood Pressure</p>
          <p className="text-lg font-semibold">132/87 mmHg</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-full">
          <Weight className="w-5 h-5 text-orange-600 dark:text-orange-400" />
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Weight</p>
          <p className="text-lg font-semibold">79.0 kg</p>
        </div>
      </div>
    </div>
  )
}
