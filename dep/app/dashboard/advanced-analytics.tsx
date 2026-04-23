import { CartesianGrid, Line, LineChart, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis } from "recharts"

import { ChartPanel } from "@/components/chart-panel"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatCompactCurrency, formatCurrency, formatPercent } from "@/lib/formatters"
import type { AdvancedResponse } from "@/types/dashboard"

export function AdvancedAnalytics({ data }: { data: AdvancedResponse }) {
  const anomalyData = data.anomalies.slice(0, 160)
  const segmentScatter = data.segmentation.segments.slice(0, 220)
  const trendData = [
    ...data.forecast.history.map((item) => ({ month: item.month, revenue: item.revenue, type: "History" })),
    ...data.forecast.forecast.map((item) => ({ month: item.month, revenue: item.predicted_revenue, type: "Forecast" })),
  ]

  return (
    <section className="grid gap-6 xl:grid-cols-2">
      <ChartPanel title="Segment Landscape" eyebrow="GMM Clusters">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#dbe4f0" />
              <XAxis dataKey="recency" tick={{ fill: "#475569", fontSize: 12 }} />
              <YAxis dataKey="monetary" tickFormatter={(value) => formatCompactCurrency(Number(value))} tick={{ fill: "#475569", fontSize: 12 }} />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Scatter data={segmentScatter} fill="#8b5cf6" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </ChartPanel>

      <ChartPanel title="Revenue Forecast" eyebrow={`Trend: ${data.forecast.trend}`}>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#dbe4f0" />
              <XAxis dataKey="month" tick={{ fill: "#475569", fontSize: 12 }} />
              <YAxis tickFormatter={(value) => formatCompactCurrency(Number(value))} tick={{ fill: "#475569", fontSize: 12 }} />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Line dataKey="revenue" stroke="#10b981" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ChartPanel>

      <ChartPanel title="Basket Rules" eyebrow="Association Mining">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Antecedents</TableHead>
              <TableHead>Consequents</TableHead>
              <TableHead>Support</TableHead>
              <TableHead>Confidence</TableHead>
              <TableHead>Lift</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.basket_rules.slice(0, 8).map((rule, index) => (
              <TableRow key={`${rule.antecedents.join("-")}-${index}`}>
                <TableCell>{rule.antecedents.join(", ")}</TableCell>
                <TableCell>{rule.consequents.join(", ")}</TableCell>
                <TableCell>{formatPercent(rule.support * 100)}</TableCell>
                <TableCell>{formatPercent(rule.confidence * 100)}</TableCell>
                <TableCell>{rule.lift.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ChartPanel>

      <ChartPanel title="Anomaly Monitor" eyebrow={`Model R² ${data.discount_model.r2.toFixed(2)}`}>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#dbe4f0" />
              <XAxis dataKey="discount_percent" tick={{ fill: "#475569", fontSize: 12 }} />
              <YAxis dataKey="revenue" tickFormatter={(value) => formatCompactCurrency(Number(value))} tick={{ fill: "#475569", fontSize: 12 }} />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Scatter data={anomalyData.filter((item) => !item.is_anomaly)} fill="#94a3b8" />
              <Scatter data={anomalyData.filter((item) => item.is_anomaly)} fill="#be123c" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </ChartPanel>
    </section>
  )
}
