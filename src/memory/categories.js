/**
 * Category taxonomy for Personal Memory entries
 */

export const MEMORY_CATEGORIES = {
  identity: {
    id: 'identity',
    label: 'Identity & Self',
    icon: '🪪',
    color: '#8b5cf6',
    description: 'Basic info, self-conception, background, core values, defining traits'
  },
  life: {
    id: 'life',
    label: 'Life Story',
    icon: '📖',
    color: '#ec4899',
    description: 'Childhood, education, life events, milestones, lessons learned'
  },
  personality: {
    id: 'personality',
    label: 'Personality & Mindset',
    icon: '🧠',
    color: '#a855f7',
    description: 'Strengths, weaknesses, habits, principles, likes & dislikes'
  },
  relationships: {
    id: 'relationships',
    label: 'Relationships & People',
    icon: '👥',
    color: '#06b6d4',
    description: 'Family, friends, mentors, key figures, shared memories'
  },
  goals: {
    id: 'goals',
    label: 'Goals & Aspirations',
    icon: '🎯',
    color: '#10b981',
    description: 'Current goals, career, financial, personal growth, long-term dreams'
  },
  projects: {
    id: 'projects',
    label: 'Projects & Work',
    icon: '⚡',
    color: '#f59e0b',
    description: 'Current/past projects, skills, business ideas, technical expertise'
  },
  interests: {
    id: 'interests',
    label: 'Interests & Passions',
    icon: '🎨',
    color: '#3b82f6',
    description: 'Hobbies, favorite topics, books, media, creative outlets'
  },
  knowledge: {
    id: 'knowledge',
    label: 'Knowledge & Beliefs',
    icon: '💡',
    color: '#6366f1',
    description: 'Worldview, core philosophy, domain expertise, unique perspectives'
  },
  timeline: {
    id: 'timeline',
    label: 'Life Timeline',
    icon: '⏳',
    color: '#e11d48',
    description: 'Dated life events, chronological milestones'
  }
};

export function getCategoryMeta(categoryId) {
  return MEMORY_CATEGORIES[categoryId] || {
    id: categoryId,
    label: categoryId,
    icon: '📌',
    color: '#64748b',
    description: 'General memory'
  };
}
