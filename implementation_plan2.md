# Personal Memory — Full Review & Improvement Plan

## Project Analysis Summary

The core foundation is solid: the AI interview loop, memory extraction pipeline, localStorage persistence, and Markdown export all work. However, after a thorough review, there are **5 critical functional bugs**, **8 major missing features**, and **significant UX/mobile shortcomings** that prevent this from being a best-in-class app.

---

## 🐛 Critical Bugs Found

| # | Bug | Location | Impact |
|---|-----|----------|--------|
| 1 | **XSS Security hole** — `innerHTML` renders raw AI text, meaning any `<script>` or `<img onerror>` in AI output executes | `chat.js:89` | 🔴 High |
| 2 | **Memory extraction doubles API calls** — each user message triggers TWO API calls simultaneously (one for interview response + one for extraction), quickly eating rate limits | `engine.js:42` | 🔴 High |
| 3 | **Unsubscribed chat listeners** — `chatSession.subscribe()` is called but the returned `unsubscribe` function is never invoked when navigating away, causing memory leaks | `chat.js:186` | 🟡 Medium |
| 4 | **Stage progression never reflects in header** — when the stage advances, the chat header still shows the old stage until page reload | `chat.js:11` | 🟡 Medium |
| 5 | **History grows unbounded** — the full conversation history (potentially 100+ turns) is sent to the API on every single message, inflating tokens and causing failures | `chat.js:153` | 🟡 Medium |

---

## 🚀 Major Features to Add

### 1. 📲 Progressive Web App (PWA) — Install on Android Home Screen
Make the app installable on Android as if it were a native app. Users open from home screen, it feels like an app, works offline, and syncs.

### 2. 🔄 Auto-Retry with Exponential Backoff
When the AI API hits a rate limit (429) or overload (503), the app should silently wait and retry up to 3 times instead of immediately showing an error.

### 3. 📝 Inline Memory Editing
Currently memories can only be deleted. Users need to be able to **click and edit** any memory card directly inside the Memory Vault.

### 4. 🔍 Smart Memory Deduplication
When extraction runs, it should compare new candidates against *all* existing memories by semantic similarity (title + content keyword overlap), not just the prompt-based instruction, to truly avoid duplicates.

### 5. 🎭 Conversation Modes
Add a mode switcher to the chat:
- **Interview Mode** (current) — AI asks structured questions
- **Free Reflection Mode** — User writes anything, AI just listens and extracts
- **Review Mode** — AI picks a random existing memory and asks a follow-up

### 6. 📊 Memory Dashboard / Stats Page
A visual overview of the entire vault: category distribution chart (SVG donut), completeness score, memories added over time, and suggested areas to fill in.

### 7. 🔐 Local Password / PIN Lock
Optional PIN protection for the app (stored as hashed value in localStorage) so sensitive memories are protected if someone accesses the device.

### 8. 🌐 One-Click Vercel / Netlify Deploy
Add a `vercel.json` config and full step-by-step deployment so anyone can get a live HTTPS URL (accessible on Android Chrome) in under 5 minutes.

---

## 🎨 UX & Design Improvements

### Mobile-First Responsive Overhaul
- The sidebar is barely functional on mobile (hidden labels, wrong layout)
- Chat input area needs larger touch targets for thumbs
- Memory cards need swipe-to-delete on mobile
- Navigation should collapse into a bottom tab bar on mobile

### Chat Improvements
- **Markdown rendering** — AI responses render as proper formatted text (bold, lists, etc.) not raw `\n` characters
- **Auto-resize textarea** — Input box grows as user types, not fixed height
- **Send button disabled state** — While AI is responding, disable the send button to prevent double-sends
- **Scroll position memory** — Don't jump to bottom when user is reading old messages

### Memory Vault Improvements
- **Edit button** on each memory card with inline editing
- **Confirmation badge** — Tap to mark `needs_confirmation` as `confirmed`
- **Sort options** — Sort by date, category, confidence

---

## 🏗️ Phase-by-Phase Implementation

### Phase 1 — Critical Bug Fixes (High Priority)
1. Fix XSS by using `textContent` instead of `innerHTML` for message rendering
2. Eliminate the double API call — run extraction async *after* response is received
3. Fix subscription memory leak with cleanup on route change
4. Cap history to last 20 messages sent to API
5. Fix stage header refresh after progression

### Phase 2 — PWA & Cloud Deployment
1. Add `manifest.json` with app metadata, icons, theme color
2. Add `service-worker.js` for offline caching
3. Add `vercel.json` deployment config
4. Register service worker in `main.js`

### Phase 3 — Core Feature Additions
1. Auto-retry with exponential backoff in `gemini.js`
2. Inline memory editing in `memory.js`
3. Conversation mode switcher in chat view
4. Smart deduplication check before saving memories

### Phase 4 — Dashboard & Analytics
1. Memory Dashboard with SVG donut chart
2. Completeness score (% of all 9 categories filled)
3. Suggested topics to explore next

### Phase 5 — Mobile UX Polish
1. Bottom tab bar for mobile navigation
2. Touch-friendly memory cards
3. Markdown rendering for AI messages
4. Auto-grow textarea

---

## 🌐 Free Cloud Hosting Plan

### Vercel (Recommended — Fastest, 1 Minute)
```
1. Create account at vercel.com using GitHub login
2. Create a GitHub repository and push this project
3. In Vercel: "Add New Project" → select repo
4. Framework: Vite (auto-detected)
5. Click Deploy → get your https://your-app.vercel.app
```

### Netlify (Alternative)
```
1. Run: npm run build  (creates the /dist folder)
2. Go to netlify.com → drag-and-drop the /dist folder
3. Get your https://your-app.netlify.app instantly, no GitHub needed
```

> [!IMPORTANT]
> **Android Home Screen Installation**: Once hosted on HTTPS (Vercel/Netlify), open the URL in Chrome on Android → tap the 3-dot menu → "Add to Home Screen". The PWA will install like a native app!

> [!NOTE]
> **Your API key stays private** — it never gets deployed. Each person who uses the app enters their own API key stored in their own browser.

---

## Verification After All Phases

- [ ] App installs on Android home screen as PWA
- [ ] AI responds without any XSS, history errors, or leaks
- [ ] Memories can be edited inline in the vault
- [ ] Stage header updates immediately when progression occurs
- [ ] Rate limit errors auto-retry silently
- [ ] Dashboard shows memory completeness visually
- [ ] App is live at an HTTPS URL on Vercel/Netlify
- [ ] Full mobile layout works perfectly on 375px width

---

## Open Questions

> [!IMPORTANT]
> **Which phases should I prioritize first?**
> - A) Fix all bugs + deploy to Vercel immediately (fastest path to mobile access)
> - B) Fix bugs + add PWA first (best Android experience)
> - C) Do everything — all 5 phases in full (full rebuild, 1-2 hours)
