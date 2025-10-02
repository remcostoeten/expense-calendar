"use client"
import { useAuth } from "@/lib/auth/auth-context"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { LogOut, Settings, User } from "lucide-react"

interface UserProfileProps {
  showName?: boolean
  size?: "sm" | "md" | "lg"
}

export function UserProfile({ showName = true, size = "md" }: UserProfileProps) {
  const { user, signOut, isLoading } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push("/auth/signin")
    } catch (error) {
      console.error("Sign out failed:", error)
    }
  }

  if (isLoading || !user) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
        {showName && <div className="h-4 w-20 bg-muted rounded animate-pulse" />}
      </div>
    )
  }

  const avatarSize = size === "sm" ? "h-6 w-6" : size === "lg" ? "h-10 w-10" : "h-8 w-8"
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 h-auto p-2">
          <Avatar className={avatarSize}>
            <AvatarImage src="/placeholder.svg" alt={user.name} />
            <AvatarFallback className="text-xs font-medium">{initials}</AvatarFallback>
          </Avatar>
          {showName && (
            <div className="flex flex-col items-start text-left">
              <span className="text-sm font-medium truncate max-w-32">{user.name}</span>
              <span className="text-xs text-muted-foreground truncate max-w-32">{user.email}</span>
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <User className="mr-2 h-4 w-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
