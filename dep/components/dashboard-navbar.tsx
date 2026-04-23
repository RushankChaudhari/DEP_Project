"use client"

import { TrendUp, UploadSimple } from "@phosphor-icons/react/dist/ssr"

import { cn } from "@/lib/utils"

const SECTION_META = {
  global: { label: "Global Insights", icon: TrendUp },
  local: { label: "Local Analysis", icon: UploadSimple },
  compare: { label: "Comparison", icon: TrendUp },
  suggestions: { label: "Strategic Suggestions", icon: TrendUp },
} as const

type SectionKey = keyof typeof SECTION_META

type DashboardNavbarProps = {
  activeSection: SectionKey
  onSelect: (section: SectionKey) => void
  hasLocalData: boolean
}

export function DashboardNavbar({ activeSection, onSelect, hasLocalData }: DashboardNavbarProps) {
  const visibleSections = (Object.keys(SECTION_META) as SectionKey[]).filter((section) => {
    if ((section === "compare" || section === "suggestions") && !hasLocalData) {
      return false
    }
    return true
  })

  return (
    <nav className="flex flex-wrap items-center gap-2 rounded-[2rem] border border-white/50 bg-white/80 p-2 shadow-[0_18px_55px_-24px_rgba(10,37,64,0.55)] backdrop-blur">
      {visibleSections.map((section) => {
        const item = SECTION_META[section]
        const Icon = item.icon
        const isActive = section === activeSection

        return (
          <button
            key={section}
            type="button"
            onClick={() => onSelect(section)}
            className={cn(
              "inline-flex items-center gap-2 rounded-[1.2rem] px-4 py-3 text-sm font-medium transition",
              isActive
                ? "bg-slate-950 text-white shadow-[0_12px_30px_-18px_rgba(15,23,42,0.85)]"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
            )}
          >
            <Icon className="size-4" weight={isActive ? "fill" : "regular"} />
            <span>{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
