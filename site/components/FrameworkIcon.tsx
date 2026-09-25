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
  // Official Vue mark: green outer V, dark inner V.
  return (
    <svg viewBox="0 0 261.76 226.69" aria-hidden className="size-4">
      <path fill="#41B883" d="M161.096.001l-30.225 52.351L100.647.001H-.005l130.877 226.688L261.749.001z" />
      <path fill="#34495E" d="M161.096.001l-30.225 52.351L100.647.001H52.346l78.526 136.01L209.398.001z" />
    </svg>
  )
}
