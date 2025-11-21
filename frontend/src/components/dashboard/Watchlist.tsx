import React from 'react';
import type { Quote } from '@/lib/api-types';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

function pctBadge(n: number) {
  const Icon = n >= 0 ? ArrowUpRight : ArrowDownRight;
  const bg = n >= 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400";
  return (
    <span className={cx("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs", bg)}>
      <Icon className="size-3" /> {n.toFixed(2)}%
    </span>
  );
}

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function pctColor(n: number) {
  return n >= 0 ? "text-emerald-400" : "text-rose-400";
}

export function Watchlist({ data }: { data: Quote[] }) {
    return (
    <div className="rounded-2xl border border-white/10 overflow-hidden">
      <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between bg-white/5">
        <div className="font-medium text-slate-100">Watchlist</div>
        <button className="text-xs px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10">Manage</button>
      </div>
      <div className="divide-y divide-white/5">
        {data.map((s) => (
          <div key={s.symbol} className="px-4 py-3 grid grid-cols-12 items-center gap-2 hover:bg-white/5">
            <div className="col-span-4 md:col-span-3">
              <div className="font-medium text-slate-100">{s.symbol}</div>
              <div className="text-xs text-slate-400">{s.name}</div>
            </div>
            <div className="col-span-4 md:col-span-3 text-slate-200">{s.price.toFixed(2)}</div>
            <div className={cx("col-span-4 md:col-span-3 font-medium", pctColor((s.change / s.price) * 100))}>
              {pctBadge((s.change / (s.price - s.change)) * 100)}
            </div>
            <div className="hidden md:block md:col-span-3 text-right text-slate-400 text-xs">Vol {Intl.NumberFormat().format(s.volume)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}