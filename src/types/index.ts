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
  note?: string
  date: string
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
