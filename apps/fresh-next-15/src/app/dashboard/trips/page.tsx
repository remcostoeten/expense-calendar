import { useUser } from '@stackframe/stack'

export const dynamic = 'force-dynamic'

export default function TripsPage() {
  const user = useUser()

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Trips Dashboard</h1>
          <p className="text-muted-foreground">Plan your adventures</p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-lg font-semibold">Upcoming Trips</h3>
          <p className="text-sm text-muted-foreground">Your planned adventures</p>
          <p className="text-sm text-muted-foreground mt-2">No trips planned yet</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-lg font-semibold">Past Trips</h3>
          <p className="text-sm text-muted-foreground">Your travel memories</p>
          <p className="text-sm text-muted-foreground mt-2">No past trips recorded</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-lg font-semibold">Trip Ideas</h3>
          <p className="text-sm text-muted-foreground">Places you want to visit</p>
          <p className="text-sm text-muted-foreground mt-2">Start adding destinations</p>
        </div>
      </div>
    </div>
  )
}
