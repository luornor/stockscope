import React from "react";
import type { Quote, Market } from "@/lib/api-types";


function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
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
          <span className="text-[10px] px-2 py-[2px] rounded-full border border-white/10 text-slate-400">
            mock
          </span>
        </div>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 p-3">
        {quotes.map((s) => {
          const pct = (s.change / (s.price - s.change)) * 100;
          return (
            <div
              key={s.symbol}
              className="rounded-xl border border-white/10 p-3 bg-white/5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-slate-200 font-medium">{s.symbol}</div>
                  <div className="text-xs text-slate-400">{s.name}</div>
                </div>
                <div className="text-slate-100 font-semibold">
                  {s.price.toFixed(2)}
                </div>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 items-center">
                <div className="text-xs text-slate-400">Change</div>
                <div className="text-right text-xs">{pct.toFixed(2)}%</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
