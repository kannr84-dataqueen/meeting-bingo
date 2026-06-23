# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Status

Pre-implementation. Only planning documents exist; `src/` has not been created yet. See `implementation-plan.md` for the 10-phase build plan (reviewed and approved by VP Product, VP Engineering, VP Design).

## Commands

After Phase 1 scaffolding is complete:

```bash
npm run dev          # Start dev server on port 3000
npm run build        # tsc + vite build
npm run preview      # Preview production build
npm run test         # Vitest (watch mode)
npm run test --run   # Vitest single-run (CI)
npm run lint         # ESLint
npm run typecheck    # tsc --noEmit
```

Run a single test file:
```bash
npx vitest run src/lib/__tests__/bingoChecker.test.ts
```

## Architecture

### Screen routing

No router library. `App.tsx` owns a `useState<Screen>` where `Screen = 'landing' | 'category' | 'game' | 'win'`. Screens are conditionally rendered; the Back button and category/win transitions all call `setScreen(...)` directly.

### State ownership

`useGame.ts` owns all `GameState` mutations. `GameContext.tsx` (initialized in Phase 5) wraps the app and exposes named callbacks (`fillSquare`, `toggleSquare`, `newCard`, `resetGame`) — never the raw state setter. `GameBoard` and its children receive callbacks only; no child holds a reference to `setGame`.

### Core logic layer (`src/lib/`)

Pure functions with no React dependencies — safe to unit-test with Vitest in jsdom:
- `cardGenerator.ts` — Fisher-Yates shuffle → 5×5 grid; FREE always at `[2][2]`
- `bingoChecker.ts` — checks all 12 lines (5 rows, 5 cols, 2 diagonals); called synchronously after every `fillSquare`
- `wordDetector.ts` — `\b` boundaries for single words, substring for phrases, `WORD_ALIASES` map for abbreviations (CI/CD, MVP, etc.)
- `shareUtils.ts` — feature-detects `navigator.share` before calling it; URL injected from `import.meta.env.VITE_APP_URL`

### Speech recognition (`src/hooks/useSpeechRecognition.ts`)

- Stores `SpeechRecognition` instance in a `ref`, not state (Strict Mode safe)
- Auto-restart uses a `shouldRestartRef` boolean checked inside `onend` — **not** inside a `setState` callback (avoids React 18 concurrent mode undefined behavior)
- Transcript capped at a rolling 2 000-char buffer before storing
- `isListening` source of truth lives in this hook; `GameState.isListening` is a derived mirror

### Persistence

localStorage key: `meeting-bingo-v1`. `GameState` includes `schemaVersion: 1`. On restore, if `schemaVersion` is missing or mismatched, discard and start fresh. All `localStorage` access wrapped in `try/catch`.

### Accessibility constraints (enforced by VP Design review)

- `BingoCard` → `role="grid"`, `BingoSquare` → `role="gridcell"`, `aria-label="{word}, row {r}, col {c}"`, `aria-pressed={isFilled}`
- `animate-pulse` on auto-filled squares must use `motion-safe:` Tailwind prefix
- Secondary text color must be `#374151` (not `#6b7280`) to meet WCAG AA 4.5:1 on `#f3f4f6`
- Confetti fires only when `!window.matchMedia('(prefers-reduced-motion: reduce)').matches`; a `ref` guard prevents double-fire in Strict Mode
- Focus moves to `WinScreen` heading on win transition; `recognition.stop()` called on `WinScreen` mount

### Browser compatibility

Web Speech API is unavailable in Firefox and iOS Safari. When `isSupported === false`, render `UnsupportedBrowser.tsx` in place of `TranscriptPanel`. The rest of the game (manual tapping) works in all browsers.

## Key Decisions

Decisions already made — don't re-open without a reason:
- `GameContext` initialized in Phase 5, not deferred
- `toggleSquare` cannot unfill auto-detected squares or squares that are part of a winning line
- `alreadyFilled: string[]` lives in `GameState` (serializable); passed to `detectWordsWithAliases` on each transcript result
- No router library; browser Back button is intentionally unhandled (post-MVP)
- Share text has no leading emoji (read aloud verbatim by VoiceOver/TalkBack in Slack/Teams)
- `sourcemap: 'hidden'` in production Vite config
- `VITE_APP_URL` env var populates the share link; set in Vercel project settings at deploy time

## Planning Documents

| File | Contents |
|------|----------|
| `implementation-plan.md` | Phased build plan with file checklist and key decisions |
| `meeting-bingo-architecture.md` | System architecture, data flow diagrams, full reference implementations |
| `meeting-bingo-prd.md` | User stories, acceptance criteria, browser compatibility matrix |
| `meeting-bingo-uxr.md` | UX research findings |
