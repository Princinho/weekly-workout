import { useState } from 'react'
import type { Exercise } from '../types'
import css from './DaySettingsModal.module.css'

interface ExerciseRow {
  name: string
  enabled: boolean
}

interface Props {
  exercises: Exercise[]
  disabledExercises: Record<string, boolean>
  exerciseOrder: string[] | undefined
  accent: string
  onSave: (order: string[], disabled: Record<string, boolean>) => void
  onClose: () => void
}

export function DaySettingsModal({ exercises, disabledExercises, exerciseOrder, accent, onSave, onClose }: Props) {
  const buildRows = (): ExerciseRow[] => {
    const ordered = exerciseOrder?.length
      ? [
          ...exerciseOrder.map(name => exercises.find(e => e.name === name)).filter(Boolean) as Exercise[],
          ...exercises.filter(e => !exerciseOrder.includes(e.name)),
        ]
      : exercises
    return ordered.map(e => ({ name: e.name, enabled: !disabledExercises[e.name] }))
  }

  const [rows, setRows] = useState<ExerciseRow[]>(buildRows)

  const move = (i: number, dir: -1 | 1) => {
    const next = [...rows]
    const j = i + dir
    if (j < 0 || j >= next.length) return
    ;[next[i], next[j]] = [next[j], next[i]]
    setRows(next)
  }

  const toggle = (i: number) => {
    const next = [...rows]
    next[i] = { ...next[i], enabled: !next[i].enabled }
    setRows(next)
  }

  const handleSave = () => {
    const order = rows.map(r => r.name)
    const disabled: Record<string, boolean> = {}
    rows.forEach(r => { if (!r.enabled) disabled[r.name] = true })
    onSave(order, disabled)
    onClose()
  }

  return (
    <div className={css.overlay} onClick={onClose}>
      <div className={css.sheet} onClick={e => e.stopPropagation()}>
        <div className={css.header}>
          <div className={css.title}>EXERCISES</div>
          <button className={css.closeBtn} onClick={onClose}>&times;</button>
        </div>
        <p className={css.hint}>Toggle to enable/disable · arrows to reorder</p>

        <div className={css.list}>
          {rows.map((row, i) => (
            <div key={row.name} className={[css.row, row.enabled ? '' : css.rowDisabled].join(' ')}>
              <div className={css.reorderBtns}>
                <button className={css.arrowBtn} onClick={() => move(i, -1)} disabled={i === 0}>↑</button>
                <button className={css.arrowBtn} onClick={() => move(i, 1)} disabled={i === rows.length - 1}>↓</button>
              </div>
              <span className={css.exName}>{row.name}</span>
              <button
                className={[css.toggleBtn, row.enabled ? css.toggleOn : css.toggleOff].join(' ')}
                style={row.enabled ? { background: accent } : undefined}
                onClick={() => toggle(i)}
              >
                {row.enabled ? 'ON' : 'OFF'}
              </button>
            </div>
          ))}
        </div>

        <button
          className={css.saveBtn}
          style={{ background: accent }}
          onClick={handleSave}
        >
          SAVE
        </button>
      </div>
    </div>
  )
}
