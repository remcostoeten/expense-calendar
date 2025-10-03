import { StackHandler } from '@stackframe/stack'
import { stackServerApp } from '@/app/stack'

export const dynamic = 'force-dynamic'

export default function Handler(props: any) {
    return <StackHandler app={stackServerApp} routeProps={props} />
}
