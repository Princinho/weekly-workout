import type { CompletedMap } from '../types'

function todayKey(): string {
  return new Date().toISOString().split('T')[0]  // "2026-05-26"
}

const KEY = () => `wikly-completed-${todayKey()}`

export function loadCompleted(): CompletedMap {
  try {
    const raw = localStorage.getItem(KEY())
    return raw ? (JSON.parse(raw) as CompletedMap) : {}
  } catch {
    return {}
  }
}

export function saveCompleted(completed: CompletedMap): void {
  try {
    localStorage.setItem(KEY(), JSON.stringify(completed))
  } catch { /* ignore quota errors */ }
}

/** Purge keys older than today to avoid accumulation */
export function pruneOldCompleted(): void {
  const today = todayKey()
  Object.keys(localStorage)
    .filter(k => k.startsWith('wikly-completed-') && !k.endsWith(today))
    .forEach(k => localStorage.removeItem(k))
}
