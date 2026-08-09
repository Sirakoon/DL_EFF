import React from "react";

function ProgressGauge({
  value,
  size = 220,
  target,
  gray = "#d0d0d0",
}) {
  const cx = 110;
  const cy = 105;
  const radius = 72;

  // รูปทรง 3/4 วงกลม
  const startAngle = 160;
  const sweepAngle = 220;

  // ==============================
  // Check data
  // ==============================
  const numericValue = Number(value);
  const numericTarget = Number(target);

  const hasValue =
    value !== null && value !== undefined && !Number.isNaN(numericValue);

  const hasTarget =
    target !== null &&
    target !== undefined &&
    !Number.isNaN(numericTarget) &&
    numericTarget > 0;

  const noData = !hasValue || !hasTarget;

  // ==============================
  // ผ่านเป้าหมายหรือไม่
  // ==============================
  const met = !noData && numericValue >= numericTarget;

  // สีตัวเลข
  // ผ่าน = เขียว
  // ไม่ผ่าน / ติดลบ = แดง
  const valueColor = noData
    ? "#9ca3af"
    : met
      ? "#00c950"
      : "#fb2c36";

  // ==============================
  // Gauge calculation
  //
  // เหมือน MiniBar:
  // value / (target * 2)
  //
  // target จะอยู่ที่ 50% ของวง
  // ==============================
  const maxValue = hasTarget ? numericTarget * 2 : 0;

  const progressPercent =
    !noData && maxValue > 0
      ? Math.min(Math.max((numericValue / maxValue) * 100, 0), 100)
      : 0;

  const progressAngle = startAngle + (progressPercent / 100) * sweepAngle;

  const endAngle = startAngle + sweepAngle;

  const polarToCartesian = (angle) => {
    const rad = (angle * Math.PI) / 180;

    return {
      x: cx + radius * Math.cos(rad),
      y: cy + radius * Math.sin(rad),
    };
  };

  const createArc = (fromAngle, toAngle) => {
    const start = polarToCartesian(fromAngle);
    const end = polarToCartesian(toAngle);

    const difference = toAngle - fromAngle;
    const largeArcFlag = difference > 180 ? 1 : 0;

    return `
      M ${start.x} ${start.y}
      A ${radius} ${radius}
      0 ${largeArcFlag} 1
      ${end.x} ${end.y}
    `;
  };

  return (
    <svg
      width={size}
      height={size * 0.72}
      viewBox="0 0 220 158"
      className="overflow-visible"
    >
      {/* ==========================
          Background - เทา
      ========================== */}
      <path
        d={createArc(startAngle, endAngle)}
        fill="none"
        stroke={gray}
        strokeWidth="28"
        strokeLinecap="round"
        className=" transition-all duration-200"
      />

      {/* ==========================
          Progress - เขียวเท่านั้น
      ========================== */}
      {progressPercent > 0 && (
        <path
          d={createArc(startAngle, progressAngle)}
          fill="none"
          stroke={valueColor}
          strokeWidth="28"
          strokeLinecap="round"
          className="transition-all duration-300"
        />
      )}

      {/* ==========================
          Value
      ========================== */}
      <text
        x="110"
        y="112"
        textAnchor="middle"
        fill={valueColor}
        className="font-bold text-3xl"
      >
        {noData ? "—" : `${numericValue.toFixed(1)}%`}
      </text>

      {/* ==========================
          Target
      ========================== */}
      <text
        x="110"
        y="132"
        textAnchor="middle"
        fill="#4f4f4f"
        className="text-sm"
      >
        {hasTarget ? `Target ${numericTarget.toFixed(1)}%` : "Target —"}
      </text>
    </svg>
  );
}

export default function ProjectProgress({
  subGroup,
  dlEff,
  target,
  showShifts,
  shifts,
  selected,
}) {
  const numericValue = Number(dlEff);
  const numericTarget = Number(target);

  const noData =
    dlEff === null || dlEff === undefined || Number.isNaN(numericValue);

  const met =
    !noData &&
    target !== null &&
    target !== undefined &&
    !Number.isNaN(numericTarget) &&
    numericValue >= numericTarget;

  return (
    <div
      className={`rounded-2xl transition-all duration-200 ${selected ? "bg-blue-100" : "bg-[#F8FAFC]"}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="font-semibold text-gray-900">{subGroup}</span>

        <span
          className={`
            w-2 h-2 rounded-full flex-shrink-0
            ${noData ? "bg-gray-300" : met ? "bg-green-500" : "bg-red-500"}
          `}
        />
      </div>

      {/* Gauge */}
      <div className="mt-4 flex justify-center">
        <ProgressGauge value={dlEff} target={target} />
      </div>

      {/* Legend */}
      {showShifts && shifts.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2.5 pt-2.5 border-t border-gray-100">
          {shifts.map((s) => {
            const sm = s.dlEff != null && target != null && s.dlEff >= target;
            return (
              <span
                key={s.shift}
                className={`text-sm font-bold px-1.5 py-0.5 rounded-md ${
                  s.dlEff == null
                    ? "bg-gray-100 text-gray-400"
                    : sm
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                }`}
              >
                {s.shift} {s.dlEff == null ? "—" : `${s.dlEff.toFixed(1)}%`}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
