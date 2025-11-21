// ============================
// src/components/dashboard/SectorSplit.tsx (BACKEND: /api/portfolio/sectors)
// ============================
import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import type { SectorSlice } from '@/lib/api-types';
import { LayoutGrid } from 'lucide-react';

export function SectorSplit({ data }: { data: SectorSlice[] }) {  const COLORS = ["#22d3ee", "#a78bfa", "#f472b6", "#34d399", "#f59e0b"];
  return (
    <div className="rounded-2xl border border-white/10 overflow-hidden">
      <div className="px-4 py-3 border-b border-white/10 bg-white/5 flex items-center gap-2">
        <LayoutGrid className="size-4 text-cyan-300"/> <div className="font-medium text-slate-100">Sector Allocation</div>
      </div>
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={4}>
                {data.map((_, index) => (
                  <Cell key={`c-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "#0b1220", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-2">
          {data.map((s, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="text-slate-300">{s.name}</div>
              <div className="text-slate-100 font-medium">{s.value}%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}