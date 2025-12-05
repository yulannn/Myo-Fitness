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
    const range = max - min;

    // Si toutes les valeurs sont identiques (range = 0), les placer au milieu du graphique
    if (range === 0) {
      return data.map(point => ({
        ...point,
        normalized: 50 // Milieu du graphique
      }));
    }

    return data.map(point => ({
      ...point,
      normalized: ((point.value - min) / range) * 100
    }));
  }, [data, chartStats]);

  // Formater les dates pour l'affichage
  const formattedDates = useMemo(() => {
    if (!data || data.length === 0) return [];

    return data.map(point => {
      const date = new Date(point.date);
      return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
    });
  }, [data]);

  // Calculer les valeurs pour l'axe Y
  const yAxisLabels = useMemo(() => {
    if (!data || data.length === 0) return [];

    const { min, max } = chartStats;
    const range = max - min;

    // Si la différence est très petite, ajuster l'échelle
    if (range < 1) {
      return [
        { value: max.toFixed(1), position: 0 },   // Max en haut
        { value: ((min + max) / 2).toFixed(1), position: 50 },
        { value: min.toFixed(1), position: 100 }, // Min en bas
      ];
    }

    return [
      { value: max.toFixed(1), position: 0 },   // Max en haut
      { value: ((min + max) / 2).toFixed(1), position: 50 },
      { value: min.toFixed(1), position: 100 }, // Min en bas
    ];
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
    <div className="bg-[#252527] rounded-2xl py-6 px-4  border border-[#94fbdd]/10 hover:border-[#94fbdd]/30 transition-all group">
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

      {/* Chart Container with Labels */}
      <div className="relative">
        {/* Y-Axis Label (Ordonnée) - Vertical */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 -rotate-90 origin-center">
          <p className="text-xs font-medium text-gray-400 whitespace-nowrap">
            Poids ({unit})
          </p>
        </div>

        {/* Y-Axis Values */}
        <div className="absolute left-12 top-0 h-48 flex flex-col justify-between text-right pr-2">
          {yAxisLabels.map((label, index) => (
            <div key={index} className="text-[10px] text-gray-400 font-medium">
              {label.value}
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="relative h-48 mb-2 ml-20">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            {/* Grid lines with values */}
            {[0, 25, 50, 75, 100].map((y) => (
              <line
                key={y}
                x1="0"
                y1={y}
                x2="100"
                y2={y}
                stroke="#94fbdd"
                strokeOpacity="0.1"
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
                  const x = normalizedData.length === 1 ? 50 : (i / (normalizedData.length - 1)) * 100;
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
                  const x = normalizedData.length === 1 ? 50 : (i / (normalizedData.length - 1)) * 100;
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
              const x = normalizedData.length === 1 ? 50 : (i / (normalizedData.length - 1)) * 100;
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

        {/* X-Axis Dates Labels */}
        {formattedDates.length > 0 && (
          <div className="flex justify-between px-20 mb-2">
            <span className="text-[10px] text-gray-500">{formattedDates[0]}</span>
            {formattedDates.length > 2 && (
              <span className="text-[10px] text-gray-500">
                {formattedDates[Math.floor(formattedDates.length / 2)]}
              </span>
            )}
            <span className="text-[10px] text-gray-500">
              {formattedDates[formattedDates.length - 1]}
            </span>
          </div>
        )}

        {/* X-Axis Label (Abscisse) */}
        <div className="text-center">
          <p className="text-xs font-medium text-gray-400">Date</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#94fbdd]/10 mt-4">
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
