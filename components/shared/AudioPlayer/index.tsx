'use client'

import { Pause, Play } from 'lucide-react'
import { useRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface AudioPlayerProps {
  src?: string // Alias for audioSrc
  audioSrc?: string
  variant?: 'louis' | 'arthur' | 'alexandra' | 'default'
  agentColor?: string
  className?: string
}

export function AudioPlayer({
  src,
  audioSrc,
  variant = 'default',
  agentColor = 'violet',
  className,
}: AudioPlayerProps) {
  const finalAudioSrc = src || audioSrc || ''
  const finalColor =
    variant === 'louis'
      ? 'blue'
      : variant === 'arthur'
        ? 'orange'
        : variant === 'alexandra'
          ? 'green'
          : agentColor
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)

  const togglePlay = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }

    setIsPlaying(!isPlaying)
  }

  const handleTimeUpdate = () => {
    if (!audioRef.current) return
    setCurrentTime(audioRef.current.currentTime)
  }

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return
    setDuration(audioRef.current.duration)
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return
    const newTime = parseFloat(e.target.value)
    audioRef.current.currentTime = newTime
    setCurrentTime(newTime)
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div
      className={cn(
        'flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10',
        className,
      )}
    >
      {/* Play/Pause Button */}
      <button
        onClick={togglePlay}
        className={cn(
          'flex items-center justify-center w-12 h-12 rounded-full transition-all',
          'bg-gradient-to-r shadow-lg',
          {
            'from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600':
              finalColor === 'blue',
            'from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600':
              finalColor === 'orange',
            'from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600':
              finalColor === 'green',
            'from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700':
              finalColor === 'violet',
          },
        )}
      >
        {isPlaying ? (
          <Pause className="w-5 h-5 text-white" />
        ) : (
          <Play className="w-5 h-5 text-white ml-0.5" />
        )}
      </button>

      {/* Progress Bar */}
      <div className="flex-1 flex flex-col gap-2">
        <input
          type="range"
          min="0"
          max={duration || 0}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, rgba(139, 92, 246, 0.5) 0%, rgba(139, 92, 246, 0.5) ${(currentTime / duration) * 100}%, rgba(255, 255, 255, 0.1) ${(currentTime / duration) * 100}%, rgba(255, 255, 255, 0.1) 100%)`,
          }}
        />

        {/* Time Display */}
        <div className="flex justify-between text-xs text-gray-400">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        src={finalAudioSrc}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />
    </div>
  )
}
