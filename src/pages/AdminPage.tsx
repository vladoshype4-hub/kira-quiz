import type { SupabaseClient } from '@supabase/supabase-js'
import { useCallback, useEffect, useState } from 'react'
import Background from '../components/Background'
import AdminLogin from '../components/admin/AdminLogin'
import SubmissionDetail from '../components/admin/SubmissionDetail'
import { exportCsv, exportJson, formatDate, formatValue, type SubmissionRow } from '../lib/export'
import { getSupabase, isSupabaseConfigured } from '../lib/supabase'

type View = 'loading' | 'unconfigured' | 'login' | 'denied' | 'ready'

export default function AdminPage() {
  const [view, setView] = useState<View>('loading')
  const [client, setClient] = useState<SupabaseClient | null>(null)
  const [rows, setRows] = useState<SubmissionRow[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    document.title = 'Kira Quiz — админка'
    const robots = document.createElement('meta')
    robots.name = 'robots'
    robots.content = 'noindex, nofollow'
    document.head.appendChild(robots)
    return () => {
      robots.remove()
      document.title = 'Kira Quiz — немного о тебе 💘'
    }
  }, [])

  const load = useCallback(async (sb: SupabaseClient) => {
    setRefreshing(true)
    setMessage(null)
    const { data, error } = await sb
      .from('submissions')
      .select('id, created_at, answers, meta')
      .order('created_at', { ascending: false })
      .limit(500)
    setRefreshing(false)
    if (error) {
      setMessage('Не получилось загрузить прохождения. Проверь соединение и попробуй обновить.')
      return
    }
    const list = (data ?? []) as SubmissionRow[]
    setRows(list)
    setSelectedId((cur) => (cur && list.some((r) => r.id === cur) ? cur : (list[0]?.id ?? null)))
  }, [])

  /** Проверка, что вошедший пользователь есть в таблице admins. */
  const checkAdmin = useCallback(
    async (sb: SupabaseClient) => {
      const { data, error } = await sb.rpc('is_admin')
      if (error || data !== true) {
        await sb.auth.signOut()
        setView('denied')
        return
      }
      setView('ready')
      await load(sb)
    },
    [load],
  )

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setView('unconfigured')
      return
    }
    let alive = true
    let unsubscribe: (() => void) | undefined
    ;(async () => {
      const sb = await getSupabase()
      if (!sb || !alive) return
      setClient(sb)
      const { data } = await sb.auth.getSession()
      if (!alive) return
      if (data.session) await checkAdmin(sb)
      else setView('login')

      const { data: sub } = sb.auth.onAuthStateChange((event) => {
        if (event === 'SIGNED_OUT') {
          setRows([])
          setView('login')
        }
      })
      unsubscribe = () => sub.subscription.unsubscribe()
    })()
    return () => {
      alive = false
      unsubscribe?.()
    }
  }, [checkAdmin])

  const login = async (email: string, password: string): Promise<string | null> => {
    if (!client) return 'Нет соединения с базой.'
    const { error } = await client.auth.signInWithPassword({ email, password })
    if (error) return 'Неверная почта или пароль.'
    await checkAdmin(client)
    return null
  }

  const logout = async () => {
    await client?.auth.signOut()
    setView('login')
  }

  const remove = async (row: SubmissionRow) => {
    if (!client) return
    const { data, error } = await client.from('submissions').delete().eq('id', row.id).select('id')
    if (error || !data || data.length === 0) {
      setMessage('Не получилось удалить запись. Попробуй ещё раз.')
      return
    }
    setMessage(null)
    setRows((prev) => {
      const next = prev.filter((r) => r.id !== row.id)
      setSelectedId(next[0]?.id ?? null)
      return next
    })
  }

  const selected = rows.find((r) => r.id === selectedId) ?? null

  let body
  if (view === 'loading') {
    body = <p className="empty">Загрузка…</p>
  } else if (view === 'unconfigured') {
    body = (
      <div className="panel panel--pad" style={{ maxWidth: 520, margin: '12vh auto 0' }}>
        <h1 className="admin__title">Админка не подключена</h1>
        <p>
          Не заданы переменные <code>VITE_SUPABASE_URL</code> и <code>VITE_SUPABASE_ANON_KEY</code>. Заполни .env (см.
          README) и перезапусти сайт.
        </p>
      </div>
    )
  } else if (view === 'login') {
    body = <AdminLogin onLogin={login} />
  } else if (view === 'denied') {
    body = (
      <div className="panel panel--pad" style={{ maxWidth: 520, margin: '12vh auto 0' }}>
        <h1 className="admin__title">Нет доступа</h1>
        <p>Этот аккаунт не добавлен в список админов. Добавь его по инструкции из README (таблица admins).</p>
        <button type="button" className="btn btn--sm btn--ghost" onClick={() => setView('login')}>
          Войти другим аккаунтом
        </button>
      </div>
    )
  } else {
    body = (
      <>
        <div className="admin__bar">
          <h1 className="admin__title">
            Прохождения <span style={{ color: 'var(--c-ink-faint)', fontSize: '1.2rem' }}>{rows.length}</span>
          </h1>
          <div className="admin__actions">
            <button
              type="button"
              className="btn btn--sm btn--ghost"
              disabled={refreshing || !client}
              onClick={() => client && load(client)}
            >
              {refreshing ? 'Обновляю…' : 'Обновить'}
            </button>
            <button type="button" className="btn btn--sm btn--ghost" disabled={!rows.length} onClick={() => exportCsv(rows)}>
              Экспорт CSV
            </button>
            <button type="button" className="btn btn--sm btn--ghost" disabled={!rows.length} onClick={() => exportJson(rows)}>
              Экспорт JSON
            </button>
            <button type="button" className="btn btn--sm btn--ghost" onClick={logout}>
              Выйти
            </button>
          </div>
        </div>

        {message && (
          <p className="q__error" role="alert" style={{ marginBottom: 12 }}>
            {message}
          </p>
        )}

        {rows.length === 0 ? (
          <div className="panel">
            <p className="empty">Пока никто не прошёл тест. Как только ответы появятся, они будут здесь.</p>
          </div>
        ) : (
          <div className="admin__grid">
            <div className="panel" role="list" aria-label="Список прохождений">
              {rows.map((r) => {
                const first = r.answers.map((a) => formatValue(a.value)).find(Boolean) ?? ''
                return (
                  <button
                    type="button"
                    key={r.id}
                    role="listitem"
                    className="sub-row"
                    aria-current={r.id === selectedId}
                    onClick={() => setSelectedId(r.id)}
                  >
                    <span className="sub-row__date">{formatDate(r.created_at)}</span>
                    <span className="sub-row__meta">
                      {r.answers.length} ответов · {first}
                    </span>
                  </button>
                )
              })}
            </div>
            {selected && <SubmissionDetail key={selected.id} row={selected} onDelete={remove} />}
          </div>
        )}
      </>
    )
  }

  return (
    <>
      <Background />
      <main className="admin">{body}</main>
    </>
  )
}
