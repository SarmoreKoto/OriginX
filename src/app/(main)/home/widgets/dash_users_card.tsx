'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icons } from '@/resources/icons';
import { getUsers } from '@/handler/user_handler';

// ── Avatar gradients (kept vibrant for user identity) ──────────────────────
const AVATAR_COLORS = [
  { bg: 'linear-gradient(135deg, #1a5c3a, #22c55e)', solid: '#1a5c3a' },
  { bg: 'linear-gradient(135deg, #0f766e, #2dd4bf)', solid: '#0f766e' },
  { bg: 'linear-gradient(135deg, #065f46, #34d399)', solid: '#065f46' },
  { bg: 'linear-gradient(135deg, #334155, #94a3b8)', solid: '#334155' },
  { bg: 'linear-gradient(135deg, #1e40af, #60a5fa)', solid: '#1e40af' },
  { bg: 'linear-gradient(135deg, #7c3aed, #a78bfa)', solid: '#7c3aed' },
  { bg: 'linear-gradient(135deg, #be185d, #fb7185)', solid: '#be185d' },
  { bg: 'linear-gradient(135deg, #b45309, #fcd34d)', solid: '#b45309' },
];

// ── Role config — using inline styles to match green theme ─────────────────
const ROLE_CONFIG: Record<string, { color: string; bg: string; border: string }> = {
  admin:     { color: '#92400e', bg: '#fffbeb', border: '#fde68a' },
  moderator: { color: '#1a5c3a', bg: '#f0faf4', border: '#d1fae5' },
  user:      { color: '#374151', bg: '#f9fafb', border: '#e5e7eb' },
  editor:    { color: '#1e40af', bg: '#eff6ff', border: '#bfdbfe' },
};

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  status: string;
  avatar?: string;
  createdAt?: string;
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
}

function formatDate(iso?: string) {
  if (!iso) return '—';
  const date     = new Date(iso);
  const now      = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0)  return 'Today';
  if (diffDays === 1)  return 'Yesterday';
  if (diffDays < 7)   return `${diffDays}d ago`;
  if (diffDays < 30)  return `${Math.floor(diffDays / 7)}w ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ── Desktop user row ────────────────────────────────────────────────────────
function UserRowDesktop({ user, index }: { user: User; index: number }) {
  const isActive    = user.status?.toLowerCase() === 'active';
  const avatarStyle = AVATAR_COLORS[index % AVATAR_COLORS.length];
  const roleKey     = user.role?.toLowerCase() ?? 'user';
  const roleConfig  = ROLE_CONFIG[roleKey] ?? ROLE_CONFIG.user;

  return (
    <div
      className="hidden md:grid items-center px-5 py-3.5 transition-colors duration-150 hover:bg-gray-50/80"
      style={{
        gridTemplateColumns: '1fr auto auto auto',
        gap: '12px',
        borderBottom: '1px solid #f5f5f5',
        animation: `userRowIn 0.35s ease ${index * 60 + 100}ms both`,
      }}
    >
      {/* User info */}
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-xs flex-shrink-0 overflow-hidden"
          style={{
            background: user.avatar ? 'transparent' : avatarStyle.bg,
            boxShadow: '0 3px 8px rgba(0,0,0,0.12)',
          }}
        >
          {user.avatar
            ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            : getInitials(user.name)
          }
        </div>
        <div className="min-w-0">
          <p className="text-[13px] font-bold text-gray-900 truncate leading-tight">{user.name}</p>
          <p className="text-[11px] text-gray-400 truncate mt-0.5">{user.email}</p>
        </div>
      </div>

      {/* Joined */}
      <div className="flex-shrink-0">
        <p className="text-[11px] font-semibold text-gray-500 whitespace-nowrap">{formatDate(user.createdAt)}</p>
      </div>

      {/* Role */}
      <div className="flex-shrink-0">
        <span
          className="inline-flex items-center text-[10px] font-bold px-2.5 py-1 rounded-lg capitalize whitespace-nowrap"
          style={{
            background: roleConfig.bg,
            color: roleConfig.color,
            border: `1px solid ${roleConfig.border}`,
          }}
        >
          {user.role}
        </span>
      </div>

      {/* Status */}
      <div className="flex-shrink-0">
        <span
          className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap"
          style={
            isActive
              ? { background: '#f0faf4', color: '#15803d', border: '1px solid #d1fae5' }
              : { background: '#f9fafb', color: '#6b7280', border: '1px solid #e5e7eb' }
          }
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{
              background: isActive ? '#22c55e' : '#d1d5db',
              animation: isActive ? 'livePulse 2s ease-in-out infinite' : 'none',
            }}
          />
          {isActive ? 'Active' : 'Inactive'}
        </span>
      </div>
    </div>
  );
}

// ── Mobile user card ────────────────────────────────────────────────────────
function UserCardMobile({ user, index }: { user: User; index: number }) {
  const isActive    = user.status?.toLowerCase() === 'active';
  const avatarStyle = AVATAR_COLORS[index % AVATAR_COLORS.length];
  const roleKey     = user.role?.toLowerCase() ?? 'user';
  const roleConfig  = ROLE_CONFIG[roleKey] ?? ROLE_CONFIG.user;
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="md:hidden"
      style={{
        animation: `userRowIn 0.35s ease ${index * 60 + 100}ms both`,
      }}
    >
      {/* Mobile card */}
      <div
        className="px-4 py-3 border-b border-gray-100 transition-colors duration-150 active:bg-gray-50/80"
      >
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-xs flex-shrink-0 overflow-hidden"
              style={{
                background: user.avatar ? 'transparent' : avatarStyle.bg,
                boxShadow: '0 3px 8px rgba(0,0,0,0.12)',
              }}
            >
              {user.avatar
                ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                : getInitials(user.name)
              }
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-gray-900 truncate leading-tight">{user.name}</p>
              <p className="text-xs text-gray-400 truncate mt-0.5">{user.email}</p>
            </div>
          </div>

          {/* Status dot indicator */}
          <span
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{
              background: isActive ? '#22c55e' : '#d1d5db',
              animation: isActive ? 'livePulse 2s ease-in-out infinite' : 'none',
            }}
          />
        </div>

        {/* Compact info row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-lg capitalize whitespace-nowrap"
              style={{
                background: roleConfig.bg,
                color: roleConfig.color,
                border: `1px solid ${roleConfig.border}`,
              }}
            >
              {user.role}
            </span>
            <span
              className="text-[10px] font-semibold text-gray-500 whitespace-nowrap"
            >
              {formatDate(user.createdAt)}
            </span>
          </div>

          {/* Expand toggle */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 text-gray-400 transition-transform duration-200"
            style={{
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
            aria-label="Toggle details"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 6L8 10L4 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Expanded details */}
        {expanded && (
          <div
            className="mt-3 pt-3 border-t border-gray-100 space-y-2 text-xs"
            style={{
              animation: 'fadeUp 0.25s ease',
            }}
          >
            {user.phone && (
              <div className="flex justify-between items-start">
                <span className="text-gray-500 font-medium">Phone</span>
                <span className="text-gray-700 font-semibold text-right">{user.phone}</span>
              </div>
            )}
            <div className="flex justify-between items-start">
              <span className="text-gray-500 font-medium">Status</span>
              <span
                className="inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-full"
                style={
                  isActive
                    ? { background: '#f0faf4', color: '#15803d', border: '1px solid #d1fae5' }
                    : { background: '#f9fafb', color: '#6b7280', border: '1px solid #e5e7eb' }
                }
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    background: isActive ? '#22c55e' : '#d1d5db',
                  }}
                />
                {isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────
export default function UsersDirectory() {
  const router = useRouter();
  const [users, setUsers]     = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    (async () => {
      try {
        const data = await getUsers();
        const list = Array.isArray(data) ? data : data.data ?? [];
        setUsers(list);
      } catch (err: any) {
        setError(err?.message || 'Failed to load users');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const preview      = users.slice(0, 5);
  const activeCount  = users.filter(u => u.status?.toLowerCase() === 'active').length;

  return (
    <>
      <style>{`
        @keyframes userRowIn {
          from { opacity: 0; transform: translateX(10px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes livePulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(1.35); }
        }
        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div
        className="bg-white rounded-2xl overflow-hidden mx-auto max-w-full"
        style={{
          border: '1px solid #f0f0f0',
          boxShadow: '0 4px 24px rgba(0,0,0,0.05), 0 1px 4px rgba(0,0,0,0.03)',
          animation: 'fadeUp 0.45s ease both',
        }}
      >

        {/* ── Card Header ─────────────────────────────────────── */}
        <div
          className="px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          style={{ borderBottom: '1px solid #f5f5f5' }}
        >
          <div className="flex items-center gap-3 min-w-0">
            {/* Spinning ring icon — matches other cards */}
            <div className="relative flex-shrink-0">
              <div
                aria-hidden
                className="absolute rounded-full pointer-events-none"
                style={{
                  inset: -4,
                  border: '1.5px dashed rgba(26,92,58,0.25)',
                  borderRadius: '50%',
                  animation: 'spinSlow 10s linear infinite',
                }}
              />
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #1a5c3a, #0f3d26)',
                  boxShadow: '0 4px 12px rgba(26,92,58,0.3)',
                }}
              >
                <Icons.users size={17} className="text-white" />
              </div>
            </div>

            <div className="min-w-0">
              <h3 className="text-sm sm:text-[15px] font-black text-gray-900 tracking-tight leading-none">
                Users Directory
              </h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: '#22c55e', animation: 'livePulse 2s ease-in-out infinite' }}
                />
                <p className="text-[10px] sm:text-[11px] text-gray-400 font-medium whitespace-nowrap">
                  Live · {users.length} {users.length === 1 ? 'user' : 'users'}
                </p>
              </div>
            </div>
          </div>

          {/* Summary pills — stack on mobile, row on desktop */}
          {!loading && users.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl text-[10px] sm:text-[11px]"
                style={{ background: '#f0faf4', border: '1px solid #d1fae5' }}
              >
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#22c55e' }} />
                <span className="font-black" style={{ color: '#1a5c3a' }}>
                  {activeCount} <span className="hidden sm:inline">Active</span>
                </span>
              </div>
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl text-[10px] sm:text-[11px]"
                style={{ background: '#f9fafb', border: '1px solid #e5e7eb' }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-gray-300 flex-shrink-0" />
                <span className="font-black text-gray-500">
                  {users.length - activeCount} <span className="hidden sm:inline">Inactive</span>
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ── Table column headers (desktop only) ─────────────── */}
        {!loading && !error && users.length > 0 && (
          <div
            className="hidden md:grid items-center px-5 py-2.5"
            style={{
              gridTemplateColumns: '1fr auto auto auto',
              gap: '12px',
              background: '#fafafa',
              borderBottom: '1px solid #f0f0f0',
            }}
          >
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">User</span>
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Joined</span>
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Role</span>
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Status</span>
          </div>
        )}

        {/* ── Loading skeletons ───────────────────────────────── */}
        {loading && (
          <div className="divide-y divide-gray-50">
            {[1, 2, 3, 4, 5].map(i => (
              <div
                key={i}
                className="hidden md:grid items-center px-5 py-3.5 animate-pulse"
                style={{ gridTemplateColumns: '1fr auto auto auto', gap: '12px' }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex-shrink-0" />
                  <div className="space-y-1.5">
                    <div className="h-3 w-28 bg-gray-100 rounded-full" />
                    <div className="h-2.5 w-36 bg-gray-100 rounded-full" />
                  </div>
                </div>
                <div className="h-3 w-16 bg-gray-100 rounded-full" />
                <div className="h-5 w-16 bg-gray-100 rounded-lg" />
                <div className="h-5 w-14 bg-gray-100 rounded-full" />
              </div>
            ))}
            {/* Mobile skeleton */}
            {[1, 2, 3, 4, 5].map(i => (
              <div
                key={i}
                className="md:hidden px-4 py-3 animate-pulse border-b border-gray-100"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex-shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-3 w-32 bg-gray-100 rounded-full" />
                    <div className="h-2.5 w-40 bg-gray-100 rounded-full" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="h-5 w-14 bg-gray-100 rounded-lg" />
                  <div className="h-5 w-12 bg-gray-100 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Error state ──────────────────────────────────────── */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-10 sm:py-14 text-center px-4 sm:px-6">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
              style={{ background: '#fef2f2', border: '1px solid #fecaca' }}
            >
              <Icons.alertCircle size={22} style={{ color: '#ef4444' }} />
            </div>
            <p className="text-sm font-bold text-gray-700 mb-1">Failed to load users</p>
            <p className="text-xs text-gray-400 mb-4 max-w-xs">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-xl text-xs font-bold transition-all active:opacity-75 hover:opacity-80"
              style={{
                background: 'linear-gradient(135deg, #1a5c3a, #0f3d26)',
                color: 'white',
                boxShadow: '0 3px 10px rgba(26,92,58,0.3)',
              }}
            >
              Try Again
            </button>
          </div>
        )}

        {/* ── Empty state ──────────────────────────────────────── */}
        {!loading && !error && users.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 sm:py-14 text-center px-4 sm:px-6">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
              style={{ background: '#f0faf4', border: '1px solid #d1fae5' }}
            >
              <Icons.users size={22} style={{ color: '#d1fae5' }} />
            </div>
            <p className="text-sm font-bold text-gray-500">No users found</p>
            <p className="text-xs text-gray-400 mt-1">Add team members to get started.</p>
          </div>
        )}

        {/* ── User rows (desktop) & cards (mobile) ──────────────── */}
        {!loading && !error && users.length > 0 && (
          <div>
            {preview.map((user, i) => (
              <div key={user._id}>
                <UserRowDesktop user={user} index={i} />
                <UserCardMobile user={user} index={i} />
              </div>
            ))}
          </div>
        )}

        {/* ── Footer ───────────────────────────────────────────── */}
        {!loading && !error && users.length > 0 && (
          <div
            className="px-4 sm:px-5 py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0"
            style={{ borderTop: '1px solid #f5f5f5', background: '#fafafa' }}
          >
            <p className="text-[10px] sm:text-[11px] text-gray-400 font-medium">
              Showing{' '}
              <span className="font-black text-gray-700">{Math.min(5, users.length)}</span>
              {' '}of{' '}
              <span className="font-black text-gray-700">{users.length}</span>
              {' '}users
            </p>

            {users.length > 5 ? (
              <button
                onClick={() => router.push('/all-users')}
                className="flex items-center justify-center sm:justify-start gap-1.5 w-full sm:w-auto text-[11px] font-bold px-3 py-2 sm:py-1.5 rounded-xl transition-all duration-200 active:opacity-75 hover:opacity-80"
                style={{
                  background: 'linear-gradient(135deg, #1a5c3a, #0f3d26)',
                  color: 'white',
                  boxShadow: '0 3px 10px rgba(26,92,58,0.3)',
                }}
              >
                View All Users
                <Icons.arrowUpRight size={11} />
              </button>
            ) : (
              <div className="flex items-center justify-center sm:justify-start gap-1.5">
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: '#22c55e', animation: 'livePulse 2s ease-in-out infinite' }}
                />
                <span className="text-[9px] sm:text-[9px] text-gray-400 font-semibold">Live sync</span>
              </div>
            )}
          </div>
        )}

      </div>
    </>
  );
}