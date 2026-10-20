import { TEXT_MAX_LENGTH } from '../../config'
import type { Question } from '../../data/questions'
import type { AnswerState } from '../../lib/answers'

interface Props {
  question: Question
  value: AnswerState | undefined
  onChange: (next: AnswerState) => void
}

export default function TextAnswer({ question: q, value, onChange }: Props) {
  const text = value?.text ?? ''

  return (
    <div>
      <label className="sr-only" htmlFor={`field-${q.id}`}>
        {q.title}
      </label>
      <textarea
        id={`field-${q.id}`}
        className="field"
        rows={q.long ? 6 : 3}
        maxLength={TEXT_MAX_LENGTH}
        value={text}
        placeholder={q.placeholder ?? 'Твой ответ…'}
        autoComplete="off"
        autoCapitalize="sentences"
        spellCheck
        onChange={(e) => onChange({ text: e.target.value })}
      />
      <div className="field-meta" aria-hidden="true">
        {text.length} / {TEXT_MAX_LENGTH}
      </div>
    </div>
  )
}
