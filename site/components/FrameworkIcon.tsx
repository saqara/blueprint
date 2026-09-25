// Tiny brand marks for the framework switch (lucide ships no brand logos).
export function ReactIcon() {
  return (
    <svg viewBox="-12 -11 24 22" aria-hidden className="size-4" fill="none" stroke="#149ECA" strokeWidth="1.2">
      <circle r="2" fill="#149ECA" stroke="none" />
      <ellipse rx="10.5" ry="4.2" />
      <ellipse rx="10.5" ry="4.2" transform="rotate(60)" />
      <ellipse rx="10.5" ry="4.2" transform="rotate(120)" />
    </svg>
  )
}

export function VueIcon() {
  return (
    <svg viewBox="0 0 256 221" aria-hidden className="size-4">
      <path fill="#41B883" d="M204.8 0H256L128 220.8 0 0h97.92L128 51.2 157.44 0h47.36Z" />
      <path fill="#34495E" d="M0 0l128 220.8L256 0h-51.2L128 132.48 50.56 0H0Z" />
      <path fill="#34495E" d="M50.56 0 128 133.12 204.8 0h-47.36L128 51.2 97.92 0H50.56Z" />
    </svg>
  )
}
