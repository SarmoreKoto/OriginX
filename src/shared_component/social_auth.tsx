'use client';

import { FcGoogle } from 'react-icons/fc';
import { FaFacebookF } from 'react-icons/fa';

interface SocialAuthProps {
  disabled?: boolean;
}

export default function SocialAuth({ disabled = false }: SocialAuthProps) {
  return (
    <div className="space-y-5">
      <div className="relative flex items-center">
        <div className="flex-grow border-t border-gray-200" />
        <span className="mx-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
          or continue with
        </span>
        <div className="flex-grow border-t border-gray-200" />
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          disabled={disabled}
          className="flex-1 flex items-center justify-center gap-2.5 py-3 px-4 bg-white border border-gray-200 rounded-xl hover:border-gray-400 hover:bg-gray-50 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FcGoogle className="text-lg" />
          <span className="text-sm font-medium text-gray-700">Google</span>
        </button>

        <button
          type="button"
          disabled={disabled}
          className="flex-1 flex items-center justify-center gap-2.5 py-3 px-4 bg-white border border-gray-200 rounded-xl hover:border-gray-400 hover:bg-gray-50 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FaFacebookF className="text-lg text-[#1877F2]" />
          <span className="text-sm font-medium text-gray-700">Facebook</span>
        </button>
      </div>
    </div>
  );
}