import { useState, useRef } from 'react'
import css from './SetButton.module.css'

interface Props {
  done: boolean
  number: number
  /** Target reps label (e.g. "8–12"). First digit shown when no PR. */
  targetReps: string
  /** Most recent session's reps for this set, or null if none */
  latestPR: number | null
  accent: string
  onToggle: () => void
  onLongPress: () => void
}

/** Parse the first integer out of a reps string like "8–12 per side" → "8" */
function firstRep(reps: string): string {
  const m = reps.match(/\d+/)
  return m ? m[0] : reps
}

export function SetButton({ done, number, targetReps, latestPR, accent, onToggle, onLongPress }: Props) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const firedRef = useRef(false)
  const [pressing, setPressing] = useState(false)

  const startPress = () => {
    firedRef.current = false
    setPressing(true)
    timerRef.current = setTimeout(() => {
      firedRef.current = true
      setPressing(false)
      onLongPress()
    }, 500)
  }

  const endPress = (shouldToggle: boolean) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setPressing(false)
    if (shouldToggle && !firedRef.current) onToggle()
    firedRef.current = false
  }

  // What to display inside the button
  let label: string
  if (done) {
    label = '✓'
  } else if (latestPR !== null) {
    label = String(latestPR)
  } else {
    label = firstRep(targetReps)
  }

  const bgColor = pressing
    ? done ? accent : accent + '55'
    : done ? accent : undefined

  const textColor = pressing
    ? done ? '#1a1a1a' : accent
    : done ? '#1a1a1a' : undefined

  return (
    <button
      className={[
        css.btn,
        done ? css.done : css.idle,
        pressing ? css.pressing : '',
      ].join(' ')}
      title={`Set ${number} · appui long pour logger un PR`}
      style={{
        background:  bgColor,
        color:       textColor,
        boxShadow:   pressing ? `0 0 0 3px ${accent}44` : undefined,
      }}
      onMouseDown={startPress}
      onMouseUp={() => endPress(true)}
      onMouseLeave={() => endPress(false)}
      onTouchStart={e => { e.preventDefault(); startPress() }}
      onTouchEnd={e => { e.preventDefault(); endPress(true) }}
      onTouchCancel={() => endPress(false)}
    >
      {label}
    </button>
  )
}
