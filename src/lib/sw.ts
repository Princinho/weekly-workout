export async function registerSW() {
  if (!('serviceWorker' in navigator)) return
  try { await navigator.serviceWorker.register('/sw.js') } catch (e) { console.warn('SW failed', e) }
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  return (await Notification.requestPermission()) === 'granted'
}

type SWMessageType = 'TIMER_START' | 'TIMER_STOP' | 'TIMER_RESET' | 'TIMER_ADJUST'

export function swMessage(type: SWMessageType, extra: Record<string, unknown> = {}) {
  if (!('serviceWorker' in navigator) || !navigator.serviceWorker.controller) return
  navigator.serviceWorker.controller.postMessage({ type, ...extra })
}
