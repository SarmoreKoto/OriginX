'use client';

import { useState } from 'react';
import Sidebar from './sidebar';
import Header from './header';

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  const sidebarWidth = collapsed ? 72 : 240;

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar collapsed={collapsed} onCollapse={setCollapsed} />
      <div
        style={{ marginLeft: `${sidebarWidth}px` }}
        className="transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
      >
        {/* Pass collapsed + onCollapse so header can show the toggle button */}
        <Header sidebarWidth={sidebarWidth} collapsed={collapsed} onCollapse={setCollapsed} />
        <main className="pt-16">
          {children}
        </main>
      </div>
    </div>
  );
}