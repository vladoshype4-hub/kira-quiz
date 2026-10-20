import { TEXT_MAX_LENGTH } from '../config'
import type { Question } from '../data/questions'

/** Что хранится в состоянии по каждому вопросу, пока человек отвечает. */
export interface AnswerState {
  selected?: string[]
  other?: string
  text?: string
  number?: number
  date?: string
}
export type AnswerMap = Record<string, AnswerState>

/** Что уходит в базу по каждому вопросу. */
export type StoredValue = string | string[] | number | null
export interface StoredAnswer {
  id: string
  q: string
  type: string
  value: StoredValue
}

const clean = (s: string | undefined) => (s ?? '').trim()

/** Итоговые выбранные значения (варианты + «другое»). */
function pickedList(q: Question, a: AnswerState | undefined): string[] {
  const list = [...(a?.selected ?? [])]
  const other = clean(a?.other)
  if (q.allowOther && other) list.push(other)
  return list
}

export function serializeAnswer(q: Question, a: AnswerState | undefined): StoredValue {
  switch (q.type) {
    case 'single':
    case 'color': {
      const p = pickedList(q, a)
      return p[0] ?? null
    }
    case 'cards': {
      const p = pickedList(q, a)
      if (q.multiple) return p.length ? p : null
      return p[0] ?? null
    }
    case 'multi': {
      const p = pickedList(q, a)
      return p.length ? p : null
    }
    case 'text': {
      const t = clean(a?.text)
      return t || null
    }
    case 'date':
      return a?.date || null
    case 'scale':
      return typeof a?.number === 'number' ? a.number : null
  }
}

export function isAnswered(q: Question, a: AnswerState | undefined): boolean {
  return serializeAnswer(q, a) !== null
}

/** Возвращает понятное сообщение на русском или null, если всё хорошо. */
export function validateAnswer(q: Question, a: AnswerState | undefined): string | null {
  const value = serializeAnswer(q, a)

  if (value === null) {
    if (q.optional) return null
    switch (q.type) {
      case 'text':
        return 'Напиши хотя бы пару слов. Мне правда интересно.'
      case 'date':
        return 'Выбери дату или нажми «Далее» после выбора.'
      case 'scale':
        return 'Выбери цифру на шкале.'
      case 'multi':
        return 'Выбери хотя бы один вариант.'
      case 'cards':
        return q.multiple ? 'Выбери хотя бы один вариант.' : 'Выбери один вариант.'
      default:
        return 'Выбери один вариант.'
    }
  }

  if (q.type === 'text' && typeof value === 'string' && value.length > TEXT_MAX_LENGTH) {
    return `Слишком длинно: максимум ${TEXT_MAX_LENGTH} символов.`
  }
  if (Array.isArray(value) && q.max && value.length > q.max) {
    return `Можно выбрать не больше ${q.max}.`
  }
  if (q.type === 'date' && typeof value === 'string') {
    const t = Date.parse(value)
    if (Number.isNaN(t)) return 'Не получилось понять дату. Выбери её ещё раз.'
    const year = new Date(t).getFullYear()
    if (year < 1980 || year > new Date().getFullYear() + 5) return 'Эта дата выглядит странно. Проверь, пожалуйста.'
  }
  if (q.type === 'scale' && typeof value === 'number' && q.scale) {
    if (value < q.scale.min || value > q.scale.max) return 'Выбери цифру на шкале.'
  }
  return null
}

/** Первый вопрос с ошибкой или null. */
export function firstInvalid(questions: Question[], answers: AnswerMap): { index: number; message: string } | null {
  for (let i = 0; i < questions.length; i++) {
    const message = validateAnswer(questions[i], answers[questions[i].id])
    if (message) return { index: i, message }
  }
  return null
}

export function buildStoredAnswers(questions: Question[], answers: AnswerMap): StoredAnswer[] {
  return questions.map((q) => ({
    id: q.id,
    q: q.title,
    type: q.type,
    value: serializeAnswer(q, answers[q.id]),
  }))
}
