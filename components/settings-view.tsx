"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Globe, Moon } from "lucide-react"
import type { UnitSystem } from "./telehealth-dashboard"

interface SettingsViewProps {
  unitSystem: UnitSystem
  onUnitChange: (system: UnitSystem) => void
}

export function SettingsView({ unitSystem, onUnitChange }: SettingsViewProps) {
  return (
    <div className="flex-1 overflow-y-auto bg-muted/10 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        </div>

        <Tabs defaultValue="preferences" className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
          </TabsList>

          <TabsContent value="preferences" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Unit System
                </CardTitle>
                <CardDescription>Choose your preferred measurement system for lab results and vitals.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup
                  defaultValue={unitSystem}
                  onValueChange={(val) => onUnitChange(val as UnitSystem)}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  <div>
                    <RadioGroupItem value="US" id="us" className="peer sr-only" />
                    <Label
                      htmlFor="us"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
                    >
                      <span className="text-lg font-semibold mb-1">US Units</span>
                      <span className="text-sm text-muted-foreground">mg/dL, lb, °F</span>
                      <div className="mt-4 text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                        Example: Glucose 95 mg/dL
                      </div>
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="SI" id="si" className="peer sr-only" />
                    <Label
                      htmlFor="si"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
                    >
                      <span className="text-lg font-semibold mb-1">SI Units</span>
                      <span className="text-sm text-muted-foreground">mmol/L, kg, °C</span>
                      <div className="mt-4 text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                        Example: Glucose 5.3 mmol/L
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Moon className="h-5 w-5" />
                  Appearance
                </CardTitle>
                <CardDescription>Customize how the application looks on your device.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Dark Mode</Label>
                    <p className="text-sm text-muted-foreground">Adjust the appearance to reduce eye strain.</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="account" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your account settings and email preferences.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <Label>Email</Label>
                  <div className="p-2 border rounded-md bg-muted/50 text-sm">dr.smith@hospital.com</div>
                </div>
                <Button variant="outline">Change Password</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Choose what you want to be notified about.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Lab Results</Label>
                    <p className="text-sm text-muted-foreground">Get notified when new results are available.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Patient Messages</Label>
                    <p className="text-sm text-muted-foreground">Receive emails for new patient messages.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
