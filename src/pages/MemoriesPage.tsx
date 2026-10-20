import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Background from '../components/Background'
import SiteNav from '../components/SiteNav'

type MemoryItem = {
  src: string
  alt: string
  category: 'photo' | 'art' | 'anime'
  className?: string
}

const MEMORIES: MemoryItem[] = [
  { src: '/images/kira-hero.jpg', alt: 'Кира на улице, при дневном свете', category: 'photo', className: 'memory-card--portrait' },
  { src: '/images/kira-evening.jpg', alt: 'Кира в вечернем кадре', category: 'photo', className: 'memory-card--portrait memory-card--tilt' },
  { src: '/images/memory-neon-clover.jpg', alt: 'Неоновый рисунок с клевером и сердцами', category: 'art', className: 'memory-card--wide' },
  { src: '/images/kira-cafe.jpg', alt: 'Кира в кафе', category: 'photo', className: 'memory-card--portrait' },
  { src: '/images/kira-palm.jpg', alt: 'Кира в вечернем образе', category: 'photo', className: 'memory-card--portrait memory-card--tilt' },
  { src: '/images/memory-heart-doodle.jpg', alt: 'Рисунок с сердцами и клевером', category: 'art', className: 'memory-card--wide' },
  { src: '/images/kira-white-top.jpg', alt: 'Кира в светлом топе', category: 'photo', className: 'memory-card--portrait' },
  { src: '/images/kira-anime.png', alt: 'Аниме-иллюстрация из архива', category: 'anime', className: 'memory-card--anime' },
]

export default function MemoriesPage() {
  const [active, setActive] = useState<number | null>(null)
  const [cloverTaps, setCloverTaps] = useState(0)
  const [secretOpen, setSecretOpen] = useState(false)
  const current = active === null ? null : MEMORIES[active]

  useEffect(() => {
    document.title = 'Наши моменты — для Киры 💘'
    return () => { document.title = 'Kira Quiz — немного о тебе 💘' }
  }, [])

  useEffect(() => {
    if (!current && !secretOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActive(null)
        setSecretOpen(false)
      }
      if (active !== null && event.key === 'ArrowRight') setActive((value) => value === null ? 0 : (value + 1) % MEMORIES.length)
      if (active !== null && event.key === 'ArrowLeft') setActive((value) => value === null ? 0 : (value - 1 + MEMORIES.length) % MEMORIES.length)
    }
    window.addEventListener('keydown', handleKey)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKey)
    }
  }, [active, current, secretOpen])

  const tapClover = () => {
    const next = cloverTaps + 1
    setCloverTaps(next)
    if (next >= 5) {
      setSecretOpen(true)
      setCloverTaps(0)
    }
  }

  return (
    <>
      <Background />
      <main className="screen memories-screen">
        <SiteNav active="memories" />
        <section className="memories-hero">
          <div className="memories-hero__copy">
            <p className="eyebrow rise">МАЛЕНЬКАЯ КОЛЛЕКЦИЯ</p>
            <h1 className="display memories-title rise">То, что хочется<br /><em>сохранить</em></h1>
            <p className="memories-lead rise">Фотографии и маленькие детали, к которым приятно возвращаться. Без спешки — просто оставить их здесь.</p>
            <Link className="memories-back-link rise" to="/">← Вернуться на главную</Link>
          </div>
          <div className="memories-hero__art" aria-hidden="true">
            <div className="memories-hero__halo" />
            <img src="/images/kira-anime.png" alt="" />
            <span className="memories-hero__sticker">💘</span>
          </div>
        </section>

        <section className="memories-gallery" aria-label="Галерея фотографий и деталей">
          <div className="memories-gallery__heading">
            <div><span className="eyebrow">АРХИВ</span><h2 className="display">В деталях</h2></div>
            <p>Нажми на карточку,<br />чтобы рассмотреть её поближе.</p>
          </div>
          <div className="memories-grid">
            {MEMORIES.map((item, index) => (
              <button type="button" className={`memory-card ${item.className ?? ''}`} key={item.src} onClick={() => setActive(index)} aria-label={`Открыть изображение ${index + 1}: ${item.alt}`}>
                <span className="memory-card__image-wrap">
                  <img src={item.src} alt={item.alt} loading="lazy" decoding="async" />
                  <span className="memory-card__zoom" aria-hidden="true">↗</span>
                </span>
                <span className="memory-card__caption"><span>{item.category === 'photo' ? 'ФОТОГРАФИЯ' : item.category === 'anime' ? 'АНИМЕ-ИЛЛЮСТРАЦИЯ' : 'МАЛЕНЬКАЯ ДЕТАЛЬ'}</span><b>{String(index + 1).padStart(2, '0')}</b></span>
              </button>
            ))}
          </div>
        </section>

        <section className="memories-note">
          <span className="memories-note__line" />
          <p>Некоторые вещи хочется сохранить не потому, что они идеальные, а потому, что они — наши.</p>
          <button type="button" className="memories-secret-trigger" onClick={tapClover} aria-label="Маленькая удача">🍀</button>
          <span className="memories-note__small">МАЛЕНЬКАЯ УДАЧА</span>
        </section>
      </main>

      {current && active !== null && (
        <div className="memory-lightbox" role="dialog" aria-modal="true" aria-label="Просмотр изображения" onMouseDown={(event) => { if (event.target === event.currentTarget) setActive(null) }}>
          <button className="memory-lightbox__close" type="button" onClick={() => setActive(null)} aria-label="Закрыть просмотр">×</button>
          <button className="memory-lightbox__arrow memory-lightbox__arrow--left" type="button" onClick={() => setActive((active + MEMORIES.length - 1) % MEMORIES.length)} aria-label="Предыдущее изображение">‹</button>
          <figure className="memory-lightbox__figure">
            <img src={current.src} alt={current.alt} />
            <figcaption><span>{String(active + 1).padStart(2, '0')} / {String(MEMORIES.length).padStart(2, '0')}</span>{current.alt}</figcaption>
          </figure>
          <button className="memory-lightbox__arrow memory-lightbox__arrow--right" type="button" onClick={() => setActive((active + 1) % MEMORIES.length)} aria-label="Следующее изображение">›</button>
        </div>
      )}

      {secretOpen && (
        <div className="memory-secret" role="dialog" aria-modal="true" aria-labelledby="memory-secret-title" onMouseDown={(event) => { if (event.target === event.currentTarget) setSecretOpen(false) }}>
          <div className="memory-secret__card">
            <button className="memory-secret__close" type="button" onClick={() => setSecretOpen(false)} aria-label="Закрыть">×</button>
            <span className="memory-secret__clover" aria-hidden="true">🍀</span>
            <p className="eyebrow">ТЫ НАШЛА СЕКРЕТ</p>
            <h2 id="memory-secret-title" className="display">Для тебя —<br /><em>даже в мелочах</em></h2>
            <p>Этот уголок тоже сделан специально для тебя. 💘</p>
            <button type="button" className="btn btn--primary" onClick={() => setSecretOpen(false)}>Сохранить этот момент</button>
          </div>
        </div>
      )}
    </>
  )
}
