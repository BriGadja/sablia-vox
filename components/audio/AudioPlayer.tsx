'use client'

import { Loader2, Pause, Play, Volume2 } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

const SPEED_OPTIONS = [0.75, 1, 1.25, 1.5, 2] as const
const TRACK_PREFIXES = ['merged', 'user_mic', 'vad', 'iris'] as const
const TRACK_LABELS: Record<string, string> = {
  merged: 'Mixé',
  user_mic: 'Micro',
  vad: 'VAD',
  iris: 'Iris',
}

interface AudioPlayerProps {
  url: string
  className?: string
}

function isValidUrl(url: string): boolean {
  return url.includes('://')
}

function deriveTrackUrl(baseUrl: string, trackPrefix: string): string {
  if (trackPrefix === 'merged') return baseUrl
  // Replace merged_ prefix with the target track prefix
  return baseUrl.replace(/merged_/, `${trackPrefix}_`)
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function AudioPlayer({ url, className }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [speed, setSpeed] = useState(1)
  const [activeTrack, setActiveTrack] = useState('merged')
  const [availableTracks, setAvailableTracks] = useState<string[]>(['merged'])
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const validUrl = isValidUrl(url)
  const currentUrl = validUrl ? deriveTrackUrl(url, activeTrack) : ''

  // Probe available tracks on mount
  useEffect(() => {
    if (!validUrl) return
    if (!url.includes('merged_')) {
      setAvailableTracks(['merged'])
      return
    }

    const tracks: string[] = ['merged']
    let pending = TRACK_PREFIXES.length - 1

    for (const prefix of TRACK_PREFIXES) {
      if (prefix === 'merged') continue
      const trackUrl = deriveTrackUrl(url, prefix)
      const audio = new Audio()
      audio.preload = 'metadata'

      const onLoad = () => {
        tracks.push(prefix)
        audio.src = ''
        pending--
        if (pending === 0) setAvailableTracks([...tracks])
      }
      const onError = () => {
        audio.src = ''
        pending--
        if (pending === 0) setAvailableTracks([...tracks])
      }

      audio.addEventListener('loadedmetadata', onLoad, { once: true })
      audio.addEventListener('error', onError, { once: true })
      audio.src = trackUrl
    }
  }, [url, validUrl])

  // Initialize / switch audio element
  useEffect(() => {
    if (!currentUrl) return
    const audio = new Audio(currentUrl)
    audioRef.current = audio
    audio.playbackRate = speed
    setIsLoading(true)
    setIsPlaying(false)
    setCurrentTime(0)

    const onTimeUpdate = () => setCurrentTime(audio.currentTime)
    const onLoadedMetadata = () => {
      setDuration(audio.duration)
      setIsLoading(false)
    }
    const onEnded = () => setIsPlaying(false)
    const onError = () => setIsLoading(false)

    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('loadedmetadata', onLoadedMetadata)
    audio.addEventListener('ended', onEnded)
    audio.addEventListener('error', onError)

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('loadedmetadata', onLoadedMetadata)
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('error', onError)
      audio.pause()
      audio.src = ''
    }
  }, [currentUrl, speed])

  const togglePlay = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
    }
    setIsPlaying(!isPlaying)
  }, [isPlaying])

  const handleSeek = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const audio = audioRef.current
      const bar = progressRef.current
      if (!audio || !bar || duration === 0) return
      const rect = bar.getBoundingClientRect()
      const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
      audio.currentTime = ratio * duration
      setCurrentTime(audio.currentTime)
    },
    [duration],
  )

  const cycleSpeed = useCallback(() => {
    const idx = SPEED_OPTIONS.indexOf(speed as (typeof SPEED_OPTIONS)[number])
    const next = SPEED_OPTIONS[(idx + 1) % SPEED_OPTIONS.length]
    setSpeed(next)
    if (audioRef.current) audioRef.current.playbackRate = next
  }, [speed])

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  // Invalid URL fallback
  if (!validUrl) {
    return (
      <div
        className={cn(
          'flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10',
          className,
        )}
      >
        <Volume2 className="w-5 h-5 text-white/20" />
        <span className="text-sm text-white/40">Enregistrement indisponible — lien expiré</span>
      </div>
    )
  }

  // Skeleton loading state
  if (isLoading) {
    return (
      <div
        className={cn(
          'flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10',
          className,
        )}
      >
        <div className="p-3 rounded-full bg-purple-500/10">
          <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
        </div>
        <div className="flex-1">
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full w-1/3 bg-purple-500/30 rounded-full animate-pulse" />
          </div>
        </div>
        <span className="text-xs text-white/30 tabular-nums">0:00 / 0:00</span>
      </div>
    )
  }

  return (
    <div className={cn('space-y-3 p-4 rounded-xl bg-white/5 border border-white/10', className)}>
      {/* Track selector (only if multiple tracks available) */}
      {availableTracks.length > 1 && (
        <div className="flex gap-1.5">
          {availableTracks.map((track) => (
            <button
              key={track}
              type="button"
              onClick={() => setActiveTrack(track)}
              className={cn(
                'px-2.5 py-1 rounded-md text-xs font-medium transition-colors',
                activeTrack === track
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : 'bg-white/5 text-white/50 hover:text-white/70 border border-transparent',
              )}
            >
              {TRACK_LABELS[track] || track}
            </button>
          ))}
        </div>
      )}

      {/* Player controls */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={togglePlay}
          className="p-3 rounded-full bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors"
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </button>

        {/* Seek bar */}
        <div
          ref={progressRef}
          onClick={handleSeek}
          onKeyDown={() => {}}
          role="slider"
          tabIndex={0}
          aria-valuenow={currentTime}
          aria-valuemin={0}
          aria-valuemax={duration}
          aria-label="Position de lecture"
          className="flex-1 cursor-pointer group"
        >
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              style={{ width: `${progress}%` }}
              className="h-full bg-purple-500 rounded-full transition-[width] duration-100 group-hover:bg-purple-400"
            />
          </div>
        </div>

        {/* Time display */}
        <span className="text-xs text-white/50 tabular-nums min-w-[80px] text-right">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>

        {/* Speed control */}
        <button
          type="button"
          onClick={cycleSpeed}
          className="px-2 py-1 rounded-md bg-white/5 text-xs text-white/60 hover:text-white/80 hover:bg-white/10 transition-colors tabular-nums min-w-[40px]"
          title="Vitesse de lecture"
        >
          {speed}x
        </button>
      </div>
    </div>
  )
}
