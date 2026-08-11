"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { registrationSchema, type RegistrationFormValues } from "@/lib/validation/registration";

/**
 * Maps a Supabase signUp() error to copy a student/guardian can act on.
 * Keyed off `error.code` (stable across message wording changes) rather
 * than string-matching `error.message`.
 */
function describeSignUpError(code: string | undefined): string {
  switch (code) {
    case "user_already_exists":
    case "email_exists":
      return "An account with this email already exists. Try signing in instead.";
    case "weak_password":
      return "That password is too weak. Use at least 8 characters, including a letter and a number.";
    default:
      return "Something went wrong creating your account. Please try again.";
  }
}

export function RegisterForm() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [awaitingEmailConfirmation, setAwaitingEmailConfirmation] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: { displayName: "", email: "", password: "" },
  });

  async function onSubmit(values: RegistrationFormValues) {
    setFormError(null);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: { display_name: values.displayName },
        },
      });

      if (error) {
        setFormError(describeSignUpError(error.code));
        return;
      }

      // No session means Supabase's "Confirm email" setting is on -
      // the account exists but can't sign in until it's confirmed.
      if (!data.session) {
        setAwaitingEmailConfirmation(true);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setFormError("Something went wrong creating your account. Please try again.");
    }
  }

  if (awaitingEmailConfirmation) {
    return (
      <p role="status" className="text-center text-sm text-foreground-muted">
        Check your email to confirm your account, then sign in.
      </p>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex w-full max-w-sm flex-col gap-4"
      noValidate
    >
      <div className="flex flex-col gap-1.5">
        <label htmlFor="displayName" className="text-sm font-medium text-foreground">
          Name
        </label>
        <input
          id="displayName"
          type="text"
          autoComplete="name"
          className="rounded-md border border-line bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
          {...register("displayName")}
        />
        {errors.displayName && (
          <p role="alert" className="text-sm text-error">
            {errors.displayName.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium text-foreground">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          className="rounded-md border border-line bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
          {...register("email")}
        />
        {errors.email && (
          <p role="alert" className="text-sm text-error">
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium text-foreground">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          className="rounded-md border border-line bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
          {...register("password")}
        />
        {errors.password && (
          <p role="alert" className="text-sm text-error">
            {errors.password.message}
          </p>
        )}
      </div>

      {formError && (
        <p role="alert" aria-live="polite" className="text-sm text-error">
          {formError}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Creating account..." : "Create account"}
      </button>
    </form>
  );
}
