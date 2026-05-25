"use client";

import React, { useEffect, useMemo, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { 
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Bell,
  Briefcase,
  Building2,
  Calendar,
  Check,        // company-step logo-preview success badge
  CheckCircle2,
  Clock,        // demo-step project timeline header
  ClipboardList,
  DollarSign,
  Eye,          // demo-step preview section header
  FileText,
  Home,         // specialties list — residential
  Landmark,     // specialties list — infrastructure
  LayoutDashboard,
  Mail,
  Palette,
  Plus,         // team-step Add member button
  Rocket,
  Settings,
  Shield,
  Sparkles,
  TrendingUp,   // demo-step on-track metric
  Upload,
  Users,
  Wrench,
  X,            // company-step logo-clear + team-step remove member
} from 'lucide-react'

type OnboardingStep = "welcome" | "company" | "team" | "preferences" | "demo" | "success"




function cn(...classes: Array<string | undefined | false | null>) {
  return classes.filter(Boolean).join(" ")
}

function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "border border-zinc-800 bg-zinc-900/60 p-6 rounded-xl backdrop-blur-sm",
        className
      )}
    >
      {children}
    </div>
  )
}

function CardHeader({ children }: { children: React.ReactNode }) {
  return <div className="mb-4">{children}</div>
}

function CardTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-zinc-100 font-semibold text-base">{children}</h3>
}

function CardDescription({ children }: { children: React.ReactNode }) {
  return <p className="text-zinc-400 text-sm mt-1">{children}</p>
}

function CardContent({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>
}

function Button({
  variant = "default",
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline"
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#FFC107]/30 disabled:opacity-50 disabled:pointer-events-none"

  const styles =
    variant === "outline"
      ? "border border-zinc-800 bg-zinc-900/50 text-zinc-200 hover:bg-zinc-900"
      : "bg-[#FFC107] text-zinc-950 hover:bg-[#FFC107]/90 shadow-[0_0_0_1px_rgba(255,193,7,0.2)]"

  return (
    <button {...props} className={cn(base, styles, className)}>
      {children}
    </button>
  )
}

function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "h-11 w-full px-3 rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#FFC107]/50",
        className
      )}
    />
  )
}

function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label {...props} className={cn("text-zinc-300 text-sm font-medium block mb-1.5", className)} />
}

function Progress({ value }: { value: number }) {
  const v = Math.max(0, Math.min(100, value))
  return (
    <div className="w-full">
      <div className="relative h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 bg-[#FFC107] rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${v}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  )
}


export function IntegratedOnboarding({
  onComplete,
}: {
  onComplete: (data: any) => void
}) {


  type TeamMember = {
    email: string
    role: "admin" | "project_manager" | "engineer" | "accountant" | "worker"
  }

  type OnboardingData = {
    companyName: string
    companyLogo: string | null
    teamSize: string
    specialty: string[]
    teamMembers: TeamMember[]
    budgetTracking: boolean
    timelineTracking: boolean
    expenseAlerts: boolean
    notificationPreferences: {
      email: boolean
      push: boolean
      sms: boolean
    }
  }

  const steps: OnboardingStep[] = useMemo(
    () => ["welcome", "company", "team", "preferences", "demo", "success"],
    []
  )

  const defaultData: OnboardingData = useMemo(
    () => ({
      companyName: "",
      companyLogo: null,
      teamSize: "",
      specialty: [],
      teamMembers: [],
      budgetTracking: true,
      timelineTracking: true,
      expenseAlerts: true,
      notificationPreferences: {
        email: true,
        push: true,
        sms: false,
      },
    }),
    []
  )

  const [currentStep, setCurrentStep] = useState<OnboardingStep>("welcome")
  const [data, setData] = useState<OnboardingData>(defaultData)

  const stepIndex = useMemo(() => steps.indexOf(currentStep), [steps, currentStep])
  const totalSteps = steps.length

  const updateData = (updates: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...updates }))
  }

  // As requested: goNext accepts a callback check, and fires onComplete when moving into "success".
  const goNext = (checkCallback?: (payload: OnboardingData) => boolean) => {
    const nextIndex = stepIndex + 1
    if (nextIndex < steps.length) {
      const nextStep = steps[nextIndex]
      if (nextStep === "success") {
        const shouldRun = checkCallback ? checkCallback(data) : true
        if (shouldRun) onComplete(data)
      }
      setCurrentStep(nextStep)
    }
  }

  const goPrev = () => {
    const prevIndex = stepIndex - 1
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex])
    }
  }

  // =====================
  // Shared UI helpers
  // =====================

  const stepLabels = useMemo(
    () => [
      { key: "welcome" as const, label: "Welcome" },
      { key: "company" as const, label: "Company" },
      { key: "team" as const, label: "Team" },
      { key: "preferences" as const, label: "Preferences" },
      { key: "demo" as const, label: "Preview" },
      { key: "success" as const, label: "Complete" },
    ],
    []
  )

  const progressPercent = ((stepIndex) / (totalSteps - 1)) * 100

  const dashboardRedirect = () => {
    // Prefer Next navigation if available; fallback to window.
    try {
      window.location.href = "/"
    } catch {
      ;(window as any).location = "/"
    }
  }

  // Auth interception for "Go to Dashboard"
  // (On unauthenticated access we route to /auth portal.)


  // =====================
  // Step-specific data
  // =====================

  const specialties = useMemo(
    () => [
      { id: "residential", label: "Residential", icon: Home, description: "Homes & apartments" },
      { id: "commercial", label: "Commercial", icon: Building2, description: "Offices & retail" },
      { id: "renovation", label: "Renovation", icon: Wrench, description: "Remodeling projects" },
      { id: "interior", label: "Interior Design", icon: Palette, description: "Interior work" },
      { id: "infrastructure", label: "Infrastructure", icon: Landmark, description: "Large-scale projects" },
    ],
    []
  )

  const teamSizes = useMemo(
    () => [
      { id: "1-10", label: "1-10", description: "Small team" },
      { id: "11-50", label: "11-50", description: "Growing team" },
      { id: "51-200", label: "51-200", description: "Mid-size" },
      { id: "200+", label: "200+", description: "Enterprise" },
    ],
    []
  )

  const roles = useMemo(
    () => [
      { id: "admin", label: "Admin", icon: Shield, description: "Full access to all features" },
      { id: "project_manager", label: "Project Manager", icon: Briefcase, description: "Manage projects and teams" },
      { id: "engineer", label: "Engineer", icon: Building2, description: "Technical project work" },
      { id: "accountant", label: "Accountant", icon: DollarSign, description: "Financial management" },
      { id: "worker", label: "Worker", icon: Wrench, description: "On-site team member" },
    ],
    []
  )


  // =====================
  // Company step interactions
  // =====================

  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const onCompanyDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true)
    if (e.type === "dragleave") setDragActive(false)
  }

  const onCompanyDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    const f = e.dataTransfer.files?.[0]
    if (f) {
      const reader = new FileReader()
      reader.onload = (ev) => {
        updateData({ companyLogo: (ev.target?.result as string) || null })
      }
      reader.readAsDataURL(f)
    }
  }

  const onCompanyFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      updateData({ companyLogo: (ev.target?.result as string) || null })
    }
    reader.readAsDataURL(f)
  }

  const toggleSpecialty = (specialtyId: string) => {
    const current = data.specialty || []
    const updated = current.includes(specialtyId)
      ? current.filter((s) => s !== specialtyId)
      : [...current, specialtyId]
    updateData({ specialty: updated })
  }

  const canProceedCompany = data.companyName.trim() !== "" && data.teamSize !== "" && data.specialty.length > 0

  // =====================
  // Team step interactions
  // =====================

  const [email, setEmail] = useState("")
  const [role, setRole] = useState<TeamMember["role"]>("project_manager")
  const [teamError, setTeamError] = useState("")

  const validateEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

  const addTeamMember = () => {
    const normalized = email.trim()
    if (!normalized) {
      setTeamError("Please enter an email address")
      return
    }
    if (!validateEmail(normalized)) {
      setTeamError("Please enter a valid email address")
      return
    }
    if (data.teamMembers.some((m) => m.email === normalized)) {
      setTeamError("This email has already been added")
      return
    }

    updateData({ teamMembers: [...data.teamMembers, { email: normalized, role }] })
    setEmail("")
    setRole("project_manager")
    setTeamError("")
  }

  const removeTeamMember = (emailToRemove: string) => {
    updateData({ teamMembers: data.teamMembers.filter((m) => m.email !== emailToRemove) })
  }

  const getRoleIcon = (roleId: string) => {
    return roles.find((r) => r.id === roleId)?.icon || Users
  }

  const getRoleLabel = (roleId: string) => {
    return roles.find((r) => r.id === roleId)?.label || roleId
  }

  // =====================
  // Preferences step interactions
  // =====================

  const toggleFeature = (key: "budgetTracking" | "timelineTracking" | "expenseAlerts") => {
    updateData({ [key]: !data[key] } as Partial<OnboardingData>)
  }

  // =====================
  // Demo step derived visuals
  // =====================

  const enabledMetrics = useMemo(() => {
    const list: Array<{ key: "budget" | "timeline" | "alerts"; label: string; icon: React.ComponentType<any> }> = []
    if (data.budgetTracking) list.push({ key: "budget", label: "Budget", icon: DollarSign })
    if (data.timelineTracking) list.push({ key: "timeline", label: "Timeline", icon: Calendar })
    if (data.expenseAlerts) list.push({ key: "alerts", label: "Expense Alerts", icon: AlertTriangle })
    return list
  }, [data.budgetTracking, data.timelineTracking, data.expenseAlerts])

  const demoProjects = useMemo(
    () => [
      { name: "Downtown Office Complex", progress: 75, budget: "$2.4M", spent: "$1.8M" },
      { name: "Riverside Apartments", progress: 20, budget: "$3.1M", spent: "$620K" },
      { name: "Heritage Renovation", progress: 45, budget: "$890K", spent: "$400K" },
    ],
    []
  )

  // =====================
  // Success confetti (simple, optional)
  // =====================

  const [confettiArmed, setConfettiArmed] = useState(false)
  useEffect(() => {
    if (currentStep !== "success") return
    // Lazy-load to avoid build issues if canvas-confetti isn't installed.
    let cancelled = false
    ;(async () => {
      try {
        const mod = await import("canvas-confetti")
        if (cancelled) return
        const confetti = (mod as any).default || mod
        const end = Date.now() + 2200
        const colors = ["#f97316", "#fb923c", "#fdba74"]
        const frame = () => {
          confetti({ particleCount: 4, angle: 60, spread: 55, origin: { x: 0 }, colors })
          confetti({ particleCount: 4, angle: 120, spread: 55, origin: { x: 1 }, colors })
          if (Date.now() < end) requestAnimationFrame(frame)
        }
        frame()
      } catch {
        // no-op
      } finally {
        if (!cancelled) setConfettiArmed(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [currentStep])

  // =====================
  // Full step content switch
  // =====================

  const renderStepContent = () => {
    switch (currentStep) {
      case "welcome": {
        const features = [
          { icon: ClipboardList, label: "Project Tracking" },
          { icon: Users, label: "Team Management" },
          { icon: DollarSign, label: "Budget Control" },
          { icon: Calendar, label: "Timeline View" },
          { icon: BarChart3, label: "Analytics" },
          { icon: Building2, label: "Client Portal" },
        ]

        return (
          <div className="min-h-[calc(100vh-96px)] flex flex-col items-center justify-center px-4 py-10">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="text-center max-w-3xl w-full"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFC107]/10 border border-[#FFC107]/20 text-[#FFC107] text-sm font-medium mb-6">

                <span className="relative flex h-2 w-2">
<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FFC107] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FFC107]" />
                </span>
Welcome to Arcadia
              </div>

              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-bold text-zinc-50 mb-6 text-balance"
              >
                Build Smarter.<span className="text-[#FFC107]"> Deliver Faster.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.14 }}
                className="text-lg sm:text-xl text-zinc-300/90 mb-10 max-w-2xl mx-auto text-pretty"
              >
                The all-in-one construction project management platform. Track projects, manage teams, and control budgets—
                all in one powerful workspace.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18, duration: 0.65 }}
                className="relative mb-10"
              >
                <div className="border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-6 sm:p-8 max-w-2xl mx-auto">
                  <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-4">
                    {[
                      { label: "Active Projects", value: "24", color: "bg-[#FFC107]" },
                      { label: "Team Members", value: "48", color: "bg-indigo-400" },
                      { label: "Budget Utilized", value: "78%", color: "bg-emerald-400" },
                    ].map((stat, i) => (
                      <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.22 + i * 0.06 }}
                        className="bg-zinc-800/40 rounded-xl p-3 sm:p-4"
                      >
                        <div className={cn("w-2 h-2 rounded-full", stat.color)} />
                        <div className="text-xl sm:text-2xl font-bold text-zinc-50 mt-2">{stat.value}</div>
                        <div className="text-xs text-zinc-400">{stat.label}</div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="bg-zinc-800/30 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-zinc-50">Project Timeline</span>
                      <span className="text-xs text-zinc-400">Q2 2024</span>
                    </div>
                    <div className="flex gap-2">
                      {["Planning", "Foundation", "Structure", "Finishing"].map((phase, i) => (
                        <motion.div
                          key={phase}
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ delay: 0.45 + i * 0.08, duration: 0.35 }}
                          className={cn(
                            "flex-1 h-8 rounded-lg flex items-center justify-center text-xs font-medium origin-left",
                            i < 2 ? "bg-[#FFC107] text-zinc-950" : "bg-zinc-800 text-zinc-400"
                          )}
                        >
                          <span className="hidden sm:inline">{phase}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.22 }}
                className="flex flex-wrap justify-center gap-2 mb-10"
              >
                {features.map((feature, i) => (
                  <motion.div
                    key={feature.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.28 + i * 0.05 }}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-800/40 text-sm text-zinc-300"
                  >
                    <feature.icon className="w-3.5 h-3.5 text-[#FFC107]" />
                    {feature.label}
                  </motion.div>
                ))}
              </motion.div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button
                  onClick={() => goNext()}
                  className="px-9 py-5 text-lg font-medium"
                >
                  Set Up Workspace
                  <ArrowRight className="w-5 h-5" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep("success")}
                  className="px-8 py-5 text-lg font-medium"
                >
                  Skip onboarding
                </Button>
              </div>
            </motion.div>
          </div>
        )
      }

      case "company": {
        return (
          <div className="min-h-[calc(100vh-96px)] flex flex-col items-center justify-center px-4 py-10">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-2xl"
            >
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#FFC107]/10 text-[#FFC107] mb-4 border border-[#FFC107]/20">
                  <Building2 className="w-6 h-6" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-zinc-50 mb-2">Set up your company</h2>
                <p className="text-zinc-400">Tell us about your construction business</p>
              </div>

              <div className="space-y-8">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    placeholder="Enter your company name"
                    value={data.companyName}
                    onChange={(e) => updateData({ companyName: e.target.value })}
                    autoComplete="organization"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Company Logo (Optional)</Label>
                  <div
                    onDragEnter={onCompanyDrag}
                    onDragLeave={onCompanyDrag}
                    onDragOver={onCompanyDrag}
                    onDrop={onCompanyDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      "relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer transition-colors",
dragActive
                          ? "border-[#FFC107] bg-[#FFC107]/5"
                          : "border-zinc-800 hover:border-[#FFC107]/50 bg-zinc-900/30"
                    )}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click()
                    }}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={onCompanyFile}
                      className="hidden"
                    />

                    {data.companyLogo ? (
                      <div className="flex items-center gap-4">
                        <img
                          src={data.companyLogo}
                          alt="Company logo"
                          className="w-16 h-16 rounded-lg object-cover border border-zinc-800"
                        />
                        <div className="text-left">
                          <p className="text-sm font-medium text-zinc-50">Logo uploaded</p>
                          <p className="text-xs text-zinc-400">Click to change</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-zinc-400 mb-2" />
                        <p className="text-sm text-zinc-400">Drag & drop or click to upload</p>
                        <p className="text-xs text-zinc-500 mt-1">PNG, JPG up to 5MB</p>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Team Size</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {teamSizes.map((size) => {
                      const selected = data.teamSize === size.id
                      return (
                        <button
                          key={size.id}
                          type="button"
                          onClick={() => updateData({ teamSize: size.id })}
                          className={cn(
                            "p-4 rounded-xl border-2 text-center transition-all",
                            selected
                          ? "border-[#FFC107] bg-[#FFC107]/10"
                          : "border-zinc-800 hover:border-[#FFC107]/50 bg-zinc-900/30"
                          )}
                        >
                          <div className="text-lg font-bold text-zinc-50">{size.label}</div>
                          <div className="text-xs text-zinc-400">{size.description}</div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Construction Specialty (Select all that apply)</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {specialties.map((s) => {
                      const isSelected = data.specialty.includes(s.id)
                      const Icon = s.icon
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => toggleSpecialty(s.id)}
                          className={cn(
                            "relative p-4 rounded-xl border-2 text-left transition-all",
                            isSelected
                              ? "border-[#FFC107] bg-[#FFC107]/10"
                              : "border-zinc-800 hover:border-[#FFC107]/50 bg-zinc-900/30"
                          )}
                        >
                          {isSelected && (
                            <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#FFC107] flex items-center justify-center">
                              <Check className="w-3 h-3 text-zinc-950" />
                            </div>
                          )}
                          <Icon className={cn("w-5 h-5 mb-2", isSelected ? "text-[#FFC107]" : "text-zinc-500")} />
                          <div className="font-medium text-zinc-50">{s.label}</div>
                          <div className="text-xs text-zinc-400">{s.description}</div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-6 border-t border-zinc-800 mt-10">
                  <Button variant="outline" onClick={goPrev} className="flex items-center gap-2 px-4 py-3">
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </Button>
                  <Button
                    onClick={() => goNext((d) => d.companyName.trim() !== "" && d.teamSize !== "" && d.specialty.length > 0)}
                    disabled={!canProceedCompany}
                    className="flex items-center gap-2 px-6 py-3"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )
      }

      case "team": {
        return (
          <div className="min-h-[calc(100vh-96px)] flex flex-col items-center justify-center px-4 py-10">
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#FFC107]/10 text-[#FFC107] mb-4 border border-[#FFC107]/20">
                  <Users className="w-6 h-6" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-zinc-50 mb-2">Invite your team</h2>
                <p className="text-zinc-400">Add team members to start collaborating on projects</p>
              </div>

              <Card className="p-6 mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <Label htmlFor="teamEmail" className="mb-2">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                      <Input
                        id="teamEmail"
                        type="email"
                        placeholder="colleague@company.com"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value)
                          setTeamError("")
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            addTeamMember()
                          }
                        }}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="sm:w-48">
                    <Label className="mb-2">Role</Label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as TeamMember["role"])}
                      className="h-11 w-full rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-100 px-3 focus:outline-none focus:ring-2 focus:ring-[#FFC107]/50"
                    >
                      {roles.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-end">
                    <Button onClick={addTeamMember} className="h-11 px-4">
                      <Plus className="w-4 h-4" />
                      <span className="hidden sm:inline">Add</span>
                    </Button>
                  </div>
                </div>

                {teamError && (
                  <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-red-400 mt-3">
                    {teamError}
                  </motion.p>
                )}
              </Card>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="mb-0">Team Members ({data.teamMembers.length})</Label>
                  {data.teamMembers.length > 0 && <span className="text-xs text-zinc-400">Invites will be sent after setup</span>}
                </div>

                <AnimatePresence mode="popLayout">
                  {data.teamMembers.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      className="text-center py-12 rounded-xl border-2 border-dashed border-zinc-800 bg-zinc-900/20"
                    >
                      <Users className="w-10 h-10 text-zinc-400 mx-auto mb-3" />
                      <p className="text-zinc-400">No team members added yet</p>
                      <p className="text-xs text-zinc-500 mt-1">Add your first team member above</p>
                    </motion.div>
                  ) : (
                    <div className="space-y-2">
                      {data.teamMembers.map((member) => {
                        const RoleIcon = getRoleIcon(member.role)
                        return (
                          <motion.div
                            key={member.email}
                            layout
                            initial={{ opacity: 0, x: -12 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 12 }}
                            className="flex items-center justify-between p-4 rounded-xl bg-zinc-900/30 border border-zinc-800 group hover:border-[#FFC107]/20 transition-colors"
                          >
<div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-[#FFC107]/10 flex items-center justify-center">
                                <span className="text-sm font-medium text-[#FFC107]">
                                  {member.email[0]?.toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-zinc-50">{member.email}</p>
                                <div className="flex items-center gap-1 text-xs text-zinc-400">
                                  <RoleIcon className="w-3.5 h-3.5 text-[#FFC107]" />
                                  {getRoleLabel(member.role)}
                                </div>
                              </div>
                            </div>

                            <Button
                              variant="outline"
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-300 border-zinc-800 bg-zinc-900/40"
                              onClick={() => removeTeamMember(member.email)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </motion.div>
                        )
                      })}
                    </div>
                  )}
                </AnimatePresence>
              </div>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Role Permissions</CardTitle>
                  <CardDescription>Quick glance at what each role can do.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {roles.slice(0, 3).map((r) => {
                      const Icon = r.icon
                      return (
                        <div key={r.id} className="flex items-start gap-2">
                          <Icon className="w-4 h-4 text-[#FFC107] mt-0.5" />
                          <div>
                            <p className="text-xs font-medium text-zinc-50">{r.label}</p>
                            <p className="text-xs text-zinc-400">{r.description}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-between items-center mt-10 pt-6 border-t border-zinc-800">
                <Button variant="outline" onClick={goPrev} className="flex items-center gap-2 px-4 py-3">
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>

                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    onClick={() => goNext()}
                    className="border-zinc-800 bg-zinc-900/40 text-zinc-300"
                  >
                    Skip for now
                  </Button>
                  <Button onClick={() => goNext()} className="flex items-center gap-2 px-6 py-3">
                    Continue
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )
      }

      case "preferences": {
        const features = [
          {
            id: "budgetTracking" as const,
            label: "Budget Tracking",
            description: "Monitor project budgets, costs, and profitability in real-time",
            icon: DollarSign,
            enabled: data.budgetTracking,
          },
          {
            id: "timelineTracking" as const,
            label: "Timeline Tracking",
            description: "Visualize project phases, milestones, and deadlines",
            icon: Calendar,
            enabled: data.timelineTracking,
          },
          {
            id: "expenseAlerts" as const,
            label: "Expense Alerts",
            description: "Get notified when expenses exceed thresholds",
            icon: AlertTriangle,
            enabled: data.expenseAlerts,
          },
        ]

        return (
          <div className="min-h-[calc(100vh-96px)] flex flex-col items-center justify-center px-4 py-10">
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#FFC107]/10 text-[#FFC107] mb-4 border border-[#FFC107]/20">
                  <Settings className="w-6 h-6" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-zinc-50 mb-2">Configure your workspace</h2>
                <p className="text-zinc-400">Customize features and notification preferences</p>
              </div>

              <div className="mb-8">
                <div className="text-sm font-medium text-zinc-400 mb-4">Project Features</div>
                <div className="space-y-3">
                  {features.map((feature, idx) => {
                    const Icon = feature.icon
                    return (
                      <motion.button
                        key={feature.id}
                        type="button"
                        initial={{ opacity: 0, x: -14 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.06 + idx * 0.05 }}
                        onClick={() => toggleFeature(feature.id)}
                        className={cn(
                          "w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left",
feature.enabled
                             ? "border-[#FFC107]/60 bg-[#FFC107]/5"
                             : "border-zinc-800 bg-zinc-900/30"
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={cn(
"w-10 h-10 rounded-lg flex items-center justify-center border",
                               feature.enabled ? "bg-[#FFC107]/20 border-[#FFC107]/20" : "bg-zinc-900 border-zinc-800"
                             )}
                           >
                             <Icon className={cn("w-5 h-5", feature.enabled ? "text-[#FFC107]" : "text-zinc-400")} />
                          </div>
                          <div>
                            <p className="font-medium text-zinc-50">{feature.label}</p>
                            <p className="text-sm text-zinc-400">{feature.description}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-xs font-medium text-zinc-300">{feature.enabled ? "On" : "Off"}</span>
                          <span
                            className={cn(
                              "relative inline-flex items-center h-6 w-11 rounded-full transition-colors",
                              feature.enabled ? "bg-[#FFC107]/70" : "bg-zinc-800"
                            )}
                          >
                            <motion.span
                              layout
                              className={cn(
                                "inline-block h-5 w-5 rounded-full bg-zinc-950 border border-zinc-800",
                                feature.enabled ? "translate-x-5" : "translate-x-1"
                              )}
                              transition={{ type: "spring", stiffness: 260, damping: 18 }}
                            />
                          </span>
                        </div>
                      </motion.button>
                    )
                  })}
                </div>
              </div>

              <div className="rounded-xl bg-[#FFC107]/5 border border-[#FFC107]/20 p-4">
                <div className="flex items-start gap-3">
<div className="w-6 h-6 rounded-full bg-[#FFC107]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-[#FFC107]">!</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-50">Pro Tip</p>
                    <p className="text-xs text-zinc-400">
                      You can always change these settings later from your workspace preferences. We recommend enabling all tracking
                      features to get the most out of Arcadia.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center mt-10 pt-6 border-t border-zinc-800">
                <Button variant="outline" onClick={goPrev} className="flex items-center gap-2 px-4 py-3">
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
                <Button onClick={() => goNext()} className="flex items-center gap-2 px-6 py-3">
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          </div>
        )
      }

      case "demo": {
        return (
          <div className="min-h-[calc(100vh-96px)] flex flex-col items-center justify-center px-4 py-10">
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-5xl">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-amber-500/10 text-amber-300 mb-4 border border-amber-500/20">
                  <Eye className="w-6 h-6" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-zinc-50 mb-2">Preview your workspace</h2>
                <p className="text-zinc-400">
                  Here&apos;s what {data.companyName ? data.companyName : "your workspace"} will look like
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    {
                      label: "Active Projects",
                      value: enabledMetrics.length ? "12" : "6",
                      icon: FileText,
                      color: "text-amber-300",
                    },
                    {
                      label: "Team Members",
                      value: String(data.teamMembers.length || 48),
                      icon: Users,
                      color: "text-indigo-300",
                    },
                    {
                      label: "Total Budget",
                      value: data.budgetTracking ? "$6.4M" : "$0.0M",
                      icon: DollarSign,
                      color: "text-emerald-300",
                    },
                    {
                      label: "On Track",
                      value: data.timelineTracking ? "92%" : "63%",
                      icon: TrendingUp,
                      color: "text-amber-300",
                    },
                  ].map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.08 + i * 0.06 }}
                      className="border border-zinc-800 bg-zinc-900/40 rounded-xl p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <stat.icon className={cn("w-4 h-4", stat.color)} />
                        <span className="text-xs text-zinc-400">+12%</span>
                      </div>
                      <div className="text-2xl font-bold text-zinc-50">{stat.value}</div>
                      <div className="text-xs text-zinc-400">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>

                <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2 border border-zinc-800 bg-zinc-900/30 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-zinc-50 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-300" />
                      Project Timeline
                    </h3>
                    <span className="text-xs text-zinc-400">Downtown Office Complex</span>
                  </div>

                  {data.timelineTracking ? (
                    <div className="relative">
                      <div className="absolute top-4 left-0 right-0 h-1 bg-zinc-800 rounded-full" />
                      <motion.div
                        className="absolute top-4 left-0 h-1 bg-amber-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: "45%" }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                      />

                      <div className="relative flex justify-between pt-8">
                        {[
                          { name: "Planning", duration: "2 weeks", status: "completed" },
                          { name: "Foundation", duration: "4 weeks", status: "completed" },
                          { name: "Structure", duration: "8 weeks", status: "in_progress" },
                          { name: "MEP Systems", duration: "6 weeks", status: "upcoming" },
                          { name: "Finishing", duration: "4 weeks", status: "upcoming" },
                        ].map((phase, idx) => {
                          const isCompleted = phase.status === "completed"
                          const isInProgress = phase.status === "in_progress"
                          const dotCls = isCompleted
                            ? "bg-amber-500 border-amber-500"
                            : isInProgress
                              ? "bg-zinc-950 border-amber-500"
                              : "bg-zinc-950 border-zinc-700"

                          return (
                            <motion.div
                              key={phase.name}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.22 + idx * 0.07 }}
                              className="flex flex-col items-center"
                            >
                              <div
                                className={cn(
                                  "absolute -top-4 w-3 h-3 rounded-full border-2",
                                  dotCls
                                )}
                                style={{ left: `${(idx / 4) * 100}%`, transform: "translateX(-50%)" }}
                              />
                              <span
                                className={cn(
                                  "text-xs font-medium",
                                  isCompleted || isInProgress ? "text-zinc-50" : "text-zinc-400"
                                )}
                              >
                                {phase.name}
                              </span>
                              <span className="text-xs text-zinc-400">{phase.duration}</span>
                            </motion.div>
                          )
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/20 p-6">
                      <div className="flex items-center gap-2 text-zinc-200 mb-2">
                        <AlertCircle className="w-4 h-4 text-amber-300" />
                        Timeline Tracking is disabled
                      </div>
                      <p className="text-sm text-zinc-400">
                        Turn it on in Preferences to see milestones and deadlines.
                      </p>
                    </div>
                  )}
                </motion.div>

                <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }} className="border border-zinc-800 bg-zinc-900/30 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-zinc-50 flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-amber-300" />
                      Budget Overview
                    </h3>
                  </div>

                  {data.budgetTracking ? (
                    <div className="space-y-4">
                      {demoProjects.map((project, i) => {
                        const spentPercent = Math.max(0, Math.min(100, Math.round((Number(project.spent.replace(/[^0-9.]/g, "")) / Math.max(1, Number(project.budget.replace(/[^0-9.]/g, "")))) * 100)))
                        return (
                          <motion.div key={project.name} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.08 + i * 0.06 }}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium text-zinc-50 truncate pr-2">{project.name}</span>
                              <span className="text-xs text-zinc-400">
                                {project.spent}/{project.budget}
                              </span>
                            </div>
                            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                              <motion.div
                                className={cn(
                                  "h-full rounded-full",
                                  spentPercent > 80 ? "bg-red-500" : "bg-amber-500"
                                )}
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.max(6, spentPercent)}%` }}
                                transition={{ duration: 0.5 }}
                              />
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/20 p-6">
                      <div className="flex items-center gap-2 text-zinc-200 mb-2">
                        <AlertCircle className="w-4 h-4 text-amber-300" />
                        Budget Tracking is disabled
                      </div>
                      <p className="text-sm text-zinc-400">Enable Budget Tracking to view spend progress and thresholds.</p>
                    </div>
                  )}
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }} className="lg:col-span-2 border border-zinc-800 bg-zinc-900/30 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-zinc-50 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-amber-300" />
                      Renovation Requests
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-medium">3 new</span>
                  </div>

                  <div className="space-y-2">
                    {[
                      { client: "Acme Corp", type: "Kitchen Renovation", date: "2 hours ago", priority: "high" as const },
                      { client: "Smith Residence", type: "Bathroom Remodel", date: "5 hours ago", priority: "medium" as const },
                      { client: "Tech Hub Inc", type: "Office Buildout", date: "1 day ago", priority: "low" as const },
                    ].map((r, i) => {
                      const dot =
                        r.priority === "high" ? "bg-red-500" : r.priority === "medium" ? "bg-amber-500" : "bg-zinc-600"
                      return (
                        <motion.div
                          key={r.client}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.22 + i * 0.07 }}
                          className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/30 hover:bg-zinc-800/40 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn("w-2 h-2 rounded-full", dot)} />
                            <div>
                              <p className="text-sm font-medium text-zinc-50">{r.client}</p>
                              <p className="text-xs text-zinc-400">{r.type}</p>
                            </div>
                          </div>
                          <span className="text-xs text-zinc-400">{r.date}</span>
                        </motion.div>
                      )
                    })}
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }} className="border border-zinc-800 bg-zinc-900/30 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-zinc-50 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-amber-300" />
                      Recent Tasks
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {[
                      { task: "Review blueprints", assignee: "JD", status: "completed" as const },
                      { task: "Order materials", assignee: "MK", status: "in_progress" as const },
                      { task: "Site inspection", assignee: "AL", status: "pending" as const },
                    ].map((item, i) => (
                      <motion.div key={item.task} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.28 + i * 0.06 }} className="flex items-center gap-3">
                        <div
                          className={cn(
                            "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                            item.status === "completed" ? "bg-amber-500 border-amber-500" : item.status === "in_progress" ? "border-amber-500" : "border-zinc-600"
                          )}
                        >
                          {item.status === "completed" ? <CheckCircle2 className="w-3 h-3 text-zinc-950" /> : null}
                          {item.status === "in_progress" ? <div className="w-2 h-2 rounded-full bg-amber-500" /> : null}
                        </div>
                        <div className="flex-1">
                          <p className={cn("text-sm", item.status === "completed" ? "text-zinc-400 line-through" : "text-zinc-50")}>
                            {item.task}
                          </p>
                        </div>
                        <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center">
                          <span className="text-xs font-medium text-zinc-300">{item.assignee}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>

              <div className="flex items-center justify-center gap-6 text-xs text-zinc-400 mb-8 flex-wrap">
                <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-amber-300" />Real-time updates</span>
                <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-amber-300" />Team collaboration</span>
                <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-amber-300" />Budget tracking</span>
              </div>

              <div className="flex justify-between items-center pt-6 border-t border-zinc-800">
                <Button variant="outline" onClick={goPrev} className="flex items-center gap-2 px-4 py-3">
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
                <Button onClick={() => goNext()} className="flex items-center gap-2 px-6 py-3">
                  Complete Setup
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          </div>
        )
      }

      case "success": {
        const enabledFeatures = [
          data.budgetTracking ? "Budget" : null,
          data.timelineTracking ? "Timeline" : null,
          data.expenseAlerts ? "Alerts" : null,
        ].filter(Boolean)

        return (
          <div className="min-h-[calc(100vh-96px)] flex flex-col items-center justify-center px-4 py-10 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45 }}
              className="w-full max-w-lg text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 220, damping: 15, delay: 0.08 }}
                className="relative inline-flex items-center justify-center mb-6"
              >
                <div className="absolute inset-0 w-24 h-24 rounded-full bg-amber-500/20 animate-pulse" />
                <div className="relative w-24 h-24 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.14, type: "spring" }}>
                    <CheckCircle2 className="w-12 h-12 text-amber-300" />
                  </motion.div>
                </div>
              </motion.div>

              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm font-medium mb-4">
                <Sparkles className="w-4 h-4" />
                Setup Complete
              </div>

              <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="text-3xl sm:text-4xl font-bold text-zinc-50 mb-4">
                Workspace Ready!
              </motion.h1>

              <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }} className="text-zinc-400 mb-8 max-w-md mx-auto text-sm sm:text-base">
                {data.companyName ? `${data.companyName}'s` : "Your"} workspace is configured and ready to go. Start managing your construction projects like a pro.
              </motion.p>

              <Card className="rounded-2xl p-6 mb-8 text-left">
                <h3 className="text-sm font-medium text-zinc-400 mb-4">Setup Summary</h3>
                <div className="space-y-4">
                  {[
                    {
                      label: "Company",
                      value: data.companyName || "Your Company",
                      icon: Building2,
                    },
                    {
                      label: "Team Members",
                      value: `${data.teamMembers.length} invited`,
                      icon: Users,
                    },
                    {
                      label: "Features Enabled",
                      value: enabledFeatures.length ? enabledFeatures.join(", ") : "All features",
                      icon: Settings,
                    },
                  ].map((item, i) => {
                    const Icon = item.icon
                    return (
                      <motion.div key={item.label} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.18 + i * 0.07 }} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                          <Icon className="w-4 h-4 text-amber-300" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-zinc-400">{item.label}</p>
                          <p className="text-sm font-medium text-zinc-50">{item.value}</p>
                        </div>
                        <CheckCircle2 className="w-4 h-4 text-amber-300" />
                      </motion.div>
                    )
                  })}
                </div>
              </Card>

              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }} className="space-y-4">
                <Button
                  onClick={() => {
                    dashboardRedirect()
                  }}
                  className="w-full sm:w-auto px-8 py-6 text-lg font-medium"
                >
                  <Rocket className="w-5 h-5" />
                  Go to Dashboard
                  <ArrowRight className="w-5 h-5" />
                </Button>
                <p className="text-xs text-zinc-500">
                  {data.teamMembers.length > 0 ? "Team invitations will be sent shortly" : "You can invite teammates anytime from your dashboard"}
                </p>
              </motion.div>

              {/* Decorative elements */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(10)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 rounded-full bg-amber-500/30"
                    initial={{ x: Math.random() * 140 - 70, y: Math.random() * 180 - 90, scale: 0 }}
                    animate={{ x: Math.random() * 280 - 140, y: Math.random() * 260 - 130, scale: [0, 1, 0] }}
                    transition={{ duration: 3.2, repeat: confettiArmed ? 0 : Infinity, delay: i * 0.12, ease: "easeInOut" }}
                    style={{ left: `${18 + i * 7}%`, top: `${26 + (i % 4) * 18}%` }}
                  />
                ))}
              </motion.div>
            </motion.div>
          </div>
        )
      }

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background bg-grid-pattern relative">
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
      </div>

      {/* Upper dashboard header */}
      <header className="relative z-10 border-b border-zinc-800/60 bg-zinc-950/70 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-zinc-950 overflow-hidden">
                <img
                  src="/assets/MAINLOGO.png"
                  alt="Arcadia logo"
                  className="w-5 h-5 object-contain"
                />
              </div>
              <span className="font-bold text-lg text-zinc-50">Arcadia</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 text-sm text-zinc-300">
                <LayoutDashboard className="w-4 h-4 text-amber-300" />
                <span className="font-medium">Step {stepIndex + 1} of {totalSteps}</span>
              </div>
              <div className="sm:hidden text-sm text-zinc-400">Step {stepIndex + 1} of 6</div>
            </div>
          </div>
        </div>
      </header>

      {/* Progress bar + nodes (desktop) */}
      {currentStep !== "welcome" && currentStep !== "success" && (
        <motion.div
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 py-6 border-b border-zinc-800/50 bg-zinc-950/40 backdrop-blur-sm"
        >
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <Progress value={progressPercent} />
            <div className="flex justify-between mt-4">
              {stepLabels.map((s, idx) => {
                const isActive = currentStep === s.key
                const isCompleted = stepIndex > idx
                return (
<div key={`${s.key}-${idx}`} className="flex flex-col items-center">
<motion.div
                       className={cn(
                         "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium border",
                         isActive
                           ? "bg-[#FFC107] text-zinc-950 border-[#FFC107]"
                           : isCompleted
                             ? "bg-[#FFC107]/20 text-[#FFC107] border-[#FFC107]/20"
                             : "bg-zinc-900 text-zinc-500 border-zinc-800"
                       )}
                       animate={{ scale: isActive ? 1.08 : 1 }}
                       transition={{ duration: 0.2 }}
                     >
                       {isCompleted ? (
                         <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                         </svg>
                       ) : (
                         idx + 1
                       )}
                     </motion.div>
                     <span
                       className={cn(
                         "mt-2 text-xs hidden sm:block",
                         isActive ? "text-[#FFC107] font-medium" : "text-zinc-600"
                       )}
                     >
                      {s.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </motion.div>
      )}

      <main className="relative z-10">
          <AnimatePresence>
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -18 }}
              transition={{ duration: 0.28, ease: "easeInOut" }}
              // IMPORTANT: re-mount only when the step changes.
              // Avoid remounting on keystrokes (input state updates).
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>
      </main>

      {/* Keyboard hint for non-start/end */}
      {currentStep !== "welcome" && currentStep !== "success" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 text-xs text-zinc-500 hidden sm:flex items-center gap-4"
        >
          <span className="flex items-center gap-1">
            <kbd className="px-2 py-0.5 rounded bg-zinc-800 text-xs">Tab</kbd>
            to navigate
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-2 py-0.5 rounded bg-zinc-800 text-xs">Enter</kbd>
            to continue
          </span>
        </motion.div>
      )}
    </div>
  )
}

