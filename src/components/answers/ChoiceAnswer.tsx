import type { CSSProperties } from 'react'
import type { Option, Question } from '../../data/questions'
import type { AnswerState } from '../../lib/answers'
import { CheckIcon } from '../icons'

interface Props {
  question: Question
  value: AnswerState | undefined
  onChange: (next: AnswerState) => void
}

const OTHER_MAX = 80

/** Список (single / multi) и карточки (cards). Всё в одном компоненте, различаются разметкой. */
export default function ChoiceAnswer({ question: q, value, onChange }: Props) {
  const isMulti = q.type === 'multi' || (q.type === 'cards' && q.multiple === true)
  const isCards = q.type === 'cards'
  const selected = value?.selected ?? []
  const other = value?.other ?? ''
  const options: Option[] = q.options ?? []

  const toggle = (label: string) => {
    if (!isMulti) {
      onChange({ ...value, selected: [label], other: '' })
      return
    }
    if (selected.includes(label)) {
      onChange({ ...value, selected: selected.filter((s) => s !== label) })
      return
    }
    const used = selected.length + (other.trim() ? 1 : 0)
    if (q.max && used >= q.max) return // лимит достигнут: сначала сними что-то
    onChange({ ...value, selected: [...selected, label] })
  }

  const changeOther = (text: string) => {
    if (!isMulti) {
      onChange({ ...value, selected: text.trim() ? [] : selected, other: text })
      return
    }
    // если лимит уже достигнут, а человек начинает писать своё: освобождаем место
    let nextSelected = selected
    if (!other.trim() && text.trim() && q.max && selected.length >= q.max) {
      nextSelected = selected.slice(0, q.max - 1)
    }
    onChange({ ...value, selected: nextSelected, other: text })
  }

  const hasOther = other.trim().length > 0

  return (
    <div
      className={`options${isCards ? ' options--cards' : ''}`}
      role={isMulti ? 'group' : 'radiogroup'}
      aria-label={q.title}
    >
      {options.map((opt) => {
        const on = selected.includes(opt.label)
        const classes = [
          'option',
          isMulti ? 'option--multi' : '',
          isCards ? 'option--card' : '',
          opt.tone ? 'option--tone' : '',
          isCards && q.tall ? 'option--tall' : '',
        ]
          .filter(Boolean)
          .join(' ')
        const style = opt.tone ? ({ '--tone': opt.tone } as CSSProperties) : undefined

        return (
          <button
            key={opt.label}
            type="button"
            className={classes}
            style={style}
            role={isMulti ? undefined : 'radio'}
            aria-checked={isMulti ? undefined : on}
            aria-pressed={isMulti ? on : undefined}
            onClick={() => toggle(opt.label)}
          >
            <span className="option__mark" aria-hidden="true">
              <CheckIcon />
            </span>
            <span className="option__text">
              {opt.label}
              {opt.hint && <span className="option__hint">{opt.hint}</span>}
            </span>
          </button>
        )
      })}

      {q.allowOther && (
        <label className={`other${hasOther ? ' has-value' : ''}`}>
          <span className="sr-only">Свой вариант</span>
          <input
            type="text"
            value={other}
            maxLength={OTHER_MAX}
            placeholder={q.placeholder ?? 'Другое…'}
            autoComplete="off"
            enterKeyHint="done"
            onChange={(e) => changeOther(e.target.value)}
          />
        </label>
      )}
    </div>
  )
}
