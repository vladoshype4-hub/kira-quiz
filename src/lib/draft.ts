import { DRAFT_KEY } from '../config'
import { QUESTIONS } from '../data/questions'
import type { AnswerMap } from './answers'
import { readJson, removeKey, writeJson } from './storage'

export interface Draft {
  id: string
  startedAt: number
  index: number
  answers: AnswerMap
}

/** Читает черновик и отбрасывает всё, чего больше нет в списке вопросов. */
export function loadDraft(): Draft | null {
  const d = readJson<Draft>(DRAFT_KEY)
  if (!d || typeof d.id !== 'string' || typeof d.answers !== 'object' || d.answers === null) return null
  const ids = new Set(QUESTIONS.map((q) => q.id))
  const answers: AnswerMap = {}
  for (const [key, value] of Object.entries(d.answers)) {
    if (ids.has(key) && value && typeof value === 'object') answers[key] = value
  }
  const index = Math.min(Math.max(Number(d.index) || 0, 0), QUESTIONS.length - 1)
  return { id: d.id, startedAt: Number(d.startedAt) || Date.now(), index, answers }
}

export function saveDraft(draft: Draft): void {
  writeJson(DRAFT_KEY, draft)
}

export function clearDraft(): void {
  removeKey(DRAFT_KEY)
}
