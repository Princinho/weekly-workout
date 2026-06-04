import { useState, useEffect } from 'react'
import css from './ExerciseSettingsModal.module.css'

interface Props {
  exName: string
  defaultSets: number
  defaultReps: string
  currentSets: number | undefined
  currentReps: string
  accent: string
  onSave: (reps: string, sets: number | undefined) => void
  onClose: () => void
}

export function ExerciseSettingsModal({
  exName, defaultSets, defaultReps,
  currentSets, currentReps,
  accent, onSave, onClose,
}: Props) {
  const [reps, setReps] = useState(currentReps)
  const [sets, setSets] = useState<string>(currentSets !== undefined ? String(currentSets) : '')

  useEffect(() => {
    setReps(currentReps)
    setSets(currentSets !== undefined ? String(currentSets) : '')
  }, [currentReps, currentSets])

  const isCustom = sets !== '' || reps.trim() !== ''

  const handleSave = () => {
    const parsedSets = sets.trim() !== '' ? parseInt(sets) : undefined
    onSave(reps.trim(), parsedSets && !isNaN(parsedSets) ? Math.min(10, Math.max(1, parsedSets)) : undefined)
    onClose()
  }

  const handleReset = () => {
    setReps('')
    setSets('')
  }

  const displaySets  = sets !== '' ? parseInt(sets) || defaultSets : defaultSets
  const displayReps  = reps.trim() || defaultReps

  return (
    <div className={css.overlay} onClick={onClose}>
      <div className={css.sheet} onClick={e => e.stopPropagation()}>

        <div className={css.header}>
          <div>
            <div className={css.tag} style={{ color: accent }}>EXERCISE SETTINGS</div>
            <div className={css.title}>{exName}</div>
          </div>
          <button className={css.closeBtn} onClick={onClose}>&times;</button>
        </div>

        <div className={css.defaultRow}>
          <span className={css.defaultLabel}>PROGRAM DEFAULT</span>
          <span className={css.defaultVal}>{defaultSets} sets &middot; {defaultReps}</span>
        </div>

        <div className={css.fields}>
          <div className={css.field}>
            <label className={css.fieldLabel} style={{ color: accent }}>SETS</label>
            <div className={css.stepper}>
              <button
                className={css.stepBtn}
                onClick={() => setSets(s => String(Math.max(1, (parseInt(s) || defaultSets) - 1)))}
              >&#8722;</button>
              <input
                className={css.stepVal}
                type="number"
                min={1}
                max={10}
                value={sets}
                placeholder={String(defaultSets)}
                onChange={e => setSets(e.target.value)}
                style={{ borderColor: sets !== '' ? accent : '#e0dcd6' }}
              />
              <button
                className={css.stepBtn}
                onClick={() => setSets(s => String(Math.min(10, (parseInt(s) || defaultSets) + 1)))}
              >&#43;</button>
            </div>
            <div className={css.fieldHint}>
              {sets !== '' ? `${displaySets} sets (custom)` : `${defaultSets} sets (default)`}
            </div>
          </div>

          <div className={css.field}>
            <label className={css.fieldLabel} style={{ color: accent }}>REPS TARGET</label>
            <input
              className={css.repInput}
              type="text"
              placeholder={defaultReps}
              value={reps}
              onChange={e => setReps(e.target.value)}
              style={{ borderColor: reps.trim() !== '' ? accent : '#e0dcd6' }}
            />
            <div className={css.fieldHint}>
              {reps.trim() !== '' ? `"${displayReps}" (custom)` : `"${defaultReps}" (default)`}
            </div>
          </div>
        </div>

        <div className={css.actions}>
          {isCustom && (
            <button className={css.resetBtn} onClick={handleReset}>
              RESET TO DEFAULT
            </button>
          )}
          <button
            className={css.saveBtn}
            style={{ background: accent }}
            onClick={handleSave}
          >
            SAVE
          </button>
        </div>

      </div>
    </div>
  )
}
