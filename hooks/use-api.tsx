"use client"

import { useTransition, useCallback, useState } from "react"

/**
 * Generic API hook for handling server actions with built-in loading states and optimistic updates.
 *
 * @example
 * ```tsx
 * const createTodo = useApi({
 *   action: createTodoAction,
 *   onSuccess: (todo) => console.log('Created:', todo),
 *   onError: (error) => console.error('Error:', error),
 *   optimisticUpdate: (currentTodos, input) => {
 *     return [...(currentTodos || []), { id: 'temp', ...input }]
 *   }
 * })
 *
 * // In your component
 * <button
 *   onClick={() => createTodo.execute({ title: 'New Todo' })}
 *   disabled={createTodo.isPending}
 * >
 *   {createTodo.isPending ? 'Creating...' : 'Create Todo'}
 * </button>
 * ```
 */

export type ApiState<T> = {
  data: T | null
  error: string | null
  isPending: boolean
}

export type ApiAction<TInput, TOutput> = (
  input: TInput,
) => Promise<{ success: boolean; data?: TOutput; error?: string }>

export type OptimisticUpdate<T> = (currentData: T | null, input: any) => T | null

export type UseApiOptions<TInput, TOutput, TData> = {
  action: ApiAction<TInput, TOutput>
  onSuccess?: (data: TOutput) => void
  onError?: (error: string) => void
  optimisticUpdate?: OptimisticUpdate<TData>
}

export function useApi<TInput, TOutput, TData = TOutput>(options: UseApiOptions<TInput, TOutput, TData>) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [optimisticData, setOptimisticData] = useState<TData | null>(null)

  const execute = useCallback(
    async (input: TInput) => {
      setError(null)

      if (options.optimisticUpdate) {
        setOptimisticData((current) => options.optimisticUpdate!(current, input))
      }

      startTransition(async () => {
        try {
          const result = await options.action(input)

          if (result.success && result.data) {
            options.onSuccess?.(result.data)
            setOptimisticData(null)
          } else {
            const errorMessage = result.error || "An error occurred"
            setError(errorMessage)
            options.onError?.(errorMessage)
            setOptimisticData(null)
          }
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred"
          setError(errorMessage)
          options.onError?.(errorMessage)
          setOptimisticData(null)
        }
      })
    },
    [options],
  )

  return {
    execute,
    isPending,
    error,
    optimisticData,
  }
}
