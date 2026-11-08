'use client';

import React from 'react';
import Image from 'next/image';
import { Sun, Moon } from 'lucide-react';

type Theme = 'night' | 'light';

export default function Navbar({
  theme,
  onThemeChange,
}: {
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
}) {
  return (
    <header className="border-b border-line bg-panel sticky top-0 z-30">
      <div className="w-full max-w-[1140px] mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg overflow-hidden border border-line bg-panel-deep shrink-0">
            <Image src="/logo.png" alt="HIDZ AM" width={40} height={40} className="w-full h-full object-cover" priority />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-base text-ink">HIDZ AM</span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500">
                Online
              </span>
            </div>
            <p className="text-xs text-muted">Verifikasi & Aktivasi Akun</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onThemeChange(theme === 'night' ? 'light' : 'night')}
          className="btn btn-secondary h-9 px-3 text-xs"
          aria-label="Ganti tema tampilan"
        >
          {theme === 'night' ? <Sun size={15} /> : <Moon size={15} />}
          <span className="hidden sm:inline">{theme === 'night' ? 'Terang' : 'Gelap'}</span>
        </button>
      </div>
    </header>
  );
}
