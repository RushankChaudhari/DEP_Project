import { WarningDiamond, TrendUp, ShieldCheck } from "@phosphor-icons/react/dist/ssr"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { Suggestion } from "@/types/dashboard"

const priorityStyles = {
  High: "bg-rose-100 text-rose-700",
  Medium: "bg-amber-100 text-amber-700",
  Low: "bg-emerald-100 text-emerald-700",
} as const

export function SuggestionCard({ suggestion }: { suggestion: Suggestion }) {
  const Icon = suggestion.priority === "High" ? WarningDiamond : suggestion.priority === "Medium" ? TrendUp : ShieldCheck

  return (
    <Card className="rounded-[1.6rem] border-white/60 bg-white/85 shadow-[0_18px_50px_-30px_rgba(30,41,59,0.55)] backdrop-blur">
      <CardContent className="space-y-4 p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-full bg-slate-950 text-white">
              <Icon className="size-5" weight="fill" />
            </span>
            <div>
              <p className="text-lg font-semibold text-slate-950">{suggestion.title}</p>
              <p className="text-sm text-slate-500">Strategic action item</p>
            </div>
          </div>
          <Badge className={cn("rounded-full px-3 py-1 text-xs font-semibold", priorityStyles[suggestion.priority as keyof typeof priorityStyles] ?? "bg-slate-100 text-slate-700")}>
            {suggestion.priority}
          </Badge>
        </div>
        <p className="text-sm leading-7 text-slate-600">{suggestion.description}</p>
      </CardContent>
    </Card>
  )
}
