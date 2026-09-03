import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'quiet';
};

const buttonVariants = {
  primary: 'bg-forest text-ivory hover:bg-forest-light shadow-soft',
  secondary: 'border border-graphite/15 bg-surface text-graphite hover:bg-sand/50',
  quiet: 'text-forest hover:bg-sand/45',
} as const;

export function Button({
  className = '',
  variant = 'primary',
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex min-h-12 items-center justify-center rounded-full px-5 text-sm font-semibold tracking-tight transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest disabled:cursor-not-allowed disabled:opacity-45 ${buttonVariants[variant]} ${className}`}
      type={type}
      {...props}
    />
  );
}

export function Surface({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-[1.5rem] border border-graphite/8 bg-surface ${className}`}
      {...props}
    />
  );
}

export function Eyebrow({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <p className="text-[0.7rem] font-bold uppercase tracking-[0.19em] text-forest">{children}</p>
  );
}

export function ProgressBar({ label, value }: Readonly<{ label: string; value: number }>) {
  const safeValue = Math.max(0, Math.min(100, value));
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span>{label}</span>
        <span className="font-semibold tabular-nums">{safeValue}%</span>
      </div>
      <div
        className="h-1.5 overflow-hidden rounded-full bg-mineral"
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={safeValue}
      >
        <div className="h-full rounded-full bg-forest" style={{ width: `${safeValue}%` }} />
      </div>
    </div>
  );
}
