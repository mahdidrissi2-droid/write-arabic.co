export const FEEDBACK_MESSAGES = {
  excellent: [
    "Absolutely perfect! 🌟 You've mastered this!",
    "Wow! That's flawless! Your hand control is amazing!",
    "Perfect match! You're a natural! 🎯",
    "Outstanding work! You nailed every stroke!",
    "Incredible! Your letter formation is spot on!",
    "Masterpiece! This is exactly how it should look!",
    "Fantastic! You've got the perfect rhythm and flow!",
    "You crushed it! That was picture-perfect!",
    "Brilliant! Your practice is really paying off!",
    "Exceptional! You're becoming an expert!",
    "Perfection achieved! Your precision is stunning! ⭐",
    "Flawless execution! You're a writing master!",
    "Spectacular! Every curve is absolutely right!",
    "Professional quality! You've got serious skills!",
    "Unbelievable! Your consistency is perfect!",
    "Champion! That's championship-level writing!",
    "Magical! Your strokes are smooth and confident!",
    "Absolutely magnificent! You're a natural talent!",
    "Jaw-dropping quality! You nailed the form perfectly!",
    "Superb! Your mastery is truly impressive! 🏆",
  ],
  great: [
    "Excellent work! You're really getting it! 👏",
    "Very nice! Just a few small touches to perfect it.",
    "Great job! Your strokes are smooth and confident!",
    "Really good! Keep this up and you'll be perfect soon!",
    "Nice effort! Your form is coming together beautifully!",
    "Well done! You understand the structure really well!",
    "Strong work! You're improving so much!",
    "Impressive! Your practice is showing real progress!",
    "Good going! You've captured the essence of the letter!",
    "Solid work! You're getting closer to mastery!",
  ],
  good: [
    "Good effort! You've got the right idea! 💪",
    "Nice try! The flow is there, refine the edges.",
    "You're on the right track! Keep practicing!",
    "Good foundation! Work on the curves a bit more.",
    "Decent work! A bit more practice and you'll nail it!",
    "You understand the basics! Now refine your technique.",
    "Pretty good! Your spacing and proportion are improving!",
    "You're making progress! Focus on consistency next.",
    "Not bad at all! You're learning the rhythm well!",
    "Good attempt! Your confidence is building nicely!",
  ],
  fair: [
    "Not quite there yet! Let's try again! 🎯",
    "You're learning! Focus on the main strokes first.",
    "Getting better! Pay attention to the letter's shape.",
    "Keep going! The connection points need work.",
    "You've got potential! Practice makes perfect!",
    "Close! But let's refine the form a bit more.",
    "You're on your way! The basics need strengthening.",
    "Don't worry! This is just the beginning! 🌱",
    "Practice is key! You'll get there soon!",
    "Keep trying! Every attempt helps you improve!",
  ],
  needsWork: [
    "Keep practicing! You'll get the hang of it! 💪",
    "Don't give up! This is a learning process!",
    "Let's try that again! Every attempt makes you better!",
    "Not quite! Focus on the letter's basic shape first.",
    "This is normal! Arabic writing takes patience!",
    "Keep going! You're building the foundation!",
    "Try again! Pay close attention to the guide.",
    "You've got this! Practice one stroke at a time!",
    "No worries! Even the best had to start somewhere!",
    "Keep learning! Your next try will be better!",
  ],
}

export function getRandomFeedback(percentage: number): { title: string; message: string } {
  let messages

  if (percentage >= 90) {
    messages = FEEDBACK_MESSAGES.excellent
    return {
      title: "Perfect! 🌟",
      message: messages[Math.floor(Math.random() * messages.length)],
    }
  } else if (percentage >= 75) {
    messages = FEEDBACK_MESSAGES.great
    return {
      title: "Excellent! 👏",
      message: messages[Math.floor(Math.random() * messages.length)],
    }
  } else if (percentage >= 60) {
    messages = FEEDBACK_MESSAGES.good
    return {
      title: "Good Job! 👍",
      message: messages[Math.floor(Math.random() * messages.length)],
    }
  } else if (percentage >= 40) {
    messages = FEEDBACK_MESSAGES.fair
    return {
      title: "Getting There! 🌱",
      message: messages[Math.floor(Math.random() * messages.length)],
    }
  } else {
    messages = FEEDBACK_MESSAGES.needsWork
    return {
      title: "Keep Learning! 💪",
      message: messages[Math.floor(Math.random() * messages.length)],
    }
  }
}
