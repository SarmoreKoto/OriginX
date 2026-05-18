"use client";

import { ReactNode } from "react";

interface EmptyStateProps {
  icon: ReactNode;
  message: string;
  sub?: string;
  className?: string;
}

export default function EmptyState({ icon, message, sub, className = "" }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center flex-1 gap-3 py-16 ${className}`}>
      <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-400 mb-1">
        {icon}
      </div>
      <p className="text-sm font-semibold text-gray-500">{message}</p>
      {sub && <p className="text-xs text-gray-400 text-center max-w-[200px] leading-relaxed">{sub}</p>}
    </div>
  );
}
