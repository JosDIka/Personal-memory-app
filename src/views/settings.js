/**
 * Settings & Data Management View
 */

import { memoryStore } from '../memory/store.js';
import { markdownEngine } from '../export/markdown.js';
import { STAGES } from '../interview/stages.js';
import { toast } from '../components/toast.js';
import { escapeHtml } from '../utils/escapeHtml.js';

export function renderSettingsView(container) {
  const apiKey = memoryStore.getApiKey();
  const stats = memoryStore.getStats();
  const currentStage = memoryStore.getInterviewStage();
  const selectedModel = memoryStore.getModelPreference();

  container.innerHTML = `
    <div class="memory-view" style="max-width: 800px; margin: 0 auto;">
      <div class="page-header">
        <h1 class="page-title">⚙️ App Settings & Data Backup</h1>
        <p class="page-subtitle">Manage your API credentials, view vault statistics, and export or restore your data.</p>
      </div>

      <!-- API Key Card -->
      <div class="feature-card" style="margin-bottom: 2rem;">
        <h3 class="feature-title" style="margin-bottom: 1rem;">🔑 Google Gemini API Configuration</h3>
        <div class="form-group">
          <label class="form-label" for="settings-api-key">Gemini API Key</label>
          <input 
            type="password" 
            id="settings-api-key" 
            class="form-input" 
            placeholder="AIzaSy..." 
            value="${escapeHtml(apiKey)}" 
          />
          <div class="form-hint">
            Get a free key from <a href="https://aistudio.google.com/" target="_blank" style="color: var(--accent-violet);">Google AI Studio</a>. Saved locally in your browser.
          </div>
        </div>

        <div class="form-group" style="margin-top: 1.25rem;">
          <label class="form-label" for="settings-model-select">Selected Model</label>
          <select id="settings-model-select" class="form-input">
            <option value="gemini-2.5-flash" ${selectedModel === 'gemini-2.5-flash' ? 'selected' : ''}>gemini-2.5-flash (Latest — default)</option>
            <option value="gemini-2.0-flash-lite" ${selectedModel === 'gemini-2.0-flash-lite' ? 'selected' : ''}>gemini-2.0-flash-lite (Very high quota free model)</option>
            <option value="gemini-2.0-flash" ${selectedModel === 'gemini-2.0-flash' ? 'selected' : ''}>gemini-2.0-flash (Fast intelligence)</option>
            <option value="gemini-flash-latest" ${selectedModel === 'gemini-flash-latest' ? 'selected' : ''}>gemini-flash-latest (Gemini 1.5 Flash stable)</option>
            <option value="gemini-2.5-pro" ${selectedModel === 'gemini-2.5-pro' ? 'selected' : ''}>gemini-2.5-pro (Highly intelligent reasoning)</option>
          </select>
          <div class="form-hint">
            💡 If you receive 429 quota limit errors on new models, try switching to **gemini-2.0-flash-lite** or **gemini-flash-latest** which have more generous rate limits.
          </div>
        </div>

        <button id="save-key-btn" class="btn btn-primary btn-sm">
          <span>Save API Configuration</span>
        </button>
        <button id="test-connection-btn" class="btn btn-secondary btn-sm" style="margin-left: 0.5rem;">
          <span>🔍 Test Connection</span>
        </button>

        <div id="connection-result" style="margin-top: 1.25rem; font-family: var(--font-mono); font-size: 0.85rem; padding: 0.85rem; border-radius: var(--radius-sm); display: none; white-space: pre-wrap; line-height: 1.5;"></div>
      </div>

      <!-- Interview Stage Selector -->
      <div class="feature-card" style="margin-bottom: 2rem;">
        <h3 class="feature-title" style="margin-bottom: 1rem;">🎯 Current Interview Stage</h3>
        <div class="form-group">
          <select id="stage-select" class="form-input">
            ${STAGES.map(s => `
              <option value="${s.id}" ${currentStage === s.id ? 'selected' : ''}>
                Stage ${s.id}: ${s.title}
              </option>
            `).join('')}
          </select>
        </div>
        <button id="save-stage-btn" class="btn btn-secondary btn-sm">
          <span>Set Active Stage</span>
        </button>
      </div>

      <!-- Data Backup & Export -->
      <div class="feature-card" style="margin-bottom: 2rem;">
        <h3 class="feature-title" style="margin-bottom: 1rem;">📦 Data Export & Import</h3>
        <p class="feature-desc" style="margin-bottom: 1.25rem;">
          Export your personal memory vault for full portability, offline backups, or future AI model usage. JSON preserves all data perfectly; Markdown is human-readable.
        </p>

        <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
          <button id="export-json-btn" class="btn btn-primary btn-sm">
            <span>📥 Export as JSON (Recommended)</span>
          </button>
          <button id="export-md-btn" class="btn btn-secondary btn-sm">
            <span>📥 Export as Markdown</span>
          </button>
          <label class="btn btn-secondary btn-sm" style="cursor: pointer;">
            <span>📤 Import Backup (.json or .md)</span>
            <input type="file" id="import-file-input" accept=".json,.md,.markdown,.txt" style="display: none;" />
          </label>
        </div>
      </div>

      <!-- Vault Statistics -->
      <div class="feature-card" style="margin-bottom: 2rem;">
        <h3 class="feature-title" style="margin-bottom: 1rem;">📊 Vault Statistics</h3>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; text-align: center;">
          <div style="background: var(--bg-surface); padding: 1rem; border-radius: var(--radius-md);">
            <div style="font-size: 1.8rem; font-weight: 700; color: var(--accent-violet);">${stats.total}</div>
            <div style="font-size: 0.8rem; color: var(--text-muted);">Total Memories</div>
          </div>
          <div style="background: var(--bg-surface); padding: 1rem; border-radius: var(--radius-md);">
            <div style="font-size: 1.8rem; font-weight: 700; color: var(--accent-emerald);">${stats.confirmed}</div>
            <div style="font-size: 0.8rem; color: var(--text-muted);">Confirmed Facts</div>
          </div>
          <div style="background: var(--bg-surface); padding: 1rem; border-radius: var(--radius-md);">
            <div style="font-size: 1.8rem; font-weight: 700; color: var(--accent-rose);">${Object.keys(stats.byCategory).length}</div>
            <div style="font-size: 0.8rem; color: var(--text-muted);">Categories Active</div>
          </div>
        </div>
      </div>

      <!-- Danger Zone -->
      <div class="feature-card" style="border-color: rgba(239, 68, 68, 0.4); background: rgba(239, 68, 68, 0.05);">
        <h3 class="feature-title" style="color: #ef4444; margin-bottom: 0.5rem;">⚠️ Danger Zone</h3>
        <p class="feature-desc" style="margin-bottom: 1rem;">
          Permanently clear all recorded memories, chat history, and stage progression from your browser.
        </p>
        <button id="clear-all-btn" class="btn btn-secondary btn-sm" style="color: #ef4444; border-color: rgba(239,68,68,0.4);">
          <span>Reset & Clear All Data</span>
        </button>
      </div>
    </div>
  `;

  // Attach event handlers
  document.getElementById('save-key-btn').addEventListener('click', () => {
    const key = document.getElementById('settings-api-key').value.trim();
    const model = document.getElementById('settings-model-select').value;
    memoryStore.setApiKey(key);
    memoryStore.setModelPreference(model);
    toast.show('API configuration updated successfully! 🔑', 'success');
  });

  document.getElementById('test-connection-btn').addEventListener('click', async () => {
    const key = document.getElementById('settings-api-key').value.trim();
    const resultDiv = document.getElementById('connection-result');
    
    if (!key) {
      toast.show('Please enter an API Key to test connection', 'warning');
      return;
    }

    resultDiv.style.display = 'block';
    resultDiv.style.background = 'rgba(255, 255, 255, 0.05)';
    resultDiv.style.color = 'var(--text-muted)';
    resultDiv.innerText = 'Testing connection and listing models...';

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (!response.ok) {
        resultDiv.style.background = 'rgba(239, 68, 68, 0.12)';
        resultDiv.style.color = '#f87171';
        resultDiv.innerText = `❌ Connection Failed:\n- Status: ${response.status}\n- Details: ${data.error?.message || response.statusText}`;
        return;
      }

      if (data.models && data.models.length > 0) {
        const list = data.models
          .map(m => m.name.replace('models/', ''))
          .filter(name => name.includes('gemini'))
          .slice(0, 10);
        
        resultDiv.style.background = 'rgba(16, 185, 129, 0.12)';
        resultDiv.style.color = '#34d399';
        resultDiv.innerText = `✅ Connection Successful!\n\nAvailable Models for your key:\n${list.map(m => `• ${m}`).join('\n')}`;
      } else {
        resultDiv.style.background = 'rgba(245, 158, 11, 0.12)';
        resultDiv.style.color = '#fbbf24';
        resultDiv.innerText = `⚠️ Connection successful, but model listing returned empty.`;
      }
    } catch (e) {
      resultDiv.style.background = 'rgba(239, 68, 68, 0.12)';
      resultDiv.style.color = '#f87171';
      resultDiv.innerText = `❌ Network Error: Failed to fetch from Google APIs.\nDetails: ${e.message}`;
    }
  });

  document.getElementById('save-stage-btn').addEventListener('click', () => {
    const stageId = parseInt(document.getElementById('stage-select').value, 10);
    memoryStore.setInterviewStage(stageId);
    toast.show(`Interview stage set to Stage ${stageId}`, 'info');
  });

  document.getElementById('export-json-btn').addEventListener('click', () => {
    markdownEngine.downloadJSONFile();
    toast.show('JSON backup downloaded! 📥', 'success');
  });

  document.getElementById('export-md-btn').addEventListener('click', () => {
    markdownEngine.downloadMarkdownFile();
    toast.show('Markdown export downloaded! 📥', 'success');
  });

  document.getElementById('import-file-input').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      let count = 0;
      if (file.name.endsWith('.json')) {
        count = markdownEngine.importFromJSON(content);
      } else {
        count = markdownEngine.importFromMarkdown(content);
      }
      if (count > 0) {
        toast.show(`Successfully imported ${count} memory entries! 🧠`, 'success');
      } else {
        toast.show('No memories found in the file.', 'warning');
      }
      renderSettingsView(container);
    };
    reader.readAsText(file);
  });

  document.getElementById('clear-all-btn').addEventListener('click', () => {
    if (confirm('DANGER: This will permanently delete ALL your recorded personal memories. Are you sure?')) {
      memoryStore.clearAll();
      toast.show('All memory data has been cleared.', 'info');
      renderSettingsView(container);
    }
  });
}
