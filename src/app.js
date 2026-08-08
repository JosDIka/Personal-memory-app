/**
 * Main Application Orchestrator
 */

import { router } from './router.js';
import { memoryStore } from './memory/store.js';
import { renderSidebar } from './components/sidebar.js';

export function initApp() {
  // Re-render sidebar whenever memory store changes
  memoryStore.subscribe(() => {
    renderSidebar(window.location.hash || '#welcome');
  });

  // Start router
  router.init();
}
