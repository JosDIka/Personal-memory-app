/**
 * Memory Explorer & Vault View
 */

import { memoryStore } from '../memory/store.js';
import { MEMORY_CATEGORIES } from '../memory/categories.js';
import { toast } from '../components/toast.js';
import { escapeHtml } from '../utils/escapeHtml.js';

export function renderMemoryView(container) {
  let searchQuery = '';
  let selectedCategory = 'all';
  let editingId = null;

  function render() {
    const allMemories = memoryStore.search(searchQuery);
    const filteredMemories = selectedCategory === 'all'
      ? allMemories
      : allMemories.filter(m => m.category === selectedCategory);

    container.innerHTML = `
      <div class="memory-view">
        <div class="page-header" style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <h1 class="page-title">🧠 Personal Memory Vault</h1>
            <p class="page-subtitle">A continuously evolving, structured digital memory of your life and identity.</p>
          </div>
          <button id="add-memory-btn" class="btn btn-primary btn-sm">
            <span>+ Add Memory</span>
          </button>
        </div>

        <div class="search-filter-bar">
          <div class="search-input-wrapper">
            <input
              type="text"
              id="search-input"
              class="form-input"
              placeholder="Search memories, tags, topics..."
              value="${escapeHtml(searchQuery)}"
            />
          </div>

          <select id="category-filter" class="form-input" style="width: auto;">
            <option value="all" ${selectedCategory === 'all' ? 'selected' : ''}>All Categories</option>
            ${Object.values(MEMORY_CATEGORIES).map(c => `
              <option value="${c.id}" ${selectedCategory === c.id ? 'selected' : ''}>${c.icon} ${c.label}</option>
            `).join('')}
          </select>
        </div>

        <div class="category-grid">
          ${Object.values(MEMORY_CATEGORIES).map(cat => {
            const catMemories = filteredMemories.filter(m => m.category === cat.id);
            if (selectedCategory !== 'all' && selectedCategory !== cat.id) return '';
            if (searchQuery && catMemories.length === 0) return '';

            return `
              <div class="category-card">
                <div class="category-header">
                  <div class="category-title">
                    <span>${cat.icon}</span>
                    <span>${cat.label}</span>
                  </div>
                  <span class="category-count">${catMemories.length}</span>
                </div>

                <div class="memory-list">
                  ${catMemories.length === 0 ? `
                    <div style="font-size: 0.85rem; color: var(--text-dim); padding: 0.5rem 0;">
                      No memories recorded in this category yet.
                    </div>
                  ` : catMemories.map(m => {
                    if (editingId === m.id) {
                      return renderEditForm(m);
                    }
                    return renderMemoryCard(m);
                  }).join('')}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    attachEvents();
  }

  function renderMemoryCard(m) {
    return `
      <div class="memory-item" data-id="${escapeHtml(m.id)}">
        <div class="memory-item-title">
          <span>${escapeHtml(m.title)}</span>
          <div style="display: flex; gap: 0.4rem; align-items: center;">
            <span class="confidence-badge ${m.confidence}">${escapeHtml(m.confidence)}</span>
            <button class="btn btn-ghost btn-sm edit-mem-btn" data-id="${escapeHtml(m.id)}" title="Edit" style="padding: 2px 6px;">✏️</button>
            <button class="btn btn-ghost btn-sm delete-mem-btn" data-id="${escapeHtml(m.id)}" title="Delete" style="padding: 2px 6px;">🗑️</button>
          </div>
        </div>
        <div class="memory-item-content">${escapeHtml(m.content)}</div>
        ${m.date ? `<div style="font-size: 0.78rem; color: var(--accent-cyan); margin-bottom: 0.4rem;">📅 ${escapeHtml(m.date)}</div>` : ''}
        <div class="memory-tags">
          ${m.tags.map(t => `<span class="tag-pill">#${escapeHtml(t)}</span>`).join('')}
        </div>
      </div>
    `;
  }

  function renderEditForm(m) {
    return `
      <div class="memory-item memory-item--editing" data-id="${escapeHtml(m.id)}">
        <div class="edit-form">
          <div class="form-group">
            <label class="form-label" style="font-size: 0.8rem;">Title</label>
            <input type="text" class="form-input edit-title" value="${escapeHtml(m.title)}" />
          </div>
          <div class="form-group">
            <label class="form-label" style="font-size: 0.8rem;">Content</label>
            <textarea class="form-input edit-content" rows="3" style="resize: vertical;">${escapeHtml(m.content)}</textarea>
          </div>
          <div class="form-group">
            <label class="form-label" style="font-size: 0.8rem;">Confidence</label>
            <select class="form-input edit-confidence" style="width: auto;">
              <option value="confirmed" ${m.confidence === 'confirmed' ? 'selected' : ''}>Confirmed</option>
              <option value="inferred" ${m.confidence === 'inferred' ? 'selected' : ''}>Inferred</option>
              <option value="needs_confirmation" ${m.confidence === 'needs_confirmation' ? 'selected' : ''}>Needs Confirmation</option>
            </select>
          </div>
          <div style="display: flex; gap: 0.5rem; margin-top: 0.75rem;">
            <button class="btn btn-primary btn-sm save-edit-btn" data-id="${escapeHtml(m.id)}">Save</button>
            <button class="btn btn-ghost btn-sm cancel-edit-btn">Cancel</button>
          </div>
        </div>
      </div>
    `;
  }

  function attachEvents() {
    const searchInput = document.getElementById('search-input');
    const categoryFilter = document.getElementById('category-filter');
    const addBtn = document.getElementById('add-memory-btn');

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        render();
      });
    }

    if (categoryFilter) {
      categoryFilter.addEventListener('change', (e) => {
        selectedCategory = e.target.value;
        render();
      });
    }

    if (addBtn) {
      addBtn.addEventListener('click', promptAddMemory);
    }

    // Delete buttons
    document.querySelectorAll('.delete-mem-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        if (confirm('Are you sure you want to delete this memory?')) {
          memoryStore.deleteMemory(id);
          toast.show('Memory deleted', 'info');
          render();
        }
      });
    });

    // Edit buttons
    document.querySelectorAll('.edit-mem-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        editingId = btn.dataset.id;
        render();
        // Focus the title input
        const titleInput = container.querySelector('.edit-title');
        if (titleInput) titleInput.focus();
      });
    });

    // Cancel edit
    document.querySelectorAll('.cancel-edit-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        editingId = null;
        render();
      });
    });

    // Save edit
    document.querySelectorAll('.save-edit-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const title = container.querySelector('.edit-title').value.trim();
        const content = container.querySelector('.edit-content').value.trim();
        const confidence = container.querySelector('.edit-confidence').value;

        if (!title || !content) {
          toast.show('Title and content cannot be empty', 'warning');
          return;
        }

        memoryStore.updateMemory(id, { title, content, confidence });
        editingId = null;
        toast.show('Memory updated ✏️', 'success');
        render();
      });
    });

    // Keyboard shortcuts in edit mode
    if (editingId) {
      const editForm = container.querySelector('.edit-form');
      if (editForm) {
        editForm.addEventListener('keydown', (e) => {
          if (e.key === 'Escape') {
            editingId = null;
            render();
          } else if (e.key === 'Enter' && e.ctrlKey) {
            container.querySelector('.save-edit-btn')?.click();
          }
        });
      }
    }
  }

  function promptAddMemory() {
    const title = prompt('Enter Memory Title:');
    if (!title) return;
    const content = prompt('Enter Memory Details/Content:');
    if (!content) return;

    memoryStore.addMemory({
      category: selectedCategory !== 'all' ? selectedCategory : 'identity',
      title,
      content,
      confidence: 'confirmed',
      source: 'manual'
    });

    toast.show('Memory added manually! 🧠', 'success');
    render();
  }

  render();
}
