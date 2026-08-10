import { z } from "zod";

/**
 * MM-101: registration form schema (ADR-005 — Zod is the approved
 * validation library). Kept separate from the component so the same
 * schema can be reused server-side later if a Server Action replaces
 * the current client-side Supabase call.
 */
export const registrationSchema = z.object({
  displayName: z.string().trim().min(2, "Name must be at least 2 characters long."),
  email: z
    .string()
    .trim()
    .min(1, "Email is required.")
    .email("Please enter a valid email address."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long.")
    .regex(/[a-zA-Z]/, "Password must contain at least one letter.")
    .regex(/[0-9]/, "Password must contain at least one number."),
});

export type RegistrationFormValues = z.infer<typeof registrationSchema>;
