# THE PLAYER SYSTEM

A Solo Leveling-inspired personal quest dashboard. The existing dark HUD frontend is kept in `index.html`; Vercel serverless functions connect it to Notion.

## Deploy

1. Import this repository into Vercel and deploy with the default settings (no build command is needed).
2. In Notion, create an internal integration and copy its secret. Share these pages/databases with that integration:
   - THE PLAYER SYSTEM (parent page)
   - TODAY'S QUESTS
   - HABIT MANAGER
   - PLAYER PROFILE — SYSTEM CORE
   - SHADOW ARMY (only needed when quest-to-shadow assignment is enabled)
3. In Vercel → Project → Settings → Environment Variables, add:
   - `NOTION_TOKEN` — the integration secret (mark it sensitive).
   - `NOTION_QUESTS_DATA_SOURCE_ID` — `769316a2-5dc2-4eb0-9a4e-9c7c66aecdeb`
   - `NOTION_HABITS_DATA_SOURCE_ID` — `a4045c8b-2b5a-4597-828d-ed9cb2b14591`
   - `NOTION_PROFILE_PAGE_ID` — `41559d34-792d-81a1-be69-cd4fdafadd48`
   - `NOTION_SHADOWS_DATA_SOURCE_ID` — `6cf1ea27-6f99-47e8-a9e3-a25d648486d0`
4. Redeploy after adding variables.

Do not put the integration token in `index.html`, frontend JavaScript, or GitHub. Keep the Vercel deployment private or enable deployment protection before using it; the API is intended for your personal dashboard.

## API

- `GET /api/quests` — today's quest records from Notion.
- `POST /api/quests` — create a quest. XP values are assigned server-side from difficulty.
- `PATCH /api/quests` — set a quest's Completed checkbox; repeated completion does not award twice.
- `GET /api/habits` — list active habits.
- `POST /api/habits` — add a habit.
- `GET /api/profile` — read the Notion profile rollups and formulas.
- `GET /api/shadows` — read the Shadow Army records.

Notion remains the source of truth. XP, Gold, Level, rank, and completion metrics are read from the profile's existing Notion formulas/rollups. Habit check-ins do not award XP. The frontend currently displays habits as a tracker list; completion history/check-ins are not implemented in the Notion schema.

## Local development

Run with Vercel CLI so the `/api` functions are available. Set the environment variables above in a local `.env.local` file (never commit it).
