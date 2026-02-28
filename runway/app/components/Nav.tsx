'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

const NAV_LINKS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/review-queue', label: 'Review Queue' },
  { href: '/insights', label: 'Insights' },
  { href: '/history', label: 'History' },
  { href: '/settings', label: 'Settings' },
];

export default function Nav() {
  const { data: session } = useSession();
  const pathname = usePathname();

  if (!session) return null;

  return (
    <nav className="border-b border-zinc-200 bg-white">
      <div className="mx-auto max-w-5xl px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="font-bold text-zinc-900 text-lg">Runway</span>
          <div className="flex gap-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={
                  pathname.startsWith(link.href)
                    ? 'text-sm font-medium text-zinc-900'
                    : 'text-sm font-medium text-zinc-500 hover:text-zinc-700'
                }
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <span className="text-sm text-zinc-500">{session.user?.email}</span>
      </div>
    </nav>
  );
}
