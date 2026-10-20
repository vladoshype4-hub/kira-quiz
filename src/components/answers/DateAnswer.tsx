import type { Question } from '../../data/questions'
import type { AnswerState } from '../../lib/answers'

interface Props {
  question: Question
  value: AnswerState | undefined
  onChange: (next: AnswerState) => void
}

const pad = (n: number) => String(n).padStart(2, '0')

export default function DateAnswer({ question: q, value, onChange }: Props) {
  const now = new Date()
  const max = `${now.getFullYear() + 5}-12-31`

  return (
    <div>
      <label className="sr-only" htmlFor={`field-${q.id}`}>
        {q.title}
      </label>
      <input
        id={`field-${q.id}`}
        className="field field--date"
        type="date"
        min="1980-01-01"
        max={max}
        value={value?.date ?? ''}
        onChange={(e) => onChange({ date: e.target.value })}
        placeholder={`${pad(now.getDate())}.${pad(now.getMonth() + 1)}.${now.getFullYear()}`}
      />
    </div>
  )
}
