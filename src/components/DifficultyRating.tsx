import css from './DifficultyRating.module.css'

interface Props {
  value: number
  onChange: (v: number) => void
  accent: string
}

const LABELS = ['', 'Easy', 'Moderate', 'Hard', 'Very Hard', 'Max Effort']

export function DifficultyRating({ value, onChange, accent }: Props) {
  return (
    <div className={css.root}>
      <span className={css.label}>DIFFICULTY</span>
      <div className={css.stars}>
        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n}
            className={[css.star, n <= value ? css.lit : ''].join(' ')}
            style={{ color: n <= value ? accent : undefined }}
            onClick={() => onChange(value === n ? 0 : n)}
          >★</button>
        ))}
      </div>
      {value > 0 && (
        <span className={css.ratingLabel} style={{ color: accent }}>{LABELS[value]}</span>
      )}
    </div>
  )
}
