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
          <div className="w-10 h-10 rounded overflow-hidden border border-line bg-panel-deep shrink-0">
            <Image src="/logo.png" alt="HIDZ" width={40} height={40} className="w-full h-full object-cover" priority />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-base text-ink">HIDZPROJECT</span>
              <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-button border border-line text-muted">AM-PRO</span>
            </div>
            <p className="text-[11px] font-mono text-muted">Alight Motion Provisioning Utility</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded border border-line bg-panel-deep text-[11px] font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-ink font-semibold">GATEWAY READY</span>
          </div>
          <button
            type="button"
            onClick={() => onThemeChange(theme === 'night' ? 'light' : 'night')}
            className="btn btn-secondary h-9 px-3 text-xs font-mono"
            aria-label="Ganti tema tampilan"
          >
            {theme === 'night' ? <Sun size={14} /> : <Moon size={14} />}
            <span className="hidden sm:inline">{theme === 'night' ? 'LIGHT' : 'DARK'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
