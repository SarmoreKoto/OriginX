'use client';

import { useEffect, useState } from 'react';
import { Icons } from '@/resources/icons';
import { getDatabases } from '@/handler/collection_handler';

// ─── Types ─────────────────────────────────────────────────────────────────────
interface DatabaseItem {
  name: string;
  size: number;
  maxSize: number;
}

// ─── Theme palette — all green-family to match dashboard ──────────────────────
const DB_THEMES = [
  {
    color: '#1a5c3a',
    gradient: 'linear-gradient(135deg, #1a5c3a, #0f3d26)',
    ring: 'rgba(26,92,58,0.12)',
    glow: 'rgba(26,92,58,0.3)',
    soft: 'rgba(26,92,58,0.04)',
    light: '#f0faf4',
    text: '#1a5c3a',
  },
  {
    color: '#0891b2',
    gradient: 'linear-gradient(135deg, #0891b2, #0e7490)',
    ring: 'rgba(8,145,178,0.12)',
    glow: 'rgba(8,145,178,0.3)',
    soft: 'rgba(8,145,178,0.04)',
    light: '#ecfeff',
    text: '#0891b2',
  },
  {
    color: '#7c3aed',
    gradient: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
    ring: 'rgba(124,58,237,0.12)',
    glow: 'rgba(124,58,237,0.3)',
    soft: 'rgba(124,58,237,0.04)',
    light: '#f5f3ff',
    text: '#7c3aed',
  },
  {
    color: '#be185d',
    gradient: 'linear-gradient(135deg, #be185d, #9d174d)',
    ring: 'rgba(190,24,93,0.12)',
    glow: 'rgba(190,24,93,0.3)',
    soft: 'rgba(190,24,93,0.04)',
    light: '#fff1f2',
    text: '#be185d',
  },
  {
    color: '#b45309',
    gradient: 'linear-gradient(135deg, #b45309, #92400e)',
    ring: 'rgba(180,83,9,0.12)',
    glow: 'rgba(180,83,9,0.3)',
    soft: 'rgba(180,83,9,0.04)',
    light: '#fffbeb',
    text: '#b45309',
  },
];

// ─── Circular arc progress ─────────────────────────────────────────────────────
function ArcProgress({
  progress,
  color,
  glow,
  size = 52,
}: {
  progress: number;
  color: string;
  glow: string;
  size?: number;
}) {
  const stroke = 4;
  const r      = (size - stroke * 2) / 2;
  const circ   = 2 * Math.PI * r;
  const dash   = (progress / 100) * circ;
  const cx     = size / 2;
  const cy     = size / 2;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}
    >
      {/* Track */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f3f4f6" strokeWidth={stroke} />
      {/* Progress */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`}
        style={{
          filter: `drop-shadow(0 0 3px ${glow})`,
          transition: 'stroke-dasharray 1.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      />
    </svg>
  );
}

// ─── Initials avatar ───────────────────────────────────────────────────────────
function DbAvatar({
  name,
  gradient,
  glow,
}: {
  name: string;
  gradient: string;
  glow: string;
}) {
  const initials = name
    .split(/[_\-\s]/)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div
      className="w-9 md:w-11 h-9 md:h-11 rounded-lg md:rounded-xl flex items-center justify-center text-white text-[10px] md:text-xs font-black flex-shrink-0"
      style={{
        background: gradient,
        boxShadow: `0 4px 12px ${glow}`,
        letterSpacing: '-0.02em',
      }}
    >
      {initials}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
export default function DatabaseUsageCard() {
  const [databases, setDatabases] = useState<DatabaseItem[]>([]);
  const [loading, setLoading]     = useState(true);
  const [mounted, setMounted]     = useState(false);

  const formatMB = (bytes: number) => (bytes / (1024 * 1024)).toFixed(1);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 120);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await getDatabases();
        if (!res.ok) throw new Error();
        const dbs = res.data || [];
        setDatabases(
          dbs.map((db: any) => ({
            name: db.name,
            size: db.size,
            maxSize: 100 * 1024 * 1024, // 100 MB cap per DB
          }))
        );
      } catch {
        setDatabases([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const totalUsed  = databases.reduce((acc, db) => acc + db.size, 0);
  const totalMax   = databases.reduce((acc, db) => acc + db.maxSize, 0);
  const overallPct = totalMax > 0 ? Math.round((totalUsed / totalMax) * 100) : 0;

  return (
    <>
      <style>{`
        @keyframes du-slide-up {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes du-bar-fill {
          from { width: 0%; }
        }
        @keyframes du-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes du-pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
        .du-row {
          animation: du-slide-up 0.45s ease both;
        }
        .du-bar {
          animation: du-bar-fill 1.3s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
      `}</style>

      <div className="bg-white rounded-lg md:rounded-2xl border border-gray-100 overflow-hidden"
        style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.05), 0 1px 4px rgba(0,0,0,0.03)' }}
      >
        <div className="p-4 md:p-6">

          {/* ── Header ─────────────────────────────────────────────────── */}
          <div className="flex items-center justify-between mb-3 md:mb-5 gap-2">
            <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
              {/* Icon — matches stat card style */}
              <div className="relative flex-shrink-0">
                {/* spinning dashed ring */}
                <div
                  aria-hidden
                  className="absolute rounded-full pointer-events-none"
                  style={{
                    inset: -4,
                    border: '1.5px dashed rgba(26,92,58,0.25)',
                    borderRadius: '50%',
                    animation: 'du-spin 10s linear infinite',
                  }}
                />
                <div
                  className="w-9 md:w-10 h-9 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, #1a5c3a, #0f3d26)',
                    boxShadow: '0 4px 12px rgba(26,92,58,0.3)',
                  }}
                >
                  <Icons.bookmark size={16} className="text-white" />
                </div>
              </div>

              <div className="min-w-0">
                <h3 className="text-sm md:text-[15px] font-black text-gray-900 tracking-tight leading-none">
                  Storage Usage
                </h3>
              </div>
            </div>

          </div>

          {/* ── Overall capacity summary bar ────────────────────────────── */}
          {!loading && databases.length > 0 && (
            <div
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 md:gap-4 p-3 md:p-4 rounded-lg md:rounded-xl mb-3 md:mb-5"
              style={{ background: '#f0faf4', border: '1px solid #d1fae5' }}
            >
              {/* Arc */}
              <div className="relative flex-shrink-0 flex justify-center sm:justify-start">
                <ArcProgress
                  progress={mounted ? overallPct : 0}
                  color="#1a5c3a"
                  glow="rgba(26,92,58,0.4)"
                  size={56}
                />
                <span
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ fontSize: 11, fontWeight: 900, color: '#1a5c3a' }}
                >
                  {overallPct}%
                </span>
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className="text-xs md:text-sm font-black text-gray-900">Overall Capacity</p>
                <p className="text-[10px] md:text-xs text-gray-400 mt-0.5">
                  {formatMB(totalUsed)} MB of {formatMB(totalMax)} MB used
                </p>
                <div className="flex items-center gap-1.5 mt-1 md:mt-2">
                  <span className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full flex-shrink-0" style={{ background: '#22c55e' }} />
                  <span className="text-[9px] md:text-[10px] font-semibold" style={{ color: '#16a34a' }}>
                    {formatMB(totalMax - totalUsed)} MB free
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ── DB list ─────────────────────────────────────────────────── */}
          <div className="space-y-1.5 md:space-y-2">
            {loading ? (
              [1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 md:gap-3 p-2.5 md:p-3.5 rounded-lg md:rounded-xl animate-pulse"
                  style={{ background: '#f9fafb' }}
                >
                  <div className="w-9 md:w-11 h-9 md:h-11 rounded-lg md:rounded-xl bg-gray-100 flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-2 md:h-3 w-24 bg-gray-100 rounded-full" />
                    <div className="h-2 w-full bg-gray-100 rounded-full" />
                    <div className="h-1.5 md:h-2 w-16 bg-gray-100 rounded-full" />
                  </div>
                </div>
              ))
            ) : databases.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 md:py-10 text-center px-2">
                <div
                  className="w-10 md:w-14 h-10 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center mb-2 md:mb-3"
                  style={{ background: '#f0faf4' }}
                >
                  <Icons.bookmark size={20} style={{ color: '#d1fae5' }} />
                </div>
                <p className="text-xs md:text-sm font-bold text-gray-500">No databases found</p>
                <p className="text-[10px] md:text-xs text-gray-400 mt-0.5 md:mt-1">Create a database to see storage usage</p>
              </div>
            ) : (
              databases.map((db, index) => {
                const theme    = DB_THEMES[index % DB_THEMES.length];
                const progress = Math.min(Math.round((db.size / db.maxSize) * 100), 100);

                // health color for status dot
                const statusColor =
                  progress > 80 ? '#ef4444' :
                  progress > 60 ? '#f59e0b' :
                  theme.color;

                return (
                  <div
                    key={db.name}
                    className="du-row group relative rounded-lg md:rounded-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md p-2.5 md:p-3.5"
                    style={{
                      background: theme.soft,
                      border: `1px solid ${theme.ring}`,
                      animationDelay: `${index * 100}ms`,
                    }}
                  >

                    {/* Avatar with status dot */}
                    <div className="flex items-center gap-2 md:gap-3.5 mb-2 md:mb-0">
                      <div className="relative flex-shrink-0">
                        <DbAvatar
                          name={db.name}
                          gradient={theme.gradient}
                          glow={theme.glow}
                        />
                        {/* Health pulse dot */}
                        <span
                          className="absolute -top-0.5 -right-0.5 w-2.5 md:w-3 h-2.5 md:h-3 rounded-full border border-white"
                          style={{ background: statusColor, boxShadow: `0 0 5px ${statusColor}` }}
                        />
                      </div>

                      {/* Name + percentage */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1.5 md:gap-2 mb-1">
                          <p className="text-xs md:text-sm font-bold md:font-black text-gray-900 truncate tracking-tight">
                            {db.name}
                          </p>
                          <span
                            className="text-[9px] md:text-xs font-black flex-shrink-0"
                            style={{ color: theme.color }}
                          >
                            {progress}%
                          </span>
                        </div>

                        {/* Progress bar */}
                        <div
                          className="relative h-1 md:h-2 rounded-full overflow-hidden"
                          style={{ background: 'rgba(0,0,0,0.05)' }}
                        >
                          <div
                            className="du-bar absolute left-0 top-0 h-full rounded-full"
                            style={{
                              width: mounted ? `${progress}%` : '0%',
                              background: theme.gradient,
                              boxShadow: `0 0 6px ${theme.glow}`,
                              animationDelay: `${index * 100 + 250}ms`,
                            }}
                          />
                        </div>

                        <div className="flex items-center justify-between mt-1 gap-1">
                          <span className="text-[9px] md:text-[10px] text-gray-400 font-semibold truncate">
                            {formatMB(db.size)} MB
                          </span>
                          <span className="text-[9px] md:text-[10px] text-gray-400 flex-shrink-0">
                            {formatMB(db.maxSize)} MB
                          </span>
                        </div>
                      </div>
                    </div>

                  </div>
                );
              })
            )}
          </div>

        </div>
      </div>
    </>
  );
}