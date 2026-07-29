import { useCallback } from 'react'

export function useArabicAudio() {
  const speak = useCallback((text: string, rate: number = 1) => {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel()

    // Create utterance
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'ar-SA' // Arabic (Saudi Arabia)
    utterance.rate = rate
    utterance.pitch = 1
    utterance.volume = 1

    // Speak
    window.speechSynthesis.speak(utterance)
  }, [])

  return { speak }
}
