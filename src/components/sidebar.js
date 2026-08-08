/**
 * Navigation Sidebar Component
 */

import { memoryStore } from '../memory/store.js';
import { markdownEngine } from '../export/markdown.js';

export function renderSidebar(currentPath) {
  const container = document.getElementById('sidebar-container');
  if (!container) return;

  const stats = memoryStore.getStats();
  const targetGoal = 20;
  const progressPercent = Math.min(100, Math.round((stats.total / targetGoal) * 100));

  const navItems = [
    { path: '#chat', label: 'AI Interview Chat', icon: '💬' },
    { path: '#memory', label: 'Memory Vault', icon: '🧠' },
    { path: '#dashboard', label: 'Dashboard', icon: '📊' },
    { path: '#timeline', label: 'Life Timeline', icon: '⏳' },
    { path: '#settings', label: 'Settings & API Key', icon: '⚙️' }
  ];

  container.innerHTML = `
    <div class="sidebar">
      <div>
        <a href="#welcome" class="sidebar-brand">
          <div class="sidebar-logo-icon">🧠</div>
          <div>
            <div class="sidebar-title">Personal Memory</div>
            <div style="font-size: 0.72rem; color: var(--text-dim);">Portable Digital Vault</div>
          </div>
        </a>

        <nav class="sidebar-nav">
          ${navItems.map(item => `
            <a href="${item.path}" class="nav-link ${currentPath === item.path ? 'active' : ''}">
              <span class="nav-icon">${item.icon}</span>
              <span>${item.label}</span>
            </a>
          `).join('')}
        </nav>
      </div>

      <div class="sidebar-footer">
        <div class="memory-stats-badge">
          <div class="stats-label">Memory Vault Depth</div>
          <div class="stats-progress-bar">
            <div class="stats-progress-fill" style="width: ${progressPercent}%;"></div>
          </div>
          <div class="stats-count">
            <span>${stats.total} memories recorded</span>
            <span>${progressPercent}%</span>
          </div>
        </div>

        <button id="quick-export-btn" class="btn btn-secondary btn-sm" style="width: 100%;">
          <span>📥 Export Markdown</span>
        </button>
      </div>
    </div>
  `;

  // Attach quick export listener
  const exportBtn = document.getElementById('quick-export-btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      markdownEngine.downloadMarkdownFile();
    });
  }
}
