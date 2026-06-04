import { useState, useEffect } from 'react'
import type { CustomRepsMap, CustomSetsMap } from '../types'
import { getUniqueExercises } from '../data/workout'
import css from './SettingsPanel.module.css'

interface Props {
  customReps: CustomRepsMap
  customSets: CustomSetsMap
  accent: string
  onSave: (reps: CustomRepsMap, sets: CustomSetsMap) => void
  onClose: () => void
}

export function SettingsPanel({ customReps, customSets, accent, onSave, onClose }: Props) {
  const [localReps, setLocalReps] = useState<CustomRepsMap>({ ...customReps })
  const [localSets, setLocalSets] = useState<CustomSetsMap>({ ...customSets })

  useEffect(() => {
    setLocalReps({ ...customReps })
    setLocalSets({ ...customSets })
  }, [customReps, customSets])

  const unique = getUniqueExercises()

  const handleSetsChange = (name: string, val: string) => {
    const n = parseInt(val)
    if (val === '' || isNaN(n)) {
      setLocalSets(p => { const next = { ...p }; delete next[name]; return next })
    } else {
      setLocalSets(p => ({ ...p, [name]: Math.min(10, Math.max(1, n)) }))
    }
  }

  return (
    <div className={css.overlay} onClick={onClose}>
      <div className={css.sheet} onClick={e => e.stopPropagation()}>

        <div className={css.header}>
          <div>
            <div className={css.tag} style={{ color: accent }}>SETTINGS</div>
            <div className={css.title}>Sets & Reps</div>
          </div>
          <button className={css.closeBtn} onClick={onClose}>&times;</button>
        </div>

        <p className={css.hint}>Leave blank to use the program defaults. Changes sync to your account.</p>

        <div className={css.colHeaders}>
          <div className={css.exColHead}>EXERCISE</div>
          <div className={css.inputColHead}>SETS</div>
          <div className={css.inputColHead}>REPS</div>
        </div>

        {unique.map(ex => (
          <div key={ex.name} className={css.row}>
            <div className={css.exInfo}>
              <div className={css.exName}>{ex.name}</div>
              <div className={css.exDefault}>default: {ex.sets} sets &middot; {ex.reps}</div>
            </div>
            <input
              className={css.setsInput}
              type="number"
              min={1}
              max={10}
              placeholder={String(ex.sets)}
              value={localSets[ex.name] ?? ''}
              style={{ borderColor: localSets[ex.name] ? accent : '#e0dcd6' }}
              onChange={e => handleSetsChange(ex.name, e.target.value)}
            />
            <input
              className={css.repInput}
              type="text"
              placeholder={ex.reps}
              value={localReps[ex.name] ?? ''}
              style={{ borderColor: localReps[ex.name]?.trim() ? accent : '#e0dcd6' }}
              onChange={e => setLocalReps(p => ({ ...p, [ex.name]: e.target.value }))}
            />
          </div>
        ))}

        <button
          className={css.saveBtn}
          style={{ background: accent }}
          onClick={() => { onSave(localReps, localSets); onClose() }}
        >
          SAVE SETTINGS
        </button>

      </div>
    </div>
  )
}
