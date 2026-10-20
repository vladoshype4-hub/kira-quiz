import type { Question } from '../../data/questions'
import type { AnswerState } from '../../lib/answers'

interface Props {
  question: Question
  value: AnswerState | undefined
  onChange: (next: AnswerState) => void
}

export default function ScaleAnswer({ question: q, value, onChange }: Props) {
  const cfg = q.scale ?? { min: 1, max: 5, minLabel: '', maxLabel: '' }
  const numbers = Array.from({ length: cfg.max - cfg.min + 1 }, (_, i) => cfg.min + i)

  return (
    <div className="scale">
      <div className="scale__row" role="radiogroup" aria-label={q.title}>
        {numbers.map((n) => (
          <button
            key={n}
            type="button"
            className="scale__btn"
            role="radio"
            aria-checked={value?.number === n}
            aria-label={`${n} из ${cfg.max}`}
            onClick={() => onChange({ number: n })}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="scale__legend" aria-hidden="true">
        <span>{cfg.minLabel}</span>
        <span>{cfg.maxLabel}</span>
      </div>
    </div>
  )
}
