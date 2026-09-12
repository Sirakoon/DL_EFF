import { useCallback, useEffect, useMemo, useState } from "react";
import {
  HiCheckCircle,
  HiXCircle,
  HiKey,
  HiUserGroup,
  HiClock,
} from "react-icons/hi2";
import { IoSearch, IoClose } from "react-icons/io5";
import { TbLoader2 } from "react-icons/tb";
import {
  authListUsers,
  authApproveUser,
  authRejectUser,
  authResetPassword,
} from "../../../services/api";
import { toast } from "../../../lib/toast";
import ResetPasswordModal from "./components/ResetPasswordModal";

const ROLE_BADGE = {
  admin: "bg-purple-100 text-purple-700",
  editor: "bg-blue-100 text-blue-700",
  viewer: "bg-gray-100 text-gray-500",
};

const ROLE_BUTTON = {
  admin: {
    active: "bg-purple-700 text-purple-100",
    hover: "hover:bg-white hover:text-purple-800 hover:border-purple-800",
  },
  editor: {
    active: "bg-blue-700 text-blue-100",
    hover: "hover:bg-white hover:text-blue-700 hover:border-blue-700",
  },
  viewer: {
    active: "bg-gray-500 text-gray-100",
    hover: "hover:bg-white hover:text-gray-500 hover:border-gray-500",
  },
};

const STATUS_BADGE = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

const fmtDateTime = (iso) =>
  iso
    ? new Date(iso).toLocaleString("en", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Bangkok",
      })
    : "—";

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [resetTarget, setResetTarget] = useState(null);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [pendingPage, setPendingPage] = useState(1);
  const [userPage, setUserPage] = useState(1);

  const PENDING_PER_PAGE = 5;
  const USER_PER_PAGE = 10;

  const roleOptions = ["admin", "editor", "viewer"];

  const load = useCallback(() => {
    setLoading(true);
    authListUsers()
      .then((res) => setUsers(res.data))
      .catch((e) => toast.error(`Failed to load users: ${e.message}`))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filteredData = useMemo(() => {
    return users.filter((item) => {
      const keyword = search.trim().toLowerCase();
      const usernameSearch =
        !keyword ||
        String(item.username || "")
          .toLowerCase()
          .includes(keyword);

      const roleFilter =
        !role || String(item.role || "").toLowerCase() === role.toLowerCase();

      return usernameSearch && roleFilter;
    });
  }, [users, search, role]);

  const handleApprove = async (id) => {
    setBusyId(id);
    try {
      await authApproveUser(id);
      toast.success("Approved");
      load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async (id) => {
    setBusyId(id);
    try {
      await authRejectUser(id);
      toast.success("Rejected");
      load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusyId(null);
    }
  };

  const handleResetPassword = async (newPassword) => {
    await authResetPassword(resetTarget.user_id, newPassword);
    toast.success(`Password reset for ${resetTarget.username}`);
    setResetTarget(null);
  };

  const pending = users.filter((u) => u.status === "pending");
  const others = filteredData.filter((u) => u.status !== "pending");

  const userTotalPages = Math.ceil(others.length / USER_PER_PAGE);

  const userData = others.slice(
    (userPage - 1) * USER_PER_PAGE,
    userPage * USER_PER_PAGE,
  );

  const pendingTotalPages = Math.ceil(pending.length / PENDING_PER_PAGE);

  const pendingData = pending.slice(
    (pendingPage - 1) * PENDING_PER_PAGE,
    pendingPage * PENDING_PER_PAGE,
  );

  return (
    <div className="space-y-5 pb-10">
      {pending.length > 0 && (
        <div className="bg-white rounded-3xl border border-amber-200 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-amber-100 bg-amber-50/60">
            <HiClock className="text-amber-500 text-lg" />
            <span className="font-black text-gray-800">Pending Approval</span>
            <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2.5 py-1 rounded-full ml-1">
              {pending.length}
            </span>
          </div>
          <div className="divide-y divide-gray-100">
            {pendingData.map((u) => (
              <div
                key={u.user_id}
                className="flex items-center justify-between px-6 py-4"
              >
                <div className="flex items-center gap-3">
                  <span className="font-bold text-gray-800">{u.username}</span>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${ROLE_BADGE[u.role]}`}
                  >
                    {u.role}
                  </span>
                  <span className="text-xs text-gray-400">
                    requested {fmtDateTime(u.created_at)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleApprove(u.user_id)}
                    disabled={busyId === u.user_id}
                    className="flex items-center gap-1.5 px-4 h-9 text-xs font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 disabled:opacity-60 transition cursor-pointer"
                  >
                    {busyId === u.user_id ? (
                      <TbLoader2 className="animate-spin" />
                    ) : (
                      <HiCheckCircle />
                    )}{" "}
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(u.user_id)}
                    disabled={busyId === u.user_id}
                    className="flex items-center gap-1.5 px-4 h-9 text-xs font-bold text-red-600 border border-red-200 rounded-xl hover:bg-red-50 disabled:opacity-60 transition cursor-pointer"
                  >
                    <HiXCircle /> Reject
                  </button>
                </div>
              </div>
            ))}
            {pendingTotalPages > 1 && (
              <div className="flex items-center justify-end gap-1 px-6 py-3 border-t border-amber-100">
                <button
                  type="button"
                  disabled={pendingPage === 1}
                  onClick={() => setPendingPage((prev) => prev - 1)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-500 hover:border-amber-400 hover:text-amber-600 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition "
                >
                  Prev
                </button>

                {Array.from(
                  { length: pendingTotalPages },
                  (_, index) => index + 1,
                ).map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setPendingPage(page)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold cursor-pointer transition
                      ${pendingPage === page ? "bg-amber-500 text-white" : "border border-gray-200 text-gray-500 hover:border-amber-400 hover:text-amber-600"}
                    `}
                  >
                    {page}
                  </button>
                ))}

                <button
                  type="button"
                  disabled={pendingPage === pendingTotalPages}
                  onClick={() => setPendingPage((prev) => prev + 1)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-500 hover:border-amber-400 hover:text-amber-600 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100">
          <HiUserGroup className="text-gray-400 text-lg" />
          <span className="font-black text-gray-800">All Users</span>
          <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full ml-1 w-8 h-8 flex items-center justify-center">
            {filteredData.length}
          </span>
          <div className="flex flex-col gap-1">
            <div className="relative w-[250px]">
              <IoSearch
                size={15}
                className=" absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none cursor-pointer"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setUserPage(1);
                }}
                placeholder="Search Username..."
                className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-9 text-sm text-gray-700 outline-none transition-all duration-200
                placeholder:text-gray-400 hover:border-blue-300 hover:bg-white focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 "
              />
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                  }}
                  className=" absolute right-2 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-md text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 cursor-pointer"
                >
                  <IoClose size={14} />
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 rounded-xl p-1">
            {/* All */}
            <button
              type="button"
              onClick={() => {
                setRole("");
                setUserPage(1);
              }}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 cursor-pointer border border-gray-200
              ${role === "" ? "bg-blue-800 text-white shadow-sm" : "text-gray-500 hover:bg-white hover:text-blue-800 hover:border-blue-600"}`}
            >
              All
            </button>

            {roleOptions.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setRole(item);
                  setUserPage(1);
                }}
                className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition-all duration-200 cursor-pointer border 
                ${role === item ? `${ROLE_BUTTON[item].active}` : `${ROLE_BUTTON[item].hover} text-gray-500 border-gray-200`}`}
              >
                {item}
              </button>
            ))}
          </div>
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
                  <th className="px-6 py-3 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wide">
                    Username
                  </th>
                  <th className="px-6 py-3 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wide">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wide">
                    Status
                  </th>
                  <th className="px-6 py-3 text-center text-[11px] font-bold text-gray-400 uppercase tracking-wide">
                    Created
                  </th>
                  <th className="px-6 py-3 text-center text-[11px] font-bold text-gray-400 uppercase tracking-wide">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-right text-[11px] font-bold text-gray-400 uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {userData.map((u) => (
                  <tr
                    key={u.user_id}
                    className="hover:bg-blue-50/30 transition-colors"
                  >
                    <td className="px-6 py-3 font-semibold text-gray-800">
                      {u.username}
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${ROLE_BADGE[u.role]}`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${STATUS_BADGE[u.status]}`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-xs text-gray-500 text-center">
                      {fmtDateTime(u.created_at)}
                    </td>
                    <td className="px-6 py-3 text-xs text-gray-500 text-center">
                      {fmtDateTime(u.last_login)}
                    </td>
                    <td className="px-6 py-3 text-right">
                      {u.status === "approved" && (
                        <button
                          onClick={() => setResetTarget(u)}
                          className="inline-flex items-center gap-1.5 px-3 h-8 text-xs font-bold text-gray-600 border border-gray-200 rounded-lg hover:border-blue-300 hover:text-blue-600 transition"
                        >
                          <HiKey /> Reset Password
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {userTotalPages > 1 && (
              <div className="flex items-center justify-end gap-1 px-6 py-3 border-t border-gray-100">
                <button
                  type="button"
                  disabled={userPage === 1}
                  onClick={() => setUserPage((prev) => prev - 1)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-500 hover:border-blue-400 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed  cursor-pointer transition"
                >
                  Prev
                </button>

                {Array.from(
                  { length: userTotalPages },
                  (_, index) => index + 1,
                ).map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setUserPage(page)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold cursor-pointer transition
                    ${userPage === page ? "bg-blue-700 text-white" : "border border-gray-200 text-gray-500 hover:border-blue-400 hover:text-blue-600"}`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  type="button"
                  disabled={userPage === userTotalPages}
                  onClick={() => setUserPage((prev) => prev + 1)}
                  className=" px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-500 hover:border-blue-400 hover:text-blue-600
                  disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition"
                >
                  Next
                </button>
              </div>
            )}
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
