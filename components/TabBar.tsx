'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/', label: 'Search' },
  { href: '/scan', label: 'Scan' },
  { href: '/receipt', label: 'Receipt' },
  { href: '/community', label: 'Community' },
];

export default function TabBar() {
  const path = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 flex border-t border-pink-100 bg-white pb-[env(safe-area-inset-bottom)]">
      {TABS.map((t) => {
        const active = t.href === '/' ? path === '/' : path.startsWith(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`flex-1 py-4 text-center text-xs font-medium sm:text-sm ${
              active ? 'text-pink-600' : 'text-gray-500'
            }`}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
