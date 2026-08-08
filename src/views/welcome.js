/**
 * Welcome & Onboarding View
 */

import { memoryStore } from '../memory/store.js';
import { toast } from '../components/toast.js';
import { escapeHtml } from '../utils/escapeHtml.js';

export function renderWelcomeView(container) {
  const existingApiKey = memoryStore.getApiKey();
  const selectedModel = memoryStore.getModelPreference();

  container.innerHTML = `
    <div class="welcome-container">
      <div class="hero-badge">
        <span>🧠 AI Biographer & Memory Vault</span>
      </div>

      <h1 class="hero-title">
        Let's build your <span class="hero-title-accent">digital memory.</span>
      </h1>

      <p class="hero-subtitle">
        What if you could create a structured digital representation of yourself that another AI could understand? Your life, personality, experiences, goals, and wisdom — stored safely in portable Markdown.
      </p>

      <div class="api-key-box">
        <div class="form-group">
          <label class="form-label" for="welcome-api-key">Google Gemini API Key (Free Tier)</label>
          <input 
            type="password" 
            id="welcome-api-key" 
            class="form-input" 
            placeholder="AIzaSy..." 
            value="${escapeHtml(existingApiKey)}" 
          />
          <div class="form-hint">
            💡 Get a free API key instantly at <a href="https://aistudio.google.com/" target="_blank" style="color: var(--accent-violet);">Google AI Studio</a>. No credit card required. Your key remains private in your browser.
          </div>
        </div>

        <div class="form-group" style="margin-top: 1rem;">
          <label class="form-label" for="welcome-model-select">Selected Model</label>
          <select id="welcome-model-select" class="form-input">
            <option value="gemini-2.5-flash" ${selectedModel === 'gemini-2.5-flash' ? 'selected' : ''}>gemini-2.5-flash (Latest — default)</option>
            <option value="gemini-2.0-flash-lite" ${selectedModel === 'gemini-2.0-flash-lite' ? 'selected' : ''}>gemini-2.0-flash-lite (Very high quota free model)</option>
            <option value="gemini-2.0-flash" ${selectedModel === 'gemini-2.0-flash' ? 'selected' : ''}>gemini-2.0-flash (Fast intelligence)</option>
            <option value="gemini-flash-latest" ${selectedModel === 'gemini-flash-latest' ? 'selected' : ''}>gemini-flash-latest (Gemini 1.5 Flash stable)</option>
            <option value="gemini-2.5-pro" ${selectedModel === 'gemini-2.5-pro' ? 'selected' : ''}>gemini-2.5-pro (Highly intelligent reasoning)</option>
          </select>
          <div class="form-hint">
            💡 Switch models if you hit API quota limits.
          </div>
        </div>

        <button id="start-interview-btn" class="btn btn-primary" style="width: 100%; margin-top: 1.5rem;">
          <span>Start Building Your Memory →</span>
        </button>
      </div>

      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon">💬</div>
          <div class="feature-title">Intelligent Interviewer</div>
          <div class="feature-desc">Asks thoughtful follow-up questions tailored to your story instead of static questionnaires.</div>
        </div>

        <div class="feature-card">
          <div class="feature-icon">🔒</div>
          <div class="feature-title">100% Private & Local</div>
          <div class="feature-desc">All memory records live exclusively in your browser's local storage. You own your data.</div>
        </div>

        <div class="feature-card">
          <div class="feature-icon">📝</div>
          <div class="feature-title">Portable Markdown Export</div>
          <div class="feature-desc">Export your structured knowledge base anytime for future AI models or personal archiving.</div>
        </div>
      </div>
    </div>
  `;

  // Attach button handler
  const startBtn = document.getElementById('start-interview-btn');
  const apiKeyInput = document.getElementById('welcome-api-key');

  startBtn.addEventListener('click', () => {
    const key = apiKeyInput.value.trim();
    if (!key) {
      toast.show('Please enter your Google Gemini API key to start!', 'warning');
      apiKeyInput.focus();
      return;
    }

    const model = document.getElementById('welcome-model-select').value;
    memoryStore.setApiKey(key);
    memoryStore.setModelPreference(model);
    toast.show('API Configuration saved! Launching interview...', 'success');
    window.location.hash = '#chat';
  });
}
