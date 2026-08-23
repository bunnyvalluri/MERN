import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '../../../components/ui/index.js';
import { TrendingUp, Users, PieChart, Activity } from 'lucide-react';

/**
 * 1. User Growth Chart (6-Month Area Chart)
 */
export function UserGrowthChart({ data = [] }) {
  const points = data.length > 0 ? data : [
    { label: 'Mar 26', count: 12 },
    { label: 'Apr 26', count: 24 },
    { label: 'May 26', count: 48 },
    { label: 'Jun 26', count: 76 },
    { label: 'Jul 26', count: 110 },
    { label: 'Aug 26', count: 154 },
  ];

  const maxVal = Math.max(...points.map((p) => p.count), 10);
  const chartHeight = 160;
  const chartWidth = 500;
  const stepX = chartWidth / (points.length - 1 || 1);

  const coordinates = points.map((p, idx) => {
    const x = idx * stepX;
    const y = chartHeight - (p.count / maxVal) * (chartHeight - 30) - 15;
    return { x, y, ...p };
  });

  const polylinePoints = coordinates.map((c) => `${c.x},${c.y}`).join(' ');
  const areaPath = `M 0,${chartHeight} L ${polylinePoints} L ${chartWidth},${chartHeight} Z`;

  return (
    <Card className="border-slate-800 bg-slate-900/90 shadow-card">
      <CardHeader className="pb-2 border-b border-slate-800 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-rose-400" />
          <CardTitle className="text-sm font-bold text-white">Platform User Growth</CardTitle>
        </div>
        <Badge variant="primary" size="xs">
          Past 6 Months
        </Badge>
      </CardHeader>

      <CardContent className="p-6">
        <div className="w-full overflow-x-auto no-scrollbar">
          <div className="min-w-[440px]">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight + 30}`}
              className="w-full h-44 overflow-visible"
            >
              <defs>
                <linearGradient id="userGrowthGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 0.33, 0.66, 1].map((ratio, i) => {
                const y = chartHeight * ratio;
                return (
                  <line
                    key={i}
                    x1="0"
                    y1={y}
                    x2={chartWidth}
                    y2={y}
                    stroke="#1e293b"
                    strokeDasharray="4 4"
                    strokeWidth="1"
                  />
                );
              })}

              {/* Gradient Fill Area */}
              <path d={areaPath} fill="url(#userGrowthGrad)" />

              {/* Primary Trajectory Line */}
              <polyline
                fill="none"
                stroke="#f43f5e"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={polylinePoints}
              />

              {/* Data Points */}
              {coordinates.map((c, i) => (
                <g key={i} className="group cursor-pointer">
                  <circle
                    cx={c.x}
                    cy={c.y}
                    r="5"
                    className="fill-rose-500 stroke-slate-900 stroke-2 group-hover:r-7 transition-all"
                  />
                  {/* Point Label */}
                  <text
                    x={c.x}
                    y={c.y - 10}
                    textAnchor="middle"
                    className="fill-slate-200 text-[10px] font-mono font-bold"
                  >
                    {c.count}
                  </text>
                  {/* X-Axis Month Label */}
                  <text
                    x={c.x}
                    y={chartHeight + 20}
                    textAnchor="middle"
                    className="fill-slate-400 text-[10px] font-mono"
                  >
                    {c.label}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * 2. Status Distribution Pipeline Chart
 */
export function StatusDistributionChart({ data = [] }) {
  const total = data.reduce((acc, curr) => acc + curr.count, 0) || 1;

  const STATUS_COLORS = {
    APPLIED: 'bg-blue-500',
    UNDER_REVIEW: 'bg-amber-500',
    SHORTLISTED: 'bg-purple-500',
    INTERVIEW: 'bg-teal-500',
    SELECTED: 'bg-emerald-500',
    REJECTED: 'bg-rose-500',
    WITHDRAWN: 'bg-slate-600',
  };

  return (
    <Card className="border-slate-800 bg-slate-900/90 shadow-card">
      <CardHeader className="pb-2 border-b border-slate-800 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <PieChart className="w-4 h-4 text-purple-400" />
          <CardTitle className="text-sm font-bold text-white">Application Pipeline Breakdown</CardTitle>
        </div>
        <span className="text-xs text-slate-400 font-mono">
          {total} Total Applications
        </span>
      </CardHeader>

      <CardContent className="p-6 space-y-4">
        {/* Multi-segment Progress Bar */}
        <div className="h-3.5 w-full bg-slate-950 rounded-full overflow-hidden flex border border-slate-800">
          {data.map((item) => {
            const pct = (item.count / total) * 100;
            if (pct === 0) return null;
            return (
              <div
                key={item.status}
                style={{ width: `${pct}%` }}
                className={`${STATUS_COLORS[item.status] || 'bg-slate-500'} h-full transition-all`}
                title={`${item.status.replace('_', ' ')}: ${item.count} (${pct.toFixed(1)}%)`}
              />
            );
          })}
        </div>

        {/* Breakdown Items List */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
          {data.map((item) => {
            const pct = ((item.count / total) * 100).toFixed(1);
            return (
              <div
                key={item.status}
                className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1"
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      STATUS_COLORS[item.status] || 'bg-slate-500'
                    }`}
                  />
                  <span className="text-[11px] font-medium text-slate-300 truncate capitalize">
                    {item.status.toLowerCase().replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-bold text-white font-mono">{item.count}</span>
                  <span className="text-[10px] text-slate-500 font-mono">{pct}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export default {
  UserGrowthChart,
  StatusDistributionChart,
};
