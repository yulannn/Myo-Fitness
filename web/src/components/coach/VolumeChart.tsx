// ─────────────────────────────────────────────────────────────
// VolumeChart – Training volume evolution using Recharts
// ─────────────────────────────────────────────────────────────

import React, { useMemo, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const RANGES = [
  { key: '7d', label: '7 jours', days: 7 },
  { key: '30d', label: '30 jours', days: 30 },
  { key: '90d', label: '3 mois', days: 90 },
];

export default function VolumeChart({ sessions = [] }) {
  const [range, setRange] = useState('30d');

  const data = useMemo(() => {
    const selectedRange = RANGES.find((r) => r.key === range);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - selectedRange.days);

    const filtered = sessions
      .filter((s) => s.completed && s.performedAt && new Date(s.performedAt) >= cutoff && s.summary)
      .sort((a, b) => new Date(a.performedAt).getTime() - new Date(b.performedAt).getTime());

    return filtered.map((s) => ({
      date: new Date(s.performedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
      volume: Math.round(s.summary.totalVolume || 0),
      duration: s.summary.duration || s.duration || 0,
      name: s.sessionName || 'Séance',
    }));
  }, [sessions, range]);

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div className="bg-surface border border-border-subtle rounded-xl px-4 py-3 shadow-xl">
        <p className="text-xs font-bold text-white mb-1">{d.name}</p>
        <p className="text-[11px] text-text-secondary">{d.date}</p>
        <div className="mt-2 space-y-1">
          <p className="text-xs text-primary font-bold">{d.volume.toLocaleString()} kg</p>
          {d.duration > 0 && (
            <p className="text-[11px] text-text-secondary">{d.duration} min</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-surface border border-border-subtle rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          Volume d'entraînement
        </h3>
        <div className="flex gap-1 bg-background rounded-lg p-1">
          {RANGES.map((r) => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              className={`px-3 py-1.5 text-[10px] font-bold rounded-md transition-all ${range === r.key
                  ? 'bg-primary/15 text-primary border border-primary/20'
                  : 'text-text-secondary hover:text-white'
                }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {data.length === 0 ? (
        <div className="h-48 flex items-center justify-center">
          <p className="text-text-secondary text-sm">Aucune donnée sur cette période</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -10 }}>
            <defs>
              <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#94fbdd" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#94fbdd" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9CA3AF', fontSize: 10 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9CA3AF', fontSize: 10 }}
              tickFormatter={(v) => `${(v / 1000).toFixed(v >= 1000 ? 1 : 0)}${v >= 1000 ? 'k' : ''}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="volume"
              stroke="#94fbdd"
              strokeWidth={2}
              fill="url(#volumeGradient)"
              dot={{ fill: '#94fbdd', strokeWidth: 0, r: 3 }}
              activeDot={{ r: 5, fill: '#94fbdd', stroke: '#121214', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
