import type { Metadata } from 'next';
import './globals.css';
import { GscProvider } from '@/store/gsc-store';

export const metadata: Metadata = {
  title: 'GSC Analyzer',
  description: 'Strategiczna analiza danych z Google Search Console',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <body className="antialiased">
        <GscProvider>{children}</GscProvider>
      </body>
    </html>
  );
}
