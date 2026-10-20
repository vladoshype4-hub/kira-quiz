import { useEffect, useRef } from 'react'
import type { Question } from '../data/questions'
import type { AnswerState } from '../lib/answers'
import ChoiceAnswer from './answers/ChoiceAnswer'
import ColorAnswer from './answers/ColorAnswer'
import DateAnswer from './answers/DateAnswer'
import ScaleAnswer from './answers/ScaleAnswer'
import TextAnswer from './answers/TextAnswer'
import { AlertIcon } from './icons'

const QUESTION_VISUALS: Record<string, { src: string; kind: 'photo' | 'anime' | 'doodle'; sticker: string }> = {
  flowers: { src: '/images/kira-anime.png', kind: 'anime', sticker: '🍀' },
  drink: { src: '/images/kira-evening.jpg', kind: 'photo', sticker: '💘' },
  food: { src: '/images/kira-cafe.jpg', kind: 'photo', sticker: '💘' },
  music: { src: '/images/chat-doodle-clover.jpg', kind: 'doodle', sticker: '🍀' },
  travel: { src: '/images/kira-outdoor.jpg', kind: 'photo', sticker: '🍀' },
  gift: { src: '/images/chat-doodle-hearts.jpg', kind: 'doodle', sticker: '💘' },
  'perfect-day': { src: '/images/kira-palm.jpg', kind: 'photo', sticker: '💘' },
  memory: { src: '/images/kira-anime.png', kind: 'anime', sticker: '💘' },
  try: { src: '/images/kira-evening.jpg', kind: 'photo', sticker: '🍀' },
  know: { src: '/images/chat-doodle-hearts.jpg', kind: 'doodle', sticker: '💘' },
}

interface Props {
  question: Question
  value: AnswerState | undefined
  onChange: (next: AnswerState) => void
  error: string | null
  direction: 'forward' | 'back'
  leaving: boolean
}

export default function QuestionView({ question: q, value, onChange, error, direction, leaving }: Props) {
  const titleRef = useRef<HTMLHeadingElement>(null)

  // при смене вопроса фокус на заголовок: так экранные дикторы читают новый вопрос
  useEffect(() => {
    titleRef.current?.focus({ preventScroll: true })
  }, [q.id])

  const visual = QUESTION_VISUALS[q.id]

  let answer
  switch (q.type) {
    case 'color':
      answer = <ColorAnswer question={q} value={value} onChange={onChange} />
      break
    case 'text':
      answer = <TextAnswer question={q} value={value} onChange={onChange} />
      break
    case 'date':
      answer = <DateAnswer question={q} value={value} onChange={onChange} />
      break
    case 'scale':
      answer = <ScaleAnswer question={q} value={value} onChange={onChange} />
      break
    default:
      answer = <ChoiceAnswer question={q} value={value} onChange={onChange} />
  }

  return (
    <section
      className={`q${leaving ? ' is-leaving' : ''}`}
      data-dir={direction === 'back' ? 'back' : 'fwd'}
      aria-labelledby={`title-${q.id}`}
    >
      <div className={`q__head${visual ? ' q__head--visual' : ''}`}>
        <div className="q__head-copy">
          <h2 id={`title-${q.id}`} ref={titleRef} tabIndex={-1} className="q__title">
            {q.title}
          </h2>
          {q.hint && <p className="q__hint">{q.hint}</p>}
        </div>
        {visual && (
          <figure className={`q__visual q__visual--${visual.kind}`} aria-hidden="true">
            <img src={visual.src} alt="" loading="lazy" decoding="async" />
            <span>{visual.sticker}</span>
          </figure>
        )}
      </div>
      {answer}
      {error && (
        <p className="q__error" role="alert" key={error}>
          <AlertIcon />
          {error}
        </p>
      )}
    </section>
  )
}
