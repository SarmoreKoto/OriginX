"use client";

import { useState } from "react";

interface DocumentsTableProps {
  documents: Record<string, unknown>[];
  collectionName: string;
}

const AVATAR_COLORS = [
  { bg: "#0d9488", text: "#fff" },
  { bg: "#f59e0b", text: "#fff" },
  { bg: "#3b82f6", text: "#fff" },
  { bg: "#8b5cf6", text: "#fff" },
  { bg: "#ec4899", text: "#fff" },
  { bg: "#10b981", text: "#fff" },
  { bg: "#f97316", text: "#fff" },
];

function getInitials(val: string): string {
  const s = String(val).trim();
  const parts = s.split(/[\s_-]/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return s.slice(0, 2).toUpperCase();
}

export default function DocumentsTable({ documents, collectionName }: DocumentsTableProps) {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  if (documents.length === 0) return null;

  const allKeys = Array.from(
    new Set(documents.flatMap((d) => Object.keys(d).filter((k) => k !== "_insertedAt")))
  );

  const nameKey = allKeys.find((k) => /name|user|title/i.test(k));
  const statusKey = allKeys.find((k) => /status|state|active/i.test(k));
  const roleKey = allKeys.find((k) => /role|type|kind/i.test(k));

  const filtered = documents.filter((doc) =>
    !search.trim() || Object.values(doc).some((v) => String(v).toLowerCase().includes(search.toLowerCase()))
  );

  const filterKey = statusKey ?? roleKey;
  const filterValues = filterKey
    ? ["All", ...Array.from(new Set(documents.map((d) => String(d[filterKey] ?? ""))))]
    : ["All"];

  const finalFiltered =
    activeFilter === "All" || !filterKey
      ? filtered
      : filtered.filter((d) => String(d[filterKey] ?? "") === activeFilter);

  const roleBadgeStyle = (val: string) => {
    const v = val.toLowerCase();
    if (v === "admin") return { bg: "#fef9c3", text: "#854d0e", border: "#fde047" };
    if (v === "manager") return { bg: "#dbeafe", text: "#1e40af", border: "#93c5fd" };
    if (v === "user") return { bg: "#f3f4f6", text: "#374151", border: "#d1d5db" };
    return { bg: "#f3f4f6", text: "#374151", border: "#d1d5db" };
  };

  const isActive = (val: unknown) => {
    const v = String(val).toLowerCase();
    return v === "active" || v === "true" || v === "1" || v === "yes";
  };

  return (
    <div className="mt-2">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2 md:gap-3 flex-wrap w-full sm:w-auto">
          {/* Section title */}
          <div className="flex items-center gap-2.5">
            <span className="w-[3px] h-[16px] rounded-full bg-[#0d3d26] block flex-shrink-0" />
            <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Records</h3>
            <span className="text-[10px] font-bold bg-[#0d3d26]/10 text-[#0d3d26] border border-[#0d3d26]/20 px-2 py-0.5 rounded-full">
              {documents.length}
            </span>
          </div>

          {/* Filter tabs — scrollable on mobile */}
          {filterValues.length > 1 && (
            <div className="flex items-center gap-1 ml-2 overflow-x-auto pb-1">
              {filterValues.map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex-shrink-0 ${
                    activeFilter === f
                      ? "text-white shadow-sm"
                      : "bg-white border border-gray-200 text-gray-500 hover:border-gray-300"
                  }`}
                  style={activeFilter === f ? { background: "#0d3d26" } : {}}
                >
                  {f}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-48">
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 flex-shrink-0">
            <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.4" />
            <path d="M10.5 10.5l2 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          <input
            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-8 pr-3 py-2 text-xs text-gray-700 placeholder-gray-400 outline-none focus:border-[#0d3d26]/40 focus:bg-white transition-all"
            placeholder="Search…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* ── Table — Scrollable container ── */}
      <div className="rounded-2xl border border-gray-200 overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-full">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200">
                <th className="text-left px-3 md:px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest w-10 md:w-12 flex-shrink-0">No</th>
                {nameKey && (
                  <th className="text-left px-3 md:px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    {nameKey.toUpperCase()}
                  </th>
                )}
                {allKeys.filter((k) => k !== nameKey).map((key) => (
                  <th key={key} className="text-left px-3 md:px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">
                    {key.length > 12 ? key.slice(0, 10) + "…" : key.toUpperCase()}
                  </th>
                ))}
                <th className="text-left px-3 md:px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">
                  Time
                </th>
                <th className="text-right px-3 md:px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {finalFiltered.length === 0 ? (
                <tr>
                  <td colSpan={allKeys.length + 3} className="text-center py-12 text-gray-400 text-sm">
                    <div className="flex flex-col items-center gap-2">
                      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className="text-gray-300">
                        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M20 20l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                      <span className="text-xs font-medium text-gray-400">No records found</span>
                    </div>
                  </td>
                </tr>
              ) : (
                finalFiltered.map((doc, i) => {
                  const avatarColor = AVATAR_COLORS[i % AVATAR_COLORS.length];
                  const nameVal = nameKey ? String(doc[nameKey] ?? "") : "";

                  return (
                    <tr key={i} className="hover:bg-[#f0faf4]/60 transition-colors group">
                      {/* No badge */}
                      <td className="px-3 md:px-5 py-3.5 flex-shrink-0">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-gray-100 text-[11px] font-bold text-gray-500 font-mono">
                          {i + 1}
                        </span>
                      </td>

                      {/* Name with avatar */}
                      {nameKey && (
                        <td className="px-3 md:px-5 py-3.5 min-w-0">
                          <div className="flex items-center gap-2 md:gap-3">
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                              style={{ background: avatarColor.bg, color: avatarColor.text }}
                            >
                              {getInitials(nameVal)}
                            </div>
                            <div className="min-w-0 hidden sm:block">
                              <p className="text-xs font-semibold text-gray-800 truncate">{nameVal}</p>
                              {typeof doc._insertedAt === "string" && (
                                <p className="text-[10px] text-gray-400 font-mono">
                                  {new Date(doc._insertedAt).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                      )}

                      {/* Other columns */}
                      {allKeys.filter((k) => k !== nameKey).map((key) => {
                        const val = doc[key];
                        const strVal = val !== undefined ? String(val) : "";

                        // Role badge
                        if (key === roleKey && strVal) {
                          const rs = roleBadgeStyle(strVal);
                          return (
                            <td key={key} className="px-3 md:px-5 py-3.5 hidden md:table-cell">
                              <span
                                className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase border"
                                style={{ background: rs.bg, color: rs.text, borderColor: rs.border }}
                              >
                                {strVal}
                              </span>
                            </td>
                          );
                        }

                        // Status toggle
                        if (key === statusKey && strVal) {
                          const active = isActive(val);
                          return (
                            <td key={key} className="px-3 md:px-5 py-3.5 hidden md:table-cell">
                              <div className="flex items-center gap-2">
                                <div className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 ${active ? "bg-[#0d3d26]" : "bg-gray-300"}`}>
                                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${active ? "left-4" : "left-0.5"}`} />
                                </div>
                                <span className={`text-xs font-semibold ${active ? "text-[#0d3d26]" : "text-gray-400"}`}>
                                  {active ? "ON" : "OFF"}
                                </span>
                              </div>
                            </td>
                          );
                        }

                        // Default cell
                        return (
                          <td key={key} className="px-3 md:px-5 py-3.5 text-xs text-gray-600 font-mono whitespace-nowrap max-w-[100px] md:max-w-[200px] truncate hidden md:table-cell">
                            {val !== undefined ? strVal : <span className="text-gray-300 italic">—</span>}
                          </td>
                        );
                      })}

                      {/* Time */}
                      <td className="px-3 md:px-5 py-3.5 text-[11px] text-gray-400 font-mono whitespace-nowrap hidden sm:table-cell">
                        {doc._insertedAt
                          ? new Date(doc._insertedAt as string).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                          : "—"}
                      </td>

                      {/* Actions */}
                      <td className="px-3 md:px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-500 hover:text-[#0d3d26] hover:border-[#0d3d26]/30 bg-white transition-all hidden sm:flex">
                            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                              <path d="M8.5 1.5a1.2 1.2 0 0 1 1.7 1.7L3.5 9.9l-2.5.6.6-2.5L8.5 1.5z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span className="hidden md:inline">Edit</span>
                          </button>
                          <button className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-transparent text-xs font-semibold text-red-400 hover:text-red-600 hover:bg-red-50 hover:border-red-100 transition-all hidden sm:flex">
                            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                              <path d="M1.5 3h9M4.5 3V2.25h3V3M3.5 3l.5 6.5h4l.5-6.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span className="hidden md:inline">Delete</span>
                          </button>
                          {/* Mobile compact view */}
                          <button className="flex sm:hidden items-center justify-center w-8 h-8 rounded-lg text-red-500 hover:bg-red-50 transition-all">
                            <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
                              <path d="M1.5 3h9M4.5 3V2.25h3V3M3.5 3l.5 6.5h4l.5-6.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 md:px-5 py-3 border-t border-gray-100 bg-gray-50/50">
          <span className="text-[11px] text-gray-400 font-medium">
            <span className="font-bold text-gray-600">{finalFiltered.length}</span>
            <span className="hidden sm:inline"> of </span>
            <span className="hidden sm:inline font-bold text-gray-600">{documents.length}</span>
          </span>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-semibold text-gray-400 hidden sm:inline">Live data</span>
            <span className="text-[10px] font-semibold text-gray-400 sm:hidden">Live</span>
          </div>
        </div>
      </div>
    </div>
  );
}