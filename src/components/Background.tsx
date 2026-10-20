import type { CSSProperties } from 'react'

/** Детерминированные «лепестки»: без Math.random, чтобы картинка не прыгала между рендерами. */
const PETALS = Array.from({ length: 12 }, (_, i) => {
  const k = (i * 37) % 100
  return {
    x: `${6 + ((i * 53) % 88)}%`,
    s: 7 + ((i * 5) % 9),
    d: `${22 + ((i * 7) % 16)}s`,
    delay: `${-((i * 3.7) % 24)}s`,
    sway: `${(k % 2 ? 1 : -1) * (30 + (k % 50))}px`,
    rot: `${(k % 2 ? 1 : -1) * (140 + k)}deg`,
  }
})

export default function Background() {
  return (
    <div className="bg" aria-hidden="true">
      <div className="bg__blob bg__blob--a" />
      <div className="bg__blob bg__blob--b" />
      {PETALS.map((p, i) => (
        <span
          key={i}
          className="petal"
          style={
            {
              '--x': p.x,
              '--s': p.s,
              '--d': p.d,
              '--delay': p.delay,
              '--sway': p.sway,
              '--rot': p.rot,
            } as CSSProperties
          }
        />
      ))}
      <div className="bg__grain" />
      <div className="bg__vignette" />
    </div>
  )
}
