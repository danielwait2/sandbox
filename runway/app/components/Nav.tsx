'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

const NAV_LINKS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/budget', label: 'Budget' },
  { href: '/review-queue', label: 'Review Queue' },
  { href: '/insights', label: 'Insights' },
  { href: '/history', label: 'History' },
  { href: '/receipts', label: 'Receipts' },
  { href: '/settings', label: 'Settings' },
];

export default function Nav() {
  const { data: session } = useSession();
  const pathname = usePathname();

  if (!session) return null;

  return (
    <nav className="border-b border-zinc-200 bg-white" aria-label="Primary">
      <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-3 sm:px-6 md:flex-row md:items-center md:justify-between md:gap-8 md:py-3.5">
        <div className="flex items-center justify-between gap-4 md:justify-start">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2.5 rounded-md text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2"
            aria-label="Runway home"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-[1.3rem] w-[1.3rem] shrink-0"
              aria-hidden="true"
              focusable="false"
            >
              <rect x="2.5" y="2.5" width="19" height="19" rx="4" fill="#18181b" />
              <path d="M7.5 15.5V8.5L11 12l2.5-2.5 3 3V15.5" fill="none" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M7.5 15.5h9" fill="none" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <span className="text-[1.75rem] font-semibold leading-none tracking-tight">Runway</span>
          </Link>
          <div className="flex min-w-0 items-center gap-3 md:hidden">
            {session.user?.email && (
              <span className="truncate text-sm text-zinc-700">{session.user.email}</span>
            )}
          </div>
        </div>

        <div className="-mx-1 flex overflow-x-auto px-1 md:mx-0 md:flex-1 md:justify-center md:overflow-visible md:px-0">
          <div className="flex min-w-max items-center gap-1.5 md:gap-2.5">
            {NAV_LINKS.map((link) => {
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-md px-2.5 py-1.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 ${
                    isActive
                      ? 'bg-zinc-100 text-zinc-900'
                      : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="hidden min-w-0 shrink-0 items-center justify-end md:flex">
          {session.user?.email && (
            <span className="max-w-[14rem] truncate text-sm leading-none text-zinc-700">{session.user.email}</span>
          )}
        </div>
      </div>
    </nav>
  );
}
