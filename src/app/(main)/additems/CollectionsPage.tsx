"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getDatabases,
  getCollections,
  deleteCollection,
  getDocuments,          // ← add this export to collection_handler.ts (see note below)
} from "@/handler/collection_handler";
import { apiHandler } from "@/handler/api_handler";
import { MetaApi } from "@/config/metaApi";

import DatabasePanel from "./widgets/DatabasePanel";
import CollectionsPanel from "./widgets/CollectionsPanel";
import DeleteModal from "./widgets/DeleteModal";
import AddCollectionModal from "./widgets/AddCollectionModal";
import InsertDocumentForm from "./widgets/InsertDocumentForm";
import DocumentsTable from "./widgets/DocumentsTable";

export interface DbEntry {
  name: string;
  sizeMB: string;
  empty: boolean;
}

export interface CollectionEntry {
  name: string;
  status: string;
}

export default function CollectionsPage() {
  const [databases, setDatabases] = useState<DbEntry[]>([]);
  const [selectedDb, setSelectedDb] = useState<string | null>(null);
  const [collections, setCollections] = useState<CollectionEntry[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [documents, setDocuments] = useState<Record<string, unknown>[]>([]);
  const [showInsertForm, setShowInsertForm] = useState(false);

  const [loadingDbs, setLoadingDbs] = useState(true);
  const [loadingCols, setLoadingCols] = useState(false);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [confirmDelete, setConfirmDelete] = useState<{ type: "db" | "col"; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showAddColModal, setShowAddColModal] = useState(false);

  // ── fetch databases ──────────────────────────────────────────────────────────
  const fetchDbs = useCallback(async (refresh = false) => {
    refresh ? setIsRefreshing(true) : setLoadingDbs(true);
    setError("");
    const res = await getDatabases();
    setLoadingDbs(false);
    setIsRefreshing(false);
    if (!res.ok) return setError(res.data || "Failed to load databases.");
    setDatabases(res.data ?? []);
  }, []);

  useEffect(() => { fetchDbs(); }, [fetchDbs]);

  // ── select db ────────────────────────────────────────────────────────────────
  const handleSelectDb = async (dbName: string) => {
    if (selectedDb === dbName) {
      setSelectedDb(null);
      setCollections([]);
      setSelectedCollection(null);
      setDocuments([]);
      setShowInsertForm(false);
      return;
    }
    setSelectedDb(dbName);
    setSelectedCollection(null);
    setDocuments([]);
    setShowInsertForm(false);
    setCollections([]);
    setLoadingCols(true);
    const res = await getCollections(dbName);
    setLoadingCols(false);
    if (!res.ok) return setError(res.data || "Failed to load collections.");
    setCollections(res.data ?? []);
  };

  // ── fetch documents for selected collection ──────────────────────────────────
  const fetchDocuments = useCallback(async (dbName: string, colName: string) => {
    setLoadingDocs(true);
    setDocuments([]);
    try {
      const res = await getDocuments(dbName, colName);
      console.log("📄 fetchDocuments res:", res);
      if (res.ok) {
        // handle both { data: [...] } and direct array shapes
        const raw = res.data;
        const docs = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.data)
          ? raw.data
          : Array.isArray(raw?.documents)
          ? raw.documents
          : [];
        setDocuments(docs);
      }
    } catch {
      // silently fail — table stays empty
    } finally {
      setLoadingDocs(false);
    }
  }, []);

  // ── select collection ────────────────────────────────────────────────────────
  const handleSelectCollection = (colName: string) => {
    if (selectedCollection === colName) {
      setSelectedCollection(null);
      setDocuments([]);
      setShowInsertForm(false);
      return;
    }
    setSelectedCollection(colName);
    setDocuments([]);
    setShowInsertForm(false);
    // Fetch existing docs immediately
    if (selectedDb) fetchDocuments(selectedDb, colName);
  };

  // ── document inserted ────────────────────────────────────────────────────────
  const handleInserted = (doc: Record<string, unknown>) => {
    setDocuments((prev) => [doc, ...prev]);
  };

  // ── collection created ───────────────────────────────────────────────────────
  const handleCollectionCreated = (name: string) => {
    setCollections((prev) => [...prev, { name, status: "active" }]);
    setShowAddColModal(false);
    setSelectedCollection(name);
    setDocuments([]);
    setShowInsertForm(false);
  };

  // ── delete collection ────────────────────────────────────────────────────────
  const handleDeleteCol = async () => {
    if (!confirmDelete || !selectedDb) return;
    setDeleting(true);
    const res = await deleteCollection(selectedDb, confirmDelete.name);
    setDeleting(false);
    setConfirmDelete(null);
    if (!res.ok) return setError(res.data || "Failed to delete collection.");
    setCollections((prev) => prev.filter((c) => c.name !== confirmDelete.name));
    if (selectedCollection === confirmDelete.name) {
      setSelectedCollection(null);
      setDocuments([]);
      setShowInsertForm(false);
    }
  };

  // ── delete database ──────────────────────────────────────────────────────────
  const handleDeleteDb = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    const res = await apiHandler({ url: MetaApi.deleteDatabase(confirmDelete.name), method: "delete" });
    setDeleting(false);
    setConfirmDelete(null);
    if (!res.ok) return setError(res.message || "Failed to delete database.");
    if (selectedDb === confirmDelete.name) {
      setSelectedDb(null);
      setCollections([]);
      setSelectedCollection(null);
      setDocuments([]);
      setShowInsertForm(false);
    }
    fetchDbs();
  };

  const handleReorderDbs = (from: number, to: number) => {
    setDatabases((prev) => {
      const arr = [...prev];
      const [item] = arr.splice(from, 1);
      arr.splice(to, 0, item);
      return arr;
    });
  };

  const handleReorderCols = (from: number, to: number) => {
    setCollections((prev) => {
      const arr = [...prev];
      const [item] = arr.splice(from, 1);
      arr.splice(to, 0, item);
      return arr;
    });
  };

  return (
    <div className="min-h-screen bg-[#f4f6fb] font-sans">
      {/* Error banner */}
      {error && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 bg-white border border-red-200 shadow-lg rounded-xl text-sm text-red-600 max-w-lg">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.4" />
            <path d="M8 4.5v4M8 10.5h.01" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          <span className="flex-1 text-xs font-medium">{error}</span>
          <button onClick={() => setError("")} className="text-red-400 hover:text-red-600 text-lg leading-none">×</button>
        </div>
      )}

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Collections</h1>
            <p className="text-sm text-gray-500 mt-1">Manage your MongoDB databases and collections</p>
          </div>
          <div className="flex items-center gap-3">
            {!loadingDbs && databases.length > 0 && (
              <div className="flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                {databases.length} DBs
              </div>
            )}
            <button
              onClick={() => fetchDbs(true)}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-800 disabled:opacity-50 transition-all shadow-sm"
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" className={isRefreshing ? "animate-spin" : ""}>
                <path d="M1 6.5a5.5 5.5 0 1 0 1-3M1 1v2.5h2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {isRefreshing ? "Refreshing…" : "Refresh"}
            </button>
          </div>
        </div>

        {/* Top row: DB panel + Collections panel side by side */}
        <div className="grid grid-cols-[240px_1fr] gap-4 items-start mb-4">
          <DatabasePanel
            databases={databases}
            selectedDb={selectedDb}
            loading={loadingDbs}
            onSelect={handleSelectDb}
            onDelete={(name) => setConfirmDelete({ type: "db", name })}
            onReorder={handleReorderDbs}
          />
          <CollectionsPanel
            selectedDb={selectedDb}
            collections={collections}
            loading={loadingCols}
            selectedCollection={selectedCollection}
            onSelectCollection={handleSelectCollection}
            onDelete={(name) => setConfirmDelete({ type: "col", name })}
            onReorderCols={handleReorderCols}
            onAddCollection={() => setShowAddColModal(true)}
          />
        </div>

        {/* Bottom: Records + Insert area — full width, shown when collection selected */}
        {selectedCollection && selectedDb && (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            {/* Breadcrumb + Add Items button */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 inline-block" />
                  {selectedDb}
                </span>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-gray-300">
                  <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-3 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                  {selectedCollection}
                </span>
                {documents.length > 0 && (
                  <span className="text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-full">
                    {documents.length} record{documents.length !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
              {!showInsertForm && (
                <button
                  onClick={() => setShowInsertForm(true)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-white text-sm font-bold transition-all shadow-md shadow-green-100 active:scale-95"
                >
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <path d="M6.5 2v9M2 6.5h9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  Add Items
                </button>
              )}
            </div>

            <div className="p-6">
              {/* Insert form */}
              {showInsertForm && (
                <div className="mb-6 pb-6 border-b border-gray-100">
                  <InsertDocumentForm
                    dbName={selectedDb}
                    collectionName={selectedCollection}
                    onInserted={handleInserted}
                    onBack={() => setShowInsertForm(false)}
                  />
                </div>
              )}

              {/* Records table or loading or empty placeholder */}
              {loadingDocs ? (
                <div className="flex flex-col gap-2 animate-pulse">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="h-10 bg-gray-100 rounded-xl border border-gray-200" />
                  ))}
                </div>
              ) : documents.length > 0 ? (
                <DocumentsTable documents={documents} collectionName={selectedCollection} />
              ) : !showInsertForm ? (
                <div className="border border-dashed border-gray-200 rounded-2xl py-16 flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-300">
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                      <rect x="2" y="4" width="18" height="4" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
                      <rect x="2" y="10" width="18" height="4" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
                      <rect x="2" y="16" width="11" height="4" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-gray-400">No records yet</p>
                    <p className="text-xs text-gray-300 mt-1">
                      Click <span className="font-semibold text-green-500">Add Items</span> to insert your first document
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>

      {showAddColModal && selectedDb && (
        <AddCollectionModal
          dbName={selectedDb}
          existingNames={collections.map((c) => c.name)}
          onCreated={handleCollectionCreated}
          onClose={() => setShowAddColModal(false)}
        />
      )}

      {confirmDelete && (
        <DeleteModal
          type={confirmDelete.type}
          name={confirmDelete.name}
          deleting={deleting}
          onConfirm={confirmDelete.type === "col" ? handleDeleteCol : handleDeleteDb}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}