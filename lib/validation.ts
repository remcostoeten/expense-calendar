type TSuccess<T> = { ok: true; value: T }
type TFailure<E> = { ok: false; error: E }
export type TResult<T, E> = TSuccess<T> | TFailure<E>

export function isValidUserId(id: unknown): id is number {
  return typeof id === "number" && Number.isInteger(id) && id > 0
}

export function validateUserId(id: unknown): TResult<number, string> {
  if (!isValidUserId(id)) {
    return { ok: false, error: "Invalid user ID format" }
  }
  return { ok: true, value: id }
}

export type TValidationError = {
  field: string
  message: string
}

export type TValidationErrors = TValidationError[]

export function validateObject<T extends object>(
  input: unknown,
  validators: Record<keyof T, (value: unknown) => TResult<unknown, string>>,
): TResult<T, TValidationErrors> {
  if (!input || typeof input !== "object") {
    return {
      ok: false,
      error: [{ field: "input", message: "Invalid input object" }],
    }
  }

  const errors: TValidationErrors = []
  const result = {} as T

  for (const [key, validator] of Object.entries(validators)) {
    const value = (input as Record<string, unknown>)[key]
    const validation = validator(value)

    if (!validation.ok) {
      errors.push({ field: key, message: validation.error })
    } else {
      // TypeScript doesn't know that this cast is safe because it can't track
      // that validator returns the correct type, but we enforce this in implementation
      result[key as keyof T] = validation.value as T[keyof T]
    }
  }

  if (errors.length > 0) {
    return { ok: false, error: errors }
  }

  return { ok: true, value: result }
}