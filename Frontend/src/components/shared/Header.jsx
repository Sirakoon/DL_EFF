import React, { useState } from 'react';
import { HiCalendarDays, HiUserCircle, HiArrowRightOnRectangle, HiKey } from 'react-icons/hi2';
import { useAuth } from '../../context/AuthContext';
import ChangePasswordModal from './ChangePasswordModal';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const ROLE_BADGE = {
  admin: 'bg-purple-100 text-purple-700',
  editor: 'bg-blue-100 text-blue-700',
  viewer: 'bg-gray-100 text-gray-500',
};

export default function Header({ title, subtitle, onLoginClick }) {
  const { user, logout } = useAuth();
  const [showChangePassword, setShowChangePassword] = useState(false);
  const now = new Date();
  const bkkParts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Bangkok', day: '2-digit', month: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false,
  }).formatToParts(now).reduce((acc, p) => ({ ...acc, [p.type]: p.value }), {});
  const dateStr = `${bkkParts.day} ${MONTHS[Number(bkkParts.month) - 1]} ${bkkParts.year}`;
  const timeStr = `${bkkParts.hour}:${bkkParts.minute}`;

  return (
    <header className="flex items-center justify-between px-6 py-3.5 bg-white border-b border-gray-100 sticky top-0 z-20 shadow-sm">
      <div>
        <h1 className="text-base font-black text-gray-900 leading-tight">{title}</h1>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5 font-medium">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-gray-500 bg-gray-50 border border-gray-200 px-3 py-2 rounded-xl">
          <HiCalendarDays className="text-gray-400 text-sm" />
          {dateStr} · {timeStr}
        </div>

        {user ? (
          <div className="flex items-center gap-2">
            <span className={`text-[11px] font-bold px-2 py-1 rounded-full ${ROLE_BADGE[user.role]}`}>{user.role}</span>
            <span className="text-sm font-semibold text-gray-700">{user.username}</span>
            <button onClick={() => setShowChangePassword(true)} title="เปลี่ยนรหัสผ่าน"
              className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:bg-gray-100 hover:text-blue-600 transition">
              <HiKey className="text-lg" />
            </button>
            <button onClick={logout} title="Logout"
              className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:bg-gray-100 hover:text-red-500 transition">
              <HiArrowRightOnRectangle className="text-lg" />
            </button>
          </div>
        ) : (
          <button onClick={onLoginClick}
            className="flex items-center gap-2 px-4 h-9 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition shadow-md shadow-blue-200">
            <HiUserCircle className="text-base" />
            Login
          </button>
        )}
      </div>

      {showChangePassword && <ChangePasswordModal onClose={() => setShowChangePassword(false)} />}
    </header>
  );
}
