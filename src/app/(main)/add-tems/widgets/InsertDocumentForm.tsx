"use client";

import { useState, useRef } from "react";

type FieldType = "String" | "Number" | "Boolean" | "Image URL" | "URL" | "Email" | "Date" | "Null";

interface FieldDef { id: number; key: string; type: FieldType; value: string; }

interface InsertDocumentFormProps {
  dbName: string;
  collectionName: string;
  onInserted: (doc: Record<string, unknown>) => void;
  onBack: () => void;
}

const TYPE_META: Record<FieldType, { icon: string; iconBg: string; pillBg: string; pillText: string; placeholder: string }> = {
  String:      { icon: "Aa", iconBg: "#7c3aed", pillBg: "#ede9fe", pillText: "#5b21b6", placeholder: "value" },
  Number:      { icon: "12", iconBg: "#10b981", pillBg: "#d1fae5", pillText: "#065f46", placeholder: "0" },
  Boolean:     { icon: "T",  iconBg: "#f59e0b", pillBg: "#ffedd5", pillText: "#7c2d12", placeholder: "" },
  "Image URL": { icon: "🖼", iconBg: "#ec4899", pillBg: "#fce7f3", pillText: "#831843", placeholder: "https://img.example.com" },
  URL:         { icon: "🔗", iconBg: "#06b6d4", pillBg: "#cffafe", pillText: "#164e63", placeholder: "https://example.com" },
  Email:       { icon: "@",  iconBg: "#3b82f6", pillBg: "#dbeafe", pillText: "#1e3a8a", placeholder: "user@example.com" },
  Date:        { icon: "D",  iconBg: "#8b5cf6", pillBg: "#ede9fe", pillText: "#4c1d95", placeholder: "" },
  Null:        { icon: "∅",  iconBg: "#6b7280", pillBg: "#f3f4f6", pillText: "#374151", placeholder: "" },
};

const ALL_TYPES = Object.keys(TYPE_META) as FieldType[];

let _fid = 100;
const nextId = () => ++_fid;

// ─── Type Pill with dropdown ──────────────────────────────────────────────────
function TypePill({ type, onChange }: { type: FieldType; onChange: (t: FieldType) => void }) {
  const [open, setOpen] = useState(false);
  const m = TYPE_META[type];
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold border-none cursor-pointer transition-all hover:opacity-80 whitespace-nowrap"
        style={{ background: m.pillBg, color: m.pillText }}
      >
        <span className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0" style={{ background: m.iconBg }}>
          {m.icon}
        </span>
        {type}
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 4l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-1.5 z-20 bg-white border border-gray-200 rounded-xl shadow-xl py-1.5 min-w-[155px]">
            {ALL_TYPES.map((t) => {
              const tm = TYPE_META[t];
              return (
                <button
                  key={t} type="button"
                  onClick={() => { onChange(t); setOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors text-left"
                >
                  <span className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0" style={{ background: tm.iconBg }}>{tm.icon}</span>
                  {t}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Value input ──────────────────────────────────────────────────────────────
function ValInput({ field, onChange }: { field: FieldDef; onChange: (v: string) => void }) {
  const cls = "w-full border-none bg-transparent px-3 md:px-4 py-[11px] text-sm font-mono text-gray-800 placeholder-gray-300 outline-none focus:bg-indigo-50/30";
  if (field.type === "Boolean") return (
    <select value={field.value || "true"} onChange={(e) => onChange(e.target.value)} className={`${cls} cursor-pointer`}>
      <option value="true">true</option><option value="false">false</option>
    </select>
  );
  if (field.type === "Null") return <input className={`${cls} opacity-40 cursor-not-allowed`} value="null" disabled />;
  if (field.type === "Date") return <input type="date" value={field.value} onChange={(e) => onChange(e.target.value)} className={`${cls} cursor-pointer`} />;
  return <input className={cls} placeholder={TYPE_META[field.type].placeholder} value={field.value} onChange={(e) => onChange(e.target.value)} />;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function InsertDocumentForm({ dbName, collectionName, onInserted, onBack }: InsertDocumentFormProps) {
  const [fields, setFields] = useState<FieldDef[]>([
    { id: nextId(), key: "", type: "String", value: "" },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successCount, setSuccessCount] = useState(0);
  const dragIdx = useRef<number | null>(null);

  const addField = (type: FieldType = "String") => {
    setFields((f) => [...f, { id: nextId(), key: "", type, value: type === "Null" ? "null" : type === "Boolean" ? "true" : "" }]);
  };
  const removeField = (id: number) => setFields((f) => f.filter((fi) => fi.id !== id));
  const updKey = (id: number, key: string) => setFields((f) => f.map((fi) => fi.id === id ? { ...fi, key } : fi));
  const updVal = (id: number, value: string) => setFields((f) => f.map((fi) => fi.id === id ? { ...fi, value } : fi));
  const updType = (id: number, type: FieldType) => setFields((f) => f.map((fi) => fi.id === id ? { ...fi, type, value: type === "Null" ? "null" : type === "Boolean" ? "true" : "" } : fi));

  const handleDragStart = (i: number) => { dragIdx.current = i; };
  const handleDrop = (i: number) => {
    if (dragIdx.current === null || dragIdx.current === i) return;
    setFields((prev) => {
      const arr = [...prev];
      const [item] = arr.splice(dragIdx.current!, 1);
      arr.splice(i, 0, item);
      return arr;
    });
    dragIdx.current = null;
  };

  const buildDoc = () => {
    const doc: Record<string, unknown> = {};
    for (const f of fields) {
      if (!f.key.trim()) continue;
      const k = f.key.trim();
      if (f.type === "Number") doc[k] = Number(f.value) || 0;
      else if (f.type === "Boolean") doc[k] = f.value !== "false";
      else if (f.type === "Null") doc[k] = null;
      else doc[k] = f.value;
    }
    return doc;
  };

  const handleInsert = async () => {
    setError("");
    const doc = buildDoc();
    if (!Object.keys(doc).length) { setError("Add at least one field with a key."); return; }
    setLoading(true);
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/collections/${dbName}/${collectionName}/documents`,
        { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(doc) }
      );
    } catch { /* optimistic */ }
    onInserted({ ...doc, _insertedAt: new Date().toISOString() });
    setSuccessCount((n) => n + 1);
    setFields([{ id: nextId(), key: "", type: "String", value: "" }]);
    setLoading(false);
  };

  const preview = buildDoc();

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-4 md:mb-5 flex-wrap">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full truncate">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 inline-block flex-shrink-0" />{dbName}
        </span>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-gray-300 hidden sm:block flex-shrink-0">
          <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-3 py-1 rounded-full truncate">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block flex-shrink-0" />{collectionName}
        </span>
        {successCount > 0 && (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 border border-green-200 px-2.5 py-0.5 rounded-full flex-shrink-0">
            ✓ {successCount} inserted
          </span>
        )}
      </div>

      {/* ── Fields table — responsive ── */}
      <div className="border border-gray-200 rounded-2xl overflow-x-auto mb-5 shadow-sm">
        {/* Header row */}
        <div className="min-w-[600px] grid grid-cols-[1fr_170px_1fr_38px] bg-gray-50 border-b border-gray-200">
          {["KEY", "TYPE", "VALUE", ""].map((h, i) => (
            <span key={i} className="px-3 md:px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">{h}</span>
          ))}
        </div>

        {/* Field rows */}
        {fields.map((f, i) => (
          <div
            key={f.id}
            draggable
            onDragStart={() => handleDragStart(i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(i)}
            className="min-w-[600px] grid grid-cols-[1fr_170px_1fr_38px] border-b border-gray-100 last:border-b-0 hover:bg-gray-50/50 transition-colors group"
          >
            {/* KEY */}
            <input
              className="border-none border-r border-gray-100 bg-transparent px-3 md:px-4 py-[13px] text-sm font-mono text-gray-800 placeholder-gray-300 outline-none focus:bg-indigo-50/20 transition-colors"
              placeholder="field_name"
              value={f.key}
              onChange={(e) => updKey(f.id, e.target.value)}
            />
            {/* TYPE pill */}
            <div className="border-r border-gray-100 flex items-center px-2 md:px-3 overflow-x-auto">
              <TypePill type={f.type} onChange={(t) => updType(f.id, t)} />
            </div>
            {/* VALUE */}
            <div className="border-r border-gray-100 flex items-center">
              <ValInput field={f} onChange={(v) => updVal(f.id, v)} />
            </div>
            {/* Delete + drag */}
            <div className="flex items-center justify-center gap-0.5 px-1">
              <button
                type="button"
                onClick={() => removeField(f.id)}
                disabled={fields.length <= 1}
                className="w-6 h-6 rounded-lg flex items-center justify-center text-transparent group-hover:text-gray-300 hover:!text-red-500 hover:bg-red-50 transition-all disabled:hidden"
              >
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                  <path d="M2 2l8 8M10 2L2 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ── Add field chips — scrollable on mobile ── */}
      <div className="flex items-center gap-2 flex-wrap mb-5 overflow-x-auto pb-2">
        <span className="text-xs font-semibold text-gray-500 flex-shrink-0">Add field:</span>
        {ALL_TYPES.map((t) => {
          const m = TYPE_META[t];
          return (
            <button
              key={t} type="button" onClick={() => addField(t)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all hover:shadow-sm hover:-translate-y-px cursor-pointer flex-shrink-0"
              style={{ background: m.pillBg, color: m.pillText, borderColor: `${m.iconBg}33` }}
            >
              <span className="w-[18px] h-[18px] rounded-[5px] flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0" style={{ background: m.iconBg }}>
                {m.icon}
              </span>
              <span className="hidden sm:inline">{t}</span>
            </button>
          );
        })}
      </div>

      {error && <p className="text-xs text-red-500 font-medium mb-4">{error}</p>}

      {/* ── Footer: Back + Insert ── */}
      <div className="flex flex-col-reverse sm:flex-row items-center gap-3 justify-between mb-5">
        <button
          type="button" onClick={onBack}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-500 hover:text-gray-800 hover:border-gray-300 bg-white transition-all"
        >
          ← <span className="hidden sm:inline">Back</span>
          <span className="sm:hidden">Cancel</span>
        </button>
        <button
          type="button" onClick={handleInsert} disabled={loading}
          className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-5 md:px-7 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-white text-sm font-bold transition-all shadow-md shadow-green-100 disabled:opacity-60 disabled:cursor-not-allowed active:scale-95"
        >
          {loading ? (
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          ) : (
            <>
              <span className="hidden sm:inline">Insert document</span>
              <span className="sm:hidden">Insert</span>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </>
          )}
        </button>
      </div>

      {/* ── Preview JSON ── */}
      <details className="group">
        <summary className="text-xs font-semibold text-indigo-500 cursor-pointer select-none hover:text-indigo-700 list-none flex items-center gap-1.5">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="transition-transform group-open:rotate-90">
            <path d="M3 2l4 3-4 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Preview JSON
        </summary>
        <div className="mt-2 bg-indigo-50/60 border border-indigo-100 rounded-xl p-3 overflow-x-auto">
          <pre className="text-[11px] font-mono text-indigo-600 whitespace-pre-wrap break-words max-h-32 overflow-y-auto">
            {JSON.stringify(preview, null, 2) || "{}"}
          </pre>
        </div>
      </details>
    </div>
  );
}