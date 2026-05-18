"use client";

import { useState, useEffect, useCallback } from "react";
import { getDatabases, getCollections, deleteCollection } from "@/handler/collection_handler";
import { apiHandler } from "@/handler/api_handler";
import { MetaApi } from "@/config/metaApi";

// ─── Design Tokens (matching dashboard green theme) ───────────────────────────
const G = {
  primary: { bg: '#e8f5ee', text: '#1a3a2a', border: '#b6d9c5', grad: 'linear-gradient(135deg,#1a3a2a,#2d6a4f)' },
  accent:  { bg: '#f0faf4', text: '#2d6a4f', border: '#a8d5ba' },
  soft:    { bg: '#f6fdf9', text: '#40916c', border: '#c8e6d4' },
  danger:  { bg: '#fff1f2', text: '#be123c', border: '#fecdd3', grad: 'linear-gradient(135deg,#be123c,#f43f5e)' },
  gray:    { bg: '#f4f6fb', border: '#e8edf5', text: '#6b7280' },
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface DbEntry { name: string; sizeMB: string; empty: boolean; }
interface CollectionEntry { name: string; status: string; }
interface DbWithCollections {
  db: DbEntry;
  collections: CollectionEntry[];
  loading: boolean;
  expanded: boolean;
  error?: string;
}

// ─── Delete Modal ─────────────────────────────────────────────────────────────
function DeleteModal({ type, name, deleting, onConfirm, onCancel }:
  { type: 'db' | 'col'; name: string; deleting: boolean; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]" onClick={onCancel}>
      <div className="bg-white rounded-2xl shadow-2xl w-[380px] p-7 flex flex-col items-center gap-5"
        style={{ border: `1.5px solid ${G.danger.border}`, boxShadow: '0 32px 80px rgba(244,63,94,0.14)' }}
        onClick={e => e.stopPropagation()}>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ background: G.danger.bg, border: `1.5px solid ${G.danger.border}` }}>
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none" style={{ color: G.danger.text }}>
            <path d="M3 6.5h20M9 6.5V5a1 1 0 011-1h6a1 1 0 011 1v1.5M10.5 11v8M15.5 11v8M5 6.5l1.2 14.2A2 2 0 008.2 22.5h9.6a2 2 0 002-1.8L21 6.5"
              stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="text-center">
          <h3 className="text-base font-bold text-gray-900 mb-2">
            Delete {type === 'db' ? 'database' : 'collection'}?
          </h3>
          <p className="text-sm text-gray-500 leading-relaxed">
            <span className="font-semibold" style={{ color: G.accent.text }}>{name}</span> will be permanently removed
            and cannot be recovered.
            {type === 'db' && (
              <span className="block mt-2 text-amber-500 font-medium text-xs">
                ⚠ All collections inside will also be deleted.
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-3 w-full">
          <button onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-all"
            style={{ borderColor: '#e8edf5' }}>Cancel</button>
          <button onClick={onConfirm} disabled={deleting}
            className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ background: G.danger.grad, boxShadow: '0 4px 14px rgba(244,63,94,0.3)' }}>
            {deleting
              ? <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>
              : 'Delete permanently'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── View Collections Modal ───────────────────────────────────────────────────
function ViewCollectionsModal({ dbName, collections, onClose }:
  { dbName: string; collections: CollectionEntry[]; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-[520px] max-h-[80vh] flex flex-col"
        style={{ border: '1.5px solid #b6d9c5', boxShadow: '0 32px 80px rgba(26,58,42,0.14)' }}
        onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5" style={{ background: G.primary.grad, borderRadius: '1rem 1rem 0 0' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)' }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <ellipse cx="8" cy="4" rx="5" ry="2" stroke="white" strokeWidth="1.3" />
                <path d="M3 4v4c0 1.1 2.2 2 5 2s5-.9 5-2V4" stroke="white" strokeWidth="1.3" />
                <path d="M3 8v4c0 1.1 2.2 2 5 2s5-.9 5-2V8" stroke="white" strokeWidth="1.3" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">{dbName}</h3>
              <p className="text-[10px] text-green-200">{collections.length} collection{collections.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-green-200 hover:text-white hover:bg-white/15 transition-all">
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
          </button>
        </div>

        {/* Collections list — table style matching dashboard */}
        <div className="overflow-y-auto flex-1">
          {collections.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 gap-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: G.primary.bg, border: `1.5px dashed ${G.primary.border}` }}>
                <svg width="20" height="20" viewBox="0 0 22 22" fill="none" style={{ color: G.primary.border }}>
                  <rect x="2" y="4" width="18" height="4" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
                  <rect x="2" y="10" width="18" height="4" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
                  <rect x="2" y="16" width="11" height="4" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-gray-400">No collections yet</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr style={{ background: '#f4f6fb', borderBottom: '1px solid #e8edf5' }}>
                  <th className="px-5 py-3 text-left text-[9px] font-black uppercase tracking-widest" style={{ color: '#9ca3af' }}>Collection</th>
                  <th className="px-5 py-3 text-left text-[9px] font-black uppercase tracking-widest" style={{ color: '#9ca3af' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {collections.map((col, i) => (
                  <tr key={col.name} className="group transition-all"
                    style={{ borderTop: i > 0 ? '1px solid #f4f6fb' : 'none' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f6fdf9'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background: G.accent.bg, border: `1px solid ${G.accent.border}` }}>
                          <svg width="13" height="13" viewBox="0 0 18 18" fill="none">
                            <rect x="2" y="3" width="14" height="3" rx="1.2" fill={G.accent.text} opacity="0.9" />
                            <rect x="2" y="8" width="14" height="3" rx="1.2" fill={G.accent.text} opacity="0.65" />
                            <rect x="2" y="13" width="9" height="3" rx="1.2" fill={G.accent.text} opacity="0.4" />
                          </svg>
                        </div>
                        <span className="text-xs font-bold" style={{ color: G.primary.text }}>{col.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full"
                        style={{ background: G.primary.bg, color: G.accent.text, border: `1px solid ${G.primary.border}` }}>
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
                        {col.status || 'Active'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4" style={{ borderTop: '1px solid #e8edf5' }}>
          <button onClick={onClose}
            className="w-full py-2.5 rounded-xl border text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-all"
            style={{ borderColor: '#e8edf5' }}>Close</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AllCollectionsPage() {
  const [dbList, setDbList] = useState<DbWithCollections[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<{ type: 'db' | 'col'; dbName: string; colName?: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [viewModal, setViewModal] = useState<{ dbName: string; collections: CollectionEntry[] } | null>(null);

  const fetchAll = useCallback(async (refresh = false) => {
    refresh ? setIsRefreshing(true) : setLoading(true);
    setError('');
    try {
      const dbRes = await getDatabases();
      if (!dbRes.ok) throw new Error(dbRes.data || 'Failed to load databases');
      const dbs: DbEntry[] = dbRes.data ?? [];
      const withCols = await Promise.all(
        dbs.map(async (db) => {
          try {
            const colRes = await getCollections(db.name);
            return { db, collections: colRes.ok ? (colRes.data ?? []) : [], loading: false, expanded: true, error: colRes.ok ? undefined : 'Failed to load' };
          } catch {
            return { db, collections: [], loading: false, expanded: true, error: 'Failed to load' };
          }
        })
      );
      setDbList(withCols);
    } catch (e: any) {
      setError(e.message || 'Failed to load');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const toggleExpand = (dbName: string) =>
    setDbList(prev => prev.map(item => item.db.name === dbName ? { ...item, expanded: !item.expanded } : item));

  const handleDeleteDb = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    const res = await apiHandler({ url: MetaApi.deleteDatabase(confirmDelete.dbName), method: 'delete' });
    setDeleting(false); setConfirmDelete(null);
    if (!res.ok) { setError(res.message || 'Failed to delete database'); return; }
    setDbList(prev => prev.filter(item => item.db.name !== confirmDelete.dbName));
  };

  const handleDeleteCol = async () => {
    if (!confirmDelete || !confirmDelete.colName) return;
    setDeleting(true);
    const res = await deleteCollection(confirmDelete.dbName, confirmDelete.colName);
    setDeleting(false); setConfirmDelete(null);
    if (!res.ok) { setError(res.data || 'Failed to delete collection'); return; }
    setDbList(prev => prev.map(item =>
      item.db.name === confirmDelete.dbName
        ? { ...item, collections: item.collections.filter(c => c.name !== confirmDelete.colName) }
        : item
    ));
    if (viewModal?.dbName === confirmDelete.dbName) {
      setViewModal(prev => prev ? { ...prev, collections: prev.collections.filter(c => c.name !== confirmDelete.colName) } : null);
    }
  };

  const filtered = dbList.filter(item => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return item.db.name.toLowerCase().includes(q) || item.collections.some(c => c.name.toLowerCase().includes(q));
  });

  const totalCollections = dbList.reduce((sum, item) => sum + item.collections.length, 0);

  return (
    <div className="min-h-screen font-sans" style={{ background: '#f4f6fb' }}>
      {/* Error banner */}
      {error && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 bg-white shadow-lg rounded-xl"
          style={{ border: '1px solid #fecdd3' }}>
          <span className="text-xs font-medium flex-1 text-red-600">{error}</span>
          <button onClick={() => setError('')} className="text-red-400 text-lg leading-none">×</button>
        </div>
      )}

      <div className="p-6">
        {/* ── Header ── */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: G.primary.text }}>All Databases</h1>
            <p className="text-sm text-gray-400 mt-1">View and manage all your MongoDB databases and collections</p>
          </div>
          <div className="flex items-center gap-3">
            {!loading && (
              <>
                <span className="flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-full"
                  style={{ background: G.primary.bg, color: G.accent.text, border: `1px solid ${G.primary.border}` }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
                  Live · {dbList.length} Database{dbList.length !== 1 ? 's' : ''}
                </span>
                <span className="flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-full"
                  style={{ background: G.accent.bg, color: G.primary.text, border: `1px solid ${G.accent.border}` }}>
                  {totalCollections} Collection{totalCollections !== 1 ? 's' : ''}
                </span>
              </>
            )}
            <button onClick={() => fetchAll(true)} disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-800 disabled:opacity-50 transition-all"
              style={{ borderColor: '#e8edf5', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" className={isRefreshing ? 'animate-spin' : ''}>
                <path d="M1 6.5a5.5 5.5 0 1 0 1-3M1 1v2.5h2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {isRefreshing ? 'Refreshing…' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* ── Search ── */}
        <div className="relative mb-5 max-w-sm">
          <svg width="14" height="14" viewBox="0 0 15 15" fill="none"
            className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: G.accent.text }}>
            <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.4" />
            <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search databases or collections…"
            className="w-full pl-10 pr-4 py-2.5 bg-white border rounded-xl text-sm text-gray-700 placeholder-gray-400 outline-none transition-all"
            style={{ borderColor: '#e8edf5', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
            onFocus={e => e.target.style.borderColor = G.primary.border}
            onBlur={e => e.target.style.borderColor = '#e8edf5'} />
        </div>

        {/* ── Loading skeleton ── */}
        {loading ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map(n => (
              <div key={n} className="bg-white border rounded-2xl p-5 animate-pulse" style={{ borderColor: '#e8edf5' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-gray-100" />
                  <div className="h-4 bg-gray-100 rounded w-32" />
                  <div className="h-4 bg-gray-100 rounded w-16 ml-auto" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[1, 2, 3].map(m => <div key={m} className="h-14 bg-gray-100 rounded-xl" />)}
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border rounded-2xl flex flex-col items-center justify-center py-20 gap-4"
            style={{ borderColor: '#e8edf5', boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: G.primary.bg, border: `1.5px dashed ${G.primary.border}` }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ color: G.primary.border }}>
                <ellipse cx="12" cy="6" rx="8" ry="3.2" stroke="currentColor" strokeWidth="1.5" />
                <path d="M4 6v6c0 1.8 3.6 3.2 8 3.2s8-1.4 8-3.2V6" stroke="currentColor" strokeWidth="1.5" />
                <path d="M4 12v6c0 1.8 3.6 3.2 8 3.2s8-1.4 8-3.2v-6" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-gray-500">{search ? 'No results found' : 'No databases yet'}</p>
              <p className="text-xs text-gray-400 mt-1">
                {search ? `No match for "${search}"` : 'Create a database to get started'}
              </p>
            </div>
            {!search && (
              <a href="/createdatabase"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-bold transition-all"
                style={{ background: G.primary.grad, boxShadow: '0 4px 14px rgba(26,58,42,0.25)' }}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 2v8M2 6h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
                Create Database
              </a>
            )}
          </div>
        ) : (
          /* ── Database cards with table layout ── */
          <div className="flex flex-col gap-4">
            {filtered.map((item, dbIdx) => (
              <div key={item.db.name} className="bg-white rounded-2xl overflow-hidden"
                style={{ border: '1px solid #e8edf5', boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>

                {/* DB header row */}
                <div className="flex items-center gap-4 px-5 py-4" style={{ borderBottom: '1px solid #e8edf5' }}>
                  {/* Expand toggle */}
                  <button onClick={() => toggleExpand(item.db.name)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-all flex-shrink-0"
                    style={{ background: G.primary.bg, border: `1px solid ${G.primary.border}`, color: G.accent.text }}>
                    <svg width="10" height="10" viewBox="0 0 11 11" fill="none"
                      className={`transition-transform duration-200 ${item.expanded ? 'rotate-90' : ''}`}>
                      <path d="M3 2l5 3.5-5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>

                  {/* DB icon */}
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: G.primary.bg, border: `1px solid ${G.primary.border}` }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <ellipse cx="8" cy="4" rx="5" ry="2" stroke={G.accent.text} strokeWidth="1.3" />
                      <path d="M3 4v4c0 1.1 2.2 2 5 2s5-.9 5-2V4" stroke={G.accent.text} strokeWidth="1.3" />
                      <path d="M3 8v4c0 1.1 2.2 2 5 2s5-.9 5-2V8" stroke={G.accent.text} strokeWidth="1.3" />
                    </svg>
                  </div>

                  {/* DB name */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold truncate" style={{ color: G.primary.text }}>{item.db.name}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                        style={{ background: G.gray.bg, color: G.gray.text, border: `1px solid ${G.gray.border}` }}>
                        {item.db.sizeMB} MB
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {item.collections.length} collection{item.collections.length !== 1 ? 's' : ''}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => setViewModal({ dbName: item.db.name, collections: item.collections })}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all"
                      style={{ background: G.accent.bg, color: G.primary.text, border: `1px solid ${G.accent.border}` }}
                      onMouseEnter={e => e.currentTarget.style.background = G.primary.bg}
                      onMouseLeave={e => e.currentTarget.style.background = G.accent.bg}>
                      <svg width="12" height="12" viewBox="0 0 13 13" fill="none">
                        <circle cx="6.5" cy="6.5" r="2.5" stroke="currentColor" strokeWidth="1.3" />
                        <path d="M1 6.5C2.5 3.5 4.5 2 6.5 2s4 1.5 5.5 4.5C10.5 10 8.5 11 6.5 11S2.5 10 1 6.5z" stroke="currentColor" strokeWidth="1.3" />
                      </svg>
                      View
                    </button>
                    <button onClick={() => setConfirmDelete({ type: 'db', dbName: item.db.name })}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all"
                      style={{ background: G.danger.bg, color: G.danger.text, border: `1px solid ${G.danger.border}` }}
                      onMouseEnter={e => e.currentTarget.style.background = '#fecdd3'}
                      onMouseLeave={e => e.currentTarget.style.background = G.danger.bg}>
                      <svg width="12" height="12" viewBox="0 0 13 13" fill="none">
                        <path d="M2 3.5h9M5 3.5V2.5h3v1M4 3.5l.5 7h4l.5-7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>

                {/* Collections table — expanded */}
                {item.expanded && (
                  <div style={{ background: '#f6fdf9' }}>
                    {item.collections.length === 0 ? (
                      <div className="flex items-center justify-center py-6 gap-3">
                        <span className="text-sm text-gray-400 font-medium">No collections in this database</span>
                        <a href="/createdatabase" className="text-xs font-semibold underline underline-offset-2"
                          style={{ color: G.accent.text }}>Create one</a>
                      </div>
                    ) : (
                      <table className="w-full">
                        <thead>
                          <tr style={{ background: '#f0faf4', borderBottom: '1px solid #e8edf5' }}>
                            <th className="px-5 py-3 text-left text-[9px] font-black uppercase tracking-widest" style={{ color: '#9ca3af' }}>Collection</th>
                            <th className="px-5 py-3 text-left text-[9px] font-black uppercase tracking-widest" style={{ color: '#9ca3af' }}>Status</th>
                            <th className="px-5 py-3 text-right text-[9px] font-black uppercase tracking-widest" style={{ color: '#9ca3af' }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {item.collections.map((col, i) => (
                            <tr key={col.name} className="group transition-all"
                              style={{ borderTop: i > 0 ? '1px solid #e8f5ee' : 'none' }}
                              onMouseEnter={e => e.currentTarget.style.background = '#e8f5ee'}
                              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                              <td className="px-5 py-3.5">
                                <div className="flex items-center gap-3">
                                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                                    style={{ background: G.accent.bg, border: `1px solid ${G.accent.border}` }}>
                                    <svg width="12" height="12" viewBox="0 0 18 18" fill="none">
                                      <rect x="2" y="3" width="14" height="3" rx="1.2" fill={G.accent.text} opacity="0.9" />
                                      <rect x="2" y="8" width="14" height="3" rx="1.2" fill={G.accent.text} opacity="0.65" />
                                      <rect x="2" y="13" width="9" height="3" rx="1.2" fill={G.accent.text} opacity="0.4" />
                                    </svg>
                                  </div>
                                  <span className="text-xs font-bold" style={{ color: G.primary.text }}>{col.name}</span>
                                </div>
                              </td>
                              <td className="px-5 py-3.5">
                                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full"
                                  style={{ background: G.primary.bg, color: G.accent.text, border: `1px solid ${G.primary.border}` }}>
                                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
                                  {col.status || 'Active'}
                                </span>
                              </td>
                              <td className="px-5 py-3.5">
                                <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-all">
                                  <button onClick={() => setConfirmDelete({ type: 'col', dbName: item.db.name, colName: col.name })}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all"
                                    style={{ background: G.danger.bg, color: G.danger.text, border: `1px solid ${G.danger.border}` }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#fecdd3'}
                                    onMouseLeave={e => e.currentTarget.style.background = G.danger.bg}>
                                    <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M1.5 3h9M4.5 3V2.25h3V3M3.5 3l.5 6.5h4l.5-6.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {viewModal && (
        <ViewCollectionsModal dbName={viewModal.dbName} collections={viewModal.collections} onClose={() => setViewModal(null)} />
      )}
      {confirmDelete && (
        <DeleteModal type={confirmDelete.type} name={confirmDelete.colName ?? confirmDelete.dbName}
          deleting={deleting}
          onConfirm={confirmDelete.type === 'col' ? handleDeleteCol : handleDeleteDb}
          onCancel={() => setConfirmDelete(null)} />
      )}
    </div>
  );
}