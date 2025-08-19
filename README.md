# TZC - Time Zone Converter

Interactive visualization of world time zones with draggable interface and gradient background representing day/night cycles.

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

## Tech Stack

- **Next.js 15** with App Router
- **React 19** 
- **TypeScript**
- **Tailwind CSS**
- **date-fns-tz** for timezone handling
- **Framer Motion** for animations

## How It Works

The app displays 25 time zones (UTC-12 to UTC+12) as colored strips. Each strip's color corresponds to the local hour:
- Darker shades = nighttime (6 PM - 6 AM)
- Lighter shades = daytime 
- Brightest = noon

Drag horizontally (desktop) or vertically (mobile) to "time travel" and see how all zones change together.

## Continue Building

**[https://v0.dev/chat/projects/sTNJefUlSQC](https://v0.dev/chat/projects/sTNJefUlSQC)**
