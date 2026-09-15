export function friendlyFirebaseError(errStr: any): string {
  if (!errStr || typeof errStr !== 'string') return 'Terjadi kesalahan autentikasi.';
  if (errStr.includes('INVALID_OOB_CODE')) return 'Kode verifikasi tidak valid atau sudah pernah digunakan.';
  if (errStr.includes('EXPIRED_OOB_CODE')) return 'Tautan verifikasi telah kedaluwarsa. Minta tautan baru jika diperlukan.';
  if (errStr.includes('INVALID_EMAIL')) return 'Format email tidak valid.';
  if (errStr.includes('EMAIL_NOT_FOUND')) return 'Email tidak ditemukan. Kirim permintaan verifikasi terlebih dahulu.';
  if (errStr.includes('USER_DISABLED')) return 'Akun dinonaktifkan oleh admin.';
  if (errStr.includes('TOO_MANY_ATTEMPTS_TRY_LATER')) return 'Terlalu banyak percobaan. Coba lagi nanti.';
  if (errStr.includes('API_KEY_INVALID') || errStr.includes('API key not valid')) return 'FIREBASE_API_KEY tidak valid.';
  if (errStr.includes('Gagal mengekstrak oobCode') || errStr.includes('code gak ada')) return 'Format tautan verifikasi tidak dikenali. Pastikan seluruh URL dari email ditempelkan.';
  return errStr.length > 500 ? errStr.slice(0, 500) : errStr;
}
