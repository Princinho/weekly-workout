import { useState, useEffect } from 'react'
import type { CustomRepsMap } from '../types'
import { getUniqueExercises } from '../data/workout'
import css from './SettingsPanel.module.css'

interface Props {
  customReps: CustomRepsMap
  accent: string
  onSave: (reps: CustomRepsMap) => void
  onClose: () => void
}

export function SettingsPanel({ customReps, accent, onSave, onClose }: Props) {
  const [local, setLocal] = useState<CustomRepsMap>({ ...customReps })

  // Re-sync if Firestore data arrives after the panel opened
  useEffect(() => { setLocal({ ...customReps }) }, [customReps])

  const unique = getUniqueExercises()

  return (
    <div className={css.overlay} onClick={onClose}>
      <div className={css.sheet} onClick={e => e.stopPropagation()}>

        <div className={css.header}>
          <div>
            <div className={css.tag} style={{ color: accent }}>SETTINGS</div>
            <div className={css.title}>Rep Targets</div>
          </div>
          <button className={css.closeBtn} onClick={onClose}>×</button>
        </div>

        <p className={css.hint}>Leave blank to use the program default.</p>

        {unique.map(ex => (
          <div key={ex.name} className={css.row}>
            <div className={css.exInfo}>
              <div className={css.exName}>{ex.name}</div>
              <div className={css.exDefault}>default: {ex.reps}</div>
            </div>
            <input
              className={css.repInput}
              type="text"
              placeholder={ex.reps}
              value={local[ex.name] ?? ''}
              style={{ borderColor: local[ex.name]?.trim() ? accent : '#e0dcd6' }}
              onChange={e => setLocal(p => ({ ...p, [ex.name]: e.target.value }))}
            />
          </div>
        ))}

        <button
          className={css.saveBtn}
          style={{ background: accent }}
          onClick={() => { onSave(local); onClose() }}
        >
          SAVE SETTINGS
        </button>

      </div>
    </div>
  )
}
