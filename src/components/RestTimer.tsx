import { useState, useEffect, useRef, useCallback } from 'react'
import { playBeep } from '../lib/audio'
import { swMessage } from '../lib/sw'
import css from './RestTimer.module.css'

interface Props {
  triggerCount: number
  accent: string
}

const DEFAULT_DURATION = 105

export function RestTimer({ triggerCount, accent }: Props) {
  const [duration,  setDuration]  = useState(DEFAULT_DURATION)
  const [remaining, setRemaining] = useState<number | null>(null)
  const [running,   setRunning]   = useState(false)

  const deadlineRef  = useRef<number | null>(null)
  const rafRef       = useRef<number>(0)
  const prevTrigger  = useRef(0)
  const beepedRef    = useRef(false)

  const tick = useCallback(() => {
    if (!deadlineRef.current) return
    const left = Math.max(0, Math.round((deadlineRef.current - Date.now()) / 1000))
    setRemaining(left)
    if (left <= 0) {
      deadlineRef.current = null
      setRunning(false)
      if (!beepedRef.current) { beepedRef.current = true; playBeep() }
      swMessage('TIMER_STOP')
      return
    }
    rafRef.current = requestAnimationFrame(tick)
  }, [])

  const stop = useCallback(() => {
    deadlineRef.current = null
    cancelAnimationFrame(rafRef.current)
    setRunning(false)
    swMessage('TIMER_STOP')
  }, [])

  const reset = useCallback(() => {
    stop()
    beepedRef.current = false
    setRemaining(null)
    swMessage('TIMER_RESET')
  }, [stop])

  const startCountdown = useCallback((secs: number) => {
    cancelAnimationFrame(rafRef.current)
    beepedRef.current = false
    deadlineRef.current = Date.now() + secs * 1000
    setRunning(true)
    rafRef.current = requestAnimationFrame(tick)
    swMessage('TIMER_START', { remaining: secs })
  }, [tick])

  // Re-sync after tab comes back
  useEffect(() => {
    const onVisible = () => {
      if (deadlineRef.current && document.visibilityState === 'visible') {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = requestAnimationFrame(tick)
      }
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      document.removeEventListener('visibilitychange', onVisible)
      cancelAnimationFrame(rafRef.current)
    }
  }, [tick])

  // Auto-start when a set is ticked
  useEffect(() => {
    if (triggerCount > prevTrigger.current) {
      prevTrigger.current = triggerCount
      startCountdown(duration)
    }
  }, [triggerCount, duration, startCountdown])

  const adjustDuration = (delta: number) => {
    const next = Math.max(15, duration + delta)
    setDuration(next)
    if (running && deadlineRef.current) {
      deadlineRef.current += delta * 1000
      setRemaining(Math.max(0, Math.round((deadlineRef.current - Date.now()) / 1000)))
      swMessage('TIMER_ADJUST', { deltaSecs: delta })
    }
  }

  const idle = remaining === null
  const done = remaining === 0 && !running
  const progress = idle ? 0 : duration > 0 ? Math.max(0, (remaining! / duration) * 100) : 0

  const fmt = (s: number | null): string => {
    if (s === null) return `${duration}s`
    if (s >= 60)   return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
    return `${s}s`
  }

  const R = 22, C = 2 * Math.PI * R
  const dash = idle ? 0 : (progress / 100) * C

  const trackColor  = running || done ? '#2e2e2e' : '#ddd8d0'
  const strokeColor = done ? '#4CAF79' : accent
  const labelColor  = running || done ? (done ? '#4CAF79' : accent) : '#888'
  const statusColor = running ? accent : done ? '#4CAF79' : '#aaa'
  const durColor    = running || done ? '#ccc' : '#666'

  return (
    <div
      className={[css.container, running || done ? css.active : css.idle].join(' ')}
      style={{ border: `1.5px solid ${running || done ? accent + '88' : '#ddd8d0'}`,
               boxShadow: running ? `0 0 0 3px ${accent}33, 0 8px 32px rgba(0,0,0,0.25)` : undefined }}
    >
      {/* Ring */}
      <div className={css.ring}>
        <svg width="52" height="52">
          <circle cx="26" cy="26" r={R} fill="none" stroke={trackColor} strokeWidth="3" />
          <circle cx="26" cy="26" r={R} fill="none" stroke={strokeColor} strokeWidth="3"
            strokeDasharray={`${dash} ${C}`} strokeLinecap="round" />
        </svg>
        <div className={css.ringLabel} style={{ fontSize: idle ? 11 : remaining! >= 60 ? 11 : 14, color: labelColor }}>
          {done ? '✓' : fmt(remaining)}
        </div>
      </div>

      {/* Info */}
      <div className={css.info}>
        <div className={css.status} style={{ color: statusColor }}>
          {done ? 'REST COMPLETE — GO!' : running ? 'RESTING…' : 'REST TIMER'}
        </div>
        <div className={css.controls}>
          {[-15, +15].map(d => (
            <button key={d} className={css.adjustBtn} onClick={() => adjustDuration(d)}>
              {d > 0 ? '+' : '−'}
            </button>
          ))}
          <span className={css.durLabel} style={{ color: durColor }}>{duration}s</span>
        </div>
      </div>

      {/* Actions */}
      <div className={css.actions}>
        {running
          ? <button className={css.btnStop} onClick={stop}>STOP</button>
          : <button className={css.btnStart} style={{ background: accent }} onClick={() => startCountdown(duration)}>START</button>
        }
        <button className={css.btnReset} onClick={reset}>↺</button>
      </div>
    </div>
  )
}
