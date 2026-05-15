# been

Веб-приложение для отметки посещённых стран на схематичной choropleth-карте мира.

## Минимальный `.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...        # или PUBLISHABLE_KEY

SUPABASE_JWT_SECRET=...                     # JWT Secret на той же странице API
```

**Service role не нужен** — регистрация и вход идут через SQL-функции (anon key).

### Откуда взять `SUPABASE_JWT_SECRET`

Supabase → **Project Settings** → **API** → прокрути до **JWT Settings** → скопируй **JWT Secret** (Legacy).

Это одна строка из дашборда, не генерируешь сам. Нужна, чтобы сессия работала с RLS (`auth.uid()`).

## Миграции (SQL Editor, по порядку)

1. `001_initial.sql`
2. `002_trip_cities.sql`
3. `003_username_auth.sql`
4. `004_custom_auth.sql`
5. `005_auth_rpc.sql`

## Запуск

```bash
npm install
npm run dev
```

## Авторизация

Только **логин + пароль**. Почты и Supabase Auth нет.
