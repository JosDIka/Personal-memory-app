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
          <span>📥 Export Backup</span>
        </button>
        <button id="quick-import-btn" class="btn btn-secondary btn-sm" style="width: 100%; margin-top: 6px;">
          <span>📤 Import Backup</span>
        </button>
        <input type="file" id="quick-import-file" accept=".md,.json" style="display: none;" />
      </div>
    </div>
  `;

  // Attach quick export listener (JSON by default for full fidelity)
  const exportBtn = document.getElementById('quick-export-btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      markdownEngine.downloadJSONFile();
    });
  }

  // Attach quick import listener (supports both .md and .json)
  const importBtn = document.getElementById('quick-import-btn');
  const importFile = document.getElementById('quick-import-file');
  if (importBtn && importFile) {
    importBtn.addEventListener('click', () => importFile.click());
    importFile.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
        const content = evt.target.result;
        let count = 0;
        if (file.name.endsWith('.json')) {
          count = markdownEngine.importFromJSON(content);
        } else {
          count = markdownEngine.importFromMarkdown(content);
        }
        if (count > 0) {
          alert(`✅ Imported ${count} memories successfully!`);
          renderSidebar(currentPath);
        } else {
          alert('⚠️ No memories found in the file. Make sure it was exported from this app.');
        }
      };
      reader.readAsText(file);
      importFile.value = '';
    });
  }
}
