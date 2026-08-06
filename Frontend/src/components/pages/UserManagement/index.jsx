import { useCallback, useEffect, useState } from 'react';
import { HiCheckCircle, HiXCircle, HiKey, HiUserGroup, HiClock } from 'react-icons/hi2';
import { TbLoader2 } from 'react-icons/tb';
import { authListUsers, authApproveUser, authRejectUser, authResetPassword } from '../../../services/api';
import { toast } from '../../../lib/toast';
import ResetPasswordModal from './components/ResetPasswordModal';

const ROLE_BADGE = {
  admin: 'bg-purple-100 text-purple-700',
  editor: 'bg-blue-100 text-blue-700',
  viewer: 'bg-gray-100 text-gray-500',
};

const STATUS_BADGE = {
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

const fmtDateTime = (iso) => iso ? new Date(iso).toLocaleString('en', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Bangkok' }) : '—';

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [resetTarget, setResetTarget] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    authListUsers()
      .then((res) => setUsers(res.data))
      .catch((e) => toast.error(`Failed to load users: ${e.message}`))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleApprove = async (id) => {
    setBusyId(id);
    try { await authApproveUser(id); toast.success('Approved'); load(); }
    catch (e) { toast.error(e.message); }
    finally { setBusyId(null); }
  };

  const handleReject = async (id) => {
    setBusyId(id);
    try { await authRejectUser(id); toast.success('Rejected'); load(); }
    catch (e) { toast.error(e.message); }
    finally { setBusyId(null); }
  };

  const handleResetPassword = async (newPassword) => {
    await authResetPassword(resetTarget.user_id, newPassword);
    toast.success(`Password reset for ${resetTarget.username}`);
    setResetTarget(null);
  };

  const pending = users.filter((u) => u.status === 'pending');
  const others = users.filter((u) => u.status !== 'pending');

  return (
    <div className="space-y-5 pb-10">

      {pending.length > 0 && (
        <div className="bg-white rounded-3xl border border-amber-200 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-amber-100 bg-amber-50/60">
            <HiClock className="text-amber-500 text-lg" />
            <span className="font-black text-gray-800">Pending Approval</span>
            <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2.5 py-1 rounded-full ml-1">{pending.length}</span>
          </div>
          <div className="divide-y divide-gray-100">
            {pending.map((u) => (
              <div key={u.user_id} className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-gray-800">{u.username}</span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${ROLE_BADGE[u.role]}`}>{u.role}</span>
                  <span className="text-xs text-gray-400">requested {fmtDateTime(u.created_at)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleApprove(u.user_id)} disabled={busyId === u.user_id}
                    className="flex items-center gap-1.5 px-4 h-9 text-xs font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 disabled:opacity-60 transition">
                    {busyId === u.user_id ? <TbLoader2 className="animate-spin" /> : <HiCheckCircle />} Approve
                  </button>
                  <button onClick={() => handleReject(u.user_id)} disabled={busyId === u.user_id}
                    className="flex items-center gap-1.5 px-4 h-9 text-xs font-bold text-red-600 border border-red-200 rounded-xl hover:bg-red-50 disabled:opacity-60 transition">
                    <HiXCircle /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100">
          <HiUserGroup className="text-gray-400 text-lg" />
          <span className="font-black text-gray-800">All Users</span>
          <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full ml-1">{users.length}</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <TbLoader2 className="text-2xl text-blue-500 animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50/80 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wide">Username</th>
                  <th className="px-6 py-3 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wide">Role</th>
                  <th className="px-6 py-3 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wide">Status</th>
                  <th className="px-6 py-3 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wide">Created</th>
                  <th className="px-6 py-3 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wide">Last Login</th>
                  <th className="px-6 py-3 text-right text-[11px] font-bold text-gray-400 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {others.map((u) => (
                  <tr key={u.user_id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-6 py-3 font-semibold text-gray-800">{u.username}</td>
                    <td className="px-6 py-3"><span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${ROLE_BADGE[u.role]}`}>{u.role}</span></td>
                    <td className="px-6 py-3"><span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${STATUS_BADGE[u.status]}`}>{u.status}</span></td>
                    <td className="px-6 py-3 text-xs text-gray-500">{fmtDateTime(u.created_at)}</td>
                    <td className="px-6 py-3 text-xs text-gray-500">{fmtDateTime(u.last_login)}</td>
                    <td className="px-6 py-3 text-right">
                      {u.status === 'approved' && (
                        <button onClick={() => setResetTarget(u)}
                          className="inline-flex items-center gap-1.5 px-3 h-8 text-xs font-bold text-gray-600 border border-gray-200 rounded-lg hover:border-blue-300 hover:text-blue-600 transition">
                          <HiKey /> Reset Password
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {resetTarget && (
        <ResetPasswordModal
          username={resetTarget.username}
          onClose={() => setResetTarget(null)}
          onSubmit={handleResetPassword}
        />
      )}
    </div>
  );
}
