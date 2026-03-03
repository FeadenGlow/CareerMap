# Troubleshooting

## Known issues and fixes

| Issue | Fix |
|-------|-----|
| Docker: DB not ready | `docker-compose up -d`; wait for healthcheck; check `docker-compose ps` and logs. |
| Port 3000/5173 in use | Change server PORT in .env; client port in vite.config.ts `server.port`. |
| Prisma: client out of date | Run `npm run prisma:generate` in server/. |
| Prisma: migration fails | Check DATABASE_URL; for dev try `npx prisma migrate dev`; for deploy use `prisma migrate deploy`. Reset (data loss): `npx prisma migrate reset` in server/. |
| Auth: 401 / immediate logout | Token expired or invalid; client clears storage and redirects to login. Re-login or check JWT_SECRET and token expiry. |
| CORS | Server has `app.enableCors()` with no custom config. If client on different origin, may need to restrict or allow origin. *How to verify:* [../../server/src/main.ts](../../server/src/main.ts). |
| Client: API base URL wrong | Set VITE_API_URL in .env or env when building; dev default is http://localhost:3000. |

## How to verify

- **DB connection:** `docker-compose exec postgres pg_isready -U career_user -d career_paths` (dev).
- **Server env:** Ensure server/.env exists and DATABASE_URL matches docker-compose (user, password, db, port).
- **Swagger:** Open http://localhost:3000/api when server is running.
- **Client env:** Check client/src/shared/api/client.ts for baseURL and interceptors.
