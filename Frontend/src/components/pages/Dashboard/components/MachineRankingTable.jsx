import React from 'react';

function StatusBadge({ status }) {
  const map = {
    ปกติ: 'bg-green-100 text-green-700',
    เฝ้าระวัง: 'bg-yellow-100 text-yellow-700',
    ปัญหา: 'bg-red-100 text-red-700',
  };
  const dot = {
    ปกติ: 'bg-green-500',
    เฝ้าระวัง: 'bg-yellow-400',
    ปัญหา: 'bg-red-500',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${map[status] || 'bg-gray-100 text-gray-600'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot[status] || 'bg-gray-400'}`} />
      {status}
    </span>
  );
}

export default function MachineRankingTable({ ranking }) {
  if (!ranking) return null;
  const { data, total, page, pageSize, totalPages } = ranking;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">Machine Ranking Detail</h3>
        <button className="text-gray-400 hover:text-gray-600">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
          </svg>
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              {['#', 'Machine', 'Product Group', 'Output (ชิ้น)', 'Run Time (ชม.)', 'Loss Hour (ชม.)', 'Loss Rate (%)', 'Status'].map((h) => (
                <th key={h} className="text-left text-xs font-semibold text-gray-500 pb-2 pr-4 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={row.MACHINE} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="py-2.5 pr-4 text-gray-400 font-medium">{(page - 1) * pageSize + i + 1}</td>
                <td className="py-2.5 pr-4 font-semibold text-gray-800">{row.MACHINE}</td>
                <td className="py-2.5 pr-4 text-gray-600">{row.productGroup}</td>
                <td className="py-2.5 pr-4 text-gray-800">{row.totalOutput?.toLocaleString()}</td>
                <td className="py-2.5 pr-4 text-gray-800">{row.runTime}</td>
                <td className="py-2.5 pr-4 text-gray-800">{row.lossHour}</td>
                <td className="py-2.5 pr-4 text-gray-800">{row.lossRate}%</td>
                <td className="py-2.5"><StatusBadge status={row.status} /></td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={8} className="py-8 text-center text-gray-400 text-xs">ไม่พบข้อมูล</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
        <p className="text-xs text-gray-400">
          แสดง {data.length > 0 ? (page - 1) * pageSize + 1 : 0} - {Math.min(page * pageSize, total)} จาก {total} รายการ
        </p>
        <div className="flex items-center gap-1">
          <PageBtn disabled={page <= 1} label="ก่อนหน้า" />
          {Array.from({ length: Math.min(totalPages, 6) }, (_, i) => i + 1).map((p) => (
            <span
              key={p}
              className={`w-7 h-7 flex items-center justify-center rounded text-xs font-medium cursor-pointer ${
                p === page ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {p}
            </span>
          ))}
          {totalPages > 6 && <span className="text-gray-400 text-xs px-1">...</span>}
          <PageBtn disabled={page >= totalPages} label="ถัดไป" />
        </div>
      </div>
    </div>
  );
}

function PageBtn({ disabled, label }) {
  return (
    <button
      disabled={disabled}
      className={`px-2.5 py-1 rounded text-xs font-medium ${
        disabled ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      {label}
    </button>
  );
}
