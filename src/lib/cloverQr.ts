/**
 * QR-код с силуэтом четырёхлистного клевера, который остаётся сканируемым.
 *
 * Принцип: ни один информационный модуль не удаляется (иначе QR перестаёт читаться,
 * клеверный силуэт занимает центральную часть квадрата). Силуэт клевера рисуют:
 *   - модули ВНУТРИ клевера: крупные, насыщенные, фирменный градиент;
 *   - модули СНАРУЖИ: уменьшенные и чуть светлее (но достаточно тёмные для сканеров);
 *   - мягкая розоватая подкладка в форме клевера.
 * Служебные модули (три угловых «глаза», выравнивание, служебные линии) всегда полного размера.
 * Уровень коррекции ошибок: H (30%). Тихая зона: 4 модуля.
 *
 * КАК ЭТО ПРОВЕРЯЕТСЯ: после построения картинка растеризуется (в чистом виде и в «телефонном»
 * размере с размытием) и декодируется библиотекой jsQR. Выбирается самый «клеверный» вариант,
 * который успешно читается. Если ничего, кроме обычного QR, не читается, используется он.
 */
import qrcode from 'qrcode-generator'
import jsQRModule from 'jsqr'

interface QrLike {
  addData(data: string): void
  make(): void
  getModuleCount(): number
  isDark(row: number, col: number): boolean
}
const makeQr = qrcode as unknown as (typeNumber: number, level: string) => QrLike

type Decoder = (
  data: Uint8ClampedArray,
  width: number,
  height: number,
  options?: { inversionAttempts?: string },
) => { data: string } | null
const decode = ((jsQRModule as unknown as { default?: Decoder }).default ?? jsQRModule) as unknown as Decoder

export const QUIET = 4

/** Версии QR, которые пробуем (по порядку). 8 = 49x49 модулей. */
const VERSIONS = [8, 9, 10, 7, 11, 12, 13]
/** Размер «внешних» модулей относительно полного. От наиболее выразительного к более безопасному для сканирования. */
const OUTSIDE_SCALES = [0.58, 0.68, 0.78, 1]

/** Центры шаблонов выравнивания по версиям (стандарт QR). */
const ALIGN: Record<number, number[]> = {
  2: [6, 18], 3: [6, 22], 4: [6, 26], 5: [6, 30], 6: [6, 34],
  7: [6, 22, 38], 8: [6, 24, 42], 9: [6, 26, 46], 10: [6, 28, 50],
  11: [6, 30, 54], 12: [6, 32, 58], 13: [6, 34, 62],
  14: [6, 26, 46, 66], 15: [6, 26, 48, 70],
}

type Tone = 'in' | 'out'
interface Square {
  kind: 'sq'
  x: number
  y: number
  w: number
  r: number
  tone: Tone
}
interface Finder {
  kind: 'finder'
  x: number
  y: number
}
type Shape = Square | Finder

interface Model {
  n: number
  version: number
  outScale: number
  shapes: Shape[]
  clover: [number, number][]
  stem: [number, number][]
}

export interface CloverQr {
  svg: string
  version: number
  outsideScale: number
  /** true, если картинка прошла декодирование. */
  verified: boolean
}

/* ---------- Силуэт четырёхлистного клевера ---------- */

/** Четыре мягких лепестка в радиальной форме; координаты заданы в QR-модулях. */
function cloverPolygon(n: number): [number, number][] {
  const pts: [number, number][] = []
  const cx = n / 2
  const cy = n * 0.43
  const radius = n * 0.385
  for (let i = 0; i < 320; i++) {
    const t = (i / 320) * Math.PI * 2
    const lobe = 0.73 + 0.27 * Math.cos(4 * t)
    pts.push([cx + radius * lobe * Math.cos(t), cy + radius * lobe * Math.sin(t)])
  }
  return pts
}

/** Аккуратный наклонный стебелёк, который визуально завершает форму клевера. */
function cloverStemPolygon(n: number): [number, number][] {
  return [
    [n * 0.49, n * 0.61],
    [n * 0.56, n * 0.58],
    [n * 0.72, n * 0.91],
    [n * 0.64, n * 0.94],
  ]
}

function pointInPolygon(px: number, py: number, poly: [number, number][]): boolean {
  let inside = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i]
    const [xj, yj] = poly[j]
    if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}

/* ---------- Служебные модули ---------- */

function functionMap(n: number, version: number): boolean[][] {
  const f = Array.from({ length: n }, () => new Array<boolean>(n).fill(false))
  const mark = (r0: number, c0: number, h: number, w: number) => {
    for (let r = r0; r < r0 + h; r++) for (let c = c0; c < c0 + w; c++) if (r >= 0 && c >= 0 && r < n && c < n) f[r][c] = true
  }
  mark(0, 0, 9, 9)
  mark(0, n - 8, 9, 8)
  mark(n - 8, 0, 8, 9)
  for (let i = 0; i < n; i++) {
    f[6][i] = true
    f[i][6] = true
  }
  const pos = ALIGN[version] ?? []
  const last = pos.length - 1
  for (let a = 0; a < pos.length; a++) {
    for (let b = 0; b < pos.length; b++) {
      if ((a === 0 && b === 0) || (a === 0 && b === last) || (a === last && b === 0)) continue
      mark(pos[a] - 2, pos[b] - 2, 5, 5)
    }
  }
  if (version >= 7) {
    mark(0, n - 11, 6, 3)
    mark(n - 11, 0, 3, 6)
  }
  return f
}

function inFinder(r: number, c: number, n: number): boolean {
  return (r < 7 && c < 7) || (r < 7 && c >= n - 7) || (r >= n - 7 && c < 7)
}

/* ---------- Построение модели ---------- */

function buildModel(url: string, version: number, outScale: number): Model {
  const qr = makeQr(version, 'H')
  qr.addData(url)
  qr.make()
  const n = qr.getModuleCount()
  const fn = functionMap(n, version)
  const clover = cloverPolygon(n)
  const stem = cloverStemPolygon(n)
  const shapes: Shape[] = [
    { kind: 'finder', x: 0, y: 0 },
    { kind: 'finder', x: n - 7, y: 0 },
    { kind: 'finder', x: 0, y: n - 7 },
  ]

  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (!qr.isDark(r, c) || inFinder(r, c, n)) continue
      if (fn[r][c]) {
        shapes.push({ kind: 'sq', x: c, y: r, w: 1, r: 0.14, tone: 'in' })
      } else if (pointInPolygon(c + 0.5, r + 0.5, clover) || pointInPolygon(c + 0.5, r + 0.5, stem)) {
        shapes.push({ kind: 'sq', x: c, y: r, w: 1, r: 0.3, tone: 'in' })
      } else {
        const w = outScale
        const off = (1 - w) / 2
        shapes.push({ kind: 'sq', x: c + off, y: r + off, w, r: w * 0.3, tone: 'out' })
      }
    }
  }
  return { n, version, outScale, shapes, clover, stem }
}

/* ---------- SVG ---------- */

const f2 = (v: number) => String(Math.round(v * 100) / 100)

function rrPath(x: number, y: number, w: number, r: number): string {
  const s = w - 2 * r
  return (
    `M${f2(x + r)} ${f2(y)}h${f2(s)}a${f2(r)} ${f2(r)} 0 0 1 ${f2(r)} ${f2(r)}` +
    `v${f2(s)}a${f2(r)} ${f2(r)} 0 0 1 ${f2(-r)} ${f2(r)}` +
    `h${f2(-s)}a${f2(r)} ${f2(r)} 0 0 1 ${f2(-r)} ${f2(-r)}` +
    `v${f2(-s)}a${f2(r)} ${f2(r)} 0 0 1 ${f2(r)} ${f2(-r)}z`
  )
}

function toSvg(m: Model): string {
  const { n } = m
  const total = n + QUIET * 2
  let inPath = ''
  let outPath = ''
  let finderPath = ''
  for (const s of m.shapes) {
    if (s.kind === 'finder') {
      finderPath += rrPath(s.x, s.y, 7, 1.7) + rrPath(s.x + 1, s.y + 1, 5, 1.1) + rrPath(s.x + 2, s.y + 2, 3, 0.8)
    } else if (s.tone === 'in') {
      inPath += rrPath(s.x, s.y, s.w, s.r)
    } else {
      outPath += rrPath(s.x, s.y, s.w, s.r)
    }
  }
  const cloverPath = 'M' + m.clover.map(([x, y]) => `${f2(x)} ${f2(y)}`).join('L') + 'Z'
  const stemPath = 'M' + m.stem.map(([x, y]) => `${f2(x)} ${f2(y)}`).join('L') + 'Z'

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-QUIET} ${-QUIET} ${total} ${total}" ` +
    `role="img" aria-label="QR-код в стиле четырёхлистного клевера, ведущий на этот сайт" shape-rendering="geometricPrecision">` +
    `<defs><linearGradient id="cq-g" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="${n}" y2="${n}">` +
    `<stop offset="0" stop-color="#365d3b"/><stop offset="0.55" stop-color="#547a4b"/><stop offset="1" stop-color="#7b9b69"/>` +
    `</linearGradient></defs>` +
    `<rect x="${-QUIET}" y="${-QUIET}" width="${total}" height="${total}" fill="#fffaf8"/>` +
    `<path d="${cloverPath}" fill="#e2edd9"/><path d="${stemPath}" fill="#d2e4c7"/>` +
    `<path d="${outPath}" fill="#806a75"/>` +
    `<path d="${inPath}" fill="url(#cq-g)"/>` +
    `<path d="${finderPath}" fill="url(#cq-g)" fill-rule="evenodd"/>` +
    `</svg>`
  )
}

/* ---------- Растеризация и проверка декодером ---------- */

const GRAY = { plate: 250, inTone: 55, outTone: 100 }

function paintSquare(
  g: Uint8Array,
  size: number,
  S: number,
  x: number,
  y: number,
  w: number,
  r: number,
  value: number,
) {
  const x0 = Math.max(0, Math.floor((x + QUIET) * S))
  const x1 = Math.min(size, Math.ceil((x + QUIET + w) * S))
  const y0 = Math.max(0, Math.floor((y + QUIET) * S))
  const y1 = Math.min(size, Math.ceil((y + QUIET + w) * S))
  const cx = (x + QUIET + w / 2) * S
  const cy = (y + QUIET + w / 2) * S
  const half = (w * S) / 2
  const rr = r * S
  for (let py = y0; py < y1; py++) {
    for (let px = x0; px < x1; px++) {
      const dx = Math.abs(px + 0.5 - cx)
      const dy = Math.abs(py + 0.5 - cy)
      if (dx > half || dy > half) continue
      const qx = dx - (half - rr)
      const qy = dy - (half - rr)
      if (qx > 0 && qy > 0 && qx * qx + qy * qy > rr * rr) continue
      g[py * size + px] = value
    }
  }
}

function rasterize(m: Model, S: number, blur: boolean): { data: Uint8ClampedArray; size: number } {
  const size = (m.n + QUIET * 2) * S
  let g = new Uint8Array(size * size).fill(GRAY.plate)

  for (const s of m.shapes) {
    if (s.kind === 'finder') {
      paintSquare(g, size, S, s.x, s.y, 7, 1.7, GRAY.inTone)
      paintSquare(g, size, S, s.x + 1, s.y + 1, 5, 1.1, GRAY.plate)
      paintSquare(g, size, S, s.x + 2, s.y + 2, 3, 0.8, GRAY.inTone)
    } else {
      paintSquare(g, size, S, s.x, s.y, s.w, s.r, s.tone === 'in' ? GRAY.inTone : GRAY.outTone)
    }
  }

  if (blur) {
    // простое размытие 3x3: имитирует съёмку экрана камерой
    const out = new Uint8Array(g.length)
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        let sum = 0
        let cnt = 0
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const xx = x + dx
            const yy = y + dy
            if (xx >= 0 && yy >= 0 && xx < size && yy < size) {
              sum += g[yy * size + xx]
              cnt++
            }
          }
        }
        out[y * size + x] = sum / cnt
      }
    }
    g = out
  }

  const rgba = new Uint8ClampedArray(size * size * 4)
  for (let i = 0; i < g.length; i++) {
    rgba[i * 4] = g[i]
    rgba[i * 4 + 1] = g[i]
    rgba[i * 4 + 2] = g[i]
    rgba[i * 4 + 3] = 255
  }
  return { data: rgba, size }
}

function decodesTo(m: Model, url: string): boolean {
  for (const [S, blur] of [
    [8, false],
    [4, true],
  ] as const) {
    const { data, size } = rasterize(m, S, blur)
    const result = decode(data, size, size, { inversionAttempts: 'dontInvert' })
    if (!result || result.data !== url) return false
  }
  return true
}

/* ---------- Публичное API ---------- */

export function buildCloverQr(url: string): CloverQr {
  let fallback: Model | null = null

  for (const outScale of OUTSIDE_SCALES) {
    for (const version of VERSIONS) {
      let model: Model
      try {
        model = buildModel(url, version, outScale)
      } catch {
        continue // ссылка не помещается в эту версию, пробуем следующую
      }
      if (!fallback || outScale === 1) fallback = model
      if (decodesTo(model, url)) {
        return { svg: toSvg(model), version, outsideScale: outScale, verified: true }
      }
    }
  }

  // Совсем запасной путь: стандартный QR максимальной надёжности
  const safe = fallback ?? buildModel(url, 15, 1)
  return { svg: toSvg(safe), version: safe.version, outsideScale: safe.outScale, verified: false }
}
