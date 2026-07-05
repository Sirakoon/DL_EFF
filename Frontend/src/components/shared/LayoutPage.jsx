import React, { useState, Suspense, lazy } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const DlEffDashboard = lazy(() => import('../pages/DlEff/index'));
const PDInputPage = lazy(() => import('../pages/PDInput/index'));

const PAGE_META = {
  'dl-eff': { title: 'DL Efficiency Dashboard', subtitle: 'Direct Labour Efficiency · Gown / Drape / CWC' },
  'pd-input': { title: 'Data Input', subtitle: 'Production record management' },
};

const DEFAULT_KEY = 'dl-eff';

export default function LayoutPage() {
  const [activeKey, setActiveKey] = useState(DEFAULT_KEY);
  const [collapsed, setCollapsed] = useState(false);

  const { title, subtitle } = PAGE_META[activeKey] ?? PAGE_META[DEFAULT_KEY];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar
        activeKey={activeKey}
        onSelect={setActiveKey}
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
      />
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <Header title={title} subtitle={subtitle} />
        <main className="flex-1 overflow-y-auto p-6">
          <Suspense fallback={
            <div className="flex items-center justify-center h-64 gap-3">
              <div className="w-8 h-8 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
              <span className="text-gray-400 text-sm">Loading…</span>
            </div>
          }>
            {activeKey === 'dl-eff' && <DlEffDashboard />}
            {activeKey === 'pd-input' && <PDInputPage />}
          </Suspense>
        </main>
      </div>
    </div>
  );
}
