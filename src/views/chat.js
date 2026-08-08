/**
 * AI Interviewer Chat View
 */

import { chatSession } from '../chat/session.js';
import { interviewEngine } from '../interview/engine.js';
import { memoryStore } from '../memory/store.js';
import { toast } from '../components/toast.js';
import { escapeHtml } from '../utils/escapeHtml.js';

export function renderChatView(container) {
  const currentStage = interviewEngine.getCurrentStage();
  const currentMode = memoryStore.getChatMode();

  container.innerHTML = `
    <div class="chat-container">
      <div class="chat-main">
        <header class="chat-header">
          <div class="chat-header-info">
            <span id="stage-pill" class="stage-pill">${currentStage.icon} ${currentStage.title}</span>
            <span id="stage-desc" style="font-size: 0.85rem; color: var(--text-dim);">${currentStage.description}</span>
          </div>
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <select id="mode-select" class="form-input" style="width: auto; padding: 0.35rem 0.6rem; font-size: 0.8rem; border-radius: var(--radius-sm);">
              <option value="interview" ${currentMode === 'interview' ? 'selected' : ''}>🎙️ Interview</option>
              <option value="reflection" ${currentMode === 'reflection' ? 'selected' : ''}>💭 Reflection</option>
              <option value="review" ${currentMode === 'review' ? 'selected' : ''}>📖 Vault Review</option>
            </select>
            <button id="clear-chat-btn" class="btn btn-ghost btn-sm" title="Clear Chat History">
              <span>🗑️</span>
            </button>
          </div>
        </header>

        <div id="messages-area" class="messages-area">
          <!-- Chat messages dynamically render here -->
        </div>

        <div class="input-area">
          <div id="suggestion-chips" class="suggestion-chips">
            <!-- Stage sample question suggestions -->
          </div>

          <div class="chat-input-wrapper">
            <textarea 
              id="chat-input" 
              class="chat-input" 
              placeholder="Tell your story or answer the question... (Shift+Enter for new line)"
              rows="1"
            ></textarea>
            <button id="send-btn" class="btn btn-primary btn-sm">
              <span>Send ➔</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  const messagesArea = document.getElementById('messages-area');
  const chatInput = document.getElementById('chat-input');
  const sendBtn = document.getElementById('send-btn');
  const chipsContainer = document.getElementById('suggestion-chips');
  const clearBtn = document.getElementById('clear-chat-btn');
  const stagePill = document.getElementById('stage-pill');
  const stageDesc = document.getElementById('stage-desc');
  const modeSelect = document.getElementById('mode-select');

  // Mode selector
  if (modeSelect) {
    modeSelect.addEventListener('change', (e) => {
      memoryStore.setChatMode(e.target.value);
      // Refresh the view to update stage header and chips
      renderChatView(container);
    });
  }

  // Render suggestion chips based on current mode
  const mode = memoryStore.getChatMode();
  if (mode === 'review') {
    chipsContainer.innerHTML = `
      <div class="suggestion-chip" data-prompt="Pick a memory and ask me about it">📖 Pick a memory</div>
      <div class="suggestion-chip" data-prompt="What do you know about me so far?">🧠 What do you know?</div>
    `;
  } else if (mode === 'reflection') {
    chipsContainer.innerHTML = `
      <div class="suggestion-chip" data-prompt="Something I've been thinking about lately is...">💭 Share a thought</div>
      <div class="suggestion-chip" data-prompt="Today I feel...">🌤️ How I feel today</div>
      <div class="suggestion-chip" data-prompt="Something I'm grateful for...">🙏 Gratitude</div>
    `;
  } else if (currentStage.sampleQuestions) {
    chipsContainer.innerHTML = currentStage.sampleQuestions.map(q => `
      <div class="suggestion-chip" data-prompt="${escapeHtml(q)}">${escapeHtml(q)}</div>
    `).join('');
  }

  if (chipsContainer) {
    chipsContainer.addEventListener('click', (e) => {
      const chip = e.target.closest('.suggestion-chip');
      if (chip) {
        chatInput.value = chip.dataset.prompt;
        chatInput.focus();
      }
    });
  }

  // Clear chat listener
  clearBtn.addEventListener('click', () => {
    if (confirm('Clear current chat conversation log? (Your saved memories will remain safe)')) {
      chatSession.clear();
      initInitialMessage();
    }
  });

  // Render message history
  function renderMessages() {
    const messages = chatSession.getMessages();
    messagesArea.innerHTML = messages.map(msg => `
      <div class="message-row ${msg.role === 'user' ? 'user' : 'ai'}">
        <div class="message-avatar">
          ${msg.role === 'user' ? '👤' : '🧠'}
        </div>
        <div class="message-content-wrapper">
          <div class="message-bubble">${escapeHtml(msg.content)}</div>
          <div class="message-time">${escapeHtml(msg.timestamp)}</div>
        </div>
      </div>
    `).join('');

    scrollToBottom();
  }

  function scrollToBottom() {
    messagesArea.scrollTop = messagesArea.scrollHeight;
  }

  function showTypingIndicator() {
    const typingRow = document.createElement('div');
    typingRow.id = 'typing-indicator-row';
    typingRow.className = 'message-row ai';
    typingRow.innerHTML = `
      <div class="message-avatar">🧠</div>
      <div class="typing-indicator">
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      </div>
    `;
    messagesArea.appendChild(typingRow);
    scrollToBottom();
  }

  function hideTypingIndicator() {
    const typingRow = document.getElementById('typing-indicator-row');
    if (typingRow) typingRow.remove();
  }

  // Refresh stage pill + description when progression happens
  function refreshStageHeader() {
    const stage = interviewEngine.getCurrentStage();
    if (stagePill) stagePill.textContent = `${stage.icon} ${stage.title}`;
    if (stageDesc) stageDesc.textContent = stage.description;
  }

  // Kick off initial conversation if chat history is empty
  async function initInitialMessage() {
    if (chatSession.getMessages().length === 0) {
      showTypingIndicator();
      try {
        const responseText = await interviewEngine.processTurn(null, []);
        hideTypingIndicator();
        chatSession.addMessage('assistant', responseText);
      } catch (err) {
        hideTypingIndicator();
        chatSession.addMessage('assistant', `⚠️ AI Connection Error:\n\n${err.message}\n\nPlease verify your Google Gemini API key and model selection in the settings tab.`);
      }
    } else {
      renderMessages();
    }
  }

  // Send message action
  async function handleSend() {
    const text = chatInput.value.trim();
    if (!text) return;

    // Check API Key
    if (!memoryStore.getApiKey()) {
      toast.show('Please set your Gemini API Key in Settings first!', 'warning');
      window.location.hash = '#settings';
      return;
    }

    // Capture history BEFORE appending the new message
    const history = chatSession.getMessages().map(m => ({
      role: m.role,
      content: m.content
    }));

    chatInput.value = '';
    chatInput.style.height = 'auto';
    chatSession.addMessage('user', text);
    renderMessages();

    showTypingIndicator();

    try {
      const aiResponse = await interviewEngine.processTurn(text, history);
      hideTypingIndicator();
      chatSession.addMessage('assistant', aiResponse);
      refreshStageHeader();
      renderMessages();
    } catch (err) {
      hideTypingIndicator();
      refreshStageHeader();
      chatSession.addMessage('assistant', `⚠️ AI Connection Error:\n\n${err.message}\n\nPlease double check your API key or try switching models in Settings.`);
      renderMessages();
    }
  }

  // Event Listeners
  sendBtn.addEventListener('click', handleSend);
  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  });

  // Auto-resize textarea as user types
  chatInput.addEventListener('input', () => {
    chatInput.style.height = 'auto';
    chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + 'px';
  });

  // Subscribe to chat session updates
  const unsubscribe = chatSession.subscribe(() => {
    renderMessages();
  });

  // Initial render
  initInitialMessage();

  // Return cleanup so the router can unsubscribe when navigating away
  return () => {
    if (typeof unsubscribe === 'function') unsubscribe();
  };
}
