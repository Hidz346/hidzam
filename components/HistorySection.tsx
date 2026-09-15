'use client';

import React, { useState } from 'react';
import { Check, ChevronDown, ChevronUp, Copy, Download, FileJson, History, Trash2 } from 'lucide-react';

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
}

export default function HistorySection({ records, onClear, onSelect }: HistorySectionProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (records.length === 0) return null;

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      window.setTimeout(() => setCopiedId(null), 1600);
    } catch {
      // Clipboard failure does not affect stored history.
    }
  };

  const downloadJSON = (payload: unknown, filename: string) => {
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadAll = () => {
    downloadJSON(
      { exportDate: new Date().toISOString(), source: 'HIDZ AM PREMIUM', totalRecords: records.length, records },
      `hidz-history-${new Date().toISOString().slice(0, 10)}.json`,
    );
  };

  return (
    <section className="neo-card p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button type="button" onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-2 text-left">
          <History size={17} className="text-cyan-300" />
          <span className="font-black uppercase text-sm">Riwayat proses ({records.length})</span>
          {isOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>

        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={handleDownloadAll} className="neo-button btn-secondary px-3 py-2 text-[9px] inline-flex items-center gap-1.5">
            <Download size={13} /> EKSPOR DATA
          </button>
          <button type="button" onClick={onClear} className="neo-button px-3 py-2 text-[9px] bg-rose-500/15 text-rose-200 border-rose-400 shadow-[3px_3px_0_#030407] inline-flex items-center gap-1.5">
            <Trash2 size={13} /> HAPUS RIWAYAT
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="mt-4 space-y-2 max-h-72 overflow-y-auto pr-1">
          {records.map((record) => (
            <div key={record.id} className="border border-[#27304a] bg-[#090c14] p-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-sm break-all">{record.email}</span>
                  <span className="px-1.5 py-0.5 border border-lime-400/50 bg-lime-400/5 text-lime-300 text-[8px] font-black font-mono">SELESAI</span>
                </div>
                <div className="mt-1 text-[10px] font-mono text-slate-500">{record.timestamp}</div>
              </div>
              <div className="flex flex-wrap gap-1.5 justify-end">
                <button type="button" onClick={() => onSelect(record)} className="neo-button btn-primary px-2.5 py-1.5 text-[9px]">LIHAT</button>
                <button
                  type="button"
                  onClick={() => downloadJSON({ exportDate: new Date().toISOString(), source: 'HIDZ AM PREMIUM', ...record }, `hidz-account-${record.email.replace(/[^a-zA-Z0-9]/g, '_')}.json`)}
                  className="neo-button btn-secondary px-2.5 py-1.5 text-[9px] inline-flex items-center gap-1"
                >
                  <FileJson size={12} /> JSON
                </button>
                <button type="button" onClick={() => handleCopy(record.email, record.id)} className="neo-button btn-secondary px-2.5 py-1.5 text-[9px] inline-flex items-center gap-1">
                  {copiedId === record.id ? <Check size={12} className="text-lime-300" /> : <Copy size={12} />}
                  {copiedId === record.id ? 'TERSALIN' : 'SALIN'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
