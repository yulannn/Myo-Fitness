import { useMemo } from 'react';
import { ChartBarIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/outline';

interface DataPoint {
  date: string;
  value: number;
}

interface ProgressChartProps {
  data: DataPoint[];
  title: string;
  unit: string;
  color?: string;
}

export default function ProgressChart({ data, title, unit, color = '#94fbdd' }: ProgressChartProps) {
  const chartStats = useMemo(() => {
    if (!data || data.length === 0) {
      return { min: 0, max: 0, avg: 0, trend: 0, trendPercent: 0 };
    }

    const values = data.map(d => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;

    // Calculate trend (difference between first and last value)
    const first = values[0];
    const last = values[values.length - 1];
    const trend = last - first;
    const trendPercent = first !== 0 ? ((trend / first) * 100) : 0;

    return { min, max, avg, trend, trendPercent };
  }, [data]);

  const normalizedData = useMemo(() => {
    if (!data || data.length === 0) return [];

    const { min, max } = chartStats;
    const range = max - min || 1;

    return data.map(point => ({
      ...point,
      normalized: ((point.value - min) / range) * 100
    }));
  }, [data, chartStats]);

  if (!data || data.length === 0) {
    return (
      <div className="bg-[#252527] rounded-2xl p-6 border border-[#94fbdd]/10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-[#94fbdd]/10 rounded-xl">
            <ChartBarIcon className="h-5 w-5 text-[#94fbdd]" />
          </div>
          <h3 className="text-lg font-bold text-white">{title}</h3>
        </div>
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-500 text-sm">Aucune donnée disponible</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#252527] rounded-2xl p-6 border border-[#94fbdd]/10 hover:border-[#94fbdd]/30 transition-all group">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#94fbdd]/10 rounded-xl group-hover:bg-[#94fbdd]/20 transition-colors">
            <ChartBarIcon className="h-5 w-5 text-[#94fbdd]" />
          </div>
          <h3 className="text-lg font-bold text-white">{title}</h3>
        </div>

        {/* Trend Indicator */}
        <div className={`flex items-center gap-2 px-3 py-1 rounded-lg ${chartStats.trend >= 0
          ? 'bg-green-500/10 text-green-400'
          : 'bg-red-500/10 text-red-400'
          }`}>
          {chartStats.trend >= 0 ? (
            <ArrowTrendingUpIcon className="h-4 w-4" />
          ) : (
            <ArrowTrendingDownIcon className="h-4 w-4" />
          )}
          <span className="text-sm font-bold">
            {chartStats.trend >= 0 ? '+' : ''}{chartStats.trendPercent.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="relative h-48 mb-6">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((y) => (
            <line
              key={y}
              x1="0"
              y1={y}
              x2="100"
              y2={y}
              stroke="#94fbdd"
              strokeOpacity="0.05"
              strokeWidth="0.2"
            />
          ))}

          {/* Area gradient */}
          <defs>
            <linearGradient id={`gradient-${title}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="0.3" />
              <stop offset="100%" stopColor={color} stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* Area path */}
          {normalizedData.length > 0 && (
            <path
              d={`
                M 0,100
                ${normalizedData.map((point, i) => {
                const x = (i / (normalizedData.length - 1)) * 100;
                const y = 100 - point.normalized;
                return `L ${x},${y}`;
              }).join(' ')}
                L 100,100
                Z
              `}
              fill={`url(#gradient-${title})`}
            />
          )}

          {/* Line path */}
          {normalizedData.length > 0 && (
            <path
              d={normalizedData.map((point, i) => {
                const x = (i / (normalizedData.length - 1)) * 100;
                const y = 100 - point.normalized;
                return `${i === 0 ? 'M' : 'L'} ${x},${y}`;
              }).join(' ')}
              fill="none"
              stroke={color}
              strokeWidth="0.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="drop-shadow-lg"
            />
          )}

          {/* Data points */}
          {normalizedData.map((point, i) => {
            const x = (i / (normalizedData.length - 1)) * 100;
            const y = 100 - point.normalized;
            return (
              <g key={i}>
                <circle
                  cx={x}
                  cy={y}
                  r="1"
                  fill={color}
                  className="drop-shadow-md"
                />
                <circle
                  cx={x}
                  cy={y}
                  r="0.5"
                  fill="white"
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#94fbdd]/10">
        <div>
          <p className="text-xs text-gray-500 mb-1">Min</p>
          <p className="text-base font-bold text-white">
            {chartStats.min.toFixed(1)} {unit}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Moyenne</p>
          <p className="text-base font-bold text-white">
            {chartStats.avg.toFixed(1)} {unit}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Max</p>
          <p className="text-base font-bold text-[#94fbdd]">
            {chartStats.max.toFixed(1)} {unit}
          </p>
        </div>
      </div>
    </div>
  );
}
