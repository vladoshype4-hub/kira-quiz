import { useEffect, useState } from 'react'

export type ImageStatus = 'loading' | 'ok' | 'missing'

/** Проверяет, существует ли картинка. Если файла нет, возвращает 'missing' и ничего не ломается. */
export function useImageStatus(src: string): ImageStatus {
  const [status, setStatus] = useState<ImageStatus>('loading')

  useEffect(() => {
    let alive = true
    setStatus('loading')
    const img = new Image()
    img.onload = () => alive && setStatus('ok')
    img.onerror = () => alive && setStatus('missing')
    img.src = src
    return () => {
      alive = false
      img.onload = null
      img.onerror = null
    }
  }, [src])

  return status
}
