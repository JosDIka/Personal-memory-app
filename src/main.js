/**
 * Application Entry Point
 */

import { initApp } from './app.js';

document.addEventListener('DOMContentLoaded', () => {
  initApp();

  // Register service worker for PWA offline support
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => {
        console.log('Service Worker registered:', reg.scope);
      })
      .catch(err => {
        console.warn('Service Worker registration failed:', err);
      });
  }
});
