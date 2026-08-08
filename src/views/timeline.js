/**
 * Life Timeline View
 */

import { memoryStore } from '../memory/store.js';
import { getCategoryMeta } from '../memory/categories.js';
import { escapeHtml } from '../utils/escapeHtml.js';

export function renderTimelineView(container) {
  const events = memoryStore.getTimelineEvents();

  container.innerHTML = `
    <div class="timeline-view">
      <div class="page-header">
        <h1 class="page-title">⏳ Chronological Life Timeline</h1>
        <p class="page-subtitle">A chronological view of major milestones, life events, and recorded memories.</p>
      </div>

      ${events.length === 0 ? `
        <div style="text-align: center; padding: 4rem 1rem; color: var(--text-dim);">
          <div style="font-size: 3rem; margin-bottom: 1rem;">⏳</div>
          <h3>No dated timeline events recorded yet</h3>
          <p style="margin-top: 0.5rem;">As you share life milestones and dates during your AI interviews, your timeline will take shape here.</p>
        </div>
      ` : `
        <div class="timeline-container">
          <div class="timeline-line"></div>
          ${events.map(event => {
            const catMeta = getCategoryMeta(event.category);
            const displayDate = event.date || new Date(event.createdAt).toLocaleDateString();

            return `
              <div class="timeline-event">
                <div class="timeline-node" style="background: ${catMeta.color};"></div>
                <div class="timeline-card">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
                    <span class="timeline-date">📅 ${escapeHtml(displayDate)}</span>
                    <span style="font-size: 0.8rem; color: var(--text-muted);">${catMeta.icon} ${catMeta.label}</span>
                  </div>
                  <h3 style="font-size: 1.1rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.5rem;">
                    ${escapeHtml(event.title)}
                  </h3>
                  <p style="font-size: 0.9rem; color: var(--text-muted); line-height: 1.5;">
                    ${escapeHtml(event.content)}
                  </p>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `}
    </div>
  `;
}
