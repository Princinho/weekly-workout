import { useState, useEffect, useRef } from 'react'
import type React from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import type { User } from 'firebase/auth'

import { auth, loadUserData, saveUserField, loadPRsForExercise, addPRForSet, archiveSession } from './lib/firebase'
import { registerSW } from './lib/sw'
import { loadCompleted, saveCompleted, pruneOldCompleted } from './lib/storage'
import { DAYS } from './data/workout'
import type { PR, PRMap, DifficultyMap, CustomRepsMap, CustomSetsMap, CompletedMap, SessionSet } from './types'

import { Header }                 from './components/Header'
import { RestTimer }              from './components/RestTimer'
import { ExerciseCard }           from './components/ExerciseCard'
import { PRModal }                from './components/PRModal'
import { ExerciseSettingsModal }  from './components/ExerciseSettingsModal'
import { LoginScreen }            from './components/LoginScreen'
import { WorkoutConfetti }        from './components/WorkoutConfetti'
import { ProgressView }           from './components/ProgressView'

import css from './App.module.css'

function todayDateStr(): string {
  return new Date().toISOString().split('T')[0]
}

function getTodayDayIndex(): number {
  const dow = new Date().getDay()
  const map: Record<number, number> = {
    0: 0, // Sunday  -> Monday
    1: 0, // Monday
    2: 1, // Tuesday
    3: 2, // Wednesday -> Thursday
    4: 2, // Thursday
    5: 3, // Friday
    6: 0, // Saturday -> Monday
  }
  return map[dow] ?? 0
}

export default function App() {
  const [user,         setUser]         = useState<User | null | undefined>(undefined)
  const [activeDay,    setActiveDay]    = useState(getTodayDayIndex)
  const [completed,    setCompleted]    = useState<CompletedMap>({})
  const [timerTrigger, setTimerTrigger] = useState(0)
  const [difficulty,   setDifficulty]   = useState<DifficultyMap>({})
  const [prs,          setPrs]          = useState<PRMap>({})
  const [customReps,   setCustomReps]   = useState<CustomRepsMap>({})
  const [customSets,   setCustomSets]   = useState<CustomSetsMap>({})
  const [prModal,      setPrModal]      = useState<{ exName: string; setIndex: number } | null>(null)
  const [settingsEx,   setSettingsEx]   = useState<string | null>(null)
  const [dataLoaded,   setDataLoaded]   = useState(false)
  const [notifGranted,  setNotifGranted]  = useState(false)
  const [showProgress,  setShowProgress]  = useState(false)
  const [activeExIndex, setActiveExIndex] = useState(0)

  const day = DAYS[activeDay]
  const prevDoneRef = useRef(false)
  const prevActiveDayRef = useRef(activeDay)
  const touchStartX     = useRef(0)

  useEffect(() => {
    registerSW()
    pruneOldCompleted()
    setCompleted(loadCompleted())

    if ('Notification' in window && Notification.permission === 'granted') {
      setNotifGranted(true)
    }

    const unsub = onAuthStateChanged(auth, async u => {
      setUser(u)
      if (u) {
        const data = await loadUserData(u.uid)
        if (data.difficulty) setDifficulty(data.difficulty)
        if (data.customReps) setCustomReps(data.customReps)
        if (data.customSets) setCustomSets(data.customSets)

        const uniqueExercises = [
          ...new Map(DAYS.flatMap(d => d.exercises).map(e => [e.name, e])).values()
        ]
        const prData: PRMap = {}
        await Promise.all(uniqueExercises.map(async ex => {
          const numSets = Math.max(ex.sets, data.customSets?.[ex.name] ?? 0)
          prData[ex.name] = await loadPRsForExercise(u.uid, ex.name, numSets)
        }))
        setPrs(prData)
        setDataLoaded(true)
      } else {
        setDataLoaded(false)
      }
    })
    return unsub
  }, [])

  const toggleSet = (ei: number, si: number) => {
    const k = `${activeDay}-${ei}-${si}`
    const wasOff = !completed[k]
    const next = { ...completed, [k]: !completed[k] }
    setCompleted(next)
    saveCompleted(next)
    if (wasOff) setTimerTrigger(t => t + 1)
  }

  const isSetDone = (ei: number, si: number) => !!completed[`${activeDay}-${ei}-${si}`]

  const saveDifficulty = async (exName: string, val: number) => {
    const next = { ...difficulty, [exName]: val }
    setDifficulty(next)
    if (user) await saveUserField(user.uid, 'difficulty', next)
  }

  const savePR = async (exName: string, setIndex: number, pr: PR) => {
    if (user) await addPRForSet(user.uid, exName, setIndex, pr)
    setPrs(p => {
      const exPrs = [...(p[exName] ?? [])]
      exPrs[setIndex] = [pr, ...(exPrs[setIndex] ?? [])]
      return { ...p, [exName]: exPrs }
    })
  }

  const saveExerciseSettings = async (exName: string, reps: string, sets: number | undefined) => {
    const nextReps = { ...customReps }
    const nextSets = { ...customSets }

    if (reps.trim()) nextReps[exName] = reps.trim()
    else delete nextReps[exName]

    if (sets !== undefined) nextSets[exName] = sets
    else delete nextSets[exName]

    setCustomReps(nextReps)
    setCustomSets(nextSets)
    if (user) {
      await saveUserField(user.uid, 'customReps', nextReps)
      await saveUserField(user.uid, 'customSets', nextSets)
    }
  }

  // Progress for current day
  const totalSets = day.exercises.reduce((s, e) => s + (customSets[e.name] ?? e.sets), 0)
  const doneSets  = day.exercises.reduce((s, e, ei) => {
    const n = customSets[e.name] ?? e.sets
    return s + Array.from({ length: n }, (_, si) => (isSetDone(ei, si) ? 1 : 0) as number)
      .reduce((a, b) => a + b, 0)
  }, 0)

  const workoutComplete = totalSets > 0 && doneSets === totalSets
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    if (workoutComplete && !prevDoneRef.current) {
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 5000)

      if (user) {
        const today = todayDateStr()
        const exercises = day.exercises.map((ex, ei) => {
          const numSets = customSets[ex.name] ?? ex.sets
          const allDone = Array.from({ length: numSets }, (_, si) =>
            !!completed[`${activeDay}-${ei}-${si}`]
          ).every(Boolean)

          const sets = (Array.from({ length: numSets }, (_, si) => {
            const pr = prs[ex.name]?.[si]?.find(p => p.date.startsWith(today))
            if (!pr) return null
            return {
              reps: pr.reps,
              ...(pr.weight !== undefined ? { weight: pr.weight } : {}),
              ...(pr.note ? { note: pr.note } : {}),
            }
          }).filter(Boolean)) as SessionSet[]

          return { name: ex.name, completed: allDone, sets }
        })

        archiveSession(user.uid, { date: today, dayIndex: activeDay, exercises })
          .catch(err => console.error('archiveSession failed:', err))
      }
    }
    prevDoneRef.current = workoutComplete
  }, [workoutComplete]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (activeDay !== prevActiveDayRef.current) {
      prevActiveDayRef.current = activeDay
      prevDoneRef.current = workoutComplete
      setShowConfetti(false)
      setActiveExIndex(0)
    }
  }, [activeDay, workoutComplete])

  const ex  = day.exercises[activeExIndex]
  const nav = (dir: 1 | -1) =>
    setActiveExIndex(i => Math.max(0, Math.min(day.exercises.length - 1, i + dir)))

  const onTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX }
  const onTouchEnd   = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current
    if (dx < -40) nav(1)
    else if (dx > 40) nav(-1)
  }

  if (user === undefined) return <div className={css.loading}>LOADING...</div>
  if (!user) return <LoginScreen />

  const settingsExercise = settingsEx
    ? DAYS.flatMap(d => d.exercises).find(e => e.name === settingsEx) ?? null
    : null

  return (
    <div className={css.root}>
      {showConfetti && <WorkoutConfetti accent={day.accent} />}

      <Header
        user={user}
        activeDay={activeDay}
        doneSets={doneSets}
        totalSets={totalSets}
        notifGranted={notifGranted}
        onDayChange={setActiveDay}
        onNotifGranted={setNotifGranted}
        onProgressOpen={() => setShowProgress(true)}
      />

      <div className={css.sessionHeader}>
        <div className={css.sessionTitle}>
          <div className={css.sessionName}>{day.sublabel}</div>
          <div className={css.sessionLine} style={{ background: day.accent }} />
        </div>
        <div className={css.muscleTags}>
          {day.muscles.map(m => (
            <span key={m} className={css.muscleTag}
                  style={{ background: day.accent + '22', color: day.accent }}>
              {m}
            </span>
          ))}
        </div>
      </div>

      <div className={css.exercises}>
        <RestTimer triggerCount={timerTrigger} accent={day.accent} />

        {!dataLoaded && <div className={css.dataLoading}>Loading your data...</div>}

        {/* Nav dots */}
        <div className={css.navDots}>
          {day.exercises.map((e, i) => {
            const n    = customSets[e.name] ?? e.sets
            const done = Array.from({ length: n }, (_, si) => isSetDone(i, si)).every(Boolean)
            return (
              <button
                key={i}
                className={[css.navDot, i === activeExIndex ? css.navDotActive : ''].join(' ')}
                style={{ background: done ? day.accent : i === activeExIndex ? day.accent + '66' : undefined }}
                onClick={() => setActiveExIndex(i)}
                title={e.name}
              />
            )
          })}
        </div>

        {/* Single exercise card */}
        <div
          key={`${activeDay}-${activeExIndex}`}
          className={css.slide}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {ex && (
            <ExerciseCard
              exercise={ex}
              exerciseIndex={activeExIndex}
              accent={day.accent}
              customReps={customReps[ex.name] ?? ''}
              customSets={customSets[ex.name]}
              prs={prs[ex.name] ?? []}
              difficulty={difficulty[ex.name] ?? 0}
              isSetDone={si => isSetDone(activeExIndex, si)}
              onToggleSet={si => toggleSet(activeExIndex, si)}
              onOpenPR={si => setPrModal({ exName: ex.name, setIndex: si })}
              onOpenSettings={() => setSettingsEx(ex.name)}
              onDifficultyChange={v => saveDifficulty(ex.name, v)}
            />
          )}
        </div>

        {/* Prev / Next */}
        <div className={css.navBtns}>
          <button
            className={css.navBtn}
            disabled={activeExIndex === 0}
            onClick={() => nav(-1)}
          >&#8592; Prev</button>
          <span className={css.navCounter}>{activeExIndex + 1} / {day.exercises.length}</span>
          <button
            className={css.navBtn}
            disabled={activeExIndex === day.exercises.length - 1}
            onClick={() => nav(1)}
          >Next &#8594;</button>
        </div>

        <div className={css.scheduleNote}>
          <strong>Schedule:</strong> Mon - Tue - rest Wed - Thu - Fri - rest weekend<br />
          <strong>Warm-up:</strong> 5-10 min before each session<br />
          <strong>When 12 reps is easy:</strong> slow the reps down (3s down, 1s pause)
        </div>
      </div>

      {prModal && (
        <PRModal
          exName={prModal.exName}
          setIndex={prModal.setIndex}
          prs={(prs[prModal.exName] ?? [])[prModal.setIndex] ?? []}
          accent={day.accent}
          onSave={pr => savePR(prModal.exName, prModal.setIndex, pr)}
          onClose={() => setPrModal(null)}
        />
      )}

      {showProgress && (
        <ProgressView
          uid={user.uid}
          accent={day.accent}
          onClose={() => setShowProgress(false)}
        />
      )}

      {settingsEx && settingsExercise && (
        <ExerciseSettingsModal
          exName={settingsEx}
          defaultSets={settingsExercise.sets}
          defaultReps={settingsExercise.reps}
          currentSets={customSets[settingsEx]}
          currentReps={customReps[settingsEx] ?? ''}
          accent={day.accent}
          onSave={(reps, sets) => saveExerciseSettings(settingsEx, reps, sets)}
          onClose={() => setSettingsEx(null)}
        />
      )}
    </div>
  )
}
