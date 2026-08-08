# Personal Memory App — Session Handoff & Implementation Plan

This file contains the complete project status, found bugs, proposed improvements, and the step-by-step implementation plan. You can share this file with the next AI agent session to resume work immediately.

---

## 📋 Project Summary & Status
- **Architecture**: Vite + Vanilla JS SPA (Single Page Application)
- **AI Integration**: Custom browser-compatible `GeminiService` using native REST `fetch` (bypasses CORS and heavy SDK bundling issues)
- **Data Storage**: Local browser-only persistence using `localStorage` through `MemoryStore`
- **Main Features**: Multi-stage AI biographer interviewer, automatic background memory extraction, markdown export/import, visual timeline, settings diagnostic tool
- **Local Dev Server**: Vite running on `http://localhost:3000/`

---

## 🐛 Critical Bugs Found (To Be Fixed)

1. **XSS Security Vulnerability**
   - **Location**: `src/views/chat.js` (inside `renderMessages()`)
   - **Issue**: AI response text is rendered directly via `innerHTML`. Any HTML, `<script>`, or image tags with `onerror` attributes inside AI messages will execute raw JavaScript.
   - **Fix**: Sanitize output or use text-safe elements.

2. **API Rate Limit Exhaustion (Double Calls)**
   - **Location**: `src/interview/engine.js` (inside `processTurn()`)
   - **Issue**: Every single user message triggers *two parallel API calls* to Gemini (one for generating the interviewer response and one for memory extraction). This quickly exhausts free-tier quota limits.
   - **Fix**: Combine them, run extraction sequentially, or only trigger extraction when structural markers suggest a memory was shared.

3. **Unbounded Chat History (Token Bloat)**
   - **Location**: `src/views/chat.js` (inside `handleSend()`)
   - **Issue**: The entire chat log history is serialized and sent to the Gemini API on every single turn. Over time, this causes massive token usage and eventual model timeout errors.
   - **Fix**: Cap the history sent to the API to the last 15-20 turns.

4. **Memory Leak in Router Navigation**
   - **Location**: `src/views/chat.js` (and other views subscribing to store changes)
   - **Issue**: Views call `chatSession.subscribe()` or `memoryStore.subscribe()` but never call the returned `unsubscribe` cleanup function when the router navigates to another page, accumulating duplicate event listeners.
   - **Fix**: Store the unsubscribe functions and execute them in the router lifecycle.

5. **Stage Progression UI Refresh Lag**
   - **Location**: `src/interview/engine.js` & `src/views/chat.js`
   - **Issue**: When the user triggers progression to the next stage, the active header in the chat view remains on the old stage until they refresh the browser page.
   - **Fix**: Have the chat view subscribe to stage transition events or re-render elements dynamically.

---

## 🚀 Proposed Improvements & Upgrade Plan

### Phase 1: Critical Bug Fixes & Stabilization
- [ ] Implement robust HTML sanitization or secure rendering in `chat.js` to fix XSS.
- [ ] Optimize Gemini Service to avoid parallel API requests and reduce quota limits.
- [ ] Limit conversation context window to last 15 messages in chat history.
- [ ] Clean up event subscriptions on view navigation to prevent memory leaks.
- [ ] Dynamically update stage header immediately when user unlocks the next stage.

### Phase 2: Offline Capability & Progressive Web App (PWA)
- [ ] Add a `manifest.json` containing the app metadata, name, theme colors, and icons.
- [ ] Write a `service-worker.js` for offline asset caching.
- [ ] Register the service worker in `src/main.js` so it can be installed on Android and PC desktop.

### Phase 3: Premium App Features & UX Overhaul
- [ ] **Inline Memory Editing**: Add edit actions on memory cards in `src/views/memory.js` so users can manually refine extracted information.
- [ ] **Auto-Retry & Backoff**: Add automatic rate limit checks (HTTP 429) and retry with exponential backoff in `src/ai/gemini.js`.
- [ ] **Smart Deduplication**: Implement keywords/phrase overlap checks to avoid saving duplicate or near-identical memories.
- [ ] **Multiple Chat Modes**: Add a mode toggle between:
  1. *Interview Mode* (Standard guided autobiography)
  2. *Free Reflection Mode* (User notes down thoughts, AI extracts in the background)
  3. *Vault Review* (AI picks an existing memory card and asks deep follow-up questions to refine it)

### Phase 4: Data Dashboard & Analytics
- [ ] Add a visual dashboard showing:
  - Total memories recorded by category.
  - Completeness percentages for each of the 9 memory categories.
  - Category breakdown using a clean, light SVG donut chart.
  - Quick recommendations on which areas the user should talk about next.

### Phase 5: Mobile-First Responsive Design
- [ ] Replace the desktop sidebar with a bottom navigation bar on mobile layouts.
- [ ] Auto-resize input textareas as the user types.
- [ ] Implement swipe/touch actions for quick operations on mobile.

---

## ☁️ Free Cloud Hosting Guide

### Method A: One-Click Vercel Deployment (Recommended)
1. Initialize a Git repository in the project folder:
   ```bash
   git init
   git add .
   git commit -m "initial commit"
   ```
2. Create a new repository on GitHub and push the code.
3. Sign up/Log in to [Vercel](https://vercel.com).
4. Click **Add New Project**, import the GitHub repository, select **Vite** as the framework template, and click **Deploy**.
5. Access your app anywhere from PC, Tablet, or Android.

### Method B: Netlify CLI/Drag-and-Drop
1. Build the production assets locally:
   ```bash
   npm run build
   ```
2. Go to [Netlify](https://www.netlify.com) and log in.
3. Drag and drop the generated `dist/` directory directly into the Netlify UI to deploy it instantly to a free sub-domain.

---

## 📂 Source Code Files Reference
Here are the files currently present in this project's code structure:
- **Core App**: [`index.html`](file:///c:/Users/Irene/Desktop/LEARN%20IT/Memory%20app/index.html) | [`package.json`](file:///c:/Users/Irene/Desktop/LEARN%20IT/Memory%20app/package.json) | [`vite.config.js`](file:///c:/Users/Irene/Desktop/LEARN%20IT/Memory%20app/vite.config.js)
- **AI Core**: [`src/ai/gemini.js`](file:///c:/Users/Irene/Desktop/LEARN%20IT/Memory%20app/src/ai/gemini.js) | [`src/ai/prompts.js`](file:///c:/Users/Irene/Desktop/LEARN%20IT/Memory%20app/src/ai/prompts.js)
- **Interview Logic**: [`src/interview/engine.js`](file:///c:/Users/Irene/Desktop/LEARN%20IT/Memory%20app/src/interview/engine.js) | [`src/interview/stages.js`](file:///c:/Users/Irene/Desktop/LEARN%20IT/Memory%20app/src/interview/stages.js)
- **Storage/Import**: [`src/memory/store.js`](file:///c:/Users/Irene/Desktop/LEARN%20IT/Memory%20app/src/memory/store.js) | [`src/memory/categories.js`](file:///c:/Users/Irene/Desktop/LEARN%20IT/Memory%20app/src/memory/categories.js) | [`src/export/markdown.js`](file:///c:/Users/Irene/Desktop/LEARN%20IT/Memory%20app/src/export/markdown.js)
- **Views**: [`src/views/chat.js`](file:///c:/Users/Irene/Desktop/LEARN%20IT/Memory%20app/src/views/chat.js) | [`src/views/memory.js`](file:///c:/Users/Irene/Desktop/LEARN%20IT/Memory%20app/src/views/memory.js) | [`src/views/settings.js`](file:///c:/Users/Irene/Desktop/LEARN%20IT/Memory%20app/src/views/settings.js)
- **Styles**: [`src/styles/index.css`](file:///c:/Users/Irene/Desktop/LEARN%20IT/Memory%20app/src/styles/index.css)
