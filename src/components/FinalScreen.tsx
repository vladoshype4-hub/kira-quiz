import type { CSSProperties } from 'react'
import CloverQrView from './CloverQrView'
import CloverAnimation from './CloverAnimation'
import SiteNav from './SiteNav'
import { Link } from 'react-router-dom'

/** Разовый «взрыв» лепестков при открытии финала (без Math.random). */
const BURST = Array.from({ length: 22 }, (_, i) => {
  const angle = (i / 22) * Math.PI * 2 + (i % 3) * 0.15
  const dist = 140 + ((i * 47) % 200)
  return {
    s: 8 + ((i * 3) % 8),
    bx: `${Math.round(Math.cos(angle) * dist)}px`,
    by: `${Math.round(Math.sin(angle) * dist - 60)}px`,
    rot: `${(i % 2 ? 1 : -1) * (120 + ((i * 29) % 200))}deg`,
    delay: `${0.15 + (i % 7) * 0.07}s`,
  }
})

export default function FinalScreen() {
  return (
    <main className="screen">
      <SiteNav active="home" />
      <div className="final__bloom" aria-hidden="true" />
      <div className="burst" aria-hidden="true">
        {BURST.map((p, i) => (
          <i
            key={i}
            style={
              {
                '--s': p.s,
                '--bx': p.bx,
                '--by': p.by,
                '--rot': p.rot,
                '--delay': p.delay,
              } as CSSProperties
            }
          />
        ))}
      </div>

      <div className="final" role="status" aria-live="polite">
        <span className="eyebrow">Готово</span>

        <h1 className="display final__title">
          Теперь я знаю тебя
          <br />
          <em>чуть лучше 💘</em>
        </h1>

        <p className="final__text">
          Спасибо, что прошла это 💘 Теперь я знаю о тебе чуть больше — и это правда приятно.
        </p>

        <CloverAnimation />
        <CloverQrView />

        <p className="final__caption">🍀 Маленькая удача для тебя. Наведи камеру на код — он ведёт обратно сюда.</p>
        <Link className="btn btn--ghost final__memories-link" to="/memories">Ещё немного воспоминаний <span aria-hidden="true">↗</span></Link>
      </div>
    </main>
  )
}
