/**
 * migrate-prs-to-sessions.js
 *
 * One-time migration: reconstructs historical sessions from existing PR data
 * and writes them to users/{uid}/sessions/{date}.
 *
 * Schema written:
 *   users/{uid}/sessions/{date} = {
 *     date:      "YYYY-MM-DD",
 *     dayIndex:  0|1|2|3,          // 0=Mon 1=Tue 2=Thu 3=Fri
 *     exercises: [
 *       {
 *         name:      string,
 *         completed: boolean,       // true if at least one PR was logged (best approximation)
 *         sets:      [{ reps, note? }]  // no weight — not captured yet in existing PRs
 *       }
 *     ],
 *     migratedFromPRs: true
 *   }
 *
 * Usage:
 *   npm install firebase-admin --save-dev   (once)
 *   node scripts/migrate-prs-to-sessions.js
 *
 * Requires service-account.json in the project root.
 * Download: Firebase Console → Project Settings → Service Accounts → Generate new private key
 *
 * Idempotent: skips sessions that already exist.
 */

import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore }        from 'firebase-admin/firestore'
import { getAuth }             from 'firebase-admin/auth'
import { readFileSync }        from 'fs'

// ---------------------------------------------------------------------------
// Init
// ---------------------------------------------------------------------------

const serviceAccount = JSON.parse(readFileSync('./service-account.json', 'utf8'))
initializeApp({ credential: cert(serviceAccount) })

const db   = getFirestore()
const auth = getAuth()

// ---------------------------------------------------------------------------
// Workout data (mirrored from src/data/workout.ts)
// ---------------------------------------------------------------------------

/** All exercises per dayIndex (0=Mon, 1=Tue, 2=Thu, 3=Fri) */
const DAY_EXERCISES = {
  0: [
    'Flat Dumbbell Press',
    'Seated Dumbbell Shoulder Press',
    'Chest-Supported Dumbbell Row',
    'Lean-In Lateral Raise',
    'Dumbbell Overhead Tricep Extension',
    'Dumbbell Bicep Curl',
  ],
  1: [
    'Bulgarian Split Squat — Quad Focus',
    'Dumbbell Romanian Deadlift',
    'Heel-Elevated Goblet Squat',
    'Single-Leg Weighted Calf Raise',
    'Dead Bug',
  ],
  2: [
    'Barbell Floor Press',
    '3-Point Dumbbell Row',
    'Dumbbell Lateral Raises',
    'Standing Overhead Tricep Extension',
    'Prone Arm Circles',
    'Dumbbell Bicep Curl',
  ],
  3: [
    'Bulgarian Split Squat — Glute Focus',
    'Single-Leg Hip Thrust',
    'Single-Leg Weighted Calf Raise',
    'Bodyweight Sliding Hamstring Curl',
    'Reverse Crunches',
  ],
}

/** Default set counts per exercise (to know how many subcollections to probe) */
const EXERCISE_SETS = {
  'Flat Dumbbell Press':                    4,
  'Seated Dumbbell Shoulder Press':         3,
  'Chest-Supported Dumbbell Row':           4,
  'Lean-In Lateral Raise':                  3,
  'Dumbbell Overhead Tricep Extension':     3,
  'Dumbbell Bicep Curl':                    3,
  'Bulgarian Split Squat — Quad Focus':     3,
  'Dumbbell Romanian Deadlift':             3,
  'Heel-Elevated Goblet Squat':             3,
  'Single-Leg Weighted Calf Raise':         3,
  'Dead Bug':                               3,
  'Barbell Floor Press':                    4,
  '3-Point Dumbbell Row':                   4,
  'Dumbbell Lateral Raises':                3,
  'Standing Overhead Tricep Extension':     3,
  'Prone Arm Circles':                      3,
  'Bulgarian Split Squat — Glute Focus':    4,
  'Single-Leg Hip Thrust':                  3,
  'Bodyweight Sliding Hamstring Curl':      3,
  'Reverse Crunches':                       3,
}

const ALL_EXERCISES = [...new Set(Object.values(DAY_EXERCISES).flat())]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Returns dayIndex (0–3) for a YYYY-MM-DD string, or null on rest days.
 * Uses noon UTC to avoid DST edge cases.
 */
function dateToDayIndex(dateStr) {
  const dow = new Date(`${dateStr}T12:00:00Z`).getUTCDay()
  // 0=Sun 1=Mon 2=Tue 3=Wed 4=Thu 5=Fri 6=Sat
  return { 1: 0, 2: 1, 4: 2, 5: 3 }[dow] ?? null
}

function dayLabel(i) {
  return ['Mon — Upper 1', 'Tue — Lower 1', 'Thu — Upper 2', 'Fri — Lower 2'][i] ?? '?'
}

// ---------------------------------------------------------------------------
// PR collection
// ---------------------------------------------------------------------------

/**
 * Reads all PRs for a user, grouped as:
 *   byDate[date][exName][setIndex] = { reps, note? }   (best reps that day per set)
 */
async function collectPRsByDate(uid) {
  const EXTRA_SETS = 3  // probe beyond defaults to catch customSets
  const byDate = {}

  for (const exName of ALL_EXERCISES) {
    const maxSets = (EXERCISE_SETS[exName] ?? 3) + EXTRA_SETS

    for (let si = 0; si < maxSets; si++) {
      const colRef = db.collection(`users/${uid}/prs/${exName}/s${si}`)
      let snap
      try {
        snap = await colRef.get()
      } catch {
        break
      }
      if (snap.empty) continue

      for (const docSnap of snap.docs) {
        const pr   = docSnap.data()
        // pr.date is a full ISO timestamp ("2026-05-26T19:12:36.657Z") — extract YYYY-MM-DD
        const date = typeof pr.date === 'string' ? pr.date.split('T')[0] : null
        if (!date || typeof pr.reps !== 'number') continue

        if (!byDate[date])         byDate[date] = {}
        if (!byDate[date][exName]) byDate[date][exName] = {}

        const current = byDate[date][exName][si]
        if (!current || pr.reps > current.reps) {
          byDate[date][exName][si] = {
            reps: pr.reps,
            ...(pr.note ? { note: pr.note } : {}),
          }
        }
      }
    }
  }

  return byDate
}

// ---------------------------------------------------------------------------
// Migration
// ---------------------------------------------------------------------------

async function migrateUser(uid, email) {
  console.log(`\n── User: ${email ?? uid}`)
  const byDate = await collectPRsByDate(uid)
  const dates  = Object.keys(byDate).sort()

  if (dates.length === 0) {
    console.log('   No PR data found — skipping')
    return
  }

  let written = 0, skipped = 0, rest = 0

  for (const date of dates) {
    const dayIndex = dateToDayIndex(date)

    if (dayIndex === null) {
      rest++
      console.log(`   ${date}  rest day — skipping`)
      continue
    }

    const sessionRef = db.doc(`users/${uid}/sessions/${date}`)
    if ((await sessionRef.get()).exists) {
      skipped++
      console.log(`   ${date}  already exists — skipping`)
      continue
    }

    // Include ALL exercises for this day; completed = has at least one PR
    const exercises = DAY_EXERCISES[dayIndex].map(exName => {
      const prsBySet = byDate[date][exName]  // may be undefined
      const hasPRs   = !!prsBySet

      const sets = hasPRs
        ? Object.entries(prsBySet)
            .sort(([a], [b]) => Number(a) - Number(b))
            .map(([, pr]) => pr)
        : []

      return { name: exName, completed: hasPRs, sets }
    })

    await sessionRef.set({ date, dayIndex, exercises, migratedFromPRs: true })

    written++
    const completedCount = exercises.filter(e => e.completed).length
    console.log(`   ${date}  ${dayLabel(dayIndex)} — ${completedCount}/${exercises.length} exercises with PRs → written`)
  }

  console.log(`   Done: ${written} written, ${skipped} skipped, ${rest} rest days`)
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

async function main() {
  console.log('=== PR → Sessions migration ===\n')

  const { users } = await auth.listUsers()
  console.log(`Found ${users.length} user(s)`)

  for (const user of users) {
    await migrateUser(user.uid, user.email)
  }

  console.log('\n=== Migration complete ===')
  process.exit(0)
}

main().catch(err => {
  console.error('Migration failed:', err)
  process.exit(1)
})
