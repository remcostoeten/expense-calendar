import { stackMiddleware } from '@stackframe/stack'
import { stackServerApp } from './src/app/stack'

export default stackMiddleware(stackServerApp)

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
