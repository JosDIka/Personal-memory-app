/**
 * Markdown Export & Import Engine
 */

import { memoryStore } from '../memory/store.js';
import { MEMORY_CATEGORIES } from '../memory/categories.js';

export class MarkdownEngine {
  /**
   * Export all memories as a single formatted Markdown string
   */
  exportToMarkdown() {
    const memories = memoryStore.getAll();
    const dateStr = new Date().toISOString().split('T')[0];

    let md = `---
type: personal_memory_export
version: 1.0
exported: ${dateStr}
total_memories: ${memories.length}
generator: Personal Memory Web App
---

# 🧠 Personal Digital Memory

*This document contains a structured digital memory vault of the user. It is formatted in standard Markdown with structured headers and tags for high portability across AI models (e.g. Gemini, ChatGPT, Claude).*

---

`;

    // Group memories by category
    Object.keys(MEMORY_CATEGORIES).forEach(catId => {
      const catMeta = MEMORY_CATEGORIES[catId];
      const items = memories.filter(m => m.category === catId);

      if (items.length > 0) {
        md += `## ${catMeta.icon} ${catMeta.label}\n\n`;

        items.forEach(item => {
          md += `### ${item.title}\n`;
          if (item.date) {
            md += `> 📅 **Date/Milestone**: ${item.date}\n`;
          }
          md += `> 🏷️ **Tags**: ${item.tags.length > 0 ? item.tags.join(', ') : 'general'}\n`;
          md += `> 🔒 **Confidence**: ${item.confidence}\n\n`;
          md += `${item.content}\n\n`;
          md += `---\n\n`;
        });
      }
    });

    return md;
  }

  /**
   * Trigger browser file download of the Markdown file
   */
  downloadMarkdownFile(filename = 'Personal_Memory.md') {
    const content = this.exportToMarkdown();
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Import memories from a uploaded Markdown string
   */
  importFromMarkdown(mdContent) {
    if (!mdContent || typeof mdContent !== 'string') return 0;

    let importedCount = 0;
    const lines = mdContent.split('\n');
    let currentCategory = 'identity';
    let currentTitle = '';
    let currentContent = [];
    let currentTags = [];
    let currentDate = null;

    const saveCurrent = () => {
      if (currentTitle && currentContent.length > 0) {
        memoryStore.addMemory({
          category: currentCategory,
          title: currentTitle,
          content: currentContent.join('\n').trim(),
          tags: currentTags,
          date: currentDate,
          source: 'import'
        });
        importedCount++;
      }
      currentTitle = '';
      currentContent = [];
      currentTags = [];
      currentDate = null;
    };

    lines.forEach(line => {
      // Category header matching
      if (line.startsWith('## ')) {
        saveCurrent();
        const headerText = line.replace('## ', '').toLowerCase();
        Object.keys(MEMORY_CATEGORIES).forEach(catId => {
          if (headerText.includes(catId) || headerText.includes(MEMORY_CATEGORIES[catId].label.toLowerCase())) {
            currentCategory = catId;
          }
        });
      } 
      // Title matching
      else if (line.startsWith('### ')) {
        saveCurrent();
        currentTitle = line.replace('### ', '').trim();
      } 
      // Metadata matching
      else if (line.startsWith('> 🏷️ **Tags**:')) {
        const tagStr = line.replace('> 🏷️ **Tags**:', '').trim();
        currentTags = tagStr.split(',').map(t => t.trim()).filter(Boolean);
      }
      else if (line.startsWith('> 📅 **Date/Milestone**:')) {
        currentDate = line.replace('> 📅 **Date/Milestone**:', '').trim();
      }
      // Content lines
      else if (currentTitle && !line.startsWith('---') && !line.startsWith('>')) {
        if (line.trim() !== '') {
          currentContent.push(line);
        }
      }
    });

    saveCurrent(); // Save final pending item
    return importedCount;
  }

  /**
   * Export all memories as JSON (preserves all data perfectly)
   */
  exportToJSON() {
    const memories = memoryStore.getAll();
    return JSON.stringify(memories, null, 2);
  }

  /**
   * Trigger browser file download of the JSON file
   */
  downloadJSONFile(filename = 'Personal_Memory.json') {
    const content = this.exportToJSON();
    const blob = new Blob([content], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Import memories from a JSON string (full fidelity restore)
   */
  importFromJSON(jsonContent) {
    if (!jsonContent || typeof jsonContent !== 'string') return 0;
    try {
      const memories = JSON.parse(jsonContent);
      if (!Array.isArray(memories)) return 0;
      let count = 0;
      memories.forEach(m => {
        memoryStore.addMemory({
          category: m.category || 'identity',
          subcategory: m.subcategory || 'general',
          title: m.title || 'Untitled',
          content: m.content || '',
          confidence: m.confidence || 'confirmed',
          tags: m.tags || [],
          date: m.date || null,
          source: 'json-import'
        });
        count++;
      });
      return count;
    } catch (e) {
      console.error('JSON import error:', e);
      return 0;
    }
  }
}

export const markdownEngine = new MarkdownEngine();
