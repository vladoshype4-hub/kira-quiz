# Сайт-подарунок для Кіри 💘

Персональний сайт на основі готового Kira Quiz: екран входу з інтерактивним замком-конюшиною, головна сторінка, тест із наявними питаннями, фінальна сцена з конюшиною та QR-кодом, галерея «Наши моменты» й окрема адмінка.

**Технології:** React 18, TypeScript, Vite, React Router, Supabase. **Хостинг:** Vercel. Інтерфейс сайту залишено російською, як у початковому проєкті.

## 1. Запуск у Windows

Потрібен Node.js версії 18.18 або новіший.

1. Розпакуй архів.
2. Відкрий папку `kira-quiz` у VS Code або PowerShell.
3. Виконай:

```powershell
npm install
npm run dev
```

4. Відкрий адресу, яку Vite покаже в терміналі (зазвичай `http://localhost:5173`).
5. Щоб зупинити сервер, натисни `Ctrl+C`.

Перед запуском можна створити локальний `.env` з прикладу:

```powershell
Copy-Item .env.example .env
```

Без налаштованого Supabase сайт відкриється, але відповіді працюватимуть у демонстраційному локальному режимі й не будуть видимі в адмінці на іншому пристрої.

## 2. Екран входу та важливе обмеження

Перед основним сайтом відвідувач збирає чотирилисту конюшину: можна перетягувати листочки мишкою або пальцем, а також натискати листочок і відповідний паз. Після цього відкривається поле пароля. Пароль: `люблю кіру`.

**Це не справжній захист сайту.** Перевірка пароля виконується у frontend-коді, який завантажується в браузер, тому технічно підготовлений відвідувач може її обійти. Не зберігай за цим екраном конфіденційні дані й не вважай його авторизацією. Для справжнього обмеження доступу потрібна серверна перевірка та серверна сесія (наприклад, через Vercel Function або Supabase Edge Function). Адмінка залишається окремою й використовує Supabase Auth та RLS.

## 3. Де змінювати вміст

| Що змінити | Файл |
|---|---|
| Ім'я, URL сайту та QR | `src/config.ts` |
| Головна сторінка | `src/components/HeroScreen.tsx` |
| Замок, мінігра й пароль | `src/components/EntryGate.tsx` |
| Маршрути та стан входу | `src/App.tsx` |
| Питання та варіанти тесту | `src/data/questions.ts` |
| Логіка тесту й чернетки | `src/pages/QuizPage.tsx`, `src/lib/` |
| Фінальна сцена та клевер | `src/components/FinalScreen.tsx`, `src/components/CloverAnimation.tsx` |
| Галерея «Наши моменты» | `src/pages/MemoriesPage.tsx` |
| Верхня навігація | `src/components/SiteNav.tsx` |
| Візуальна тема та адаптивність | `src/styles/index.css` |
| Фото й аніме-ілюстрація | `public/images/` |
| Таблиці й політики доступу | `supabase/schema.sql` |

Фотографії залишені оригінальними — сайт лише кадрує їх через CSS, змінює масштаб та додає рамки/тіні. Обличчя не генеруються й не ретушуються.

**Про переписку:** у наданому ZIP із матеріалами я знайшов фотографії, аніме-ілюстрацію та два малюнки, але не знайшов реальних скриншотів чату з повідомленнями. Тому я не додавав підроблені репліки: поточна сторінка показує справжні надані фото й малюнки. Коли матимеш скриншоти, поклади їх у `public/images/` і додай нові записи до масиву `MEMORIES` у `src/pages/MemoriesPage.tsx`. Перегляд у великому розмірі та закриття вже реалізовані.

## 4. Підключення Supabase

Якщо потрібне централізоване збереження відповідей:

1. Створи окремий проєкт на [supabase.com](https://supabase.com).
2. У **SQL Editor** виконай весь файл `supabase/schema.sql`.
3. У **Project Settings → API** скопіюй Project URL та anon public key.
4. Заповни `.env`:

```dotenv
VITE_SITE_URL=http://localhost:5173
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_PUBLIC_KEY
```

Не додавай `service_role` key або інші службові секрети в frontend-код чи GitHub. Значення з префіксом `VITE_` потрапляють у браузерну збірку. Публічний anon key може бути в frontend лише за правильно налаштованих політик RLS.

## 5. Налаштування адмінки

1. У Supabase відкрий **Authentication → Users** і створи користувача адміністратора.
2. Вимкни публічну реєстрацію в налаштуваннях Authentication.
3. У SQL Editor додай email користувача до таблиці `admins`:

```sql
insert into public.admins (email) values ('твоя@пошта.com');
```

4. Відкрий `/admin` і ввійди. Перегляд, експорт і видалення проходжень контролюються Supabase Auth та RLS.

## 6. Перевірки перед публікацією

Після встановлення залежностей виконай:

```powershell
npm run lint
npm run build
npm run preview
```

`npm run build` перевіряє TypeScript і створює production-збірку у `dist`. Команда `npm run preview` запускає її для локальної перевірки.

## 7. Завантаження на GitHub

1. Створи **порожній** репозиторій на GitHub (не додавай автоматичний README, щоб не створювати конфлікт).
2. Відкрий PowerShell у корені `kira-quiz` і виконай команди, замінивши адресу репозиторію на свою:

```powershell
git init
git add .
git commit -m "Personal gift site for Kira"
git branch -M main
git remote add origin https://github.com/USERNAME/REPOSITORY.git
git push -u origin main
```

Файл `.gitignore` виключає `.env`, `node_modules` і `dist`. Переконайся, що `.env` не відображається у списку файлів перед `git add .`.

## 8. Публікація на Vercel

1. Увійди на [vercel.com](https://vercel.com), натисни **Add New → Project** і імпортуй GitHub-репозиторій.
2. Для Vite використовуй: **Build Command** `npm run build`, **Output Directory** `dist`, **Install Command** `npm install`.
3. Якщо налаштований Supabase, додай у **Project Settings → Environment Variables** `VITE_SITE_URL`, `VITE_SUPABASE_URL` та `VITE_SUPABASE_ANON_KEY`.
4. Зроби Deploy (або Redeploy після зміни змінних).
5. Перевір головний екран, пряме відкриття `/memories` та `/admin`, проходження тесту й фактичне збереження відповідей. Відскануй QR телефоном після публікації.

Залишено налаштування `noindex`, оскільки сайт персональний. Це лише прохання до пошукових систем, а не засіб захисту чи приватності.
