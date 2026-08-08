/**
 * Central Memory Store & Persistence Engine (localStorage)
 */

const STORAGE_KEY = 'personal_memory_vault_v1';
const API_KEY_STORAGE = 'personal_memory_api_key';
const STAGE_STORAGE = 'personal_memory_interview_stage';
const CHAT_HISTORY_STORAGE = 'personal_memory_chat_history';

class MemoryStore {
  constructor() {
    this.memories = this._loadMemories();
    this.listeners = [];
  }

  _loadMemories() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error loading memory store from localStorage:', e);
      return [];
    }
  }

  _saveMemories() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.memories));
      this._notifyListeners();
    } catch (e) {
      console.error('Error saving memory store to localStorage:', e);
    }
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  _notifyListeners() {
    this.listeners.forEach(l => l(this.memories));
  }

  // Memory CRUD
  getAll() {
    return [...this.memories];
  }

  getByCategory(category) {
    return this.memories.filter(m => m.category === category);
  }

  getById(id) {
    return this.memories.find(m => m.id === id);
  }

  addMemory(data) {
    const memory = {
      id: 'mem_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      category: data.category || 'identity',
      subcategory: data.subcategory || 'general',
      title: data.title || 'Untitled Memory',
      content: data.content || '',
      confidence: data.confidence || 'confirmed', // 'confirmed' | 'inferred' | 'needs_confirmation'
      tags: Array.isArray(data.tags) ? data.tags : [],
      source: data.source || 'interview',
      date: data.date || null, // Optional milestone date
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.memories.unshift(memory);
    this._saveMemories();
    return memory;
  }

  updateMemory(id, updates) {
    const index = this.memories.findIndex(m => m.id === id);
    if (index !== -1) {
      this.memories[index] = {
        ...this.memories[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      this._saveMemories();
      return this.memories[index];
    }
    return null;
  }

  deleteMemory(id) {
    this.memories = this.memories.filter(m => m.id !== id);
    this._saveMemories();
  }

  search(query) {
    if (!query) return this.getAll();
    const q = query.toLowerCase();
    return this.memories.filter(m =>
      m.title.toLowerCase().includes(q) ||
      m.content.toLowerCase().includes(q) ||
      m.category.toLowerCase().includes(q) ||
      m.tags.some(t => t.toLowerCase().includes(q))
    );
  }

  /**
   * Check if a memory is too similar to an existing one.
   * Uses keyword overlap on title + content to detect near-duplicates.
   * Returns the matching memory if found, null otherwise.
   */
  findSimilar(title, content, category) {
    const newWords = this._extractKeywords(`${title} ${content}`);
    if (newWords.size === 0) return null;

    for (const mem of this.memories) {
      // Only compare within the same category
      if (mem.category !== category) continue;

      const existingWords = this._extractKeywords(`${mem.title} ${mem.content}`);
      if (existingWords.size === 0) continue;

      // Calculate Jaccard similarity (intersection / union)
      const intersection = newWords.size < existingWords.size
        ? [...newWords].filter(w => existingWords.has(w)).length
        : [...existingWords].filter(w => newWords.has(w)).length;
      const union = new Set([...newWords, ...existingWords]).size;
      const similarity = intersection / union;

      if (similarity > 0.5) {
        return mem;
      }
    }

    return null;
  }

  /**
   * Extract meaningful keywords from text (stopwords removed).
   */
  _extractKeywords(text) {
    const stopwords = new Set([
      'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
      'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
      'should', 'may', 'might', 'shall', 'can', 'to', 'of', 'in', 'for',
      'on', 'with', 'at', 'by', 'from', 'as', 'into', 'about', 'between',
      'i', 'me', 'my', 'myself', 'we', 'our', 'you', 'your', 'he', 'him',
      'she', 'her', 'it', 'they', 'them', 'what', 'which', 'who', 'when',
      'where', 'how', 'this', 'that', 'these', 'those', 'and', 'but', 'or',
      'if', 'so', 'than', 'too', 'very', 'just', 'not', 'no', 'yes',
      'also', 'like', 'really', 'think', 'know', 'want', 'need', 'going',
      'some', 'much', 'many', 'more', 'most', 'other', 'all', 'each',
      'own', 'same', 'then', 'now', 'here', 'there', 'all', 'both'
    ]);

    return new Set(
      text.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .split(/\s+/)
        .filter(w => w.length > 2 && !stopwords.has(w))
    );
  }

  getTimelineEvents() {
    return this.memories
      .filter(m => m.date || m.category === 'timeline' || m.category === 'life')
      .sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
  }

  getStats() {
    const total = this.memories.length;
    const byCategory = {};
    this.memories.forEach(m => {
      byCategory[m.category] = (byCategory[m.category] || 0) + 1;
    });

    const confirmed = this.memories.filter(m => m.confidence === 'confirmed').length;
    const needsConfirmation = this.memories.filter(m => m.confidence === 'needs_confirmation').length;

    return { total, byCategory, confirmed, needsConfirmation };
  }

  // API Key Management
  getApiKey() {
    return localStorage.getItem(API_KEY_STORAGE) || '';
  }

  setApiKey(key) {
    localStorage.setItem(API_KEY_STORAGE, key.trim());
  }

  // Model Preference Management
  getModelPreference() {
    return localStorage.getItem('personal_memory_model_pref') || 'gemini-2.5-flash';
  }

  setModelPreference(model) {
    localStorage.setItem('personal_memory_model_pref', model);
  }

  // Stage Tracking
  getInterviewStage() {
    return parseInt(localStorage.getItem(STAGE_STORAGE) || '1', 10);
  }

  setInterviewStage(stage) {
    localStorage.setItem(STAGE_STORAGE, stage.toString());
  }

  // Chat Mode Management (interview | reflection | review)
  getChatMode() {
    return localStorage.getItem('personal_memory_chat_mode') || 'interview';
  }

  setChatMode(mode) {
    localStorage.setItem('personal_memory_chat_mode', mode);
  }

  // Chat History Management
  getChatHistory() {
    try {
      const data = localStorage.getItem(CHAT_HISTORY_STORAGE);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  saveChatHistory(history) {
    try {
      localStorage.setItem(CHAT_HISTORY_STORAGE, JSON.stringify(history));
    } catch (e) {
      console.error('Error saving chat history:', e);
    }
  }

  clearChatHistory() {
    localStorage.removeItem(CHAT_HISTORY_STORAGE);
  }

  // Reset/Clear All
  clearAll() {
    this.memories = [];
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(CHAT_HISTORY_STORAGE);
    localStorage.setItem(STAGE_STORAGE, '1');
    this._notifyListeners();
  }
}

export const memoryStore = new MemoryStore();
