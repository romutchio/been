# been

Веб-приложение для отметки посещённых стран на схематичной choropleth-карте мира.

## Возможности

- Интерактивная карта мира (посещено / wishlist)
- Счётчик и процент посещённых стран
- Таймлайн поездок с городами
- Список «хочу посетить»
- Друзья и сравнение карт

## Стек

- Next.js 16, React 19, Tailwind CSS 4
- Supabase (PostgreSQL + RLS) — **без Supabase Auth и без email**
- Собственный вход: логин + пароль, JWT-сессия
- d3-geo + TopoJSON (world-atlas)

## Настройка Supabase

1. Создай проект на [supabase.com](https://supabase.com)
2. В **SQL Editor** выполни миграции по порядку:
   - `001_initial.sql`
   - `002_trip_cities.sql`
   - `003_username_auth.sql`
   - `004_custom_auth.sql`
3. **Authentication** в Dashboard можно не трогать — приложение не использует Supabase Auth
4. Скопируй в `.env.local`:

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

SUPABASE_SERVICE_ROLE_KEY=eyJ...   # API → service_role (secret)
SUPABASE_JWT_SECRET=your-jwt-secret # API → JWT Secret
```

5. `npm install && npm run dev` → http://localhost:3000

## Авторизация

- Только **логин** и **пароль** — почты нет ни для пользователя, ни внутри
- Пароль хранится как bcrypt-хеш в `account_credentials`
- Сессия — JWT в cookie (`been_session`), для RLS работает `auth.uid()`

## Деплой

GitHub Pages **не подходит** (нужен сервер и API). Используй [Vercel](https://vercel.com): подключи репозиторий, добавь те же env-переменные.

## Структура

- `src/app/(app)/` — карта, поездки, wishlist, друзья
- `src/lib/auth/` — пароли и сессии
- `supabase/migrations/` — схема БД
