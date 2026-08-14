import { useEffect, useMemo, useRef, useState } from 'react';
import { HiChevronLeft, HiChevronRight, HiCalendarDays } from 'react-icons/hi2';
import { fmtDMY } from '../../utils/date';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const parseISO = (iso) => {
  if (!iso) return null;
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
};
const toISO = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};
const sameDay = (a, b) =>
  !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

/* ── formatted date input: shows dd-Mon-yyyy, picks via calendar popup ── */
export default function DatePicker({ value, onChange, min, max, placeholder = 'Select date', className = '' }) {
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => parseISO(value) || new Date());
  const ref = useRef(null);

  useEffect(() => {
    if (value) setViewDate(parseISO(value));
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const minDate = min ? parseISO(min) : null;
  const maxDate = max ? parseISO(max) : null;
  const isDisabled = (date) => (minDate && date < minDate) || (maxDate && date > maxDate);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const days = useMemo(() => {
    const startWeekday = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells = Array(startWeekday).fill(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
    return cells;
  }, [year, month]);

  const selectedDate = parseISO(value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const changeMonth = (delta) => setViewDate(new Date(year, month + delta, 1));

  const handlePick = (date) => {
    if (isDisabled(date)) return;
    onChange(toISO(date));
    setOpen(false);
  };

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex h-10 w-full items-center gap-2 rounded-xl border px-3 text-sm transition-all duration-200 cursor-pointer
          ${open ? 'border-blue-400 bg-white ring-2 ring-blue-100' : 'border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-white'}`}
      >
        <HiCalendarDays className="text-gray-400 shrink-0" />
        <span className={`truncate ${value ? 'text-gray-700' : 'text-gray-400'}`}>
          {value ? fmtDMY(value) : placeholder}
        </span>
      </button>

      <div
        className={`absolute left-0 top-full z-50 mt-1.5 w-64 rounded-xl border border-gray-200 bg-white p-3 shadow-xl shadow-gray-200/60 origin-top transition-all duration-200 ease-out
          ${open ? 'visible translate-y-0 scale-100 opacity-100' : 'invisible -translate-y-2 scale-[0.98] opacity-0'}`}
      >
        <div className="flex items-center justify-between mb-2">
          <button
            type="button"
            onClick={() => changeMonth(-1)}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition cursor-pointer"
          >
            <HiChevronLeft />
          </button>
          <span className="text-xs font-bold text-gray-700">{MONTHS[month]} {year}</span>
          <button
            type="button"
            onClick={() => changeMonth(1)}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition cursor-pointer"
          >
            <HiChevronRight />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-0.5 mb-1">
          {WEEKDAYS.map((w) => (
            <div key={w} className="text-[10px] font-bold text-gray-400 text-center py-1">{w}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-0.5">
          {days.map((date, i) => {
            if (!date) return <div key={`blank-${i}`} />;
            const disabled = isDisabled(date);
            const selected = sameDay(date, selectedDate);
            const isToday = sameDay(date, today);
            return (
              <button
                key={i}
                type="button"
                disabled={disabled}
                onClick={() => handlePick(date)}
                className={`w-8 h-8 rounded-lg text-xs font-medium transition-all
                  ${disabled ? 'text-gray-200 cursor-not-allowed'
                    : selected ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-200 cursor-pointer'
                    : isToday ? 'bg-blue-50 text-blue-600 font-bold cursor-pointer'
                    : 'text-gray-600 hover:bg-blue-100 hover:text-blue-700 cursor-pointer'}`}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
