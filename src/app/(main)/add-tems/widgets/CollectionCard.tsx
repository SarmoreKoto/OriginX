"use client";

interface CollectionCardProps {
  col: { name: string; status: string };
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: () => void;
}

const CARD_COLORS = [
  "#0d3d26", "#0d9488", "#7c3aed", "#0369a1", "#b45309", "#0f766e", "#4338ca",
];

function cardColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h + name.charCodeAt(i)) % CARD_COLORS.length;
  return CARD_COLORS[h];
}

export default function CollectionCard({
  col, index, isSelected, onSelect, onDelete,
  onDragStart, onDragOver, onDrop,
}: CollectionCardProps) {
  const color = cardColor(col.name);
  const isActive = col.status === "active" || col.status === "Active";

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onClick={onSelect}
      className={`
        group relative flex flex-col gap-2.5 p-3.5 rounded-xl border cursor-pointer
        transition-all duration-150 select-none min-h-[120px] sm:min-h-0
        ${isSelected
          ? "border-transparent shadow-lg"
          : "border-gray-200 hover:border-gray-300 hover:shadow-sm bg-white"
        }
      `}
      style={isSelected ? { background: "#0d3d26" } : {}}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        {/* Avatar icon */}
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-[11px] font-bold flex-shrink-0 text-white"
          style={isSelected ? { background: "rgba(255,255,255,0.18)" } : { background: color }}
        >
          {col.name.slice(0, 2).toUpperCase()}
        </div>

        {/* Live status dot */}
        <span
          className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${
            isSelected ? "bg-green-400" : isActive ? "bg-green-400" : "bg-gray-300"
          }`}
        />
      </div>

      {/* Collection name */}
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-bold truncate ${isSelected ? "text-white" : "text-gray-800"}`}>
          {col.name}
        </p>
      </div>

      {/* Status badge */}
      <span
        className={`self-start text-[10px] font-bold px-2 py-0.5 rounded-md border ${
          isSelected
            ? "bg-white/15 text-green-300 border-white/10"
            : isActive
              ? "bg-green-50 text-green-700 border-green-200"
              : "bg-gray-100 text-gray-400 border-gray-200"
        }`}
      >
        {col.status}
      </span>

      {/* Delete button */}
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        className={`
          absolute top-2.5 right-2.5 w-6 h-6 rounded-lg
          items-center justify-center transition-all
          hidden group-hover:flex
          ${isSelected
            ? "text-white/40 hover:text-white hover:bg-white/10"
            : "text-gray-300 hover:text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100"
          }
        `}
      >
        <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
          <path d="M2 2l8 8M10 2L2 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}