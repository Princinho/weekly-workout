import type { User } from 'firebase/auth'
import { signOut } from 'firebase/auth'
import { auth } from '../lib/firebase'
import { DAYS } from '../data/workout'
import { requestNotificationPermission } from '../lib/sw'
import css from './Header.module.css'

interface Props {
  user: User
  activeDay: number
  doneSets: number
  totalSets: number
  notifGranted: boolean
  onDayChange: (i: number) => void
  onNotifGranted: (v: boolean) => void
  onProgressOpen: () => void
}

export function Header({
  user, activeDay, doneSets, totalSets,
  notifGranted, onDayChange, onNotifGranted, onProgressOpen,
}: Props) {
  const day = DAYS[activeDay]
  const pct = totalSets > 0 ? Math.round((doneSets / totalSets) * 100) : 0

  const handleLogout = () => signOut(auth)

  return (
    <header className={css.header}>
      <div className={css.inner}>
        <div className={css.topRow}>
          <div className={css.brand}>
            <div className={css.appName}>Wikly</div>
            <div className={css.appSub}>BUILT WITH SCIENCE</div>
          </div>

          <div className={css.right}>
            <button className={css.iconBtn} title="Progression" onClick={onProgressOpen}>
              {'\u{1F4C8}'}
            </button>

            {!notifGranted && (
              <button
                className={css.iconBtn}
                title="Enable notifications"
                onClick={async () => onNotifGranted(await requestNotificationPermission())}
              >🔔</button>
            )}

            {/* Avatar + dropdown */}
            <AvatarMenu user={user} accent={day.accent} onLogout={handleLogout} />

            <div className={css.pct}>
              <div className={css.pctValue} style={{ color: day.accent }}>{pct}%</div>
              <div className={css.pctSub}>{doneSets}/{totalSets}</div>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className={css.progressBar}>
          <div
            className={css.progressFill}
            key={`${activeDay}-${doneSets}`}
            style={{ background: day.accent, '--w': `${pct}%` } as React.CSSProperties}
          />
        </div>

        {/* Day tabs */}
        <div className={css.tabs}>
          {DAYS.map((d, i) => (
            <button
              key={d.id}
              className={css.tab}
              style={{
                background: activeDay === i ? d.accent : '#2a2a2a',
                color:      activeDay === i ? '#1a1a1a' : '#888',
              }}
              onClick={() => onDayChange(i)}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  )
}

// ── Avatar + dropdown (small internal component) ──────────────────────────────
function AvatarMenu({ user, accent, onLogout }: { user: User; accent: string; onLogout: () => void }) {
  const [open, setOpen] = useState(false)

  return (
    <div className={css.avatarWrapper}>
      <button className={css.iconBtn} style={{ padding: 0 }} onClick={() => setOpen(v => !v)}>
        {user.photoURL
          ? <img src={user.photoURL} alt={user.displayName ?? ''} className={css.avatarImg}
                 style={{ border: `2px solid ${accent}` }} />
          : <div className={css.avatarFallback} style={{ background: accent }}>
              {user.displayName?.[0]}
            </div>
        }
      </button>
      {open && (
        <div className={css.dropdown}>
          <div className={css.dropdownName}>{user.displayName}</div>
          <div className={css.dropdownEmail}>{user.email}</div>
          <button className={css.signOutBtn} onClick={() => { onLogout(); setOpen(false) }}>
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}

// useState is used inside this file
import { useState } from 'react'
import type React from 'react'
