"use client"

import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"
import type { TagAccuracy } from "@/types"

interface TopicAccuracyBarProps {
  data: TagAccuracy[]
}

export function TopicAccuracyBar({ data }: TopicAccuracyBarProps) {
  if (data.length === 0) {
    return (
      <div className="py-8 text-center text-slate-400 text-sm">
        クイズを受験するとデータが表示されます
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {data.map((tag) => {
        const barColor =
          tag.accuracy >= 70
            ? "bg-green-500"
            : tag.accuracy >= 40
              ? "bg-amber-500"
              : "bg-red-500"

        return (
          <div key={tag.tagId} className="group">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-700">
                  {tag.tagName}
                </span>
                <span className="text-xs text-slate-400">
                  ({tag.totalQuestions}問)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <TrendIcon trend={tag.trend} />
                <span
                  className={cn(
                    "text-sm font-semibold",
                    tag.accuracy >= 70
                      ? "text-green-600"
                      : tag.accuracy >= 40
                        ? "text-amber-600"
                        : "text-red-600"
                  )}
                >
                  {tag.accuracy}%
                </span>
              </div>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5">
              <div
                className={cn("h-2.5 rounded-full transition-all", barColor)}
                style={{ width: `${tag.accuracy}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

function TrendIcon({ trend }: { trend: "improving" | "declining" | "stable" }) {
  switch (trend) {
    case "improving":
      return <TrendingUp className="w-3.5 h-3.5 text-green-500" />
    case "declining":
      return <TrendingDown className="w-3.5 h-3.5 text-red-500" />
    default:
      return <Minus className="w-3.5 h-3.5 text-slate-400" />
  }
}
