/**
 * Interview Stages Progression Definitions
 */

export const STAGES = [
  {
    id: 1,
    title: 'Stage 1 — Identity',
    shortName: 'Identity',
    icon: '🪪',
    description: 'Establish who you are, where you are from, how you describe yourself, and what defines you.',
    topics: ['Name', 'Origin', 'Self-Description', 'Defining Traits', 'Core Values'],
    sampleQuestions: [
      'What should I call you?',
      'Where are you from, and how has your background shaped you?',
      'What are a few words or qualities that define who you are?'
    ]
  },
  {
    id: 2,
    title: 'Stage 2 — Life Story',
    shortName: 'Life',
    icon: '📖',
    description: 'Explore childhood, education, key life events, achievements, difficult moments, and lessons learned.',
    topics: ['Childhood', 'Education', 'Major Events', 'Achievements', 'Lessons Learned'],
    sampleQuestions: [
      'What was a pivotal moment in your life that changed your trajectory?',
      'What is an achievement or milestone you feel proud of?',
      'What is an important lesson life has taught you?'
    ]
  },
  {
    id: 3,
    title: 'Stage 3 — Personality & Mindset',
    shortName: 'Personality',
    icon: '🧠',
    description: 'Understand your personality, strengths, habits, principles, likes, dislikes, and daily rhythm.',
    topics: ['Strengths & Weaknesses', 'Daily Habits', 'Values & Principles', 'Likes & Dislikes'],
    sampleQuestions: [
      'How would your close friends describe your personality?',
      'What are core values or principles you live by?',
      'What habits or routines keep you grounded?'
    ]
  },
  {
    id: 4,
    title: 'Stage 4 — Relationships',
    shortName: 'Relationships',
    icon: '👥',
    description: 'Map out important people in your life: family, close friends, mentors, and shared memories.',
    topics: ['Family', 'Close Friends', 'Mentors', 'Influential People', 'Shared Memories'],
    sampleQuestions: [
      'Who are the most influential people in your life?',
      'Tell me about a favorite memory with family or friends.',
      'Who has been a key mentor or guide for you?'
    ]
  },
  {
    id: 5,
    title: 'Stage 5 — Goals & Dreams',
    shortName: 'Goals',
    icon: '🎯',
    description: 'Discover your current, career, financial, and personal aspirations, dreams, and long-term plans.',
    topics: ['Current Goals', 'Career Vision', 'Financial Independence', 'Personal Dreams', 'Skills to Learn'],
    sampleQuestions: [
      'What is your top priority goal right now?',
      'What does personal or financial independence mean to you?',
      'What is a dream or long-term plan you are working toward?'
    ]
  },
  {
    id: 6,
    title: 'Stage 6 — Projects & Skills',
    shortName: 'Projects',
    icon: '⚡',
    description: 'Catalog your active projects, past accomplishments, hobbies, skills, and creative ideas.',
    topics: ['Current Projects', 'Past Projects', 'Skills', 'Hobbies & Passions', 'Future Ideas'],
    sampleQuestions: [
      'What project or work are you currently working on or excited about?',
      'What skills or topics are you passionate about mastering?',
      'What are some hobbies or creative outlets you enjoy in your free time?'
    ]
  },
  {
    id: 7,
    title: 'Stage 7 — Continuous Memory',
    shortName: 'Continuous',
    icon: '♾️',
    description: 'Ongoing organic conversations to update, refine, and expand your digital memory over time.',
    topics: ['Daily Reflection', 'Memory Updates', 'Deep Dives', 'Contradiction Resolution'],
    sampleQuestions: [
      'What was on your mind today?',
      'Have any of your goals or priorities shifted recently?',
      'Is there a specific memory or thought you would like to record today?'
    ]
  }
];

export function getStageMeta(stageId) {
  return STAGES.find(s => s.id === stageId) || STAGES[0];
}
