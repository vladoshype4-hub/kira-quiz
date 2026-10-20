import type { SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL?.trim()
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()

/** true, если переменные окружения Supabase заполнены. */
export const isSupabaseConfigured = Boolean(url && anonKey)

let clientPromise: Promise<SupabaseClient | null> | null = null

/**
 * Клиент подгружается лениво: на стартовом экране библиотека Supabase не качается.
 * Используется ТОЛЬКО публичный anon-ключ. Доступ защищён правилами RLS (см. supabase/schema.sql).
 */
export function getSupabase(): Promise<SupabaseClient | null> {
  if (!isSupabaseConfigured) return Promise.resolve(null)
  if (!clientPromise) {
    clientPromise = import('@supabase/supabase-js').then(({ createClient }) =>
      createClient(url as string, anonKey as string, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
      }),
    )
  }
  return clientPromise
}
