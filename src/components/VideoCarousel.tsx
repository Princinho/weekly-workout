import { useState, useEffect, useRef } from 'react'
import css from './VideoCarousel.module.css'

interface Props {
  videos: string[]
  accent: string
}

function getYouTubeId(url: string): string | null {
  const patterns = [
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/,
    /youtu\.be\/([a-zA-Z0-9_-]+)/,
    /youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/,
  ]
  for (const p of patterns) {
    const m = url.match(p)
    if (m) return m[1]
  }
  return null
}

export function VideoCarousel({ videos, accent }: Props) {
  const [active, setActive] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => {
      if (containerRef.current) setIsMobile(containerRef.current.offsetWidth < 400)
    }
    check()
    const ro = new ResizeObserver(check)
    if (containerRef.current) ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  if (!videos?.length) return null
  const ids = videos.map(getYouTubeId).filter(Boolean) as string[]
  if (!ids.length) return null

  const currentId = ids[active]
  const isShort   = videos[active]?.includes('/shorts/')
  const useRow    = isShort && !isMobile

  const playerStyle = {
    paddingBottom: isShort ? '177.78%' : '56.25%',
    width:         useRow ? 180 : '100%',
  }

  const player = (
    <div className={css.player} style={playerStyle}>
      <iframe
        key={currentId}
        src={`https://www.youtube.com/embed/${currentId}?rel=0&modestbranding=1`}
        title="video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  )

  const thumbs = ids.length > 1 ? (
    <div className={useRow ? css.thumbsCol : css.thumbs}>
      {ids.map((id, i) => (
        <button
          key={id}
          className={[css.thumb, active === i ? css.active : ''].join(' ')}
          style={{ borderColor: active === i ? accent : 'transparent' }}
          onClick={() => setActive(i)}
        >
          <img src={`https://img.youtube.com/vi/${id}/mqdefault.jpg`} alt="" />
        </button>
      ))}
    </div>
  ) : null

  return (
    <div ref={containerRef} className={css.root}>
      <div className={css.label} style={{ color: accent }}>▶ VIDEO REFERENCE</div>
      {useRow
        ? <div className={css.row}>{player}{thumbs}</div>
        : <div className={css.col}>{player}{thumbs}</div>
      }
    </div>
  )
}
