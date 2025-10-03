import { AppGuard } from "@/components/auth/app-guard"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AppGuard requireAuth={true} requireOnboarding={true}>
      {children}
    </AppGuard>
  )
}
