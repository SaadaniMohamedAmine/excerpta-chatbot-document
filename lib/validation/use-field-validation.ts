// lib/validation/use-field-validation.ts
"use client";

import { useState } from "react";
import type { ZodType } from "zod";

/**
 * Wires a zod schema into the plain useState-per-field pattern already used
 * across the auth forms, instead of pulling in a whole form-state library
 * for four small forms. `errors` holds the first message per field (as a
 * translation key — see lib/validation/auth.ts); `touched` gates when each
 * field's error is actually shown, so a field doesn't turn red before the
 * user has had a chance to fill it in.
 */
export function useFieldValidation<T extends Record<string, unknown>>(schema: ZodType<T>) {
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  function validate(values: T): boolean {
    const result = schema.safeParse(values);
    if (result.success) {
      setErrors({});
      return true;
    }
    const next: Partial<Record<keyof T, string>> = {};
    for (const issue of result.error.issues) {
      const key = issue.path[0] as keyof T | undefined;
      if (key !== undefined && !next[key]) next[key] = issue.message;
    }
    setErrors(next);
    return false;
  }

  function touch(key: keyof T) {
    setTouched((prev) => (prev[key] ? prev : { ...prev, [key]: true }));
  }

  function touchAll(keys: (keyof T)[]) {
    setTouched(Object.fromEntries(keys.map((key) => [key, true])) as Partial<Record<keyof T, boolean>>);
  }

  return { errors, touched, validate, touch, touchAll };
}
