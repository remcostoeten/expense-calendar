export type TSuccess<T> = { ok: true; value: T }
export type TFailure<E> = { ok: false; error: E }
export type TResult<T, E = string> = TSuccess<T> | TFailure<E>

// Helper functions for creating results
export function createSuccess<T>(value: T): TSuccess<T> {
    return { ok: true, value }
}

export function createFailure<E = string>(error: E): TFailure<E> {
    return { ok: false, error }
}

// Type guards
export function isSuccess<T, E>(result: TResult<T, E>): result is TSuccess<T> {
    return result.ok
}

export function isFailure<T, E>(result: TResult<T, E>): result is TFailure<E> {
    return !result.ok
}
