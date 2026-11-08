'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import VerificationCard from '@/components/VerificationCard';
import HistorySection, { VerifiedRecord } from '@/components/HistorySection';
import { AlertTriangle, ArrowRight, CheckCircle2, ClipboardPaste, ExternalLink, Info, KeyRound, Mail, RefreshCw, Send, X } from 'lucide-react';

const HISTORY_KEY = 'hidz_verified_history';

interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export default function Home() {
  const [email, setEmail] = useState('');
  const [cookie, setCookie] = useState('');
  const [verificationLink, setVerificationLink] = useState('');
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [stats, setStats] = useState({ total: 0, today: 0 });
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [verificationResult, setVerificationResult] = useState<{ userData: any; raw: any } | null>(null);
  const [history, setHistory] = useState<VerifiedRecord[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [theme, setTheme] = useState<'night' | 'light'>('night');

  const notify = useCallback((type: 'success' | 'error' | 'info', message: string) => {
    const id = `t-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
    setToasts((prev) => [...prev.slice(-3), { id, type, message }]);
    window.setTimeout(() => setToasts((prev) => prev.filter((item) => item.id !== id)), 4200);
  }, []);

  useEffect(() => {
    try {
      const savedTheme = window.localStorage.getItem('hidz-am-theme');
      if (savedTheme === 'light' || savedTheme === 'night') setTheme(savedTheme);
      const savedHistory = window.localStorage.getItem(HISTORY_KEY) || window.localStorage.getItem('am_verified_history');
      if (savedHistory) setHistory(JSON.parse(savedHistory));
    } catch {}
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try { window.localStorage.setItem('hidz-am-theme', theme); } catch {}
  }, [theme]);

  const refreshStats = async () => {
    try {
      const res = await fetch('/api/stats');
      if (!res.ok) return;
      const data = await res.json();
      setStats({ total: Number(data.total) || 0, today: Number(data.today) || 0 });
    } catch {}
  };

  useEffect(() => { void refreshStats(); }, []);

  const handleSendLink = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetEmail = email.trim().toLowerCase();
    if (!targetEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(targetEmail)) {
      notify('error', 'Masukkan format alamat email yang valid.');
      return;
    }
    setIsSending(true);
    try {
      const res = await fetch('/api/send-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.message || `Gagal (${res.status}).`);
      notify('success', data.message || `Tautan dikirim ke ${targetEmail}.`);
      setStep(2);
    } catch (err: any) {
      notify('error', err.message || 'Gagal mengirim tautan.');
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifyLink = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetEmail = email.trim().toLowerCase();
    const rawLink = verificationLink.trim();
    if (!targetEmail) { notify('error', 'Email belum diisi.'); setStep(1); return; }
    if (!rawLink) { notify('error', 'Tempelkan tautan verifikasi terlebih dahulu.'); return; }

    setIsVerifying(true);
    try {
      const res = await fetch('/api/verify-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail, link: rawLink }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.message || `Verifikasi gagal (${res.status}).`);

      const verifiedUser = data.data || data.userData;
      setVerificationResult({ userData: verifiedUser, raw: data });
      if (data.data?.stats) setStats(data.data.stats); else await refreshStats();
      notify('success', data.message || 'Akun berhasil diverifikasi.');

      const newRecord: VerifiedRecord = {
        id: `rec-${Date.now()}`,
        email: targetEmail,
        cookie: cookie.trim() || verifiedUser.orderId || 'verified_token',
        timestamp: new Date().toLocaleString('id-ID'),
        userData: verifiedUser,
        raw: data,
      };
      const updated = [newRecord, ...history.slice(0, 19)];
      setHistory(updated);
      try { window.localStorage.setItem(HISTORY_KEY, JSON.stringify(updated)); } catch {}
      setStep(3);
    } catch (err: any) {
      notify('error', err.message || 'Gagal memverifikasi tautan.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text.trim()) { notify('info', 'Clipboard kosong.'); return; }
      setVerificationLink(text.trim());
      notify('success', 'Tautan ditempel dari clipboard.');
    } catch {
      notify('error', 'Izin clipboard ditolak browser. Tempel secara manual.');
    }
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      window.localStorage.removeItem(HISTORY_KEY);
      window.localStorage.removeItem('am_verified_history');
    } catch {}
    notify('info', 'Riwayat lokal dihapus.');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar theme={theme} onThemeChange={setTheme} />

      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-[calc(100%-2rem)] pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto surface-card p-3.5 flex items-start gap-2.5 border-l-4 shadow-lg"
            style={{ borderLeftColor: t.type === 'success' ? 'var(--accent)' : t.type === 'error' ? 'var(--danger)' : 'var(--accent-2)' }}>
            {t.type === 'success' ? <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" /> :
             t.type === 'error' ? <AlertTriangle size={16} className="text-rose-500 shrink-0 mt-0.5" /> :
             <Info size={16} className="text-sky-500 shrink-0 mt-0.5" />}
            <p className="text-xs text-ink leading-relaxed flex-1 break-words">{t.message}</p>
            <button type="button" onClick={() => setToasts((p) => p.filter((i) => i.id !== t.id))} className="text-muted hover:text-ink"><X size={14} /></button>
          </div>
        ))}
      </div>

      <main className="flex-1 w-full max-w-[1140px] mx-auto px-4 py-6 sm:py-8">
        <div className="grid lg:grid-cols-[1.35fr_0.85fr] gap-6 items-start">
          <div className="surface-card p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3 pb-4 border-b border-line">
              <div>
                <h1 className="text-lg font-bold text-ink">Aktivasi & Verifikasi Akun</h1>
                <p className="text-xs text-muted mt-0.5">Kirim tautan masuk ke email, lalu tempel URL verifikasi.</p>
              </div>
              <span className="text-[11px] font-mono text-muted">0{step} / 03</span>
            </div>

            <div className="grid grid-cols-3 gap-2 my-5">
              {['1. Email', '2. Tautan', '3. Hasil'].map((label, idx) => (
                <button key={label} type="button" disabled={idx === 2 && !verificationResult} onClick={() => setStep((idx + 1) as 1 | 2 | 3)}
                  className={`btn py-2.5 px-3 text-xs font-mono ${step === idx + 1 ? 'btn-primary' : 'btn-secondary'}`}>
                  {label}
                </button>
              ))}
            </div>

            {step === 1 && (
              <form onSubmit={handleSendLink} noValidate className="space-y-4">
                <div>
                  <label className="block mb-1.5 text-xs font-mono font-semibold text-ink">EMAIL ALIGHT MOTION</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@domain.com" className="field px-3.5 py-2.5 text-sm" />
                </div>
                <div>
                  <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="inline-flex items-center gap-1.5 text-xs font-mono text-muted hover:text-ink">
                    <KeyRound size={13} /> <span>{showAdvanced ? 'Tutup Opsi Sesi' : 'Opsi Sesi (Opsional)'}</span>
                  </button>
                  {showAdvanced && (
                    <input type="text" value={cookie} onChange={(e) => setCookie(e.target.value)} placeholder="Custom session / cookie" className="field mt-2 px-3 py-2 text-xs font-mono" />
                  )}
                </div>
                <button type="submit" disabled={isSending} className="btn btn-primary w-full py-3 px-4 text-xs font-mono">
                  {isSending ? <RefreshCw size={15} className="animate-spin" /> : <Send size={15} />}
                  <span>{isSending ? 'MEMPROSES...' : 'KIRIM TAUTAN VERIFIKASI'}</span>
                  {!isSending && <ArrowRight size={15} />}
                </button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleVerifyLink} noValidate className="space-y-4">
                <div className="p-3 rounded border border-line bg-panel-deep flex items-center justify-between gap-2 text-xs font-mono">
                  <span className="truncate text-ink">{email}</span>
                  <div className="flex gap-1.5 shrink-0">
                    <a href="https://mail.google.com" target="_blank" rel="noopener noreferrer" className="btn btn-secondary px-2.5 py-1 text-[11px]"><Mail size={12} /> Gmail <ExternalLink size={11} /></a>
                    <button type="button" onClick={() => setStep(1)} className="btn btn-secondary px-2.5 py-1 text-[11px]">Ganti</button>
                  </div>
                </div>
                <textarea rows={5} value={verificationLink} onChange={(e) => setVerificationLink(e.target.value)} placeholder="Tempel tautan dari email di sini..." className="field p-3 text-xs font-mono resize-none" />
                <div className="flex flex-col sm:flex-row gap-2">
                  <button type="button" onClick={handlePasteClipboard} className="btn btn-secondary py-2.5 px-4 text-xs font-mono"><ClipboardPaste size={14} /> Tempel</button>
                  <button type="submit" disabled={isVerifying} className="btn btn-accent flex-1 py-2.5 px-4 text-xs font-mono">
                    {isVerifying ? <RefreshCw size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                    <span>{isVerifying ? 'MEMVERIFIKASI...' : 'VERIFIKASI & AKTIFKAN PRO'}</span>
                  </button>
                </div>
              </form>
            )}

            {step === 3 && verificationResult && (
              <div className="space-y-4">
                <VerificationCard email={email} userData={verificationResult.userData} raw={verificationResult.raw} cookie={cookie || verificationResult.userData?.orderId || ''} onNotify={notify} />
                <button type="button" onClick={() => { setStep(1); setVerificationLink(''); setVerificationResult(null); }} className="btn btn-primary w-full py-2.5 text-xs font-mono">
                  <RefreshCw size={14} /> Proses Akun Baru
                </button>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <section className="surface-card p-4 sm:p-5">
              <div className="text-xs font-mono font-semibold text-muted uppercase mb-3">Metrik Aktivasi</div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded border border-line bg-panel-deep">
                  <div className="text-[11px] font-mono text-muted">TOTAL</div>
                  <div className="mt-1 text-2xl font-extrabold font-mono text-ink">{stats.total.toLocaleString('id-ID')}</div>
                </div>
                <div className="p-3.5 rounded border border-line bg-panel-deep">
                  <div className="text-[11px] font-mono text-muted">HARI INI</div>
                  <div className="mt-1 text-2xl font-extrabold font-mono text-emerald-500">{stats.today.toLocaleString('id-ID')}</div>
                </div>
              </div>
            </section>
            <HistorySection records={history} onClear={handleClearHistory} onSelect={(r) => { setEmail(r.email); setCookie(r.cookie); setVerificationResult({ userData: r.userData, raw: r.raw }); setStep(3); }} onNotify={notify} />
          </div>
        </div>
      </main>
    </div>
  );
}
