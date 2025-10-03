import { AppGuard } from "@/components/auth/app-guard"
import { DualSidebarLayout } from "@/components/sidebar/dual-sidebar-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const dynamic = 'force-dynamic'

export default function TripsPage() {
  return (
    <AppGuard requireAuth={true} requireOnboarding={true}>
      <DualSidebarLayout>
        <div className="flex flex-1 flex-col gap-4 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Trips Dashboard</h1>
              <p className="text-muted-foreground">Plan your adventures</p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Trips</CardTitle>
                <CardDescription>Your planned adventures</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">No trips planned yet</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Past Trips</CardTitle>
                <CardDescription>Your travel memories</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">No past trips recorded</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Trip Ideas</CardTitle>
                <CardDescription>Places you want to visit</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Start adding destinations</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </DualSidebarLayout>
    </AppGuard>
  )
}
