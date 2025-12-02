import React from "react";
import type { Quote, Market } from "@/lib/api-types";

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function pct(nPrice: number, nChange: number) {
  // change% = change / (price - change) * 100 ; guard against /0
  if (!isFinite(nPrice) || !isFinite(nChange) || nPrice === 0 || nPrice === nChange) return 0;
  const v = (nChange / (nPrice - nChange)) * 100;
  return isFinite(v) ? v : 0;
}

export function PricePanel({
  market,
  quotes,
}: {
  market: Market;
  quotes: Quote[];
}) {
  const label = market === "international" ? "International" : "Ghana";
  const accent =
    market === "international" ? "from-cyan-500/20" : "from-fuchsia-500/20";

  if (!quotes?.length) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-400">
        No quotes available.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 overflow-hidden">
      <div
        className={cx(
          "px-4 py-3 border-b border-white/10 bg-gradient-to-r to-transparent",
          accent
        )}
      >
        <div className="flex items-center gap-2">
          <div className="font-medium text-slate-100">{label} Prices</div>
          {market === "ghana" && (
            <span className="text-[10px] px-2 py-0.5 rounded-full border border-white/10 bg-white/5 text-slate-400">
              live
            </span>
          )}
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-3">
        {quotes.map((s) => {
          const p = Number(s.price ?? 0);
          const ch = Number(s.change ?? 0);
          const pctVal = pct(p, ch);
          const pos = pctVal >= 0;

          return (
            <div
              key={s.symbol}
              className="rounded-xl border border-white/10 p-3 bg-white/5"
            >
              {/* Top row: symbol/name on left, price on right */}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-slate-200 font-medium leading-tight">
                    {s.symbol}
                  </div>
                  <div className="text-xs text-slate-400 truncate">
                    {s.name}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-slate-100 font-semibold text-base">
                    {isFinite(p) ? p.toFixed(2) : "—"}
                  </div>
                </div>
              </div>

              {/* Bottom row: change badge */}
              <div className="mt-3 flex items-center justify-between text-xs">
                <div className="text-slate-400">Change</div>
                {market === "ghana" && ch === 0 ? (
                  <span className="text-slate-500">—</span>
                ) : (
                  <span
                    className={cx(
                      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full",
                      pos
                        ? "bg-emerald-500/10 text-emerald-300"
                        : "bg-rose-500/10 text-rose-300"
                    )}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="w-3 h-3"
                      fill="currentColor"
                    >
                      {pos ? (
                        <path d="M12 5l6 6h-4v8h-4v-8H6z" />
                      ) : (
                        <path d="M12 19l-6-6h4V5h4v8h4z" />
                      )}
                    </svg>
                    {pctVal.toFixed(2)}%
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
