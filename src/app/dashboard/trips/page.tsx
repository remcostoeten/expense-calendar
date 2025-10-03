import { DualSidebarLayout } from "@/components/sidebar"
import { AuthGuard } from "@/components/auth/auth-guard"
import { TripsDashboard } from "./trips-dashboard"

export const dynamic = 'force-dynamic'

export default function TripsPage() {
  return (
    <AuthGuard>
      <DualSidebarLayout>
        <div className="flex flex-1 flex-col gap-4 p-6">
          <TripsDashboard />
        </div>
      </DualSidebarLayout>
    </AuthGuard>
  )
}
