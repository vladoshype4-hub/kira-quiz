import { useState, type FormEvent } from 'react'

interface Props {
  onLogin: (email: string, password: string) => Promise<string | null>
}

export default function AdminLogin({ onLogin }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (busy) return
    setBusy(true)
    setError(null)
    const message = await onLogin(email.trim(), password)
    if (message) setError(message)
    setBusy(false)
  }

  return (
    <form className="admin-login panel panel--pad" onSubmit={submit}>
      <h1 className="admin__title">Вход</h1>
      <label>
        Почта
        <input
          className="field"
          type="email"
          autoComplete="username"
          inputMode="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>
      <label>
        Пароль
        <input
          className="field"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>
      {error && (
        <p className="q__error" role="alert">
          {error}
        </p>
      )}
      <button type="submit" className="btn btn--primary" disabled={busy}>
        {busy ? 'Входим…' : 'Войти'}
      </button>
    </form>
  )
}
