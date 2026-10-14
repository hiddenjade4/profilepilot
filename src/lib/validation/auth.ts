import { z } from "zod";

// Shared by the forms and the server actions. The server always re-checks,
// because anything sent from a browser can be tampered with.

const email = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email("Enter a valid email address."));

export const signInSchema = z.object({
  email,
  password: z.string().min(1, "Enter your password."),
});

export const signUpSchema = z.object({
  email,
  password: z
    .string()
    .min(8, "Use at least 8 characters.")
    // Supabase hashes passwords with bcrypt, which ignores bytes past 72.
    .max(72, "Use 72 characters or fewer."),
});

export type AuthFormState = {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Partial<Record<"email" | "password", string[]>>;
  // Echoed back so the email field isn't wiped after an error.
  email?: string;
};

export const initialAuthFormState: AuthFormState = { status: "idle" };
