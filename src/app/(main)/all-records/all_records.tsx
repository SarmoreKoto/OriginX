"use client";

import { useState, useEffect, useCallback } from "react";
import { getDatabases, getCollections } from "@/handler/collection_handler";
import { apiHandler } from "@/handler/api_handler";
import { MetaApi } from "@/config/metaApi";

// ─── Design Tokens ────────────────────────────────────────────────────────────
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 md:p-0" onClick={onClose}>
      <div className="bg-white rounded-xl md:rounded-2xl w-full max-w-[620px] max-h-[90vh] flex flex-col overflow-hidden"
        style={{ border: '1.5px solid #b6d9c5', boxShadow: '0 32px 80px rgba(26,58,42,0.18)' }}
        onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 md:px-7 py-4 md:py-5" style={{ background: G.primary.grad }}>
          <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
            <div className="w-8 md:w-10 h-8 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center text-white text-[9px] md:text-xs font-black flex-shrink-0"
              style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)' }}>
              {initials(collectionName)}
            </div>
            <div className="min-w-0">
              <h3 className="text-xs md:text-sm font-bold text-white">Edit Document</h3>
              <p className="text-[8px] md:text-[10px] text-green-200 mt-0.5 font-mono truncate">{docId}</p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-7 md:w-8 h-7 md:h-8 rounded-lg flex items-center justify-center text-green-200 hover:text-white hover:bg-white/15 transition-all flex-shrink-0">
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
          </button>
        </div>

        {/* Fields */}
        <div className="overflow-y-auto flex-1 p-3 md:p-6" style={{ background: '#f6fdf9' }}>
          <div className="hidden md:grid grid-cols-[1fr_1fr_32px] gap-2 mb-3 px-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Field</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Value</span>
            <span />
          </div>
          <div className="flex flex-col gap-2">
            {fields.map((f, i) => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_32px] gap-2 group">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 md:hidden mb-1 block">Field</label>
                  <input value={f.key} onChange={e => updKey(i, e.target.value)} placeholder="field_name"
                    className="border rounded-lg md:rounded-xl px-2 md:px-3 py-2 text-xs font-mono text-gray-800 outline-none bg-white transition-all w-full"
                    style={{ borderColor: '#e8edf5' }}
                    onFocus={e => e.target.style.borderColor = G.primary.text}
                    onBlur={e => e.target.style.borderColor = '#e8edf5'} />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 md:hidden mb-1 block">Value</label>
                  <input value={f.value} onChange={e => updVal(i, e.target.value)} placeholder="value"
                    className="border rounded-lg md:rounded-xl px-2 md:px-3 py-2 text-xs font-mono outline-none bg-white transition-all w-full"
                    style={{ borderColor: '#e8edf5', color: G.accent.text }}
                    onFocus={e => e.target.style.borderColor = G.primary.text}
                    onBlur={e => e.target.style.borderColor = '#e8edf5'} />
                </div>
                <button onClick={() => removeRow(i)}
                  className="w-7 md:w-8 h-7 md:h-8 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 md:opacity-0 group-hover:opacity-100">
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2 2l8 8M10 2L2 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                </button>
              </div>
            ))}
          </div>
          <button onClick={addRow} className="mt-3 md:mt-4 flex items-center gap-2 text-xs font-bold transition-all hover:opacity-70"
            style={{ color: G.accent.text }}>
            <svg width="13" height="13" viewBox="0 0 12 12" fill="none"><path d="M6 2v8M2 6h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
            Add field
          </button>
          {error && <p className="mt-3 text-xs font-semibold text-red-600">{error}</p>}
        </div>

        {/* Footer */}
        <div className="px-3 md:px-7 py-3 md:py-5 flex gap-2 md:gap-3 flex-col-reverse sm:flex-row" style={{ borderTop: '1px solid #e8edf5', background: 'white' }}>
          <button onClick={onClose}
            className="flex-1 py-2.5 md:py-3 rounded-lg md:rounded-xl border text-xs md:text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-all"
            style={{ borderColor: '#e8edf5' }}>Cancel</button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 py-2.5 md:py-3 rounded-lg md:rounded-xl text-white text-xs md:text-sm font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ background: G.primary.grad, boxShadow: '0 4px 14px rgba(26,58,42,0.3)' }}>
            {saving
              ? <svg className="animate-spin w-3 md:w-4 h-3 md:h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onCancel}>
      <div className="bg-white rounded-xl md:rounded-2xl w-full max-w-[380px] p-5 md:p-8 flex flex-col items-center gap-4 md:gap-5"
        style={{ border: `1.5px solid ${G.danger.border}`, boxShadow: '0 32px 80px rgba(244,63,94,0.16)' }}
        onClick={e => e.stopPropagation()}>
        <div className="w-11 md:w-14 h-11 md:h-14 rounded-2xl flex items-center justify-center"
          style={{ background: G.danger.bg, border: `2px solid ${G.danger.border}` }}>
          <svg width="20" height="20" viewBox="0 0 26 26" fill="none" style={{ color: G.danger.text }}>
            <path d="M3.5 6.5h19M10 6.5V5a1 1 0 011-1h4a1 1 0 011 1v1.5M5 6.5l1.2 14A2 2 0 008.2 22.5h9.6a2 2 0 002-1.8L21 6.5"
              stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="text-center">
          <h3 className="text-sm md:text-base font-bold text-gray-900 mb-1">Delete Document?</h3>
          <p className="text-xs md:text-sm text-gray-400">This action cannot be undone.</p>
        </div>
        <div className="flex gap-2 md:gap-3 w-full flex-col-reverse sm:flex-row">
          <button onClick={onCancel}
            className="flex-1 py-2.5 md:py-3 rounded-lg md:rounded-xl border text-xs md:text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-all"
            style={{ borderColor: '#e8edf5' }}>Cancel</button>
          <button onClick={onConfirm} disabled={deleting}
            className="flex-1 py-2.5 md:py-3 rounded-lg md:rounded-xl text-white text-xs md:text-sm font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ background: G.danger.grad, boxShadow: '0 4px 14px rgba(244,63,94,0.3)' }}>
            {deleting
              ? <svg className="animate-spin w-3 md:w-4 h-3 md:h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 md:gap-4 mb-4 md:mb-5">
        <div className="flex items-center gap-2 md:gap-3">
          <span className="text-xs font-black uppercase tracking-widest" style={{ color: G.gray.text }}>Documents</span>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold"
            style={{ background: G.primary.bg, color: G.primary.text, border: `1px solid ${G.primary.border}` }}>
            {docs.length}
          </span>
        </div>
        <div className="relative w-full sm:w-auto">
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none"
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: G.accent.text }}>
            <circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.4" />
            <path d="M10 10l2.5 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search documents…"
            className="rounded-lg md:rounded-xl pl-8 pr-3 py-2 text-xs text-gray-700 placeholder-gray-400 outline-none transition-all w-full sm:w-48 bg-white"
            style={{ border: '1px solid #e8edf5' }}
            onFocus={e => e.target.style.borderColor = G.accent.text}
            onBlur={e => e.target.style.borderColor = '#e8edf5'} />
        </div>
      </div>

      {/* Table — Scrollable on mobile */}
      <div className="rounded-lg md:rounded-2xl overflow-hidden" style={{ border: '1px solid #e8edf5' }}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-full">
            <thead>
              <tr style={{ background: '#f4f6fb', borderBottom: '1px solid #e8edf5' }}>
                <th className="px-3 md:px-5 py-2 md:py-3.5 text-left text-[9px] md:text-[9px] font-black uppercase tracking-widest w-8 md:w-12"
                  style={{ color: '#9ca3af' }}>S.No</th>
                {allKeys.slice(0, 3).map(k => (
                  <th key={k} className="px-3 md:px-5 py-2 md:py-3.5 text-left text-[9px] font-black uppercase tracking-widest whitespace-nowrap hidden sm:table-cell"
                    style={{ color: '#9ca3af' }}>{k}</th>
                ))}
                <th className="px-3 md:px-5 py-2 md:py-3.5 text-right text-[9px] font-black uppercase tracking-widest"
                  style={{ color: '#9ca3af' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={allKeys.length + 2} className="py-12 md:py-20 text-center">
                    <div className="flex flex-col items-center gap-2 md:gap-3 px-4">
                      <div className="w-12 md:w-14 h-12 md:h-14 rounded-2xl flex items-center justify-center"
                        style={{ background: G.primary.bg, border: `1.5px dashed ${G.primary.border}` }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ color: G.primary.border }}>
                          <rect x="3" y="5" width="18" height="4" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
                          <rect x="3" y="11" width="18" height="4" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
                          <rect x="3" y="17" width="11" height="4" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
                        </svg>
                      </div>
                      <p className="text-xs md:text-sm font-bold text-gray-400">No documents found</p>
                      <p className="text-[10px] md:text-xs text-gray-300">{search ? 'Try a different search term' : 'This collection is empty'}</p>
                    </div>
                  </td>
                </tr>
              ) : filtered.map((doc, i) => (
                <tr key={i} className="group transition-all hover:bg-[#f6fdf9]"
                  style={{ borderTop: i > 0 ? '1px solid #f4f6fb' : 'none' }}>
                  {/* S.No */}
                  <td className="px-3 md:px-5 py-2 md:py-3.5">
                    <span className="w-6 md:w-7 h-6 md:h-7 rounded-lg flex items-center justify-center text-[10px] md:text-[11px] font-bold"
                      style={{ background: G.primary.bg, color: G.primary.text, border: `1px solid ${G.primary.border}` }}>
                      {i + 1}
                    </span>
                  </td>
                  {allKeys.slice(0, 3).map(k => (
                    <td key={k} className="px-3 md:px-5 py-2 md:py-3.5 text-[10px] md:text-xs whitespace-nowrap max-w-[150px] md:max-w-[200px] truncate hidden sm:table-cell"
                      style={{
                        color: k === '_id' ? '#9ca3af' : '#1a3a2a',
                        fontFamily: k === '_id' ? 'monospace' : 'inherit',
                        fontWeight: k === '_id' ? 400 : 600
                      }}>
                      {doc[k] !== undefined ? String(doc[k]) : <span className="text-gray-300 italic">—</span>}
                    </td>
                  ))}
                  <td className="px-3 md:px-5 py-2 md:py-3.5">
                    <div className="flex items-center justify-end gap-1 md:gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={() => setEditDoc(doc)}
                        className="flex items-center gap-1 px-2 md:px-3 py-1.5 rounded-lg text-[10px] md:text-[11px] font-bold transition-all hidden sm:flex"
                        style={{ background: G.primary.bg, color: G.primary.text, border: `1px solid ${G.primary.border}` }}
                        onMouseEnter={e => e.currentTarget.style.background = G.primary.border}
                        onMouseLeave={e => e.currentTarget.style.background = G.primary.bg}>
                        <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M8.5 1.5l2 2-7 7H1.5v-2l7-7z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        Edit
                      </button>
                      <button onClick={() => setDeleteDocId(String(doc._id ?? i))}
                        className="flex items-center gap-1 px-2 md:px-3 py-1.5 rounded-lg text-[10px] md:text-[11px] font-bold transition-all hidden sm:flex"
                        style={{ background: G.danger.bg, color: G.danger.text, border: `1px solid ${G.danger.border}` }}
                        onMouseEnter={e => e.currentTarget.style.background = G.danger.border}
                        onMouseLeave={e => e.currentTarget.style.background = G.danger.bg}>
                        <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M1.5 3h9M4.5 3V2.25h3V3M3.5 3l.5 6.5h4l.5-6.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        Delete
                      </button>
                      {/* Mobile compact buttons */}
                      <button onClick={() => setEditDoc(doc)} className="sm:hidden w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50">
                        <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M8.5 1.5l2 2-7 7H1.5v-2l7-7z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </button>
                      <button onClick={() => setDeleteDocId(String(doc._id ?? i))} className="sm:hidden w-7 h-7 flex items-center justify-center rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50">
                        <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M1.5 3h9M4.5 3V2.25h3V3M3.5 3l.5 6.5h4l.5-6.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length > 0 && (
          <div className="px-3 md:px-5 py-2 md:py-3 flex items-center justify-between text-[10px] md:text-xs flex-col sm:flex-row gap-2 sm:gap-0"
            style={{ borderTop: '1px solid #e8edf5', background: '#f4f6fb' }}>
            <p className="text-gray-400">
              Showing <span className="font-bold text-gray-600">{filtered.length}</span> of{' '}
              <span className="font-bold text-gray-600">{docs.length}</span>
            </p>
            <div className="flex items-center gap-1.5">
              <span className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-gray-400 font-medium">Live</span>
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
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

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
    setShowMobileSidebar(false);
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

  return (
    <>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse2 { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(1.5)} }
      `}</style>

      <div className="min-h-screen font-sans" style={{ background: '#f4f6fb' }}>
        {error && (
          <div className="fixed top-4 left-4 right-4 z-50 flex items-center gap-2 md:gap-3 px-3 md:px-5 py-2 md:py-3 bg-white shadow-lg rounded-lg md:rounded-xl max-w-sm md:left-1/2 md:right-auto md:-translate-x-1/2"
            style={{ border: '1px solid #fecdd3' }}>
            <span className="text-xs md:text-xs font-medium flex-1 text-red-600 line-clamp-2">{error}</span>
            <button onClick={() => setError('')} className="text-red-400 text-lg leading-none flex-shrink-0">×</button>
          </div>
        )}

        <div className="p-4 md:p-6 max-w-[1600px] mx-auto">

          {/* ── Header ── */}
          <div className="flex items-center justify-between mb-4 md:mb-7 gap-2">
            <div>
              <h1 className="text-lg md:text-2xl font-extrabold tracking-tight" style={{ color: G.primary.text }}>All Documents</h1>
              <div className="flex items-center gap-1.5 md:gap-2 mt-0.5 md:mt-1">
                <span className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-green-500" style={{ animation: 'pulse2 2s ease-in-out infinite' }} />
                <p className="text-[10px] md:text-xs font-medium text-gray-400">MongoDB · Browse, edit and delete documents</p>
              </div>
            </div>
            <button onClick={() => setShowMobileSidebar(!showMobileSidebar)} className="md:hidden flex-shrink-0 p-2 rounded-lg hover:bg-gray-200 transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
            </button>
          </div>

          {/* ── Three-panel layout ── */}
          <div className="flex gap-3 md:gap-4 items-start flex-col md:flex-row relative">

            {/* Mobile Sidebar Overlay */}
            {showMobileSidebar && <div className="fixed inset-0 bg-black/40 z-30 md:hidden" onClick={() => setShowMobileSidebar(false)} />}

            {/* DB Panel */}
            <div className={`absolute md:relative left-0 top-0 w-64 md:w-[220px] h-screen md:h-auto z-40 md:z-auto rounded-r-2xl md:rounded-2xl overflow-hidden flex-shrink-0 bg-white transform transition-transform md:transform-none ${showMobileSidebar ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
              style={{ border: '1px solid #e8edf5', boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
              <div className="px-3 md:px-4 py-3 md:py-4" style={{ background: '#f4f6fb', borderBottom: '1px solid #e8edf5' }}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 truncate">Databases</span>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{ background: G.primary.bg, color: G.primary.text, border: `1px solid ${G.primary.border}` }}>
                    {databases.length}
                  </span>
                </div>
              </div>
              <div className="p-1 md:p-2 max-h-[calc(100vh-100px)] md:max-h-none overflow-y-auto">
                {loadingDbs ? (
                  <div className="flex flex-col gap-1 p-1">{[1, 2, 3].map(n => <div key={n} className="h-10 rounded-lg animate-pulse bg-slate-100" />)}</div>
                ) : databases.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 gap-2">
                    <p className="text-xs font-bold text-gray-400">No databases</p>
                  </div>
                ) : databases.map(db => {
                  const active = selectedDb === db.name;
                  return (
                    <button key={db.name} onClick={() => handleSelectDb(db.name)}
                      className="w-full flex items-center gap-2 px-2 md:px-2.5 py-2.5 rounded-lg border transition-all text-left mb-0.5"
                      style={{
                        background: active ? G.primary.bg : 'transparent',
                        border: active ? `1px solid ${G.primary.border}` : '1px solid transparent'
                      }}>
                      <div className="w-7 md:w-8 h-7 md:h-8 rounded-lg flex items-center justify-center text-[9px] md:text-[10px] font-black flex-shrink-0 transition-all"
                        style={{
                          background: active ? G.primary.grad : '#f0faf4',
                          color: active ? 'white' : G.accent.text,
                          boxShadow: active ? '0 2px 8px rgba(26,58,42,0.25)' : 'none'
                        }}>
                        {initials(db.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs md:text-xs font-bold truncate" style={{ color: active ? G.primary.text : '#374151' }}>{db.name}</p>
                        <p className="text-[9px] md:text-[10px] font-semibold text-gray-400">{db.sizeMB} MB</p>
                      </div>
                      {active && <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-green-500" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Collections Panel */}
            <div className="rounded-lg md:rounded-2xl overflow-hidden flex-shrink-0 w-full md:w-[220px] bg-white hidden md:block"
              style={{ border: '1px solid #e8edf5', boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
              <div className="px-3 md:px-4 py-3 md:py-4" style={{ background: '#f4f6fb', borderBottom: '1px solid #e8edf5' }}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Tables</span>
                  {selectedDb && (
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{ background: G.primary.bg, color: G.primary.text, border: `1px solid ${G.primary.border}` }}>
                      {collections.length}
                    </span>
                  )}
                </div>
              </div>
              <div className="p-2">
                {!selectedDb ? (
                  <div className="flex flex-col items-center justify-center py-8 gap-2">
                    <p className="text-xs font-bold text-gray-400 text-center">Select a database</p>
                  </div>
                ) : loadingCols ? (
                  <div className="flex flex-col gap-1 p-1">{[1, 2].map(n => <div key={n} className="h-10 rounded-lg animate-pulse bg-slate-100" />)}</div>
                ) : collections.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <p className="text-xs font-bold text-gray-400">No tables</p>
                  </div>
                ) : collections.map(col => {
                  const active = selectedCol === col.name;
                  return (
                    <button key={col.name} onClick={() => handleSelectCol(col.name)}
                      className="w-full flex items-center gap-2 px-2.5 py-2.5 rounded-lg border transition-all text-left mb-0.5"
                      style={{
                        background: active ? G.primary.bg : 'transparent',
                        border: active ? `1px solid ${G.primary.border}` : '1px solid transparent'
                      }}>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all"
                        style={{
                          background: active ? G.primary.grad : '#f0faf4',
                          boxShadow: active ? '0 2px 8px rgba(26,58,42,0.25)' : 'none'
                        }}>
                        <svg width="12" height="12" viewBox="0 0 18 18" fill="none">
                          <rect x="2" y="3" width="14" height="3" rx="1.2" fill={active ? 'white' : G.accent.text} opacity={active ? "1" : "0.9"} />
                          <rect x="2" y="8" width="14" height="3" rx="1.2" fill={active ? 'white' : G.accent.text} opacity={active ? "1" : "0.65"} />
                          <rect x="2" y="13" width="9" height="3" rx="1.2" fill={active ? 'white' : G.accent.text} opacity={active ? "1" : "0.4"} />
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

            {/* Documents Panel */}
            <div className="rounded-lg md:rounded-2xl overflow-hidden flex-1 bg-white"
              style={{ border: '1px solid #e8edf5', boxShadow: '0 1px 8px rgba(0,0,0,0.04)', padding: '16px md:24px', minHeight: '400px' }}>
              {!selectedCol ? (
                <div className="flex flex-col items-center justify-center h-64 md:h-72 gap-3 md:gap-4">
                  <div className="w-14 md:w-16 h-14 md:h-16 rounded-2xl flex items-center justify-center"
                    style={{ background: G.primary.bg, border: `1.5px dashed ${G.primary.border}` }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ color: G.primary.border }}>
                      <rect x="3" y="5" width="18" height="4" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
                      <rect x="3" y="11" width="18" height="4" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
                      <rect x="3" y="17" width="11" height="4" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="text-xs md:text-sm font-bold text-gray-400">Select a collection</p>
                    <p className="text-[10px] md:text-xs text-gray-300 mt-1">Choose a database and table to view documents</p>
                  </div>
                </div>
              ) : loadingDocs ? (
                <div className="flex flex-col gap-2 animate-pulse">
                  <div className="h-4 md:h-5 w-32 rounded-full bg-slate-100" />
                  {[1, 2, 3, 4].map(n => <div key={n} className="h-9 md:h-11 rounded-lg bg-slate-100" />)}
                </div>
              ) : (
                <DocsTable docs={docs} dbName={selectedDb!} colName={selectedCol}
                  onUpdated={handleDocUpdated} onDeleted={handleDocDeleted} />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}