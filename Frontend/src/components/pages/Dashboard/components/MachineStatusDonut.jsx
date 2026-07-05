import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = { normal: '#22c55e', watch: '#eab308', problem: '#ef4444' };

export default function MachineStatusDonut({ data }) {
  if (!data) return null;
  const { total, normal, watch, problem } = data;

  const pieData = [
    { name: 'Normal', value: normal, color: COLORS.normal },
    { name: 'Watch', value: watch, color: COLORS.watch },
    { name: 'Problem', value: problem, color: COLORS.problem },
  ].filter((d) => d.value > 0);

  const pct = (v) => (total > 0 ? ((v / total) * 100).toFixed(1) : '0.0');

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">Machine Status Summary</h3>
        <button className="text-gray-400 hover:text-gray-600">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
          </svg>
        </button>
      </div>
      <div className="flex items-center gap-4">
        {/* Donut */}
        <div className="relative flex-shrink-0" style={{ width: 140, height: 140 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={44}
                outerRadius={64}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {pieData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v, n) => [`${v} machines`, n]} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
          {/* Center label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-bold text-gray-800">{total}</span>
            <span className="text-xs text-gray-400">machines</span>
          </div>
        </div>
        {/* Legend */}
        <div className="flex flex-col gap-3">
          {[
            { label: 'Normal', value: normal, color: COLORS.normal },
            { label: 'Watch', value: watch, color: COLORS.watch },
            { label: 'Problem', value: problem, color: COLORS.problem },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
              <span className="text-sm text-gray-600 w-20">{item.label}</span>
              <span className="text-sm font-semibold text-gray-800">{item.value} machines</span>
              <span className="text-xs text-gray-400">{pct(item.value)}%</span>
            </div>
          ))}
        </div>
      </div>
      {problem > 0 && (
        <div className="mt-3 flex items-center gap-2 bg-blue-50 rounded-lg px-3 py-2 text-xs text-blue-700">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {problem} machine{problem > 1 ? 's' : ''} with problems — immediate inspection required
        </div>
      )}
    </div>
  );
}
