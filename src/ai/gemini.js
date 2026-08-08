/**
 * Google Gemini API REST Client using native Fetch
 * Bypasses bundle compatibility issues and functions robustly in the browser.
 */

import { INTERVIEWER_SYSTEM_PROMPT, EXTRACTION_SYSTEM_PROMPT, FREE_REFLECTION_PROMPT, VAULT_REVIEW_PROMPT } from './prompts.js';
import { memoryStore } from '../memory/store.js';
import { STAGES } from '../interview/stages.js';
import { toast } from '../components/toast.js';

export class GeminiService {
  // Cap API context to the last N turns (2 parts each) to prevent token bloat.
  getHistoryLimit() {
    return 15;
  }

  getModel() {
    return memoryStore.getModelPreference();
  }

  getApiKey() {
    const apiKey = memoryStore.getApiKey();
    if (!apiKey) {
      throw new Error('API Key missing. Please enter your free Google Gemini API key in Settings.');
    }
    return apiKey;
  }

  /**
   * Fetch with automatic retry and exponential backoff for 429/503 errors.
   */
  async _fetchWithRetry(url, body, maxRetries = 3) {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });

        // Retry on rate limit (429) or overload (503)
        if (response.status === 429 || response.status === 503) {
          if (attempt < maxRetries) {
            const delay = Math.pow(2, attempt) * 1000;
            toast.show(`API busy — retrying in ${delay / 1000}s...`, 'warning', 2000);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
        }

        return response;
      } catch (error) {
        // Network errors: retry if attempts remain
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000;
          toast.show(`Network issue — retrying in ${delay / 1000}s...`, 'warning', 2000);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        throw error;
      }
    }
  }

  /**
   * Format memory store entries into a concise summary for prompt context.
   * Caps to the most recent N memories to prevent token bloat.
   */
  getMemorySummary(limit = 100) {
    const memories = memoryStore.getAll();
    if (memories.length === 0) {
      return 'No existing memories recorded yet. This is your first interaction with the user.';
    }

    // Use the most recent memories (already sorted newest-first by store)
    const recent = memories.slice(0, limit);
    return recent.map(m => `-[${m.category.toUpperCase()}] ${m.title}: ${m.content}`).join('\n');
  }

  sanitizeContents(contents) {
    const sanitized = [];
    contents.forEach(turn => {
      const role = turn.role === 'user' ? 'user' : 'model';
      const text = turn.parts?.[0]?.text || '';
      
      if (!text.trim()) return;

      const lastTurn = sanitized[sanitized.length - 1];
      if (lastTurn && lastTurn.role === role) {
        lastTurn.parts[0].text += '\n\n' + text;
      } else {
        sanitized.push({
          role: role,
          parts: [{ text: text }]
        });
      }
    });

    if (sanitized.length > 0 && sanitized[0].role === 'model') {
      sanitized.unshift({
        role: 'user',
        parts: [{ text: 'Hello!' }]
      });
    }

    return sanitized;
  }

  /**
   * Generate next response from interviewer AI using direct REST API fetch call
   */
  async getInterviewerResponse(userMessage, conversationHistory = [], currentStageNum = 1) {
    try {
      const apiKey = this.getApiKey();
      const stage = STAGES.find(s => s.id === currentStageNum) || STAGES[0];
      const memorySummary = this.getMemorySummary();

      // Compile system instruction with populated context
      const systemInstruction = INTERVIEWER_SYSTEM_PROMPT
        .replace('{{STAGE_NAME}}', stage.title)
        .replace('{{STAGE_NUM}}', stage.id)
        .replace('{{STAGE_DESC}}', stage.description)
        .replace('{{EXISTING_MEMORY_SUMMARY}}', memorySummary);

      // Build turn contents from history + current message
      let rawContents = [];
      
      // Add past history turns
      conversationHistory.forEach(turn => {
        rawContents.push({
          role: turn.role === 'user' ? 'user' : 'model',
          parts: [{ text: turn.content }]
        });
      });

      // Add user current message if present
      if (userMessage) {
        rawContents.push({
          role: 'user',
          parts: [{ text: userMessage }]
        });
      } else if (rawContents.length === 0) {
        // Initial opening greeting query
        rawContents.push({
          role: 'user',
          parts: [{ text: 'Hello! I am ready to start building my personal memory.' }]
        });
      }

      // Sanitize to ensure strict user/model alternation
      const cleanContents = this.sanitizeContents(rawContents);

      // Trim history to the last N turns to bound token usage
      const lastTurns = cleanContents.slice(-(this.getHistoryLimit() * 2 + 1));

      // REST call with retry
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.getModel()}:generateContent?key=${apiKey}`;
      const response = await this._fetchWithRetry(url, {
        contents: lastTurns,
        systemInstruction: {
          parts: [{ text: systemInstruction }]
        },
        generationConfig: {
          temperature: 0.7
        }
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error?.message || `HTTP ${response.status} Error`);
      }

      const resData = await response.json();
      const outputText = resData.candidates?.[0]?.content?.parts?.[0]?.text;

      return outputText || "I'm excited to learn more about you! What should I call you?";
    } catch (error) {
      console.error('Gemini API Error:', error);
      if (error.message.includes('API Key missing')) {
        throw error;
      }
      throw new Error(`AI Error: ${error.message || 'Failed to connect to Gemini API'}`);
    }
  }

  /**
   * Generate a free reflection response (user leads, AI listens)
   */
  async getFreeReflectionResponse(userMessage, conversationHistory = []) {
    try {
      const apiKey = this.getApiKey();
      const memorySummary = this.getMemorySummary();

      const systemInstruction = FREE_REFLECTION_PROMPT
        .replace('{{EXISTING_MEMORY_SUMMARY}}', memorySummary);

      let rawContents = [];
      conversationHistory.forEach(turn => {
        rawContents.push({
          role: turn.role === 'user' ? 'user' : 'model',
          parts: [{ text: turn.content }]
        });
      });

      if (userMessage) {
        rawContents.push({ role: 'user', parts: [{ text: userMessage }] });
      } else {
        rawContents.push({ role: 'user', parts: [{ text: 'I want to share some thoughts.' }] });
      }

      const cleanContents = this.sanitizeContents(rawContents);
      const lastTurns = cleanContents.slice(-(this.getHistoryLimit() * 2 + 1));

      const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.getModel()}:generateContent?key=${apiKey}`;
      const response = await this._fetchWithRetry(url, {
        contents: lastTurns,
        systemInstruction: { parts: [{ text: systemInstruction }] },
        generationConfig: { temperature: 0.8 }
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error?.message || `HTTP ${response.status} Error`);
      }

      const resData = await response.json();
      return resData.candidates?.[0]?.content?.parts?.[0]?.text || "I'm listening. Tell me more.";
    } catch (error) {
      console.error('Free Reflection Error:', error);
      throw new Error(`AI Error: ${error.message}`);
    }
  }

  /**
   * Generate a vault review response (AI picks a memory and asks a follow-up)
   */
  async getVaultReviewResponse() {
    try {
      const apiKey = this.getApiKey();
      const memories = memoryStore.getAll();

      if (memories.length === 0) {
        return "Your memory vault is empty. Start by sharing something about yourself in Interview mode first!";
      }

      const memorySummary = this.getMemorySummary();
      const systemInstruction = VAULT_REVIEW_PROMPT
        .replace('{{EXISTING_MEMORY_SUMMARY}}', memorySummary);

      const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.getModel()}:generateContent?key=${apiKey}`;
      const response = await this._fetchWithRetry(url, {
        contents: [{ role: 'user', parts: [{ text: 'Pick a memory and ask a follow-up question.' }] }],
        systemInstruction: { parts: [{ text: systemInstruction }] },
        generationConfig: { temperature: 0.7 }
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error?.message || `HTTP ${response.status} Error`);
      }

      const resData = await response.json();
      return resData.candidates?.[0]?.content?.parts?.[0]?.text || "Let me think of a memory to revisit...";
    } catch (error) {
      console.error('Vault Review Error:', error);
      throw new Error(`AI Error: ${error.message}`);
    }
  }

  /**
   * Extract memory items from user message using direct REST API fetch call
   */
  async extractMemoriesFromConversation(userMessage) {
    try {
      const apiKey = memoryStore.getApiKey();
      if (!apiKey || !userMessage || userMessage.trim().length < 5) return [];

      const existingMemoriesStr = this.getMemorySummary();
      const prompt = `User message: "${userMessage}"`;
      const systemInstruction = EXTRACTION_SYSTEM_PROMPT.replace('{{EXISTING_MEMORIES}}', existingMemoriesStr);

      const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.getModel()}:generateContent?key=${apiKey}`;
      const response = await this._fetchWithRetry(url, {
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        systemInstruction: {
          parts: [{ text: systemInstruction }]
        },
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json"
        }
      });

      if (!response.ok) return [];

      const resData = await response.json();
      const text = resData.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      try {
        const extracted = JSON.parse(text.trim());
        return Array.isArray(extracted) ? extracted : [];
      } catch (e) {
        console.warn('Failed to parse extraction JSON:', text);
        return [];
      }
    } catch (error) {
      console.error('Memory extraction error:', error);
      return [];
    }
  }
}

export const geminiService = new GeminiService();
