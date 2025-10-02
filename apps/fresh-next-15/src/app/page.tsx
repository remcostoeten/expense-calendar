import { redirect } from 'next/navigation'

export default function Page() {
    // Redirect to the main app dashboard
    redirect('/dashboard')
}
