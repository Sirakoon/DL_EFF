import { useState } from 'react';
import { HiXMark, HiCheckCircle, HiExclamationCircle } from 'react-icons/hi2';
import { TbLoader2 } from 'react-icons/tb';
import { useAuth } from '../../context/AuthContext';
import { toast } from '../../lib/toast';

const ROLES = [
  { value: 'admin', label: 'Admin — จัดการผู้ใช้ + เพิ่ม/แก้/ลบข้อมูล' },
  { value: 'editor', label: 'Editor — เพิ่ม/แก้/ลบข้อมูล' },
  { value: 'viewer', label: 'Viewer — ดูข้อมูลอย่างเดียว' },
];

const inputCls = 'w-full h-11 border border-gray-200 rounded-xl px-3.5 text-sm bg-white text-gray-800 transition focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400';

export default function AuthModal({ initialMode = 'login', onClose, onSuccess }) {
  const { login, register, forgotPassword } = useAuth();
  const [mode, setMode] = useState(initialMode); // 'login' | 'register' | 'registered' | 'forgot' | 'reset-done'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const resetFields = () => { setUsername(''); setPassword(''); setConfirmPassword(''); setRole(''); setError(''); };

  const switchTo = (m) => { resetFields(); setMode(m); };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const user = await login(username, password);
      toast.success(`ยินดีต้อนรับ ${user.username}`);
      onSuccess?.(user);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (!role) return setError('กรุณาเลือก role');
    if (password.length < 6) return setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
    if (password !== confirmPassword) return setError('รหัสผ่านไม่ตรงกัน');

    setSubmitting(true);
    try {
      const res = await register(username, password, role);
      setNotice(res.message);
      setMode('registered');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    if (!username) return setError('กรุณากรอก username');
    if (password.length < 6) return setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
    if (password !== confirmPassword) return setError('รหัสผ่านไม่ตรงกัน');

    setSubmitting(true);
    try {
      const res = await forgotPassword(username, password);
      setNotice(res.message);
      setMode('reset-done');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const titles = {
    login: 'เข้าสู่ระบบ',
    register: 'สมัครสมาชิก',
    registered: 'สมัครสำเร็จ',
    forgot: 'ลืมรหัสผ่าน',
    'reset-done': 'ตั้งรหัสผ่านใหม่สำเร็จ',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">

        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-black text-gray-900">{titles[mode]}</h2>
          <button onClick={onClose} className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition">
            <HiXMark className="text-xl" />
          </button>
        </div>

        <div className="p-6">
          {mode === 'registered' || mode === 'reset-done' ? (
            <div className="text-center py-4">
              <HiCheckCircle className="text-emerald-500 text-5xl mx-auto mb-3" />
              <p className="text-sm text-gray-600 mb-6">{notice}</p>
              <button onClick={() => switchTo('login')}
                className="w-full h-11 flex items-center justify-center gap-2 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition shadow-md shadow-blue-200">
                กลับไปหน้า Login
              </button>
            </div>
          ) : mode === 'forgot' ? (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">Username</label>
                <input className={inputCls} value={username} onChange={(e) => setUsername(e.target.value)} autoFocus required />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">รหัสผ่านใหม่</label>
                <input type="password" className={inputCls} value={password} onChange={(e) => setPassword(e.target.value)} required />
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
                className="w-full h-11 flex items-center justify-center gap-2 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-60 transition shadow-md shadow-blue-200">
                {submitting && <TbLoader2 className="animate-spin" />}
                ตั้งรหัสผ่านใหม่
              </button>

              <p className="text-center text-xs text-gray-400">
                <button type="button" onClick={() => switchTo('login')} className="text-blue-600 font-bold hover:underline">กลับไปหน้า Login</button>
              </p>
            </form>
          ) : (
            <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">Username</label>
                <input className={inputCls} value={username} onChange={(e) => setUsername(e.target.value)} autoFocus required />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide">Password</label>
                  {mode === 'login' && (
                    <button type="button" onClick={() => switchTo('forgot')} className="text-[11px] font-bold text-blue-600 hover:underline">ลืมรหัสผ่าน?</button>
                  )}
                </div>
                <input type="password" className={inputCls} value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>

              {mode === 'register' && (
                <>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">Confirm Password</label>
                    <input type="password" className={inputCls} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                      Role <span className="text-red-400">*</span>
                    </label>
                    <select className={inputCls} value={role} onChange={(e) => setRole(e.target.value)} required>
                      <option value="" disabled>เลือก role ที่ต้องการสมัคร</option>
                      {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                    </select>
                    <p className="text-[11px] text-gray-400 mt-1.5">Admin จะเป็นผู้อนุมัติคำขอสมัครก่อนเข้าใช้งานได้</p>
                  </div>
                </>
              )}

              {error && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl px-3.5 py-2.5">
                  <HiExclamationCircle className="text-red-500 text-base flex-shrink-0 mt-0.5" />
                  {error}
                </div>
              )}

              <button type="submit" disabled={submitting}
                className="w-full h-11 flex items-center justify-center gap-2 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-60 transition shadow-md shadow-blue-200">
                {submitting && <TbLoader2 className="animate-spin" />}
                {mode === 'login' ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
              </button>

              <p className="text-center text-xs text-gray-400">
                {mode === 'login' ? (
                  <>ยังไม่มีบัญชี? <button type="button" onClick={() => switchTo('register')} className="text-blue-600 font-bold hover:underline">สมัครสมาชิก</button></>
                ) : (
                  <>มีบัญชีอยู่แล้ว? <button type="button" onClick={() => switchTo('login')} className="text-blue-600 font-bold hover:underline">เข้าสู่ระบบ</button></>
                )}
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
