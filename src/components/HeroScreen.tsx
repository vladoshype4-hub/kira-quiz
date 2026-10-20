import type { CSSProperties } from 'react'
import { HER_NAME } from '../config'
import PhotoArch from './PhotoArch'
import SiteNav from './SiteNav'
import { ArrowRightIcon } from './icons'

interface Props {
  hasDraft: boolean
  onStart: () => void
  onContinue: () => void
}

const delay = (value: string) => ({ '--delay': value }) as CSSProperties

export default function HeroScreen({ hasDraft, onStart, onContinue }: Props) {
  return (
    <main className="screen">
      <SiteNav active="home" />
      <div className="hero">
        <PhotoArch />

        <div className="hero__copy">
          <span className="eyebrow rise" style={delay('0.35s')}>
            {HER_NAME}, это для тебя 💘
          </span>

          <h1 className="display hero__title rise" style={delay('0.5s')}>
            Узнать тебя
            <br />
            ещё <em>чуть лучше</em>
          </h1>

          <p className="hero__lead rise" style={delay('0.7s')}>
            Немного вопросов просто о тебе. Тут нет правильных ответов — отвечай, как чувствуешь 💘
          </p>

          <div className="hero__actions rise" style={delay('0.9s')}>
            {hasDraft ? (
              <>
                <button type="button" className="btn btn--primary" onClick={onContinue}>
                  Продолжить
                  <ArrowRightIcon />
                </button>
                <button type="button" className="link-btn" onClick={onStart}>
                  Начать заново
                </button>
              </>
            ) : (
              <button type="button" className="btn btn--primary" onClick={onStart}>
                Начать
                <ArrowRightIcon />
              </button>
            )}
            <p className="hero__note">Твои ответы увижу только я · обещаю 💘</p>
          </div>
        </div>
      </div>
    </main>
  )
}
