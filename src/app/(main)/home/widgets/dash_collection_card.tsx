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

function GaugeCanvas({ slices, total, size = 'default' }: { slices: { value: number; color: string }[]; total: number; size?: 'small' | 'default' }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const dimensions = size === 'small' ? { w: 100, h: 60 } : { w: 140, h: 84 };

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
  }, [slices, total, dimensions]);

  return (
    <canvas
      ref={ref}
      width={dimensions.w}
      height={dimensions.h}
      role="img"
      aria-label={`Half-gauge showing ${total} tables`}
      className="block flex-shrink-0"
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
        className="bg-white rounded-lg md:rounded-2xl border p-3 md:p-4 w-full"
        style={{
          borderColor: '#e8f5e9',
          boxShadow: '0 2px 12px rgba(26,92,58,0.07)',
          animation: mounted ? 'cardIn 0.4s ease both' : 'none',
        }}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between gap-2 mb-3 md:mb-4">
          <div className="min-w-0">
            <p className="text-xs md:text-sm font-bold md:font-600 text-gray-900">Tables</p>
            <div className="flex items-center gap-1.5 md:gap-2 mt-0.5 md:mt-1">
              <span style={{
                width: 4, height: 4, borderRadius: '50%', background: '#22c55e',
                display: 'inline-block', animation: 'livePulse 2s ease-in-out infinite',
              }} />
              <span className="text-[9px] md:text-[10px] text-gray-400 truncate">{dbLabel}</span>
            </div>
          </div>
          <button
            onClick={() => router.push('/all-collections')}
            className="p-1 md:p-1.5 hover:opacity-70 transition-opacity flex-shrink-0"
            aria-label="View all tables"
          >
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
              <path d="M3 11L11 3M11 3H6M11 3V8" stroke="#111827" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* ── Body ── */}
        {loading ? (
          <div className="flex flex-col sm:flex-row items-center gap-2 md:gap-4">
            <div className="w-24 md:w-32 h-14 md:h-20 rounded-lg bg-gray-100 flex-shrink-0 animate-pulse" />
            <div className="flex-1 w-full space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-2 md:h-2.5 rounded-full bg-gray-100 animate-pulse" style={{ width: i === 1 ? '80%' : i === 2 ? '60%' : '70%' }} />
              ))}
            </div>
          </div>
        ) : tables.length === 0 ? (
          <div className="text-center py-4 md:py-6">
            <p className="text-xs md:text-sm font-semibold text-gray-400">No tables found</p>
            <p className="text-[10px] md:text-xs text-gray-300 mt-1">Create a collection to get started</p>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 md:gap-3">

            {/* ── Gauge — responsive size ── */}
            <div className="flex justify-center sm:flex-shrink-0">
              <GaugeCanvas slices={slices} total={totalTables} size="default" />
            </div>

            {/* ── Legend: responsive ── */}
            <div className="flex-1 min-w-0">

              {legendTables.map((t) => (
                <div key={`${t.dbName}-${t.name}`} className="gauge-leg text-xs md:text-sm">
                  {/* dot + name */}
                  <div className="flex items-center gap-1.5 md:gap-2 min-w-0 flex-1">
                    <span className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full flex-shrink-0" style={{ background: t.color }} />
                    <span className="text-[10px] md:text-xs text-gray-600 overflow-hidden text-overflow-ellipsis whitespace-nowrap">
                      {t.name}
                    </span>
                  </div>
                </div>
              ))}

              {/* +N more */}
              {hiddenCount > 0 && (
                <div
                  className="gauge-leg more-row cursor-pointer text-xs md:text-sm"
                  onClick={() => router.push('/all-collections')}
                >
                  <div className="flex items-center gap-1.5 md:gap-2">
                    <span className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full flex-shrink-0 bg-gray-300" />
                    <span className="text-[10px] md:text-xs text-gray-500 italic">
                      +{hiddenCount} more
                    </span>
                  </div>
                  <svg width="9" height="9" viewBox="0 0 10 10" fill="none" className="flex-shrink-0">
                    <path d="M2 8L8 2M8 2H4.5M8 2V5.5" stroke="#111827" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.35 }} />
                  </svg>
                </div>
              )}

              {/* Footer pill — total right-aligned */}
              <div className="mt-2 md:mt-3 bg-gray-50 rounded px-2 md:px-3 py-1.5 md:py-2 flex justify-end">
                <span className="text-[9px] md:text-[10px] font-bold" style={{ color: '#1a5c3a' }}>
                  {totalTables} table{totalTables !== 1 ? 's' : ''}
                </span>
              </div>

            </div>
          </div>
        )}
      </div>
    </>
  );
}