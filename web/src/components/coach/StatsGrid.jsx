// ─────────────────────────────────────────────────────────────
// StatsGrid – KPI cards for the coach dashboard
// ─────────────────────────────────────────────────────────────

import React from 'react';

export default function StatsGrid({ stats = [] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
      {stats.map((s) => (
        <div
          key={s.label}
          className={`relative overflow-hidden rounded-xl border border-border-subtle p-5 bg-gradient-to-br ${s.color} backdrop-blur-lg group hover:border-primary/20 transition-all duration-300`}
        >
          <s.icon className="w-8 h-8 text-white/20 absolute top-4 right-4 group-hover:text-white/30 transition-colors" />
          <p className="text-text-secondary text-xs uppercase tracking-wider font-semibold mb-1">
            {s.label}
          </p>
          <p className="text-2xl font-bold text-white">{s.value}</p>
          {s.subtitle && (
            <p className="text-xs text-text-secondary mt-1">{s.subtitle}</p>
          )}
        </div>
      ))}
    </div>
  );
}

// Skeleton loader
export function StatsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-24 rounded-xl bg-surface border border-border-subtle animate-pulse" />
      ))}
    </div>
  );
}
