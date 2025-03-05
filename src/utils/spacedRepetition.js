// Simple spaced repetition algorithm based on SM-2
export function calculateNextReview(quality, prevRepetitions, prevEasiness, prevInterval) {
  // Ensure quality is between 0 and 5
  quality = Math.max(0, Math.min(5, quality));

  // Calculate new easiness factor
  let easiness = prevEasiness + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  easiness = Math.max(1.3, easiness); // Minimum easiness factor is 1.3

  let repetitions = quality < 3 ? 0 : prevRepetitions + 1;
  let interval;

  if (repetitions <= 1) {
    interval = 1;
  } else if (repetitions === 2) {
    interval = 6;
  } else {
    interval = Math.round(prevInterval * easiness);
  }

  return {
    repetitions,
    easiness,
    interval,
  };
} 