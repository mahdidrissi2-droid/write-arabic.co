export function speakArabic(text: string, rate = 0.85) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = 'ar-SA'
  u.rate = rate
  u.pitch = 1
  window.speechSynthesis.speak(u)
}
