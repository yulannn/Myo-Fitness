import { useMemo } from 'react';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ScaleIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';

interface DataPoint {
  date: string;
  value: number;
}

interface ProgressChartProps {
  data: DataPoint[];
  title: string;
  unit: string;
  color?: string;
  targetWeight?: number | null;
}

export default function ProgressChart({
  data,
  title,
  unit,
  color = '#94fbdd',
  targetWeight
}: ProgressChartProps) {
  const chartStats = useMemo(() => {
    if (!data || data.length === 0) {
      return { min: 0, max: 0, avg: 0, trend: 0, trendPercent: 0, current: 0 };
    }

    const values = data.map(d => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const current = values[values.length - 1];

    // Calculate trend (difference between first and last value)
    const first = values[0];
    const last = values[values.length - 1];
    const trend = last - first;
    const trendPercent = first !== 0 ? ((trend / first) * 100) : 0;

    return { min, max, avg, trend, trendPercent, current };
  }, [data]);

  // Include targetWeight in the normalization
  const normalizedData = useMemo(() => {
    if (!data || data.length === 0) return [];

    let { min, max } = chartStats;

    // Ajuster min/max si targetWeight est présent
    if (targetWeight) {
      min = Math.min(min, targetWeight);
      max = Math.max(max, targetWeight);
    }

    const range = max - min;

    // Si toutes les valeurs sont identiques
    if (range === 0) {
      return data.map(point => ({
        ...point,
        normalized: 50
      }));
    }

    return data.map(point => ({
      ...point,
      normalized: ((point.value - min) / range) * 100
    }));
  }, [data, chartStats, targetWeight]);

  // Normalize target weight for display
  const normalizedTarget = useMemo(() => {
    if (!targetWeight || !data || data.length === 0) return null;

    let { min, max } = chartStats;

    if (targetWeight) {
      min = Math.min(min, targetWeight);
      max = Math.max(max, targetWeight);
    }

    const range = max - min;
    if (range === 0) return 50;

    return ((targetWeight - min) / range) * 100;
  }, [targetWeight, data, chartStats]);

  // Calculate progress to target
  const targetProgress = useMemo(() => {
    if (!targetWeight || !chartStats.current) return null;

    const diff = targetWeight - chartStats.current;
    const remaining = Math.abs(diff);
    const isGaining = diff > 0;

    return { diff, remaining, isGaining };
  }, [targetWeight, chartStats.current]);

  // Formater les dates
  const formattedDates = useMemo(() => {
    if (!data || data.length === 0) return [];

    return data.map(point => {
      const date = new Date(point.date);
      return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    });
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <div className="bg-[#18181b] rounded-2xl p-4 sm:p-6 border border-white/5">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-[#94fbdd]/10 rounded-xl">
            <ChartBarIcon className="h-5 w-5 text-[#94fbdd]" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white">{title}</h3>
        </div>
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-500 text-sm">Aucune donnée disponible</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#18181b] rounded-2xl p-4 sm:p-6 border border-white/5 hover:border-[#94fbdd]/20 transition-all">
      {/* Header - Mobile First */}
      <div className="space-y-4 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 bg-[#94fbdd]/10 rounded-xl shrink-0">
              <ScaleIcon className="h-5 w-5 text-[#94fbdd]" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-medium text-gray-400">{title}</h3>
              <p className="text-2xl sm:text-3xl font-bold text-white truncate">
                {chartStats.current.toFixed(1)} <span className="text-lg text-gray-500">{unit}</span>
              </p>
            </div>
          </div>

          {/* Trend Badge */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg shrink-0 ${chartStats.trend >= 0
              ? 'bg-green-500/10 text-green-400'
              : 'bg-red-500/10 text-red-400'
            }`}>
            {chartStats.trend >= 0 ? (
              <ArrowTrendingUpIcon className="h-4 w-4" />
            ) : (
              <ArrowTrendingDownIcon className="h-4 w-4" />
            )}
            <span className="text-xs sm:text-sm font-bold">
              {chartStats.trend >= 0 ? '+' : ''}{chartStats.trendPercent.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Target Weight Indicator */}
        {targetWeight && targetProgress && (
          <div className="bg-[#252527] rounded-xl p-3 border border-[#94fbdd]/10">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 min-w-0">
                <TrophyIcon className="h-4 w-4 text-[#94fbdd] shrink-0" />
                <span className="text-xs text-gray-400">Objectif</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-white">
                  {targetWeight} {unit}
                </span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded ${targetProgress.isGaining ? 'bg-green-500/10 text-green-400' : 'bg-orange-500/10 text-orange-400'
                  }`}>
                  {targetProgress.isGaining ? '+' : ''}{targetProgress.diff.toFixed(1)} {unit}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chart with Y-axis ruler */}
      <div className="relative mb-6">
        {/* Y-Axis Labels (Ruler) */}
        <div className="absolute left-0 top-0 h-48 sm:h-56 flex flex-col justify-between text-right pr-2 z-10">
          {[0, 1, 2, 3, 4].map((i) => {
            const { min, max } = chartStats;
            let adjustedMin = min;
            let adjustedMax = max;

            if (targetWeight) {
              adjustedMin = Math.min(min, targetWeight);
              adjustedMax = Math.max(max, targetWeight);
            }

            const range = adjustedMax - adjustedMin;
            const value = adjustedMax - (range * i / 4);

            return (
              <div key={i} className="relative">
                <span className="text-[10px] sm:text-xs font-medium text-gray-400">
                  {value.toFixed(1)}
                </span>
              </div>
            );
          })}
        </div>

        {/* Chart Container with margin for Y-axis */}
        <div className="relative h-48 sm:h-56 ml-12 sm:ml-14">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            {/* Grid lines with ruler marks */}
            {[0, 25, 50, 75, 100].map((y) => (
              <g key={y}>
                <line
                  x1="0"
                  y1={y}
                  x2="100"
                  y2={y}
                  stroke="#94fbdd"
                  strokeOpacity="0.08"
                  strokeWidth="0.3"
                />
                {/* Ruler ticks on the left */}
                <line
                  x1="-1"
                  y1={y}
                  x2="0"
                  y2={y}
                  stroke="#94fbdd"
                  strokeOpacity="0.3"
                  strokeWidth="0.4"
                />
              </g>
            ))}

            {/* Y-Axis line (ruler) */}
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="100"
              stroke="#94fbdd"
              strokeOpacity="0.2"
              strokeWidth="0.4"
            />

            {/* Target Weight Line with better visibility */}
            {normalizedTarget !== null && (
              <>
                <line
                  x1="0"
                  y1={100 - normalizedTarget}
                  x2="100"
                  y2={100 - normalizedTarget}
                  stroke="#94fbdd"
                  strokeOpacity="0.5"
                  strokeWidth="0.4"
                  strokeDasharray="3,2"
                />
                <rect
                  x="85"
                  y={100 - normalizedTarget - 3}
                  width="14"
                  height="4"
                  fill="#94fbdd"
                  fillOpacity="0.1"
                  rx="0.5"
                />
                <text
                  x="92"
                  y={100 - normalizedTarget - 0.5}
                  fontSize="2"
                  fill="#94fbdd"
                  textAnchor="middle"
                  fontWeight="600"
                >
                  OBJECTIF
                </text>
              </>
            )}

            {/* Gradient */}
            <defs>
              <linearGradient id={`gradient-${title}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                <stop offset="100%" stopColor={color} stopOpacity="0.05" />
              </linearGradient>
            </defs>

            {/* Area */}
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

            {/* Line */}
            {normalizedData.length > 0 && (
              <path
                d={normalizedData.map((point, i) => {
                  const x = normalizedData.length === 1 ? 50 : (i / (normalizedData.length - 1)) * 100;
                  const y = 100 - point.normalized;
                  return `${i === 0 ? 'M' : 'L'} ${x},${y}`;
                }).join(' ')}
                fill="none"
                stroke={color}
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Points with values on hover */}
            {normalizedData.map((point, i) => {
              const x = normalizedData.length === 1 ? 50 : (i / (normalizedData.length - 1)) * 100;
              const y = 100 - point.normalized;
              const isLast = i === normalizedData.length - 1;
              const isFirst = i === 0;

              return (
                <g key={i}>
                  {/* Outer glow */}
                  <circle
                    cx={x}
                    cy={y}
                    r={isLast ? "2.5" : "1.5"}
                    fill={color}
                    fillOpacity="0.3"
                  />
                  {/* Main point */}
                  <circle
                    cx={x}
                    cy={y}
                    r={isLast ? "1.8" : "1.2"}
                    fill={color}
                  />
                  {/* Inner highlight */}
                  <circle
                    cx={x}
                    cy={y}
                    r={isLast ? "0.8" : "0.5"}
                    fill="white"
                  />

                  {/* Value label for first and last point */}
                  {(isFirst || isLast) && (
                    <>
                      <rect
                        x={x - 5}
                        y={y - 7}
                        width="10"
                        height="4"
                        fill="#121214"
                        fillOpacity="0.9"
                        rx="0.5"
                      />
                      <text
                        x={x}
                        y={y - 4.5}
                        fontSize="2.5"
                        fill={isLast ? color : "#94fbdd"}
                        textAnchor="middle"
                        fontWeight="700"
                      >
                        {point.value.toFixed(1)}
                      </text>
                    </>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* X-Axis Dates - Mobile optimized */}
        {formattedDates.length > 0 && (
          <div className="flex justify-between text-[10px] sm:text-xs text-gray-500 mt-2 ml-12 sm:ml-14">
            <span>{formattedDates[0]}</span>
            {formattedDates.length > 2 && (
              <span className="hidden sm:inline">
                {formattedDates[Math.floor(formattedDates.length / 2)]}
              </span>
            )}
            <span>{formattedDates[formattedDates.length - 1]}</span>
          </div>
        )}
      </div>

      {/* Stats Grid - Mobile first */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {/* Min */}
        <div className="bg-[#252527] rounded-xl p-3 text-center border border-white/5">
          <p className="text-[10px] sm:text-xs text-gray-500 mb-1 uppercase tracking-wide">Min</p>
          <p className="text-sm sm:text-base font-bold text-white">
            {chartStats.min.toFixed(1)}
          </p>
          <p className="text-[10px] text-gray-600">{unit}</p>
        </div>

        {/* Average */}
        <div className="bg-[#252527] rounded-xl p-3 text-center border border-[#94fbdd]/20">
          <p className="text-[10px] sm:text-xs text-gray-500 mb-1 uppercase tracking-wide">Moy</p>
          <p className="text-sm sm:text-base font-bold text-[#94fbdd]">
            {chartStats.avg.toFixed(1)}
          </p>
          <p className="text-[10px] text-gray-600">{unit}</p>
        </div>

        {/* Max */}
        <div className="bg-[#252527] rounded-xl p-3 text-center border border-white/5">
          <p className="text-[10px] sm:text-xs text-gray-500 mb-1 uppercase tracking-wide">Max</p>
          <p className="text-sm sm:text-base font-bold text-white">
            {chartStats.max.toFixed(1)}
          </p>
          <p className="text-[10px] text-gray-600">{unit}</p>
        </div>
      </div>
    </div>
  );
}
