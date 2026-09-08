'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navigation = [
  { href: '/journey', label: 'Hoje', icon: 'home' },
  { href: '/journey/new', label: 'Nova jornada', icon: 'plus' },
  { href: '/settings', label: 'Ajustes', icon: 'settings' },
] as const;

export function PrimaryNavigation() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-3 bottom-3 z-20 mx-auto max-w-md rounded-[1.4rem] border border-graphite/10 bg-surface/92 px-2 pb-[max(.4rem,env(safe-area-inset-bottom))] pt-1.5 shadow-[0_12px_45px_rgb(36_38_34/14%)] backdrop-blur-xl"
      aria-label="Navegação principal"
    >
      <ul className="grid grid-cols-3">
        {navigation.map((item) => {
          const current = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={current ? 'page' : undefined}
                className={`flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-xl text-[0.68rem] font-medium transition-colors hover:bg-sand/40 hover:text-forest focus-visible:outline-2 focus-visible:outline-forest ${current ? 'bg-sand/45 text-forest' : 'text-graphite/65'}`}
              >
                <NavIcon name={item.icon} />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function NavIcon({ name }: { name: 'home' | 'plus' | 'settings' }) {
  if (name === 'plus')
    return (
      <span
        aria-hidden="true"
        className="grid size-7 place-items-center rounded-full bg-forest text-lg leading-none text-ivory"
      >
        +
      </span>
    );
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-5 fill-none stroke-current"
      strokeWidth="1.7"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d={
          name === 'home'
            ? 'M4 10.5 12 4l8 6.5V20h-5v-5H9v5H4z'
            : 'M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM19 12l1.5-1-1.5-2-1.8.5-.9-1.6.5-1.8-2.4-1-1 1.5h-1.8l-1-1.5-2.4 1 .5 1.8-.9 1.6L5 9l-1.5 2L5 12l-1.5 1L5 15l1.8-.5.9 1.6-.5 1.8 2.4 1 1-1.5h1.8l1 1.5 2.4-1-.5-1.8.9-1.6 1.8.5 1.5-2z'
        }
      />
    </svg>
  );
}
