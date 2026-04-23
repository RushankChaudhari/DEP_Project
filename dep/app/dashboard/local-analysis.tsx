import { Area, AreaChart, Pie, PieChart, Cell, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts"

import { ChartPanel } from "@/components/chart-panel"
import { KpiCard } from "@/components/kpi-card"
import { UploadBox } from "@/components/upload-box"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { formatCompactCurrency, formatCurrency, formatPercent } from "@/lib/formatters"
import type { LocalResponse } from "@/types/dashboard"

type LocalAnalysisProps = {
  data: LocalResponse | null
  onUpload: (file: File) => Promise<LocalResponse | undefined>
}

const PIE_COLORS = ["#0ea5e9", "#f59e0b", "#ec4899", "#8b5cf6", "#10b981", "#14b8a6", "#f43f5e"]

export function LocalAnalysis({ data, onUpload }: LocalAnalysisProps) {
  return (
    <section className="space-y-6">
      <UploadBox onUpload={onUpload} />

      {!data ? (
        <Alert className="rounded-[1.5rem] border-amber-200 bg-amber-50 text-amber-900">
          <AlertTitle>No local dataset yet</AlertTitle>
          <AlertDescription>
            Upload your store CSV to unlock local KPIs, segmentation, and comparison against the global baseline.
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <KpiCard label="Local Revenue" value={formatCompactCurrency(data.kpis.total_revenue)} detail={`Mapped ${data.meta.records} local records into the analytics schema.`} tone="positive" />
            <KpiCard label="Local Monthly Run Rate" value={formatCompactCurrency(data.kpis.avg_monthly_revenue)} detail="Month-end revenue output for the uploaded store data." />
            <KpiCard label="Local AOV" value={formatCurrency(data.kpis.aov)} detail="Average order value based on the uploaded data." />
            <KpiCard label="Discount Uplift" value={formatPercent(data.kpis.discount_uplift_percent)} detail="Difference between discounted and non-discounted revenue patterns." tone={data.kpis.discount_uplift_percent >= 0 ? "positive" : "negative"} />
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <ChartPanel title="Category Share" eyebrow="Distribution">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.kpis.category_share}
                      dataKey="revenue"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                    >
                      {data.kpis.category_share.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </ChartPanel>

            <ChartPanel title="Revenue Trend" eyebrow="Monthly Timeline">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.kpis.monthly_revenue}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 12 }} tickLine={false} axisLine={false} />
                    <YAxis tickFormatter={(val) => formatCompactCurrency(Number(val))} tick={{ fill: "#64748b", fontSize: 12 }} tickLine={false} axisLine={false} />
                    <Tooltip formatter={(val) => formatCurrency(Number(val))} labelStyle={{ color: "#0f172a" }} />
                    <Area type="monotone" dataKey="revenue" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </ChartPanel>
          </div>
        </>
      )}
    </section>
  )
}
