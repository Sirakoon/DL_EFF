import { NAV_SECTIONS } from "../../constants/navigation";
import {
  HiChartBarSquare,
  HiTableCells,
  HiChevronLeft,
  HiChevronRight,
  HiUserGroup,
  HiCpuChip
} from "react-icons/hi2";
import { TbActivityHeartbeat, TbDatabase } from "react-icons/tb";
import { BiSolidFactory } from "react-icons/bi";

const ICONS = {
  activity: <TbActivityHeartbeat className="w-5 h-5" />,
  database: <TbDatabase className="w-5 h-5" />,
  "bar-chart": <HiChartBarSquare className="w-5 h-5" />,
  table: <HiTableCells className="w-5 h-5" />,
  users: <HiUserGroup className="w-5 h-5" />,
  machine: <HiCpuChip className="w-5 h-5" />,
};

export default function Sidebar({
  activeKey,
  onSelect,
  collapsed,
  onToggle,
  isAdmin,
}) {
  const visibleSections = NAV_SECTIONS.filter(
    (section) => !section.adminOnly || isAdmin,
  );

  return (
    <aside
        className={`relative flex flex-col bg-white border-r border-gray-100 h-screen sticky top-0 transition-all duration-300 shadow-sm ${collapsed ? "w-16" : "w-60"}`}
    >
      {/* Logo */}
      <div
        className={`flex items-center gap-3 border-b border-gray-100 min-h-[64px] ${collapsed ? "px-4 justify-center" : "px-5"}`}
      >
        <div className="flex-shrink-0 w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-200">
          <BiSolidFactory className="text-xl" />
        </div>
        {!collapsed && (
          <div>
            <div className="font-black text-gray-900 text-sm leading-none">
              Production
            </div>
            <div className="text-[11px] text-gray-400 font-medium mt-0.5">
              Management System
            </div>
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={onToggle}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="absolute top-[74px] -right-3 z-30 flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm
        cursor-pointer transition-all duration-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600hover:shadow-md active:scale-90"
      >
        {collapsed ? (
          <HiChevronRight className="h-4 w-4" />
        ) : (
          <HiChevronLeft className="h-4 w-4" />
        )}
      </button>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto space-y-1 px-2">
        {visibleSections.map((section) => (
          <div key={section.label}>
            {!collapsed && (
              <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest px-3 mb-2 mt-3">
                {section.label}
              </p>
            )}
            {section.items.map((item) => {
              const active = item.key === activeKey;
              return (
                <button
                  key={item.key}
                  onClick={() => onSelect(item.key)}
                  title={collapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                    active
                      ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                      : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                  }`}
                >
                  <span
                    className={`flex-shrink-0 ${active ? "text-white" : "text-gray-400 "} `}
                  >
                    {ICONS[item.icon]}
                  </span>
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </button>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}
