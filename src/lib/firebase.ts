import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import {
  getFirestore, doc, getDoc, setDoc, deleteDoc,
  collection, addDoc, query, getDocs, orderBy,
} from 'firebase/firestore'
import type { PR, Session, UserData } from '../types'

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId:     import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

const app             = initializeApp(firebaseConfig)
export const auth     = getAuth(app)
export const db       = getFirestore(app)
export const provider = new GoogleAuthProvider()

const userDoc    = (uid: string) => doc(db, 'users', uid)
const sessionCol = (uid: string) => collection(db, 'users', uid, 'sessions')

// Path: users/{uid}/prs/{exName}/s{setIndex} = 5 segments (odd = valid collection)
const prSetCol = (uid: string, exName: string, setIndex: number) =>
  collection(db, 'users', uid, 'prs', exName, `s${setIndex}`)

export async function loadUserData(uid: string): Promise<UserData> {
  const snap = await getDoc(userDoc(uid))
  return snap.exists() ? (snap.data() as UserData) : {}
}

export async function saveUserField(
  uid: string, field: keyof UserData, value: unknown
) {
  await setDoc(userDoc(uid), { [field]: value }, { merge: true })
}

export async function loadPRsForExercise(
  uid: string, exName: string, numSets: number
): Promise<PR[][]> {
  const results: PR[][] = Array.from({ length: numSets }, () => [])
  await Promise.all(
    results.map(async (_, si) => {
      try {
        const q    = query(prSetCol(uid, exName, si), orderBy('date', 'desc'))
        const snap = await getDocs(q)
        results[si] = snap.docs.map(d => ({ id: d.id, ...d.data() } as PR))
      } catch { /* empty set */ }
    })
  )
  return results
}

export async function addPRForSet(
  uid: string, exName: string, setIndex: number, pr: PR
) {
  const { id: _id, ...prData } = pr
  await addDoc(prSetCol(uid, exName, setIndex), prData)
}

export async function deletePRForSet(
  uid: string, exName: string, setIndex: number, prId: string
) {
  const ref = doc(db, 'users', uid, 'prs', exName, `s${setIndex}`, prId)
  await deleteDoc(ref)
}

export async function archiveSession(uid: string, session: Session) {
  const ref = doc(db, 'users', uid, 'sessions', session.date)
  await setDoc(ref, session)
}

export async function loadSessions(uid: string): Promise<Session[]> {
  const q    = query(sessionCol(uid), orderBy('date', 'asc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => d.data() as Session)
}
