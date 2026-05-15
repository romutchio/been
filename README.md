# been

Веб-приложение для отметки посещённых стран на схематичной choropleth-карте мира.

## Возможности

- Интерактивная карта мира (посещено / wishlist)
- Счётчик и процент посещённых стран
- Таймлайн поездок
- Список «хочу посетить»
- Друзья и просмотр их карт

## Стек

- Next.js 16, React 19, Tailwind CSS 4
- Supabase (Auth + PostgreSQL + RLS)
- d3-geo + TopoJSON (world-atlas)

## Настройка Supabase

1. Создай проект на [supabase.com](https://supabase.com)
2. В **SQL Editor** выполни миграцию из `supabase/migrations/001_initial.sql`
3. В **Authentication → Providers** включи Email
4. Скопируй URL и anon key в `.env.local`:

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

## Запуск

```bash
npm install
npm run dev
```

Открой [http://localhost:3000](http://localhost:3000)

## Структура

- `src/app/(app)/` — защищённые страницы (карта, поездки, wishlist, друзья)
- `src/components/WorldMap.tsx` — choropleth-карта
- `supabase/migrations/` — схема БД и RLS
