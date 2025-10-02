export interface User {
  id: number
  name: string
  email: string
  createdAt: Date
  deletedAt: Date | null
}

export interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}
