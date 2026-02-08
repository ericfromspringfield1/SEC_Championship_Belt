import './globals.css';
import Link from 'next/link';
import type { ReactNode } from 'react';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="bg-slate-900 text-white">
          <nav className="mx-auto flex max-w-6xl gap-4 p-4 text-sm">
            <Link href="/">Dashboard</Link>
            <Link href="/query/champion-on-date">Champion on Date</Link>
            <Link href="/leaderboards">Leaderboards</Link>
            <Link href="/games">Games</Link>
          </nav>
        </header>
        <main className="mx-auto max-w-6xl p-4">{children}</main>
      </body>
    </html>
  );
}
