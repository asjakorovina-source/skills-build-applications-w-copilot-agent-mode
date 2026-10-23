# OctoFit Tracker architecture

OctoFit Tracker is a three-tier application for a school fitness program. The starter code includes API contracts and intentionally incomplete implementation points so you can use GitHub Copilot agent mode in a test-driven loop.

![Three-tier OctoFit architecture](../.github/images/octofit-architecture.svg)

## Tier boundaries

- **Presentation tier**: React 19, Vite, React Router, Bootstrap, and a shared API client in `octofit-tracker/frontend/src`.
- **Logic tier**: Express and TypeScript routes/services in `octofit-tracker/backend/src` expose `/api/*` behavior on port `8000`.
- **Data tier**: Mongoose models and seed data in `octofit-tracker/backend/src/models` and `src/scripts/seed.ts` persist to MongoDB on port `27017`.

## Ports and environment rules

- MongoDB: `27017`
- Express API: `8000`
- Vite frontend: `5173`
- The browser calls relative `/api` paths. Vite proxies them to `http://localhost:8000`, so the unauthenticated API port stays private in Codespaces. `VITE_API_BASE_URL` can override the base URL.

## API contract

| Capability | Method and path | Expected behavior |
| --- | --- | --- |
| Activity tracking | `GET /api/activities`, `POST /api/activities` | List and create valid activity records. POST accepts `userId`, `teamId`, `type`, and `minutes`; `userId` and `teamId` must be well-formed IDs for an existing user and team; otherwise respond with a deliberate 4xx (never a 500 from a cast error). A created activity stores the submitted `user`, `team`, `type`, and `minutes` plus computed `points` and `occurredAt`. |
| Teams | `GET /api/teams`, `POST /api/teams` | List and create teams with members. Created and listed teams keep the submitted `name` and `mascot`. Reject a team without a name with `400`. |
| Leaderboard | `GET /api/leaderboard` | Return teams ordered by the sum of their activity points, highest first. Each entry has `teamName`, `totalPoints`, and a 1-based `rank`. |
| Workout suggestions | `GET /api/workouts/suggestions/:userEmail` | Recommend workouts from recent activity patterns for the matching seeded user's email address. The first suggestion's `focus` matches that user's goal or recent activity, with a `reason` explaining why. An email with no matching user returns a deliberate 4xx (for example, `404`). |

## Implementation decisions

- Presentation tier decision: Keep route-specific display in small React components. Use the shared `getJson` client and a reusable capability view for loading, error, empty, and populated states; keep API paths and item rendering at each route.
- Logic tier decision: Keep HTTP handling in `/api` routes and business rules in explicit service functions. Validate request values before database queries so malformed identifiers and missing records return deliberate 4xx responses. Do not add authentication in this exercise.
- Data tier decision: Express persistence through Mongoose schemas with required fields and field-level constraints. Keep demo seeding idempotent with upserts, preserve unrelated records, and reconcile the seeded user's previous team membership.
- Activity tracking approach: Accept `userId`, `teamId`, `type`, and positive `minutes`; validate identifier formats and referenced records before writing. Store references as `user` and `team`, calculate points from minutes, and default `occurredAt` to the current time when it is omitted.
- Team management approach: Require a non-empty name and mascot, validate and deduplicate member IDs, store them on the new team, and set each listed user's team reference to it.
- Leaderboard approach: Aggregate activity points by team, sort totals descending with a stable tie order, and return each team's name, total, and 1-based rank.
- Workout suggestions approach: Find the user by email, prioritize workouts matching the user's fitness goal, and include a reason informed by the most recent activity. Return 404 when the user does not exist.

## Test plan

- Data tier: `npm run test:data --prefix octofit-tracker/backend` checks schema validation/defaults and idempotent seeding, including preservation of unrelated records and team-membership reconciliation. Failures indicate a model or seed-data regression.
- API logic: `npm run test:api --prefix octofit-tracker/backend` checks request validation, reference handling, activity/team writes, leaderboard ordering, and workout matching. Failures indicate a route/service contract regression.
- Presentation: `npm test --prefix octofit-tracker/frontend` checks API-backed rendering and loading, empty, and error states for each capability. Failures indicate a client or presentation-contract regression.
- Backend build: `npm run build --prefix octofit-tracker/backend` runs the TypeScript check; failures indicate backend type errors.
- Frontend build: `npm run build --prefix octofit-tracker/frontend` runs TypeScript checking and the Vite production build; failures indicate frontend type or bundling errors.
