# TZC - Time Zone Converter

![Timezone Visualization](./assets/screenshot.png)

Interactive visualization of world time zones with draggable interface and gradient background representing day/night cycles.

## 🔥 NEW: Slack Integration
Automatically convert timezone mentions in Slack messages! Just type patterns like `3PM CEST -> EST` and get instant conversions.

### Features:
- **Auto-detection**: Recognizes patterns like `3PM EST -> PST` in messages
- **Thread replies**: Clean, non-intrusive responses in message threads  
- **Slash commands**: Use `/tz 3pm EST to PST` for manual conversions
- **Multiple formats**: Supports 12/24 hour, city names, timezone codes

*Built with [v0.dev](https://v0.dev) and [Claude Code](https://claude.ai/code)*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/bartosz-jarockis-projects/v0-50-shades-of-time)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.dev-black?style=for-the-badge)](https://v0.dev/chat/projects/sTNJefUlSQC)

## Features

- **Gradient Background**: Each time zone shows a shade representing local time (dark for night, light for day)
- **Drag Interaction**: Click and drag to explore different times across all zones
- **Responsive Design**: Horizontal layout on desktop, vertical on mobile  
- **Live Updates**: Real-time clock updates
- **User Timezone Detection**: Highlights your current timezone with an orange dot

## Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

## Code Quality

This project uses [Biome](https://biomejs.dev/) for ultra-fast linting and formatting:

```bash
# Check for issues
pnpm check

# Auto-fix issues
pnpm check:fix

# Format code
pnpm format:fix

# Lint only
pnpm lint:fix
```

## Tech Stack

### Frontend
- **Next.js 15** with App Router
- **React 19** 
- **TypeScript**
- **Tailwind CSS**
- **date-fns-tz** for timezone handling
- **Framer Motion** for animations

### Backend & Integration
- **Slack Web API** for bot integration
- **chrono-node** for natural language time parsing
- **Next.js API routes** for Slack webhooks

### Development Tools
- **Biome** for ultra-fast linting and formatting
- **pnpm** for package management
- **Vercel** for deployment

## How It Works

The app displays 25 time zones (UTC-12 to UTC+12) as colored strips. Each strip's color corresponds to the local hour:
- Darker shades = nighttime (6 PM - 6 AM)
- Lighter shades = daytime 
- Brightest = noon

Drag horizontally (desktop) or vertically (mobile) to "time travel" and see how all zones change together.

## Development

### Code Quality Standards
- **100% TypeScript** with strict type checking
- **Biome** enforced code style and linting
- **Modern ES2020+** features throughout
- **React best practices** with proper hook usage

### Architecture
- **API Routes**: `/api/slack/*` for Slack integration
- **Utilities**: Modular timezone and parsing logic
- **Components**: Clean separation of UI and business logic

## Continue Building

**[https://v0.dev/chat/projects/sTNJefUlSQC](https://v0.dev/chat/projects/sTNJefUlSQC)**
