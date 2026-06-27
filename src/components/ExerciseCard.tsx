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
  customSets: number | undefined
  prs: PR[][]
  difficulty: number
  isSetDone: (si: number) => boolean
  onToggleSet: (si: number) => void
  onOpenPR: (si: number) => void
  onOpenSettings: () => void
  onDifficultyChange: (v: number) => void
}

export function ExerciseCard({
  exercise: ex,
  accent,
  customReps,
  customSets,
  prs,
  difficulty,
  isSetDone,
  onToggleSet,
  onOpenPR,
  onOpenSettings,
  onDifficultyChange,
}: Props) {
  const [open, setOpen] = useState(false)

  const numSets    = customSets ?? ex.sets
  const allDone    = Array.from({ length: numSets }, (_, si) => isSetDone(si)).every(Boolean)
  const displayRep = (customReps?.trim()) || ex.reps
  const isCustom   = Boolean(customReps?.trim()) || customSets !== undefined
  const validVids  = ex.videos.filter(v => v.trim())

  const overallBest = prs.flat().length
    ? Math.max(...prs.flat().map(p => p.reps))
    : null

  // Most recent PR for a given set (prs are stored newest-first)
  const latestPRForSet = (si: number): number | null => {
    const setPrs = prs[si] ?? []
    return setPrs.length ? setPrs[0].reps : null
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
              {numSets} sets &middot; {displayRep} reps
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
          {Array.from({ length: numSets }, (_, si) => (
            <SetButton
              key={si}
              number={si + 1}
              done={isSetDone(si)}
              targetReps={displayRep}
              latestPR={latestPRForSet(si)}
              accent={accent}
              onToggle={() => onToggleSet(si)}
              onLongPress={() => onOpenPR(si)}
            />
          ))}
        </div>
      </div>

      <div className={css.footer}>
        <DifficultyRating value={difficulty} onChange={onDifficultyChange} accent={accent} />

        <div className={css.footerRight}>
          <span className={css.prHint} style={{ color: accent + 'aa' }}>
            {totalRecords > 0
              ? `${totalRecords} record${totalRecords > 1 ? 's' : ''} - hold a set`
              : 'Hold a set to log PR'}
          </span>
          <button
            className={css.settingsBtn}
            onClick={onOpenSettings}
            title="Configure sets & reps"
          >
            &#9881;
          </button>
        </div>
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
