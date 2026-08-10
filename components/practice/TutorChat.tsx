"use client";

import { useState, type FormEvent } from "react";

type TutorMessage = {
  role: "student" | "tutor";
  content: string;
};

type TutorChatProps = {
  exerciseId: string;
};

/**
 * MM-504: minimal practice-session tutor chat. Asks /api/tutor for help
 * on the current exercise without grading the student's answer.
 */
export function TutorChat({ exerciseId }: TutorChatProps) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<TutorMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isAsking, setIsAsking] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = question.trim();
    if (!trimmed || isAsking) {
      return;
    }

    setIsAsking(true);
    setError(null);
    setMessages((current) => [...current, { role: "student", content: trimmed }]);
    setQuestion("");

    try {
      const response = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exercise_id: exerciseId,
          question: trimmed,
        }),
      });

      const payload = (await response.json()) as {
        data?: { content: string };
        error?: { message: string };
      };

      if (!response.ok || !payload.data) {
        setError(payload.error?.message ?? "Could not get a tutor response.");
        return;
      }

      setMessages((current) => [...current, { role: "tutor", content: payload.data!.content }]);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsAsking(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 border-t border-zinc-200 pt-4 dark:border-zinc-800">
      <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Ask the tutor</h2>
      <p className="text-xs text-zinc-600 dark:text-zinc-400">
        Request a hint or explanation. The tutor will guide your reasoning without giving the final
        answer.
      </p>

      {messages.length > 0 && (
        <ul className="flex flex-col gap-2">
          {messages.map((message, index) => (
            <li
              key={`${message.role}-${index}`}
              className={
                message.role === "student"
                  ? "rounded-md bg-zinc-100 px-3 py-2 text-sm text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100"
                  : "rounded-md bg-sky-50 px-3 py-2 text-sm text-zinc-900 dark:bg-sky-950/40 dark:text-zinc-100"
              }
            >
              <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                {message.role === "student" ? "You" : "Tutor"}
              </span>
              {message.content}
            </li>
          ))}
        </ul>
      )}

      {error && (
        <p role="alert" aria-live="polite" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3" noValidate>
        <label htmlFor="tutor-question" className="sr-only">
          Question for the tutor
        </label>
        <textarea
          id="tutor-question"
          name="tutor-question"
          rows={2}
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          disabled={isAsking}
          placeholder="e.g. Can you give me a hint?"
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        />
        <button
          type="submit"
          disabled={isAsking || !question.trim()}
          className="self-start rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-900"
        >
          {isAsking ? "Thinking..." : "Ask tutor"}
        </button>
      </form>
    </div>
  );
}
