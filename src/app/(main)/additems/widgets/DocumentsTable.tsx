"use client";

import { useState } from "react";

interface DocumentsTableProps {
  documents: Record<string, unknown>[];
  collectionName: string;
}

export default function DocumentsTable({ documents, collectionName }: DocumentsTableProps) {
  const [search, setSearch] = useState("");

  if (documents.length === 0) return null;

  const allKeys = Array.from(
    new Set(documents.flatMap((d) => Object.keys(d).filter((k) => k !== "_insertedAt")))
  );

  const filtered = documents.filter((doc) =>
    !search.trim() || Object.values(doc).some((v) => String(v).toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="mt-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Records</h3>
          <span className="text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100 px-2.5 py-0.5 rounded-full">
            {documents.length}
          </span>
          <span className="text-[10px] text-gray-400 font-medium">in {collectionName}</span>
        </div>
        <div className="relative">
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.4" />
            <path d="M10.5 10.5l2 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          <input
            className="bg-gray-50 border border-gray-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-gray-700 placeholder-gray-400 outline-none focus:border-indigo-300 transition-all w-44"
            placeholder="Search records…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider w-10">#</th>
                {allKeys.map((key) => (
                  <th key={key} className="text-left px-4 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                    {key}
                  </th>
                ))}
                <th className="text-left px-4 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                  Inserted At
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={allKeys.length + 2} className="text-center py-8 text-gray-400 text-sm">
                    No records match your search.
                  </td>
                </tr>
              ) : (
                filtered.map((doc, i) => (
                  <tr key={i} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-4 py-3 text-[10px] text-gray-400 font-mono font-bold">{i + 1}</td>
                    {allKeys.map((key) => (
                      <td key={key} className="px-4 py-3 text-xs text-blue-600 font-mono whitespace-nowrap max-w-[200px] truncate">
                        {doc[key] !== undefined
                          ? String(doc[key])
                          : <span className="text-gray-300 italic">—</span>
                        }
                      </td>
                    ))}
                    <td className="px-4 py-3 text-[11px] text-gray-400 font-mono whitespace-nowrap">
                      {doc._insertedAt
                        ? new Date(doc._insertedAt as string).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
                        : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
