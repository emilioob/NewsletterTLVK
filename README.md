# Travel Pulse SEA

`Travel Pulse SEA` is a daily OTA newsletter engine for Traveloka strategy work. It curates market-situation signals and competitor dynamics, generates a polished web edition, and emails the summary with a link back to the site.

## What it does

- Pulls daily travel-industry news from curated RSS searches with an emphasis on Southeast Asia.
- Scores stories for Traveloka relevance using route, disruption, regulation, and OTA competition heuristics.
- Groups the output into logical sections such as `Market Situation` and `Competitor Dynamics`.
- Generates a cool static website in `/site` and a structured edition JSON in `/data`.
- Emails the daily brief and includes the full web-edition link.
- Supports optional OpenAI enhancement for tighter executive summaries.

## Why this framing fits Traveloka

Traveloka's official public positioning describes the company as a leading Southeast Asia travel platform with strong focus across flights, accommodations, activities, and broader travel services. Public company pages and 2025 announcements also highlight:

- Founded in Indonesia in 2012.
- Operations across Southeast Asia plus Australia, with a 2025 Japan launch.
- Roughly `140M+` app downloads and `40M+` monthly active users.
- `250+` airline partners, `2.2M+` accommodations, and `90K+` activities.

That makes route demand, travel disruption, supply shifts, regulation, and OTA competitor moves especially important for a strategy newsletter.

## Local usage

1. Copy `.env.example` to `.env` and fill in the values.
2. Run `node ./src/index.js`.
3. Open `/site/index.html` for the archive homepage.

If `EMAIL_PROVIDER=none`, the engine still generates the site and edition files without sending mail.

## Email providers

Two no-dependency providers are built in:

- `resend`
- `sendgrid`

Set `EMAIL_PROVIDER=none` if you want to validate the pipeline before enabling delivery.

## Automation

The repo includes `.github/workflows/daily-newsletter.yml`, which:

- Runs daily at `07:00` Singapore time (`23:00 UTC` the prior day).
- Builds the daily edition.
- Sends the email.
- Deploys the static archive to GitHub Pages.

Set these GitHub repository variables and secrets:

- Repository variable: `BASE_URL`
- Repository variable: `EMAIL_PROVIDER`
- Repository variable: `EMAIL_FROM`
- Repository variable: `EMAIL_TO`
- Repository secret: `OPENAI_API_KEY` if you want AI-polished summaries
- Repository secret: `RESEND_API_KEY` or `SENDGRID_API_KEY`

## File map

- `src/index.js`: main orchestration entrypoint
- `src/lib/sources.js`: news source queries
- `src/lib/analysis.js`: scoring, grouping, route extraction
- `src/lib/render.js`: web and email rendering
- `src/lib/email.js`: delivery adapters

## Next upgrades worth considering

- Add a richer source mix from airline, airport, and tourism-board feeds.
- Track article history to avoid repeating the same theme over consecutive days.
- Add destination-level scoring for specific Traveloka priority markets.
