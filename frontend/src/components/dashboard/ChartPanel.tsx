// ============================
// src/components/dashboard/ChartPanel.tsx (BACKEND: /api/quotes/intraday)
// ============================
import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { CandlestickChart as CandleIcon } from "lucide-react";

export function ChartPanel({
  symbol,
  data,
}: {
  symbol: string;
  data: { t: string; price: number }[];
}) {
  return (
    <div className="rounded-2xl border border-white/10 overflow-hidden">
      <div className="px-4 py-3 border-b border-white/10 bg-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CandleIcon className="size-4 text-cyan-300" />
          <div className="font-medium">{symbol} Intraday</div>
        </div>
        <div className="rounded-lg border border-cyan-400/30 bg-cyan-400/10 px-2 py-1 text-xs text-cyan-200">
          1D
        </div>
      </div>
      <div className="h-72 md:h-96 p-2 md:p-4">
        {data.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 8, right: 16, left: 0, bottom: 8 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.08)"
              />
              <XAxis dataKey="t" stroke="#94a3b8" tick={{ fontSize: 12 }} />
              <YAxis
                stroke="#94a3b8"
                tick={{ fontSize: 12 }}
                domain={["auto", "auto"]}
              />
              <Tooltip
                contentStyle={{
                  background: "#0b1220",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 12,
                }}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#22d3ee"
                strokeWidth={2.2}
                dot={data.length <= 2}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-500">
            No chart data available.
          </div>
        )}
      </div>
    </div>
  );
}
