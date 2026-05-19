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

// ── Single user row ─────────────────────────────────────────────────────────
function UserRow({ user, index }: { user: User; index: number }) {
  const isActive    = user.status?.toLowerCase() === 'active';
  const avatarStyle = AVATAR_COLORS[index % AVATAR_COLORS.length];
  const roleKey     = user.role?.toLowerCase() ?? 'user';
  const roleConfig  = ROLE_CONFIG[roleKey] ?? ROLE_CONFIG.user;

  return (
    <div
      className="flex flex-col sm:grid items-start sm:items-center px-3 md:px-5 py-3 md:py-3.5 transition-colors duration-150 hover:bg-gray-50/80 gap-2 sm:gap-0"
      style={{
        gridTemplateColumns: '1fr auto auto auto',
        borderBottom: '1px solid #f5f5f5',
        animation: `userRowIn 0.35s ease ${index * 60 + 100}ms both`,
      }}
    >
      {/* User info */}
      <div className="flex items-center gap-2 md:gap-3 min-w-0 w-full">
        <div
          className="w-9 md:w-10 h-9 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center text-white font-black text-[9px] md:text-xs flex-shrink-0 overflow-hidden"
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
          <p className="text-[11px] md:text-[13px] font-bold text-gray-900 truncate leading-tight">{user.name}</p>
          <p className="text-[9px] md:text-[11px] text-gray-400 truncate mt-0.5">{user.email}</p>
        </div>
      </div>

      {/* Joined — hidden on mobile */}
      <div className="hidden sm:flex flex-shrink-0">
        <p className="text-[10px] md:text-[11px] font-semibold text-gray-500 whitespace-nowrap">{formatDate(user.createdAt)}</p>
      </div>

      {/* Role */}
      <div className="hidden sm:flex flex-shrink-0">
        <span
          className="inline-flex items-center text-[9px] md:text-[10px] font-bold px-2 md:px-2.5 py-0.5 md:py-1 rounded-lg md:rounded-lg capitalize whitespace-nowrap"
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
          className="inline-flex items-center gap-1 text-[9px] md:text-[10px] font-bold px-2 md:px-2.5 py-0.5 md:py-1 rounded-full whitespace-nowrap"
          style={
            isActive
              ? { background: '#f0faf4', color: '#15803d', border: '1px solid #d1fae5' }
              : { background: '#f9fafb', color: '#6b7280', border: '1px solid #e5e7eb' }
          }
        >
          <span
            className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full"
            style={{
              background: isActive ? '#22c55e' : '#d1d5db',
              animation: isActive ? 'livePulse 2s ease-in-out infinite' : 'none',
            }}
          />
          <span className="hidden sm:inline">{isActive ? 'Active' : 'Inactive'}</span>
        </span>
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
        className="bg-white rounded-lg md:rounded-2xl overflow-hidden w-full"
        style={{
          border: '1px solid #f0f0f0',
          boxShadow: '0 4px 24px rgba(0,0,0,0.05), 0 1px 4px rgba(0,0,0,0.03)',
          animation: 'fadeUp 0.45s ease both',
        }}
      >

        {/* ── Card Header ─────────────────────────────────────── */}
        <div
          className="px-3 md:px-6 py-3 md:py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 md:gap-3"
          style={{ borderBottom: '1px solid #f5f5f5' }}
        >
          <div className="flex items-center gap-2 md:gap-3 min-w-0">
            {/* Spinning ring icon — matches other cards */}
            <div className="relative">
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
                className="w-8 md:w-10 h-8 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: 'linear-gradient(135deg, #1a5c3a, #0f3d26)',
                  boxShadow: '0 4px 12px rgba(26,92,58,0.3)',
                }}
              >
                <Icons.users size={15} className="md:hidden text-white" />
                <Icons.users size={17} className="hidden md:block text-white" />
              </div>
            </div>

            <div className="min-w-0">
              <h3 className="text-xs md:text-[15px] font-black text-gray-900 tracking-tight leading-none">
                Users Directory
              </h3>
              <div className="flex items-center gap-1.5 mt-0.5 md:mt-1">
                <span
                  className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full flex-shrink-0"
                  style={{ background: '#22c55e', animation: 'livePulse 2s ease-in-out infinite' }}
                />
                <p className="text-[9px] md:text-[11px] text-gray-400 font-medium truncate">Live · {users.length} total</p>
              </div>
            </div>
          </div>

          {/* Summary pills — responsive */}
          {!loading && users.length > 0 && (
            <div className="flex items-center gap-1.5 md:gap-2 flex-shrink-0">
              <div
                className="flex items-center gap-1 px-2 md:px-3 py-1 md:py-1.5 rounded-lg md:rounded-xl"
                style={{ background: '#f0faf4', border: '1px solid #d1fae5' }}
              >
                <span className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full flex-shrink-0" style={{ background: '#22c55e' }} />
                <span className="text-[9px] md:text-[11px] font-black" style={{ color: '#1a5c3a' }}>
                  {activeCount}
                </span>
              </div>
              <div
                className="flex items-center gap-1 px-2 md:px-3 py-1 md:py-1.5 rounded-lg md:rounded-xl"
                style={{ background: '#f9fafb', border: '1px solid #e5e7eb' }}
              >
                <span className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full flex-shrink-0 bg-gray-300" />
                <span className="text-[9px] md:text-[11px] font-black text-gray-500">
                  {users.length - activeCount}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ── Table column headers — hidden on mobile ─────────────────────────────── */}
        {!loading && !error && users.length > 0 && (
          <div
            className="hidden sm:grid items-center px-3 md:px-5 py-2.5"
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
                className="flex items-center gap-3 px-3 md:px-5 py-3 md:py-3.5 animate-pulse"
              >
                <div className="w-9 md:w-10 h-9 md:h-10 rounded-lg md:rounded-xl bg-gray-100 flex-shrink-0" />
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="h-2.5 md:h-3 w-24 md:w-28 bg-gray-100 rounded-full" />
                  <div className="h-2 md:h-2.5 w-32 md:w-36 bg-gray-100 rounded-full" />
                </div>
                <div className="hidden sm:block h-2.5 w-12 bg-gray-100 rounded-full flex-shrink-0" />
              </div>
            ))}
          </div>
        )}

        {/* ── Error state ──────────────────────────────────────── */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-10 md:py-14 text-center px-4 md:px-6">
            <div
              className="w-10 md:w-12 h-10 md:h-12 rounded-lg md:rounded-2xl flex items-center justify-center mb-2 md:mb-3"
              style={{ background: '#fef2f2', border: '1px solid #fecaca' }}
            >
              <Icons.alertCircle size={20} className="md:hidden" style={{ color: '#ef4444' }} />
              <Icons.alertCircle size={22} className="hidden md:block" style={{ color: '#ef4444' }} />
            </div>
            <p className="text-xs md:text-sm font-bold text-gray-700 mb-0.5 md:mb-1">Failed to load users</p>
            <p className="text-[10px] md:text-xs text-gray-400 mb-3 md:mb-4 max-w-xs">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl text-xs md:text-xs font-bold transition-all hover:opacity-80"
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
          <div className="flex flex-col items-center justify-center py-10 md:py-14 text-center px-4 md:px-6">
            <div
              className="w-10 md:w-12 h-10 md:h-12 rounded-lg md:rounded-2xl flex items-center justify-center mb-2 md:mb-3"
              style={{ background: '#f0faf4', border: '1px solid #d1fae5' }}
            >
              <Icons.users size={20} className="md:hidden" style={{ color: '#d1fae5' }} />
              <Icons.users size={22} className="hidden md:block" style={{ color: '#d1fae5' }} />
            </div>
            <p className="text-xs md:text-sm font-bold text-gray-500">No users found</p>
            <p className="text-[10px] md:text-xs text-gray-400 mt-0.5 md:mt-1">Add team members to get started.</p>
          </div>
        )}

        {/* ── User rows ────────────────────────────────────────── */}
        {!loading && !error && users.length > 0 && (
          <div>
            {preview.map((user, i) => (
              <UserRow key={user._id} user={user} index={i} />
            ))}
          </div>
        )}

        {/* ── Footer ───────────────────────────────────────────── */}
        {!loading && !error && users.length > 0 && (
          <div
            className="px-3 md:px-5 py-3 md:py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 md:gap-0"
            style={{ borderTop: '1px solid #f5f5f5', background: '#fafafa' }}
          >
            <p className="text-[9px] md:text-[11px] text-gray-400 font-medium">
              Showing{' '}
              <span className="font-black text-gray-700">{Math.min(5, users.length)}</span>
              {' '}of{' '}
              <span className="font-black text-gray-700">{users.length}</span>
            </p>

            {users.length > 5 ? (
              <button
                onClick={() => router.push('/all-users')}
                className="flex items-center gap-1.5 text-[10px] md:text-[11px] font-bold px-2.5 md:px-3 py-1 md:py-1.5 rounded-lg md:rounded-xl transition-all duration-200 hover:opacity-80 w-full sm:w-auto justify-center sm:justify-start"
                style={{
                  background: 'linear-gradient(135deg, #1a5c3a, #0f3d26)',
                  color: 'white',
                  boxShadow: '0 3px 10px rgba(26,92,58,0.3)',
                }}
              >
                View All Users
                <Icons.arrowUpRight size={10} className="md:hidden" />
                <Icons.arrowUpRight size={11} className="hidden md:block" />
              </button>
            ) : (
              <div className="flex items-center gap-1.5">
                <span
                  className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full flex-shrink-0"
                  style={{ background: '#22c55e', animation: 'livePulse 2s ease-in-out infinite' }}
                />
                <span className="text-[9px] md:text-[10px] text-gray-400 font-semibold">Live sync</span>
              </div>
            )}
          </div>
        )}

      </div>
    </>
  );
}