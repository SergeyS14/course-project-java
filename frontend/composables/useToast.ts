let toastContainer: HTMLDivElement | null = null
let toastId = 0

const createToastContainer = () => {
  if (!process.client) return null
  if (toastContainer) return toastContainer

  toastContainer = document.createElement('div')
  toastContainer.id = 'toast-container'
  toastContainer.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 99999;
    display: flex;
    flex-direction: column;
    gap: 12px;
    pointer-events: none;
  `
  document.body.appendChild(toastContainer)
  return toastContainer
}

export const useToast = () => {
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    if (!process.client) return

    const container = createToastContainer()
    if (!container) return

    const id = toastId++
    const toast = document.createElement('div')
    toast.id = `toast-${id}`
    
    const colors = {
      success: {
        bg: '#10b981',
        border: '#059669',
        icon: 'check_circle'
      },
      error: {
        bg: '#ef4444',
        border: '#dc2626',
        icon: 'error'
      },
      info: {
        bg: '#3b82f6',
        border: '#2563eb',
        icon: 'info'
      }
    }

    const color = colors[type]
    
    toast.style.cssText = `
      background-color: ${color.bg};
      color: white;
      padding: 16px 20px;
      border-radius: 8px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
      border-left: 4px solid ${color.border};
      min-width: 320px;
      max-width: 400px;
      display: flex;
      align-items: center;
      gap: 12px;
      font-weight: 500;
      font-size: 14px;
      pointer-events: auto;
      opacity: 0;
      transform: translateY(20px);
      transition: all 0.3s ease-out;
    `
    
    toast.innerHTML = `
      <span class="material-icons" style="font-size: 24px; flex-shrink: 0;">${color.icon}</span>
      <span style="flex: 1; line-height: 1.5;">${message}</span>
      <button onclick="this.closest('[id^=toast-]').remove()" style="
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        padding: 0;
        margin-left: 8px;
        opacity: 0.8;
        font-size: 20px;
        line-height: 1;
        flex-shrink: 0;
      ">&times;</button>
    `
    
    container.appendChild(toast)
    
    requestAnimationFrame(() => {
      toast.style.opacity = '1'
      toast.style.transform = 'translateY(0)'
    })
    
    setTimeout(() => {
      toast.style.opacity = '0'
      toast.style.transform = 'translateY(-20px)'
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast)
        }
      }, 300)
    }, 4000)
  }

  return {
    showToast,
    success: (message: string) => showToast(message, 'success'),
    error: (message: string) => showToast(message, 'error'),
    info: (message: string) => showToast(message, 'info'),
  }
}
