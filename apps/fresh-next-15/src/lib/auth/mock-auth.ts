import type { User } from "@/lib/types/auth"

// Mock user data - easily replaceable with real auth
export const MOCK_USERS: User[] = [
  {
    id: 123,
    name: "John Doe",
    email: "john.doe@example.com",
    createdAt: new Date("2024-01-15T10:30:00Z"),
    deletedAt: null,
  },
  {
    id: 456,
    name: "Jane Smith",
    email: "jane.smith@example.com",
    createdAt: new Date("2024-01-20T14:20:00Z"),
    deletedAt: null,
  }
]

export const MOCK_USER: User = MOCK_USERS[0] // Default to John Doe

// Mock auth service - replace this entire file with real auth implementation
export class MockAuthService {
  private static instance: MockAuthService
  private user: User | null = MOCK_USER
  private isLoading = false

  static getInstance(): MockAuthService {
    if (!MockAuthService.instance) {
      MockAuthService.instance = new MockAuthService()
    }
    return MockAuthService.instance
  }

  async getCurrentUser(): Promise<User | null> {
    // Simulate API call delay
    this.isLoading = true
    await new Promise((resolve) => setTimeout(resolve, 100))
    this.isLoading = false
    return this.user
  }

  async signIn(email: string, password: string): Promise<User> {
    // Mock sign in - always succeeds
    this.isLoading = true
    await new Promise((resolve) => setTimeout(resolve, 500))
    this.isLoading = false
    this.user = MOCK_USER
    return MOCK_USER
  }

  async signOut(): Promise<void> {
    this.isLoading = true
    await new Promise((resolve) => setTimeout(resolve, 200))
    this.isLoading = false
    this.user = null
  }

  isAuthenticated(): boolean {
    return this.user !== null && this.user.deletedAt === null
  }

  getLoadingState(): boolean {
    return this.isLoading
  }
}
