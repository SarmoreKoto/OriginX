'use client';

import { Icons } from './icons';
import Image from 'next/image';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  sidebarWidth: number;
  collapsed: boolean;
  onCollapse: (val: boolean) => void;
}

export default function Header({ sidebarWidth, collapsed, onCollapse }: HeaderProps) {
  const [userName, setUserName]         = useState('');
  const [userAvatar, setUserAvatar]     = useState('');
  const [userRole, setUserRole]         = useState('');
  const [userEmail, setUserEmail]       = useState('');
  const [userPhone, setUserPhone]       = useState('');
  const [currentDate, setCurrentDate]   = useState('');
  const [dayName, setDayName]           = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    setUserName(localStorage.getItem('name')     || '');
    setUserAvatar(localStorage.getItem('avatar') || '');
    setUserRole(localStorage.getItem('role')     || '');
    setUserEmail(localStorage.getItem('email')   || '');
    setUserPhone(localStorage.getItem('phone')   || '');

    const now = new Date();
    setDayName(now.toLocaleDateString('en-US', { weekday: 'long' }));
    setCurrentDate(now.toLocaleDateString('en-US', {
      day: '2-digit', month: 'long', year: 'numeric',
    }));
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initials = userName
    ? userName.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

  const handleAccountSettings = () => {
    setDropdownOpen(false);
    router.push('/user_profile');
  };

  const handleLogout = () => {
    setDropdownOpen(false);
    localStorage.clear();
    document.cookie = 'fcm_token=; path=/; max-age=0';
    router.push('/authentication/login');
  };

  return (
    <header
      className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 fixed top-0 right-0 z-40 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
      style={{
        left: `${sidebarWidth}px`,
        boxShadow: '0 1px 0 0 #f3f4f6, 0 2px 8px 0 rgba(16,24,40,0.04)',
      }}
    >
      {/* Left side */}
      <div className="flex items-center gap-3">

        {/* Expand button — only visible when sidebar is collapsed */}
        {collapsed && (
          <button
            onClick={() => onCollapse(false)}
            className="w-8 h-8 rounded-lg border border-gray-200 bg-gray-50 hover:bg-emerald-500 hover:border-emerald-500 hover:text-white text-gray-400 flex items-center justify-center transition-all duration-200 flex-shrink-0"
          >
            <Icons.chevronLeft size={13} strokeWidth={2.5} className="rotate-180" />
          </button>
        )}

        {/* Date pill */}
        <div className="flex items-center gap-2.5 rounded-2xl px-4 py-2">
          <div className="w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center shadow-sm">
            <Icons.calendar size={14} className="text-white" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-[10px] font-semibold text-emerald-500 uppercase tracking-widest">
              {dayName}
            </span>
            <span className="text-sm font-bold text-gray-800 mt-0.5">
              {currentDate}
            </span>
          </div>
        </div>
      </div>

      {/* Right: Actions + User */}
      <div className="flex items-center gap-2">

        {/* Notification bell */}
        <button className="relative w-9 h-9 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded-xl transition-all duration-200">
          <Icons.bell size={19} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
        </button>

        <div className="w-px h-6 bg-gray-200 mx-1" />

        {/* User avatar + dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2.5 pl-1 pr-3 py-1.5 rounded-2xl hover:bg-gray-50 transition-all duration-200"
          >
            <div className="relative">
              <div className="w-8 h-8 rounded-xl overflow-hidden border-2 border-emerald-100 bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-sm">
                {userAvatar ? (
                  <Image src={userAvatar} alt={userName} width={32} height={32} className="object-cover w-full h-full" />
                ) : (
                  <span className="text-xs font-bold text-white tracking-wide">{initials}</span>
                )}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white" />
            </div>
            <Icons.chevronDown
              size={14}
              className={['text-gray-400 transition-transform duration-200', dropdownOpen ? 'rotate-180' : ''].join(' ')}
            />
          </button>

          {/* Dropdown panel */}
          {dropdownOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl border border-gray-100 overflow-hidden z-50"
              style={{ boxShadow: '0 8px 32px rgba(16,24,40,0.12), 0 2px 8px rgba(16,24,40,0.06)' }}
            >
              <div className="h-14 bg-gradient-to-r from-emerald-500 to-teal-400 relative overflow-hidden">
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage:
                      'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)',
                    backgroundSize: '24px 24px',
                  }}
                />
              </div>

              <div className="px-5 pb-4">
                <div className="mt-7 mb-3 flex items-end justify-between">
                  <div className="absolute w-14 h-14 rounded-2xl border-4 border-white bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-md overflow-hidden">
                    {userAvatar ? (
                      <Image src={userAvatar} alt={userName} width={56} height={56} className="object-cover w-full h-full" />
                    ) : (
                      <span className="text-lg font-bold text-white">{initials}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center place-content-between">
                  <p className="text-base font-bold text-gray-900 leading-tight">
                    {userName || 'User'}
                  </p>
                  {userRole && (
                    <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full capitalize tracking-wide">
                      {userRole}
                    </span>
                  )}
                </div>

                <div className="mt-3 space-y-2">
                  {userEmail && (
                    <div className="flex items-center gap-2.5 text-sm text-gray-500">
                      <div className="w-6 h-6 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icons.feedback size={13} className="text-gray-400" />
                      </div>
                      <span className="truncate">{userEmail}</span>
                    </div>
                  )}
                  {userPhone && (
                    <div className="flex items-center gap-2.5 text-sm text-gray-500">
                      <div className="w-6 h-6 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icons.shield size={13} className="text-gray-400" />
                      </div>
                      <span>{userPhone}</span>
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-100 my-3" />

                <div className="space-y-0.5">
                  <button 
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors text-left"
                    onClick={handleAccountSettings}
                  >
                    <Icons.settings size={15} className="text-gray-400" />
                    Account Settings
                  </button>
                  <button
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors text-left"
                    onClick={handleLogout}
                  >
                    <Icons.logout size={15} className="text-red-400" />
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}