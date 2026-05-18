"use client";

import { useRef } from "react";
import DatabaseItem from "./DatabaseItem";
import SkeletonList from "./SkeletonList";
import EmptyState from "./EmptyState";

interface DbEntry { name: string; sizeMB: string; empty: boolean; }

interface DatabasePanelProps {
  databases: DbEntry[];
  selectedDb: string | null;
  loading: boolean;
  onSelect: (name: string) => void;
  onDelete: (name: string) => void;
  onReorder: (from: number, to: number) => void;
}

const DbSvg = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <ellipse cx="12" cy="6" rx="8" ry="3.2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M4 6v6c0 1.8 3.6 3.2 8 3.2s8-1.4 8-3.2V6" stroke="currentColor" strokeWidth="1.5" />
    <path d="M4 12v6c0 1.8 3.6 3.2 8 3.2s8-1.4 8-3.2v-6" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

export default function DatabasePanel({ databases, selectedDb, loading, onSelect, onDelete, onReorder }: DatabasePanelProps) {
  const dragIdx = useRef<number | null>(null);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="w-[3px] h-[14px] rounded-full bg-[#0d3d26] block" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Databases</span>
        </div>
        {!loading && (
          <span className="text-[10px] font-bold bg-gray-50 border border-gray-200 text-gray-500 px-2 py-0.5 rounded-full">
            {databases.length}
          </span>
        )}
      </div>

      <div className="p-2">
        {loading ? (
          <SkeletonList count={5} />
        ) : databases.length === 0 ? (
          <EmptyState icon={<DbSvg />} message="No databases found" sub="Create one to get started" />
        ) : (
          <ul className="flex flex-col gap-0.5">
            {databases.map((db, i) => (
              <DatabaseItem
                key={db.name}
                db={db}
                index={i}
                isSelected={selectedDb === db.name}
                onClick={() => onSelect(db.name)}
                onDelete={(e) => { e.stopPropagation(); onDelete(db.name); }}
                onDragStart={() => { dragIdx.current = i; }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (dragIdx.current === null || dragIdx.current === i) return;
                  onReorder(dragIdx.current, i);
                  dragIdx.current = null;
                }}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
