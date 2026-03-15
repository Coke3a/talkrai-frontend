# TalkRai Frontend

LINE Mini App frontend for TalkRai — an AI-powered interactive roleplay chatbot platform.

Built with Next.js (App Router) and the [LIFF SDK](https://developers.line.biz/en/docs/liff/), running inside LINE's in-app browser.

## Tech Stack

- **Next.js 16** — App Router, React 19, TypeScript
- **LIFF SDK** — LINE Mini App integration
- **Tailwind CSS v4** — Styling
- **pnpm** — Package manager

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm
- A LINE Mini App channel ([LINE Developers Console](https://developers.line.biz/console/))

### Setup

```bash
# Install dependencies
pnpm install

# Copy env file and fill in your LIFF ID
cp .env.local.example .env.local
```

Set `NEXT_PUBLIC_LIFF_ID` in `.env.local` to your channel's LIFF ID (found in Web app settings > LIFF URL).

### Development

```bash
pnpm dev
```

LIFF requires HTTPS. For local testing, use a tunnel:

```bash
ngrok http 3000
```

Then set the ngrok HTTPS URL as the **Endpoint URL** in your LINE Mini App channel's Web app settings (Developing).

### Build

```bash
pnpm build
pnpm start
```

### Lint

```bash
pnpm lint
```

## Project Structure

```
app/
├── globals.css          # Global styles + Tailwind
├── layout.tsx           # Root layout (viewport, metadata, LiffProvider)
├── page.tsx             # Home page
└── providers/
    └── liff-provider.tsx  # LIFF SDK init + React context
```

## Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_LIFF_ID` | LIFF ID from LINE Developers Console |
| `NEXT_PUBLIC_API_BASE_URL` | Backend API URL |

## LINE Mini App Configuration

Channel settings required in the LINE Developers Console:

- **Endpoint URL** — Your deployed HTTPS URL
- **Scopes** — `profile`, `openid`
- **Size** — Full
- **Privacy policy URL** — Required for review
- **Channel description** — Shown on consent screen
