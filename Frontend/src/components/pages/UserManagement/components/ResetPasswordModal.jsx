import { useState } from 'react';
import { HiXMark, HiExclamationCircle } from 'react-icons/hi2';
import { TbLoader2 } from 'react-icons/tb';

export default function ResetPasswordModal({ username, onClose, onSubmit }) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) return setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
    if (password !== confirm) return setError('รหัสผ่านไม่ตรงกัน');

    setSubmitting(true);
    setError('');
    try {
      await onSubmit(password);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-black text-gray-900">Reset Password — {username}</h2>
          <button onClick={onClose} className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition">
            <HiXMark className="text-xl" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">New Password</label>
            <input type="password" autoFocus value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full h-11 border border-gray-200 rounded-xl px-3.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition" />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">Confirm Password</label>
            <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
              className="w-full h-11 border border-gray-200 rounded-xl px-3.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition" />
          </div>
          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl px-3.5 py-2.5">
              <HiExclamationCircle className="text-red-500 text-base flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}
          <button type="submit" disabled={submitting}
            className="w-full h-11 flex items-center justify-center gap-2 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-60 transition shadow-md shadow-blue-200">
            {submitting && <TbLoader2 className="animate-spin" />}
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
}
