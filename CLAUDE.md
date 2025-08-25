# Claude Code Project Guidelines

## Project Overview
This is a timezone converter application with both Slack and Discord bot integrations. It features a visual web interface and automated timezone conversion in chat messages.

## Code Standards

### Import Aliases
- **Always use `@` import alias** instead of relative imports
- Import paths should use `@/utils/...`, `@/app/...`, etc.
- Never use `../` or `./` relative imports

### Examples:
```typescript
// ✅ Correct
import { parseTimeCommand } from '@/utils/time-parser';
import { convertTimeToTimezones } from '@/utils/timezone-utils';

// ❌ Incorrect
import { parseTimeCommand } from '../../../../utils/time-parser';
import { convertTimeToTimezones } from './timezone-utils';
```

### Architecture
- **API Routes**: Use Node.js runtime for Discord/Slack integrations
- **Shared Logic**: Core timezone parsing/conversion logic is shared between platforms
- **Bot Features**: Both Slack and Discord support slash commands and auto-detection

### Key Files
- `@/utils/timezone-utils.ts` - Core timezone conversion logic
- `@/utils/time-parser.ts` - Natural language time parsing
- `@/utils/message-parser.ts` - Auto-detection of timezone patterns
- `@/utils/slack-client.ts` - Slack API integration
- `@/utils/discord-client.ts` - Discord API integration

### Build Requirements
- Uses Next.js with webpack externalization for Discord.js
- Discord API routes require Node.js runtime (default)
- Clean builds with no deprecated package warnings

### Testing Commands
```bash
pnpm build     # Test production build
pnpm dev       # Development server
pnpm check     # Biome linting and formatting
```

## Integration Details

### Slack Bot
- Slash commands: `/tz 3pm EST to PST`
- Auto-detection: `3PM EST -> PST` patterns in messages
- Thread replies for non-intrusive responses

### Discord Bot
- Slash commands: `/tz 3pm EST to PST, CET`
- Rich embeds with timezone conversion results
- Message replies for auto-detected conversions

### Environment Variables
See `.env.example` for required Discord and Slack credentials.

## Development Notes
- Always maintain consistency between Slack and Discord implementations
- Use shared utilities to avoid code duplication
- Follow existing patterns for new bot features
- Test both platforms when making core changes

---
*This file helps Claude Code maintain consistent development practices across the project.*