import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-headline',
});

export const metadata: Metadata = {
  title: 'Atlas of War',
  description: 'An interactive editorial visualizer of historical conflict.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} dark`}>
      <body className="antialiased h-screen overflow-hidden text-sm bg-[#1a1a1c] text-[#e6e4df]">
        <div className="texture-overlay" />
        {children}
      </body>
    </html>
  );
}
