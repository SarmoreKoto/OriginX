'use client';

import Image from 'next/image';
import { ReactNode } from 'react';
import { IMAGES } from '@/asset/metaImages';

interface AuthLayoutProps {
  children: ReactNode;
  quote?: {
    text: string;
    author: string;
    role: string;
    initials: string;
  };
  showStats?: boolean;
  statsText?: string;
}

export default function AuthLayout({
  children,
  quote = {
    text: "The platform has completely transformed how we manage our workflow. Absolutely essential for our team.",
    author: "John Doe",
    role: "Product Manager at TechCorp",
    initials: "JD", 
  },
  showStats = true,
  statsText = "2,847 active now",
}: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen bg-white">
      {/* Left Panel — Form */}
      <div className="w-full lg:w-1/2 xl:w-[45%] flex flex-col justify-center items-center px-6 sm:px-12 lg:px-20 py-12 relative">
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, black 1px, transparent 0)`,
            backgroundSize: '32px 32px',
          }}
        />
        <div className="w-full max-w-sm relative z-10">
          {/* Logo */}
          <div className="mb-10">
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center mb-6">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
          </div>
          {children}
        </div>
      </div>

      {/* Right Panel — Visual */}
      <div className="hidden lg:block lg:w-1/2 xl:w-[55%] relative bg-gray-50 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gray-100 rounded-full blur-3xl opacity-60 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-gray-200 rounded-full blur-3xl opacity-40 translate-y-1/2 -translate-x-1/2" />

        <div className="absolute inset-8 rounded-3xl overflow-hidden shadow-2xl shadow-black/10">
          <Image
            src={IMAGES.LOGIN_BG}
            alt="Authentication background"
            fill
            className="object-cover"
            priority
            sizes="(max-width: 1280px) 50vw, 55vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 p-10">
            <div className="max-w-md">
              <blockquote className="text-white text-xl font-medium leading-relaxed mb-4">
                "{quote.text}"
              </blockquote>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-semibold text-sm">
                  {quote.initials}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{quote.author}</p>
                  <p className="text-white/70 text-xs">{quote.role}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {showStats && (
          <div className="absolute top-8 right-8 flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 border border-white/20">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-white text-xs font-medium">{statsText}</span>
          </div>
        )}
      </div>
    </div>
  );
}