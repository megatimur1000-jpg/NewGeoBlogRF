# Gamification API contract

Endpoint: `POST /api/gamification/xp`

Purpose: accept XP award requests from frontend and process them (validate, apply limits, persist, and return updated user XP/level).

Request payload (JSON):

- `userId` (string) — target user id who should receive XP. Required.
- `source` (string) — XP source identifier (see `xpSources.ts`, e.g. `gps_track_recorded`). Required.
- `amount` (number) — number of XP points to award (already final after client multipliers). Required.
- `contentId` (string|null) — optional id of content that triggered XP (post, route, marker).
- `contentType` (string|null) — optional content type (`post` | `route` | `marker` | `event`).
- `metadata` (object) — optional arbitrary metadata (distance, format, flags).

Example request body:

{
  "userId": "user-123",
  "source": "gps_track_recorded",
  "amount": 40,
  "contentId": "track-456",
  "contentType": "route",
  "metadata": { "distance": 6120 }
}

Successful response (200):

{
  "success": true,
  "userId": "user-123",
  "totalXP": 1240,
  "level": 5,
  "currentXP": 40,
  "requiredXP": 200,
  "levelUp": false
}

Possible non-200 responses / error semantics:

- 400 Bad Request: invalid payload — return { success: false, reason: 'invalid' }
- 401 / 403: unauthorized — return appropriate status; frontend may treat as guest and ignore XP awarding
- 429 Too Many Requests: rate-limit exceeded — return { success: false, reason: 'rate_limited' }
- 500 Internal Server Error: server error — frontend may ignore failure (XP awarding is best-effort)

Notes for backend implementers:

- The server must perform authoritative checks for cooldowns/daily limits and not rely solely on frontend.
- For sources that require moderation, server should verify content moderation state before awarding XP.
- The endpoint should be idempotent per `(userId, source, contentId)` within a reasonable window to prevent duplicates.
