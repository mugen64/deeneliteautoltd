// utils/session.ts
import { useSession } from '@tanstack/react-start/server'

type SessionData = {
  userId?: string
  email?: string
  role?: string
}

export function useAppSession(remember?: boolean) {
  return useSession<SessionData>({
    // Session configuration
    name: 'deen-session',
    password: process.env.SESSION_SECRET!, // At least 32 characters
    // Optional: customize cookie settings
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      httpOnly: true,
    },
    maxAge: remember ? 7 * 24 * 60 * 60 : undefined, // 7 days if "remember me" is checked  
  })
}