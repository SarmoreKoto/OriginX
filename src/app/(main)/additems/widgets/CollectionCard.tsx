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

export default function CollectionCard({
  col, index, isSelected, onSelect, onDelete,
  onDragStart, onDragOver, onDrop,
}: CollectionCardProps) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onClick={onSelect}
      className={`
        group relative flex flex-col gap-2 p-3.5 rounded-xl border cursor-pointer
        transition-all duration-150 select-none
        ${isSelected
          ? "border-transparent shadow-lg"
          : "border-gray-200 hover:border-gray-300 hover:shadow-sm bg-white"
        }
      `}
      style={isSelected ? { background: "#0d3d26" } : {}}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        {/* Icon */}
        <div className={`
          w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold flex-shrink-0
          ${isSelected ? "bg-white/15 text-white" : "bg-green-50 text-green-700 border border-green-100"}
        `}>
          {col.name.slice(0, 2).toUpperCase()}
        </div>

        {/* Status dot */}
        <span className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${isSelected ? "bg-green-400" : "bg-gray-200"}`} />
      </div>

      {/* Name */}
      <p className={`text-xs font-semibold truncate ${isSelected ? "text-white" : "text-gray-800"}`}>
        {col.name}
      </p>

      {/* Status badge */}
      <span className={`
        self-start text-[10px] font-bold px-2 py-0.5 rounded-full
        ${isSelected
          ? "bg-white/15 text-green-300"
          : col.status === "active"
            ? "bg-green-50 text-green-600 border border-green-100"
            : "bg-gray-100 text-gray-400 border border-gray-200"
        }
      `}>
        {col.status}
      </span>

      {/* Delete button */}
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        className={`
          absolute top-2 right-2 w-6 h-6 rounded-lg items-center justify-center
          hidden group-hover:flex transition-all
          ${isSelected
            ? "text-white/50 hover:text-white hover:bg-white/10"
            : "text-gray-300 hover:text-red-500 hover:bg-red-50"
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