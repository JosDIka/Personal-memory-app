/**
 * Toast Notification Component
 */

class ToastService {
  constructor() {
    this.container = null;
  }

  _getContainer() {
    if (!this.container) {
      this.container = document.getElementById('toast-container');
    }
    return this.container;
  }

  show(message, type = 'info', duration = 4000) {
    const container = this._getContainer();
    if (!container) return;

    const icons = {
      success: '✨',
      info: '💡',
      warning: '⚠️',
      error: '❌'
    };

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span class="toast-icon">${icons[type] || '💡'}</span>
      <span class="toast-message">${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(50px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, duration);
  }
}

export const toast = new ToastService();
