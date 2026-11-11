import type { Metadata, Viewport } from 'next';
import './globals.css';
import TabBar from '@/components/TabBar';

export const metadata: Metadata = {
  title: 'PinkCheck',
  description: 'Spot when you may be paying more just because a product is marketed to women.',
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-gray-800 antialiased">
        <main className="mx-auto max-w-md pb-24">{children}</main>
        <TabBar />
      </body>
    </html>
  );
}
