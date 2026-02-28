import { createFileRoute } from '@tanstack/react-router'
import { getSessionUserFn } from '@/server/auth'

export const Route = createFileRoute('/admin/')({
  loader: async ({context}) => {
    if ('user' in context) {
      return { user: context.user }
    }
    return {
      user: await getSessionUserFn()
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  
  return <>
    
    
  </>
}
