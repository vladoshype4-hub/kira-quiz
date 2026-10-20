import { useState } from 'react'
import { QUESTIONS } from '../../data/questions'
import { formatDate, formatValue, type SubmissionRow } from '../../lib/export'

interface Props {
  row: SubmissionRow
  onDelete: (row: SubmissionRow) => Promise<void>
}

export default function SubmissionDetail({ row, onDelete }: Props) {
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)

  // порядок как в текущем тесте; незнакомые (из старых версий) добавляем в конец
  const order = new Map(QUESTIONS.map((q, i) => [q.id, i]))
  const sorted = [...row.answers].sort((a, b) => (order.get(a.id) ?? 999) - (order.get(b.id) ?? 999))
  const duration = typeof row.meta?.duration_sec === 'number' ? row.meta.duration_sec : null

  const remove = async () => {
    setBusy(true)
    await onDelete(row)
    setBusy(false)
    setConfirming(false)
  }

  return (
    <article className="panel panel--pad" aria-label="Прохождение теста">
      <div className="admin__bar" style={{ marginBottom: 6 }}>
        <div>
          <h2 className="admin__title" style={{ fontSize: '1.5rem' }}>
            {formatDate(row.created_at)}
          </h2>
          <p className="sub-row__meta" style={{ margin: 0 }}>
            {sorted.length} ответов
            {duration !== null ? ` · заняло ${Math.floor(duration / 60)} мин ${duration % 60} с` : ''}
          </p>
        </div>
        {confirming ? (
          <div className="admin__actions">
            <button type="button" className="btn btn--sm btn--danger" disabled={busy} onClick={remove}>
              {busy ? 'Удаляю…' : 'Да, удалить'}
            </button>
            <button type="button" className="btn btn--sm btn--ghost" disabled={busy} onClick={() => setConfirming(false)}>
              Отмена
            </button>
          </div>
        ) : (
          <button type="button" className="btn btn--sm btn--danger" onClick={() => setConfirming(true)}>
            Удалить
          </button>
        )}
      </div>

      <div>
        {sorted.map((a, i) => {
          const text = formatValue(a.value)
          return (
            <div className="qa" key={a.id}>
              <div className="qa__q">
                <span className="qa__n">{String(i + 1).padStart(2, '0')}</span>
                {a.q}
              </div>
              <div className={`qa__a${text ? '' : ' qa__a--empty'}`}>{text || 'без ответа'}</div>
            </div>
          )
        })}
      </div>
    </article>
  )
}
