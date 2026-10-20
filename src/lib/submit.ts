import { DEMO_KEY } from '../config'
import type { StoredAnswer } from './answers'
import { readJson, writeJson } from './storage'
import { getSupabase } from './supabase'

export interface SubmissionPayload {
  id: string
  answers: StoredAnswer[]
  meta: { duration_sec: number; viewport: string }
}

export type SubmitFailure = 'offline' | 'timeout' | 'config' | 'server'
export type SubmitResult = { ok: true } | { ok: false; kind: SubmitFailure }

const TIMEOUT_MS = 20000

export const SUBMIT_MESSAGES: Record<SubmitFailure, { title: string; text: string }> = {
  offline: {
    title: 'Нет соединения с интернетом',
    text: 'Ответы никуда не пропали. Проверь связь и нажми «Попробовать ещё раз».',
  },
  timeout: {
    title: 'Связь слишком медленная',
    text: 'Не дождались ответа от сервера. Ответы сохранены на экране, попробуй ещё раз.',
  },
  config: {
    title: 'Сайт пока не подключён к базе',
    text: 'Это не твоя вина. Скажи мне, и я быстро всё исправлю. Ответы пока сохранены.',
  },
  server: {
    title: 'Не получилось отправить',
    text: 'Что-то пошло не так на нашей стороне. Ответы сохранены, попробуй ещё раз.',
  },
}

/** Отправка в Supabase. Повторная отправка с тем же id безопасна (дубликаты не создаются). */
export async function submitSubmission(payload: SubmissionPayload): Promise<SubmitResult> {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return { ok: false, kind: 'offline' }
  }

  let supabase
  try {
    supabase = await getSupabase()
  } catch {
    return { ok: false, kind: 'offline' }
  }

  if (!supabase) {
    if (import.meta.env.DEV) {
      // Локальная разработка без Supabase: складываем «отправку» в localStorage,
      // чтобы можно было пройти весь сценарий до финала.
      console.warn('[dev] Supabase не настроен: ответы сохранены только в localStorage (kq:demo-submissions).')
      const list = readJson<SubmissionPayload[]>(DEMO_KEY) ?? []
      writeJson(DEMO_KEY, [...list.filter((s) => s.id !== payload.id), payload])
      return { ok: true }
    }
    return { ok: false, kind: 'config' }
  }

  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const { error } = await supabase
      .from('submissions')
      .insert({ id: payload.id, answers: payload.answers, meta: payload.meta })
      .abortSignal(controller.signal)

    if (!error) return { ok: true }
    // 23505: запись с таким id уже есть. Значит, прошлая попытка всё-таки дошла.
    if (error.code === '23505') return { ok: true }
    if (controller.signal.aborted) return { ok: false, kind: 'timeout' }
    if (/failed to fetch|network|load failed/i.test(error.message ?? '')) return { ok: false, kind: 'offline' }
    return { ok: false, kind: 'server' }
  } catch {
    if (controller.signal.aborted) return { ok: false, kind: 'timeout' }
    return { ok: false, kind: navigator.onLine === false ? 'offline' : 'server' }
  } finally {
    window.clearTimeout(timer)
  }
}
