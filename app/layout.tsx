import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Modern Chess 3D',
  description:
    '♟️ Jouez aux échecs en 3D avec IA Stockfish, multijoueur temps réel, et classement Elo.',
  keywords: ['chess', '3d', 'stockfish', 'multiplayer', 'three.js'],
  openGraph: {
    title: 'Modern Chess 3D',
    description:
      'Un jeu d\'échecs 3D premium avec IA, multijoueur et classement Elo.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="dark">
      <body className={`${inter.className} bg-[#0a0a0a] text-white min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
