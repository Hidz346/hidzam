import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'HIDZ AM PREMIUM',
  description: 'HIDZ AM PREMIUM — antarmuka layanan verifikasi akun yang ringkas, jelas, dan responsif.',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    title: 'HIDZ AM PREMIUM',
    description: 'Layanan HIDZ dengan alur verifikasi akun yang terstruktur.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HIDZ AM PREMIUM',
    description: 'Layanan HIDZ dengan alur verifikasi akun yang terstruktur.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
