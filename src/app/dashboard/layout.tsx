import { Guard } from "@/components/auth/guard"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Guard requireAuth={true} requireOnboarding={true}>
      {children}
    </Guard>
  )
}
