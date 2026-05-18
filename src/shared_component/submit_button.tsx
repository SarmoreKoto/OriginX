'use client';

import { CircularProgress } from '@mui/material';

interface SubmitButtonProps {
  loading: boolean;
  loadingText: string;
  text: string;
}

export default function SubmitButton({ loading, loadingText, text }: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full py-3.5 rounded-xl font-semibold text-white bg-black hover:bg-gray-800 active:scale-[0.98] active:bg-gray-900 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 shadow-lg shadow-black/10"
    >
      {loading ? (
        <>
          <CircularProgress size={16} thickness={5} sx={{ color: 'white' }} />
          <span className="text-sm">{loadingText}</span>
        </>
      ) : (
        <span className="text-sm">{text}</span>
      )}
    </button>
  );
}