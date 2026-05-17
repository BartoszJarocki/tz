# Project Context

This project is a timezone converter with two primary user surfaces:

- A **World Time Visualization** that shows hourly timezone strips, live local time, and day/night color state.
- A **Timezone Conversion** flow that accepts human text such as `3pm EST to PST` and returns converted times for web and Slack users.

## Domain Terms

### Timezone Catalog

The canonical list of supported timezones, city labels, abbreviations, default targets, wildcard targets, and search behavior. Parsing, conversion, Slack responses, and the visualization should all use this catalog instead of duplicating timezone lookup rules.

### Timezone Conversion

The domain flow that turns user text or a detected message pattern into a parsed conversion intent and converted target times. Web command palette and Slack callers should use this module instead of coordinating parser and converter helpers themselves.

### Slack Intake

The Slack-facing flow that verifies requests at the route adapter, parses Slack command, event, interaction, and diagnostic payloads, and dispatches timezone conversion replies through a Slack adapter.

### Slack App Operations

Slack network behavior such as bot identity lookup, channel listing, channel joins, diagnostics, and test message sending. Route adapters should access these operations through a Slack adapter instead of constructing Slack clients directly.

### Runtime Config

The environment and logging surface for Slack tokens, signing secrets, node mode, and request diagnostics. Slack route adapters and Slack App Operations should use this module instead of reading process globals or logging raw request payloads directly.

### World Time Visualization

The interactive timezone strip experience. It combines catalog data, live time, drag offset, local timezone detection, and day/night display state.
