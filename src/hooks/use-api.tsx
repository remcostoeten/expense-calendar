"use client"

import { useTransition, useCallback, useState, useOptimistic } from "react"

/**
 * Generic API hook for handling server actions with built-in loading states and optimistic updates.
 * Uses React 18's useOptimistic for better optimistic update handling.
 *
 * @example
 * ```tsx
 * const createTodo = useApi({
 *   action: createTodoAction,
 *   initialData: [],
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
  initialData?: TData | null
  onSuccess?: (data: TOutput) => void
  onError?: (error: string) => void
  optimisticUpdate?: OptimisticUpdate<TData>
}

export function useApi<TInput, TOutput, TData = TOutput>(options: UseApiOptions<TInput, TOutput, TData>) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  
  const [optimisticData, addOptimistic] = useOptimistic(
    options.initialData || null,
    (state, input: { type: 'optimistic'; data: TData } | { type: 'revert' }) => {
      if (input.type === 'revert') {
        return options.initialData || null
      }
      return input.data as NonNullable<TData> | null
    }
  )

  const execute = useCallback(
    async (input: TInput) => {
      setError(null)

      // Apply optimistic update if provided
      if (options.optimisticUpdate) {
        const optimisticResult = options.optimisticUpdate(optimisticData, input)
        if (optimisticResult !== null) {
          addOptimistic({ type: 'optimistic', data: optimisticResult })
        }
      }

      startTransition(async () => {
        try {
          const result = await options.action(input)

          if (result.success && result.data) {
            options.onSuccess?.(result.data)
            // Revert optimistic update on success
            addOptimistic({ type: 'revert' })
          } else {
            const errorMessage = result.error || "An error occurred"
            setError(errorMessage)
            options.onError?.(errorMessage)
            // Revert optimistic update on error
            addOptimistic({ type: 'revert' })
          }
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred"
          setError(errorMessage)
          options.onError?.(errorMessage)
          // Revert optimistic update on error
          addOptimistic({ type: 'revert' })
        }
      })
    },
    [options, optimisticData, addOptimistic],
  )

  return {
    execute,
    isPending,
    error,
    optimisticData,
  }
}
