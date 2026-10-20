import { useEffect, useState } from 'react'
import { SITE_URL } from '../config'

/**
 * Клевер-QR. Тяжёлый генератор (qrcode + проверка декодером) подгружается лениво,
 * только когда человек дошёл до финала.
 */
export default function CloverQrView() {
  const [svg, setSvg] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let alive = true
    const timer = window.setTimeout(() => {
      import('../lib/cloverQr')
        .then((m) => {
          if (alive) setSvg(m.buildCloverQr(SITE_URL).svg)
        })
        .catch(() => alive && setFailed(true))
    }, 60)
    return () => {
      alive = false
      window.clearTimeout(timer)
    }
  }, [])

  return (
    <div className="qr qr--clover">
      <div className="qr__glow" aria-hidden="true" />
      <div className="qr__plate">
        {svg ? (
          <div style={{ width: '100%', height: '100%' }} dangerouslySetInnerHTML={{ __html: svg }} />
        ) : failed ? (
          <div className="qr__fallback">
            <a href={SITE_URL} style={{ color: 'inherit' }}>
              {SITE_URL}
            </a>
          </div>
        ) : (
          <div className="qr__loading" aria-hidden="true" />
        )}
      </div>
    </div>
  )
}
