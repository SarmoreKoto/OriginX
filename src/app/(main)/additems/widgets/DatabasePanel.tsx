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
          <span className="w-[3px] h-[14px] rounded-full bg-green-500 block" />
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
              <li
                key={db.name}
                draggable
                onDragStart={() => { dragIdx.current = i; }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (dragIdx.current === null || dragIdx.current === i) return;
                  onReorder(dragIdx.current, i);
                  dragIdx.current = null;
                }}
                onClick={() => onSelect(db.name)}
                className={`
                  group relative flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer
                  transition-all duration-150 select-none
                  ${selectedDb === db.name
                    ? "bg-[#0d3d26] text-white shadow-md"
                    : "hover:bg-gray-50 text-gray-700"
                  }
                `}
              >
                {/* DB icon */}
                <div className={`
                  w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0
                  ${selectedDb === db.name
                    ? "bg-white/15 text-white"
                    : "bg-green-50 text-green-700 border border-green-100"
                  }
                `}>
                  {db.name.slice(0, 2).toUpperCase()}
                </div>

                {/* Name + meta */}
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-semibold truncate ${selectedDb === db.name ? "text-white" : "text-gray-800"}`}>
                    {db.name}
                  </p>
                  <p className={`text-[10px] font-mono mt-0.5 ${selectedDb === db.name ? "text-green-300" : "text-gray-400"}`}>
                    {db.sizeMB} MB
                  </p>
                </div>

                {/* Live dot */}
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${selectedDb === db.name ? "bg-green-400" : "bg-gray-200"}`} />

                {/* Delete on hover */}
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(db.name); }}
                  className={`
                    absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg
                    items-center justify-center transition-all
                    ${selectedDb === db.name
                      ? "hidden group-hover:flex text-white/60 hover:text-white hover:bg-white/10"
                      : "hidden group-hover:flex text-gray-300 hover:text-red-500 hover:bg-red-50"
                    }
                  `}
                >
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                    <path d="M2 2l8 8M10 2L2 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}