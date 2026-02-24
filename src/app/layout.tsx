import type { Metadata } from 'next';
import './globals.css';
import { GscProvider } from '@/store/gsc-store';

export const metadata: Metadata = {
  title: 'GSC Analyzer',
  description: 'Strategic Google Search Console data analysis',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <GscProvider>{children}</GscProvider>
      </body>
    </html>
  );
}
