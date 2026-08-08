/**
 * Client-side SPA Router
 */

import { renderWelcomeView } from './views/welcome.js';
import { renderChatView } from './views/chat.js';
import { renderMemoryView } from './views/memory.js';
import { renderTimelineView } from './views/timeline.js';
import { renderSettingsView } from './views/settings.js';
import { renderDashboardView } from './views/dashboard.js';
import { renderSidebar } from './components/sidebar.js';
import { renderBottomNav } from './components/bottomNav.js';
import { memoryStore } from './memory/store.js';

export class Router {
  constructor() {
    this.mainContent = document.getElementById('main-content');
    window.addEventListener('hashchange', () => this.handleRoute());
  }

  init() {
    // If no API key set yet, direct to welcome
    if (!window.location.hash) {
      if (!memoryStore.getApiKey()) {
        window.location.hash = '#welcome';
      } else {
        window.location.hash = '#chat';
      }
    } else {
      this.handleRoute();
    }
  }

  handleRoute() {
    const hash = window.location.hash || '#welcome';

    // Run cleanup for the previously rendered view (unsubscribe listeners, etc.)
    if (typeof this.activeViewCleanup === 'function') {
      this.activeViewCleanup();
      this.activeViewCleanup = null;
    }

    // Render navigation sidebar and bottom nav with updated active link
    renderSidebar(hash);
    renderBottomNav(hash);

    // Render corresponding view into main content
    switch (hash) {
      case '#welcome':
        renderWelcomeView(this.mainContent);
        break;
      case '#chat':
        this.activeViewCleanup = renderChatView(this.mainContent);
        break;
      case '#memory':
        renderMemoryView(this.mainContent);
        break;
      case '#timeline':
        renderTimelineView(this.mainContent);
        break;
      case '#dashboard':
        renderDashboardView(this.mainContent);
        break;
      case '#settings':
        renderSettingsView(this.mainContent);
        break;
      default:
        window.location.hash = '#welcome';
    }
  }
}

export const router = new Router();
