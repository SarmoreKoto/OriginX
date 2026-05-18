"use client";

import { useRef } from "react";
import CollectionCard from "./CollectionCard";
import SkeletonList from "./SkeletonList";
import EmptyState from "./EmptyState";

interface CollectionEntry { name: string; status: string; }

interface CollectionsPanelProps {
  selectedDb: string | null;
  collections: CollectionEntry[];
  loading: boolean;
  selectedCollection: string | null;
  onSelectCollection: (name: string) => void;
  onDelete: (name: string) => void;
  onReorderCols: (from: number, to: number) => void;
  onAddCollection: () => void;
}

const ArrowSvg = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function CollectionsPanel({
  selectedDb, collections, loading, selectedCollection,
  onSelectCollection, onDelete, onReorderCols, onAddCollection,
}: CollectionsPanelProps) {
  const dragIdx = useRef<number | null>(null);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="w-[3px] h-[16px] rounded-full bg-[#0d3d26] block" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Collections</span>
          {selectedDb && (
            <>
              <span className="text-gray-300 text-xs">in</span>
              {/* DB pill — dark green matching screenshot's active sidebar item */}
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-white px-2.5 py-0.5 rounded-full" style={{ background: "#0d3d26" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                {selectedDb}
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          {selectedDb && !loading && (
            <span className="text-[10px] font-bold bg-gray-50 border border-gray-200 text-gray-500 px-2 py-0.5 rounded-full">
              {collections.length}
            </span>
          )}
          {selectedDb && (
            <button
              onClick={onAddCollection}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-white text-xs font-semibold transition-all shadow-sm active:scale-95"
              style={{ background: "#0d3d26" }}
              onMouseEnter={e => (e.currentTarget.style.background = "#0a2e1c")}
              onMouseLeave={e => (e.currentTarget.style.background = "#0d3d26")}
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M5 1v8M1 5h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              New Collection
            </button>
          )}
        </div>
      </div>

      <div className="p-5">
        {!selectedDb ? (
          <EmptyState
            icon={<ArrowSvg />}
            message="Select a database"
            sub="Click a database on the left to view its collections"
            className="py-20"
          />
        ) : loading ? (
          <SkeletonList count={4} variant="card" />
        ) : collections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-400">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="5" width="18" height="4" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
                <rect x="3" y="11" width="18" height="4" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
                <rect x="3" y="17" width="11" height="4" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-500">No collections yet</p>
              <p className="text-xs text-gray-400 mt-1">This database is empty. Add a collection to get started.</p>
            </div>
            <button
              onClick={onAddCollection}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-all shadow-sm active:scale-95"
              style={{ background: "#0d3d26" }}
              onMouseEnter={e => (e.currentTarget.style.background = "#0a2e1c")}
              onMouseLeave={e => (e.currentTarget.style.background = "#0d3d26")}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M6 2v8M2 6h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              Add Collection
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
            {collections.map((col, i) => (
              <CollectionCard
                key={col.name}
                col={col}
                index={i}
                isSelected={selectedCollection === col.name}
                onSelect={() => onSelectCollection(col.name)}
                onDelete={() => onDelete(col.name)}
                onDragStart={() => { dragIdx.current = i; }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (dragIdx.current === null || dragIdx.current === i) return;
                  onReorderCols(dragIdx.current, i);
                  dragIdx.current = null;
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
