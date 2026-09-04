// lib/validation/auth.ts
//
// Schemas hold validation rules only — every message is a translation KEY
// (looked up as Auth.validation.<key> by the form that uses it), not
// English text, so the same schema serves both locales.
import { z } from "zod";

// Every schema below only ever uses one of these as a validation message —
// forms cast the matched field error to this type before handing it to
// t(`validation.${key}`), since next-intl's generated key types can't see
// through a plain `string` coming out of zod's error shape on their own.
export type ValidationKey = "required" | "invalidEmail" | "passwordTooShort" | "nameTooLong" | "passwordsDontMatch";

const email = z.string().trim().min(1, "required").email("invalidEmail");
const password = z.string().min(8, "passwordTooShort");
const name = z.string().trim().min(1, "required").max(100, "nameTooLong");

export const signInSchema = z.object({
  email,
  password: z.string().min(1, "required"),
});
export type SignInValues = z.infer<typeof signInSchema>;

export const signUpSchema = z
  .object({
    name,
    email,
    password,
    confirmPassword: z.string().min(1, "required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "passwordsDontMatch",
    path: ["confirmPassword"],
  });
export type SignUpValues = z.infer<typeof signUpSchema>;

export const forgotPasswordSchema = z.object({ email });
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password,
    confirmPassword: z.string().min(1, "required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "passwordsDontMatch",
    path: ["confirmPassword"],
  });
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
