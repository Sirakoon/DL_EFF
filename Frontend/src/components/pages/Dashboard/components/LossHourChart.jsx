import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList,
} from 'recharts';

export default function LossHourChart({ data = [] }) {
  const chartData = [...data].reverse(); // show highest at top (horizontal)

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-700">Loss Hour by Machine (Top 10)</h3>
          <p className="text-xs text-gray-400">(hrs.)</p>
        </div>
        <button className="text-gray-400 hover:text-gray-600">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
          </svg>
        </button>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 48, left: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
          <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
          <YAxis
            dataKey="MACHINE"
            type="category"
            tick={{ fontSize: 11, fill: '#6b7280' }}
            axisLine={false}
            tickLine={false}
            width={36}
          />
          <Tooltip
            formatter={(v) => [`${v} hrs.`, 'Loss Hour']}
            contentStyle={{ fontSize: 12, borderRadius: 8 }}
          />
          <Bar dataKey="lossHour" fill="#f97316" radius={[0, 4, 4, 0]} maxBarSize={14}>
            <LabelList dataKey="lossHour" position="right" style={{ fontSize: 11, fill: '#374151' }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
