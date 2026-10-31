/**
 * Jal-Nikaas: Interactive Dual-Stream Water Level SVG Chart
 * Renders Farm-side level vs Downstream canal level with differential area and thresholds
 */

import React, { useState } from 'react';
import { TelemetryPoint } from '../../types';

interface WaterLevelChartProps {
  data?: TelemetryPoint[];
  history?: TelemetryPoint[];
  criticalThreshold?: number;
  submergenceCriticalCm?: number;
  warningThreshold?: number;
  submergenceWarningCm?: number;
  locationName?: string;
  height?: number;
  showDifferential?: boolean;
  unit?: string;
}

export const WaterLevelChart: React.FC<WaterLevelChartProps> = ({
  data: dataProp,
  history,
  criticalThreshold: critThreshProp,
  submergenceCriticalCm,
  warningThreshold: warnThreshProp,
  submergenceWarningCm,
  locationName,
  height = 240,
  showDifferential = true,
  unit = 'cm',
}) => {
  const data = history || dataProp || [];
  const criticalThreshold = submergenceCriticalCm ?? critThreshProp ?? 75;
  const warningThreshold = submergenceWarningCm ?? warnThreshProp ?? 50;
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-slate-500">
        No telemetry records available
      </div>
    );
  }

  const padding = { top: 24, right: 30, bottom: 32, left: 45 };
  const width = 640; // SVG viewBox coordinates
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  // Determine min and max Y
  const allLevels = data.flatMap((d) => [d.farmLevel, d.downstreamLevel]);
  if (criticalThreshold) allLevels.push(criticalThreshold);
  const minY = Math.max(0, Math.floor(Math.min(...allLevels) - 10));
  const maxY = Math.ceil(Math.max(...allLevels) + 15);
  const rangeY = maxY - minY || 1;

  const getX = (index: number) => padding.left + (index / (data.length - 1)) * innerWidth;
  const getY = (val: number) => padding.top + innerHeight - ((val - minY) / rangeY) * innerHeight;

  // Generate paths
  const farmPoints = data.map((d, i) => `${getX(i)},${getY(d.farmLevel)}`);
  const downstreamPoints = data.map((d, i) => `${getX(i)},${getY(d.downstreamLevel)}`);

  const farmPath = `M ${farmPoints.join(' L ')}`;
  const downstreamPath = `M ${downstreamPoints.join(' L ')}`;

  // Area under farm
  const farmAreaPath = `M ${getX(0)},${getY(minY)} L ${farmPoints.join(' L ')} L ${getX(
    data.length - 1
  )},${getY(minY)} Z`;

  const hoveredPoint = hoverIndex !== null ? data[hoverIndex] : null;

  return (
    <div className="relative w-full overflow-hidden">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto select-none"
        style={{ minHeight: height }}
      >
        <defs>
          <linearGradient id="farmAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#059669" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#059669" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id="downstreamAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0284c7" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Horizontal gridlines */}
        {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
          const val = Math.round(minY + pct * rangeY);
          const y = getY(val);
          return (
            <g key={idx}>
              <line
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="#e2e8f0"
                strokeDasharray="3 3"
              />
              <text
                x={padding.left - 8}
                y={y + 4}
                textAnchor="end"
                className="fill-slate-600 text-[10px] font-mono"
              >
                {val}
              </text>
            </g>
          );
        })}

        {/* Critical Threshold Line */}
        {criticalThreshold >= minY && criticalThreshold <= maxY && (
          <g>
            <line
              x1={padding.left}
              y1={getY(criticalThreshold)}
              x2={width - padding.right}
              y2={getY(criticalThreshold)}
              stroke="#ef4444"
              strokeWidth="1.5"
              strokeDasharray="4 2"
            />
            <text
              x={width - padding.right}
              y={getY(criticalThreshold) - 4}
              textAnchor="end"
              className="fill-red-700 text-[10px] font-semibold"
            >
              Critical Threshold ({criticalThreshold} {unit})
            </text>
          </g>
        )}

        {/* Warning Threshold Line */}
        {warningThreshold >= minY && warningThreshold <= maxY && (
          <g>
            <line
              x1={padding.left}
              y1={getY(warningThreshold)}
              x2={width - padding.right}
              y2={getY(warningThreshold)}
              stroke="#f59e0b"
              strokeWidth="1.2"
              strokeDasharray="3 3"
            />
            <text
              x={width - padding.right}
              y={getY(warningThreshold) - 4}
              textAnchor="end"
              className="fill-amber-700 text-[10px] font-medium"
            >
              Caution ({warningThreshold} {unit})
            </text>
          </g>
        )}

        {/* Gradient areas */}
        <path d={farmAreaPath} fill="url(#farmAreaGrad)" />

        {/* Lines */}
        <path
          d={downstreamPath}
          fill="none"
          stroke="#0284c7"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d={farmPath}
          fill="none"
          stroke="#059669"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Time X-axis labels */}
        {data.filter((_, i) => i % Math.ceil(data.length / 5) === 0).map((pt, i) => {
          const index = data.indexOf(pt);
          const x = getX(index);
          const time = new Date(pt.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          });
          return (
            <text
              key={i}
              x={x}
              y={height - padding.bottom + 18}
              textAnchor="middle"
              className="fill-slate-600 text-[10px] font-mono"
            >
              {time}
            </text>
          );
        })}

        {/* Hover interaction points */}
        {data.map((pt, i) => {
          const x = getX(i);
          return (
            <rect
              key={i}
              x={x - innerWidth / (data.length * 2)}
              y={padding.top}
              width={innerWidth / data.length}
              height={innerHeight}
              fill="transparent"
              className="cursor-pointer"
              onMouseEnter={() => setHoverIndex(i)}
              onMouseLeave={() => setHoverIndex(null)}
            />
          );
        })}

        {/* Active hover crosshair and dots */}
        {hoverIndex !== null && hoveredPoint && (
          <g>
            <line
              x1={getX(hoverIndex)}
              y1={padding.top}
              x2={getX(hoverIndex)}
              y2={height - padding.bottom}
              stroke="#64748b"
              strokeWidth="1"
              strokeDasharray="2 2"
            />
            {/* Downstream dot */}
            <circle
              cx={getX(hoverIndex)}
              cy={getY(hoveredPoint.downstreamLevel)}
              r="4.5"
              fill="#0284c7"
              stroke="#ffffff"
              strokeWidth="2"
            />
            {/* Farm dot */}
            <circle
              cx={getX(hoverIndex)}
              cy={getY(hoveredPoint.farmLevel)}
              r="5"
              fill="#059669"
              stroke="#ffffff"
              strokeWidth="2"
            />
          </g>
        )}
      </svg>

      {/* Floating Tooltip */}
      {hoverIndex !== null && hoveredPoint && (
        <div
          className="pointer-events-none absolute top-2 rounded-lg border border-slate-200 bg-white/95 px-3 py-2 text-xs shadow-md backdrop-blur-sm"
          style={{
            left: `${Math.min(75, Math.max(15, (hoverIndex / (data.length - 1)) * 100))}%`,
            transform: 'translateX(-50%)',
          }}
        >
          <div className="font-mono text-[10px] text-slate-700">
            {new Date(hoveredPoint.timestamp).toLocaleString([], {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
          <div className="mt-1 flex items-center justify-between gap-3 text-emerald-700 font-medium">
            <span>Farm Level:</span>
            <span className="font-mono font-bold">{hoveredPoint.farmLevel} {unit}</span>
          </div>
          <div className="flex items-center justify-between gap-3 text-sky-700 font-medium">
            <span>Downstream Canal:</span>
            <span className="font-mono font-bold">{hoveredPoint.downstreamLevel} {unit}</span>
          </div>
          {showDifferential && (
            <div className="mt-1 border-t border-slate-100 pt-1 flex items-center justify-between gap-3">
              <span className="text-slate-600">Differential (Δh):</span>
              <span
                className={`font-mono font-bold ${
                  hoveredPoint.differential <= 0 ? 'text-amber-600' : 'text-emerald-700'
                }`}
              >
                {hoveredPoint.differential > 0 ? `+${hoveredPoint.differential}` : hoveredPoint.differential} {unit}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Chart Legend */}
      <div className="mt-2 flex flex-wrap items-center justify-center gap-5 text-xs text-slate-600">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-5 rounded bg-emerald-600 inline-block"></span>
          <span className="font-medium text-slate-700">Farm-Side Water Level</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-5 rounded bg-sky-600 inline-block"></span>
          <span className="font-medium text-slate-700">Downstream Canal / Outfall</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-0.5 w-4 border-t-2 border-dashed border-red-500 inline-block"></span>
          <span className="text-slate-700">Submergence Limit</span>
        </div>
      </div>
    </div>
  );
};
