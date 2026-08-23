import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/index.js';
import { TrendingUp, BarChart3, PieChart, Users, Briefcase } from 'lucide-react';

/**
 * Weekly Applications Trend SVG Area / Bar Chart.
 */
export function WeeklyApplicationsChart({ data = [] }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-slate-500">
        No weekly application data recorded.
      </div>
    );
  }

  const maxCount = Math.max(...data.map((d) => d.count), 5);
  const chartHeight = 180;
  const chartWidth = 500;
  const paddingX = 40;
  const paddingY = 25;
  const effectiveWidth = chartWidth - paddingX * 2;
  const effectiveHeight = chartHeight - paddingY * 2;

  // Calculate points
  const points = data.map((d, index) => {
    const x = paddingX + (index / Math.max(1, data.length - 1)) * effectiveWidth;
    const y = chartHeight - paddingY - (d.count / maxCount) * effectiveHeight;
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, pt, idx) => {
    return `${acc} ${idx === 0 ? 'M' : 'L'} ${pt.x},${pt.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x},${chartHeight - paddingY} L ${points[0].x},${chartHeight - paddingY} Z`;

  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardHeader className="pb-2 border-b border-slate-100 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-brand-600" />
          <CardTitle className="text-sm font-bold text-slate-900">Application Volume Trend (Past 6 Weeks)</CardTitle>
        </div>
        <span className="text-[11px] font-mono text-slate-500">Weekly Trajectory</span>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <div className="relative w-full overflow-hidden">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full h-48 sm:h-56 overflow-visible"
          >
            <defs>
              <linearGradient id="areaGradientLight" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2563EB" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="lineGradientLight" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#2563EB" />
                <stop offset="100%" stopColor="#4F46E5" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
              const y = chartHeight - paddingY - pct * effectiveHeight;
              const val = Math.round(pct * maxCount);
              return (
                <g key={i}>
                  <line
                    x1={paddingX}
                    y1={y}
                    x2={chartWidth - paddingX}
                    y2={y}
                    stroke="#E2E8F0"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={paddingX - 10}
                    y={y + 3}
                    textAnchor="end"
                    className="text-[9px] fill-slate-400 font-mono"
                  >
                    {val}
                  </text>
                </g>
              );
            })}

            {/* Filled Area */}
            <path d={areaD} fill="url(#areaGradientLight)" />

            {/* Connecting Line */}
            <path
              d={pathD}
              fill="none"
              stroke="url(#lineGradientLight)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data Node Dots */}
            {points.map((pt, idx) => {
              const isHovered = hoveredIdx === idx;
              return (
                <g
                  key={idx}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  className="cursor-pointer"
                >
                  {/* Outer hover ring */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isHovered ? 8 : 4}
                    className="fill-brand-500/20 transition-all"
                  />
                  {/* Inner node dot */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isHovered ? 4.5 : 3}
                    className="fill-white stroke-brand-600 stroke-2 transition-all shadow-sm"
                  />

                  {/* X-axis Week Label */}
                  <text
                    x={pt.x}
                    y={chartHeight - 6}
                    textAnchor="middle"
                    className={`text-[10px] font-mono transition-colors ${
                      isHovered ? 'fill-slate-900 font-bold' : 'fill-slate-500'
                    }`}
                  >
                    {pt.label || pt.week}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Interactive Tooltip Card */}
          {hoveredIdx !== null && points[hoveredIdx] && (
            <div
              className="absolute top-2 left-1/2 -translate-x-1/2 bg-white border border-slate-200 p-2.5 rounded-xl shadow-lg pointer-events-none text-center space-y-0.5 z-10"
            >
              <p className="text-[11px] font-semibold text-slate-500">
                {points[hoveredIdx].label} ({points[hoveredIdx].week})
              </p>
              <p className="text-sm font-bold text-slate-900">
                <span className="text-brand-600 font-mono">{points[hoveredIdx].count}</span> application(s)
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Top Internship Applications Breakdown Bar Chart.
 */
export function InternshipBreakdownChart({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardHeader className="pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-600" />
            <CardTitle className="text-sm font-bold text-slate-900">Applications by Internship</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6 text-center text-xs text-slate-500">
          No internship application data available yet.
        </CardContent>
      </Card>
    );
  }

  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardHeader className="pb-2 border-b border-slate-100 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-emerald-600" />
          <CardTitle className="text-sm font-bold text-slate-900">Top Roles by Candidate Volume</CardTitle>
        </div>
        <span className="text-[11px] font-mono text-slate-500">Top Postings</span>
      </CardHeader>
      <CardContent className="p-5 space-y-4">
        {data.map((item, idx) => {
          const pct = Math.round((item.count / maxCount) * 100);
          return (
            <div key={item.internshipId || idx} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800 truncate max-w-[200px] sm:max-w-xs flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded bg-slate-100 text-[10px] text-slate-600 flex items-center justify-center font-mono">
                    {idx + 1}
                  </span>
                  {item.title}
                </span>
                <span className="font-bold text-slate-900 font-mono shrink-0">
                  {item.count} <span className="text-slate-500 font-normal text-[11px]">applicants</span>
                </span>
              </div>

              {/* Animated Progress Track */}
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-700 shadow-xs"
                  style={{ width: `${Math.max(5, pct)}%` }}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

/**
 * Application Status Distribution Visualizer.
 */
export function StatusDistributionChart({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardHeader className="pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <PieChart className="w-4 h-4 text-purple-600" />
            <CardTitle className="text-sm font-bold text-slate-900">Status Distribution</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6 text-center text-xs text-slate-500">
          No candidates in pipeline.
        </CardContent>
      </Card>
    );
  }

  const total = data.reduce((sum, d) => sum + (d.count || 0), 0);

  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardHeader className="pb-2 border-b border-slate-100 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <PieChart className="w-4 h-4 text-purple-600" />
          <CardTitle className="text-sm font-bold text-slate-900">Application Pipeline Breakdown</CardTitle>
        </div>
        <span className="text-[11px] font-mono text-slate-500">{total} Total</span>
      </CardHeader>
      <CardContent className="p-5 space-y-5">
        {/* Multi-segment Combined Bar */}
        <div className="w-full h-3.5 rounded-full overflow-hidden bg-slate-100 border border-slate-200 flex">
          {data.map((seg, i) => {
            if (seg.count === 0 || total === 0) return null;
            const widthPct = (seg.count / total) * 100;
            return (
              <div
                key={i}
                style={{
                  width: `${widthPct}%`,
                  backgroundColor: seg.color || '#3B82F6',
                }}
                className="h-full transition-all duration-500 hover:brightness-110"
                title={`${seg.label}: ${seg.count} (${widthPct.toFixed(1)}%)`}
              />
            );
          })}
        </div>

        {/* Legend Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {data.map((item, idx) => {
            const pct = total > 0 ? ((item.count / total) * 100).toFixed(0) : 0;
            return (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5"
              >
                <div className="flex items-center gap-2 text-xs">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color || '#3B82F6' }}
                  />
                  <span className="text-slate-700 font-medium truncate">{item.label}</span>
                </div>
                <div className="flex items-baseline justify-between pt-0.5">
                  <span className="text-base font-bold text-slate-900 font-mono">{item.count}</span>
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
  WeeklyApplicationsChart,
  InternshipBreakdownChart,
  StatusDistributionChart,
};
