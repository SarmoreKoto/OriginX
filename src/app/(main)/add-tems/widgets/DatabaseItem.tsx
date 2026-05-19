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

const DB_COLORS = [
  { bg: "#0d3d26", text: "#fff" },
  { bg: "#0d9488", text: "#fff" },
  { bg: "#7c3aed", text: "#fff" },
  { bg: "#0369a1", text: "#fff" },
  { bg: "#b45309", text: "#fff" },
];

function dbColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h + name.charCodeAt(i)) % DB_COLORS.length;
  return DB_COLORS[h];
}

export default function DatabaseItem({ db, isSelected, onClick, onDelete, onDragStart, onDragOver, onDrop }: DatabaseItemProps) {
  const color = dbColor(db.name);

  return (
    <li
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onClick={onClick}
      className={`
        group relative flex items-center gap-2 px-2.5 py-2.5 rounded-xl cursor-pointer
        border transition-all duration-150 select-none min-w-0
        ${isSelected
          ? "border-transparent shadow-md"
          : "border-transparent hover:bg-gray-50 hover:border-gray-200"
        }
      `}
      style={isSelected ? { background: "#0d3d26" } : {}}
    >
      {/* Drag handle */}
      <div
        className="opacity-0 group-hover:opacity-100 cursor-grab transition-all flex-shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <svg width="10" height="12" viewBox="0 0 10 12" fill="none" className={isSelected ? "text-white/30" : "text-gray-300"}>
          <circle cx="3" cy="2" r=".9" fill="currentColor" />
          <circle cx="7" cy="2" r=".9" fill="currentColor" />
          <circle cx="3" cy="6" r=".9" fill="currentColor" />
          <circle cx="7" cy="6" r=".9" fill="currentColor" />
          <circle cx="3" cy="10" r=".9" fill="currentColor" />
          <circle cx="7" cy="10" r=".9" fill="currentColor" />
        </svg>
      </div>

      {/* Avatar icon */}
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold flex-shrink-0 transition-all"
        style={
          isSelected
            ? { background: "rgba(255,255,255,0.15)", color: "#fff" }
            : { background: color.bg, color: color.text }
        }
      >
        {db.name.slice(0, 2).toUpperCase()}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-semibold truncate ${isSelected ? "text-white" : "text-gray-800"}`}>
          {db.name}
        </p>
        <p className={`text-[10px] font-mono mt-0.5 truncate ${isSelected ? "text-green-300" : "text-gray-400"}`}>
          {db.sizeMB} MB
        </p>
      </div>

      {/* Live dot */}
      <span className={`w-2 h-2 rounded-full flex-shrink-0 transition-all ${isSelected ? "bg-green-400" : "bg-gray-200"}`} />

      {/* Delete button */}
      <button
        onClick={onDelete}
        className={`
          absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg
          hidden group-hover:flex items-center justify-center transition-all flex-shrink-0
          ${isSelected
            ? "text-white/50 hover:text-white hover:bg-white/10"
            : "text-gray-300 hover:text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100"
          }
        `}
      >
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
          <path d="M1.5 3h9M4.5 3V2.25h3V3M3.5 3l.5 6.5h4l.5-6.5"
            stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </li>
  );
}