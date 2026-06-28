import React, { useState } from 'react';
import { Outlet } from 'react-router';
import Sidebar from './Sidebar';
import Header from './Header';

export default function LayoutPage() {
  const [activeKey, setActiveKey] = useState('performance');
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar
        activeKey={activeKey}
        onSelect={setActiveKey}
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
      />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header title="Production Dashboard" subtitle="Machine Performance" />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
