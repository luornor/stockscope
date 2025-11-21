// ============================
// src/components/dashboard/StatCard.tsx
// ============================
import React from 'react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';


function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function pctBadge(n: number) {
  const Icon = n >= 0 ? ArrowUpRight : ArrowDownRight;
  const bg = n >= 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400";
  return (
    <span className={cx("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs", bg)}>
      <Icon className="size-3" /> {n.toFixed(2)}%
    </span>
  );
}

export function StatCard({ title, value, delta, subtle }: { title: string; value: string; delta?: number; subtle?: boolean }) {
  return (
    <div className={cx(
      "rounded-2xl border p-4 md:p-5",
      subtle ? "border-white/10 bg-white/5" : "border-white/10 bg-gradient-to-br from-white/5 to-white/0"
    )}>
      <div className="text-xs text-slate-400">{title}</div>
      <div className="mt-2 flex items-end gap-2">
        <div className="text-2xl md:text-3xl font-semibold text-slate-100">{value}</div>
        {typeof delta === "number" && pctBadge(delta)}
      </div>
    </div>
  );
}