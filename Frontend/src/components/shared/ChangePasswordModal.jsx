import { useState } from 'react';
import { HiXMark, HiExclamationCircle } from 'react-icons/hi2';
import { TbLoader2 } from 'react-icons/tb';
import { useAuth } from '../../context/AuthContext';
import { toast } from '../../lib/toast';

const inputCls = 'w-full h-11 border border-gray-200 rounded-xl px-3.5 text-sm bg-white text-gray-800 transition focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400';

export default function ChangePasswordModal({ onClose }) {
  const { changePassword } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (newPassword.length < 6) return setError('รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร');
    if (newPassword !== confirmPassword) return setError('รหัสผ่านไม่ตรงกัน');

    setSubmitting(true);
    try {
      await changePassword(currentPassword, newPassword);
      toast.success('เปลี่ยนรหัสผ่านสำเร็จ');
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-black text-gray-900">เปลี่ยนรหัสผ่าน</h2>
          <button onClick={onClose} className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition cursor-pointer">
            <HiXMark className="text-xl" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">รหัสผ่านปัจจุบัน</label>
            <input type="password" autoFocus className={inputCls} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">รหัสผ่านใหม่</label>
            <input type="password" className={inputCls} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">ยืนยันรหัสผ่านใหม่</label>
            <input type="password" className={inputCls} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
          </div>
          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl px-3.5 py-2.5">
              <HiExclamationCircle className="text-red-500 text-base flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}
          <button type="submit" disabled={submitting}
            className="w-full h-11 flex items-center justify-center gap-2 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-60 transition shadow-md shadow-blue-200 cursor-pointer">
            {submitting && <TbLoader2 className="animate-spin" />}
            เปลี่ยนรหัสผ่าน
          </button>
        </form>
      </div>
    </div>
  );
}
