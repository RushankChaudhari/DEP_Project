import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import { ChartPanel } from "@/components/chart-panel"
import { KpiCard } from "@/components/kpi-card"
import { formatCompactCurrency, formatCurrency, formatPercent } from "@/lib/formatters"
import type { GlobalResponse } from "@/types/dashboard"

export function GlobalInsights({ data }: { data: GlobalResponse }) {
  const kpis = data.kpis
  const segmentMix = data.segmentation.summary.map((item) => ({
    name: `Cluster ${item.cluster}`,
    value: item.monetary,
  }))

  const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#10b981", "#f59e0b"]

  return (
    <section className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Total Revenue" value={formatCompactCurrency(kpis.total_revenue)} detail="Combined revenue across global reference datasets." tone="positive" />
        <KpiCard label="Average Monthly Revenue" value={formatCompactCurrency(kpis.avg_monthly_revenue)} detail="Month-end normalized revenue baseline for trend comparison." />
        <KpiCard label="Average Order Value" value={formatCurrency(kpis.aov)} detail="Revenue per unique order across master transactions." />
        <KpiCard label="Loyal Customer Share" value={formatPercent(kpis.loyal_customer_percent)} detail="Customers with at least two orders in the modeled dataset." tone={kpis.loyal_customer_percent > 40 ? "positive" : "neutral"} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <ChartPanel title="Revenue Pulse" eyebrow="Global Baseline">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={kpis.monthly_revenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#dbe4f0" />
                <XAxis dataKey="month" tick={{ fill: "#475569", fontSize: 12 }} />
                <YAxis tickFormatter={(value) => formatCompactCurrency(Number(value))} tick={{ fill: "#475569", fontSize: 12 }} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[18, 18, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartPanel>

        <ChartPanel title="Segment Mix" eyebrow="Gaussian Mixture Output">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={segmentMix} dataKey="value" nameKey="name" outerRadius={108} innerRadius={54} label>
                  {segmentMix.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartPanel>
      </div>

      <ChartPanel title="Category Share" eyebrow="Where Revenue Concentrates">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {kpis.category_share.slice(0, 10).map((entry) => (
            <div key={entry.category} className="rounded-[1.35rem] bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-950">{entry.category}</p>
              <p className="mt-2 text-xl font-semibold text-slate-800">{formatCompactCurrency(entry.revenue)}</p>
              <p className="mt-1 text-sm text-slate-500">{formatPercent(entry.share_percent)}</p>
            </div>
          ))}
        </div>
      </ChartPanel>
    </section>
  )
}
