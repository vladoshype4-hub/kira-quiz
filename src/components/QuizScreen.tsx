import type { Question } from '../data/questions'
import type { AnswerState } from '../lib/answers'
import { SUBMIT_MESSAGES, type SubmitFailure } from '../lib/submit'
import QuestionView from './QuestionView'
import { ArrowLeftIcon, ArrowRightIcon } from './icons'
import { Link } from 'react-router-dom'

export type SubmitState =
  | { status: 'idle' }
  | { status: 'sending'; slow: boolean }
  | { status: 'error'; kind: SubmitFailure }

interface Props {
  index: number
  total: number
  question: Question
  value: AnswerState | undefined
  onChange: (next: AnswerState) => void
  error: string | null
  direction: 'forward' | 'back'
  leaving: boolean
  submit: SubmitState
  onBack: () => void
  onNext: () => void
}

export default function QuizScreen(props: Props) {
  const { index, total, question, value, onChange, error, direction, leaving, submit, onBack, onNext } = props
  const isLast = index === total - 1
  const percent = Math.round(((index + 1) / total) * 100)
  const pad = (n: number) => String(n).padStart(2, '0')
  const sending = submit.status === 'sending'

  let nextLabel = isLast ? 'Отправить' : 'Далее'
  if (submit.status === 'error') nextLabel = 'Попробовать ещё раз'
  if (sending) nextLabel = 'Отправляю…'

  return (
    <main className="screen">
      <div className="quiz">
        <header className="quiz__top">
          <div className="quiz__meta">
            <span className="quiz__counter" aria-label={`Вопрос ${index + 1} из ${total}`}>
              <b>{pad(index + 1)}</b> / {pad(total)}
            </span>
            <span className="quiz__percent" aria-hidden="true">
              {percent}%
            </span>
          </div>
          <div
            className="progress"
            role="progressbar"
            aria-label="Прогресс теста"
            aria-valuemin={0}
            aria-valuemax={total}
            aria-valuenow={index + 1}
          >
            <div className="progress__fill" style={{ width: `${percent}%` }} />
          </div>
          <Link className="quiz__memories-link" to="/memories">Наши моменты <span aria-hidden="true">↗</span></Link>
        </header>

        <div className="quiz__body">
          <QuestionView
            key={question.id}
            question={question}
            value={value}
            onChange={onChange}
            error={error}
            direction={direction}
            leaving={leaving}
          />

          {submit.status === 'error' && (
            <div className="notice" role="alert" style={{ marginTop: 22 }}>
              <p>
                <strong>{SUBMIT_MESSAGES[submit.kind].title}</strong>
              </p>
              <p>{SUBMIT_MESSAGES[submit.kind].text}</p>
            </div>
          )}
        </div>

        <nav className="quiz__nav" aria-label="Навигация по тесту">
          <button type="button" className="btn btn--ghost" onClick={onBack} disabled={sending} aria-label="Назад">
            <ArrowLeftIcon />
            Назад
          </button>
          <button type="button" className="btn btn--primary" onClick={onNext} disabled={sending}>
            {sending ? <span className="spinner" aria-hidden="true" /> : null}
            {nextLabel}
            {!sending && submit.status !== 'error' && !isLast ? <ArrowRightIcon /> : null}
          </button>
          {sending && submit.slow && (
            <p className="quiz__nav-status" role="status">
              Связь медленная, ещё секунду…
            </p>
          )}
        </nav>
      </div>
    </main>
  )
}
