import { useState } from 'react'
import type { Exercise, PR } from '../types'
import { SetButton }        from './SetButton'
import { DifficultyRating } from './DifficultyRating'
import { VideoCarousel }    from './VideoCarousel'
import css from './ExerciseCard.module.css'

interface Props {
  exercise: Exercise
  exerciseIndex: number
  accent: string
  customReps: string
  /** Per-set PR history: prs[setIndex] = PR[] */
  prs: PR[][]
  difficulty: number
  isSetDone: (si: number) => boolean
  onToggleSet: (si: number) => void
  onOpenPR: (si: number) => void
  onDifficultyChange: (v: number) => void
}

export function ExerciseCard({
  exercise: ex,
  accent,
  customReps,
  prs,
  difficulty,
  isSetDone,
  onToggleSet,
  onOpenPR,
  onDifficultyChange,
}: Props) {
  const [open, setOpen] = useState(false)

  const allDone    = Array.from({ length: ex.sets }, (_, si) => isSetDone(si)).every(Boolean)
  const displayRep = (customReps?.trim()) || ex.reps
  const isCustom   = Boolean(customReps?.trim())
  const validVids  = ex.videos.filter(v => v.trim())

  const overallBest = prs.flat().length
    ? Math.max(...prs.flat().map(p => p.reps))
    : null

  const bestPRForSet = (si: number): number | null => {
    const setPrs = prs[si] ?? []
    return setPrs.length ? Math.max(...setPrs.map(p => p.reps)) : null
  }

  const totalRecords = prs.flat().length

  return (
    <div className={[css.card, allDone ? css.done : ''].join(' ')}
         style={{ borderColor: allDone ? accent + '55' : undefined }}>

      <div className={css.top}>
        <div className={css.info}>
          <div className={css.nameRow}>
            {allDone && <span className={css.checkMark} style={{ color: accent }}>&#10003;</span>}
            <span className={[css.name, allDone ? css.strikethrough : ''].join(' ')}>{ex.name}</span>
          </div>
          <div className={css.meta}>
            <span className={css.equipBadge}>{ex.equipment}</span>
            <span className={[css.repsBadge, isCustom ? css.custom : ''].join(' ')}
                  style={{ color: isCustom ? accent : '#999' }}>
              {ex.sets} sets &middot; {displayRep} reps
              {isCustom && <span className={css.customLabel}> (custom)</span>}
            </span>
            {validVids.length > 0 && (
              <span className={css.videoBadge}>{validVids.length} video{validVids.length > 1 ? 's' : ''}</span>
            )}
            {overallBest !== null && (
              <span className={css.prBadge} style={{ background: accent + '18', color: accent }}>
                {overallBest} reps PR
              </span>
            )}
          </div>
        </div>

        <div className={css.sets}>
          {Array.from({ length: ex.sets }, (_, si) => (
            <SetButton
              key={si}
              number={si + 1}
              done={isSetDone(si)}
              targetReps={displayRep}
              bestPR={bestPRForSet(si)}
              accent={accent}
              onToggle={() => onToggleSet(si)}
              onLongPress={() => onOpenPR(si)}
            />
          ))}
        </div>
      </div>

      <div className={css.footer}>
        <DifficultyRating value={difficulty} onChange={onDifficultyChange} accent={accent} />
        <span className={css.prHint} style={{ color: accent + 'aa' }}>
          {totalRecords > 0
            ? `${totalRecords} record${totalRecords > 1 ? 's' : ''} - hold a set`
            : 'Hold a set to log PR'}
        </span>
      </div>

      <button className={css.expandToggle} onClick={() => setOpen(o => !o)}>
        <span className={[css.arrow, open ? css.open : ''].join(' ')}>&#9654;</span>
        {open ? 'HIDE DETAILS' : `HOW TO DO IT${validVids.length > 0 ? ' + VIDEOS' : ''} + GOTCHAS`}
      </button>

      {open && (
        <div className={css.detail}>
          <VideoCarousel videos={ex.videos} accent={accent} />

          <div className={css.sectionLabel} style={{ color: accent }}>HOW TO DO IT</div>
          <p className={css.howText}>{ex.how}</p>

          <div className={css.sectionLabel} style={{ color: '#E8533F' }}>WATCH OUT FOR</div>
          <div className={css.gotchaList}>
            {ex.gotchas.map((g, gi) => (
              <div key={gi} className={css.gotchaItem}>
                <span className={css.gotchaIcon}>!</span>
                <span className={css.gotchaText}>{g}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
