/**
 * Главная конфигурация сайта. Здесь меняется вся персонализация Kira Quiz.
 */

/** Как зовут её в тексте (используется один раз, на стартовом экране). */
export const HER_NAME = 'Кира'

/** Фото: просто замени файл public/images/kira-hero.jpg. Если файла нет, сайт покажет красивую заглушку. */
export const PHOTO_URL = '/images/kira-hero.jpg'

/**
 * Адрес, который зашит в QR-код в стиле клевера.
 * Задаётся переменной VITE_SITE_URL (файл .env или настройки Vercel).
 * Если переменная пустая, берётся адрес, с которого открыт сайт.
 */
const envUrl = import.meta.env.VITE_SITE_URL?.trim()
export const SITE_URL: string =
  envUrl || (typeof window !== 'undefined' ? window.location.origin : 'https://example.com')

/** Максимальная длина свободного текстового ответа. */
export const TEXT_MAX_LENGTH = 600

/** Ключи локального хранилища (только для черновика прогресса). */
export const DRAFT_KEY = 'kq:draft:v1'
export const DEMO_KEY = 'kq:demo-submissions'
