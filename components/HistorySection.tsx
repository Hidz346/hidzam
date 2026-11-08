'use client';

import React, { useState } from 'react';
import { Check, Copy, Download, FileJson, History, Trash2, AlertCircle } from 'lucide-react';

export interface VerifiedRecord {
  id: string;
  email: string;
  cookie: string;
  timestamp: string;
  userData: any;
  raw: any;
}

interface HistorySectionProps {
  records: VerifiedRecord[];
  onClear: () => void;
  onSelect: (record: VerifiedRecord) => void;
  onNotify?: (type: 'success' | 'error' | 'info', message: string) => void;
}

export default function HistorySection({ records, onClear, onSelect, onNotify }: HistorySectionProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [confirmingClear, setConfirmingClear] = useState(false);

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      onNotify?.('success', `Email ${text} disalin ke clipboard.`);
      window.setTimeout(() => setCopiedId(null), 1600);
    } catch {
      onNotify?.('error', 'Gagal menyalin ke clipboard.');
    }
  };

  const downloadJSON = (payload: unknown, filename: string) => {
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    onNotify?.('info', `File ${filename} berhasil diunduh.`);
  };

  const handleDownloadAll = () => {
    downloadJSON(
      { exportDate: new Date().toISOString(), source: 'HIDZ AM PROVISIONING', totalRecords: records.length, records },
      `hidz-history-${new Date().toISOString().slice(0, 10)}.json`
    );
  };

  return (
    <section className="surface-card p-4 sm:p-5">
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-line">
        <div className="flex items-center gap-2">
          <History size={16} className="text-muted" />
          <h2 className="font-bold text-sm text-ink">Riwayat Sesi Lokal ({records.length})</h2>
        </div>
        {records.length > 0 && !confirmingClear && (
          <div className="flex items-center gap-1.5">
            <button type="button" onClick={handleDownloadAll} className="btn btn-secondary px-2.5 py-1 text-[11px] font-mono">
              <Download size={12} /> Ekspor
            </button>
            <button type="button" onClick={() => setConfirmingClear(true)} className="btn btn-danger px-2.5 py-1 text-[11px] font-mono">
              <Trash2 size={12} /> Hapus
            </button>
          </div>
        )}
      </div>

      {confirmingClear && (
        <div className="mt-3 p-3 rounded border border-rose-500/40 bg-rose-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-ink">
            <AlertCircle size={15} className="text-rose-500 shrink-0" />
            <span>Hapus semua riwayat dari perangkat ini?</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button type="button" onClick={() => setConfirmingClear(false)} className="btn btn-secondary px-3 py-1 text-xs font-mono">Batal</button>
            <button type="button" onClick={() => { onClear(); setConfirmingClear(false); }} className="btn btn-danger px-3 py-1 text-xs font-mono">Ya, Bersihkan</button>
          </div>
        </div>
      )}

      {records.length === 0 ? (
        <div className="py-8 text-center text-xs font-mono text-muted">Belum ada riwayat verifikasi yang tersimpan.</div>
      ) : (
        <div className="mt-3 space-y-2 max-h-80 overflow-y-auto pr-1">
          {records.map((r) => (
            <div key={r.id} className="rounded border border-line bg-panel-deep p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono font-semibold text-xs text-ink break-all">{r.email}</span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-500 text-[10px] font-mono font-semibold">VERIFIED</span>
                </div>
                <div className="mt-1 text-[11px] font-mono text-muted">{r.timestamp}</div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button type="button" onClick={() => onSelect(r)} className="btn btn-primary px-2.5 py-1 text-[11px] font-mono">Buka</button>
                <button type="button" onClick={() => downloadJSON(r, `hidz-${r.email.replace(/[^a-zA-Z0-9]/g, '_')}.json`)} className="btn btn-secondary px-2 py-1 text-[11px] font-mono"><FileJson size={12} /></button>
                <button type="button" onClick={() => handleCopy(r.email, r.id)} className="btn btn-secondary px-2 py-1 text-[11px] font-mono">
                  {copiedId === r.id ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
