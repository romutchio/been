# been

Веб-приложение для отметки посещённых стран на схематичной choropleth-карте мира.

## `.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # service_role, только сервер
SESSION_SECRET=...                 # случайная строка 32+ символов
```

`service_role` и `SESSION_SECRET` не коммить. Anon key и JWT Secret не нужны.

### Где взять ключи

Supabase → **Project Settings** → **API**:

- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **service_role** → `SUPABASE_SERVICE_ROLE_KEY`

`SESSION_SECRET` — сгенерируй сам (`openssl rand -base64 32`).

## Миграции (SQL Editor, по порядку)

1. `001_initial.sql`
2. `002_trip_cities.sql`
3. `003_username_auth.sql`
4. `004_custom_auth.sql`

Миграции `005`/`006` (RPC в Postgres) для этого варианта не обязательны.

## Запуск

```bash
npm install
npm run dev
```

## Авторизация

Только **логин + пароль**:

- пароль хэшируется на сервере (bcrypt);
- сессия в httpOnly cookie (`been_session`);
- запросы к БД идут с **service role** только из server actions — доступ по `userId` из сессии.

Почты и Supabase Auth нет.
