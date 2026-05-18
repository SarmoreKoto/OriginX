'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Icons, IconName } from './icons';

interface MenuItem {
  icon: string;
  label: string;
  href: string;
  active?: boolean;
  badge?: string;
}

interface TooltipState {
  visible: boolean;
  y: number;
  label: string;
  badge?: string;
}

interface SidebarProps {
  collapsed: boolean;
  onCollapse: (val: boolean) => void;
}

const menuItems: MenuItem[] = [
  { icon: 'dashboard',  label: 'Dashboard',        href: '/home' },
  { icon: 'analytics',  label: 'Create Collection', href: '/createdatabase' },
  { icon: 'invoices',   label: 'Add Items',         href: '/additems' },
];

const featureItems: MenuItem[] = [
  { icon: 'collections', label: 'All Database', href: '/all-database' },
  { icon: 'documents',   label: 'All Collections',   href: '/all-records' },
  { icon: 'api',         label: 'All APIs',         href: '/all-apis' },
  { icon: 'usrs',         label: 'Users List',         href: '/all-users' },
];

const generalItems: MenuItem[] = [
  { icon: 'settings', label: 'Settings',  href: '/settings' },
  { icon: 'help',     label: 'Help Desk', href: '/help' },
  { icon: 'logout',   label: 'Log out',   href: '/logout' },
];

function FallbackIcon({ name, size, strokeWidth }: { name: string; size: number; strokeWidth: number }) {
  const s = { width: size, height: size, stroke: 'currentColor', strokeWidth, fill: 'none' } as React.SVGProps<SVGSVGElement>;
  if (name === 'collections') return (
    <svg {...s} viewBox="0 0 18 18">
      <rect x="2" y="3" width="14" height="3" rx="1.2" fill="currentColor" opacity="0.9" />
      <rect x="2" y="8" width="14" height="3" rx="1.2" fill="currentColor" opacity="0.65" />
      <rect x="2" y="13" width="9" height="3" rx="1.2" fill="currentColor" opacity="0.4" />
    </svg>
  );
  if (name === 'documents') return (
    <svg {...s} viewBox="0 0 18 18">
      <rect x="3" y="1" width="10" height="13" rx="1.5" stroke="currentColor" strokeWidth={strokeWidth} />
      <path d="M5 5h6M5 8h6M5 11h4" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
      <path d="M11 1v4h4" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
  if (name === 'api') return (
    <svg {...s} viewBox="0 0 18 18">
      <path d="M3 9h12M9 3l6 6-6 6" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
  return null;
}

interface MenuSectionProps {
  title: string;
  items: MenuItem[];
  collapsed: boolean;
  onTooltip: (state: TooltipState) => void;
  activePath: string;
}

function MenuSection({ title, items, collapsed, onTooltip, activePath }: MenuSectionProps) {
  return (
    <div className="mb-2">
      {!collapsed && (
        <p className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 mt-3">{title}</p>
      )}
      {collapsed && <div className="border-t border-gray-100 dark:border-gray-800 my-2 mx-2" />}
      <nav className="space-y-0.5">
        {items.map((item) => {
          const Icon = Icons[item.icon as IconName];
          const isActive = activePath === item.href;

          const linkClass = [
            'flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
            collapsed ? 'justify-center' : '',
            isActive
              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
              : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-gray-100',
          ].join(' ');

          const iconClass = [
            'flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg transition-all',
            isActive ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-200 dark:shadow-emerald-900' : 'text-inherit',
          ].join(' ');

          const badgeClass = [
            'text-[10px] font-semibold px-2 py-0.5 rounded-full',
            isActive
              ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400'
              : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
          ].join(' ');

          return (
            <div
              key={item.label}
              onMouseEnter={(e) => {
                if (!collapsed) return;
                const rect = e.currentTarget.getBoundingClientRect();
                onTooltip({ visible: true, y: rect.top + rect.height / 2, label: item.label, badge: item.badge });
              }}
              onMouseLeave={() => onTooltip({ visible: false, y: 0, label: '' })}
            >
              <a href={item.href} className={linkClass}>
                <div className={iconClass}>
                  {Icon
                    ? <Icon size={17} strokeWidth={isActive ? 2.5 : 2} />
                    : <FallbackIcon name={item.icon} size={17} strokeWidth={isActive ? 2.5 : 2} />
                  }
                </div>
                {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                {!collapsed && item.badge && <span className={badgeClass}>{item.badge}</span>}
              </a>
            </div>
          );
        })}
      </nav>
    </div>
  );
}

export default function Sidebar({ collapsed, onCollapse }: SidebarProps) {
  const pathname = usePathname(); // ← automatically reflects current route
  const [darkMode, setDarkMode] = useState(false);
  const [tooltip, setTooltip] = useState<TooltipState>({ visible: false, y: 0, label: '' });
  const [themeTooltipVisible, setThemeTooltipVisible] = useState(false);
  const [themeTooltipY, setThemeTooltipY] = useState(0);

  function handleCollapse() { onCollapse(!collapsed); setTooltip({ visible: false, y: 0, label: '' }); }
  function toggleTheme() { setDarkMode((p) => !p); document.documentElement.classList.toggle('dark'); }

  const sidebarWidth = collapsed ? '72px' : '240px';

  const toggleButtonClass = ['w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl text-sm font-medium transition-all', 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/60', 'hover:text-gray-900 dark:hover:text-gray-100', collapsed ? 'justify-center' : ''].join(' ');
  const toggleTrackClass = ['w-9 h-5 rounded-full relative transition-colors duration-300 flex-shrink-0', darkMode ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-700'].join(' ');
  const toggleThumbClass = ['absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-300', darkMode ? 'translate-x-4' : 'translate-x-0.5'].join(' ');

  return (
    <div>
      <aside style={{ width: sidebarWidth }} className="bg-white dark:bg-gray-950 h-screen fixed left-0 top-0 flex flex-col border-r border-gray-100 dark:border-gray-800/80 z-50 transition-all duration-300 overflow-hidden">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-4 py-[18px] border-b border-gray-100 dark:border-gray-800/80 min-h-[64px] flex-shrink-0">
          <div className="w-[34px] h-[34px] bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-[10px] flex items-center justify-center flex-shrink-0 shadow-md shadow-emerald-200 dark:shadow-emerald-900/50">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
          </div>
          {!collapsed && <span className="text-[17px] font-bold text-gray-900 dark:text-white tracking-tight whitespace-nowrap">Oripio</span>}
          {!collapsed && (
            <button onClick={handleCollapse} className="ml-auto w-7 h-7 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-emerald-500 hover:border-emerald-500 hover:text-white text-gray-400 dark:text-gray-500 flex items-center justify-center transition-all duration-200 flex-shrink-0">
              <Icons.chevronLeft size={13} strokeWidth={2.5} />
            </button>
          )}
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <MenuSection title="Main Menu" items={menuItems} collapsed={collapsed} onTooltip={setTooltip} activePath={pathname} />
          <MenuSection title="Features"  items={featureItems} collapsed={collapsed} onTooltip={setTooltip} activePath={pathname} />
          <MenuSection title="General"   items={generalItems} collapsed={collapsed} onTooltip={setTooltip} activePath={pathname} />
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 dark:border-gray-800/80 px-2 py-2 flex-shrink-0">
          <div onMouseEnter={(e) => { if (!collapsed) return; const r = e.currentTarget.getBoundingClientRect(); setThemeTooltipY(r.top + r.height / 2); setThemeTooltipVisible(true); }} onMouseLeave={() => setThemeTooltipVisible(false)}>
            <button onClick={toggleTheme} className={toggleButtonClass}>
              <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                {darkMode ? <Icons.sun size={17} strokeWidth={2} /> : <Icons.moon size={17} strokeWidth={2} />}
              </div>
              {!collapsed && <span className="flex-1 text-left">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>}
              {!collapsed && <div className={toggleTrackClass}><div className={toggleThumbClass} /></div>}
            </button>
          </div>
          {!collapsed && <p className="text-[10px] text-gray-400 dark:text-gray-600 text-center mt-1 pb-1 tracking-wide">Oripio v2.4.1 · © {new Date().getFullYear()}</p>}
        </div>
      </aside>

      {/* Tooltips */}
      {collapsed && tooltip.visible && (
        <div className="fixed z-[9999] pointer-events-none" style={{ left: '80px', top: tooltip.y, transform: 'translateY(-50%)' }}>
          <div className="relative bg-gray-900 dark:bg-gray-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-xl whitespace-nowrap flex items-center gap-2">
            <div className="absolute right-full top-1/2 -translate-y-1/2 border-[5px] border-transparent border-r-gray-900 dark:border-r-gray-700" />
            <span>{tooltip.label}</span>
            {tooltip.badge && <span className="bg-emerald-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">{tooltip.badge}</span>}
          </div>
        </div>
      )}
      {collapsed && themeTooltipVisible && (
        <div className="fixed z-[9999] pointer-events-none" style={{ left: '80px', top: themeTooltipY, transform: 'translateY(-50%)' }}>
          <div className="relative bg-gray-900 dark:bg-gray-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-xl whitespace-nowrap">
            <div className="absolute right-full top-1/2 -translate-y-1/2 border-[5px] border-transparent border-r-gray-900 dark:border-r-gray-700" />
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </div>
        </div>
      )}
    </div>
  );
}