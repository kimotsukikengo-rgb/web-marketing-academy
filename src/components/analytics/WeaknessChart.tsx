"use client"

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from "recharts"

interface WeaknessChartProps {
  data: { category: string; avgAccuracy: number }[]
}

export function WeaknessChart({ data }: WeaknessChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center text-slate-400 text-sm">
        クイズを受験するとグラフが表示されます
      </div>
    )
  }

  const chartData = data.map((d) => ({
    subject: d.category,
    accuracy: d.avgAccuracy,
    fullMark: 100,
  }))

  return (
    <ResponsiveContainer width="100%" height={320}>
      <RadarChart data={chartData}>
        <PolarGrid stroke="#e2e8f0" />
        <PolarAngleAxis
          dataKey="subject"
          tick={{ fontSize: 12, fill: "#64748b" }}
        />
        <PolarRadiusAxis
          angle={30}
          domain={[0, 100]}
          tick={{ fontSize: 10, fill: "#94a3b8" }}
        />
        <Radar
          name="正答率"
          dataKey="accuracy"
          stroke="#3b82f6"
          fill="#3b82f6"
          fillOpacity={0.2}
          strokeWidth={2}
        />
      </RadarChart>
    </ResponsiveContainer>
  )
}
