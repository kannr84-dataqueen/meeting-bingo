import { useEffect, useRef, useState } from 'react'
import { cn } from '../lib/utils'

interface TranscriptPanelProps {
  isListening: boolean
  transcript: string
  interimTranscript: string
  detectedWords: string[]
}

export default function TranscriptPanel({
  isListening,
  transcript,
  interimTranscript,
  detectedWords,
}: TranscriptPanelProps) {
  const prevListeningRef = useRef(isListening)
  const [statusAnnouncement, setStatusAnnouncement] = useState('')
  const hasAudio = transcript.length > 0 || interimTranscript.length > 0

  useEffect(() => {
    if (prevListeningRef.current !== isListening) {
      prevListeningRef.current = isListening
      setStatusAnnouncement(isListening ? 'Listening started' : 'Listening stopped')
    }
  }, [isListening])

  return (
    <div className="px-4 py-2 bg-white border-t border-gray-100">
      {/* ARIA live region for screen reader announcements */}
      <div aria-live="polite" className="sr-only">
        {statusAnnouncement}
      </div>

      <div className="flex items-start gap-3">
        {/* Mic status dot */}
        <div className="flex items-center gap-1.5 mt-0.5 shrink-0">
          <span
            aria-label={isListening ? 'Microphone active' : undefined}
            className={cn(
              'inline-block w-2.5 h-2.5 rounded-full',
              isListening ? 'bg-red-500 motion-safe:animate-pulse' : 'bg-gray-300'
            )}
          />
          <span className="text-xs font-medium" style={{ color: '#374151' }}>
            {isListening ? 'Listening' : 'Off'}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          {/* Loading state: listening but no audio yet */}
          {isListening && !hasAudio && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full border-2 border-blue-500 border-t-transparent motion-safe:animate-spin" />
              <span className="text-xs" style={{ color: '#374151' }}>
                Waiting for audio…
              </span>
            </div>
          )}

          {/* Finalized transcript */}
          {transcript && (
            <p className="text-xs truncate" style={{ color: '#374151' }}>
              {transcript.slice(-100)}
            </p>
          )}

          {/* Interim transcript */}
          {interimTranscript && (
            <p className="text-xs italic text-gray-400 truncate">{interimTranscript}</p>
          )}

          {/* Detected word badges */}
          {detectedWords.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {detectedWords.map((word, i) => (
                <span
                  key={`${word}-${i}`}
                  className="inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800"
                >
                  {word}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
