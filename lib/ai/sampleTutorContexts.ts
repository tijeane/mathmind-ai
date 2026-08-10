import type { TutorContext } from "@/lib/ai/buildTutorContext";

/**
 * MM-502: five sample tutor contexts for human pedagogy review.
 * Drawn from the Fractions Foundations pilot exercises (MM-204).
 */
export const SAMPLE_TUTOR_CONTEXTS: TutorContext[] = [
  {
    userId: "sample-user",
    exercise: {
      id: "sample-ex-1",
      conceptId: "sample-concept-1",
      prompt:
        "A pizza is cut into 4 equal slices. You eat 1 slice. What fraction of the pizza did you eat?",
      difficultyLevel: 1,
      answerKey: "1/4",
    },
    concept: {
      id: "sample-concept-1",
      title: "Understanding Parts of a Whole",
      description:
        "Introduces a fraction as equal parts of a whole, using visual models like shaded shapes and number lines.",
    },
    recentAttempts: [],
  },
  {
    userId: "sample-user",
    exercise: {
      id: "sample-ex-2",
      conceptId: "sample-concept-2",
      prompt: "In the fraction 3/5, what is the numerator?",
      difficultyLevel: 1,
      answerKey: "3",
    },
    concept: {
      id: "sample-concept-2",
      title: "Numerators and Denominators",
      description:
        "Explains the role of the numerator and denominator in a fraction, and how to read and write fractions correctly.",
    },
    recentAttempts: [
      {
        id: "sample-attempt-2",
        exerciseId: "sample-ex-2",
        submittedAnswer: "5",
        isCorrect: false,
        createdAt: "2026-08-10T12:00:00.000Z",
      },
    ],
  },
  {
    userId: "sample-user",
    exercise: {
      id: "sample-ex-3",
      conceptId: "sample-concept-3",
      prompt: "Which is larger: 1/4 or 3/4? Write the larger fraction.",
      difficultyLevel: 1,
      answerKey: "3/4",
    },
    concept: {
      id: "sample-concept-3",
      title: "Comparing Fractions",
      description:
        "Teaches how to compare two fractions to determine which is larger, smaller, or equal, using common denominators and visual models.",
    },
    recentAttempts: [],
  },
  {
    userId: "sample-user",
    exercise: {
      id: "sample-ex-4",
      conceptId: "sample-concept-4",
      prompt: "Write a fraction equivalent to 1/2 that has a denominator of 4.",
      difficultyLevel: 1,
      answerKey: "2/4",
    },
    concept: {
      id: "sample-concept-4",
      title: "Equivalent Fractions",
      description:
        "Shows how different fractions can represent the same value, and how to generate equivalent fractions by multiplying or dividing.",
    },
    recentAttempts: [
      {
        id: "sample-attempt-4",
        exerciseId: "sample-ex-4",
        submittedAnswer: "1/4",
        isCorrect: false,
        createdAt: "2026-08-10T12:05:00.000Z",
      },
    ],
  },
  {
    userId: "sample-user",
    exercise: {
      id: "sample-ex-5",
      conceptId: "sample-concept-5",
      prompt: "Add: 1/2 + 1/4. Write the sum as a fraction.",
      difficultyLevel: 2,
      answerKey: "3/4",
    },
    concept: {
      id: "sample-concept-5",
      title: "Adding Fractions with Unlike Denominators",
      description:
        "Combines equivalent fractions and like-denominator addition to add fractions that start with different denominators.",
    },
    recentAttempts: [
      {
        id: "sample-attempt-5a",
        exerciseId: "sample-ex-5",
        submittedAnswer: "2/6",
        isCorrect: false,
        createdAt: "2026-08-10T12:10:00.000Z",
      },
      {
        id: "sample-attempt-5b",
        exerciseId: "sample-ex-5",
        submittedAnswer: "1/6",
        isCorrect: false,
        createdAt: "2026-08-10T12:12:00.000Z",
      },
    ],
  },
];

export const SAMPLE_STUDENT_QUESTIONS = [
  "Can you give me a hint?",
  "I think the bottom number is the answer — am I right?",
  "How do I compare these?",
  "I don't know how to make an equivalent fraction.",
  "Please explain how to add these step by step.",
] as const;
