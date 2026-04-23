import type { ReactNode } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type ChartPanelProps = {
  title: string
  eyebrow?: string
  children: ReactNode
}

export function ChartPanel({ title, eyebrow, children }: ChartPanelProps) {
  return (
    <Card className="rounded-[1.75rem] border-white/60 bg-white/85 shadow-[0_25px_60px_-32px_rgba(30,41,59,0.55)] backdrop-blur">
      <CardHeader className="pb-4">
        {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{eyebrow}</p> : null}
        <CardTitle className="text-xl text-slate-950">{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}
