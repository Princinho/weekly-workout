export interface Exercise {
  name: string
  equipment: string
  sets: number
  reps: string
  videos: string[]
  how: string
  gotchas: string[]
}

export interface Day {
  id: number
  label: string
  sublabel: string
  accent: string
  muscles: string[]
  exercises: Exercise[]
}

export interface PR {
  reps: number
  weight?: number   // kg, optional — captured from today onwards
  note?: string
  date: string
}

export interface SessionSet {
  reps: number
  weight?: number
  note?: string
}

export interface SessionExercise {
  name: string
  completed: boolean
  sets: SessionSet[]
}

export interface Session {
  date: string          // "YYYY-MM-DD"
  dayIndex: number      // 0=Mon 1=Tue 2=Thu 3=Fri
  exercises: SessionExercise[]
}

/** Per-exercise, per-set PR history: PRMap[exName][setIndex] = PR[] */
export type PRMap          = Record<string, PR[][]>
export type DifficultyMap  = Record<string, number>
export type CustomRepsMap  = Record<string, string>
export type CustomSetsMap  = Record<string, number>
export type CompletedMap   = Record<string, boolean>

export interface UserData {
  difficulty?: DifficultyMap
  customReps?: CustomRepsMap
  customSets?: CustomSetsMap
}
