# Meeting Bingo — Implementation Plan

## Review Summary

Reviewed: 2026-06-23 | Reviewers: VP Product, VP Engineering, VP Design

### Changes Applied

| # | Change |
|---|--------|
| 1 | Fixed `@types/canvas-confixer` typo → `@types/canvas-confetti` in Phase 1 install command |
| 2 | Added ESLint + Prettier setup to Phase 1 |
| 3 | Added `strict: true` to `tsconfig.json` setup in Phase 1 |
| 4 | Added Vitest unit test step to Phase 3 for `cardGenerator`, `bingoChecker`, `wordDetector` |
| 5 | Exported `escapeRegex` and `normalizeText` from `wordDetector.ts` for reuse |
| 6 | Added `Dialog`/`Modal` primitive to Phase 4 shared UI components |
| 7 | Added `error` Toast variant to Phase 4 |
| 8 | Added CSS design tokens (`:root` variables) to Phase 4 for square colors to support dark mode and retheming |
| 9 | Decided `GameContext.tsx` architecture upfront in Phase 5 (not deferred to Phase 9) |
| 10 | Specified "How It Works" copy and use of CSS counters (not emoji numbers) in Phase 5 |
| 11 | Added `GameHeader` component to Phase 6 steps and file checklist |
| 12 | Added `toggleSquare` to `useGame.ts` spec with guards for auto-filled and winning squares |
| 13 | Replaced raw `setGame` prop with named callback props on `GameBoard` |
| 14 | Added `aria-label`, `aria-pressed`, `role="grid"` / `role="gridcell"` to `BingoSquare` and `BingoCard` |
| 15 | Defined truncation + tooltip strategy for multi-word labels in `BingoSquare` at 375px |
| 16 | Added 375px layout verification gate at end of Phase 6 before proceeding to Phase 7 |
| 17 | Added `MicPermissionModal` component to Phase 7 |
| 18 | Moved `recognition.start()` auto-restart out of `setState` callback into `useEffect` watching `isListening` |
| 19 | Added loading state spec between "Start Listening" click and first recognition result |
| 20 | Added `UnsupportedBrowser` banner spec with copy and layout fallback for Firefox/iOS Safari |
| 21 | Added `aria-label` and ARIA live region to pulsing mic dot |
| 22 | Added `prefers-reduced-motion` check for confetti in Phase 8 |
| 23 | Added focus management spec on win transition (focus moves to `WinScreen`) |
| 24 | Added `recognition.stop()` call when `WinScreen` mounts |
| 25 | Added `VITE_APP_URL` env var definition and `'hidden'` sourcemap for prod builds to Phase 10 |
| 26 | Defined `localStorage` key (`meeting-bingo-v1`), schema version field, and stale-state guard in Phase 9 |
| 27 | Added `try/catch` to `useLocalStorage` for corrupted JSON / `StorageError` |
| 28 | Capped `transcript` string to a rolling 2 000-char buffer (prevent unbounded growth) |
| 29 | Defined `alreadyFilled` Set ownership: lives in `useGame.ts` as part of `GameState` |
| 30 | Used stable `word-index` keys for detected word badges in `TranscriptPanel` instead of array index |
| 31 | Added `navigator.share()` feature detection guard in `shareUtils.ts` |
| 32 | Made `visibilitychange` pause/resume required (not optional) |
| 33 | Added text companion for "one away" hint (not border pulse alone) |
| 34 | Added landscape orientation note to Phase 9 |
| 35 | Changed `#6b7280` → `#374151` for secondary text to meet WCAG AA 4.5:1 contrast on light backgrounds |
| 36 | Added `animate-pulse` `prefers-reduced-motion` guard to auto-filled squares |
| 37 | Added word deduplication note to category data (no word appears in more than one pack) |
| 38 | Defined `resetGame()` behavior: clears `localStorage`, resets `GameState` to `idle`, navigates to category screen |

### Unresolved Items

- [ ] Browser Back button behavior: plan intentionally uses no router; `pushState` stubs are optional polish — revisit after MVP ships
- [ ] Dark mode: CSS tokens are in `:root` now (item 8); full dark theme deferred to post-MVP
- [ ] Share URL (`[URL]`): populated by `VITE_APP_URL` env var (item 25); actual domain TBD at deploy time

---

## Stack

- **Framework**: React 18 + TypeScript (`strict: true`)
- **Build**: Vite
- **Styling**: Tailwind CSS + CSS custom properties for design tokens
- **Speech**: Web Speech API (browser-native, no API key)
- **Animation**: canvas-confetti
- **State**: React useState + Context + localStorage
- **Testing**: Vitest + jsdom
- **Linting**: ESLint + Prettier
- **Deploy**: Vercel (free tier)

---

## Phase 1: Project Setup

**Goal**: Scaffold the project with all dependencies configured and ready to code.

### Steps
1. Initialize Vite + React + TypeScript project
   ```bash
   npm create vite@latest . -- --template react-ts
   npm install
   ```
2. Install dependencies
   ```bash
   npm install canvas-confetti
   npm install -D tailwindcss postcss autoprefixer @types/canvas-confetti
   npx tailwindcss init -p
   ```
3. Install test and lint tooling
   ```bash
   npm install -D vitest jsdom @testing-library/react @testing-library/user-event
   npm install -D eslint prettier eslint-config-prettier @typescript-eslint/parser @typescript-eslint/eslint-plugin
   ```
4. Enable `strict: true` in `tsconfig.json` (Vite template may already include this; verify)
5. Configure Tailwind (`tailwind.config.js`) to scan `./index.html` and `./src/**/*.{ts,tsx}`
6. Add Tailwind directives to `src/index.css`; define CSS design tokens:
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;

   :root {
     --color-square-default: #eff6ff;
     --color-square-filled: #3b82f6;
     --color-square-auto: #10b981;
     --color-square-winning: #22c55e;
     --color-square-free: #f3f4f6;
     --color-text-primary: #111827;
     --color-text-secondary: #374151; /* WCAG AA ≥4.5:1 on #f3f4f6 */
   }
   ```
7. Set up project folder structure:
   ```
   src/
   ├── components/
   │   └── ui/
   ├── hooks/
   ├── lib/
   ├── data/
   ├── types/
   └── context/
   ```
8. Add `vitest.config.ts` with `globals: true` and `environment: 'jsdom'`
9. Configure Vite dev server to run on port 3000
10. Add `.env.example` with `VITE_APP_URL=http://localhost:3000`

**Deliverable**: `npm run dev` loads a blank React app with Tailwind; `npm run test` runs (no tests yet); `npm run lint` passes.

---

## Phase 2: Types and Data

**Goal**: Define all shared TypeScript types and static buzzword data up front to avoid rework.

### Steps
1. Create `src/types/index.ts` with:
   - `CategoryId = 'agile' | 'corporate' | 'tech'`
   - `BingoSquare` (id, word, isFilled, isAutoFilled, isFreeSpace, filledAt, row, col)
   - `BingoCard` (squares: BingoSquare[][], words: string[])
   - `GameStatus = 'idle' | 'setup' | 'playing' | 'won'`
   - `GameState` (status, category, card, isListening, startedAt, completedAt, winningLine, winningWord, filledCount, alreadyFilled: string[], transcript: string, schemaVersion: number)
   - `WinningLine` (type: 'row'|'col'|'diag', index, squares: string[])
   - `SpeechRecognitionState` (typed — avoid `any`; use `SpeechRecognition` from `@types/dom-speech-recognition`)
   - `Toast` (id, message, type: 'success'|'info'|'warning'|'error', expiresAt)
   - `Screen = 'landing' | 'category' | 'game' | 'win'`

2. Create `src/data/categories.ts` with all three category word packs (no word duplicated across packs):
   - **Agile & Scrum** (🏃): 45+ words — sprint, backlog, standup, retrospective, velocity, blocker, story points, epic, acceptance criteria, etc.
   - **Corporate Speak** (💼): 45+ words — synergy, leverage, circle back, take offline, bandwidth, pivot, move the needle, etc.
   - **Tech & Engineering** (💻): 45+ words — API, cloud, microservices, serverless, kubernetes, CI/CD, technical debt, etc.
   - Words like "CI/CD", "refactor", "deployment" appear in only one pack; review for overlap before finalizing.

3. Define localStorage schema:
   - **Key**: `meeting-bingo-v1`
   - **Schema version field**: `schemaVersion: 1` stored in `GameState`
   - On restore, if `schemaVersion` is missing or mismatched, discard stored state and start fresh

**Deliverable**: All types exported and importable; category data complete with 45+ words per pack, zero cross-pack duplicates.

---

## Phase 3: Core Game Logic

**Goal**: Implement pure logic functions (no UI) for card generation, win detection, and word matching — with unit tests.

### Steps

1. **`src/lib/cardGenerator.ts`**
   - Fisher-Yates shuffle utility
   - `generateCard(categoryId)` → picks 24 random words, builds 5×5 grid, places FREE at `[2][2]` (pre-filled)
   - `getCardWords(card)` → flat word list for detection (keep if used in two+ places; remove if only called once)

2. **`src/lib/bingoChecker.ts`**
   - `checkForBingo(card)` → checks all 12 lines (5 rows, 5 cols, 2 diagonals), returns first `WinningLine | null`
   - `countFilled(card)` → count of filled squares
   - `getClosestToWin(card)` → returns `{ squaresNeeded: number, line: WinningLine }` for "one away" hint

3. **`src/lib/wordDetector.ts`**
   - **Export** `escapeRegex(string): string` utility
   - **Export** `normalizeText(text): string` → lowercase, normalize quotes
   - `detectWords(transcript, cardWords, alreadyFilled)` → word-boundary regex for single words, substring for phrases
   - `WORD_ALIASES` map for abbreviations (CI/CD → "ci cd", MVP → "minimum viable product", etc.)
   - `detectWordsWithAliases(transcript, cardWords, alreadyFilled)` → extends base detection with alias map

4. **`src/lib/shareUtils.ts`**
   - `buildShareText(game, appUrl: string)` → text summary; `appUrl` injected from `import.meta.env.VITE_APP_URL`
   - `shareResult(game, appUrl)` → feature-detect `navigator.share` before calling it; fall back to `navigator.clipboard.writeText`; catch `ClipboardError`

5. **`src/lib/__tests__/`** — Vitest unit tests:
   - `cardGenerator.test.ts`: card is 5×5, contains 24 unique words + FREE, FREE is at `[2][2]`
   - `bingoChecker.test.ts`: row/col/diagonal win detection, no false positives on partial fills
   - `wordDetector.test.ts`: single words, multi-word phrases, alias expansion, already-filled guard

**Deliverable**: Logic functions pass all unit tests (`npm test`).

---

## Phase 4: Shared UI Components

**Goal**: Build reusable primitives before page-level components.

### Steps
1. **`src/components/ui/Button.tsx`** — variant (primary/secondary/ghost), size, disabled state; accessible focus ring
2. **`src/components/ui/Card.tsx`** — container with rounded corners and shadow
3. **`src/components/ui/Toast.tsx`** — slide-in notification with auto-dismiss; types: `success | info | warning | error`
4. **`src/components/ui/Dialog.tsx`** — accessible modal overlay with `role="dialog"`, `aria-modal="true"`, focus trap, `Escape` key dismiss; used by "confirm regenerate" in Phase 9
5. **`src/lib/utils.ts`** — `cn()` helper (clsx / tailwind-merge) for conditional class names

**Deliverable**: Basic design system in place; `Dialog` tested by pressing Escape.

---

## Phase 5: Landing Page and Category Selection

**Goal**: First two screens of the app are functional; `GameContext` architecture decided.

### Steps
1. **`src/context/GameContext.tsx`** — decide and implement now, not Phase 9:
   - Provides `gameState` and named dispatch callbacks (`fillSquare`, `toggleSquare`, `newCard`, `resetGame`, `startListening`, `stopListening`)
   - `App.tsx` owns state via `useGame`; `GameContext` makes it available to deep consumers without prop-drilling
   - Wrap `<App>` in `<GameContextProvider>` in `main.tsx`

2. **`src/components/LandingPage.tsx`**
   - Logo/title ("🎯 Meeting Bingo")
   - Tagline: "Turn any meeting into a game"
   - "New Game" CTA button
   - Privacy note: "Audio processed locally. Never recorded."
   - How It Works section — 4 steps with CSS counters (not emoji numbers, which render inconsistently across OS):
     1. Pick a category
     2. Allow microphone access (or play manually)
     3. Tap squares when you hear a buzzword — or let the mic do it
     4. Get BINGO!

3. **`src/components/CategorySelect.tsx`**
   - Three `CategoryCard` components rendered from `CATEGORIES` data
   - Each shows icon, name, description, and 5 sample words (first 5 from the word pack, displayed as pill tags)
   - Click selects category → triggers card generation
   - Back button

4. **`src/App.tsx`** — wire up screen routing:
   ```
   'landing' → 'category' → 'game' → 'win'
   ```
   Screen state is a single `useState<Screen>` in `App.tsx`, no router library needed.

**Deliverable**: Can navigate from landing → category selection; `GameContext` is in place.

---

## Phase 6: Game Board (Manual Play)

**Goal**: Full bingo game works with manual square tapping; accessibility and 375px layout verified before speech is wired.

### Steps
1. **`src/components/BingoSquare.tsx`**
   - Visual states: default, filled (manual), auto-filled, free space, winning
   - Colors use CSS custom properties from `:root` (not hardcoded Tailwind classes)
   - Square ID format: `"row-col"` (e.g., `"2-3"`)
   - **Label truncation**: single-line ellipsis with a tooltip (`title` attribute) showing full word on hover; font size `text-xs` at all widths
   - `aria-label="{word}, row {r+1}, column {c+1}"`, `aria-pressed={isFilled}`, `role="gridcell"`
   - Free space: `aria-label="Free Space"`, `aria-disabled="true"`
   - `animate-pulse` on auto-filled squares wraps in `@media (prefers-reduced-motion: no-preference)` via Tailwind `motion-safe:`
   - `onClick` handler passed from parent; no-op when `isFreeSpace` or `isWon`

2. **`src/components/BingoCard.tsx`**
   - Renders 5×5 grid with `role="grid"`, `aria-label="Bingo Card"`
   - Each row has `role="row"`
   - Passes `isWinningSquare` flag (checks against `winningLine.squares`)

3. **`src/components/GameHeader.tsx`**
   - Displays category name, fill count (`filledCount / 24`), and elapsed time (live clock during `playing` status)

4. **`src/components/GameControls.tsx`**
   - "New Card" button (regenerates without leaving game screen — opens `Dialog` to confirm if game in progress)
   - "Start/Stop Listening" toggle (wired in Phase 7)

5. **`src/components/GameBoard.tsx`**
   - Assembles `BingoCard` + `GameHeader` + `TranscriptPanel` + `GameControls`
   - Receives named callback props from context (`onSquareClick`, `onToggleSquare`, `onNewCard`); does NOT accept raw state setter
   - `onSquareClick(row, col)` → `fillSquare()` → `checkForBingo()` → if win, call `onWin()`

6. **`src/hooks/useGame.ts`**
   - Manages `GameState` mutations: `fillSquare`, `toggleSquare` (with guard: cannot untoggle auto-filled or winning squares), `newCard`, `resetGame`
   - `resetGame()`: clears `localStorage`, resets `GameState` to `idle`, navigates to category screen
   - `alreadyFilled`: `string[]` stored in `GameState` (serializable to localStorage); tracks words filled by speech to prevent duplicates
   - Calls `checkForBingo` after every `fillSquare`; transitions status to `'won'` on match
   - Persists state to `localStorage` on every change

7. Wire category selection → `generateCard()` → set game state → show game board

8. **375px layout verification gate**: render the game board at 375px width in the browser and confirm all 25 squares are legible, no overflow. Fix before moving to Phase 7.

**Deliverable**: Complete manual bingo game at 375px and desktop. Click/toggle squares, get BINGO, see win state. Passes basic keyboard navigation (Tab to squares, Enter to fill).

---

## Phase 7: Speech Recognition

**Goal**: Squares auto-fill when buzzwords are spoken.

### Steps
1. **`src/hooks/useSpeechRecognition.ts`**
   - Wraps `window.SpeechRecognition || window.webkitSpeechRecognition`; typed via `@types/dom-speech-recognition` (no `any`)
   - Config: `continuous: true`, `interimResults: true`, `lang: 'en-US'`
   - **Auto-restart**: use a `ref` (`shouldRestartRef`) set in `startListening`/`stopListening`; inside `onend`, check `shouldRestartRef.current` before calling `recognition.start()` — do NOT call inside `setState`
   - **Transcript rolling buffer**: trim `transcript` to the last 2 000 characters before storing; prevents unbounded string growth over long meetings
   - **`isListening` source of truth**: `useSpeechRecognition` owns it; `GameState.isListening` is a derived mirror updated via callback only
   - Exposes: `isSupported`, `isListening`, `transcript`, `interimTranscript`, `error`, `startListening(onResult)`, `stopListening()`
   - **Strict Mode safety**: store the `SpeechRecognition` instance in a `ref`, not state; abort the old instance in the `useEffect` cleanup function

2. **`src/components/MicPermissionModal.tsx`**
   - Shown once before `startListening()` is ever called (if `permissionGranted` not in localStorage)
   - Uses `Dialog` primitive from Phase 4
   - Copy: "Meeting Bingo uses your microphone to detect buzzwords automatically. Audio is processed locally — never recorded or sent anywhere."
   - Buttons: "Allow Microphone" (calls `startListening`) | "Play Manually" (dismisses without requesting mic)
   - On dismiss, stores `micPromptSeen: true` in localStorage so it doesn't re-appear

3. **`src/components/TranscriptPanel.tsx`**
   - **Mic status dot**: pulsing red `●` when listening; `aria-label="Microphone active"` on the dot; ARIA live region (`aria-live="polite"`) announces "Listening started" / "Listening stopped"
   - Loading state: between "Start Listening" click and first `onresult` event (1–3s), show "Listening…" spinner with text "Waiting for audio…"
   - Shows last ~100 characters of `transcript`
   - Shows interim (in-progress) transcript in muted text
   - Detected word badges: keyed by `${word}-${detectedAtIndex}` (stable key, not array index)

4. **`src/components/UnsupportedBrowser.tsx`**
   - Shown instead of `TranscriptPanel` when `isSupported === false`
   - Copy: "Automatic detection isn't available in this browser. Tap squares manually when you hear a buzzword. Chrome or Edge recommended for full experience."
   - Visually distinct info banner (not an error); does not hide `GameBoard`

5. Wire speech into `GameBoard.tsx`:
   - Show `MicPermissionModal` on first "Start Listening" tap (if `micPromptSeen` is false)
   - `startListening((finalTranscript) => detectWordsWithAliases(...))` on each new final result
   - Detected words → `fillSquare(row, col, isAutoFilled=true)` for each match
   - `visibilitychange` event: call `stopListening()` on `hidden`, `startListening()` on `visible` (required, not optional)

**Deliverable**: Squares auto-fill when buzzwords are spoken. Transcript, mic status, and loading states all visible. Firefox shows the fallback banner gracefully.

---

## Phase 8: Win Screen and Celebration

**Goal**: Satisfying, shareable win state with clean transitions and accessibility.

### Steps
1. **`src/components/WinScreen.tsx`**
   - On mount: call `recognition.stop()` to halt speech recognition
   - On mount: move focus to the win screen heading (`<h2 ref={headingRef}>BINGO!</h2>` with `tabIndex={-1}; useEffect(() => headingRef.current?.focus(), [])`)
   - Display winning card with winning line highlighted in green
   - Game stats: time to BINGO (formatted mm:ss), winning word, squares filled
   - "Share Result" button → `shareResult(game, import.meta.env.VITE_APP_URL)`
   - "Play Again" → back to category selection
   - "Home" → back to landing

2. Confetti animation:
   ```ts
   import confetti from 'canvas-confetti';
   if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
     confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
   }
   ```
   Use a `ref` guard to ensure confetti fires exactly once even in React 18 Strict Mode double-invoke.

3. Win transition: brief 300ms fade from `GameBoard` → `WinScreen` (CSS `opacity` transition on the screen wrapper in `App.tsx`) to avoid a jarring snap.

4. **Share format**:
   ```
   Meeting Bingo — BINGO in 18 minutes!
   Winning word: "Scope Creep" | 12/24 squares
   Category: Agile & Scrum
   Play at: https://[your-domain]
   ```
   (No leading emoji — emoji are read aloud verbatim by screen readers in receiving apps like Slack/Teams.)

**Deliverable**: Win flow complete with confetti (motion-respecting), focus management, recognition stopped, and share button working.

---

## Phase 9: Polish and Edge Cases

**Goal**: App feels complete and handles edge cases gracefully.

### Steps
1. **localStorage persistence** — restore in-progress game on page reload:
   - `useLocalStorage(key, defaultValue)` with `try/catch` around `JSON.parse` and `localStorage.setItem`; log and discard on error
   - On restore, check `schemaVersion`; if missing or `!== 1`, discard and start fresh
2. **Responsive layout** — verify card is usable on mobile (375px portrait) and landscape; in landscape, consider wrapping `TranscriptPanel` in a collapsible drawer to avoid off-screen `GameControls`
3. **"One away" hint** — when `squaresNeeded === 1`, highlight the closest-to-win line with a subtle border pulse AND display a text hint: "One away on row 3!" (text required for colorblind/low-vision users)
4. **Text contrast** — all secondary text uses `--color-text-secondary: #374151` (≥4.5:1 on `#f3f4f6`); verify with browser DevTools contrast checker
5. **auto-pulse motion safety** — auto-filled squares use `motion-safe:animate-pulse`; squares are static for `prefers-reduced-motion: reduce` users
6. **Multiple simultaneous detections** — handle multiple words in one transcript chunk without race conditions (process as array, apply fills sequentially)
7. **Same word spoken twice** — `alreadyFilled` string[] in `GameState` prevents re-triggering; persisted to localStorage
8. **Tab visibility** — already handled in Phase 7 (required)
9. **Microphone denied** — clear error state with `error` Toast: "Microphone access denied — playing in manual mode"; set `isSupported = false` for remainder of session
10. **Regenerate card** — "New Card" button opens `Dialog` ("Start a new card? Your current progress will be lost.") if `status === 'playing'`
11. **`resetGame()` behavior** — clears `meeting-bingo-v1` from localStorage, resets `GameState` to `{ status: 'idle', ... }`, navigates to category screen

---

## Phase 10: Deploy

### Steps
1. Set `VITE_APP_URL` in Vercel project environment variables to the production domain
2. Add to `vite.config.ts`:
   ```ts
   build: {
     sourcemap: 'hidden', // source maps generated but not served to clients
   }
   ```
3. Create a `vercel.json` if needed (usually not required for Vite SPA)
4. Push to GitHub
5. Import repo in Vercel dashboard → auto-detect Vite → deploy
6. Verify Web Speech API works on deployed HTTPS URL (required for mic access)
7. Run Lighthouse against the deployed URL; target ≥90 Accessibility score

---

## File Checklist

### Source files to create

| File | Phase |
|------|-------|
| `src/types/index.ts` | 2 |
| `src/data/categories.ts` | 2 |
| `src/lib/cardGenerator.ts` | 3 |
| `src/lib/bingoChecker.ts` | 3 |
| `src/lib/wordDetector.ts` | 3 |
| `src/lib/shareUtils.ts` | 3 |
| `src/lib/__tests__/cardGenerator.test.ts` | 3 |
| `src/lib/__tests__/bingoChecker.test.ts` | 3 |
| `src/lib/__tests__/wordDetector.test.ts` | 3 |
| `src/lib/utils.ts` (cn helper) | 4 |
| `src/components/ui/Button.tsx` | 4 |
| `src/components/ui/Card.tsx` | 4 |
| `src/components/ui/Toast.tsx` | 4 |
| `src/components/ui/Dialog.tsx` | 4 |
| `src/context/GameContext.tsx` | 5 |
| `src/components/LandingPage.tsx` | 5 |
| `src/components/CategorySelect.tsx` | 5 |
| `src/App.tsx` | 5 |
| `src/components/BingoSquare.tsx` | 6 |
| `src/components/BingoCard.tsx` | 6 |
| `src/components/GameHeader.tsx` | 6 |
| `src/components/GameBoard.tsx` | 6 |
| `src/components/GameControls.tsx` | 6 |
| `src/hooks/useGame.ts` | 6 |
| `src/hooks/useLocalStorage.ts` | 6 |
| `src/hooks/useSpeechRecognition.ts` | 7 |
| `src/components/MicPermissionModal.tsx` | 7 |
| `src/components/TranscriptPanel.tsx` | 7 |
| `src/components/UnsupportedBrowser.tsx` | 7 |
| `src/components/WinScreen.tsx` | 8 |

---

## Key Decisions

- **No router library** — screen state is a single `useState<Screen>` in `App.tsx`; browser Back is not wired (post-MVP)
- **GameContext decided in Phase 5** — provides named dispatch callbacks to avoid prop-drilling and raw setter exposure
- **No raw state setter in props** — `GameBoard` and children receive only named callbacks; `setGame` never leaves `useGame`
- **`isListening` source of truth** — `useSpeechRecognition` owns it; `GameState.isListening` is a mirror updated via callback
- **Speech auto-restart** — `shouldRestartRef` checked in `onend` handler (outside `setState`) to avoid React 18 concurrent mode issues
- **`alreadyFilled` lives in `GameState`** — serializable to localStorage; passed to `detectWordsWithAliases` on each transcript result
- **Transcript rolling buffer** — capped at 2 000 characters to prevent unbounded growth
- **Word detection** — single words use `\b` regex boundaries; multi-word phrases use substring match; abbreviations via `WORD_ALIASES`
- **Free space** — always at `[2][2]`, pre-filled at card generation, counts toward all win line checks
- **Win check** — runs synchronously after every `fillSquare`; checks all 12 lines (rows → cols → diagonals), returns on first match
- **`toggleSquare` guard** — auto-filled squares and squares in the winning line cannot be toggled off
- **Confetti + motion** — `prefers-reduced-motion: reduce` skips confetti and all `animate-pulse`; Strict Mode double-fire prevented with `ref` guard
- **Share text** — no leading emoji (read aloud verbatim by VoiceOver/TalkBack in Slack/Teams)
- **localStorage schema** — key `meeting-bingo-v1`; schema version `1` stored in state; version mismatch discards stale data
