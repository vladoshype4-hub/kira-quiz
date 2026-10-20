import { useEffect, useRef, useState, type CSSProperties, type PointerEvent, type FormEvent } from 'react'
import Background from './Background'
import { prefersReducedMotion } from '../lib/storage'

interface Props {
  onUnlocked: () => void
}

type PlacementMap = Record<number, number>
type DragState = { piece: number; dx: number; dy: number }
type DragOrigin = { piece: number; x: number; y: number; moved: boolean }

const PIECES = [0, 1, 2, 3]
const PARTICLES = Array.from({ length: 12 }, (_, i) => ({
  left: `${7 + ((i * 37) % 86)}%`,
  top: `${8 + ((i * 23) % 80)}%`,
  delay: `${(i % 6) * -0.7}s`,
  size: `${3 + (i % 3)}px`,
}))

function CloverMark({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="small-clover-gradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#b7d7a5" />
          <stop offset="0.52" stopColor="#78aa6d" />
          <stop offset="1" stopColor="#497d52" />
        </linearGradient>
      </defs>
      <g fill="url(#small-clover-gradient)" stroke="rgba(255,255,255,.82)" strokeWidth="1.1">
        <circle cx="17" cy="16" r="9.5" />
        <circle cx="31" cy="16" r="9.5" />
        <circle cx="17" cy="30" r="9.5" />
        <circle cx="31" cy="30" r="9.5" />
      </g>
      <path d="M24 27 C24 34 27 38 32 42" fill="none" stroke="#608a5b" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M15 11 C18 8 20 10 21 12" fill="none" stroke="rgba(255,255,255,.76)" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M29 11 C32 8 34 10 35 12" fill="none" stroke="rgba(255,255,255,.76)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function CloverLockArt({ placedTargets, isOpen }: { placedTargets: Set<number>; isOpen: boolean }) {
  const leafColors = ['leaf-top', 'leaf-right', 'leaf-bottom', 'leaf-left']
  return (
    <svg className={`gate-lock-art${isOpen ? ' is-open' : ''}`} viewBox="0 0 400 400" role="img" aria-label="Замок в форме четырёхлистного клевера">
      <defs>
        <linearGradient id="lock-leaf-fill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e2f0d5" />
          <stop offset="0.45" stopColor="#a8ce96" />
          <stop offset="1" stopColor="#76a968" />
        </linearGradient>
        <linearGradient id="lock-metal" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fffdf9" />
          <stop offset="0.52" stopColor="#ead8de" />
          <stop offset="1" stopColor="#c99bac" />
        </linearGradient>
        <radialGradient id="lock-glow">
          <stop offset="0" stopColor="#ffd9e7" stopOpacity=".8" />
          <stop offset="1" stopColor="#dcebcf" stopOpacity="0" />
        </radialGradient>
        <filter id="leaf-shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
      </defs>
      <circle cx="200" cy="200" r="178" fill="url(#lock-glow)" opacity={isOpen ? 1 : 0.48} />
      {leafColors.map((name, index) => (
        <g key={name} transform={`rotate(${index * 90} 200 200)`}>
          <path
            className={`gate-lock-art__shadow${placedTargets.has(index) ? ' is-lit' : ''}`}
            d="M200 211 C164 187 130 160 138 126 C145 94 181 94 200 128 C219 94 255 94 262 126 C270 160 236 187 200 211Z"
            fill="#83b878"
            filter="url(#leaf-shadow)"
          />
          <path
            className={`gate-lock-art__leaf${placedTargets.has(index) ? ' is-lit' : ''}`}
            d="M200 211 C164 187 130 160 138 126 C145 94 181 94 200 128 C219 94 255 94 262 126 C270 160 236 187 200 211Z"
            fill="url(#lock-leaf-fill)"
            stroke="#f8fff3"
            strokeWidth="2.2"
          />
          <path
            className="gate-lock-art__vein"
            d="M200 196 C198 164 199 145 200 129"
            fill="none"
            stroke="rgba(255,255,255,.72)"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>
      ))}
      <circle cx="200" cy="205" r="61" fill="#88b47b" opacity=".12" />
      <g className="gate-lock-art__mechanism">
        <path className="gate-lock-art__shackle" d="M174 201 V178 C174 145 226 145 226 178 V201" fill="none" stroke="url(#lock-metal)" strokeWidth="15" strokeLinecap="round" />
        <path d="M178 198 V179 C178 154 222 154 222 179" fill="none" stroke="#fff" strokeOpacity=".88" strokeWidth="2.5" strokeLinecap="round" />
        <rect x="158" y="194" width="84" height="71" rx="21" fill="url(#lock-metal)" stroke="#fff9fb" strokeWidth="2.5" />
        <rect x="164" y="200" width="72" height="58" rx="16" fill="#f9edf0" opacity=".62" />
        <circle cx="200" cy="222" r="8" fill="#8b6977" />
        <path d="M196 228 L193 242 Q200 248 207 242 L204 228Z" fill="#8b6977" />
        <path d="M174 206 C176 202 180 201 184 201" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
      </g>
      <path d="M198 269 C188 284 190 293 200 300 C210 293 212 284 202 269" fill="#c5dda9" opacity=".8" />
      {isOpen && <circle className="gate-lock-art__flash" cx="200" cy="203" r="104" fill="none" stroke="#f0bfd1" strokeWidth="2" />}
    </svg>
  )
}

export default function EntryGate({ onUnlocked }: Props) {
  const [placements, setPlacements] = useState<PlacementMap>({})
  const [selectedPiece, setSelectedPiece] = useState<number | null>(null)
  const [drag, setDrag] = useState<DragState | null>(null)
  const [lockOpen, setLockOpen] = useState(false)
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const [accepted, setAccepted] = useState(false)
  const targetRefs = useRef<Array<HTMLButtonElement | null>>([])
  const dragOrigin = useRef<DragOrigin | null>(null)
  const suppressClick = useRef(false)
  const errorTimer = useRef<number | undefined>(undefined)
  const transitionTimer = useRef<number | undefined>(undefined)

  const filledTargets = new Set(Object.keys(placements).map(Number))
  const placedPieces = new Set(Object.values(placements))
  const isSolved = filledTargets.size === 4

  useEffect(() => {
    if (!isSolved) return
    const delay = prefersReducedMotion() ? 50 : 1050
    const timer = window.setTimeout(() => setLockOpen(true), delay)
    return () => window.clearTimeout(timer)
  }, [isSolved])

  useEffect(() => () => {
    if (errorTimer.current) window.clearTimeout(errorTimer.current)
    if (transitionTimer.current) window.clearTimeout(transitionTimer.current)
  }, [])

  const placePiece = (piece: number, target: number) => {
    if (filledTargets.has(target) || placedPieces.has(piece) || lockOpen) return
    setPlacements((current) => ({ ...current, [target]: piece }))
    setSelectedPiece(null)
    setDrag(null)
    dragOrigin.current = null
  }

  const startDrag = (event: PointerEvent<HTMLButtonElement>, piece: number) => {
    if (placedPieces.has(piece) || lockOpen) return
    event.preventDefault()
    dragOrigin.current = { piece, x: event.clientX, y: event.clientY, moved: false }
    setDrag({ piece, dx: 0, dy: 0 })
    try {
      event.currentTarget.setPointerCapture(event.pointerId)
    } catch {
      // Pointer capture is not supported by a few older embedded browsers.
    }
  }

  const moveDrag = (event: PointerEvent<HTMLButtonElement>, piece: number) => {
    const origin = dragOrigin.current
    if (!origin || origin.piece !== piece) return
    const dx = event.clientX - origin.x
    const dy = event.clientY - origin.y
    if (Math.abs(dx) + Math.abs(dy) > 8) origin.moved = true
    setDrag({ piece, dx, dy })
  }

  const finishDrag = (event: PointerEvent<HTMLButtonElement>, piece: number) => {
    const origin = dragOrigin.current
    if (!origin || origin.piece !== piece) return
    if (origin.moved) {
      suppressClick.current = true
      const targetIndex = targetRefs.current.findIndex((target) => {
        if (!target) return false
        const rect = target.getBoundingClientRect()
        const pad = 16
        return event.clientX >= rect.left - pad && event.clientX <= rect.right + pad && event.clientY >= rect.top - pad && event.clientY <= rect.bottom + pad
      })
      if (targetIndex >= 0) placePiece(piece, targetIndex)
      else setDrag(null)
      window.setTimeout(() => { suppressClick.current = false }, 0)
    } else {
      setDrag(null)
    }
    dragOrigin.current = null
  }

  const handlePieceClick = (piece: number) => {
    if (suppressClick.current) {
      suppressClick.current = false
      return
    }
    if (placedPieces.has(piece) || lockOpen) return
    setSelectedPiece((current) => current === piece ? null : piece)
  }

  const handleTargetClick = (target: number) => {
    if (selectedPiece !== null) placePiece(selectedPiece, target)
  }

  const handlePasswordSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (password.trim() !== 'люблю кіру') {
      setPasswordError(true)
      if (errorTimer.current) window.clearTimeout(errorTimer.current)
      errorTimer.current = window.setTimeout(() => setPasswordError(false), 650)
      return
    }
    setPasswordError(false)
    setAccepted(true)
    setLeaving(true)
    transitionTimer.current = window.setTimeout(onUnlocked, prefersReducedMotion() ? 30 : 1250)
  }

  return (
    <div className={`entry-gate${leaving ? ' is-leaving' : ''}`}>
      <Background />
      <main className="gate-screen">
        <div className="gate-card">
          <header className="gate-brand">
            <div className="gate-brand__mark"><CloverMark /></div>
            <div>
              <span className="gate-brand__eyebrow">ЛИЧНОЕ ПРОСТРАНСТВО</span>
              <p>для Киры <span aria-hidden="true">·</span> с теплом 💘</p>
            </div>
            <span className="gate-brand__seal">№ 01</span>
          </header>

          <section className="gate-intro" aria-labelledby="gate-title">
            <p className="gate-kicker">маленькое приключение начинается здесь</p>
            <h1 className="gate-title" id="gate-title">У этого места<br /><em>есть свой ключ</em></h1>
            <p className="gate-description">Собери клевер, чтобы открыть замок.</p>
          </section>

          <div className={`lock-composition${lockOpen ? ' is-open' : ''}`}>
            <div className="lock-aura" aria-hidden="true" />
            <div className="lock-sparkles" aria-hidden="true">
              {PARTICLES.map((particle, i) => (
                <span key={i} style={{ '--left': particle.left, '--top': particle.top, '--delay': particle.delay, '--size': particle.size } as CSSProperties} />
              ))}
            </div>
            <div className="lock-arena" aria-label="Мини-игра: собери четырёхлистный клевер">
              <div className="lock-board">
                <CloverLockArt placedTargets={filledTargets} isOpen={lockOpen} />
                {PIECES.map((target) => (
                  <button
                    type="button"
                    key={`target-${target}`}
                    ref={(node) => { targetRefs.current[target] = node }}
                    className={`lock-target${filledTargets.has(target) ? ' is-filled' : ''}${selectedPiece !== null && !filledTargets.has(target) ? ' is-suggested' : ''}`}
                    style={{ '--target-index': target } as CSSProperties}
                    aria-label={`Паз ${target + 1}${filledTargets.has(target) ? ', уже заполнен' : ', положить сюда клевер'}`}
                    aria-pressed={filledTargets.has(target)}
                    disabled={filledTargets.has(target) || lockOpen}
                    onClick={() => handleTargetClick(target)}
                  >
                    {filledTargets.has(target) ? <CloverMark className="lock-target__clover" /> : <span className="lock-target__dot" />}
                  </button>
                ))}
              </div>
              {!lockOpen && (
                <div className="clover-tray" aria-label="Конюшинки для замка">
                  {PIECES.map((piece) => (
                    <button
                      type="button"
                      key={piece}
                      className={`clover-piece${selectedPiece === piece ? ' is-selected' : ''}${drag?.piece === piece ? ' is-dragging' : ''}${placedPieces.has(piece) ? ' is-placed' : ''}`}
                      style={drag?.piece === piece ? { transform: `translate(${drag.dx}px, ${drag.dy}px) scale(1.08)` } : undefined}
                      aria-label={`Конюшинка ${piece + 1}${placedPieces.has(piece) ? ', размещена' : selectedPiece === piece ? ', выбрана' : ', выбрать или перетащить'}`}
                      aria-pressed={selectedPiece === piece}
                      disabled={placedPieces.has(piece)}
                      onPointerDown={(event) => startDrag(event, piece)}
                      onPointerMove={(event) => moveDrag(event, piece)}
                      onPointerUp={(event) => finishDrag(event, piece)}
                      onPointerCancel={() => { setDrag(null); dragOrigin.current = null }}
                      onClick={() => handlePieceClick(piece)}
                    >
                      <CloverMark className="clover-piece__art" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="gate-progress" aria-live="polite" aria-atomic="true">
            {lockOpen ? (
              <p className="gate-progress__success"><span aria-hidden="true">✦</span> Замок открылся. Остался один маленький шаг.</p>
            ) : (
              <>
                <div className="gate-progress__count"><span>Клевер собран</span><b>{filledTargets.size} <i>/ 4</i></b></div>
                <div className="gate-progress__track" role="progressbar" aria-label="Собрано листочков клевера" aria-valuemin={0} aria-valuemax={4} aria-valuenow={filledTargets.size}>
                  <span style={{ width: `${filledTargets.size * 25}%` }} />
                </div>
                <p className="gate-progress__hint">Перетащи листочки на светящиеся места или нажми на листочек, а затем на паз.</p>
              </>
            )}
          </div>

          {lockOpen && (
            <form className={`gate-password${passwordError ? ' is-error' : ''}${accepted ? ' is-accepted' : ''}`} onSubmit={handlePasswordSubmit}>
              <label htmlFor="entry-password">Секретное слово</label>
              <div className="gate-password__field-wrap">
                <input
                  id="entry-password"
                  className="gate-password__input"
                  type="password"
                  value={password}
                  onChange={(event) => { setPassword(event.target.value); setPasswordError(false) }}
                  placeholder="Введи пароль…"
                  autoComplete="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  aria-describedby={passwordError ? 'entry-password-error' : undefined}
                  aria-invalid={passwordError}
                  autoFocus
                />
                <button type="submit" className="gate-password__submit" disabled={accepted}>
                  {accepted ? 'Открываем…' : 'Открыть'} <span aria-hidden="true">↗</span>
                </button>
              </div>
              {passwordError && <p className="gate-password__error" id="entry-password-error" role="alert">Пока не получилось. Попробуй ещё раз 💗</p>}
              {accepted && <p className="gate-password__welcome" role="status">Для тебя — с любовью к деталям.</p>}
            </form>
          )}

          <footer className="gate-footer"><span /> Сделано с теплом, для одного человека <span /></footer>
        </div>
      </main>
    </div>
  )
}
