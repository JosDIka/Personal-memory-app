/**
 * Intelligent Interview Engine
 */

import { memoryStore } from '../memory/store.js';
import { geminiService } from '../ai/gemini.js';
import { STAGES, getStageMeta } from './stages.js';
import { toast } from '../components/toast.js';

class InterviewEngine {
  constructor() {
    this.currentStageId = memoryStore.getInterviewStage();
  }

  getCurrentStage() {
    return getStageMeta(this.currentStageId);
  }

  setStage(stageId) {
    if (stageId >= 1 && stageId <= 7) {
      this.currentStageId = stageId;
      memoryStore.setInterviewStage(stageId);
    }
  }

  /**
   * Process a turn in the conversation based on current mode.
   */
  async processTurn(userMessage, conversationHistory = []) {
    const mode = memoryStore.getChatMode();
    let aiResponse;

    // 1. Get response based on mode
    switch (mode) {
      case 'reflection':
        aiResponse = await geminiService.getFreeReflectionResponse(userMessage, conversationHistory);
        break;
      case 'review':
        aiResponse = await geminiService.getVaultReviewResponse();
        break;
      case 'interview':
      default:
        aiResponse = await geminiService.getInterviewerResponse(
          userMessage, conversationHistory, this.currentStageId
        );
        break;
    }

    // 2. Extract memories (interview & reflection modes only; review is about existing memories)
    if (mode !== 'review' && userMessage && this._isSubstantiveMessage(userMessage)) {
      this._extractAndSaveMemories(userMessage);
    }

    // 3. Evaluate stage progression (interview mode only)
    if (mode === 'interview') {
      this._checkStageProgression();
    }

    return aiResponse;
  }

  /**
   * Heuristic: is this message likely to contain shareable personal facts?
   * Filters out greetings, fillers, and one-word replies to save API quota.
   */
  _isSubstantiveMessage(text) {
    const t = (text || '').trim();
    if (t.length < 4) return false;

    const trivial = /^(hi|hello|hey|ok|okay|yes|yep|yeah|no|nope|sure|thanks|thank you|great|cool|nice|ha|hmm|hm|lol)\s*[.!?]*$/i;
    if (trivial.test(t)) return false;

    // Require a meaningful word count (more than an acknowledgment)
    const words = t.split(/\s+/).filter(w => w.length > 2);
    return words.length >= 3;
  }

  /**
   * Extract memories from user message and save to store (with deduplication)
   */
  async _extractAndSaveMemories(userMessage) {
    try {
      const candidates = await geminiService.extractMemoriesFromConversation(userMessage);
      if (candidates && candidates.length > 0) {
        let saved = 0;
        let skipped = 0;

        candidates.forEach(item => {
          if (item.title && item.content) {
            const category = item.category || 'identity';

            // Check for similar existing memory
            const existing = memoryStore.findSimilar(item.title, item.content, category);
            if (existing) {
              skipped++;
              return;
            }

            memoryStore.addMemory({
              category,
              subcategory: item.subcategory || 'general',
              title: item.title,
              content: item.content,
              confidence: item.confidence || 'confirmed',
              tags: item.tags || [],
              source: 'interview',
              date: item.date || null
            });
            saved++;
          }
        });

        if (saved > 0) {
          toast.show(`Captured ${saved} new memory ${saved === 1 ? 'item' : 'items'} 🧠`, 'success');
        }
        if (skipped > 0) {
          toast.show(`Skipped ${skipped} ${skipped === 1 ? 'duplicate' : 'duplicates'}`, 'info');
        }
      }
    } catch (e) {
      console.error('Error during automatic memory extraction:', e);
    }
  }

  /**
   * Check if user should advance to the next interview stage
   */
  _checkStageProgression() {
    const stats = memoryStore.getStats();
    const count = stats.total;

    // Progression thresholds
    if (this.currentStageId === 1 && count >= 2) {
      this.setStage(2);
    } else if (this.currentStageId === 2 && count >= 5) {
      this.setStage(3);
    } else if (this.currentStageId === 3 && count >= 8) {
      this.setStage(4);
    } else if (this.currentStageId === 4 && count >= 11) {
      this.setStage(5);
    } else if (this.currentStageId === 5 && count >= 14) {
      this.setStage(6);
    } else if (this.currentStageId === 6 && count >= 17) {
      this.setStage(7);
    }
  }
}

export const interviewEngine = new InterviewEngine();
