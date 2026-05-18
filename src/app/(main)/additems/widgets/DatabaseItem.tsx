"use client";

interface DbEntry { name: string; sizeMB: string; empty: boolean; }

interface DatabaseItemProps {
  db: DbEntry;
  index: number;
  isSelected: boolean;
  onClick: () => void;
  onDelete: (e: React.MouseEvent) => void;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: () => void;
}

export default function DatabaseItem({ db, isSelected, onClick, onDelete, onDragStart, onDragOver, onDrop }: DatabaseItemProps) {
  return (
    <li
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onClick={onClick}
      className={`
        group relative flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl cursor-pointer
        border transition-all duration-150 select-none
        ${isSelected ? "bg-green-50 border-green-200" : "border-transparent hover:bg-gray-50 hover:border-gray-200"}
      `}
    >
      {/* Drag handle */}
      <div
        className="opacity-0 group-hover:opacity-100 cursor-grab text-gray-300 hover:text-indigo-400 transition-all flex-shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <svg width="10" height="12" viewBox="0 0 10 12" fill="none">
          <circle cx="3" cy="2" r=".9" fill="currentColor" />
          <circle cx="7" cy="2" r=".9" fill="currentColor" />
          <circle cx="3" cy="6" r=".9" fill="currentColor" />
          <circle cx="7" cy="6" r=".9" fill="currentColor" />
          <circle cx="3" cy="10" r=".9" fill="currentColor" />
          <circle cx="7" cy="10" r=".9" fill="currentColor" />
        </svg>
      </div>

      {/* Icon */}
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
        isSelected ? "bg-green-500 text-white" : "bg-gray-100 text-gray-400 group-hover:bg-gray-200 group-hover:text-green-600"
      }`}>
        <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
          <ellipse cx="7" cy="3.5" rx="4.5" ry="1.8" stroke="currentColor" strokeWidth="1.2" />
          <path d="M2.5 3.5v3.5c0 1 2 1.8 4.5 1.8s4.5-.8 4.5-1.8V3.5" stroke="currentColor" strokeWidth="1.2" />
          <path d="M2.5 7v3.5c0 1 2 1.8 4.5 1.8s4.5-.8 4.5-1.8V7" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-semibold truncate ${isSelected ? "text-green-700" : "text-gray-800"}`}>{db.name}</p>
        <p className="text-[10px] text-gray-400 font-medium">{db.sizeMB} MB</p>
      </div>

      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />}

      {/* Delete */}
      <button
        onClick={onDelete}
        className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 opacity-0 group-hover:opacity-100 transition-all"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M1.5 3h9M4.5 3V2.25h3V3M3.5 3l.5 6.5h4l.5-6.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </li>
  );
}
