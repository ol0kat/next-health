"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  User,
  Settings,
  MessageSquare,
  Calendar,
  PanelLeftClose,
  PanelLeftOpen,
  Moon,
  Sun,
  LogOut,
  BookOpen,
  Scale,
  PlugZap,
  Loader2,
  Wallet,
  Video,
  ImageIcon,
  Droplet,
  ShoppingCart,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface SidebarProps {
  activeItem: string
  onNavigate: (item: string) => void
  unitSystem?: "US" | "SI"
  onUnitChange?: (system: "US" | "SI") => void
}

export function Sidebar({ activeItem, onNavigate, unitSystem = "US", onUnitChange }: SidebarProps) {
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(true)
  const [isDark, setIsDark] = useState(false)
  const [isIntegrationOpen, setIsIntegrationOpen] = useState(false)
  const [integrationStep, setIntegrationStep] = useState<"form" | "loading" | "success">("form")

  const navigation = [
    { name: "Receptionist", icon: User, id: "receptionist" },
    { name: "My Patients", icon: User, id: "patients" },
    { name: "Orders", icon: ShoppingCart, id: "orders" },
    { name: "My Calendar", icon: Calendar, id: "agenda" },
    { name: "Phlebotomy Room", icon: Droplet, id: "phlebotomy", external: true },
    { name: "Imaging Results", icon: ImageIcon, id: "imaging" },
    { name: "Catalog", icon: BookOpen, id: "catalog" },
    { name: "Finance", icon: Wallet, id: "finance" },
    { name: "Telehealth Call", icon: Video, id: "telehealth", external: true },
    { name: "Messages", icon: MessageSquare, id: "chat" },
    { name: "Settings", icon: Settings, id: "settings" },
  ]

  const handleNavigate = (item: (typeof navigation)[0]) => {
    if (item.external && (item.id === "telehealth" || item.id === "phlebotomy")) {
      if (item.id === "telehealth") router.push("/telehealth")
      if (item.id === "phlebotomy") router.push("/phlebotomy-room")
    } else if (item.id === "orders") {
      router.push("/orders")
    } else if (item.id === "receptionist") {
      router.push("/receptionist")
    } else if (item.id === "patients") {
      router.push("/my-patients")
    } else if (item.id === "agenda") {
      router.push("/agenda")
    } else if (item.id === "imaging") {
      router.push("/imaging")
    } else if (item.id === "catalog") {
      router.push("/catalog")
    } else if (item.id === "finance") {
      router.push("/finance")
    } else if (item.id === "chat") {
      router.push("/messages")
    } else if (item.id === "settings") {
      router.push("/settings")
    } else {
      onNavigate(item.id)
    }
  }

  // Toggle dark mode
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [isDark])

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault()
    setIntegrationStep("loading")
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIntegrationStep("success")
    setTimeout(() => {
      setIsIntegrationOpen(false)
      setIntegrationStep("form")
    }, 1500)
  }

  return (
    <div
      className={cn(
        "border-r bg-sidebar flex flex-col transition-all duration-300 ease-in-out",
        collapsed ? "w-16" : "w-64",
      )}
    >
      {/* Logo & Toggle */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-primary flex-shrink-0 flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm"> </span>
            </div>
            <span className="font-semibold text-sidebar-foreground whitespace-nowrap">NextMedical</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-8 w-8", collapsed && "mx-auto")}
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-2 space-y-1 overflow-y-auto">
        {navigation.map((item) => (
          <button
            key={item.name}
            onClick={() => handleNavigate(item)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
              activeItem === item.id
                ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                : "text-sidebar-foreground hover:bg-sidebar-accent/50",
              collapsed && "justify-center px-2",
              item.id === "telehealth" && "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300",
            )}
            title={collapsed ? item.name : undefined}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>{item.name}</span>}
          </button>
        ))}

        <Dialog open={isIntegrationOpen} onOpenChange={setIsIntegrationOpen}>
          <DialogTrigger asChild>
            <button
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-sidebar-foreground hover:bg-sidebar-accent/50",
                collapsed && "justify-center px-2",
              )}
              title={collapsed ? "E-Rx Integration" : undefined}
            >
              <PlugZap className="w-5 h-5 flex-shrink-0 text-blue-500" />
              {!collapsed && <span>E-Rx Integration</span>}
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Connect to National E-Prescription System</DialogTitle>
              <DialogDescription>
                Enter your credentials to enable electronic prescribing capabilities.
              </DialogDescription>
            </DialogHeader>

            {integrationStep === "form" ? (
              <form onSubmit={handleConnect} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="doctor-code">Doctor's Interconnected Code</Label>
                  <Input id="doctor-code" placeholder="Ex: 01000875LA-CCHN" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="facility-code">Healthcare Facility Code</Label>
                  <Input id="facility-code" placeholder="Ex: 0179bdq" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" required />
                </div>
                <DialogFooter>
                  <Button type="submit">Connect System</Button>
                </DialogFooter>
              </form>
            ) : integrationStep === "loading" ? (
              <div className="py-8 flex flex-col items-center justify-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Verifying credentials...</p>
              </div>
            ) : (
              <div className="py-8 flex flex-col items-center justify-center gap-4 text-green-600">
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <PlugZap className="h-6 w-6" />
                </div>
                <p className="font-medium">Connected Successfully!</p>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Footer Actions */}
      <div className="p-2 border-t border-sidebar-border space-y-1">
        {onUnitChange && (
          <button
            onClick={() => onUnitChange(unitSystem === "US" ? "SI" : "US")}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors",
              collapsed && "justify-center px-2",
            )}
            title={`Switch to ${unitSystem === "US" ? "SI" : "US"} Units`}
          >
            <Scale className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>{unitSystem === "US" ? "US Units" : "SI Units"}</span>}
          </button>
        )}

        <button
          onClick={() => setIsDark(!isDark)}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors",
            collapsed && "justify-center px-2",
          )}
          title={isDark ? "Light Mode" : "Dark Mode"}
        >
          {isDark ? <Sun className="w-5 h-5 flex-shrink-0" /> : <Moon className="w-5 h-5 flex-shrink-0" />}
          {!collapsed && <span>{isDark ? "Light Mode" : "Dark Mode"}</span>}
        </button>

        <button
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors",
            collapsed && "justify-center px-2",
          )}
          title="Log Out"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Log Out</span>}
        </button>
      </div>
    </div>
  )
}
