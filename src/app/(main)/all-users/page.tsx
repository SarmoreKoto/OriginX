"use client";

import { useState, useEffect, useCallback } from "react";
import { getUsers, registerUser } from "@/handler/user_handler";
import { apiHandler } from "@/handler/api_handler";
import { MetaApi } from "@/config/metaApi";

// ─── Types ────────────────────────────────────────────────────────────────────
interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  avatar?: string;
  createdAt?: string;
}

function initials(name: string) {
  return name.split(/[\s_\-]+/).map(n => n[0]).slice(0, 2).join('').toUpperCase();
}

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg,#1a5c3a,#22c55e)',
  'linear-gradient(135deg,#0f766e,#2dd4bf)',
  'linear-gradient(135deg,#1e40af,#60a5fa)',
  'linear-gradient(135deg,#7c3aed,#c084fc)',
  'linear-gradient(135deg,#be185d,#f472b6)',
  'linear-gradient(135deg,#b45309,#fbbf24)',
  'linear-gradient(135deg,#0369a1,#38bdf8)',
];
function avatarGradient(name: string) {
  let h = 0; for (const c of name) h = (h * 31 + c.charCodeAt(0)) & 0xffffff;
  return AVATAR_GRADIENTS[Math.abs(h) % AVATAR_GRADIENTS.length];
}

// ─── Add User Modal ───────────────────────────────────────────────────────────
function AddUserModal({ onSaved, onClose }: { onSaved: (user: User) => void; onClose: () => void }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', role: 'User', status: 'active' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const upd = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      setError('Name, email and password are required.'); return;
    }
    setError('');
    setSaving(true);
    const res = await registerUser(form);
    setSaving(false);
    if (!res.ok) { setError(res.data?.message || 'Failed to create user'); return; }
    onSaved({ _id: res.data?.message || Date.now().toString(), ...form });
  };

  const fields = [
    { key: 'name', label: 'Full Name', type: 'text', placeholder: 'John Doe' },
    { key: 'email', label: 'Email', type: 'email', placeholder: 'john@example.com' },
    { key: 'phone', label: 'Phone', type: 'text', placeholder: '+1 234 567 8900' },
    { key: 'password', label: 'Password', type: 'password', placeholder: '••••••••' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 md:p-0" onClick={onClose}>
      <div
        className="bg-white rounded-2xl md:rounded-3xl w-full max-w-[520px] max-h-[90vh] md:max-h-none flex flex-col overflow-hidden"
        style={{ border: '1.5px solid #d1fae5', boxShadow: '0 32px 80px rgba(26,92,58,0.22)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 md:px-7 py-5 md:py-6" style={{ background: 'linear-gradient(135deg,#1a5c3a,#0f3d26)' }}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
              <div className="w-9 md:w-10 h-9 md:h-10 rounded-xl md:rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 11a4 4 0 100-8 4 4 0 000 8zM6 21v-2a6 6 0 0112 0v2" stroke="white" strokeWidth="1.8" strokeLinecap="round" /><path d="M19 9v6M22 12h-6" stroke="#86efac" strokeWidth="1.8" strokeLinecap="round" /></svg>
              </div>
              <div className="min-w-0">
                <h3 className="text-xs md:text-base font-black text-white tracking-tight">Add New User</h3>
                <p className="text-[9px] md:text-xs text-green-300 mt-0.5">Fill in the details below</p>
              </div>
            </div>
            <button onClick={onClose} className="w-7 md:w-8 h-7 md:h-8 rounded-lg md:rounded-xl flex items-center justify-center text-green-300 hover:text-white hover:bg-white/10 transition-all flex-shrink-0">
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 md:p-7 overflow-y-auto flex-1" style={{ background: '#fafffe' }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            {fields.map(f => (
              <div key={f.key} className={f.key === 'name' || f.key === 'email' ? 'sm:col-span-2' : ''}>
                <label className="block text-[10px] md:text-[10px] font-black uppercase tracking-wider mb-1.5" style={{ color: '#6b7280' }}>{f.label}</label>
                <input
                  type={f.type}
                  value={(form as any)[f.key]}
                  onChange={e => upd(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  className="w-full border rounded-lg md:rounded-xl px-3 md:px-4 py-2 md:py-2.5 text-xs md:text-sm text-gray-800 outline-none transition-all bg-white"
                  style={{ borderColor: '#d1fae5' }}
                  onFocus={e => e.target.style.borderColor = '#22c55e'}
                  onBlur={e => e.target.style.borderColor = '#d1fae5'}
                />
              </div>
            ))}
            <div>
              <label className="block text-[10px] md:text-[10px] font-black uppercase tracking-wider mb-1.5" style={{ color: '#6b7280' }}>Role</label>
              <select
                value={form.role}
                onChange={e => upd('role', e.target.value)}
                className="w-full border rounded-lg md:rounded-xl px-3 md:px-4 py-2 md:py-2.5 text-xs md:text-sm text-gray-800 outline-none bg-white transition-all"
                style={{ borderColor: '#d1fae5' }}
                onFocus={e => e.target.style.borderColor = '#22c55e'}
                onBlur={e => e.target.style.borderColor = '#d1fae5'}
              >
                <option value="User">User</option>
                <option value="Admin">Admin</option>
                <option value="Manager">Manager</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] md:text-[10px] font-black uppercase tracking-wider mb-1.5" style={{ color: '#6b7280' }}>Status</label>
              <select
                value={form.status}
                onChange={e => upd('status', e.target.value)}
                className="w-full border rounded-lg md:rounded-xl px-3 md:px-4 py-2 md:py-2.5 text-xs md:text-sm text-gray-800 outline-none bg-white transition-all"
                style={{ borderColor: '#d1fae5' }}
                onFocus={e => e.target.style.borderColor = '#22c55e'}
                onBlur={e => e.target.style.borderColor = '#d1fae5'}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          {error && <p className="mt-3 md:mt-4 text-xs font-semibold text-red-500">{error}</p>}
        </div>

        {/* Footer */}
        <div className="px-4 md:px-7 py-3 md:py-5 flex gap-2 md:gap-3 flex-col-reverse sm:flex-row" style={{ borderTop: '1px solid #d1fae5', background: '#f0faf4' }}>
          <button onClick={onClose} className="flex-1 py-2.5 md:py-3 rounded-lg md:rounded-xl border text-xs md:text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-all" style={{ borderColor: '#d1fae5' }}>Cancel</button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2.5 md:py-3 rounded-lg md:rounded-xl text-white text-xs md:text-sm font-black transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg,#1a5c3a,#0f3d26)', boxShadow: '0 4px 14px rgba(26,92,58,0.35)' }}
          >
            {saving ? <svg className="animate-spin w-3 md:w-4 h-3 md:h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg> : '+ Create User'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────
function ConfirmDeleteModal({ userName, onConfirm, onCancel, deleting }: { userName: string; onConfirm: () => void; onCancel: () => void; deleting: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onCancel}>
      <div
        className="bg-white rounded-2xl md:rounded-3xl w-full max-w-[380px] p-5 md:p-8 flex flex-col items-center gap-4 md:gap-5"
        style={{ border: '1.5px solid #fecaca', boxShadow: '0 32px 80px rgba(239,68,68,0.18)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="w-14 md:w-16 h-14 md:h-16 rounded-2xl flex items-center justify-center" style={{ background: '#fef2f2', border: '2px solid #fecaca' }}>
          <svg width="24" height="24" viewBox="0 0 28 28" fill="none" className="text-red-500">
            <path d="M3.5 7h21M10.5 7V5.25A1.75 1.75 0 0112.25 3.5h3.5A1.75 1.75 0 0117.5 5.25V7M5.25 7l1.4 16.1A2.1 2.1 0 008.75 25h10.5a2.1 2.1 0 002.1-1.9L22.75 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="text-center">
          <h3 className="text-sm md:text-base font-black text-gray-900 mb-1">Delete User?</h3>
          <p className="text-xs md:text-sm text-gray-400">Remove <span className="font-bold text-gray-700">{userName}</span> permanently?</p>
          <p className="text-[10px] md:text-xs text-gray-300 mt-1">This action cannot be undone.</p>
        </div>
        <div className="flex gap-2 md:gap-3 w-full flex-col-reverse sm:flex-row mt-1">
          <button onClick={onCancel} className="flex-1 py-2.5 md:py-3 rounded-lg md:rounded-xl border text-xs md:text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-all" style={{ borderColor: '#d1fae5' }}>Cancel</button>
          <button onClick={onConfirm} disabled={deleting} className="flex-1 py-2.5 md:py-3 rounded-lg md:rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs md:text-sm font-black transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {deleting ? <svg className="animate-spin w-3 md:w-4 h-3 md:h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg> : 'Delete User'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Role Badge ───────────────────────────────────────────────────────────────
function RoleBadge({ role }: { role: string }) {
  const cfg: Record<string, { bg: string; color: string; border: string }> = {
    Admin:   { bg: '#fef9c3', color: '#854d0e', border: '#fde047' },
    Manager: { bg: '#ede9fe', color: '#5b21b6', border: '#c4b5fd' },
    User:    { bg: '#f0faf4', color: '#166534', border: '#d1fae5' },
  };
  const s = cfg[role] || cfg.User;
  return (
    <span className="px-2 py-0.5 rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-wider" style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      {role}
    </span>
  );
}

// ─── Status Toggle ────────────────────────────────────────────────────────────
function StatusToggle({ user, onChange }: { user: User; onChange: (u: User) => void }) {
  const [toggling, setToggling] = useState(false);
  const isActive = user.status === 'active';

  const toggle = async () => {
    setToggling(true);
    const newStatus = isActive ? 'inactive' : 'active';
    const res = await apiHandler({ url: MetaApi.getUserById(user._id), method: 'put', data: { status: newStatus } });
    setToggling(false);
    if (res.ok) onChange({ ...user, status: newStatus });
  };

  return (
    <button
      onClick={toggle}
      disabled={toggling}
      className="relative flex items-center gap-1.5 md:gap-2 transition-all group"
      title={`Click to ${isActive ? 'deactivate' : 'activate'}`}
    >
      <div
        className="w-8 md:w-9 h-4 md:h-5 rounded-full transition-all duration-300 relative flex-shrink-0"
        style={{
          background: isActive ? 'linear-gradient(135deg,#1a5c3a,#22c55e)' : '#e5e7eb',
          boxShadow: isActive ? '0 2px 8px rgba(34,197,94,0.35)' : 'none',
        }}
      >
        <div
          className="absolute top-0.5 w-3 md:w-4 h-3 md:h-4 rounded-full bg-white shadow-sm transition-all duration-300"
          style={{ left: isActive ? '16px' : '2px' }}
        />
        {toggling && (
          <div className="absolute inset-0 rounded-full flex items-center justify-center">
            <svg className="animate-spin w-2 md:w-3 h-2 md:h-3 text-white" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>
          </div>
        )}
      </div>
      <span className="text-[9px] md:text-[10px] font-black uppercase tracking-wider" style={{ color: isActive ? '#15803d' : '#9ca3af' }}>
        {isActive ? 'Active' : 'Inactive'}
      </span>
    </button>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [showAdd, setShowAdd] = useState(false);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getUsers();
      setUsers(Array.isArray(data) ? data : data?.data ?? data?.users ?? []);
    } catch { setError('Failed to load users'); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async () => {
    if (!deleteUser) return;
    setDeleting(true);
    await apiHandler({ url: MetaApi.getUserById(deleteUser._id), method: 'delete' });
    setDeleting(false);
    setUsers(prev => prev.filter(u => u._id !== deleteUser._id));
    setDeleteUser(null);
  };

  const filtered = users.filter(u => {
    const matchSearch = !search || [u.name, u.email, u.phone, u.role].some(v => v?.toLowerCase().includes(search.toLowerCase()));
    const matchRole = roleFilter === 'All' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    admin: users.filter(u => u.role === 'Admin').length,
  };

  return (
    <>
      <style>{`
        @keyframes panelFade { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes livePulse { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.5; transform:scale(1.4); } }
        @keyframes rowIn     { from { opacity:0; transform:translateX(-8px); } to { opacity:1; transform:translateX(0); } }
      `}</style>

      <div className="min-h-screen font-sans" style={{ background: 'linear-gradient(135deg,#f4f6fb 0%,#f0fdf4 100%)' }}>

        {/* Error toast */}
        {error && (
          <div className="fixed top-4 left-4 right-4 z-50 flex items-center gap-2 md:gap-3 px-3 md:px-5 py-2 md:py-3 bg-white shadow-lg rounded-lg md:rounded-xl text-xs md:text-sm" style={{ border: '1px solid #fecaca' }}>
            <span className="font-medium text-red-600 flex-1 line-clamp-2">{error}</span>
            <button onClick={() => setError('')} className="text-red-400 hover:text-red-600 text-lg leading-none flex-shrink-0">×</button>
          </div>
        )}

        <div className="p-4 md:p-6 max-w-7xl mx-auto">

          {/* ── Header ── */}
          <div className="flex items-start justify-between mb-5 md:mb-7 gap-3 flex-col sm:flex-row" style={{ animation: 'panelFade 0.4s ease both' }}>
            <div className="flex items-center gap-3 md:gap-4">
              <div className="relative hidden md:flex">
                <div className="absolute rounded-full pointer-events-none" style={{ inset: -4, border: '1.5px dashed rgba(26,92,58,0.25)', borderRadius: '50%' }} />
                <div className="w-10 md:w-12 h-10 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg,#1a5c3a,#0f3d26)', boxShadow: '0 6px 20px rgba(26,92,58,0.4)' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="white" strokeWidth="1.8" strokeLinecap="round" /><circle cx="9" cy="7" r="4" stroke="white" strokeWidth="1.8" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="#86efac" strokeWidth="1.8" strokeLinecap="round" /></svg>
                </div>
              </div>
              <div>
                <h1 className="text-lg md:text-2xl font-black text-gray-900 tracking-tight leading-none">User Management</h1>
                <div className="flex items-center gap-1.5 md:gap-2 mt-1">
                  <span className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full" style={{ background: '#22c55e', animation: 'livePulse 2s ease-in-out infinite' }} />
                  <p className="text-xs text-gray-400 font-medium">Manage team members, roles & access</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-2 md:gap-2.5 px-3 md:px-5 py-2.5 md:py-3 rounded-lg md:rounded-2xl text-white text-xs md:text-sm font-black transition-all hover:scale-105 active:scale-95 w-full sm:w-auto justify-center sm:justify-start"
              style={{ background: 'linear-gradient(135deg,#1a5c3a,#0f3d26)', boxShadow: '0 6px 20px rgba(26,92,58,0.4)' }}
            >
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M8 2v12M2 8h12" stroke="white" strokeWidth="2" strokeLinecap="round" /></svg>
              Add New User
            </button>
          </div>

          {/* ── Stat cards ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mb-4 md:mb-6" style={{ animation: 'panelFade 0.4s ease 0.08s both' }}>
            {[
              { label: 'Total Users', value: stats.total, icon: <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />, color: '#1a5c3a', bg: '#f0faf4', border: '#d1fae5' },
              { label: 'Active Users', value: stats.active, icon: <><circle cx="12" cy="12" r="3" fill="currentColor" /><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z" stroke="currentColor" strokeWidth="1.6" /></>, color: '#0f766e', bg: '#f0fdfa', border: '#ccfbf1' },
              { label: 'Admins', value: stats.admin, icon: <path d="M12 2l2.4 7.4H22l-6.2 4.5L18.2 21 12 16.5 5.8 21l2.4-7.1L2 9.4h7.6L12 2z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />, color: '#7c3aed', bg: '#faf5ff', border: '#e9d5ff' },
            ].map((s, i) => (
              <div key={i} className="rounded-lg md:rounded-2xl p-4 md:p-5 flex items-center gap-3 md:gap-4" style={{ background: 'white', border: `1.5px solid ${s.border}`, boxShadow: '0 4px 20px rgba(26,92,58,0.06)', animation: `panelFade 0.4s ease ${0.1 + i * 0.06}s both` }}>
                <div className="w-10 md:w-11 h-10 md:h-11 rounded-lg md:rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: s.bg }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ color: s.color }}>{s.icon}</svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xl md:text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-xs text-gray-400 font-semibold">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── Table card ── */}
          <div className="rounded-lg md:rounded-3xl overflow-hidden" style={{ background: 'white', border: '1.5px solid #d1fae5', boxShadow: '0 8px 40px rgba(26,92,58,0.1)', animation: 'panelFade 0.4s ease 0.2s both' }}>
            {/* Table toolbar */}
            <div className="px-4 md:px-6 py-3 md:py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 md:gap-4" style={{ background: 'linear-gradient(135deg,#f0faf4,#ecfdf5)', borderBottom: '1px solid #d1fae5' }}>
              <div className="flex items-center gap-2 md:gap-3">
                <span className="w-1 h-4 md:h-5 rounded-full block" style={{ background: 'linear-gradient(180deg,#1a5c3a,#22c55e)' }} />
                <span className="text-xs font-black uppercase tracking-widest text-gray-500">All Users</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black" style={{ background: 'white', color: '#15803d', border: '1px solid #d1fae5' }}>{filtered.length}</span>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 md:gap-3 w-full sm:w-auto">
                {/* Role filter - horizontal scroll on mobile */}
                <div className="flex gap-1 overflow-x-auto flex-nowrap">
                  {['All', 'Admin', 'Manager', 'User'].map(r => (
                    <button
                      key={r}
                      onClick={() => setRoleFilter(r)}
                      className="px-2.5 md:px-3 py-1.5 rounded-lg md:rounded-xl text-[10px] md:text-[11px] font-bold transition-all whitespace-nowrap flex-shrink-0"
                      style={{
                        background: roleFilter === r ? 'linear-gradient(135deg,#1a5c3a,#0f3d26)' : 'white',
                        color: roleFilter === r ? 'white' : '#6b7280',
                        border: `1px solid ${roleFilter === r ? '#0f3d26' : '#d1fae5'}`,
                      }}
                    >{r}</button>
                  ))}
                </div>
                {/* Search */}
                <div className="relative w-full sm:w-auto">
                  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#22c55e' }}>
                    <circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.4" />
                    <path d="M10 10l2.5 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search users…"
                    className="rounded-lg md:rounded-xl pl-8 pr-3 py-2 text-xs text-gray-700 placeholder-gray-400 outline-none transition-all w-full sm:w-48"
                    style={{ background: 'white', border: '1px solid #d1fae5' }}
                    onFocus={e => e.target.style.borderColor = '#22c55e'}
                    onBlur={e => e.target.style.borderColor = '#d1fae5'}
                  />
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-full">
                <thead>
                  <tr style={{ background: '#fafffe', borderBottom: '1px solid #f0faf4' }}>
                    {['S.No', 'User', 'Email', 'Phone', 'Role', 'Status', 'Actions'].map((h, i) => (
                      <th key={h} className={`px-3 md:px-5 py-2.5 md:py-3.5 text-[9px] font-black uppercase tracking-widest ${i === 6 ? 'text-right' : 'text-left'} ${i > 2 ? 'hidden md:table-cell' : ''}`} style={{ color: i === 5 ? '#0f766e' : '#9ca3af' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} style={{ borderTop: '1px solid #f0faf4' }}>
                        {Array.from({ length: 4 }).map((_, j) => (
                          <td key={j} className="px-3 md:px-5 py-3 md:py-4">
                            <div className="h-4 rounded-lg animate-pulse" style={{ background: '#f0faf4', width: j === 0 ? '40px' : j === 1 ? '160px' : '120px' }} />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 md:py-20 text-center px-4">
                        <div className="flex flex-col items-center gap-2 md:gap-3">
                          <div className="w-12 md:w-14 h-12 md:h-14 rounded-2xl flex items-center justify-center" style={{ background: '#f0faf4', border: '1.5px dashed #d1fae5' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ color: '#d1fae5' }}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.5" /></svg>
                          </div>
                          <p className="text-xs md:text-sm font-black text-gray-400">No users found</p>
                        </div>
                      </td>
                    </tr>
                  ) : filtered.map((user, i) => (
                    <tr
                      key={user._id}
                      className="group transition-all"
                      style={{ borderTop: '1px solid #f7fffe', animation: `rowIn 0.3s ease ${i * 0.04}s both` }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f7fffe'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      {/* S.No */}
                      <td className="px-3 md:px-5 py-2.5 md:py-4">
                        <span className="w-6 md:w-7 h-6 md:h-7 rounded-lg flex items-center justify-center text-[10px] md:text-[11px] font-black" style={{ background: '#f0faf4', color: '#15803d', border: '1px solid #d1fae5' }}>
                          {i + 1}
                        </span>
                      </td>

                      {/* User */}
                      <td className="px-3 md:px-5 py-2.5 md:py-4">
                        <div className="flex items-center gap-2 md:gap-3">
                          <div className="w-8 md:w-9 h-8 md:h-9 rounded-lg md:rounded-xl flex items-center justify-center text-white text-[10px] md:text-[11px] font-black flex-shrink-0" style={{ background: avatarGradient(user.name), boxShadow: '0 3px 8px rgba(0,0,0,0.15)' }}>
                            {initials(user.name)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs md:text-sm font-bold text-gray-800 truncate">{user.name}</p>
                            {user.createdAt && <p className="text-[9px] md:text-[10px] text-gray-400 hidden sm:block">Joined {new Date(user.createdAt).toLocaleDateString()}</p>}
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-3 md:px-5 py-2.5 md:py-4 hidden md:table-cell">
                        <span className="text-xs text-gray-600 font-mono truncate block max-w-xs">{user.email}</span>
                      </td>

                      {/* Phone */}
                      <td className="px-3 md:px-5 py-2.5 md:py-4 hidden md:table-cell">
                        <span className="text-xs text-gray-500">{user.phone || '—'}</span>
                      </td>

                      {/* Role */}
                      <td className="px-3 md:px-5 py-2.5 md:py-4 hidden md:table-cell">
                        <RoleBadge role={user.role} />
                      </td>

                      {/* Status toggle */}
                      <td className="px-3 md:px-5 py-2.5 md:py-4 hidden md:table-cell">
                        <StatusToggle user={user} onChange={updated => setUsers(prev => prev.map(u => u._id === updated._id ? updated : u))} />
                      </td>

                      {/* Actions */}
                      <td className="px-3 md:px-5 py-2.5 md:py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 md:gap-2 opacity-0 group-hover:opacity-100 transition-all">
                          {/* Delete only on mobile, full actions on desktop */}
                          <button
                            onClick={() => setDeleteUser(user)}
                            className="flex items-center gap-1 px-2.5 md:px-3 py-1.5 rounded-lg md:rounded-xl text-[10px] md:text-[11px] font-bold transition-all"
                            style={{ background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca' }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#fecaca'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = '#fef2f2'; }}
                          >
                            <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M1.5 3h9M4.5 3V2.25h3V3M3.5 3l.5 6.5h4l.5-6.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            <span className="hidden md:inline">Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            {!loading && filtered.length > 0 && (
              <div className="px-4 md:px-6 py-2.5 md:py-3.5 flex items-center justify-between text-[10px] md:text-xs flex-col sm:flex-row gap-2 sm:gap-0" style={{ borderTop: '1px solid #f0faf4', background: '#fafffe' }}>
                <p className="text-gray-400">Showing <span className="font-bold text-gray-600">{filtered.length}</span> of <span className="font-bold text-gray-600">{users.length}</span> users</p>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#22c55e', animation: 'livePulse 2s ease-in-out infinite' }} />
                  <span className="text-[10px] text-gray-400 font-medium">Live data</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modals */}
        {showAdd && (
          <AddUserModal
            onSaved={u => { setUsers(prev => [u, ...prev]); setShowAdd(false); }}
            onClose={() => setShowAdd(false)}
          />
        )}
        {deleteUser && (
          <ConfirmDeleteModal
            userName={deleteUser.name}
            deleting={deleting}
            onConfirm={handleDelete}
            onCancel={() => setDeleteUser(null)}
          />
        )}
      </div>
    </>
  );
}