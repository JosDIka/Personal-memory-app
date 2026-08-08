/**
 * Memory Dashboard & Analytics View
 */

import { memoryStore } from '../memory/store.js';
import { MEMORY_CATEGORIES } from '../memory/categories.js';
import { STAGES } from '../interview/stages.js';
import { escapeHtml } from '../utils/escapeHtml.js';

export function renderDashboardView(container) {
  const stats = memoryStore.getStats();
  const allMemories = memoryStore.getAll();
  const totalCategories = Object.keys(MEMORY_CATEGORIES).length;
  const activeCategories = Object.keys(stats.byCategory).length;
  const completeness = Math.round((activeCategories / totalCategories) * 100);

  // Calculate per-category completeness (target: 3 memories each)
  const targetPerCategory = 3;
  const categoryScores = Object.entries(MEMORY_CATEGORIES).map(([id, cat]) => {
    const count = stats.byCategory[id] || 0;
    const score = Math.min(100, Math.round((count / targetPerCategory) * 100));
    return { id, ...cat, count, score };
  });

  // Find weakest categories for recommendations
  const weakCategories = categoryScores
    .filter(c => c.score < 100)
    .sort((a, b) => a.score - b.score)
    .slice(0, 3);

  // Build donut chart data
  const donutSegments = buildDonutChart(categoryScores.filter(c => c.count > 0));

  container.innerHTML = `
    <div class="memory-view">
      <div class="page-header">
        <h1 class="page-title">📊 Memory Dashboard</h1>
        <p class="page-subtitle">Overview of your personal memory vault completeness and distribution.</p>
      </div>

      <!-- Summary Cards -->
      <div class="dashboard-summary">
        <div class="summary-card">
          <div class="summary-value" style="color: var(--accent-violet);">${stats.total}</div>
          <div class="summary-label">Total Memories</div>
        </div>
        <div class="summary-card">
          <div class="summary-value" style="color: var(--accent-emerald);">${stats.confirmed}</div>
          <div class="summary-label">Confirmed Facts</div>
        </div>
        <div class="summary-card">
          <div class="summary-value" style="color: var(--accent-cyan);">${activeCategories}/${totalCategories}</div>
          <div class="summary-label">Categories Active</div>
        </div>
        <div class="summary-card">
          <div class="summary-value" style="color: ${completeness >= 80 ? 'var(--accent-emerald)' : completeness >= 50 ? 'var(--accent-amber)' : 'var(--accent-rose)'};">${completeness}%</div>
          <div class="summary-label">Vault Completeness</div>
        </div>
      </div>

      <div class="dashboard-grid">
        <!-- Donut Chart -->
        <div class="dashboard-card">
          <h3 class="dashboard-card-title">Category Distribution</h3>
          ${stats.total === 0 ? `
            <div class="empty-state">
              <div style="font-size: 3rem; margin-bottom: 1rem;">🧠</div>
              <p>No memories recorded yet. Start an interview to begin building your vault!</p>
            </div>
          ` : `
            <div class="donut-chart-container">
              ${donutSegments.svg}
              <div class="donut-center">
                <div class="donut-center-value">${stats.total}</div>
                <div class="donut-center-label">memories</div>
              </div>
            </div>
            <div class="donut-legend">
              ${categoryScores.filter(c => c.count > 0).map(c => `
                <div class="legend-item">
                  <span class="legend-dot" style="background: ${c.color};"></span>
                  <span class="legend-label">${c.icon} ${c.label}</span>
                  <span class="legend-count">${c.count}</span>
                </div>
              `).join('')}
            </div>
          `}
        </div>

        <!-- Category Completeness -->
        <div class="dashboard-card">
          <h3 class="dashboard-card-title">Category Completeness</h3>
          <p class="dashboard-card-desc">Target: ${targetPerCategory} memories per category</p>
          <div class="completeness-list">
            ${categoryScores.map(c => `
              <div class="completeness-row">
                <div class="completeness-info">
                  <span>${c.icon} ${c.label}</span>
                  <span class="completeness-count">${c.count}/${targetPerCategory}</span>
                </div>
                <div class="completeness-bar">
                  <div class="completeness-fill" style="width: ${c.score}%; background: ${c.color};"></div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Recommendations -->
      ${weakCategories.length > 0 ? `
        <div class="dashboard-card" style="margin-top: 1.5rem;">
          <h3 class="dashboard-card-title">💡 Suggested Next Topics</h3>
          <p class="dashboard-card-desc">These areas need more depth. Talk about them in your next interview!</p>
          <div class="recommendations-grid">
            ${weakCategories.map(c => `
              <div class="recommendation-card">
                <div class="recommendation-icon">${c.icon}</div>
                <div class="recommendation-info">
                  <div class="recommendation-title">${c.label}</div>
                  <div class="recommendation-desc">${c.description}</div>
                  <div class="recommendation-progress">
                    <div class="completeness-bar" style="height: 4px;">
                      <div class="completeness-fill" style="width: ${c.score}%; background: ${c.color};"></div>
                    </div>
                    <span style="font-size: 0.75rem; color: var(--text-dim);">${c.count} of ${targetPerCategory}</span>
                  </div>
                </div>
                <a href="#chat" class="btn btn-ghost btn-sm" style="flex-shrink: 0;">💬 Talk about it</a>
              </div>
            `).join('')}
          </div>
        </div>
      ` : `
        <div class="dashboard-card" style="margin-top: 1.5rem; text-align: center;">
          <div style="font-size: 2rem; margin-bottom: 0.5rem;">🎉</div>
          <h3 class="dashboard-card-title">All Categories Complete!</h3>
          <p class="dashboard-card-desc">Your memory vault is well-rounded. Keep adding depth through interviews and reflections.</p>
        </div>
      `}

      <!-- Interview Stage -->
      <div class="dashboard-card" style="margin-top: 1.5rem;">
        <h3 class="dashboard-card-title">🎯 Interview Progress</h3>
        <div class="stage-progress">
          ${STAGES.map(s => {
            const currentStage = memoryStore.getInterviewStage();
            const isActive = s.id === currentStage;
            const isComplete = s.id < currentStage;
            return `
              <div class="stage-item ${isActive ? 'active' : ''} ${isComplete ? 'complete' : ''}">
                <div class="stage-icon">${s.icon}</div>
                <div class="stage-label">${s.shortName}</div>
                ${isComplete ? '<div class="stage-check">✓</div>' : ''}
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>
  `;
}

function buildDonutChart(categoryScores) {
  const size = 200;
  const strokeWidth = 28;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = categoryScores.reduce((sum, c) => sum + c.count, 0);

  if (total === 0) return { svg: '' };

  let accumulated = 0;
  const segments = categoryScores.map(c => {
    const percent = c.count / total;
    const dashArray = `${circumference * percent} ${circumference * (1 - percent)}`;
    const dashOffset = circumference * (1 - accumulated / total);
    accumulated += c.count;

    return `<circle
      cx="${size / 2}" cy="${size / 2}" r="${radius}"
      fill="none"
      stroke="${c.color}"
      stroke-width="${strokeWidth}"
      stroke-dasharray="${dashArray}"
      stroke-dashoffset="${dashOffset}"
      transform="rotate(-90 ${size / 2} ${size / 2})"
      style="transition: all 0.6s ease;"
    />`;
  });

  const svg = `
    <svg viewBox="0 0 ${size} ${size}" class="donut-svg">
      <circle cx="${size / 2}" cy="${size / 2}" r="${radius}"
        fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="${strokeWidth}" />
      ${segments.join('')}
    </svg>
  `;

  return { svg };
}
