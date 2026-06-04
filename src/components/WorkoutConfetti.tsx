import { useEffect, useRef } from 'react'
import confetti from 'canvas-confetti'

interface Props {
  accent: string
}

export function WorkoutConfetti({ accent }: Props) {
  const firedRef = useRef(false)

  useEffect(() => {
    if (firedRef.current) return
    firedRef.current = true

    // First burst
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: [accent, '#ffffff', '#ffd700', '#ff6b6b', '#4ecdc4'],
    })

    // Second burst from the sides
    setTimeout(() => {
      confetti({ particleCount: 60, angle: 60, spread: 55, origin: { x: 0 }, colors: [accent, '#ffd700'] })
      confetti({ particleCount: 60, angle: 120, spread: 55, origin: { x: 1 }, colors: [accent, '#ffd700'] })
    }, 300)
  }, [accent])

  return null
}
