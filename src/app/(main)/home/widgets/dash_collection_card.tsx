'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getDatabases, getCollections } from '@/handler/collection_handler';

interface TableStat {
  name: string;
  documentCount: number;
  color: string;
  dbName: string;
}

const TABLE_COLORS = ['#1a5c3a', '#22c55e', '#86efac', '#0f766e', '#2dd4bf', '#4ade80', '#065f46'];
const MAX_LEGEND_ITEMS = 4;

function GaugeCanvas({ slices, total }: { slices: { value: number; color: string }[]; total: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width, H = canvas.height;
    const cx = W / 2, cy = H - 8;
    const outerR = W / 2 - 3;
    const innerR = outerR * 0.60;
    const gap = 0.032;

    ctx.clearRect(0, 0, W, H);

    // background track
    ctx.beginPath();
    ctx.arc(cx, cy, outerR, Math.PI, 0, false);
    ctx.arc(cx, cy, innerR, 0, Math.PI, true);
    ctx.closePath();
    ctx.fillStyle = '#e5e7eb';
    ctx.fill();

    const totalVal = slices.reduce((a, s) => a + s.value, 0) || 1;
    let start = Math.PI;

    slices.forEach((s) => {
      const sweep = (s.value / totalVal) * Math.PI - gap;
      if (sweep <= 0) return;
      ctx.beginPath();
      ctx.arc(cx, cy, outerR, start + gap / 2, start + sweep + gap / 2, false);
      ctx.arc(cx, cy, innerR, start + sweep + gap / 2, start + gap / 2, true);
      ctx.closePath();
      ctx.fillStyle = s.color;
      ctx.fill();
      start += sweep + gap;
    });

    // center text
    ctx.textAlign = 'center';
    ctx.fillStyle = '#111827';
    ctx.font = `700 ${total >= 100 ? 16 : 22}px system-ui, sans-serif`;
    ctx.fillText(String(total), cx, cy - 6);
    ctx.fillStyle = '#9ca3af';
    ctx.font = '500 10px system-ui, sans-serif';
    ctx.fillText('tables', cx, cy + 8);
  }, [slices, total]);

  return (
    <canvas
      ref={ref}
      width={140}
      height={84}
      role="img"
      aria-label={`Half-gauge showing ${total} tables`}
      style={{ display: 'block', flexShrink: 0 }}
    />
  );
}

export default function CollectionsGaugeCard({ dbName: dbNameProp }: { dbName?: string }) {
  const router = useRouter();
  const [tables, setTables]   = useState<TableStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [dbNames, setDbNames] = useState<string[]>([]);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  // Step 1: resolve which databases to fetch from
  useEffect(() => {
    if (dbNameProp) { setDbNames([dbNameProp]); return; }
    (async () => {
      try {
        const res = await getDatabases();
        const list: any[] = Array.isArray(res.data) ? res.data : [];
        const names: string[] = list.map((item) => typeof item === 'string' ? item : item.name);
        setDbNames(names);
        if (names.length === 0) setLoading(false);
      } catch {
        setLoading(false);
      }
    })();
  }, [dbNameProp]);

  // Step 2: fetch collections from ALL databases in parallel
  useEffect(() => {
    if (dbNames.length === 0) return;
    (async () => {
      setLoading(true);
      try {
        const results = await Promise.all(
          dbNames.map(async (db) => {
            try {
              const res = await getCollections(db);
              if (!res.ok) return [];
              const rawArray: any[] = Array.isArray(res.data) ? res.data : [];
              return rawArray.map((col: any) => ({
                dbName: db,
                name: typeof col === 'string' ? col : (col.name ?? 'unknown'),
                documentCount: typeof col === 'string' ? 0 : (col.documentCount ?? col.count ?? 0),
              }));
            } catch { return []; }
          })
        );
        const allTables: TableStat[] = results.flat().map((t, i) => ({
          ...t,
          color: TABLE_COLORS[i % TABLE_COLORS.length],
        }));
        setTables(allTables);
      } catch {
        setTables([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [dbNames]);

  const totalTables = tables.length;
  const slices      = tables.map((t) => ({ value: Math.max(t.documentCount, 1), color: t.color }));
  const legendTables = tables.slice(0, MAX_LEGEND_ITEMS);
  const hiddenCount  = totalTables - MAX_LEGEND_ITEMS;
  const dbLabel      = dbNameProp ?? (dbNames.length === 1 ? dbNames[0] : 'all collections');

  return (
    <>
      <style>{`
        @keyframes livePulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.3;transform:scale(1.5)} }
        @keyframes cardIn    { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .gauge-leg {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 4px 0;
          border-bottom: 1px solid #f0faf4;
        }
        .gauge-leg:last-child { border-bottom: none; }
        .more-row:hover { background: #f9fefb; border-radius: 6px; }
      `}</style>

      <div
        style={{
          background: 'white',
          borderRadius: 14,
          border: '1px solid #e8f5e9',
          padding: '14px 16px',
          maxWidth: 340,
          boxShadow: '0 2px 12px rgba(26,92,58,0.07)',
          animation: mounted ? 'cardIn 0.4s ease both' : 'none',
        }}
      >
        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#111827' }}>Tables</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
              <span style={{
                width: 6, height: 6, borderRadius: '50%', background: '#22c55e',
                display: 'inline-block', animation: 'livePulse 2s ease-in-out infinite',
              }} />
              <span style={{ fontSize: 10, color: '#9ca3af' }}>{dbLabel}</span>
            </div>
          </div>
          <button
            onClick={() => router.push('/all-collections')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, opacity: 0.4 }}
            aria-label="View all tables"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 11L11 3M11 3H6M11 3V8" stroke="#111827" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* ── Body ── */}
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 140, height: 84, borderRadius: 8, background: '#f0faf4', flexShrink: 0 }} className="animate-pulse" />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[1, 2, 3].map((i) => (
                <div key={i} style={{ height: 10, borderRadius: 5, background: '#f0faf4', width: i === 1 ? '80%' : i === 2 ? '60%' : '70%' }} className="animate-pulse" />
              ))}
            </div>
          </div>
        ) : tables.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>No tables found</p>
            <p style={{ fontSize: 11, color: '#d1d5db', margin: '4px 0 0' }}>Create a collection to get started</p>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>

            {/* ── Bigger gauge ── */}
            <GaugeCanvas slices={slices} total={totalTables} />

            {/* ── Legend: right-shifted, right-aligned total ── */}
            <div style={{ flex: 1, minWidth: 0 }}>

              {legendTables.map((t) => (
                <div key={`${t.dbName}-${t.name}`} className="gauge-leg">
                  {/* dot + name */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, minWidth: 0, flex: 1 }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: t.color, flexShrink: 0 }} />
                    <span style={{
                      fontSize: 10, color: '#374151',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {t.name}
                    </span>
                  </div>
                </div>
              ))}

              {/* +N more */}
              {hiddenCount > 0 && (
                <div
                  className="gauge-leg more-row"
                  style={{ cursor: 'pointer' }}
                  onClick={() => router.push('/all-collections')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#d1d5db', flexShrink: 0 }} />
                    <span style={{ fontSize: 10, color: '#6b7280', fontStyle: 'italic' }}>
                      +{hiddenCount} more
                    </span>
                  </div>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ flexShrink: 0, opacity: 0.35 }}>
                    <path d="M2 8L8 2M8 2H4.5M8 2V5.5" stroke="#111827" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}

              {/* Footer pill — total right-aligned */}
              <div style={{
                marginTop: 8,
                background: '#f0faf4',
                borderRadius: 7,
                padding: '4px 8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',   /* ← total pushed to the right */
              }}>
                <span style={{ fontSize: 10, color: '#1a5c3a', fontWeight: 700 }}>
                  {totalTables} tables
                </span>
              </div>

            </div>
          </div>
        )}
      </div>
    </>
  );
}