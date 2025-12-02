// src/components/dashboard/Watchlist.tsx
import React from "react";
import type { Quote } from "@/lib/api-types";
import { ArrowDownRight, ArrowUpRight, X } from "lucide-react";

type Market = "ghana" | "international";
type Row = Quote & { market?: Market };

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}
const pctColor = (n: number) => (n >= 0 ? "text-emerald-400" : "text-rose-400");
const safePct = (price: number, change: number) => {
  if (!price || price === change) return 0;
  const v = (change / (price - change)) * 100;
  return Number.isFinite(v) ? v : 0;
};
function pctBadge(n: number) {
  const Icon = n >= 0 ? ArrowUpRight : ArrowDownRight;
  const bg = n >= 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400";
  return (
    <span className={cx("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs whitespace-nowrap", bg)}>
      <Icon className="size-3" /> {n.toFixed(2)}%
    </span>
  );
}

export function Watchlist({
  data,
  onRemove,
}: {
  data: Row[];
  onRemove?: (symbol: string, market?: Market) => void;
}) {
  return (
    <div className="rounded-2xl border border-white/10 overflow-hidden">
      <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between bg-white/5">
        <div className="font-medium text-slate-100">Watchlist</div>
        <div className="text-xs px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-400">
          {data.length} item{data.length !== 1 ? "s" : ""}
        </div>
      </div>

      <div className="divide-y divide-white/5">
        {data.map((s) => {
          const pct = safePct(s.price, s.change);
          return (
            <div
              key={`${s.market ?? "x"}:${s.symbol}`}
              className="px-4 py-3 grid grid-cols-12 items-center gap-2 hover:bg-white/5"
            >
              {/* Symbol / name */}
              <div className="col-span-7 md:col-span-4 min-w-0">
                <div className="font-medium text-slate-100">{s.symbol}</div>
                <div className="text-xs text-slate-400 truncate">
                  {s.name} {s.market ? <span className="text-slate-500">• {s.market}</span> : null}
                </div>
              </div>

              {/* Price */}
              <div className="col-span-5 md:col-span-3 text-right md:text-left text-slate-200">
                {Number.isFinite(s.price) ? s.price.toFixed(2) : "—"}
              </div>

              {/* % change */}
              <div className={cx("col-span-12 md:col-span-3 font-medium md:text-left text-right", pctColor(pct))}>
                {pctBadge(pct)}
              </div>

              {/* Remove — full width on mobile, tight on md+ */}
              {onRemove && (
                <div className="col-span-12 md:col-span-2 md:text-right">
                  <button
                    onClick={() => onRemove(s.symbol, s.market)}
                    className="w-full md:w-auto inline-flex items-center justify-center gap-1 text-xs rounded-lg border border-white/10 px-2 py-1 text-slate-300 hover:bg-white/10 whitespace-nowrap"
                    aria-label={`Remove ${s.symbol} from watchlist`}
                  >
                    <X className="size-3" />
                    Remove
                  </button>
                </div>
              )}

              {/* Volume (second row, small) */}
              <div className="col-span-12 text-right text-slate-500 text-[11px]">
                Vol {Intl.NumberFormat().format(Number.isFinite(s.volume) ? s.volume : 0)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
