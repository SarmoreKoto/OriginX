"use client";

import { useState, useEffect, useRef } from "react";

/* ─── Types ───────────────────────────────────────────────────────── */
type DataType = "string" | "number" | "boolean" | "array" | "object" | "imageUrl" | "url" | "email" | "date" | "objectId" | "null";
interface FieldDef { id: string; key: string; value: string; type: DataType; }
type Step = "db" | "collection" | "items" | "done";
interface RecentEntry { id: string; dbName: string; collectionName: string; docCount: number; createdAt: Date; }

const slugify = (s: string) => s.trim().replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_-]/g, "");
const uid = () => Math.random().toString(36).slice(2, 9);

const STEPS = [
  { id: "db",         num: "01", label: "Database",   sub: "Name your database"  },
  { id: "collection", num: "02", label: "Collection", sub: "Create a collection" },
  { id: "items",      num: "03", label: "Documents",  sub: "Seed your first doc" },
  { id: "done",       num: "04", label: "Complete",   sub: "Review and finish"   },
] as const;

const DATA_TYPES: { value: DataType; label: string; color: string; bg: string; border: string; icon: string; gradient: string }[] = [
  { value: "string",   label: "String",    color: "#4338ca", bg: "#eef2ff", border: "#c7d2fe", icon: "Aa", gradient: "linear-gradient(135deg,#4338ca,#6366f1)" },
  { value: "number",   label: "Number",    color: "#0f766e", bg: "#f0fdfa", border: "#99f6e4", icon: "12", gradient: "linear-gradient(135deg,#0f766e,#14b8a6)" },
  { value: "boolean",  label: "Boolean",   color: "#b45309", bg: "#fffbeb", border: "#fde68a", icon: "⊤",  gradient: "linear-gradient(135deg,#b45309,#f59e0b)" },
  { value: "imageUrl", label: "Image URL", color: "#be123c", bg: "#fff1f2", border: "#fecdd3", icon: "🖼", gradient: "linear-gradient(135deg,#be123c,#f43f5e)" },
  { value: "url",      label: "URL",       color: "#0369a1", bg: "#f0f9ff", border: "#bae6fd", icon: "🔗", gradient: "linear-gradient(135deg,#0369a1,#0ea5e9)" },
  { value: "email",    label: "Email",     color: "#166534", bg: "#f0fdf4", border: "#bbf7d0", icon: "@",  gradient: "linear-gradient(135deg,#166534,#22c55e)" },
  { value: "date",     label: "Date",      color: "#6d28d9", bg: "#f5f3ff", border: "#ddd6fe", icon: "📅", gradient: "linear-gradient(135deg,#6d28d9,#8b5cf6)" },
  { value: "null",     label: "Null",      color: "#475569", bg: "#f8fafc", border: "#e2e8f0", icon: "∅",  gradient: "linear-gradient(135deg,#475569,#94a3b8)" },
];

/* ─── Dashboard Color Palette ─────────────────────────────────────── */
const C = {
  pageBg:        "#f4f6fb",
  cardBg:        "#ffffff",
  border:        "#e5e7eb",
  borderHi:      "#d1d5db",
  text:          "#111827",
  textBody:      "#374151",
  textSub:       "#6b7280",
  textMuted:     "#9ca3af",
  textFaint:     "#d1d5db",
  // Primary — dark green (matches dashboard)
  primary:       "#1a5c3a",
  primaryDark:   "#0f3d26",
  primaryLight:  "#f0faf4",
  primaryBorder: "#d1fae5",
  primaryGrad:   "linear-gradient(135deg,#1a5c3a,#0f3d26)",
  primaryGlow:   "rgba(26,92,58,0.15)",
  // Success green accent (lighter, used for active badges)
  success:       "#22c55e",
  successSoft:   "#f0fdf4",
  successBorder: "#bbf7d0",
  successDark:   "#15803d",
  // Danger
  red:           "#ef4444",
  redSoft:       "#fef2f2",
  redBorder:     "#fecaca",
  // Surface
  surfaceSoft:   "#f9fafb",
  surfaceMuted:  "#f3f4f6",
};

function getTypeMeta(t: DataType) {
  return DATA_TYPES.find(d => d.value === t) ?? DATA_TYPES[0];
}
function getDefaultValue(t: DataType): string {
  const map: Record<DataType, string> = {
    string: "", number: "0", boolean: "true", array: "[]", object: "{}",
    imageUrl: "https://", url: "https://", email: "user@example.com",
    date: new Date().toISOString().slice(0, 10), objectId: "", null: "null",
  };
  return map[t];
}
function formatDate(d: Date) { return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); }
function formatTime(d: Date) { return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }); }
function timeAgo(d: Date) {
  const m = Math.floor((Date.now() - d.getTime()) / 60000);
  if (m < 1) return "just now"; if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`; return `${Math.floor(h / 24)}d ago`;
}

/* ─── Spinner ─────────────────────────────────────────────────────── */
function Spinner() {
  return <span style={{ width:16, height:16, border:"2.5px solid rgba(255,255,255,0.3)", borderTopColor:"#fff", borderRadius:"50%", display:"inline-block", animation:"ccSpin .6s linear infinite" }} />;
}

function ChevronRight({ size=14, color="currentColor" }: { size?: number; color?: string }) {
  return <svg width={size} height={size} viewBox="0 0 16 16" fill="none"><path d="M6 12l4-4-4-4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}

/* ─── Type Dropdown ───────────────────────────────────────────────── */
function TypeDropdown({ value, onChange }: { value: DataType; onChange: (t: DataType) => void }) {
  const [open, setOpen] = useState(false);
  const meta = getTypeMeta(value);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div ref={ref} style={{ position:"relative", zIndex: open ? 9999 : 1 }}>
      <button type="button" onClick={() => setOpen(o => !o)} style={{
        display:"flex", alignItems:"center", gap:8, padding:"8px 14px", borderRadius:10,
        background: meta.bg, border:`1.5px solid ${meta.border}`, color: meta.color,
        fontSize:12.5, fontWeight:600, cursor:"pointer", whiteSpace:"nowrap",
        fontFamily:"'JetBrains Mono',monospace", transition:"all .2s",
        boxShadow:`0 1px 2px ${meta.color}15`,
      }}>
        <span style={{ width:20, height:20, borderRadius:6, background:meta.gradient, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, color:"#fff", fontWeight:700 }}>{meta.icon}</span>
        {meta.label}
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ opacity:.5, marginLeft:2, transition:"transform .2s", transform:open?"rotate(180deg)":"none" }}>
          <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      </button>
      {open && (
        <div style={{
          position:"absolute", top:"calc(100% + 8px)", left:0, zIndex:60,
          background:"#fff", border:`1px solid ${C.border}`, borderRadius:14, padding:8, minWidth:220,
          boxShadow:"0 20px 50px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06)",
          display:"grid", gridTemplateColumns:"1fr 1fr", gap:4,
          animation:"ccDropdownIn .2s cubic-bezier(.4,0,.2,1)",
        }}>
          {DATA_TYPES.map(dt => (
            <button key={dt.value} type="button" onClick={() => { onChange(dt.value); setOpen(false); }}
              style={{
                display:"flex", alignItems:"center", gap:8, padding:"8px 12px", borderRadius:8, border:"none",
                background: dt.value===value ? dt.bg : "transparent",
                color: dt.value===value ? dt.color : C.textBody,
                fontSize:12.5, fontWeight:500, cursor:"pointer", textAlign:"left",
                fontFamily:"'JetBrains Mono',monospace", transition:"all .15s",
              }}
              onMouseEnter={e=>{ if(dt.value!==value){ (e.currentTarget as HTMLElement).style.background=C.surfaceSoft; }}}
              onMouseLeave={e=>{ if(dt.value!==value){ (e.currentTarget as HTMLElement).style.background="transparent"; }}}
            >
              <span style={{ width:18, height:18, borderRadius:5, background:dt.gradient, display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, color:"#fff", fontWeight:700, flexShrink:0 }}>{dt.icon}</span>
              {dt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Boolean Toggle ──────────────────────────────────────────────── */
function BooleanToggle({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display:"flex", gap:4, alignItems:"center", background:C.surfaceMuted, padding:4, borderRadius:10, border:`1.5px solid ${C.border}` }}>
      {["true","false"].map(v => {
        const active = value === v;
        return (
          <button key={v} type="button" onClick={() => onChange(v)} style={{
            padding:"7px 20px", borderRadius:8, border:"none", fontSize:12.5, fontWeight:700,
            cursor:"pointer", transition:"all .2s",
            background: active ? (v==="true" ? C.primaryGrad : "linear-gradient(135deg,#be123c,#f43f5e)") : "transparent",
            color: active ? "#fff" : C.textSub,
            fontFamily:"'JetBrains Mono',monospace",
            boxShadow: active ? (v==="true"?"0 2px 8px rgba(26,92,58,0.3)":"0 2px 8px rgba(239,68,68,0.3)") : "none",
          }}>{v}</button>
        );
      })}
    </div>
  );
}

/* ─── Value Input ─────────────────────────────────────────────────── */
function ValueInput({ field, onChange }: { field: FieldDef; onChange: (v: string) => void }) {
  const base: React.CSSProperties = {
    width:"100%", padding:"9px 14px", borderRadius:10,
    background:"#fff", border:`1.5px solid ${C.border}`,
    color:C.text, fontSize:13.5, fontFamily:"'JetBrains Mono',monospace",
    outline:"none", transition:"all .2s", boxSizing:"border-box",
  };
  if (field.type === "boolean") return <BooleanToggle value={field.value} onChange={onChange} />;
  if (field.type === "null") return <div style={{ ...base, color:C.textMuted, fontStyle:"italic", display:"flex", alignItems:"center", background:C.surfaceSoft, borderStyle:"dashed" }}>null</div>;
  if (field.type === "array" || field.type === "object") return <textarea rows={2} className="cc-input" style={{ ...base, resize:"vertical", lineHeight:1.6, minHeight:60 }} placeholder={field.type==="array"?`["val1","val2"]`:`{"key":"value"}`} value={field.value} onChange={e=>onChange(e.target.value)} />;
  if (field.type === "imageUrl") return (
    <div style={{ display:"flex", flexDirection:"column", gap:8, flex:1 }}>
      <input className="cc-input" style={base} placeholder="https://example.com/image.png" value={field.value} onChange={e=>onChange(e.target.value)} />
      {field.value.startsWith("http") && (
        <div style={{ width:64, height:44, borderRadius:8, overflow:"hidden", border:`1.5px solid ${C.border}`, background:C.surfaceSoft }}>
          <img src={field.value} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={e=>{(e.target as HTMLImageElement).style.display="none";}} />
        </div>
      )}
    </div>
  );
  if (field.type === "date") return <input type="date" className="cc-input" style={base} value={field.value} onChange={e=>onChange(e.target.value)} />;
  return <input className="cc-input" style={base} type={field.type==="email"?"email":field.type==="number"?"number":"text"} placeholder={field.type==="email"?"user@example.com":field.type==="number"?"0":field.type==="url"?"https://example.com":"value"} value={field.value} onChange={e=>onChange(e.target.value)} />;
}

/* ─── Avatar (initials) ───────────────────────────────────────────── */
function Avatar({ name }: { name: string }) {
  const GRADS = [
    "linear-gradient(135deg,#1a5c3a,#22c55e)",
    "linear-gradient(135deg,#0f766e,#14b8a6)",
    "linear-gradient(135deg,#1e40af,#60a5fa)",
    "linear-gradient(135deg,#6d28d9,#8b5cf6)",
    "linear-gradient(135deg,#be123c,#f43f5e)",
  ];
  let h = 0; for (const c of name) h = (h*31+c.charCodeAt(0))&0xffffff;
  const grad = GRADS[Math.abs(h) % GRADS.length];
  const ini = name.split(/[\s_\-]+/).map(n=>n[0]).slice(0,2).join('').toUpperCase();
  return (
    <div style={{ width:36, height:36, borderRadius:10, background:grad, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:12, fontWeight:800, flexShrink:0, boxShadow:"0 3px 8px rgba(0,0,0,0.12)" }}>
      {ini}
    </div>
  );
}

/* ─── Pagination ──────────────────────────────────────────────────── */
function Pagination({ page, total, pageSize, onChange }: { page:number; total:number; pageSize:number; onChange:(p:number)=>void }) {
  const totalPages = Math.ceil(total/pageSize);
  if (totalPages <= 1) return null;
  const pages: (number|'…')[] = [];
  if (totalPages<=7) { for(let i=1;i<=totalPages;i++) pages.push(i); }
  else {
    pages.push(1); if(page>3) pages.push('…');
    for(let i=Math.max(2,page-1);i<=Math.min(totalPages-1,page+1);i++) pages.push(i);
    if(page<totalPages-2) pages.push('…'); pages.push(totalPages);
  }
  const btnBase: React.CSSProperties = { minWidth:32, height:32, borderRadius:8, fontSize:12, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", transition:"all .15s", cursor:"pointer", border:`1px solid ${C.border}` };
  return (
    <div style={{ display:"flex", alignItems:"center", gap:6 }}>
      <button onClick={()=>onChange(page-1)} disabled={page===1}
        style={{ ...btnBase, background:page===1?"#f9fafb":"#fff", color:page===1?C.textFaint:C.textBody, cursor:page===1?"not-allowed":"pointer" }}
        onMouseEnter={e=>{ if(page>1)(e.currentTarget as HTMLElement).style.borderColor=C.primary; }}
        onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.borderColor=C.border; }}>
        <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>
      {pages.map((p,i) => p==='…' ? (
        <span key={`e${i}`} style={{ ...btnBase, border:"none", color:C.textMuted, cursor:"default" }}>…</span>
      ) : (
        <button key={p} onClick={()=>onChange(p as number)}
          style={{ ...btnBase, background:page===p?C.primaryGrad:"#fff", color:page===p?"#fff":C.textBody, border:page===p?`1px solid ${C.primary}`:`1px solid ${C.border}`, boxShadow:page===p?"0 2px 8px rgba(26,92,58,0.25)":"none" }}
          onMouseEnter={e=>{ if(page!==p)(e.currentTarget as HTMLElement).style.borderColor=C.primary; }}
          onMouseLeave={e=>{ if(page!==p)(e.currentTarget as HTMLElement).style.borderColor=C.border; }}
        >{p}</button>
      ))}
      <button onClick={()=>onChange(page+1)} disabled={page===totalPages}
        style={{ ...btnBase, background:page===totalPages?"#f9fafb":"#fff", color:page===totalPages?C.textFaint:C.textBody, cursor:page===totalPages?"not-allowed":"pointer" }}
        onMouseEnter={e=>{ if(page<totalPages)(e.currentTarget as HTMLElement).style.borderColor=C.primary; }}
        onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.borderColor=C.border; }}>
        <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>
    </div>
  );
}

/* ─── Main Page ───────────────────────────────────────────────────── */
export default function CreateCollectionPage() {
  const [step, setStep]       = useState<Step>("db");
  const [dbName, setDbName]   = useState("");
  const [colName, setColName] = useState("");
  const [fields, setFields]   = useState<FieldDef[]>([{ id:uid(), key:"", value:"", type:"string" }]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [result, setResult]   = useState<Record<string,unknown>|null>(null);
  const [recent, setRecent]   = useState<RecentEntry[]>([]);
  const [recentPage, setRecentPage] = useState(1);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const stepIdx  = STEPS.findIndex(s => s.id === step);
  const PER_PAGE = 10;

  const handleDbStep = async () => {
    setError("");
    const name = slugify(dbName);
    if (!name) return setError("Enter a valid database name.");
    setLoading(true); await new Promise(r=>setTimeout(r,600));
    setDbName(name); setLoading(false); setStep("collection");
  };

  const handleCollectionStep = async () => {
    setError("");
    const col = slugify(colName);
    if (!col) return setError("Enter a valid collection name.");
    setLoading(true); await new Promise(r=>setTimeout(r,600));
    setColName(col); setLoading(false); setStep("items");
  };

  const handleInsert = async () => {
    setError("");
    const doc: Record<string,unknown> = {};
    for (const f of fields) {
      if (!f.key.trim()) continue;
      if (f.type==="number") { doc[f.key]=parseFloat(f.value)||0; }
      else if (f.type==="boolean") { doc[f.key]=f.value==="true"; }
      else if (f.type==="null") { doc[f.key]=null; }
      else if (f.type==="array"||f.type==="object") { try { doc[f.key]=JSON.parse(f.value); } catch { doc[f.key]=f.value; } }
      else { doc[f.key]=f.value; }
    }
    if (!Object.keys(doc).length) return setError("Add at least one field with a key.");
    setLoading(true); await new Promise(r=>setTimeout(r,800)); setLoading(false);
    setResult(doc);
    setRecent(prev=>[{ id:crypto.randomUUID(), dbName, collectionName:colName, docCount:Object.keys(doc).length, createdAt:new Date() },...prev]);
    setRecentPage(1); setStep("done");
  };

  const addField    = (type: DataType="string") => setFields(f=>[...f,{ id:uid(), key:"", value:getDefaultValue(type), type }]);
  const removeField = (id: string) => setFields(f=>f.filter(x=>x.id!==id));
  const updateField = (id: string, patch: Partial<FieldDef>) => setFields(f=>f.map(x=>x.id===id?{...x,...patch}:x));
  const reset = () => { setStep("db"); setDbName(""); setColName(""); setFields([{ id:uid(),key:"",value:"",type:"string" }]); setError(""); setResult(null); };

  const cardShadow = "0 2px 8px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.04)";
  const cardShadowLg = "0 4px 24px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.04)";

  const inputSt: React.CSSProperties = {
    width:"100%", padding:"12px 16px",
    background:"#fff", border:`1.5px solid ${C.border}`,
    borderRadius:12, color:C.text, fontSize:14,
    fontFamily:"'JetBrains Mono',monospace",
    outline:"none", transition:"all .2s", boxSizing:"border-box",
  };

  const btnPrimary: React.CSSProperties = {
    display:"inline-flex", alignItems:"center", gap:10,
    padding:"11px 22px", borderRadius:12, border:"none",
    background: C.primaryGrad, color:"#fff", fontSize:14, fontWeight:700,
    cursor:"pointer", fontFamily:"inherit", transition:"all .3s",
    boxShadow:"0 4px 14px rgba(26,92,58,0.3)",
  };

  const btnBack: React.CSSProperties = {
    display:"inline-flex", alignItems:"center", gap:8,
    padding:"11px 18px", borderRadius:12, border:`1.5px solid ${C.border}`,
    background:"#fff", color:C.textBody, fontSize:14, fontWeight:600,
    cursor:"pointer", transition:"all .2s", fontFamily:"inherit",
  };

  const pill = (color: string, bg: string, border: string) => ({
    display:"inline-flex", alignItems:"center", gap:6,
    fontSize:12, fontWeight:700, color, background:bg, border:`1.5px solid ${border}`,
    padding:"4px 12px", borderRadius:999, fontFamily:"'JetBrains Mono',monospace",
  } as React.CSSProperties);

  const infoCard = (bg: string, border: string, shadow?: string) => ({
    background:bg, border:`1.5px solid ${border}`,
    borderRadius:14, padding:"18px 20px",
    boxShadow: shadow || cardShadow,
  } as React.CSSProperties);

  return (
    <div style={{ fontFamily:"'Inter',system-ui,sans-serif", background:C.pageBg, minHeight:"100vh", padding:"32px 40px", display:"flex", flexDirection:"column", gap:24, color:C.text, position:"relative" }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        @keyframes ccSpin       { to{transform:rotate(360deg)} }
        @keyframes ccFadeUp     { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:none} }
        @keyframes ccBlink      { 0%,100%{opacity:1}50%{opacity:.4} }
        @keyframes ccDash       { to{stroke-dashoffset:-16} }
        @keyframes ccDropdownIn { from{opacity:0;transform:translateY(-8px) scale(0.96)} to{opacity:1;transform:none} }
        @keyframes ccPulse      { 0%,100%{box-shadow:0 0 0 0 rgba(26,92,58,0.2)}50%{box-shadow:0 0 0 8px rgba(26,92,58,0)} }
        @keyframes rowIn        { from{opacity:0;transform:translateX(-6px)}to{opacity:1;transform:none} }
        .cc-input:focus { border-color:${C.primary} !important; box-shadow:0 0 0 3px ${C.primaryGlow} !important; }
        .cc-btn:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 8px 24px rgba(26,92,58,0.35) !important; }
        .cc-btn:active:not(:disabled) { transform:translateY(0); }
        .cc-btn:disabled { opacity:.5; cursor:not-allowed; }
        .cc-btn-b:hover { background:${C.surfaceSoft} !important; border-color:${C.primary} !important; }
        .cc-field:hover { background:${C.surfaceSoft} !important; }
        .cc-field:hover .cc-del { opacity:1 !important; transform:scale(1); }
        .cc-del { transition:all .2s; transform:scale(0.9); }
        .cc-add-btn:hover { background:${C.surfaceSoft} !important; border-color:${C.primary} !important; color:${C.text} !important; }
        .cc-row { transition:all .2s; cursor:pointer; }
        .cc-row:hover { background:${C.primaryLight} !important; }
        .cc-step-active { animation:ccPulse 2s ease infinite; }
        input::placeholder, textarea::placeholder { color:${C.textFaint}; font-weight:400; }
        ::-webkit-scrollbar { width:6px; }
        ::-webkit-scrollbar-thumb { background:${C.borderHi}; border-radius:6px; }
        textarea { resize:vertical; }
      `}</style>

      {/* ── Header ── */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:20, animation:mounted?"ccFadeUp .4s ease both":"none" }}>
        <div style={{ display:"flex", alignItems:"center", gap:16 }}>
          <div style={{ width:48, height:48, borderRadius:14, background:C.primaryGrad, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 6px 20px rgba(26,92,58,0.35)", flexShrink:0 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
            </svg>
          </div>
          <div>
            <h1 style={{ margin:0, fontSize:26, fontWeight:800, color:C.text, letterSpacing:"-0.6px", lineHeight:1.1 }}>Create Collection</h1>
            <p style={{ margin:"5px 0 0", fontSize:14, color:C.textSub }}>Build your MongoDB structure step by step.</p>
          </div>
        </div>

        {(dbName || colName) && (
          <div style={{ display:"flex", alignItems:"center", gap:8, background:"#fff", border:`1.5px solid ${C.border}`, borderRadius:999, padding:"8px 16px", boxShadow:cardShadow }}>
            {dbName && <><span style={{ fontSize:11, fontWeight:700, color:C.textMuted, letterSpacing:".06em" }}>DB:</span>
            <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:13, color:C.primary, fontWeight:700 }}>{dbName}</span></>}
            {colName && <><span style={{ color:C.textMuted, fontSize:13 }}>›</span>
            <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:13, color:C.successDark, fontWeight:700 }}>{colName}</span></>}
          </div>
        )}
      </div>

      {/* ── Step Progress ── */}
      <div style={{ background:"#fff", border:`1.5px solid ${C.border}`, borderRadius:20, padding:"28px 32px", boxShadow:cardShadowLg, animation:mounted?"ccFadeUp .4s ease .05s both":"none" }}>
        <div style={{ display:"flex", alignItems:"flex-start", position:"relative" }}>
          {STEPS.map((s,i) => {
            const isActive=i===stepIdx, isDone=i<stepIdx, isFuture=i>stepIdx;
            return (
              <div key={s.id} style={{ display:"flex", alignItems:"flex-start", flex:i<STEPS.length-1?1:"0 0 auto", minWidth:0 }}>
                <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-start", gap:10, minWidth:0 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <span style={{ fontSize:12, fontWeight:800, color:isActive?C.primary:isDone?C.successDark:C.textFaint, fontFamily:"'JetBrains Mono',monospace", transition:"color .3s" }}>{s.num}</span>
                    <div style={{
                      width:34, height:34, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all .4s",
                      background: isDone?C.primaryGrad:isActive?C.primaryGrad:"#fff",
                      border: isFuture?`2px solid ${C.border}`:"none",
                      color:"#fff",
                      boxShadow: isActive?`0 0 0 6px ${C.primaryLight},0 4px 12px ${C.primaryGlow}`:isDone?"0 4px 12px rgba(26,92,58,0.2)":"none",
                    }} className={isActive?"cc-step-active":""}>
                      {isDone ? <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 8l3 3 7-7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        : isActive ? <span style={{ width:10, height:10, borderRadius:"50%", background:"#fff" }}/>
                        : <span style={{ width:10, height:10, borderRadius:"50%", background:C.textFaint }}/>}
                    </div>
                  </div>
                  <div style={{ paddingLeft:4 }}>
                    <div style={{ fontSize:13.5, fontWeight:700, color:isDone?C.successDark:isActive?C.text:C.textMuted, transition:"color .3s", whiteSpace:"nowrap" }}>{s.label}</div>
                    <div style={{ fontSize:11.5, marginTop:3, color:isDone||isActive?C.textSub:C.textFaint, transition:"color .3s", whiteSpace:"nowrap" }}>{s.sub}</div>
                  </div>
                </div>
                {i < STEPS.length-1 && (
                  <div style={{ flex:1, height:34, display:"flex", alignItems:"center", padding:"0 16px" }}>
                    {i<stepIdx ? (
                      <div style={{ height:3, width:"100%", background:C.primaryGrad, borderRadius:3 }}/>
                    ) : i===stepIdx-1 ? (
                      <svg width="100%" height="3" preserveAspectRatio="none">
                        <line x1="0" y1="1.5" x2="100%" y2="1.5" stroke={C.primary} strokeWidth="3" strokeDasharray="8 5" style={{ animation:"ccDash 1.5s linear infinite" }}/>
                      </svg>
                    ) : (
                      <svg width="100%" height="2" preserveAspectRatio="none">
                        <line x1="0" y1="1" x2="100%" y2="1" stroke={C.borderHi} strokeWidth="2" strokeDasharray="5 5"/>
                      </svg>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Main Card ── */}
      <div style={{ background:"#fff", border:`1.5px solid ${C.border}`, borderRadius:20, overflow:"hidden", boxShadow:cardShadowLg, animation:mounted?"ccFadeUp .4s ease .1s both":"none" }}>

        {/* Card header */}
        <div style={{ padding:"22px 28px 0", borderBottom:`1.5px solid ${C.border}` }}>
          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:16 }}>
            <div style={{ display:"flex", alignItems:"flex-start", gap:14 }}>
              <div style={{ width:42, height:42, borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", background:step==="done"?C.successSoft:C.primaryLight, border:`1.5px solid ${step==="done"?C.successBorder:C.primaryBorder}`, flexShrink:0 }}>
                {step==="db"         && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.primary} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>}
                {step==="collection" && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.primary} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>}
                {step==="items"      && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.primary} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>}
                {step==="done"       && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.successDark} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>}
              </div>
              <div>
                <div style={{ display:"inline-flex", flexDirection:"column", paddingBottom:14, borderBottom:`3px solid ${step==="done"?C.success:C.primary}` }}>
                  <p style={{ margin:0, fontSize:17, fontWeight:800, color:C.text, letterSpacing:"-0.3px" }}>
                    {step==="db"&&"Name your database"}{step==="collection"&&"Create a collection"}{step==="items"&&"Seed first document"}{step==="done"&&"All done!"}
                  </p>
                </div>
                <p style={{ margin:"10px 0 0", fontSize:13.5, color:C.textSub, lineHeight:1.6, maxWidth:520 }}>
                  {step==="db"&&"Choose a unique identifier — letters, numbers, hyphens and underscores."}
                  {step==="collection"&&"Collections group related documents together. Use a descriptive plural noun."}
                  {step==="items"&&"Define typed fields with full MongoDB data type support."}
                  {step==="done"&&"Your collection is live and the document has been inserted successfully."}
                </p>
              </div>
            </div>
            <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:12, fontWeight:700, color:C.textSub, background:C.surfaceSoft, border:`1.5px solid ${C.border}`, padding:"5px 12px", borderRadius:999, flexShrink:0 }}>
              Step {stepIdx+1} / {STEPS.length}
            </span>
          </div>
          <div style={{ height:14 }}/>
        </div>

        {/* Error */}
        {error && (
          <div style={{ margin:"20px 28px 0", display:"flex", alignItems:"center", gap:12, background:C.redSoft, border:`1.5px solid ${C.redBorder}`, borderRadius:12, padding:"12px 16px", animation:"ccFadeUp .3s ease" }}>
            <div style={{ width:22, height:22, borderRadius:"50%", background:C.red, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <span style={{ fontSize:12, color:"#fff", fontWeight:800 }}>!</span>
            </div>
            <span style={{ fontSize:13.5, color:C.red, fontWeight:600 }}>{error}</span>
          </div>
        )}

        {/* ── DB Step ── */}
        {step==="db" && (
          <div style={{ padding:"28px" }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:24, alignItems:"start" }}>
              <div>
                <label style={{ display:"block", fontSize:13.5, fontWeight:700, color:C.text, marginBottom:10 }}>Database name</label>
                <input autoFocus className="cc-input" style={inputSt} placeholder="e.g. my_project" value={dbName} onChange={e=>setDbName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleDbStep()}/>
                <p style={{ margin:"8px 0 0", fontSize:12.5, color:C.textSub }}>Letters, numbers, hyphens and underscores only.</p>
              </div>
              <div style={infoCard(C.successSoft, C.successBorder)}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                  <div style={{ width:22, height:22, borderRadius:6, background:C.primaryGrad, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M3 8l3 3 7-7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  <p style={{ margin:0, fontSize:13.5, fontWeight:800, color:C.primaryDark }}>Reuse existing</p>
                </div>
                <p style={{ margin:0, fontSize:13, color:C.primaryDark, lineHeight:1.65, opacity:.85 }}>If the database already exists, the new collection will be added inside it automatically.</p>
              </div>
              <div style={infoCard(C.primaryLight, C.primaryBorder)}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                  <div style={{ width:22, height:22, borderRadius:6, background:C.primaryGrad, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M8 1L1 6l7 3 7-3-7-3zM1 11l7 3 7-3M1 8l7 3 7-3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  <p style={{ margin:0, fontSize:13.5, fontWeight:800, color:C.primary }}>Auto-created</p>
                </div>
                <p style={{ margin:0, fontSize:13, color:C.primary, lineHeight:1.65, opacity:.85 }}>New databases are provisioned on the fly — no manual setup needed.</p>
              </div>
            </div>
            <div style={{ display:"flex", justifyContent:"flex-end", marginTop:28, paddingTop:20, borderTop:`1.5px solid ${C.border}` }}>
              <button className="cc-btn" style={btnPrimary} onClick={handleDbStep} disabled={loading||!dbName.trim()}>
                {loading?<Spinner/>:<>Continue <ChevronRight color="#fff"/></>}
              </button>
            </div>
          </div>
        )}

        {/* ── Collection Step ── */}
        {step==="collection" && (
          <div style={{ padding:"28px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:20 }}>
              <span style={pill(C.primary, C.primaryLight, C.primaryBorder)}><span style={{ width:6, height:6, borderRadius:"50%", background:C.primary, display:"inline-block" }}/>{dbName}</span>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:24, alignItems:"start" }}>
              <div>
                <label style={{ display:"block", fontSize:13.5, fontWeight:700, color:C.text, marginBottom:10 }}>Collection name</label>
                <input autoFocus className="cc-input" style={inputSt} placeholder="e.g. products" value={colName} onChange={e=>setColName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleCollectionStep()}/>
                <p style={{ margin:"8px 0 0", fontSize:12.5, color:C.textSub }}>Collections are analogous to tables in relational databases.</p>
              </div>
              <div style={infoCard(C.primaryLight, C.primaryBorder)}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                  <div style={{ width:22, height:22, borderRadius:6, background:C.primaryGrad, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M8 1L1 6l7 3 7-3-7-3zM1 11l7 3 7-3M1 8l7 3 7-3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  <p style={{ margin:0, fontSize:13.5, fontWeight:800, color:C.primary }}>Naming tip</p>
                </div>
                <p style={{ margin:0, fontSize:13, color:C.primary, lineHeight:1.65, opacity:.85 }}>Use plural nouns — <code style={{ background:"rgba(255,255,255,.8)", padding:"1px 6px", borderRadius:5, fontWeight:600 }}>users</code>, <code style={{ background:"rgba(255,255,255,.8)", padding:"1px 6px", borderRadius:5, fontWeight:600 }}>orders</code>.</p>
              </div>
              <div style={infoCard(C.surfaceSoft, C.border)}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                  <div style={{ width:22, height:22, borderRadius:6, background:"linear-gradient(135deg,#475569,#94a3b8)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M14 2H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2z" stroke="#fff" strokeWidth="1.5"/><path d="M10 2v4h4M11 9H7M11 12H7M8 6H7" stroke="#fff" strokeWidth="1.2" strokeLinecap="round"/></svg>
                  </div>
                  <p style={{ margin:0, fontSize:13.5, fontWeight:800, color:C.text }}>Flexible schema</p>
                </div>
                <p style={{ margin:0, fontSize:13, color:C.textBody, lineHeight:1.65 }}>MongoDB collections don't enforce a fixed schema by default.</p>
              </div>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:28, paddingTop:20, borderTop:`1.5px solid ${C.border}` }}>
              <button className="cc-btn-b" style={btnBack} onClick={()=>setStep("db")}>← Back</button>
              <button className="cc-btn" style={btnPrimary} onClick={handleCollectionStep} disabled={loading||!colName.trim()}>
                {loading?<Spinner/>:<>Create <ChevronRight color="#fff"/></>}
              </button>
            </div>
          </div>
        )}

        {/* ── Items Step ── */}
        {step==="items" && (
          <div style={{ padding:"26px 28px 28px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:20 }}>
              <span style={pill(C.primary,C.primaryLight,C.primaryBorder)}><span style={{ width:6,height:6,borderRadius:"50%",background:C.primary,display:"inline-block" }}/>{dbName}</span>
              <ChevronRight size={11} color={C.textMuted}/>
              <span style={pill(C.successDark,C.successSoft,C.successBorder)}><span style={{ width:6,height:6,borderRadius:"50%",background:C.success,display:"inline-block" }}/>{colName}</span>
            </div>

            {/* Column headers */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 190px 1fr 40px", gap:12, padding:"11px 16px", background:C.surfaceSoft, border:`1.5px solid ${C.border}`, borderRadius:"12px 12px 0 0", borderBottom:"none" }}>
              {["Key","Type","Value",""].map(h=>(
                <span key={h} style={{ fontSize:11, fontWeight:700, color:C.textSub, letterSpacing:".06em", textTransform:"uppercase" }}>{h}</span>
              ))}
            </div>

            <div style={{ border:`1.5px solid ${C.border}`, borderRadius:"0 0 12px 12px", background:"#fff" }}>
              {fields.map((f,i) => (
                <div key={f.id} className="cc-field" style={{ display:"grid", gridTemplateColumns:"1fr 190px 1fr 40px", gap:12, alignItems:"start", padding:"12px 16px", background: i%2===0?"#fff":"#fafbff", borderBottom:i<fields.length-1?`1.5px solid ${C.border}`:"none", transition:"all .2s" }}>
                  <input className="cc-input" style={{ ...inputSt, padding:"9px 12px", fontSize:13 }} placeholder="field_name" value={f.key} onChange={e=>updateField(f.id,{ key:e.target.value })}/>
                  <TypeDropdown value={f.type} onChange={t=>updateField(f.id,{ type:t, value:getDefaultValue(t) })}/>
                  <ValueInput field={f} onChange={v=>updateField(f.id,{ value:v })}/>
                  <button className="cc-del" onClick={()=>fields.length>1&&removeField(f.id)}
                    style={{ width:36,height:36,borderRadius:10,border:`1.5px solid ${C.border}`,background:"#fff",color:C.textSub,cursor:fields.length>1?"pointer":"default",display:"flex",alignItems:"center",justifyContent:"center",opacity:0,flexShrink:0,alignSelf:"center" }}>
                    <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
                  </button>
                </div>
              ))}
            </div>

            <div style={{ marginTop:16, display:"flex", flexWrap:"wrap", alignItems:"center", gap:6 }}>
              <span style={{ fontSize:11.5, fontWeight:700, color:C.textSub, letterSpacing:".04em", marginRight:4 }}>Add field:</span>
              {DATA_TYPES.map(dt => (
                <button key={dt.value} className="cc-add-btn" onClick={()=>addField(dt.value)}
                  style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"6px 12px", borderRadius:999, border:`1.5px solid ${C.border}`, background:"#fff", color:C.textBody, fontSize:12, fontWeight:600, cursor:"pointer", transition:"all .2s", fontFamily:"'JetBrains Mono',monospace" }}>
                  <span style={{ width:16,height:16,borderRadius:5,background:dt.gradient,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,color:"#fff",fontWeight:700 }}>{dt.icon}</span>
                  {dt.label}
                </button>
              ))}
            </div>

            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:24, paddingTop:20, borderTop:`1.5px solid ${C.border}` }}>
              <button className="cc-btn-b" style={btnBack} onClick={()=>setStep("collection")}>← Back</button>
              <button className="cc-btn" style={btnPrimary} onClick={handleInsert} disabled={loading}>
                {loading?<Spinner/>:<>Insert document <ChevronRight color="#fff"/></>}
              </button>
            </div>
          </div>
        )}

        {/* ── Done Step ── */}
        {step==="done" && result && (
          <div style={{ padding:"28px" }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 220px", gap:24 }}>
              <div>
                <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:20 }}>
                  <div style={{ width:48, height:48, borderRadius:14, background:C.primaryGrad, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, boxShadow:"0 8px 24px rgba(26,92,58,0.3)" }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  <div>
                    <p style={{ margin:0, fontSize:18, fontWeight:800, color:C.text, letterSpacing:"-0.3px" }}>Document inserted successfully</p>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:6 }}>
                      <span style={pill(C.primary,C.primaryLight,C.primaryBorder)}>{dbName}</span>
                      <ChevronRight size={11} color={C.textMuted}/>
                      <span style={pill(C.successDark,C.successSoft,C.successBorder)}>{colName}</span>
                    </div>
                  </div>
                </div>

                {/* JSON preview */}
                <div style={{ borderRadius:14, overflow:"hidden", border:`1.5px solid ${C.border}`, boxShadow:cardShadow }}>
                  <div style={{ display:"flex", alignItems:"center", gap:6, padding:"10px 16px", background:C.surfaceSoft, borderBottom:`1.5px solid ${C.border}` }}>
                    {["#FF5F57","#FFBD2E","#28C840"].map(c=><span key={c} style={{ width:11,height:11,borderRadius:"50%",background:c,display:"inline-block" }}/>)}
                    <span style={{ marginLeft:10, fontSize:12.5, color:C.textSub, fontFamily:"'JetBrains Mono',monospace", fontWeight:600 }}>document.json</span>
                    <span style={{ marginLeft:"auto", fontSize:11.5, fontWeight:700, color:C.successDark, background:C.successSoft, border:`1.5px solid ${C.successBorder}`, padding:"3px 10px", borderRadius:999, fontFamily:"'JetBrains Mono',monospace" }}>201 Created</span>
                  </div>
                  <div style={{ background:"#fafbff", padding:"18px 20px", maxHeight:220, overflowY:"auto" }}>
                    <pre style={{ margin:0, fontSize:13, fontFamily:"'JetBrains Mono',monospace", color:C.text, lineHeight:1.8, whiteSpace:"pre-wrap" }}>{JSON.stringify(result,null,2)}</pre>
                  </div>
                </div>
              </div>

              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {[
                  { label:"Database", value:dbName, color:C.primary, bg:C.primaryLight, border:C.primaryBorder },
                  { label:"Collection", value:colName, color:C.successDark, bg:C.successSoft, border:C.successBorder },
                ].map(s=>(
                  <div key={s.label} style={{ background:s.bg, border:`1.5px solid ${s.border}`, borderRadius:14, padding:"16px 18px" }}>
                    <p style={{ margin:"0 0 6px", fontSize:10.5, fontWeight:800, color:s.color, letterSpacing:".07em", textTransform:"uppercase" }}>{s.label}</p>
                    <p style={{ margin:0, fontFamily:"'JetBrains Mono',monospace", fontSize:14, fontWeight:700, color:s.color, wordBreak:"break-all" }}>{s.value}</p>
                  </div>
                ))}
                <div style={{ background:"#fff", border:`1.5px solid ${C.border}`, borderRadius:14, padding:"16px 18px" }}>
                  <p style={{ margin:"0 0 6px", fontSize:10.5, fontWeight:800, color:C.textSub, letterSpacing:".07em", textTransform:"uppercase" }}>Fields inserted</p>
                  <p style={{ margin:0, fontSize:34, fontWeight:800, color:C.text, lineHeight:1, letterSpacing:"-1px" }}>{Object.keys(result).length}</p>
                </div>
                <div style={{ background:C.primaryLight, border:`1.5px solid ${C.primaryBorder}`, borderRadius:14, padding:"14px 18px" }}>
                  <p style={{ margin:"0 0 6px", fontSize:10.5, fontWeight:800, color:C.primary, letterSpacing:".07em", textTransform:"uppercase" }}>Status</p>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ width:9,height:9,borderRadius:"50%",background:C.success,display:"inline-block",boxShadow:"0 0 0 3px rgba(34,197,94,0.2)",animation:"ccBlink 2.4s ease infinite" }}/>
                    <span style={{ fontSize:13.5, fontWeight:700, color:C.primary }}>Active & Live</span>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ display:"flex", justifyContent:"flex-end", marginTop:24, paddingTop:20, borderTop:`1.5px solid ${C.border}` }}>
              <button className="cc-btn" style={btnPrimary} onClick={reset}>Create another <ChevronRight color="#fff"/></button>
            </div>
          </div>
        )}
      </div>

      {/* ── Recent Collections Table ── */}
      {recent.length > 0 && (
        <div style={{ background:"#fff", border:`1.5px solid ${C.border}`, borderRadius:20, overflow:"hidden", boxShadow:cardShadowLg, animation:mounted?"ccFadeUp .4s ease .15s both":"none" }}>

          {/* Table toolbar */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"18px 24px", borderBottom:`1.5px solid ${C.border}`, background:"linear-gradient(135deg,#f9fafb,#f0faf4)" }}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <span style={{ width:4, height:20, borderRadius:4, background:C.primaryGrad, display:"inline-block" }}/>
              <h2 style={{ margin:0, fontSize:16, fontWeight:800, color:C.text, letterSpacing:"-0.2px" }}>Recent Collections</h2>
              <span style={{ fontSize:11.5, fontWeight:800, color:C.successDark, background:C.successSoft, border:`1.5px solid ${C.successBorder}`, padding:"3px 10px", borderRadius:999 }}>{recent.length}</span>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              <span style={{ width:7,height:7,borderRadius:"50%",background:C.success,display:"inline-block",animation:"ccBlink 2.4s ease infinite" }}/>
              <span style={{ fontSize:12, color:C.textSub, fontWeight:500 }}>Live · sorted newest first</span>
            </div>
          </div>

          {/* Table head */}
          <div style={{ display:"grid", gridTemplateColumns:"52px 1fr 1fr 80px 1fr 130px", gap:16, padding:"12px 24px", borderBottom:`1.5px solid ${C.border}`, background:"#fafbff" }}>
            {["S.No","Database","Collection","Fields","Created","Status"].map(h=>(
              <span key={h} style={{ fontSize:10.5, fontWeight:800, color:C.textSub, letterSpacing:".07em", textTransform:"uppercase" }}>{h}</span>
            ))}
          </div>

          {/* Table rows */}
          {recent.slice((recentPage-1)*PER_PAGE, recentPage*PER_PAGE).map((e,i) => {
            const rn = (recentPage-1)*PER_PAGE+i+1;
            const isNew = i===0 && recentPage===1;
            return (
              <div key={e.id} className="cc-row" style={{ display:"grid", gridTemplateColumns:"52px 1fr 1fr 80px 1fr 130px", gap:16, padding:"14px 24px", alignItems:"center", background: isNew?`${C.primaryLight}80`: i%2===0?"#fff":"#fafbff", borderBottom:i<Math.min(recent.length,PER_PAGE)-1?`1px solid ${C.border}`:"none", animation:`rowIn 0.3s ease ${i*0.04}s both` }}>
                {/* S.No */}
                <div style={{ width:30, height:30, borderRadius:8, background: isNew?C.primaryGrad:C.surfaceSoft, border:`1px solid ${isNew?C.primary:C.border}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800, color:isNew?"#fff":C.textSub, fontFamily:"'JetBrains Mono',monospace", boxShadow:isNew?"0 2px 8px rgba(26,92,58,0.25)":"none" }}>
                  {String(rn).padStart(2,"0")}
                </div>
                {/* DB */}
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <Avatar name={e.dbName}/>
                  <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:13, fontWeight:700, color:C.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{e.dbName}</span>
                </div>
                {/* Collection */}
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ width:34, height:34, borderRadius:10, background:C.primaryLight, border:`1.5px solid ${C.primaryBorder}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <svg width="13" height="13" viewBox="0 0 18 18" fill="none">
                      <rect x="2" y="3" width="14" height="3" rx="1.2" fill={C.primary} opacity=".9"/>
                      <rect x="2" y="8" width="14" height="3" rx="1.2" fill={C.primary} opacity=".6"/>
                      <rect x="2" y="13" width="9" height="3" rx="1.2" fill={C.primary} opacity=".35"/>
                    </svg>
                  </div>
                  <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:13, fontWeight:700, color:C.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{e.collectionName}</span>
                </div>
                {/* Fields */}
                <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:15, color:C.textBody, fontWeight:700 }}>{e.docCount}</span>
                {/* Created */}
                <div>
                  <p style={{ margin:0, fontSize:13, color:C.text, fontWeight:600 }}>{formatDate(e.createdAt)}</p>
                  <p style={{ margin:"2px 0 0", fontSize:11.5, color:C.textSub }}>{formatTime(e.createdAt)} · {timeAgo(e.createdAt)}</p>
                </div>
                {/* Status */}
                <div style={{ display:"inline-flex", alignItems:"center", gap:7, background:C.primaryLight, border:`1.5px solid ${C.primaryBorder}`, borderRadius:999, padding:"5px 12px", width:"fit-content" }}>
                  <span style={{ width:7,height:7,borderRadius:"50%",background:C.success,display:"inline-block",animation:"ccBlink 2.4s ease infinite" }}/>
                  <span style={{ fontSize:12, fontWeight:700, color:C.primary }}>Active</span>
                </div>
              </div>
            );
          })}

          {/* Table footer with pagination */}
          {recent.length > 0 && (
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 24px", borderTop:`1px solid ${C.border}`, background:"#fafbff" }}>
              <p style={{ margin:0, fontSize:12, color:C.textSub }}>
                Showing <span style={{ fontWeight:700, color:C.textBody }}>{(recentPage-1)*PER_PAGE+1}</span>–<span style={{ fontWeight:700, color:C.textBody }}>{Math.min(recentPage*PER_PAGE,recent.length)}</span> of <span style={{ fontWeight:700, color:C.textBody }}>{recent.length}</span> entries
              </p>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <Pagination page={recentPage} total={recent.length} pageSize={PER_PAGE} onChange={setRecentPage}/>
                <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                  <span style={{ width:6,height:6,borderRadius:"50%",background:C.success,display:"inline-block",animation:"ccBlink 2.4s ease infinite" }}/>
                  <span style={{ fontSize:11, color:C.textSub, fontWeight:500 }}>Live data</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}