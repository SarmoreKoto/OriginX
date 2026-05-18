'use client';

import { useEffect, useState } from 'react';
import DatabaseUsageCard from './widgets/dashboard_storage_ui';
import DatabaseUsageCard2 from './widgets/dash_collection_card';
import UsersDirectory from './widgets/dash_users_card';
import { Icons } from '@/resources/icons';
import { getDatabases } from '@/handler/collection_handler';
import { apiHandler } from '@/handler/api_handler';
import { MetaApi } from '@/config/metaApi';
import CollectionsGaugeCard from './widgets/dash_collection_card';

// ── Inline number-only fetchers ────────────────────────────────────────────

function TotalDatabasesStatNumber() {
  const [count, setCount] = useState<number | null>(null);
  useEffect(() => {
    getDatabases().then(res => {
      if (res.ok && Array.isArray(res.data)) setCount(res.data.length);
    }).catch(() => setCount(0));
  }, []);
  if (count === null) return <div className="w-16 h-12 rounded-xl bg-white/10 animate-pulse my-1" />;
  return <p className="text-5xl font-black text-white tracking-tight">{count}</p>;
}

function TotalCollectionsStatNumber() {
  const [count, setCount] = useState<number | null>(null);
  useEffect(() => {
    (async () => {
      try {
        const dbRes = await getDatabases();
        if (!dbRes.ok || !Array.isArray(dbRes.data)) return;
        const results = await Promise.allSettled(
          dbRes.data.map((d: any) => apiHandler({ url: MetaApi.getCollections(d.name) }))
        );
        let total = 0;
        for (const r of results) {
          if (r.status === 'fulfilled' && r.value.ok) {
            total += (Array.isArray(r.value.data) ? r.value.data : []).length;
          }
        }
        setCount(total);
      } catch { setCount(0); }
    })();
  }, []);
  if (count === null) return <div className="w-14 h-10 rounded-xl bg-gray-100 animate-pulse my-1" />;
  return <p className="text-4xl font-black text-gray-900 tracking-tight">{count}</p>;
}

function TotalUsersStatNumber() {
  const [count, setCount] = useState<number | null>(null);
  useEffect(() => {
    apiHandler({ url: MetaApi.users }).then(res => {
      if (res.ok) setCount((Array.isArray(res.data) ? res.data : []).length);
    }).catch(() => setCount(0));
  }, []);
  if (count === null) return <div className="w-14 h-10 rounded-xl bg-gray-100 animate-pulse my-1" />;
  return <p className="text-4xl font-black text-gray-900 tracking-tight">{count}</p>;
}

// ── Generic white stat mini-card shell ────────────────────────────────────

function StatMiniCard({
  icon, label, badge, sub, children,
}: {
  icon: React.ReactNode;
  label: string;
  badge: string;
  sub: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="stat-card relative bg-white rounded-2xl p-5 overflow-hidden cursor-pointer"
      style={{ border: '1px solid #f0f0f0', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
    >
      <button
        className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center"
        style={{ border: '1px solid #f3f4f6', color: '#9ca3af' }}
      >
        <Icons.arrowUpRight size={11} />
      </button>

      <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-4" style={{ background: '#f0faf4' }}>
        {icon}
      </div>

      <p className="text-xs font-semibold text-gray-400 mb-1">{label}</p>
      {children}

      <div className="flex items-center gap-1.5 mt-2">
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: '#f0faf4', color: '#16a34a' }}>
          {badge}
        </span>
        <span className="text-[10px] text-gray-400">{sub}</span>
      </div>
    </div>
  );
}

// ── Main Dashboard Page ────────────────────────────────────────────────────

export default function DashboardPage() {
  // const userName  = 'Totok Michael';
  // const firstName = userName.split(' ')[0];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800;900&display=swap');

        * { font-family: 'Sora', sans-serif; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .fu  { animation: fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) both; }
        .d1  { animation-delay: 0.05s; }
        .d2  { animation-delay: 0.12s; }
        .d3  { animation-delay: 0.20s; }
        .d4  { animation-delay: 0.28s; }
        .d5  { animation-delay: 0.36s; }

        .stat-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .stat-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.08) !important; }
      `}</style>

      <div className="min-h-screen" style={{ background: '#f8faf9', fontFamily: 'Sora, sans-serif' }}>
        <main className="p-8">

          {/* ── Welcome Header ───────────────────────────────── */}
          <div className="fu d1 flex items-center justify-between mb-8">
            <div>
              <h1 className="text-[28px] font-black text-gray-900 tracking-tight leading-none mb-1">
                Welcome back,
              </h1>
              <p className="text-sm text-gray-400 font-medium">
                Plan, prioritize, and accomplish your goals with ease.
              </p>
            </div>

            <button
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #1a5c3a, #0f3d26)',
                boxShadow: '0 4px 14px rgba(26,92,58,0.35)',
              }}
            >
              <span className="text-base leading-none">+</span>
              Add Database
            </button>
          </div>

          {/* ── STAT CARDS ROW ───────────────────────────────── */}
          <div className="fu d2 grid grid-cols-4 gap-4 mb-6">

            {/* Hero — Total Databases (dark green) */}
            <div
              className="stat-card relative rounded-2xl p-5 overflow-hidden cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #1a5c3a 0%, #0f3d26 60%, #0a2d1c 100%)',
                boxShadow: '0 6px 24px rgba(26,92,58,0.3)',
              }}
            >
              <button
                className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.15)' }}
              >
                <Icons.arrowUpRight size={11} className="text-white" />
              </button>
              {/* Decorative rings */}
              <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full pointer-events-none" style={{ border: '1.5px solid rgba(255,255,255,0.1)' }} />
              <div className="absolute -top-1 -right-1 w-14 h-14 rounded-full pointer-events-none" style={{ border: '1.5px solid rgba(255,255,255,0.07)' }} />

              <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-4" style={{ background: 'rgba(255,255,255,0.15)' }}>
                <Icons.bookmark size={15} className="text-white" />
              </div>
              <p className="text-xs font-semibold mb-1" style={{ color: 'rgba(167,243,208,0.8)' }}>
                Total Databases
              </p>
              <TotalDatabasesStatNumber />
              <div className="flex items-center gap-1.5 mt-2">
                <span
                  className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(74,222,128,0.2)', color: '#86efac' }}
                >
                  <Icons.trendingUp size={10} /> Live
                </span>
                <span className="text-[10px]" style={{ color: 'rgba(167,243,208,0.6)' }}>from MongoDB</span>
              </div>
            </div>

            {/* Total Collections */}
            <StatMiniCard
              icon={<Icons.package size={15} style={{ color: '#1a5c3a' }} />}
              label="Total Collections"
              badge="Live"
              sub="across all databases"
            >
              <TotalCollectionsStatNumber />
            </StatMiniCard>

            {/* Total Users */}
            <StatMiniCard
              icon={<Icons.users size={15} style={{ color: '#1a5c3a' }} />}
              label="Total Users"
              badge="Live"
              sub="registered users"
            >
              <TotalUsersStatNumber />
            </StatMiniCard>

            {/* graph card */}
          <CollectionsGaugeCard/>
          </div>

          {/* ── MAIN GRID ────────────────────────────────────── */}
          <div className="grid grid-cols-12 gap-5">

            {/* Left — Storage + Collections */}
            <div className="col-span-5 space-y-5">
              <div className="fu d3">
                <DatabaseUsageCard />
              </div>
            </div>

            {/* Right — Users table */}
            <div className="col-span-7 fu d5">
              <UsersDirectory />
            </div>
          </div>

        </main>
      </div>
    </>
  );
}