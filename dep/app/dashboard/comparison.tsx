import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ChartPanel } from "@/components/chart-panel"
import { KpiCard } from "@/components/kpi-card"
import { formatCompactCurrency, formatMetricLabel, formatPercent } from "@/lib/formatters"
import type { CompareResponse } from "@/types/dashboard"

export function Comparison({ data }: { data: CompareResponse | null }) {
  if (!data) {
    return <p className="rounded-[1.4rem] bg-white/75 p-6 text-sm text-slate-600 shadow-[0_20px_55px_-35px_rgba(15,23,42,0.55)]">Upload a local dataset to compare your store against the global benchmark.</p>
  }

  // Add rich context fields
  const revGap = data.comparison.find(c => c.metric === "total_revenue")
  const sortedGaps = [...data.comparison].sort((a,b) => b.gap_percent - a.gap_percent)
  const strongest = sortedGaps[0]
  const weakest = sortedGaps[sortedGaps.length - 1]

  return (
    <section className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <KpiCard 
          label="Total Revenue Gap" 
          value={formatCompactCurrency(revGap?.gap || 0)} 
          detail={`Local revenue is ${formatPercent(revGap?.gap_percent || 0)} vs global baseline.`} 
          tone={revGap && revGap.gap >= 0 ? "positive" : "negative"} 
        />
        <KpiCard 
          label="Biggest Relative Strength" 
          value={strongest ? formatMetricLabel(strongest.metric) : "-"} 
          detail={strongest ? `${formatPercent(strongest.gap_percent)} greater than the benchmark average.` : "No data available"} 
          tone="positive" 
        />
        <KpiCard 
          label="Biggest Relative Weakness" 
          value={weakest ? formatMetricLabel(weakest.metric) : "-"} 
          detail={weakest ? `${formatPercent(weakest.gap_percent)} lower than the benchmark average.` : "No data available"} 
          tone="negative" 
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
        <ChartPanel title="KPI Gap Table" eyebrow="Global vs Local">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Metric</TableHead>
                <TableHead>Global</TableHead>
                <TableHead>Local</TableHead>
                <TableHead>Gap</TableHead>
                <TableHead>Gap %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.comparison.map((row) => (
                <TableRow key={row.metric}>
                  <TableCell className="font-medium">{formatMetricLabel(row.metric)}</TableCell>
                  <TableCell>{formatCompactCurrency(row.global)}</TableCell>
                  <TableCell>{formatCompactCurrency(row.local)}</TableCell>
                  <TableCell>{formatCompactCurrency(row.gap)}</TableCell>
                  <TableCell>{formatPercent(row.gap_percent)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ChartPanel>

        <ChartPanel title="Gap Radar" eyebrow="Variance by Metric">
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.comparison} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#dbe4f0" />
                <XAxis type="number" tick={{ fill: "#475569", fontSize: 12 }} />
                <YAxis dataKey="metric" type="category" tickFormatter={formatMetricLabel} width={130} tick={{ fill: "#475569", fontSize: 12 }} />
                <Tooltip formatter={(value) => formatCompactCurrency(Number(value))} labelFormatter={(value) => formatMetricLabel(String(value))} />
                <Bar dataKey="gap" fill="#ec4899" radius={[0, 18, 18, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartPanel>
      </div>
    </section>
  )
}
