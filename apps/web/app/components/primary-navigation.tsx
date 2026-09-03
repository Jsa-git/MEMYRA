'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navigation = [
  { href: '/journey', label: 'Jornadas', icon: '◫' },
  { href: '/settings', label: 'Ajustes', icon: '○' },
] as const;

export function PrimaryNavigation() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-xl border-t border-graphite/10 bg-ivory/95 px-3 pb-[max(.75rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur"
      aria-label="Navegação principal"
    >
      <ul className="grid grid-cols-2">
        {navigation.map((item) => {
          const current = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={current ? 'page' : undefined}
                className={`flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-xl text-[0.68rem] font-medium transition-colors hover:bg-sand/40 hover:text-forest focus-visible:outline-2 focus-visible:outline-forest ${current ? 'bg-sand/45 text-forest' : 'text-graphite/65'}`}
              >
                <span aria-hidden="true" className="text-base leading-none">
                  {item.icon}
                </span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
