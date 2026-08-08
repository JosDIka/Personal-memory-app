/**
 * Bottom Navigation Bar (Mobile)
 * Replaces the sidebar on screens < 768px.
 */

export function renderBottomNav(currentPath) {
  const container = document.getElementById('bottom-nav-container');
  if (!container) return;

  const navItems = [
    { path: '#chat', icon: '💬', label: 'Chat' },
    { path: '#memory', icon: '🧠', label: 'Vault' },
    { path: '#dashboard', icon: '📊', label: 'Stats' },
    { path: '#timeline', icon: '⏳', label: 'Timeline' },
    { path: '#settings', icon: '⚙️', label: 'Settings' }
  ];

  container.innerHTML = `
    <nav class="bottom-nav">
      ${navItems.map(item => `
        <a href="${item.path}" class="bottom-nav-item ${currentPath === item.path ? 'active' : ''}">
          <span class="bottom-nav-icon">${item.icon}</span>
          <span class="bottom-nav-label">${item.label}</span>
        </a>
      `).join('')}
    </nav>
  `;
}
