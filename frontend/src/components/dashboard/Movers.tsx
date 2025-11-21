// ============================
// src/components/dashboard/Movers.tsx (BACKEND: /api/movers)
// ============================
import React, { useMemo } from 'react';
import { ArrowDownRight, ArrowUpRight, TrendingUp } from 'lucide-react';
import { SmallSpark } from './SmallSpark';
import type { Quote } from '@/lib/api-types';

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function Movers({ data, spark = [] }: { data: Quote[]; spark?: { t: string; a: number }[] }) {  const sorted = useMemo(() => [...data].sort((a, b) => Math.abs((b.change / b.price)) - Math.abs((a.change / a.price))), [data]);
  return (
    <div className="rounded-2xl border border-white/10 overflow-hidden">
      <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2 bg-white/5">
        <TrendingUp className="size-4 text-emerald-400"/>
        <div className="font-medium text-slate-100">Top Movers</div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3">
        {sorted.slice(0, 4).map((s) => {
          const pct = (s.change / (s.price - s.change)) * 100;
          const up = pct >= 0;
          const Icon = up ? ArrowUpRight : ArrowDownRight;
          return (
            <div key={s.symbol} className="rounded-xl border border-white/10 p-3 bg-white/5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-slate-200 font-medium">{s.symbol}</div>
                  <div className="text-xs text-slate-400">{s.name}</div>
                </div>
                <div className={cx("inline-flex items-center gap-1 text-sm font-semibold", up ? "text-emerald-400" : "text-rose-400")}> <Icon className="size-4"/> {pct.toFixed(2)}%</div>
              </div>
              <div className="mt-2 h-14">
                <SmallSpark dataKey={'a'} data={spark} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}