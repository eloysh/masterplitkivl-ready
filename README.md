# masterplitkivl — лендинг с калькулятором и админкой

## Установка
```bash
npm i
npm run dev
```

## Полный режим (локально + функции Vercel)
```bash
npm i -g vercel
vercel login
vercel link

# Создай Blob (Storage → Blob) и Read-Write token
vercel env add ADMIN_USER          # gurenko
vercel env add ADMIN_PASS          # gurenko93
vercel env add BLOB_READ_WRITE_TOKEN
vercel dev
```

## Деплой
- Импортируй репозиторий в Vercel → Deploy.
- ENV в Settings → Environment Variables:
  - ADMIN_USER=gurenko
  - ADMIN_PASS=gurenko93
  - BLOB_READ_WRITE_TOKEN=<твой токен из Blob>
- Build: автоматический (Vite). Output: dist.

## Домен
У регистратора:
- A (@) → 76.76.21.21
- CNAME (www) → cname.vercel-dns.com

Добавь домены в Vercel → Settings → Domains.
