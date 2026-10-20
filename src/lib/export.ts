import { QUESTIONS } from '../data/questions'
import type { StoredAnswer, StoredValue } from './answers'

export interface SubmissionRow {
  id: string
  created_at: string
  answers: StoredAnswer[]
  meta: Record<string, unknown> | null
}

export function formatValue(value: StoredValue | undefined): string {
  if (value === null || value === undefined) return ''
  if (Array.isArray(value)) return value.join('; ')
  if (typeof value === 'number') return String(value)
  return value
}

export function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return new Intl.DateTimeFormat('ru-RU', { dateStyle: 'long', timeStyle: 'short' }).format(d)
}

function csvCell(s: string): string {
  return /[",;\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

function download(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

const stamp = () => new Date().toISOString().slice(0, 10)

export function exportJson(rows: SubmissionRow[]) {
  download(`nastya-answers-${stamp()}.json`, JSON.stringify(rows, null, 2), 'application/json')
}

/** CSV с BOM и разделителем «;»: корректно открывается в Excel с кириллицей. */
export function exportCsv(rows: SubmissionRow[]) {
  // колонки: сначала актуальные вопросы, потом всё, что осталось от старых версий теста
  const columns: { id: string; title: string }[] = QUESTIONS.map((q) => ({ id: q.id, title: q.title }))
  const known = new Set(columns.map((c) => c.id))
  for (const row of rows) {
    for (const a of row.answers) {
      if (!known.has(a.id)) {
        known.add(a.id)
        columns.push({ id: a.id, title: a.q })
      }
    }
  }

  const header = ['ID', 'Дата', ...columns.map((c) => c.title)].map(csvCell).join(';')
  const lines = rows.map((row) => {
    const byId = new Map(row.answers.map((a) => [a.id, a]))
    const cells = [row.id, formatDate(row.created_at), ...columns.map((c) => formatValue(byId.get(c.id)?.value))]
    return cells.map(csvCell).join(';')
  })

  download(`nastya-answers-${stamp()}.csv`, '﻿' + [header, ...lines].join('\r\n'), 'text/csv;charset=utf-8')
}
