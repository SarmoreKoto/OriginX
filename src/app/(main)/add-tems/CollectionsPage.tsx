"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getDatabases,
  getCollections,
  deleteCollection,
  getDocuments,
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

  // Mobile sidebar state
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

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
    setShowMobileSidebar(false); // Close sidebar on selection
    const res = await getCollections(dbName);
    setLoadingCols(false);
    if (!res.ok) return setError(res.data || "Failed to load collections.");
    setCollections(res.data ?? []);
  };

  // ── fetch documents ──────────────────────────────────────────────────────────
  const fetchDocuments = useCallback(async (dbName: string, colName: string) => {
    setLoadingDocs(true);
    setDocuments([]);
    try {
      const res = await getDocuments(dbName, colName);
      if (res.ok) {
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
      // silently fail
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
    if (selectedDb) fetchDocuments(selectedDb, colName);
  };

  const handleInserted = (doc: Record<string, unknown>) => {
    setDocuments((prev) => [doc, ...prev]);
  };

  const handleCollectionCreated = (name: string) => {
    setCollections((prev) => [...prev, { name, status: "active" }]);
    setShowAddColModal(false);
    setSelectedCollection(name);
    setDocuments([]);
    setShowInsertForm(false);
  };

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
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 md:px-5 py-3 bg-white border border-red-200 shadow-lg rounded-xl text-sm text-red-600 max-w-sm md:max-w-lg w-[calc(100%-2rem)]">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0">
            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.4" />
            <path d="M8 4.5v4M8 10.5h.01" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          <span className="flex-1 text-xs font-medium line-clamp-2">{error}</span>
          <button onClick={() => setError("")} className="text-red-400 hover:text-red-600 text-lg leading-none flex-shrink-0">×</button>
        </div>
      )}

      <div className="flex h-screen overflow-hidden">
        {/* Mobile Sidebar Overlay */}
        {showMobileSidebar && (
          <div
            className="fixed inset-0 z-30 bg-black/40 md:hidden"
            onClick={() => setShowMobileSidebar(false)}
          />
        )}

        {/* Sidebar — Database Panel */}
        <div
          className={`
            fixed md:relative inset-y-0 left-0 z-40 w-64 
            transform transition-transform duration-300 ease-in-out
            ${showMobileSidebar ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
            md:translate-x-0 bg-white border-r border-gray-200 flex flex-col overflow-y-auto
          `}
        >
          <DatabasePanel
            databases={databases}
            selectedDb={selectedDb}
            loading={loadingDbs}
            onSelect={handleSelectDb}
            onDelete={(name) => setConfirmDelete({ type: "db", name })}
            onReorder={handleReorderDbs}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Header */}
          <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-4 md:py-6 sticky top-0 z-20">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                {/* Mobile Menu Button */}
                <button
                  onClick={() => setShowMobileSidebar(!showMobileSidebar)}
                  className="md:hidden flex-shrink-0 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>

                {/* Icon + Title */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center shadow-sm flex-shrink-0" style={{ background: "#0d3d26" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white">
                      <ellipse cx="12" cy="6" rx="8" ry="3.2" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M4 6v6c0 1.8 3.6 3.2 8 3.2s8-1.4 8-3.2V6" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M4 12v6c0 1.8 3.6 3.2 8 3.2s8-1.4 8-3.2v-6" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <h1 className="text-xl md:text-2xl font-extrabold text-gray-900 tracking-tight">Collections</h1>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="w-2 h-2 rounded-full bg-green-500 inline-block flex-shrink-0" />
                      <p className="text-xs md:text-sm text-gray-500 truncate">Manage MongoDB</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Controls */}
              <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
                {!loadingDbs && databases.length > 0 && (
                  <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-[#0d3d26] bg-[#f0faf4] border border-green-200 px-2.5 md:px-3 py-1.5 rounded-full">
                    <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                    <span className="hidden md:inline">{databases.length} DBs</span>
                    <span className="md:hidden">{databases.length}</span>
                  </div>
                )}
                <button
                  onClick={() => fetchDbs(true)}
                  disabled={isRefreshing}
                  className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-xl bg-white border border-gray-200 text-xs md:text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-800 disabled:opacity-50 transition-all shadow-sm"
                >
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" className={isRefreshing ? "animate-spin" : ""}>
                    <path d="M1 6.5a5.5 5.5 0 1 0 1-3M1 1v2.5h2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="hidden sm:inline">{isRefreshing ? "Refreshing…" : "Refresh"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 md:p-6">
              {/* Collections Panel */}
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

              {/* Records + Insert panel */}
              {selectedCollection && selectedDb && (
                <div className="mt-4 md:mt-6 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                  {/* Breadcrumb header */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-4 md:px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Left border accent */}
                      <span className="w-[3px] h-[16px] rounded-full bg-[#0d3d26] block mr-1" />

                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-white px-2.5 py-1 rounded-full" style={{ background: "#0d3d26" }}>
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                        {selectedDb}
                      </span>

                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-gray-300 hidden sm:block">
                        <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>

                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#0d3d26] bg-[#f0faf4] border border-green-200 px-2.5 py-1 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                        {selectedCollection}
                      </span>

                      {documents.length > 0 && (
                        <span className="text-[10px] font-bold bg-[#0d3d26]/10 text-[#0d3d26] border border-[#0d3d26]/20 px-2 py-0.5 rounded-full">
                          {documents.length}
                        </span>
                      )}
                    </div>

                    {/* Add Items button */}
                    {!showInsertForm && (
                      <button
                        onClick={() => setShowInsertForm(true)}
                        className="w-full sm:w-auto flex items-center justify-center sm:justify-start gap-2 px-4 md:px-5 py-2.5 rounded-xl text-white text-sm font-bold transition-all shadow-md active:scale-95"
                        style={{ background: "#0d3d26" }}
                        onMouseEnter={e => (e.currentTarget.style.background = "#0a2e1c")}
                        onMouseLeave={e => (e.currentTarget.style.background = "#0d3d26")}
                      >
                        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                          <path d="M6.5 2v9M2 6.5h9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        <span className="hidden sm:inline">Add Items</span>
                        <span className="sm:hidden">Add</span>
                      </button>
                    )}
                  </div>

                  <div className="p-4 md:p-6">
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

                    {/* Records table */}
                    {loadingDocs ? (
                      <div className="flex flex-col gap-2 animate-pulse">
                        {[1, 2, 3].map((n) => (
                          <div key={n} className="h-14 bg-gray-100 rounded-xl border border-gray-200" />
                        ))}
                      </div>
                    ) : documents.length > 0 ? (
                      <DocumentsTable documents={documents} collectionName={selectedCollection} />
                    ) : !showInsertForm ? (
                      <div className="border border-dashed border-gray-200 rounded-2xl py-12 md:py-16 flex flex-col items-center gap-3">
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
                            Click <span className="font-bold text-[#0d3d26]">Add Items</span> to insert your first document
                          </p>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
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