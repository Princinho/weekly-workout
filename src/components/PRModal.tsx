import { useState } from 'react'
import type { PR } from '../types'
import css from './PRModal.module.css'

interface Props {
  exName: string
  setIndex: number
  prs: PR[]
  accent: string
  onSave: (pr: PR) => Promise<void>
  onClose: () => void
}

export function PRModal({ exName, setIndex, prs, accent, onSave, onClose }: Props) {
  const [reps,   setReps]   = useState('')
  const [weight, setWeight] = useState('')
  const [note,   setNote]   = useState('')
  const [saving, setSaving] = useState(false)

  const sorted = [...prs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  const best   = prs.length ? Math.max(...prs.map(p => p.reps)) : null

  const handleSave = async () => {
    if (!reps) return
    setSaving(true)
    const pr: PR = { reps: parseInt(reps), note, date: new Date().toISOString() }
    if (weight) pr.weight = parseFloat(weight)
    await onSave(pr)
    setReps('')
    setWeight('')
    setNote('')
    setSaving(false)
  }

  return (
    <div className={css.overlay} onClick={onClose}>
      <div className={css.sheet} onClick={e => e.stopPropagation()}>

        <div className={css.header}>
          <div>
            <div className={css.tag} style={{ color: accent }}>
              SET {setIndex + 1} &middot; PERSONAL RECORDS
            </div>
            <div className={css.title}>{exName}</div>
          </div>
          <button className={css.closeBtn} onClick={onClose}>&times;</button>
        </div>

        <div className={css.form}>
          <div className={css.formLabel}>LOG TODAY'S PERFORMANCE</div>
          <div className={css.formRow}>
            <input
              className={css.input}
              type="number"
              placeholder="Reps"
              value={reps}
              onChange={e => setReps(e.target.value)}
            />
            <input
              className={css.inputWeight}
              type="number"
              step="0.5"
              placeholder="kg"
              value={weight}
              onChange={e => setWeight(e.target.value)}
            />
            <button
              className={css.saveBtn}
              style={{ background: accent }}
              disabled={saving}
              onClick={handleSave}
            >
              {saving ? '...' : 'SAVE'}
            </button>
          </div>
          <input
            className={css.inputNote}
            type="text"
            placeholder="Note (optional)"
            value={note}
            onChange={e => setNote(e.target.value)}
          />
        </div>

        {sorted.length === 0
          ? <p className={css.empty}>No records yet. Log your first set!</p>
          : sorted.map((pr, i) => (
            <div key={i} className={css.record}>
              <div className={css.recordLeft}>
                {pr.reps === best && i === sorted.findIndex(p => p.reps === best) && (
                  <span className={css.bestBadge} style={{ background: accent + '22', color: accent }}>
                    BEST
                  </span>
                )}
                <div>
                  <span className={css.repsVal}>{pr.reps}</span>
                  <span className={css.repsUnit}> reps</span>
                  {pr.weight !== undefined && (
                    <span className={css.repsUnit}> · {pr.weight}kg</span>
                  )}
                  {pr.note && <div className={css.recordNote}>{pr.note}</div>}
                </div>
              </div>
              <div className={css.recordDate}>
                {new Date(pr.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
              </div>
            </div>
          ))
        }

      </div>
    </div>
  )
}
