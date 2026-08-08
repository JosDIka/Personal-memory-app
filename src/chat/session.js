/**
 * Chat Session & Message State Management
 */

import { memoryStore } from '../memory/store.js';

class ChatSession {
  constructor() {
    this.messages = memoryStore.getChatHistory();
    this.listeners = [];
  }

  getMessages() {
    return [...this.messages];
  }

  addMessage(role, content) {
    const msg = {
      id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      role, // 'user' | 'assistant'
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    this.messages.push(msg);
    memoryStore.saveChatHistory(this.messages);
    this._notify();
    return msg;
  }

  clear() {
    this.messages = [];
    memoryStore.clearChatHistory();
    this._notify();
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  _notify() {
    this.listeners.forEach(l => l(this.messages));
  }
}

export const chatSession = new ChatSession();
