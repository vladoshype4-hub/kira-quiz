import { PHOTO_URL } from '../config'
import { useImageStatus } from '../hooks/useImageStatus'
import { HeartLineIcon } from './icons'

/**
 * Главный визуальный объект: портрет Киры в мягкой фоторамке.
 * Если фото не загрузится, показывается мягкая заглушка.
 */
export default function PhotoArch() {
  const status = useImageStatus(PHOTO_URL)

  return (
    <div className="arch" aria-hidden="true">
      <div className="arch__aura" />
      <div className="arch__ring" />
      <div className="arch__frame">
        {status === 'ok' ? (
          <>
            <img className="arch__img is-loaded" src={PHOTO_URL} alt="" decoding="async" />
            <div className="arch__shade" />
          </>
        ) : (
          <div className="arch__fallback">
            <HeartLineIcon />
          </div>
        )}
      </div>
      <div className="arch__memory" aria-hidden="true">
        <img src="/images/chat-doodle-clover.jpg" alt="" loading="lazy" decoding="async" />
        <span>💘</span>
      </div>
    </div>
  )
}
