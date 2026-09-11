# TEC Admin Panel

The admin panel for The Esti Confidential daily quiz. Next.js App Router, React,
TypeScript and Tailwind. It holds no data of its own — every screen reads from
`../esthetics-backend`.

The member quiz is a separate thing entirely and stays where it is: a single
vanilla JavaScript file in `../esti-frontend`, embedded inside Circle.

## Run locally

```bash
cp .env.example .env.local     # both API URLs point at esthetics-backend
npm install
npm run dev                    # http://localhost:4000
```

`API_BASE_URL` is used by server components; `NEXT_PUBLIC_API_BASE_URL` is
compiled into the browser bundle. They normally hold the same value, but the
public one has to be reachable from the user's machine, not just the server.

Start `esthetics-backend` on port 4001 first, and make sure its
`ALLOWED_ORIGINS` includes `http://localhost:4000`.

## The member quiz lives here too

`public/quiz/` holds the vanilla-JS member quiz — `index.html`, `script.js`,
`styles.css`, moved from `esti-frontend`. It is served publicly at **`/quiz`**
and is deliberately excluded from the auth middleware, since members opening it
inside Circle have no admin session.

The embed snippet for a Circle post's Custom HTML block is generated on the
Settings screen, from the **Quiz embed URL** saved there. Set that first, then
use the Copy button.

> `script.js` is still the POC file: it talks to `esti-backend` using the old
> field names. Hosting it here works, but pointing it at `esthetics-backend`
> needs its data plumbing updated first — see `../esti-frontend/README.md`.

## Screens

Design source is `scope/` — 16 pages covering the 10 admin screens (A1–A10) and
the 11 member quiz screens (Q1–Q11).

| | Screen | Route | State |
|---|---|---|---|
| A1 | Login | `/login` | wired |
| A2 | Dashboard | `/dashboard` | wired |
| A3 | Question bank | `/questions` | wired |
| A4 | Add or edit question | `/questions/new`, `/questions/[id]` | wired |
| A5 | Schedule | `/schedule` | wired |
| A6 | Featured content | `/featured` | wired |
| A7 | Members | `/members` | wired, waiting on the streak engine |
| A8 | Member detail | `/members/[id]` | wired, waiting on the streak engine |
| A9 | Statistics | `/statistics` | wired, waiting on member answers |
| A10 | Settings | `/settings` | wired; invite dialog is a TODO |

## How auth works

The browser talks to the admin API directly. This app serves no `/api/*` routes
of its own.

1. `/login` posts straight to `http://localhost:4001/api/admin/auth/login` with
   `credentials: "include"`.
2. The API replies with a JWT in an **httpOnly cookie** that it sets itself.
   JavaScript never sees the token.
3. Cookies ignore the port, so that cookie is also sent to the panel on :4000 —
   server components read it and call the API with a bearer token (`lib/api.ts`).
4. Client-side saves call the API directly too (`lib/client.ts`), and the cookie
   rides along.
5. `middleware.ts` only checks that a cookie exists. The API decides whether the
   token is actually valid, on every request.

Two things this depends on:

- The API's `ALLOWED_ORIGINS` **must** list this app's origin. CORS with
  credentials cannot use a wildcard, so a missing entry blocks login outright.
- **In production the port trick does not apply.** Once the panel and the API
  are on different hostnames, the cookie has to be widened to a shared parent
  domain — set `SESSION_COOKIE_DOMAIN=".esticonfidential.com"` and
  `SESSION_COOKIE_SAMESITE="None"` on the API. Two unrelated hosts such as
  `a.onrender.com` and `b.onrender.com` cannot share a cookie at all, so both
  need to sit under one domain before launch.

There is a single role, `ADMINISTRATOR`. Everyone who can sign in has full
access, so no screen is gated by role.

Development login: `adam@esticonfidential.com` / `Admin@123`.

## Conventions

- Dates are `YYYY-MM-DD` strings end to end. `lib/format.ts` renders them
  without constructing a local `Date`, which would shift the day in some
  timezones.
- Screens never throw on a failed fetch. `apiGet` returns a result and the page
  renders `ApiErrorState` or an empty state, so a page still renders while the
  database is being filled in.
- Colours live as tokens in `app/globals.css`. The panel is deliberately cool
  and neutral — the warm paper-and-gold palette belongs to the member quiz.

## Not built yet

- Invite dialog and password reset (both need the invite email).
- Bulk import of the existing question sheet.
- The A5 week picker only reads `?week=YYYY-MM-DD`; there are no prev/next buttons yet.
