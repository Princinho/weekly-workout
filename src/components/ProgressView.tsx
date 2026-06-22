import { useState, useEffect } from 'react'
import { loadSessions } from '../lib/firebase'
import { getUniqueExercises } from '../data/workout'
import type { Session } from '../types'
import css from './ProgressView.module.css'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_WEIGHT = 8  // kg — fallback when no weight data exists
const PERIODS = ['1M', '3M', '6M', 'ALL'] as const
type Period = typeof PERIODS[number]

interface DataPoint { date: string; volume: number }

// ---------------------------------------------------------------------------
// Volume computation
// ---------------------------------------------------------------------------

/** Average weight (kg) used across all sessions for an exercise. Falls back to DEFAULT_WEIGHT. */
function avgWeightForEx(sessions: Session[], exName: string): number {
  const weights = sessions.flatMap(s =>
    (s.exercises.find(e => e.name === exName)?.sets ?? [])
      .filter(s => s.weight !== undefined)
      .map(s => s.weight!)
  )
  return weights.length
    ? weights.reduce((a, b) => a + b, 0) / weights.length
    : DEFAULT_WEIGHT
}

/** Volume data points for a single exercise across all sessions. */
function exercisePoints(sessions: Session[], exName: string): DataPoint[] {
  const avgW = avgWeightForEx(sessions, exName)
  return sessions
    .filter(s => s.exercises.some(e => e.name === exName && e.completed))
    .map(s => {
      const ex  = s.exercises.find(e => e.name === exName)!
      const vol = ex.sets.reduce((sum, set) => sum + set.reps * (set.weight ?? avgW), 0)
      return { date: s.date, volume: vol }
    })
}

/** Total volume per session across all completed exercises. */
function globalPoints(sessions: Session[]): DataPoint[] {
  const names = [...new Set(sessions.flatMap(s => s.exercises.map(e => e.name)))]
  const avgWs = Object.fromEntries(names.map(n => [n, avgWeightForEx(sessions, n)]))

  return sessions
    .map(s => {
      const vol = s.exercises
        .filter(e => e.completed)
        .reduce((sum, e) =>
          sum + e.sets.reduce((s2, set) =>
            s2 + set.reps * (set.weight ?? avgWs[e.name] ?? DEFAULT_WEIGHT), 0), 0)
      return { date: s.date, volume: vol }
    })
    .filter(p => p.volume > 0)
}

function filterByPeriod(points: DataPoint[], period: Period): DataPoint[] {
  if (period === 'ALL') return points
  const cutoff = new Date()
  if (period === '1M') cutoff.setMonth(cutoff.getMonth() - 1)
  if (period === '3M') cutoff.setMonth(cutoff.getMonth() - 3)
  if (period === '6M') cutoff.setMonth(cutoff.getMonth() - 6)
  const cutoffStr = cutoff.toISOString().split('T')[0]
  return points.filter(p => p.date >= cutoffStr)
}

/** % change between first and last point. */
function progression(points: DataPoint[]): number | null {
  if (points.length < 2 || points[0].volume === 0) return null
  return Math.round(((points[points.length - 1].volume - points[0].volume) / points[0].volume) * 100)
}

// ---------------------------------------------------------------------------
// SVG Line Chart
// ---------------------------------------------------------------------------

const W = 320, H = 140
const PAD = { top: 10, right: 14, bottom: 24, left: 44 }
const plotW = W - PAD.left - PAD.right
const plotH = H - PAD.top - PAD.bottom

function LineChart({ points, accent }: { points: DataPoint[]; accent: string }) {
  if (points.length < 2) {
    return <div className={css.empty}>Pas assez de données pour cette période</div>
  }

  const vols  = points.map(p => p.volume)
  const minV  = Math.min(...vols)
  const maxV  = Math.max(...vols)
  const range = maxV - minV || 1

  const toX = (i: number) => PAD.left + (i / (points.length - 1)) * plotW
  const toY = (v: number) => PAD.top  + plotH - ((v - minV) / range) * plotH

  const pathD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${toX(i).toFixed(1)},${toY(p.volume).toFixed(1)}`)
    .join(' ')

  const fmt     = (v: number) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : Math.round(v).toString()
  const fmtDate = (d: string) =>
    new Date(d + 'T12:00:00Z').toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={css.chart} preserveAspectRatio="xMidYMid meet">
      {/* Grid */}
      {[0, 0.5, 1].map(t => (
        <line key={t}
          x1={PAD.left} y1={PAD.top + plotH * (1 - t)}
          x2={W - PAD.right} y2={PAD.top + plotH * (1 - t)}
          stroke="#ede9e3" strokeWidth="1"
        />
      ))}

      {/* Line */}
      <path d={pathD} fill="none" stroke={accent} strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round" />

      {/* Dots — only if few points, to avoid clutter */}
      {points.length <= 20 && points.map((p, i) => (
        <circle key={i} cx={toX(i)} cy={toY(p.volume)} r="3"
          fill={accent} stroke="#fff" strokeWidth="1.5" />
      ))}

      {/* Y axis labels */}
      <text x={PAD.left - 6} y={PAD.top + 4}
        textAnchor="end" fontSize="9" fill="#bbb" fontFamily="monospace">{fmt(maxV)}</text>
      <text x={PAD.left - 6} y={PAD.top + plotH + 4}
        textAnchor="end" fontSize="9" fill="#bbb" fontFamily="monospace">{fmt(minV)}</text>

      {/* X axis labels */}
      <text x={PAD.left} y={H - 4}
        textAnchor="start" fontSize="9" fill="#bbb" fontFamily="monospace">{fmtDate(points[0].date)}</text>
      <text x={W - PAD.right} y={H - 4}
        textAnchor="end" fontSize="9" fill="#bbb" fontFamily="monospace">{fmtDate(points[points.length - 1].date)}</text>
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

interface Props {
  uid: string
  accent: string
  onClose: () => void
}

export function ProgressView({ uid, accent, onClose }: Props) {
  const [sessions,   setSessions]   = useState<Session[] | null>(null)
  const [selectedEx, setSelectedEx] = useState('GLOBAL')
  const [period,     setPeriod]     = useState<Period>('3M')

  useEffect(() => {
    loadSessions(uid).then(setSessions)
  }, [uid])

  const exercises = getUniqueExercises()

  const allPoints = sessions === null ? [] :
    selectedEx === 'GLOBAL' ? globalPoints(sessions) : exercisePoints(sessions, selectedEx)

  const points = filterByPeriod(allPoints, period)
  const pct    = progression(points)

  return (
    <div className={css.overlay} onClick={onClose}>
      <div className={css.sheet} onClick={e => e.stopPropagation()}>

        <div className={css.header}>
          <div className={css.title}>PROGRESSION</div>
          <button className={css.closeBtn} onClick={onClose}>&times;</button>
        </div>

        {/* Exercise selector */}
        <select
          className={css.select}
          value={selectedEx}
          onChange={e => setSelectedEx(e.target.value)}
        >
          <option value="GLOBAL">Global — tous les exercices</option>
          {exercises.map(ex => (
            <option key={ex.name} value={ex.name}>{ex.name}</option>
          ))}
        </select>

        {/* Period selector */}
        <div className={css.periods}>
          {PERIODS.map(p => (
            <button key={p} className={css.periodBtn}
              style={period === p ? { background: accent, color: '#1a1a1a', borderColor: accent } : {}}
              onClick={() => setPeriod(p)}
            >
              {p}
            </button>
          ))}
        </div>

        {/* % badge */}
        {pct !== null && (
          <div className={css.badge} style={{ color: pct >= 0 ? '#4CAF79' : '#E8533F' }}>
            {pct >= 0 ? '▲' : '▼'} {Math.abs(pct)}%
            <span className={css.badgeSub}> sur la période</span>
          </div>
        )}

        {/* Chart */}
        {sessions === null
          ? <div className={css.empty}>Chargement…</div>
          : <LineChart points={points} accent={accent} />
        }

        <div className={css.note}>
          Volume = reps × poids (kg) · Poids manquant → moyenne des séances ou 8 kg par défaut
        </div>

      </div>
    </div>
  )
}
