'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import VerificationCard from '@/components/VerificationCard';
import HistorySection, { VerifiedRecord } from '@/components/HistorySection';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ClipboardPaste,
  Clock3,
  ExternalLink,
  HelpCircle,
  KeyRound,
  Mail,
  RefreshCw,
  Send,
  ShieldCheck,
  Sparkles,
  TerminalSquare,
  TrendingUp,
  Zap,
} from 'lucide-react';

const HISTORY_KEY = 'hidz_verified_history';

export default function Home() {
  const [email, setEmail] = useState('');
  const [cookie, setCookie] = useState('');
  const [verificationLink, setVerificationLink] = useState('');
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [stats, setStats] = useState({ total: 0, today: 0 });
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error' | 'info' | null;
    text: string;
  }>({ type: null, text: '' });
  const [verificationResult, setVerificationResult] = useState<{
    userData: any;
    raw: any;
  } | null>(null);
  const [history, setHistory] = useState<VerifiedRecord[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const current = localStorage.getItem(HISTORY_KEY);
      const legacy = localStorage.getItem('am_verified_history');
      const saved = current || legacy;
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [theme, setTheme] = useState<'night' | 'light'>('night');

  useEffect(() => {
    const saved = window.localStorage.getItem('hidz-am-theme');
    if (saved === 'light' || saved === 'night') setTheme(saved);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem('hidz-am-theme', theme);
  }, [theme]);

  const refreshStats = async () => {
    try {
      const res = await fetch('/api/stats');
      if (!res.ok) return;
      const data = await res.json();
      setStats({ total: Number(data.total) || 0, today: Number(data.today) || 0 });
    } catch {
      // Statistik bersifat informatif; kegagalan endpoint tidak mengganggu alur utama.
    }
  };

  useEffect(() => {
    void refreshStats();
  }, []);

  const handleSendLink = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetEmail = email.trim().toLowerCase();

    if (!targetEmail) {
      setStatusMessage({ type: 'error', text: 'Alamat email belum diisi. Silakan masukkan email yang aktif.' });
      return;
    }

    if (!targetEmail.includes('@') || !targetEmail.includes('.')) {
      setStatusMessage({ type: 'error', text: 'Format alamat email belum sesuai. Periksa kembali sebelum melanjutkan.' });
      return;
    }

    setIsSending(true);
    setStatusMessage({ type: 'info', text: 'Permintaan sedang diproses. Tautan verifikasi akan dikirim ke alamat yang Anda masukkan.' });

    try {
      const res = await fetch('/api/send-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail }),
      });
      const rawText = await res.text();
      let data: any = {};

      try {
        data = JSON.parse(rawText);
      } catch {
        throw new Error(`Respons server tidak dapat dibaca (HTTP ${res.status}). Silakan coba kembali.`);
      }

      if (!res.ok || !data.success) {
        throw new Error(data.message || `Permintaan gagal diproses (${data.code || res.status}).`);
      }

      setStatusMessage({
        type: 'success',
        text: data.message || `Tautan verifikasi telah dikirim ke ${targetEmail}. Periksa kotak masuk dan folder spam.`,
      });
      setStep(2);
    } catch (error: any) {
      setStatusMessage({ type: 'error', text: error.message || 'Permintaan tidak dapat diselesaikan.' });
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifyLink = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetEmail = email.trim().toLowerCase();
    const rawLink = verificationLink.trim();

    if (!targetEmail) {
      setStatusMessage({ type: 'error', text: 'Email belum tersedia. Kembali ke tahap awal untuk mengisinya.' });
      return;
    }

    if (!rawLink) {
      setStatusMessage({ type: 'error', text: 'Tautan verifikasi belum ditempelkan. Silakan salin tautan dari email Anda.' });
      return;
    }

    setIsVerifying(true);
    setStatusMessage({ type: 'info', text: 'Data sedang diperiksa dan proses akun sedang diselesaikan. Mohon tunggu.' });

    try {
      const res = await fetch('/api/verify-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail, link: rawLink }),
      });
      const rawText = await res.text();
      let data: any = {};

      try {
        data = JSON.parse(rawText);
      } catch {
        throw new Error(`Respons server tidak dapat dibaca (HTTP ${res.status}).`);
      }

      if (!res.ok || !data.success) {
        throw new Error(data.message || `Verifikasi gagal (${data.code || res.status}).`);
      }

      const verifiedUser = data.data || data.userData;
      setVerificationResult({ userData: verifiedUser, raw: data });

      if (data.data?.stats) {
        setStats(data.data.stats);
      } else {
        await refreshStats();
      }

      setStatusMessage({
        type: 'success',
        text: data.message || 'Pemeriksaan akun berhasil diselesaikan.',
      });

      const newRecord: VerifiedRecord = {
        id: `rec-${Date.now()}`,
        email: targetEmail,
        cookie: cookie.trim() || verifiedUser.orderId || 'verified_token',
        timestamp: new Date().toLocaleString('id-ID'),
        userData: verifiedUser,
        raw: data,
      };
      const updatedHistory = [newRecord, ...history.slice(0, 19)];
      setHistory(updatedHistory);
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
      } catch {
        // Riwayat lokal tidak boleh menghambat proses verifikasi.
      }
      setStep(3);
    } catch (error: any) {
      setStatusMessage({ type: 'error', text: error.message || 'Verifikasi tidak dapat diselesaikan.' });
    } finally {
      setIsVerifying(false);
    }
  };

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text) return;
      setVerificationLink(text.trim());
      setStatusMessage({ type: 'success', text: 'Tautan berhasil ditempel dari clipboard.' });
    } catch {
      setStatusMessage({ type: 'error', text: 'Clipboard tidak dapat diakses. Tempelkan tautan secara manual.' });
    }
  };

  const handleClearHistory = () => {
    if (typeof window !== 'undefined' && window.confirm('Hapus seluruh riwayat verifikasi yang tersimpan di perangkat ini?')) {
      setHistory([]);
      localStorage.removeItem(HISTORY_KEY);
      localStorage.removeItem('am_verified_history');
    }
  };

  const handleSelectHistory = (record: VerifiedRecord) => {
    setEmail(record.email);
    setCookie(record.cookie);
    setVerificationResult({ userData: record.userData, raw: record.raw });
    setStep(3);
  };

  const resetFlow = () => {
    setStep(1);
    setVerificationLink('');
    setVerificationResult(null);
    setStatusMessage({ type: null, text: '' });
  };

  return (
    <div className={`site-root min-h-screen flex flex-col ${theme === 'light' ? 'theme-light' : 'theme-night'}`}>
      <Navbar theme={theme} onThemeChange={setTheme} />

      <main className="w-full max-w-[1180px] mx-auto px-3 sm:px-5 py-5 sm:py-8 space-y-5">
        <section className="neo-card scanlines grid-bg p-5 sm:p-8 relative">
          <div className="grid lg:grid-cols-[1.5fr_.8fr] gap-7 items-center">
            <div>
              <div className="section-kicker"><TerminalSquare size={14} /> HIDZ ACCESS CONSOLE</div>
              <h1 className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-black uppercase leading-[.92] tracking-[-.045em]">
                Akses premium,
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400">lebih terarah.</span>
              </h1>
              <p className="mt-5 max-w-2xl text-sm sm:text-base leading-7 text-slate-300">
                HIDZ AM PREMIUM dirancang dengan alur yang sederhana: masukkan alamat email, terima tautan verifikasi, lalu lanjutkan pemeriksaan akun dari satu antarmuka yang tertata.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <span className="px-3 py-2 border border-cyan-500/40 bg-cyan-400/5 text-cyan-200 text-[10px] font-black font-mono">FAST FLOW</span>
                <span className="px-3 py-2 border border-violet-500/40 bg-violet-400/5 text-violet-200 text-[10px] font-black font-mono">CLEAR STATUS</span>
                <span className="px-3 py-2 border border-lime-500/40 bg-lime-400/5 text-lime-200 text-[10px] font-black font-mono">RESPONSIVE UI</span>
              </div>
            </div>

            <div className="relative min-h-[220px] flex items-center justify-center">
              <div className="absolute w-52 h-52 rounded-full border border-cyan-400/20 shadow-[0_0_80px_rgba(36,216,255,.12)]" />
              <div className="absolute w-36 h-36 rounded-full border border-violet-400/30 rotate-45" />
              <div className="relative w-36 h-36 border-2 border-cyan-300 bg-[#080b13] shadow-[9px_9px_0_#7b35ff] flex items-center justify-center rotate-3">
                <div className="text-center font-black">
                  <div className="text-6xl leading-none text-transparent bg-clip-text bg-gradient-to-br from-cyan-300 to-violet-400">H</div>
                  <div className="text-[9px] tracking-[.3em] text-slate-400 mt-1">HIDZ CORE</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'TOTAL PROSES', value: stats.total, icon: TrendingUp, tone: 'text-cyan-300' },
            { label: 'PROSES HARI INI', value: stats.today, icon: Activity, tone: 'text-violet-300' },
            { label: 'STATUS LAYANAN', value: 'ONLINE', icon: Zap, tone: 'text-lime-300' },
            { label: 'ALUR', value: '3 TAHAP', icon: Clock3, tone: 'text-yellow-300' },
          ].map(({ label, value, icon: Icon, tone }) => (
            <div key={label} className="neo-card soft p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[9px] font-black font-mono tracking-[.12em] text-slate-500">{label}</span>
                <Icon size={17} className={tone} />
              </div>
              <div className={`mt-3 text-xl sm:text-2xl font-black ${tone}`}>{typeof value === 'number' ? value.toLocaleString('id-ID') : value}</div>
            </div>
          ))}
        </section>

        <section className="grid md:grid-cols-3 gap-3">
          {[
            ['01', 'EMAIL', 'Tentukan alamat email yang dapat menerima pesan verifikasi.'],
            ['02', 'TAUTAN', 'Salin tautan dari email lalu masukkan ke tahap pemeriksaan.'],
            ['03', 'HASIL', 'Tinjau status akun dan informasi hasil yang dikembalikan sistem.'],
          ].map(([number, title, description]) => (
            <div key={number} className="neo-card soft p-4 flex gap-4">
              <div className="shrink-0 w-11 h-11 border-2 border-violet-400 bg-violet-500/10 text-violet-200 flex items-center justify-center font-black font-mono">{number}</div>
              <div>
                <div className="text-[11px] font-black tracking-[.16em] text-cyan-300">{title}</div>
                <p className="mt-1 text-xs leading-5 text-slate-400">{description}</p>
              </div>
            </div>
          ))}
        </section>

        {statusMessage.text && (
          <div className={`neo-card p-3.5 flex items-start gap-3 text-xs font-mono ${
            statusMessage.type === 'success' ? 'border-lime-400 bg-lime-400/5' :
            statusMessage.type === 'error' ? 'border-rose-400 bg-rose-400/5' : 'border-cyan-400 bg-cyan-400/5'
          }`}>
            {statusMessage.type === 'success' ? <CheckCircle2 className="text-lime-300 shrink-0" size={18} /> :
             statusMessage.type === 'error' ? <AlertTriangle className="text-rose-300 shrink-0" size={18} /> :
             <RefreshCw className="text-cyan-300 shrink-0 animate-spin" size={18} />}
            <span className="text-slate-200 leading-5 flex-1">{statusMessage.text}</span>
            <button type="button" onClick={() => setStatusMessage({ type: null, text: '' })} className="text-slate-500 hover:text-white">×</button>
          </div>
        )}

        <section className="neo-card p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="section-kicker"><ShieldCheck size={14} /> VERIFICATION FLOW</div>
              <h2 className="mt-3 text-2xl sm:text-3xl font-black uppercase tracking-tight">Pusat proses HIDZ</h2>
              <p className="mt-1 text-xs sm:text-sm text-slate-400">Ikuti urutan tahap di bawah agar setiap input diproses secara konsisten.</p>
            </div>
            <div className="text-[10px] font-mono text-slate-500">SESSION / HIDZ-AM / 2026</div>
          </div>

          <div className="neon-line my-5" />

          <div className="grid grid-cols-3 gap-2 mb-5">
            {[
              ['1', 'EMAIL'],
              ['2', 'TAUTAN'],
              ['3', 'HASIL'],
            ].map(([number, label], index) => (
              <button
                key={number}
                type="button"
                onClick={() => setStep((index + 1) as 1 | 2 | 3)}
                disabled={index === 2 && !verificationResult}
                className={`neo-button px-2 py-3 text-[10px] sm:text-xs ${step === index + 1 ? 'bg-cyan-300 text-black shadow-[4px_4px_0_#7b35ff]' : 'bg-button text-slate-300 shadow-[3px_3px_0_#030407]'}`}
              >
                <span className="block font-mono text-[9px] opacity-60">0{number}</span>
                {label}
              </button>
            ))}
          </div>

          {step === 1 && (
            <div className="grid lg:grid-cols-[1.25fr_.75fr] gap-5">
              <div className="bg-panel border border-line p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 border border-cyan-400 bg-cyan-400/10 flex items-center justify-center text-cyan-300"><Mail size={18} /></div>
                  <div>
                    <div className="text-[10px] font-mono font-black tracking-[.16em] text-cyan-300">TAHAP 01 / IDENTITAS</div>
                    <h3 className="mt-1 text-lg font-black uppercase">Masukkan alamat email</h3>
                    <p className="mt-1 text-xs leading-5 text-slate-400">Gunakan alamat yang dapat Anda akses karena pesan lanjutan akan dikirim ke sana.</p>
                  </div>
                </div>

                <form onSubmit={handleSendLink} className="mt-5 space-y-4">
                  <div>
                    <label className="block mb-1.5 text-[10px] font-black font-mono tracking-[.12em] text-slate-400">EMAIL AKUN</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nama@email.com"
                      className="field px-3.5 py-3 text-sm"
                    />
                  </div>

                  <div>
                    <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="inline-flex items-center gap-2 text-[10px] font-black font-mono tracking-[.12em] text-slate-400 hover:text-cyan-300">
                      <KeyRound size={14} /> {showAdvanced ? 'SEMBUNYIKAN OPSI SESI' : 'BUKA OPSI SESI'}
                    </button>
                    {showAdvanced && (
                      <div className="mt-3 border border-line bg-panel-deep p-3 space-y-2">
                        <label className="block text-[10px] font-black font-mono text-slate-400">SESSION IDENTIFIER / OPSIONAL</label>
                        <input
                          type="text"
                          value={cookie}
                          onChange={(e) => setCookie(e.target.value)}
                          placeholder="Masukkan nilai sesi jika diperlukan"
                          className="field px-3 py-2.5 text-xs"
                        />
                        <p className="text-[10px] leading-5 text-slate-500">Bidang ini bersifat opsional dan hanya digunakan apabila alur Anda memerlukannya.</p>
                      </div>
                    )}
                  </div>

                  <button type="submit" disabled={isSending} className="neo-button btn-primary w-full py-3.5 px-5 flex items-center justify-center gap-2 text-xs">
                    {isSending ? <RefreshCw size={16} className="animate-spin" /> : <Send size={16} />}
                    {isSending ? 'MEMPROSES PERMINTAAN...' : 'KIRIM TAUTAN VERIFIKASI'}
                    {!isSending && <ArrowRight size={16} />}
                  </button>
                </form>
              </div>

              <aside className="border border-line bg-panel p-4">
                <div className="flex items-center gap-2 text-violet-300"><Sparkles size={16} /><span className="text-[10px] font-black font-mono tracking-[.14em]">CATATAN PENTING</span></div>
                <ul className="mt-4 space-y-3 text-xs text-slate-400 leading-5">
                  <li>• Pastikan penulisan email benar sebelum mengirim permintaan.</li>
                  <li>• Periksa inbox dan folder spam jika pesan belum terlihat.</li>
                  <li>• Gunakan satu sesi proses pada satu waktu untuk hasil yang lebih konsisten.</li>
                </ul>
                <div className="mt-5 border-t border-line pt-4 text-[10px] font-mono text-slate-500">HIDZ / INPUT CHECK / READY</div>
              </aside>
            </div>
          )}

          {step === 2 && (
            <div className="grid lg:grid-cols-[.8fr_1.2fr] gap-5">
              <aside className="border border-violet-500/30 bg-violet-500/5 p-4">
                <div className="text-[10px] font-black font-mono tracking-[.14em] text-violet-300">TAHAP 02 / PEMERIKSAAN</div>
                <h3 className="mt-2 text-xl font-black uppercase">Masukkan tautan yang diterima</h3>
                <p className="mt-2 text-xs leading-6 text-slate-400">Buka pesan pada email <strong className="text-slate-200 break-all">{email || 'Anda'}</strong>, salin tautan verifikasi secara utuh, lalu tempelkan di bidang berikut.</p>
                <a href="https://mail.google.com" target="_blank" rel="noopener noreferrer" className="neo-button btn-secondary mt-5 inline-flex items-center gap-2 px-3 py-2.5 text-[10px]">
                  <Mail size={14} /> BUKA EMAIL <ExternalLink size={13} />
                </a>
              </aside>

              <form onSubmit={handleVerifyLink} className="bg-panel border border-line p-4 sm:p-5 space-y-4">
                <div className="flex items-center justify-between gap-3 border-b border-line pb-3">
                  <div className="text-[10px] font-mono font-black tracking-[.14em] text-cyan-300">TARGET / {email || 'BELUM ADA EMAIL'}</div>
                  <button type="button" onClick={() => setStep(1)} className="text-[10px] font-black text-slate-500 hover:text-white">GANTI</button>
                </div>

                <div>
                  <label className="block mb-1.5 text-[10px] font-black font-mono tracking-[.12em] text-slate-400">TAUTAN VERIFIKASI / KODE</label>
                  <textarea
                    required
                    rows={5}
                    value={verificationLink}
                    onChange={(e) => setVerificationLink(e.target.value)}
                    placeholder="Tempel tautan lengkap dari email di sini..."
                    className="field p-3 text-xs resize-none"
                  />
                  <p className="mt-2 text-[10px] leading-5 text-slate-500">Pastikan seluruh tautan tersalin. Parameter teknis akan diproses otomatis oleh sistem.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <button type="button" onClick={handlePasteClipboard} className="neo-button btn-secondary px-4 py-3 text-[10px] inline-flex items-center justify-center gap-2">
                    <ClipboardPaste size={14} /> TEMPEL DARI CLIPBOARD
                  </button>
                  <button type="submit" disabled={isVerifying || !verificationLink.trim()} className="neo-button btn-lime flex-1 px-4 py-3 text-[10px] inline-flex items-center justify-center gap-2">
                    {isVerifying ? <RefreshCw size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                    {isVerifying ? 'MEMERIKSA...' : 'LANJUTKAN PEMERIKSAAN'}
                    {!isVerifying && <ArrowRight size={14} />}
                  </button>
                </div>
              </form>
            </div>
          )}

          {step === 3 && verificationResult && (
            <div className="space-y-4">
              <VerificationCard
                email={email}
                userData={verificationResult.userData}
                raw={verificationResult.raw}
                cookie={cookie || verificationResult.userData?.orderId || ''}
              />
              <div className="flex flex-col sm:flex-row gap-2">
                <button type="button" onClick={resetFlow} className="neo-button btn-primary flex-1 py-3 text-[10px] inline-flex items-center justify-center gap-2"><RefreshCw size={14} /> MULAI PROSES BARU</button>
                <button type="button" onClick={() => setStep(2)} className="neo-button btn-secondary px-5 py-3 text-[10px]">KEMBALI KE TAUTAN</button>
              </div>
            </div>
          )}
        </section>

        <HistorySection records={history} onClear={handleClearHistory} onSelect={handleSelectHistory} />

        <section className="neo-card p-4 sm:p-6">
          <div className="flex items-center gap-2 text-cyan-300"><HelpCircle size={17} /><span className="text-[10px] font-black font-mono tracking-[.15em]">PANDUAN SINGKAT</span></div>
          <div className="neon-line my-4" />
          <div className="grid md:grid-cols-3 gap-4">
            {[
              ['01', 'Siapkan email', 'Gunakan email yang aktif dan dapat menerima pesan masuk.'],
              ['02', 'Kirim lalu salin', 'Setelah pesan diterima, salin tautan verifikasi tanpa memotong bagian URL.'],
              ['03', 'Tinjau hasil', 'Masukkan tautan pada tahap kedua dan periksa ringkasan hasil yang ditampilkan.'],
            ].map(([num, title, text]) => (
              <div key={num} className="border border-line bg-panel p-4">
                <span className="text-violet-300 font-black font-mono text-xs">{num}</span>
                <h3 className="mt-2 font-black uppercase text-sm">{title}</h3>
                <p className="mt-1.5 text-xs leading-5 text-slate-500">{text}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="mt-5 border-t border-line bg-footer">
        <div className="w-full max-w-[1180px] mx-auto px-4 py-7 flex flex-col sm:flex-row justify-between gap-5">
          <div>
            <div className="font-black tracking-[.12em]">HIDZ <span className="text-cyan-300">AM PREMIUM</span></div>
            <p className="mt-2 max-w-xl text-[11px] leading-5 text-slate-500">Antarmuka HIDZ untuk proses verifikasi yang ringkas, informatif, dan mudah dinavigasi pada perangkat desktop maupun mobile.</p>
          </div>
          <div className="text-left sm:text-right text-[10px] font-mono text-slate-600">
            <div>HIDZ SYSTEM / ONLINE</div>
            <div className="mt-1">© 2026 HIDZ. ALL RIGHTS RESERVED.</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
