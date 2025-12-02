// ============================
// src/components/dashboard/NewsList.tsx (BACKEND: /api/news)
// ============================
import React from 'react';
import type { NewsItem } from '@/lib/api-types';
import { Newspaper } from 'lucide-react';

export function NewsList({ items }: { items: NewsItem[] }) {
  if (!items?.length) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-400">
        No recent headlines for this market.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 overflow-hidden">
      <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2 bg-white/5">
        <Newspaper className="size-4 text-fuchsia-300"/> <div className="font-medium text-slate-100">Latest News</div>
      </div>
      <div className="divide-y divide-white/5">
        {items.map((n) => (
          <a key={n.id} className="block px-4 py-3 hover:bg-white/5 group cursor-pointer">
            <div className="text-slate-200 group-hover:text-white">{n.title}</div>
            <div className="text-xs text-slate-500 mt-1">{n.source} • {n.time} ago</div>
          </a>
        ))}
      </div>
    </div>
  );
}