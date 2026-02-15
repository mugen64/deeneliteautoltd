import { useState } from 'react'
import { useServerFn } from '@tanstack/react-start'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { loginFn } from '@/server/auth'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const login = useServerFn(loginFn)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const result = await login({
        data: { email, password },
      })

      if (result && 'error' in result) {
        setError(result.error || 'Login failed')
      } else {
        location.href = '/admin' // Redirect to admin dashboard on successful login
      }
      // Success will redirect automatically
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
      console.error('Login failed:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen ">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Admin Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
                {error}
              </div>
            )}
            <div>
              <label htmlFor="email" className="block text-sm font-medium ">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
