/**
 * ВСЕ ВОПРОСЫ ТЕСТА. Меняй, добавляй и удаляй прямо здесь.
 *
 * Типы вопросов:
 *  - 'single'  один вариант (списком)
 *  - 'multi'   несколько вариантов (списком), можно ограничить через max
 *  - 'cards'   крупные карточки (multiple: true, если можно выбрать несколько)
 *  - 'color'   выбор цвета
 *  - 'text'    свободный ответ
 *  - 'date'    дата
 *  - 'scale'   шкала
 *
 * Важно: id каждого вопроса должен быть уникальным и не меняться
 * после того, как ты начал собирать ответы (так админка и экспорт не путаются).
 */

export type QuestionType = 'single' | 'multi' | 'cards' | 'color' | 'text' | 'date' | 'scale'

export interface Option {
  label: string
  /** Маленькая подпись под вариантом */
  hint?: string
  /** CSS-цвет или градиент (для 'color' и визуальных карточек) */
  tone?: string
}

export interface Question {
  id: string
  type: QuestionType
  title: string
  /** Тихая подсказка под вопросом */
  hint?: string
  options?: Option[]
  /** Для 'cards': можно ли выбрать несколько */
  multiple?: boolean
  /** Максимум выбранных вариантов (для multi / cards multiple) */
  max?: number
  /** Показать поле «Другое…» */
  allowOther?: boolean
  placeholder?: string
  /** Если true, можно пропустить без ответа */
  optional?: boolean
  /** Для 'text': высокий многострочный ввод */
  long?: boolean
  /** Для 'scale' */
  scale?: { min: number; max: number; minLabel: string; maxLabel: string }
  /** Для визуальных карточек: сделать их выше */
  tall?: boolean
}

const o = (...labels: string[]): Option[] => labels.map((label) => ({ label }))

export const QUESTIONS: Question[] = [
  {
    id: 'flowers',
    type: 'cards',
    multiple: true,
    max: 3,
    title: 'Какие цветы у тебя прям вызывают «вау»?',
    hint: 'Можно выбрать до трёх',
    options: [
      { label: 'Розы', tone: 'linear-gradient(135deg,#efb5c9,#ce7c9c)' },
      { label: 'Пионы', tone: 'linear-gradient(135deg,#f5d4df,#d89ab3)' },
      { label: 'Тюльпаны', tone: 'linear-gradient(135deg,#ebbdcf,#c7b8df)' },
      { label: 'Ромашки', tone: 'linear-gradient(135deg,#fff8f7,#d8cde8)' },
      { label: 'Орхидеи', tone: 'linear-gradient(135deg,#d8cde8,#a99ac6)' },
      { label: 'Лаванда', tone: 'linear-gradient(135deg,#d8cde8,#8e7aab)' },
    ],
    allowOther: true,
    placeholder: 'Другие цветы…',
  },
  {
    id: 'color',
    type: 'color',
    title: 'Какой цвет тебе больше всего по вайбу?',
    hint: 'Выбирай тот, к которому чаще всего тянешься',
    options: [
      { label: 'Чёрный', tone: '#14100f' },
      { label: 'Белый', tone: '#f4efec' },
      { label: 'Бордовый', tone: '#6e1a38' },
      { label: 'Розовый', tone: '#e48fb0' },
      { label: 'Сиреневый', tone: '#b9a7ea' },
      { label: 'Фиолетовый', tone: '#6b4bb0' },
      { label: 'Синий', tone: '#3a5bb5' },
      { label: 'Голубой', tone: '#8ec5e8' },
      { label: 'Зелёный', tone: '#3f8a6a' },
      { label: 'Бежевый', tone: '#d8bfa4' },
      { label: 'Красный', tone: '#c4283f' },
      { label: 'Жёлтый', tone: '#e8c35a' },
    ],
  },
  {
    id: 'drink',
    type: 'single',
    title: 'Что бы ты выбрала попить почти в любой день?',
    options: o('Кофе', 'Матча', 'Чай', 'Какао', 'Лимонад', 'Просто вода'),
    allowOther: true,
    placeholder: 'Что-то другое…',
  },
  {
    id: 'food',
    type: 'cards',
    multiple: true,
    max: 3,
    title: 'Какой еды тебе почти всегда хочется?',
    hint: 'До трёх вариантов',
    options: o('Паста', 'Суши', 'Пицца', 'Бургеры', 'Что-то домашнее', 'Сладкое'),
    allowOther: true,
    placeholder: 'Своё…',
  },
  {
    id: 'rewatch',
    type: 'text',
    title: 'Что ты можешь пересматривать хоть сто раз?',
    placeholder: 'Пиши сколько хочешь',
  },
  {
    id: 'music',
    type: 'multi',
    max: 4,
    title: 'Что у тебя чаще всего играет в наушниках?',
    hint: 'До четырёх жанров',
    options: o('Поп', 'Рэп', 'Рок', 'Инди', 'R&B', 'Электроника', 'Классика'),
    allowOther: true,
    placeholder: 'Другое…',
  },
  {
    id: 'song',
    type: 'text',
    title: 'Есть трек, который сейчас моментально поднимает тебе настроение?',
    placeholder: 'Название и исполнитель',
  },
  {
    id: 'season',
    type: 'cards',
    tall: true,
    title: 'Какое время года тебе больше всего по вайбу?',
    options: [
      { label: 'Зима', hint: 'снег и уют', tone: 'linear-gradient(160deg,#e4e6f5,#aab8ce)' },
      { label: 'Весна', hint: 'всё оживает', tone: 'linear-gradient(160deg,#f7dbe4,#d6a2bd)' },
      { label: 'Лето', hint: 'тепло и свобода', tone: 'linear-gradient(160deg,#f7e2ad,#db9a8c)' },
      { label: 'Осень', hint: 'плед и дожди', tone: 'linear-gradient(160deg,#f0d1ba,#be8a7e)' },
    ],
  },
  {
    id: 'travel',
    type: 'text',
    title: 'Куда тебе прям хочется однажды выбраться?',
    placeholder: 'Страна, город или просто место мечты',
  },
  {
    id: 'scent',
    type: 'single',
    title: 'Какие запахи тебе нравятся больше всего?',
    options: o('Ваниль', 'Цитрусы', 'Свежий, морской', 'Цветочный', 'Древесный', 'Кофе', 'Свежая выпечка'),
    allowOther: true,
    placeholder: 'Другой аромат…',
  },
  {
    id: 'animal',
    type: 'single',
    title: 'Кто у тебя фаворит из животных?',
    options: o('Кошки', 'Собаки', 'Лисы', 'Панды', 'Кролики', 'Лошади'),
    allowOther: true,
    placeholder: 'Другое…',
  },
  {
    id: 'free-time',
    type: 'multi',
    max: 4,
    title: 'Чем любишь заниматься, когда время полностью твоё?',
    hint: 'До четырёх вариантов',
    options: o(
      'Смотреть фильмы',
      'Гулять',
      'Спать',
      'Гулять по магазинам',
      'Готовить',
      'Слушать музыку',
      'Читать',
      'Играть',
      'Рисовать или творить',
      'Встречаться с друзьями',
    ),
    allowOther: true,
    placeholder: 'Другое…',
  },
  {
    id: 'gift',
    type: 'cards',
    multiple: true,
    max: 2,
    title: 'Какой подарок тебя бы реально порадовал?',
    hint: 'Можно выбрать два',
    options: [
      { label: 'Что-то сделанное руками', hint: 'с душой' },
      { label: 'Впечатления', hint: 'поездка, концерт' },
      { label: 'Украшение' },
      { label: 'Книга' },
      { label: 'Что-то для уюта' },
      { label: 'Что-то из техники' },
    ],
    allowOther: true,
    placeholder: 'Другая идея…',
  },
  {
    id: 'mood',
    type: 'multi',
    max: 3,
    title: 'Что может быстро вернуть тебе хорошее настроение?',
    hint: 'До трёх вариантов',
    options: o('Что-то сладкое', 'Музыка', 'Прогулка', 'Объятия', 'Смешные видео', 'Кофе', 'Покупки', 'Хороший сон'),
    allowOther: true,
    placeholder: 'Своё…',
  },
  {
    id: 'annoy',
    type: 'text',
    title: 'Что тебя моментально бесит? Можно честно',
    placeholder: 'Можно честно',
  },
  {
    id: 'perfect-day',
    type: 'text',
    long: true,
    title: 'Как выглядит твой день мечты?',
    hint: 'Прям от пробуждения и до вечера',
    placeholder: 'Опиши как можно подробнее…',
  },
  {
    id: 'values',
    type: 'multi',
    max: 3,
    title: 'Что в людях для тебя прям важно?',
    hint: 'Выбери до трёх качеств',
    options: o('Честность', 'Юмор', 'Заботу', 'Ум', 'Надёжность', 'Доброту', 'Спокойствие', 'Искренность'),
    allowOther: true,
    placeholder: 'Другое…',
  },
  {
    id: 'owl',
    type: 'scale',
    title: 'Ты больше жаворонок или сова?',
    scale: { min: 1, max: 5, minLabel: 'Жаворонок', maxLabel: 'Сова' },
  },
  {
    id: 'date',
    type: 'date',
    optional: true,
    title: 'Какой день ты бы с кайфом прожила ещё раз?',
    hint: 'Необязательно, можно пропустить',
  },
  {
    id: 'memory',
    type: 'text',
    long: true,
    title: 'Какое воспоминание у тебя вызывает улыбку?',
    placeholder: 'Расскажи, если захочется…',
  },
  {
    id: 'try',
    type: 'text',
    long: true,
    title: 'Что тебе давно хотелось попробовать?',
    placeholder: 'Любые мечты и безумные идеи подходят',
  },
  {
    id: 'know',
    type: 'text',
    long: true,
    title: 'Что мне о тебе ещё стоит узнать?',
    placeholder: 'Последний, обещаю :) Пиши всё, что хочется…',
  },
]
