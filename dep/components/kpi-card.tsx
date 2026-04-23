import { ArrowDownRight, ArrowUpRight } from "@phosphor-icons/react/dist/ssr"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type KpiCardProps = {
  label: string
  value: string
  detail: string
  tone?: "neutral" | "positive" | "negative"
}

export function KpiCard({ label, value, detail, tone = "neutral" }: KpiCardProps) {
  const icon = tone === "negative" ? ArrowDownRight : ArrowUpRight
  const Icon = icon

  return (
    <Card className="overflow-hidden rounded-[1.75rem] border-white/60 bg-white/85 shadow-[0_25px_60px_-32px_rgba(30,41,59,0.55)] backdrop-blur">
      <CardContent className="space-y-4 p-6">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">{label}</p>
          <Badge
            className={cn(
              "rounded-full px-2.5 py-1 text-[11px] font-semibold",
              tone === "positive" && "bg-emerald-100 text-emerald-700",
              tone === "negative" && "bg-rose-100 text-rose-700",
              tone === "neutral" && "bg-slate-100 text-slate-700"
            )}
          >
            <Icon className="mr-1 inline size-3.5" weight="bold" />
            {tone === "negative" ? "Attention" : tone === "positive" ? "Ahead" : "Stable"}
          </Badge>
        </div>
        <div>
          <p className="text-3xl font-semibold tracking-tight text-slate-950">{value}</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">{detail}</p>
        </div>
      </CardContent>
    </Card>
  )
}
