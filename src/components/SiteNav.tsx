import { Link } from 'react-router-dom'

type Props = { active: 'home' | 'memories' }

export default function SiteNav({ active }: Props) {
  return (
    <header className="site-nav">
      <Link className="site-nav__brand" to="/" aria-label="На главную">
        <span className="site-nav__clover" aria-hidden="true">🍀</span>
        <span>для Киры<small>ЛИЧНАЯ КОЛЛЕКЦИЯ</small></span>
      </Link>
      <nav className="site-nav__links" aria-label="Основная навигация">
        <Link to="/" aria-current={active === 'home' ? 'page' : undefined} className={active === 'home' ? 'is-active' : ''}>Главная</Link>
        <Link to="/memories" aria-current={active === 'memories' ? 'page' : undefined} className={active === 'memories' ? 'is-active' : ''}>Наши моменты</Link>
      </nav>
    </header>
  )
}
