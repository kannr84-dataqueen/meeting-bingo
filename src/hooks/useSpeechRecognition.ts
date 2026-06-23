import { useState, useEffect, useRef, useCallback } from 'react'

interface SpeechRecognitionHook {
  isSupported: boolean
  isListening: boolean
  transcript: string
  interimTranscript: string
  error: string | null
  startListening: (onResult: (finalText: string) => void) => void
  stopListening: () => void
}

export function useSpeechRecognition(): SpeechRecognitionHook {
  const SpeechAPI = window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null
  const isSupported = !!SpeechAPI

  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const shouldRestartRef = useRef(false)
  const onResultRef = useRef<((text: string) => void) | null>(null)

  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!SpeechAPI) return

    const recognition = new SpeechAPI()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onstart = () => {
      setIsListening(true)
      setError(null)
    }

    recognition.onend = () => {
      setIsListening(false)
      setInterimTranscript('')
      if (shouldRestartRef.current) {
        try {
          recognition.start()
        } catch {
          // already running or recognition not ready
        }
      }
    }

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = ''
      let final = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          final += text
        } else {
          interim += text
        }
      }
      if (final) {
        setTranscript(prev => (prev + ' ' + final).trim().slice(-2000))
        onResultRef.current?.(final)
      }
      setInterimTranscript(interim)
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === 'not-allowed') {
        shouldRestartRef.current = false
        setError('not-allowed')
      }
      // 'aborted', 'no-speech', etc. — let onend handle restart
    }

    recognitionRef.current = recognition

    return () => {
      shouldRestartRef.current = false
      recognition.onstart = null
      recognition.onend = null
      recognition.onresult = null
      recognition.onerror = null
      recognition.abort()
      recognitionRef.current = null
    }
  }, [SpeechAPI])

  useEffect(() => {
    if (!isSupported) return

    function handleVisibility() {
      if (document.visibilityState === 'hidden') {
        try {
          recognitionRef.current?.stop()
        } catch {
          // not started
        }
      } else if (shouldRestartRef.current) {
        try {
          recognitionRef.current?.start()
        } catch {
          // already running
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [isSupported])

  const startListening = useCallback((onResult: (text: string) => void) => {
    if (!recognitionRef.current) return
    onResultRef.current = onResult
    shouldRestartRef.current = true
    try {
      recognitionRef.current.start()
    } catch {
      // already started
    }
  }, [])

  const stopListening = useCallback(() => {
    shouldRestartRef.current = false
    try {
      recognitionRef.current?.stop()
    } catch {
      // not started
    }
  }, [])

  return { isSupported, isListening, transcript, interimTranscript, error, startListening, stopListening }
}
