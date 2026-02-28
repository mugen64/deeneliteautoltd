// contexts/auth.tsx
import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { useServerFn } from '@tanstack/react-start'
import { getCurrentUserFn } from '@/server/auth'
import { useQuery } from '@tanstack/react-query'


type User = {
  id: string
  email: string
  name : string
  phone : string
  role: string
}

type AuthContextType = {
  user: User | null | undefined
  isLoading: boolean
  refetch: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const getCurrentUser = useServerFn(getCurrentUserFn)
  
  const { data: user, isLoading, refetch } = useQuery<User | null>({
    queryKey: ['currentUser'],
    queryFn: () => getCurrentUser(),
    staleTime: Infinity, // User data doesn't change often
  })

  const contextValue = useMemo(
    () => ({ user, isLoading, refetch }),
    [user, isLoading, refetch],
  )

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}