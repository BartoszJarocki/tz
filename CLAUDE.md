# Claude Code Project Guidelines

## Project Overview
This is a timezone converter application with a Slack bot integration. It features a visual web interface and automated timezone conversion in chat messages.

## Code Standards

### Import Aliases
- **Always use `@` import alias** instead of relative imports
- Import paths should use `@/utils/...`, `@/app/...`, etc.
- Never use `../` or `./` relative imports

### Examples:
```typescript
// ✅ Correct
import { parseTimeCommand } from '@/utils/time-parser';
import { convertTimezoneCommand } from '@/utils/timezone-conversion';

// ❌ Incorrect
import { parseTimeCommand } from '../../../../utils/time-parser';
import { convertTimezoneCommand } from './timezone-conversion';
```

### Architecture
- **Route Adapters**: Keep app routes thin; Slack behavior should live in `@/utils/slack/intake`.
- **Timezone Catalog**: Timezone lookup, aliases, defaults, wildcards, search, and display labels live in `@/utils/timezone-catalog`.
- **Timezone Conversion**: Web and Slack callers should use `@/utils/timezone-conversion` instead of coordinating parser and conversion helpers directly.
- **World Time Visualization**: Time strip display state and drag math live in `@/utils/world-time-visualization`.

### Key Files
- `@/utils/timezone-catalog.ts` - Timezone catalog data, lookup, aliases, defaults, wildcards, and search.
- `@/utils/timezone-conversion.ts` - Timezone conversion intent/result model and conversion math.
- `@/utils/time-parser.ts` - Natural language time parsing implementation used by Timezone Conversion.
- `@/utils/world-time-visualization.ts` - Display model and drag offset calculations for the time strip.
- `@/utils/message-parser.ts` - Auto-detection of timezone patterns in Slack messages.
- `@/utils/slack/intake.ts` - Slack command, event, interaction, auto-join, diagnostics, and pattern-test intake.
- `@/utils/slack/client.ts` - Slack adapter backed by `@slack/web-api`.

### Build Requirements
- Uses Next.js
- Clean builds with no deprecated package warnings

### Testing Commands
```bash
pnpm build     # Test production build
pnpm dev       # Development server
pnpm check     # Biome linting and formatting
```

## Slack Bot
- Slash commands: `/tz 3pm EST to PST`
- Auto-detection: `3PM EST -> PST` patterns in messages
- Thread replies for non-intrusive responses

### Environment Variables
See `.env.example` for required Slack credentials.

## Development Notes
- Use domain modules from `CONTEXT.md` before adding route-local or UI-local logic.
- Follow existing patterns for new bot features

---
*This file helps Claude Code maintain consistent development practices across the project.*
