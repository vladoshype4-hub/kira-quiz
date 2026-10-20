interface IconProps {
  className?: string
}

export function CheckIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M2.2 6.4 4.8 9 9.8 3.2" stroke="#1c0a15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function ArrowRightIcon({ className }: IconProps) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function ArrowLeftIcon({ className }: IconProps) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M19 12H5m6-6-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function AlertIcon({ className }: IconProps) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M12 7.5v5.5M12 16.6v.1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

/** Тонкое контурное сердце: используется как заглушка вместо фото. */
export function HeartLineIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 64 60" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="hl-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#eaa6c0" />
          <stop offset="1" stopColor="#b9a7ea" />
        </linearGradient>
      </defs>
      <path
        d="M32 55C12 41 6 30 6 21 6 12 13 6 21 6c5 0 9 2.6 11 7 2-4.4 6-7 11-7 8 0 15 6 15 15 0 9-6 20-26 34Z"
        stroke="url(#hl-g)"
        strokeWidth="1.6"
        strokeLinejoin="round"
        fill="rgba(234,166,192,0.08)"
      />
    </svg>
  )
}
