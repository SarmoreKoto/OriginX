"use client";

import { useState, useRef, useEffect } from "react";

interface AddCollectionModalProps {
  dbName: string;
  existingNames: string[];
  onCreated: (name: string) => void;
  onClose: () => void;
}

export default function AddCollectionModal({ dbName, existingNames, onCreated, onClose }: AddCollectionModalProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleInput = (val: string) => {
    setName(val.replace(/[^a-zA-Z0-9_-]/g, ""));
    setError("");
  };

  const handleCreate = async () => {
    const trimmed = name.trim();
    if (!trimmed) { setError("Enter a collection name."); return; }
    if (existingNames.includes(trimmed)) { setError(`"${trimmed}" already exists.`); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 350));
    setLoading(false);
    onCreated(trimmed);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-[420px] p-7 flex flex-col gap-5">
        {/* Title */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-[3px] h-[16px] rounded-full bg-[#0d3d26] block" />
              <h3 className="text-base font-bold text-gray-900">New Collection</h3>
            </div>
            <p className="text-sm text-gray-500 ml-[11px]">
              Creating inside{" "}
              <span className="inline-flex items-center gap-1 font-bold text-white px-2 py-0.5 rounded-full text-xs" style={{ background: "#0d3d26" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                {dbName}
              </span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Input */}
        <div>
          <label className="text-xs font-semibold text-gray-600 block mb-1.5">Collection name</label>
          <input
            ref={inputRef}
            value={name}
            onChange={(e) => handleInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); if (e.key === "Escape") onClose(); }}
            placeholder="e.g. my_collection"
            className={`w-full border rounded-xl px-4 py-2.5 text-sm font-mono text-gray-800 outline-none transition-all ${
              error
                ? "border-red-300 bg-red-50"
                : "border-gray-200 focus:border-[#0d3d26]/50 focus:bg-[#f0faf4]/40"
            }`}
          />
          {error
            ? <p className="text-xs text-red-500 font-medium mt-1.5">{error}</p>
            : <p className="text-[11px] text-gray-400 mt-1.5">Letters, numbers, hyphens and underscores only.</p>
          }
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-green-50 border border-green-100 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: "#0d3d26" }}>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="text-xs font-bold text-green-700">Reuse existing</span>
            </div>
            <p className="text-[11px] text-green-600 leading-relaxed">
              If the database already exists, the new collection will be added inside it.
            </p>
          </div>
          <div className="bg-[#f0faf4] border border-green-100 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: "#0d9488" }}>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M5 2v6M2 5h6" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
              </div>
              <span className="text-xs font-bold text-teal-700">Auto-created</span>
            </div>
            <p className="text-[11px] text-teal-600 leading-relaxed">
              New databases are provisioned on the fly — no manual setup needed.
            </p>
          </div>
        </div>

        {/* Footer buttons */}
        <div className="flex items-center gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-500 hover:text-gray-800 hover:border-gray-300 bg-white transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={loading || !name.trim()}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-white text-sm font-semibold transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
            style={{ background: "#0d3d26" }}
            onMouseEnter={e => { if (!loading && name.trim()) e.currentTarget.style.background = "#0a2e1c"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#0d3d26"; }}
          >
            {loading ? (
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            ) : (
              <>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M5 1v8M1 5h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
                Create Collection
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
