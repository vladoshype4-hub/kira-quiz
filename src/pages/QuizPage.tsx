import { useCallback, useEffect, useRef, useState } from 'react'
import Background from '../components/Background'
import FinalScreen from '../components/FinalScreen'
import HeroScreen from '../components/HeroScreen'
import QuizScreen, { type SubmitState } from '../components/QuizScreen'
import { QUESTIONS } from '../data/questions'
import { firstInvalid, validateAnswer, type AnswerMap, type AnswerState } from '../lib/answers'
import { clearDraft, loadDraft, saveDraft } from '../lib/draft'
import { newId, prefersReducedMotion } from '../lib/storage'

type Stage = 'hero' | 'quiz' | 'done'

const LEAVE_MS = 170

export default function QuizPage() {
  const [saved] = useState(() => {
    const d = loadDraft()
    return d && Object.keys(d.answers).length > 0 ? d : null
  })

  const [stage, setStage] = useState<Stage>('hero')
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<AnswerMap>({})
  const [direction, setDirection] = useState<'forward' | 'back'>('forward')
  const [leaving, setLeaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submit, setSubmit] = useState<SubmitState>({ status: 'idle' })

  const idRef = useRef<string>(newId())
  const startedAtRef = useRef<number>(Date.now())
  const submittingRef = useRef(false)

  useEffect(() => {
    if (stage !== 'quiz') return
    saveDraft({ id: idRef.current, startedAt: startedAtRef.current, index, answers })
  }, [stage, index, answers])

  const start = useCallback(() => {
    clearDraft()
    idRef.current = newId()
    startedAtRef.current = Date.now()
    setAnswers({})
    setIndex(0)
    setError(null)
    setSubmit({ status: 'idle' })
    setDirection('forward')
    setStage('quiz')
  }, [])

  const resume = useCallback(() => {
    if (!saved) return start()
    idRef.current = saved.id
    startedAtRef.current = saved.startedAt
    setAnswers(saved.answers)
    setIndex(saved.index)
    setError(null)
    setSubmit({ status: 'idle' })
    setDirection('forward')
    setStage('quiz')
  }, [saved, start])

  const question = QUESTIONS[index]

  const changeAnswer = (next: AnswerState) => {
    setAnswers((prev) => ({ ...prev, [question.id]: next }))
    if (error) setError(null)

    try {
      let choiceText = ''
      if (typeof next === 'string') {
        choiceText = next
      } else if (Array.isArray(next)) {
        choiceText = next.join(', ')
      } else if (next && typeof next === 'object') {
        choiceText = JSON.stringify(next)
      }

      const newEntry = {
        questionId: question.id,
        step: question.title || `Питання #${index + 1}`,
        choice: choiceText || 'Зроблено вибір',
        timestamp: Date.now(),
      }

      const existingData = localStorage.getItem('kira_all_choices')
      let list = existingData ? JSON.parse(existingData) : []

      const existingIndex = list.findIndex((item: any) => item.questionId === question.id)
      if (existingIndex >= 0) {
        list[existingIndex] = newEntry
      } else {
        list.push(newEntry)
      }

      localStorage.setItem('kira_all_choices', JSON.stringify(list))
    } catch (e) {
      console.error('Помилка збереження історії:', e)
    }
  }

  const moveTo = (target: number, dir: 'forward' | 'back') => {
    setDirection(dir)
    setError(null)
    const apply = () => {
      setIndex(target)
      setLeaving(false)
      document.querySelector('.quiz__body')?.scrollTo({ top: 0 })
    }
    if (prefersReducedMotion()) {
      apply()
    } else {
      setLeaving(true)
      window.setTimeout(apply, LEAVE_MS)
    }
  }

  const sendAll = async () => {
    if (submittingRef.current) return

    const bad = firstInvalid(QUESTIONS, answers)
    if (bad) {
      if (bad.index !== index) moveTo(bad.index, bad.index < index ? 'back' : 'forward')
      window.setTimeout(() => setError(bad.message), bad.index !== index ? LEAVE_MS + 30 : 0)
      return
    }

    submittingRef.current = true
    setSubmit({ status: 'sending', slow: false })

    // Робимо відправку в Telegram, але гарантовано переходимо на фінал у будь-якому разі!
    try {
      let messageText = "🎁 *Нові результати квізу від Кіри!*\n\n";
      
      QUESTIONS.forEach((q, idx) => {
        const ans = answers[q.id];
        let choiceStr = "Немає відповіді";
        if (typeof ans === 'string') choiceStr = ans;
        else if (Array.isArray(ans)) choiceStr = ans.join(', ');
        else if (ans && typeof ans === 'object') choiceStr = JSON.stringify(ans);

        messageText += `*${idx + 1}. ${q.title || 'Питання'}*\n👉 ${choiceStr}\n\n`;
      });

      // Використовуємо таймаут, щоб запит не зависав на айфоні вічно
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      await fetch(`https://api.telegram.org/bot8835662867:AAG2-WML9bmORCnTiMVi0r0jggV6meY7gw/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: '5531241623',
          text: messageText,
          parse_mode: 'Markdown'
        }),
        signal: controller.signal
      }).catch(() => {}); // Ігноруємо помилку мережі/таймауту
      
      clearTimeout(timeoutId);
    } catch (e) {
      console.error('Telegram notification skipped/failed:', e);
    } finally {
      // ЗАВЖДИ відкриваємо фінальний екран з клевером, що б не сталося з інтернетом!
      submittingRef.current = false
      clearDraft()
      setSubmit({ status: 'idle' })
      setStage('done')
      window.scrollTo({ top: 0 })
    }
  }

  const next = () => {
    if (leaving) return
    const message = validateAnswer(question, answers[question.id])
    if (message) {
      setError(message)
      return
    }
    if (index === QUESTIONS.length - 1) {
      void sendAll()
    } else {
      moveTo(index + 1, 'forward')
    }
  }

  const back = () => {
    if (leaving) return
    if (index === 0) {
      setStage('hero')
      return
    }
    moveTo(index - 1, 'back')
  }

  return (
    <>
      <Background />
      {stage === 'hero' && <HeroScreen hasDraft={saved !== null} onStart={start} onContinue={resume} />}
      {stage === 'quiz' && (
        <QuizScreen
          index={index}
          total={QUESTIONS.length}
          question={question}
          value={answers[question.id]}
          onChange={changeAnswer}
          error={error}
          direction={direction}
          leaving={leaving}
          submit={submit}
          onBack={back}
          onNext={next}
        />
      )}
      {stage === 'done' && <FinalScreen />}
    </>
  )
}