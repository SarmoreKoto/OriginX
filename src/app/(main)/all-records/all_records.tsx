"use client";

import { useState, useEffect, useCallback } from "react";
import { getDatabases, getCollections } from "@/handler/collection_handler";
import { apiHandler } from "@/handler/api_handler";
import { MetaApi } from "@/config/metaApi";

// ─── Design Tokens (matching dashboard green theme) ───────────────────────────
const G = {
  primary:   { bg: '#e8f5ee', text: '#1a3a2a', border: '#b6d9c5', grad: 'linear-gradient(135deg,#1a3a2a,#2d6a4f)' },
  accent:    { bg: '#f0faf4', text: '#2d6a4f', border: '#a8d5ba', grad: 'linear-gradient(135deg,#2d6a4f,#40916c)' },
  soft:      { bg: '#f6fdf9', text: '#40916c', border: '#c8e6d4' },
  danger:    { bg: '#fff1f2', text: '#be123c', border: '#fecdd3', grad: 'linear-gradient(135deg,#be123c,#f43f5e)' },
  gray:      { bg: '#f4f6fb', border: '#e8edf5', text: '#6b7280' },
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface DbEntry { name: string; sizeMB: string; empty: boolean; }
interface CollectionEntry { name: string; status: string; }
type Doc = Record<string, unknown>;

function initials(name: string) {
  return name.split(/[_\-\s]/).map(n => n[0]).slice(0, 2).join('').toUpperCase();
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────
function EditModal({ doc, dbName, collectionName, onSaved, onClose }:
  { doc: Doc; dbName: string; collectionName: string; onSaved: (u: Doc) => void; onClose: () => void }) {
  const docId = String(doc._id ?? "");
  const initial = Object.entries(doc).filter(([k]) => k !== '_id')
    .map(([k, v]) => ({ key: k, value: typeof v === 'object' ? JSON.stringify(v) : String(v ?? '') }));

  const [fields, setFields] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const updKey = (i: number, k: string) => setFields(f => f.map((x, idx) => idx === i ? { ...x, key: k } : x));
  const updVal = (i: number, v: string) => setFields(f => f.map((x, idx) => idx === i ? { ...x, value: v } : x));
  const addRow = () => setFields(f => [...f, { key: '', value: '' }]);
  const removeRow = (i: number) => setFields(f => f.filter((_, idx) => idx !== i));

  const handleSave = async () => {
    setError('');
    const body: Doc = {};
    for (const f of fields) {
      if (f.key.trim()) { try { body[f.key.trim()] = JSON.parse(f.value); } catch { body[f.key.trim()] = f.value; } }
    }
    setSaving(true);
    const res = await apiHandler({ url: MetaApi.updateDocument(dbName, collectionName, docId), method: 'put', data: body });
    setSaving(false);
    if (!res.ok) { setError(res.message || 'Failed to update'); return; }
    onSaved({ _id: doc._id, ...body });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl w-[620px] max-h-[85vh] flex flex-col overflow-hidden"
        style={{ border: '1.5px solid #b6d9c5', boxShadow: '0 32px 80px rgba(26,58,42,0.18)' }}
        onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5" style={{ background: G.primary.grad }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-black"
              style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)' }}>
              {initials(collectionName)}
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Edit Document</h3>
              <p className="text-[10px] text-green-200 mt-0.5 font-mono truncate max-w-xs">{docId}</p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-green-200 hover:text-white hover:bg-white/15 transition-all">
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
          </button>
        </div>

        {/* Fields */}
        <div className="overflow-y-auto flex-1 p-6" style={{ background: '#f6fdf9' }}>
          <div className="grid grid-cols-[1fr_1fr_32px] gap-2 mb-3 px-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Field</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Value</span>
            <span />
          </div>
          <div className="flex flex-col gap-2">
            {fields.map((f, i) => (
              <div key={i} className="grid grid-cols-[1fr_1fr_32px] gap-2 group">
                <input value={f.key} onChange={e => updKey(i, e.target.value)} placeholder="field_name"
                  className="border rounded-xl px-3 py-2.5 text-xs font-mono text-gray-800 outline-none bg-white transition-all"
                  style={{ borderColor: '#e8edf5' }}
                  onFocus={e => e.target.style.borderColor = G.primary.text}
                  onBlur={e => e.target.style.borderColor = '#e8edf5'} />
                <input value={f.value} onChange={e => updVal(i, e.target.value)} placeholder="value"
                  className="border rounded-xl px-3 py-2.5 text-xs font-mono outline-none bg-white transition-all"
                  style={{ borderColor: '#e8edf5', color: G.accent.text }}
                  onFocus={e => e.target.style.borderColor = G.primary.text}
                  onBlur={e => e.target.style.borderColor = '#e8edf5'} />
                <button onClick={() => removeRow(i)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100">
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2 2l8 8M10 2L2 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                </button>
              </div>
            ))}
          </div>
          <button onClick={addRow} className="mt-4 flex items-center gap-2 text-xs font-bold transition-all hover:opacity-70"
            style={{ color: G.accent.text }}>
            <svg width="13" height="13" viewBox="0 0 12 12" fill="none"><path d="M6 2v8M2 6h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
            Add field
          </button>
          {error && <p className="mt-3 text-xs font-semibold text-red-600">{error}</p>}
        </div>

        {/* Footer */}
        <div className="px-7 py-5 flex gap-3" style={{ borderTop: '1px solid #e8edf5', background: 'white' }}>
          <button onClick={onClose}
            className="flex-1 py-3 rounded-xl border text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-all"
            style={{ borderColor: '#e8edf5' }}>Cancel</button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 py-3 rounded-xl text-white text-sm font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ background: G.primary.grad, boxShadow: '0 4px 14px rgba(26,58,42,0.3)' }}>
            {saving
              ? <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>
              : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────
function ConfirmDeleteModal({ onConfirm, onCancel, deleting }:
  { onConfirm: () => void; onCancel: () => void; deleting: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onCancel}>
      <div className="bg-white rounded-2xl w-[380px] p-8 flex flex-col items-center gap-5"
        style={{ border: `1.5px solid ${G.danger.border}`, boxShadow: '0 32px 80px rgba(244,63,94,0.16)' }}
        onClick={e => e.stopPropagation()}>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ background: G.danger.bg, border: `2px solid ${G.danger.border}` }}>
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none" style={{ color: G.danger.text }}>
            <path d="M3.5 6.5h19M10 6.5V5a1 1 0 011-1h4a1 1 0 011 1v1.5M5 6.5l1.2 14A2 2 0 008.2 22.5h9.6a2 2 0 002-1.8L21 6.5"
              stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="text-center">
          <h3 className="text-base font-bold text-gray-900 mb-1">Delete Document?</h3>
          <p className="text-sm text-gray-400">This action cannot be undone.</p>
        </div>
        <div className="flex gap-3 w-full">
          <button onClick={onCancel}
            className="flex-1 py-3 rounded-xl border text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-all"
            style={{ borderColor: '#e8edf5' }}>Cancel</button>
          <button onClick={onConfirm} disabled={deleting}
            className="flex-1 py-3 rounded-xl text-white text-sm font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ background: G.danger.grad, boxShadow: '0 4px 14px rgba(244,63,94,0.3)' }}>
            {deleting
              ? <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>
              : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Documents Table ──────────────────────────────────────────────────────────
function DocsTable({ docs, dbName, colName, onUpdated, onDeleted }:
  { docs: Doc[]; dbName: string; colName: string; onUpdated: (id: string, u: Doc) => void; onDeleted: (id: string) => void }) {
  const [editDoc, setEditDoc] = useState<Doc | null>(null);
  const [deleteDocId, setDeleteDocId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState('');

  const allKeys = Array.from(new Set(docs.flatMap(d => Object.keys(d))));
  const filtered = docs.filter(d => !search || Object.values(d).some(v => String(v).toLowerCase().includes(search.toLowerCase())));

  const handleDelete = async () => {
    if (!deleteDocId) return;
    setDeleting(true);
    await apiHandler({ url: MetaApi.deleteDocument(dbName, colName, deleteDocId), method: 'delete' });
    setDeleting(false); setDeleteDocId(null); onDeleted(deleteDocId);
  };

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <span className="text-xs font-black uppercase tracking-widest" style={{ color: G.gray.text }}>Documents</span>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold"
            style={{ background: G.primary.bg, color: G.primary.text, border: `1px solid ${G.primary.border}` }}>
            {docs.length}
          </span>
        </div>
        <div className="relative">
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none"
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: G.accent.text }}>
            <circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.4" />
            <path d="M10 10l2.5 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search documents…"
            className="rounded-xl pl-8 pr-3 py-2 text-xs text-gray-700 placeholder-gray-400 outline-none transition-all w-48 bg-white"
            style={{ border: '1px solid #e8edf5' }}
            onFocus={e => e.target.style.borderColor = G.accent.text}
            onBlur={e => e.target.style.borderColor = '#e8edf5'} />
        </div>
      </div>

      {/* Table — matches dashboard Users Directory table style */}
      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #e8edf5' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: '#f4f6fb', borderBottom: '1px solid #e8edf5' }}>
                <th className="px-5 py-3.5 text-left text-[9px] font-black uppercase tracking-widest w-12"
                  style={{ color: '#9ca3af' }}>S.No</th>
                {allKeys.map(k => (
                  <th key={k} className="px-5 py-3.5 text-left text-[9px] font-black uppercase tracking-widest whitespace-nowrap"
                    style={{ color: '#9ca3af' }}>{k}</th>
                ))}
                <th className="px-5 py-3.5 text-right text-[9px] font-black uppercase tracking-widest"
                  style={{ color: '#9ca3af' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={allKeys.length + 2} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                        style={{ background: G.primary.bg, border: `1.5px dashed ${G.primary.border}` }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{ color: G.primary.border }}>
                          <rect x="3" y="5" width="18" height="4" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
                          <rect x="3" y="11" width="18" height="4" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
                          <rect x="3" y="17" width="11" height="4" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
                        </svg>
                      </div>
                      <p className="text-sm font-bold text-gray-400">No documents found</p>
                      <p className="text-xs text-gray-300">{search ? 'Try a different search term' : 'This collection is empty'}</p>
                    </div>
                  </td>
                </tr>
              ) : filtered.map((doc, i) => (
                <tr key={i} className="group transition-all"
                  style={{ borderTop: i > 0 ? '1px solid #f4f6fb' : 'none' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f6fdf9'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  {/* S.No */}
                  <td className="px-5 py-3.5">
                    <span className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold"
                      style={{ background: G.primary.bg, color: G.primary.text, border: `1px solid ${G.primary.border}` }}>
                      {i + 1}
                    </span>
                  </td>
                  {allKeys.map(k => (
                    <td key={k} className="px-5 py-3.5 text-xs whitespace-nowrap max-w-[200px] truncate"
                      style={{
                        color: k === '_id' ? '#9ca3af' : '#1a3a2a',
                        fontFamily: k === '_id' ? 'monospace' : 'inherit',
                        fontWeight: k === '_id' ? 400 : 600
                      }}>
                      {doc[k] !== undefined ? String(doc[k]) : <span className="text-gray-300 italic">—</span>}
                    </td>
                  ))}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={() => setEditDoc(doc)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all"
                        style={{ background: G.primary.bg, color: G.primary.text, border: `1px solid ${G.primary.border}` }}
                        onMouseEnter={e => e.currentTarget.style.background = G.primary.border}
                        onMouseLeave={e => e.currentTarget.style.background = G.primary.bg}>
                        <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M8.5 1.5l2 2-7 7H1.5v-2l7-7z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        Edit
                      </button>
                      <button onClick={() => setDeleteDocId(String(doc._id ?? i))}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all"
                        style={{ background: G.danger.bg, color: G.danger.text, border: `1px solid ${G.danger.border}` }}
                        onMouseEnter={e => e.currentTarget.style.background = G.danger.border}
                        onMouseLeave={e => e.currentTarget.style.background = G.danger.bg}>
                        <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M1.5 3h9M4.5 3V2.25h3V3M3.5 3l.5 6.5h4l.5-6.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length > 0 && (
          <div className="px-5 py-3 flex items-center justify-between"
            style={{ borderTop: '1px solid #e8edf5', background: '#f4f6fb' }}>
            <p className="text-xs text-gray-400">
              Showing <span className="font-bold text-gray-600">{filtered.length}</span> of{' '}
              <span className="font-bold text-gray-600">{docs.length}</span> documents
            </p>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] text-gray-400 font-medium">Live</span>
            </div>
          </div>
        )}
      </div>

      {editDoc && (
        <EditModal doc={editDoc} dbName={dbName} collectionName={colName}
          onSaved={u => { onUpdated(String(editDoc._id), u); setEditDoc(null); }}
          onClose={() => setEditDoc(null)} />
      )}
      {deleteDocId && (
        <ConfirmDeleteModal deleting={deleting} onConfirm={handleDelete} onCancel={() => setDeleteDocId(null)} />
      )}
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AllDocumentsPage() {
  const [databases, setDatabases]     = useState<DbEntry[]>([]);
  const [selectedDb, setSelectedDb]   = useState<string | null>(null);
  const [collections, setCollections] = useState<CollectionEntry[]>([]);
  const [selectedCol, setSelectedCol] = useState<string | null>(null);
  const [docs, setDocs]               = useState<Doc[]>([]);
  const [loadingDbs, setLoadingDbs]   = useState(true);
  const [loadingCols, setLoadingCols] = useState(false);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [error, setError]             = useState('');

  const loadDbs = useCallback(async () => {
    setLoadingDbs(true);
    const res = await getDatabases();
    setLoadingDbs(false);
    if (res.ok) setDatabases(res.data ?? []); else setError('Failed to load databases');
  }, []);

  useEffect(() => { loadDbs(); }, [loadDbs]);

  const handleSelectDb = async (dbName: string) => {
    if (selectedDb === dbName) { setSelectedDb(null); setCollections([]); setSelectedCol(null); setDocs([]); return; }
    setSelectedDb(dbName); setSelectedCol(null); setDocs([]); setCollections([]); setLoadingCols(true);
    const res = await getCollections(dbName);
    setLoadingCols(false);
    if (res.ok) setCollections(res.data ?? []);
  };

  const handleSelectCol = async (colName: string) => {
    if (selectedCol === colName) { setSelectedCol(null); setDocs([]); return; }
    setSelectedCol(colName); setDocs([]); setLoadingDocs(true);
    const res = await apiHandler({ url: MetaApi.getDocuments(selectedDb!, colName) });
    setLoadingDocs(false);
    if (res.ok) {
      const raw = res.data;
      setDocs(Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : Array.isArray(raw?.documents) ? raw.documents : []);
    }
  };

  const handleDocUpdated = (id: string, updated: Doc) => setDocs(prev => prev.map(d => String(d._id) === id ? updated : d));
  const handleDocDeleted = (id: string) => setDocs(prev => prev.filter(d => String(d._id) !== id));

  const stats = [
    { label: 'Databases',   value: databases.length,   sub: 'from MongoDB' },
    { label: 'Collections', value: collections.length, sub: 'in selected db' },
    { label: 'Documents',   value: docs.length,        sub: 'in selected table' },
  ];

  return (
    <>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse2 { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(1.5)} }
      `}</style>

      <div className="min-h-screen font-sans" style={{ background: '#f4f6fb' }}>
        {error && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 bg-white shadow-lg rounded-xl"
            style={{ border: '1px solid #fecdd3' }}>
            <span className="text-xs font-medium flex-1 text-red-600">{error}</span>
            <button onClick={() => setError('')} className="text-red-400 text-lg leading-none">×</button>
          </div>
        )}

        <div className="p-6 max-w-[1600px] mx-auto">

          {/* ── Header ── */}
          <div className="flex items-center justify-between mb-7" style={{ animation: 'fadeUp .4s ease both' }}>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: G.primary.text }}>All Documents</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" style={{ animation: 'pulse2 2s ease-in-out infinite' }} />
                <p className="text-xs font-medium text-gray-400">MongoDB · Browse, edit and delete documents</p>
              </div>
            </div>
          </div>

          {/* ── Stat Cards — same as dashboard card style ── */}
          {/* <div className="grid grid-cols-3 gap-4 mb-6" style={{ animation: 'fadeUp .4s ease .07s both' }}>
            {stats.map((s, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 flex items-center justify-between"
                style={{ border: '1px solid #e8edf5', boxShadow: '0 1px 8px rgba(0,0,0,0.04)', animation: `fadeUp .4s ease ${.1 + i * .06}s both` }}>
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 mb-1">{s.label}</p>
                  <p className="text-3xl font-extrabold" style={{ color: G.primary.text }}>{s.value}</p>
                </div>
                <span className="flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full"
                  style={{ background: G.primary.bg, color: G.accent.text, border: `1px solid ${G.primary.border}` }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" style={{ animation: 'pulse2 2s ease-in-out infinite' }} />
                  Live · {s.sub}
                </span>
              </div>
            ))}
          </div> */}

          {/* ── Three-panel layout ── */}
          <div className="flex gap-4 items-start">

            {/* DB Panel */}
            <div className="rounded-2xl overflow-hidden flex-shrink-0 w-[220px] bg-white"
              style={{ border: '1px solid #e8edf5', boxShadow: '0 1px 8px rgba(0,0,0,0.04)', animation: 'fadeUp .4s ease .15s both' }}>
              <div className="px-4 py-4" style={{ background: '#f4f6fb', borderBottom: '1px solid #e8edf5' }}>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Databases</span>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: G.primary.bg, color: G.primary.text, border: `1px solid ${G.primary.border}` }}>
                    {databases.length}
                  </span>
                </div>
              </div>
              <div className="p-2">
                {loadingDbs ? (
                  <div className="flex flex-col gap-1.5 p-1">{[1, 2, 3, 4].map(n => <div key={n} className="h-11 rounded-xl animate-pulse bg-slate-100" />)}</div>
                ) : databases.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-2">
                    <p className="text-xs font-bold text-gray-400">No databases</p>
                  </div>
                ) : databases.map(db => {
                  const active = selectedDb === db.name;
                  return (
                    <button key={db.name} onClick={() => handleSelectDb(db.name)}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl border transition-all text-left mb-0.5"
                      style={{
                        background: active ? G.primary.bg : 'transparent',
                        border: active ? `1px solid ${G.primary.border}` : '1px solid transparent'
                      }}
                      onMouseEnter={e => { if (!active) { e.currentTarget.style.background = '#f6fdf9'; e.currentTarget.style.borderColor = '#e8edf5'; } }}
                      onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; } }}>
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black flex-shrink-0 transition-all"
                        style={{
                          background: active ? G.primary.grad : '#f0faf4',
                          color: active ? 'white' : G.accent.text,
                          boxShadow: active ? '0 2px 8px rgba(26,58,42,0.25)' : 'none'
                        }}>
                        {initials(db.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold truncate" style={{ color: active ? G.primary.text : '#374151' }}>{db.name}</p>
                        <p className="text-[10px] font-semibold text-gray-400">{db.sizeMB} MB</p>
                      </div>
                      {active && <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-green-500" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Collections Panel */}
            <div className="rounded-2xl overflow-hidden flex-shrink-0 w-[220px] bg-white"
              style={{ border: '1px solid #e8edf5', boxShadow: '0 1px 8px rgba(0,0,0,0.04)', animation: 'fadeUp .4s ease .22s both' }}>
              <div className="px-4 py-4" style={{ background: '#f4f6fb', borderBottom: '1px solid #e8edf5' }}>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Tables</span>
                  {selectedDb && (
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: G.primary.bg, color: G.primary.text, border: `1px solid ${G.primary.border}` }}>
                      {collections.length}
                    </span>
                  )}
                </div>
              </div>
              <div className="p-2">
                {!selectedDb ? (
                  <div className="flex flex-col items-center justify-center py-12.5 gap-3">
                    <p className="text-xs font-bold text-gray-400 text-center">Select a database</p>
                  </div>
                ) : loadingCols ? (
                  <div className="flex flex-col gap-1.5 p-1">{[1, 2, 3].map(n => <div key={n} className="h-11 rounded-xl animate-pulse bg-slate-100" />)}</div>
                ) : collections.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10">
                    <p className="text-xs font-bold text-gray-400">No tables found</p>
                  </div>
                ) : collections.map(col => {
                  const active = selectedCol === col.name;
                  return (
                    <button key={col.name} onClick={() => handleSelectCol(col.name)}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl border transition-all text-left mb-0.5"
                      style={{
                        background: active ? G.primary.bg : 'transparent',
                        border: active ? `1px solid ${G.primary.border}` : '1px solid transparent'
                      }}
                      onMouseEnter={e => { if (!active) { e.currentTarget.style.background = '#f6fdf9'; e.currentTarget.style.borderColor = '#e8edf5'; } }}
                      onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; } }}>
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
                        style={{
                          background: active ? G.primary.grad : '#f0faf4',
                          boxShadow: active ? '0 2px 8px rgba(26,58,42,0.25)' : 'none'
                        }}>
                        <svg width="13" height="13" viewBox="0 0 18 18" fill="none">
                          <rect x="2" y="3" width="14" height="3" rx="1.2" fill={active ? 'white' : G.accent.text} opacity="0.9" />
                          <rect x="2" y="8" width="14" height="3" rx="1.2" fill={active ? 'white' : G.accent.text} opacity="0.65" />
                          <rect x="2" y="13" width="9" height="3" rx="1.2" fill={active ? 'white' : G.accent.text} opacity="0.4" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold truncate" style={{ color: active ? G.primary.text : '#374151' }}>{col.name}</p>
                        <p className="text-[10px] font-semibold" style={{ color: active ? G.accent.text : '#9ca3af' }}>{col.status}</p>
                      </div>
                      {active && <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-green-500" />}
                    </button>
                  );
                })}
              </div>
            </div>

           
          </div>
           {/* Documents Panel */}
            <div className="rounded-2xl overflow-hidden flex-1 bg-white mt-3"
              style={{ border: '1px solid #e8edf5', boxShadow: '0 1px 8px rgba(0,0,0,0.04)', padding: '24px', minHeight: '500px', animation: 'fadeUp .4s ease .3s both' }}>
              {!selectedCol ? (
                <div className="flex flex-col items-center justify-center h-72 gap-4">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                    style={{ background: G.primary.bg, border: `1.5px dashed ${G.primary.border}` }}>
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" style={{ color: G.primary.border }}>
                      <rect x="3" y="5" width="18" height="4" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
                      <rect x="3" y="11" width="18" height="4" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
                      <rect x="3" y="17" width="11" height="4" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-gray-400">Select a collection</p>
                    <p className="text-xs text-gray-300 mt-1">Choose a database and table to view documents</p>
                  </div>
                </div>
              ) : loadingDocs ? (
                <div className="flex flex-col gap-2 animate-pulse">
                  <div className="flex justify-between mb-5">
                    <div className="h-5 w-32 rounded-full bg-slate-100" />
                    <div className="h-8 w-44 rounded-xl bg-slate-100" />
                  </div>
                  {[1, 2, 3, 4, 5].map(n => <div key={n} className="h-11 rounded-xl bg-slate-100" />)}
                </div>
              ) : (
                <DocsTable docs={docs} dbName={selectedDb!} colName={selectedCol}
                  onUpdated={handleDocUpdated} onDeleted={handleDocDeleted} />
              )}
            </div>
        </div>
        
      </div>
    </>
  );
}