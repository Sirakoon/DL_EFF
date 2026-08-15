import { useState, Suspense, lazy } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import AuthModal from './AuthModal';
import { ToastContainer } from './Toast';
import { useAuth } from '../../context/AuthContext';
import MachineManagementPage from '../pages/MachineManagement';

const DlEffDashboard = lazy(() => import('../pages/DlEff/index'));
const PDInputPage = lazy(() => import('../pages/PDInput/index'));
const UserManagementPage = lazy(() => import('../pages/UserManagement/index'));
const ProductManagementPage = lazy(() => import('../pages/ProductManagement/index'));

const PAGE_META = {
  'dl-eff': { title: 'DL Efficiency Dashboard', subtitle: 'Direct Labour Efficiency · Gown / Drape / CWC' },
  'pd-input': { title: 'Data Input', subtitle: 'Production record management' },
  'pd-machine': { title: 'Machine', subtitle: 'Machine management' },
  'pd-product': { title: 'Product', subtitle: 'Product master data · capacity / MC speed' },
  'user-management': { title: 'User Management', subtitle: 'Approve registrations · reset passwords' },
};

const DEFAULT_KEY = 'dl-eff';

export default function LayoutPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [activeKey, setActiveKey] = useState(DEFAULT_KEY);
  const [collapsed, setCollapsed] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const { title, subtitle } = PAGE_META[activeKey] ?? PAGE_META[DEFAULT_KEY];

  const handleSelect = (key) => {
    if (key === 'user-management' && !isAdmin) return;
    setActiveKey(key);
  };

  return (
    <div className="flex h-screen bg-[#F5F7FA] overflow-hidden">
      <ToastContainer />
      <Sidebar
        activeKey={activeKey}
        onSelect={handleSelect}
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
        isAdmin={isAdmin}
      />
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <Header title={title} subtitle={subtitle} onLoginClick={() => setAuthModalOpen(true)} />
        <main className="flex-1 overflow-y-auto p-6">
          <Suspense fallback={
            <div className="flex items-center justify-center h-64 gap-3">
              <div className="w-8 h-8 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
              <span className="text-gray-400 text-sm">Loading…</span>
            </div>
          }>
            {activeKey === 'dl-eff' && <DlEffDashboard />}
            {activeKey === 'pd-input' && <PDInputPage />}
            {activeKey === 'pd-machine' && <MachineManagementPage />}
            {activeKey === 'pd-product' && <ProductManagementPage />}
            {activeKey === 'user-management' && isAdmin && <UserManagementPage />}
          </Suspense>
        </main>
      </div>

      {authModalOpen && <AuthModal onClose={() => setAuthModalOpen(false)} />}
    </div>
  );
}
