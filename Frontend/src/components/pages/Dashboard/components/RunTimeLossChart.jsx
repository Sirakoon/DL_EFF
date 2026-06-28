import React from 'react';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

export default function RunTimeLossChart({ data = [] }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-700">Machine Run Time vs Loss Hour</h3>
        </div>
        <button className="text-gray-400 hover:text-gray-600">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
          </svg>
        </button>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <ComposedChart data={data} margin={{ top: 8, right: 24, left: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
          <XAxis dataKey="MACHINE" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
          <YAxis
            yAxisId="left"
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
            label={{ value: 'Run Time (hrs.)', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#9ca3af', dx: -4 }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
            label={{ value: 'Loss Hour (hrs.)', angle: 90, position: 'insideRight', fontSize: 10, fill: '#9ca3af', dx: 4 }}
          />
          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar yAxisId="left" dataKey="runTime" name="Run Time (hrs.)" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={28} />
          <Bar yAxisId="left" dataKey="lossHour" name="Loss Hour (hrs.)" fill="#f97316" radius={[4, 4, 0, 0]} maxBarSize={28} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
