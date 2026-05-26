import { useState, useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import type { User } from 'firebase/auth'

import { auth, loadUserData, saveUserField, loadPRsForExercise, addPRForSet } from './lib/firebase'
import { registerSW } from './lib/sw'
import { loadCompleted, saveCompleted, pruneOldCompleted } from './lib/storage'
import { DAYS } from './data/workout'
import type { PR, PRMap, DifficultyMap, CustomRepsMap, CompletedMap } from './types'

import { Header }        from './components/Header'
import { RestTimer }     from './components/RestTimer'
import { ExerciseCard }  from './components/ExerciseCard'
import { PRModal }       from './components/PRModal'
import { SettingsPanel } from './components/SettingsPanel'
import { LoginScreen }   from './components/LoginScreen'

import css from './App.module.css'

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
  const [prModal,      setPrModal]      = useState<{ exName: string; setIndex: number } | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [notifGranted, setNotifGranted] = useState(false)
  const [dataLoaded,   setDataLoaded]   = useState(false)

  const day = DAYS[activeDay]

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

        const uniqueExercises = [
          ...new Map(DAYS.flatMap(d => d.exercises).map(e => [e.name, e])).values()
        ]
        const prData: PRMap = {}
        await Promise.all(uniqueExercises.map(async ex => {
          prData[ex.name] = await loadPRsForExercise(u.uid, ex.name, ex.sets)
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

  const saveCustomReps = async (reps: CustomRepsMap) => {
    const cleaned = Object.fromEntries(
      Object.entries(reps).filter(([, v]) => String(v ?? '').trim() !== '')
    )
    setCustomReps(cleaned)
    if (user) await saveUserField(user.uid, 'customReps', cleaned)
  }

  const totalSets = day.exercises.reduce((s, e) => s + e.sets, 0)
  const doneSets  = day.exercises.reduce((s, e, ei) =>
    s + Array.from({ length: e.sets }, (_, si) => (isSetDone(ei, si) ? 1 : 0) as number)
        .reduce((a, b) => a + b, 0), 0)

  if (user === undefined) {
    return <div className={css.loading}>LOADING...</div>
  }

  if (!user) return <LoginScreen />

  return (
    <div className={css.root}>
      <Header
        user={user}
        activeDay={activeDay}
        doneSets={doneSets}
        totalSets={totalSets}
        notifGranted={notifGranted}
        onDayChange={setActiveDay}
        onNotifGranted={setNotifGranted}
        onShowSettings={() => setShowSettings(true)}
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

        {day.exercises.map((ex, ei) => (
          <ExerciseCard
            key={ex.name}
            exercise={ex}
            exerciseIndex={ei}
            accent={day.accent}
            customReps={customReps[ex.name] ?? ''}
            prs={prs[ex.name] ?? []}
            difficulty={difficulty[ex.name] ?? 0}
            isSetDone={si => isSetDone(ei, si)}
            onToggleSet={si => toggleSet(ei, si)}
            onOpenPR={si => setPrModal({ exName: ex.name, setIndex: si })}
            onDifficultyChange={v => saveDifficulty(ex.name, v)}
          />
        ))}

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

      {showSettings && (
        <SettingsPanel
          customReps={customReps}
          accent={day.accent}
          onSave={saveCustomReps}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  )
}
