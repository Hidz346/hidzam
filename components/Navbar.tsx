'use client';

import React from 'react';
import Image from 'next/image';
import { Activity, ShieldCheck, Sparkles, Sun, Moon } from 'lucide-react';

type Theme = 'night' | 'light';

export default function Navbar({ theme, onThemeChange }: { theme: Theme; onThemeChange: (theme: Theme) => void }) {
  return (
    <header className="site-header">
      <div className="ticker" aria-hidden="true">
        <div className="ticker-track">
          <span>HIDZ AM PREMIUM</span>
          <i>◆</i>
          <span>VERIFIKASI AKUN TERSTRUKTUR</span>
          <i>◆</i>
          <span>LAYANAN ONLINE</span>
          <i>◆</i>
          <span>HIDZ AM PREMIUM</span>
          <i>◆</i>
          <span>VERIFIKASI AKUN TERSTRUKTUR</span>
          <i>◆</i>
          <span>LAYANAN ONLINE</span>
        </div>
      </div>

      <div className="nav-shell">
        <div className="brand-block">
          <div className="brand-mark">
            <Image
              src="/logo.png"
              alt="HIDZ"
              width={54}
              height={54}
              className="brand-image"
              priority
            />
          </div>
          <div>
            <div className="brand-title">HIDZ</div>
            <div className="brand-subtitle">AM PREMIUM</div>
          </div>
        </div>

        <div className="nav-actions">
          <button
            type="button"
            className="theme-toggle neo-button"
            onClick={() => onThemeChange(theme === 'night' ? 'light' : 'night')}
            aria-label={`Aktifkan mode ${theme === 'night' ? 'light' : 'night'}`}
            title={`Mode ${theme === 'night' ? 'Light' : 'Night'}`}
          >
            {theme === 'night' ? <Sun size={15} /> : <Moon size={15} />}
            <span>{theme === 'night' ? 'LIGHT' : 'NIGHT'}</span>
          </button>

          <div className="nav-status">
          <span className="status-dot" />
          <div>
            <strong>ONLINE</strong>
            <small>HIDZ SERVICE</small>
          </div>
        </div>
      </div>
      </div>

      <div className="nav-meta">
        <span><Activity size={14} /> SYSTEM READY</span>
        <span><ShieldCheck size={14} /> SESSION PROTECTED</span>
        <span><Sparkles size={14} /> PREMIUM ACCESS</span>
      </div>
    </header>
  );
}
