'use client';

import React, { useState } from 'react';
import { CheckCircle2, Copy, Check, ShieldCheck, User, Mail, Calendar, Key, Code2, Download, Award } from 'lucide-react';

interface VerificationCardProps {
  email: string;
  userData: any;
  raw: any;
  cookie: string;
  onNotify?: (type: 'success' | 'error' | 'info', message: string) => void;
}

export default function VerificationCard({ email, userData, raw, cookie, onNotify }: VerificationCardProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showRaw, setShowRaw] = useState(false);

  const copyToClipboard = async (text: string, key: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      onNotify?.('success', `${label} berhasil disalin.`);
      setTimeout(() => setCopiedKey(null), 1800);
    } catch {
      onNotify?.('error', `Gagal menyalin ${label}.`);
    }
  };

  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify({ verifiedAt: new Date().toISOString(), email, cookie, userData, raw }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hidz-am-${email.replace(/[^a-zA-Z0-9]/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    onNotify?.('info', 'File JSON akun diunduh.');
  };

  const userObj = userData || raw?.data?.user || raw?.data || {};
  const isPremiumActive = userObj.status === 'ACTIVE' || userObj.membershipStatus === 'PREMIUM_ACTIVE' || raw?.raw?.premium?.ok;

  return (
    <div className="space-y-4">
      <div className="p-4 rounded border border-emerald-500/30 bg-emerald-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5 sm:mt-0" />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono font-bold uppercase text-emerald-500">
                {isPremiumActive ? 'PROVISIONING SUCCESS' : 'AUTH COMPLETED'}
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-panel border border-line text-ink">
                {userObj.status || 'ACTIVE'}
              </span>
            </div>
            <p className="text-sm font-bold text-ink mt-0.5">Lisensi akun telah diverifikasi</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={downloadJSON} className="btn btn-secondary px-3 py-1.5 text-xs font-mono">
            <Download className="w-3.5 h-3.5" /> <span>JSON</span>
          </button>
          <button type="button" onClick={() => setShowRaw(!showRaw)} className="btn btn-secondary px-3 py-1.5 text-xs font-mono">
            <Code2 className="w-3.5 h-3.5" /> <span>{showRaw ? 'Tutup' : 'Raw'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="p-3.5 rounded border border-line bg-panel-deep">
          <div className="flex items-center justify-between text-muted mb-1.5 font-mono">
            <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> EMAIL AKUN</span>
            <button type="button" onClick={() => copyToClipboard(email, 'email', 'Email')} className="text-ink hover:underline flex items-center gap-1">
              {copiedKey === 'email' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              <span>{copiedKey === 'email' ? 'Tersalin' : 'Salin'}</span>
            </button>
          </div>
          <p className="font-mono font-semibold text-ink text-sm break-all">{email}</p>
        </div>

        <div className="p-3.5 rounded border border-line bg-panel-deep">
          <div className="flex items-center justify-between text-muted mb-1.5 font-mono">
            <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> FIREBASE UID</span>
            {userObj.uid && (
              <button type="button" onClick={() => copyToClipboard(String(userObj.uid), 'uid', 'UID')} className="text-ink hover:underline flex items-center gap-1">
                {copiedKey === 'uid' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                <span>{copiedKey === 'uid' ? 'Tersalin' : 'Salin'}</span>
              </button>
            )}
          </div>
          <p className="font-mono font-semibold text-ink break-all">{userObj.uid || userObj.id || '-'}</p>
        </div>

        <div className="p-3.5 rounded border border-line bg-panel-deep">
          <div className="text-muted mb-1.5 font-mono flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> PAKET LISENSI</div>
          <p className="font-semibold text-ink text-sm">{userObj.tier || userObj.planName || 'Alight Motion Pro'}</p>
        </div>

        <div className="p-3.5 rounded border border-line bg-panel-deep">
          <div className="flex items-center justify-between text-muted mb-1.5 font-mono">
            <span className="flex items-center gap-1.5"><Award className="w-3.5 h-3.5" /> ORDER ID</span>
            {userObj.orderId && (
              <button type="button" onClick={() => copyToClipboard(String(userObj.orderId), 'order', 'Order ID')} className="text-ink hover:underline flex items-center gap-1">
                {copiedKey === 'order' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                <span>{copiedKey === 'order' ? 'Tersalin' : 'Salin'}</span>
              </button>
            )}
          </div>
          <p className="font-mono font-semibold text-ink break-all">{userObj.orderId || 'neo-verified'}</p>
        </div>

        <div className="p-3.5 rounded border border-line bg-panel-deep">
          <div className="flex items-center justify-between text-muted mb-1.5 font-mono">
            <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> MASA AKTIF</span>
            <span>1 Tahun</span>
          </div>
          <p className="font-semibold text-ink text-sm">{userObj.validUntil || 'Lisensi Tahunan'}</p>
        </div>

        <div className="p-3.5 rounded border border-line bg-panel-deep">
          <div className="flex items-center justify-between text-muted mb-1.5 font-mono">
            <span className="flex items-center gap-1.5"><Key className="w-3.5 h-3.5" /> SESSION ID</span>
            {cookie && (
              <button type="button" onClick={() => copyToClipboard(cookie, 'cookie', 'Session ID')} className="text-ink hover:underline flex items-center gap-1">
                {copiedKey === 'cookie' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                <span>{copiedKey === 'cookie' ? 'Tersalin' : 'Salin'}</span>
              </button>
            )}
          </div>
          <p className="font-mono text-ink truncate">{cookie || 'Bearer Token Verified'}</p>
        </div>
      </div>

      {showRaw && (
        <div className="p-3.5 rounded border border-line bg-panel-deep font-mono text-xs">
          <pre className="max-h-60 overflow-y-auto whitespace-pre-wrap break-all text-[11px] text-muted">
            {JSON.stringify(raw || userData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
