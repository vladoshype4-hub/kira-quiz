import type { CSSProperties } from 'react'
import type { Question } from '../../data/questions'
import type { AnswerState } from '../../lib/answers'

interface Props {
  question: Question
  value: AnswerState | undefined
  onChange: (next: AnswerState) => void
}

export default function ColorAnswer({ question: q, value, onChange }: Props) {
  const current = value?.selected?.[0]

  return (
    <div className="swatches" role="radiogroup" aria-label={q.title}>
      {(q.options ?? []).map((opt) => (
        <button
          key={opt.label}
          type="button"
          className="swatch"
          role="radio"
          aria-checked={current === opt.label}
          aria-label={opt.label}
          onClick={() => onChange({ selected: [opt.label], other: '' })}
        >
          <span className="swatch__dot" style={{ '--tone': opt.tone ?? '#888' } as CSSProperties} />
          <span>{opt.label}</span>
        </button>
      ))}
    </div>
  )
}
