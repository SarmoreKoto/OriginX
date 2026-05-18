"use client";

interface SkeletonListProps {
  count?: number;
  variant?: "row" | "card";
}

export default function SkeletonList({ count = 3, variant = "row" }: SkeletonListProps) {
  if (variant === "card") {
    return (
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="h-28 rounded-2xl bg-gray-100 animate-pulse border border-gray-200" style={{ animationDelay: `${i * 0.08}s` }} />
        ))}
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-1.5 p-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-10 rounded-xl bg-gray-100 animate-pulse border border-gray-200" style={{ animationDelay: `${i * 0.07}s` }} />
      ))}
    </div>
  );
}
