"use client";

import { useState } from "react";
import { MetaApi } from "@/config/metaApi";

// ─── Types ────────────────────────────────────────────────────────────────────
interface ApiEndpoint {
  method: "GET" | "POST" | "PUT" | "DELETE";
  name: string;
  url: string;
  description: string;
  category: string;
  body?: Record<string, string>;
  params?: string[];
}

// ─── Method badge colors ──────────────────────────────────────────────────────
const METHOD_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  GET:    { bg: "bg-green-50",  text: "text-green-700",  border: "border-green-200" },
  POST:   { bg: "bg-blue-50",   text: "text-blue-700",   border: "border-blue-200" },
  PUT:    { bg: "bg-amber-50",  text: "text-amber-700",  border: "border-amber-200" },
  DELETE: { bg: "bg-red-50",    text: "text-red-700",    border: "border-red-200" },
};

// ─── All endpoints derived from MetaApi ───────────────────────────────────────
const BASE = MetaApi.baseUrl;

const ENDPOINTS: ApiEndpoint[] = [
  // AUTH
  {
    category: "Auth",
    method: "POST",
    name: "Login",
    url: MetaApi.login,
    description: "Authenticate a user and receive a token",
    body: { email: "string", password: "string" },
  },

  // USERS
  {
    category: "Users",
    method: "GET",
    name: "Get All Users",
    url: MetaApi.users,
    description: "Retrieve all registered users",
  },
  {
    category: "Users",
    method: "GET",
    name: "Get User by ID",
    url: `${MetaApi.users}/:id`,
    description: "Retrieve a single user by their ID",
    params: ["id"],
  },
  {
    category: "Users",
    method: "POST",
    name: "Create User",
    url: MetaApi.users,
    description: "Register a new user",
    body: { name: "string", email: "string", password: "string" },
  },
  {
    category: "Users",
    method: "PUT",
    name: "Update User",
    url: `${MetaApi.users}/:id`,
    description: "Update a user's details by ID",
    params: ["id"],
    body: { name: "string?", email: "string?" },
  },
  {
    category: "Users",
    method: "DELETE",
    name: "Delete User",
    url: `${MetaApi.users}/:id`,
    description: "Delete a user by ID",
    params: ["id"],
  },

  // DATABASES
  {
    category: "Databases",
    method: "GET",
    name: "Get All Databases",
    url: MetaApi.databases,
    description: "List all MongoDB databases",
  },
  {
    category: "Databases",
    method: "POST",
    name: "Create Database",
    url: MetaApi.databases,
    description: "Create a new MongoDB database",
    body: { dbName: "string" },
  },
  {
    category: "Databases",
    method: "DELETE",
    name: "Delete Database",
    url: `${MetaApi.databases}/:dbName`,
    description: "Delete a database (must be empty)",
    params: ["dbName"],
  },

  // COLLECTIONS
  {
    category: "Collections",
    method: "GET",
    name: "Get Collections",
    url: `${MetaApi.collections}/:dbName`,
    description: "List all collections in a database",
    params: ["dbName"],
  },
  {
    category: "Collections",
    method: "POST",
    name: "Create Collection",
    url: `${MetaApi.collections}/:dbName`,
    description: "Create a new collection in a database",
    params: ["dbName"],
    body: { collectionName: "string" },
  },
  {
    category: "Collections",
    method: "DELETE",
    name: "Delete Collection",
    url: `${MetaApi.collections}/:dbName/:collectionName`,
    description: "Delete a collection from a database",
    params: ["dbName", "collectionName"],
  },

  // DOCUMENTS
  {
    category: "Documents",
    method: "GET",
    name: "Get Documents",
    url: `${MetaApi.collections}/:dbName/:collectionName/documents`,
    description: "Fetch all documents from a collection (latest 100)",
    params: ["dbName", "collectionName"],
  },
  {
    category: "Documents",
    method: "POST",
    name: "Insert Document",
    url: `${MetaApi.collections}/:dbName/:collectionName/documents`,
    description: "Insert a new document into a collection",
    params: ["dbName", "collectionName"],
    body: { "...fields": "any" },
  },
  {
    category: "Documents",
    method: "PUT",
    name: "Update Document",
    url: `${MetaApi.collections}/:dbName/:collectionName/documents/:documentId`,
    description: "Update a document by its ID",
    params: ["dbName", "collectionName", "documentId"],
    body: { "...fields": "any" },
  },
  {
    category: "Documents",
    method: "DELETE",
    name: "Delete Document",
    url: `${MetaApi.collections}/:dbName/:collectionName/documents/:documentId`,
    description: "Delete a document by its ID",
    params: ["dbName", "collectionName", "documentId"],
  },
];

const CATEGORIES = ["All", ...Array.from(new Set(ENDPOINTS.map((e) => e.category)))];
const METHODS = ["All", "GET", "POST", "PUT", "DELETE"];

// ─── API Card ─────────────────────────────────────────────────────────────────
function ApiCard({ endpoint }: { endpoint: ApiEndpoint }) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const style = METHOD_STYLES[endpoint.method];

  const copyUrl = () => {
    navigator.clipboard.writeText(endpoint.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const openUrl = () => {
    // Only open GET endpoints directly in browser
    if (endpoint.method === "GET" && !endpoint.url.includes(":")) {
      window.open(endpoint.url, "_blank");
    } else {
      // For parameterized or non-GET, copy to clipboard
      navigator.clipboard.writeText(endpoint.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden hover:border-gray-300 hover:shadow-md transition-all">
      {/* Main row */}
      <div className="flex items-center gap-4 px-5 py-4">
        {/* Method badge */}
        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border flex-shrink-0 font-mono ${style.bg} ${style.text} ${style.border}`}>
          {endpoint.method}
        </span>

        {/* URL */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-gray-900">{endpoint.name}</span>
            <span className="text-[10px] font-semibold text-gray-400 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-full">
              {endpoint.category}
            </span>
          </div>
          <p className="text-xs font-mono text-gray-400 mt-0.5 truncate">{endpoint.url}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Expand */}
          <button
            onClick={() => setExpanded((e) => !e)}
            className="w-8 h-8 rounded-xl bg-gray-50 border border-gray-200 hover:bg-indigo-50 hover:border-indigo-200 flex items-center justify-center text-gray-400 hover:text-indigo-500 transition-all"
            title="View details"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={`transition-transform ${expanded ? "rotate-180" : ""}`}>
              <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* Copy */}
          <button
            onClick={copyUrl}
            className="w-8 h-8 rounded-xl bg-gray-50 border border-gray-200 hover:bg-green-50 hover:border-green-200 flex items-center justify-center text-gray-400 hover:text-green-600 transition-all"
            title="Copy URL"
          >
            {copied ? (
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            ) : (
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="4" y="4" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.2" /><path d="M2 8V2h6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>
            )}
          </button>

          {/* Open (GET only) */}
          <button
            onClick={openUrl}
            className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-all ${
              endpoint.method === "GET" && !endpoint.url.includes(":")
                ? "bg-indigo-50 border-indigo-200 text-indigo-500 hover:bg-indigo-100"
                : "bg-gray-50 border-gray-200 text-gray-300 cursor-not-allowed"
            }`}
            title={endpoint.method === "GET" && !endpoint.url.includes(":") ? "Open in browser" : "Requires parameters"}
            disabled={endpoint.method !== "GET" || endpoint.url.includes(":")}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M5 2H2a1 1 0 00-1 1v7a1 1 0 001 1h7a1 1 0 001-1V7M8 1h3v3M11 1L5.5 6.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-gray-100 bg-gray-50/50 px-5 py-4 flex flex-col gap-3">
          <p className="text-xs text-gray-500">{endpoint.description}</p>

          {endpoint.params && endpoint.params.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">URL Params</p>
              <div className="flex gap-1.5 flex-wrap">
                {endpoint.params.map((p) => (
                  <span key={p} className="text-[11px] font-mono font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-lg">
                    :{p}
                  </span>
                ))}
              </div>
            </div>
          )}

          {endpoint.body && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Request Body</p>
              <div className="bg-white border border-gray-200 rounded-xl p-3">
                <pre className="text-[11px] font-mono text-blue-600 whitespace-pre-wrap">
                  {JSON.stringify(endpoint.body, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Full URL row */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Full URL</p>
            <div className="flex items-center gap-2 bg-gray-900 rounded-xl px-4 py-2.5">
              <span className={`text-[10px] font-bold font-mono ${style.text}`}>{endpoint.method}</span>
              <span className="text-xs font-mono text-gray-200 flex-1 truncate">{endpoint.url}</span>
              <button onClick={copyUrl} className="text-gray-500 hover:text-white transition-colors flex-shrink-0">
                {copied ? (
                  <svg width="13" height="13" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                ) : (
                  <svg width="13" height="13" viewBox="0 0 12 12" fill="none"><rect x="4" y="4" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.2" /><path d="M2 8V2h6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AllApisPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeMethod, setActiveMethod] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = ENDPOINTS.filter((e) => {
    const matchCat = activeCategory === "All" || e.category === activeCategory;
    const matchMethod = activeMethod === "All" || e.method === activeMethod;
    const matchSearch = !search || e.name.toLowerCase().includes(search.toLowerCase()) || e.url.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchMethod && matchSearch;
  });

  // Group by category
  const grouped = filtered.reduce<Record<string, ApiEndpoint[]>>((acc, e) => {
    if (!acc[e.category]) acc[e.category] = [];
    acc[e.category].push(e);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-[#f4f6fb] font-sans">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">All APIs</h1>
            <p className="text-sm text-gray-500 mt-1">All available API endpoints — click to open, copy URLs, view request details</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-full">
              {ENDPOINTS.length} endpoints
            </span>
            <span className="text-xs font-semibold text-gray-500 bg-white border border-gray-200 px-3 py-1.5 rounded-full">
              {BASE}
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 mb-5 flex items-center gap-4 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.4" />
              <path d="M10.5 10.5l2 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search endpoints…"
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-indigo-300 transition-all"
            />
          </div>

          {/* Category filter */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all ${
                  activeCategory === cat
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                    : "bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-800"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="w-px h-6 bg-gray-200 flex-shrink-0" />

          {/* Method filter */}
          <div className="flex items-center gap-1.5">
            {METHODS.map((m) => {
              const s = m !== "All" ? METHOD_STYLES[m] : null;
              return (
                <button
                  key={m}
                  onClick={() => setActiveMethod(m)}
                  className={`text-[11px] font-bold px-2.5 py-1.5 rounded-lg border transition-all font-mono ${
                    activeMethod === m
                      ? m === "All"
                        ? "bg-gray-900 text-white border-gray-900"
                        : `${s!.bg} ${s!.text} ${s!.border} ring-2 ring-offset-1 ring-current`
                      : "bg-gray-50 text-gray-400 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {m}
                </button>
              );
            })}
          </div>
        </div>

        {/* Endpoint groups */}
        {Object.keys(grouped).length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col items-center justify-center py-20 gap-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-gray-300"><circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5" /><path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
            <p className="text-sm font-semibold text-gray-400">No endpoints match your filters</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {Object.entries(grouped).map(([category, endpoints]) => (
              <div key={category}>
                {/* Category header */}
                <div className="flex items-center gap-3 mb-3">
                  <h2 className="text-sm font-bold text-gray-700">{category}</h2>
                  <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{endpoints.length}</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>
                <div className="flex flex-col gap-2">
                  {endpoints.map((ep, i) => <ApiCard key={i} endpoint={ep} />)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}