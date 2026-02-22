import bcrypt from 'bcryptjs'

import { createServerFn } from '@tanstack/react-start'
import { redirect } from '@tanstack/react-router'
import { useAppSession } from './session';
import { userStore } from '@/server/storage/db/queries/users';

// User registration
export const registerFn = createServerFn({ method: 'POST' })
    .inputValidator(
        (data: { email: string; password: string; name: string, phone: string }) => data,
    )
    .handler(async ({ data }) => {
        // Check if user exists
        const existingUser = await userStore.getUserByEmail(data.email)
        if (existingUser) {
            return { error: 'User already exists' }
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(data.password, 12)

        // Create user
        const user = await userStore.createUser({
            email: data.email,
            password: hashedPassword,
            name: data.name,
            phone: data.phone,
        })

        // Create session
        const session = await useAppSession()
        await session.update({ userId: user.id })

        return { success: true, user: { id: user.id, email: user.email } }
    })


// Login server function
export const loginFn = createServerFn({ method: 'POST' })
    .inputValidator((data: { email: string; password: string, remember?: boolean }) => data)
    .handler(async ({ data }) => {
        // Verify credentials (replace with your auth logic)
        const user = await authenticateUser(data.email, data.password)

        if (!user) {
            return { error: 'Invalid credentials' }
        }

        // Create session
        const session = await useAppSession()
        await session.update({
            userId: user.id,
            email: user.email,
            
        })

        // Redirect to protected area
        throw redirect({ to: '/admin' })
    })

// Logout server function
export const logoutFn = createServerFn({ method: 'POST' }).handler(async () => {
    const session = await useAppSession()
    await session.clear()
    throw redirect({ to: '/admin' })
})

// Get current user
export const getCurrentUserFn = createServerFn({ method: 'GET' }).handler(
    async () => {
        const session = await useAppSession()
        const userId = session.data.userId

        if (!userId) {
            return null
        }

        const user = await userStore.getUserById(userId)
        if (user) {
            return {
                id: user.id,
                email: user.email,
                name: user.name,
                phone: user.phone,
                role: user.role,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            }
        }
        return null
    },
)

// Get session user (for route guards)
export const getSessionUserFn = createServerFn({ method: 'GET' }).handler(
    async () => {
        const session = await useAppSession()
        const userId = session.data.userId

        if (!userId) {
            return null
        }

        const user = await userStore.getUserById(userId)
        if (!user) {
            return null
        }

        return {
            id: user.id,
            email: user.email,
            name: user.name,
            phone: user.phone,
            role: user.role,
        }
    },
)

// Check if any users exist
export const checkUsersExistFn = createServerFn({ method: 'GET' }).handler(
    async () => {
        const adminEmail = process.env.ADMIN_LOGIN
        if (!adminEmail) {
            return { exists: false, adminEmail: null }
        }
        
        const user = await userStore.getUserByEmail(adminEmail)
        return { exists: !!user, adminEmail }
    },
)

// Verify session (for route protection)
export const verifySessionFn = createServerFn({ method: 'GET' }).handler(
    async () => {
        const session = await useAppSession()
        const userId = session.data.userId

        if (!userId) {
            throw redirect({ to: '/admin' })
        }

        const user = await userStore.getUserById(userId)
        if (!user) {
            throw redirect({ to: '/admin' })
        }

        return {
            id: user.id,
            email: user.email,
            name: user.name,
            phone: user.phone,
            role: user.role,
        }
    },
)




async function authenticateUser(email: string, password: string) {
    const user = await userStore.getUserByEmail(email)
    if (!user) return null

    const isValid = await bcrypt.compare(password, user.password)
    return isValid ? user : null
}


// Simple in-memory rate limiting (use Redis in production)
const loginAttempts = new Map<string, { count: number; resetTime: number }>()

export const rateLimitLogin = (ip: string): boolean => {
    const now = Date.now()
    const attempts = loginAttempts.get(ip)

    if (!attempts || now > attempts.resetTime) {
        loginAttempts.set(ip, { count: 1, resetTime: now + 15 * 60 * 1000 }) // 15 min
        return true
    }

    if (attempts.count >= 5) {
        return false // Too many attempts
    }

    attempts.count++
    return true
}