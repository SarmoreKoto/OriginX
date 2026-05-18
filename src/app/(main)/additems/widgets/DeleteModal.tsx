"use client";

interface DeleteModalProps {
  type: "db" | "col";
  name: string;
  deleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteModal({ type, name, deleting, onConfirm, onCancel }: DeleteModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]" onClick={onCancel}>
      <div
        className="bg-white border border-gray-200 rounded-2xl shadow-2xl p-7 w-[380px] flex flex-col items-center text-center gap-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center">
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none" className="text-red-500">
            <path d="M3 6.5h20M9 6.5V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v1.5M10.5 11v8M15.5 11v8M5 6.5l1.2 14.2A2 2 0 0 0 8.2 22.5h9.6a2 2 0 0 0 2-1.8L21 6.5"
              stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <h3 className="text-base font-bold text-gray-900 mb-2">Delete {type === "db" ? "database" : "collection"}?</h3>
          <p className="text-sm text-gray-500 leading-relaxed">
            <span className="font-semibold text-indigo-600">{name}</span> will be permanently removed and cannot be recovered.
            {type === "db" && <span className="block mt-2 text-amber-500 font-medium text-xs">⚠ The database must be empty first.</span>}
          </p>
        </div>
        <div className="flex gap-3 w-full">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-500 hover:bg-gray-50 hover:text-gray-800 transition-all">
            Cancel
          </button>
          <button
            onClick={onConfirm} disabled={deleting}
            className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {deleting ? (
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            ) : "Delete permanently"}
          </button>
        </div>
      </div>
    </div>
  );
}
