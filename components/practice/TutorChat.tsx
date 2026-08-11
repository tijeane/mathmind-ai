"use client";

import { useState, type FormEvent } from "react";
import { formatTutorContent } from "@/lib/ai/formatTutorContent";

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

      setMessages((current) => [
        ...current,
        { role: "tutor", content: formatTutorContent(payload.data!.content) },
      ]);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsAsking(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 border-t border-line pt-4">
      <h2 className="text-sm font-medium text-foreground">Ask the tutor</h2>
      <p className="text-xs text-foreground-muted">
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
                  ? "rounded-md bg-background px-3 py-2 text-sm text-foreground"
                  : "rounded-md bg-accent/15 px-3 py-2 text-sm text-foreground"
              }
            >
              <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-foreground-muted">
                {message.role === "student" ? "You" : "Tutor"}
              </span>
              {message.content}
            </li>
          ))}
        </ul>
      )}

      {error && (
        <p role="alert" aria-live="polite" className="text-sm text-error">
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
          className="rounded-md border border-line bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-primary disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={isAsking || !question.trim()}
          className="self-start rounded-full border border-line px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-background disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isAsking ? "Thinking..." : "Ask tutor"}
        </button>
      </form>
    </div>
  );
}
