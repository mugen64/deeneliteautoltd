import { useState } from 'react'
import { useServerFn } from '@tanstack/react-start'
import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { registerFn } from '@/server/auth'
import { formatUgandanPhone } from '@/lib/phone'

interface RegistrationFormProps {
  adminEmail: string
}

export function RegistrationForm({ adminEmail }: RegistrationFormProps) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const register = useServerFn(registerFn)

  const handlePhoneChange = (value: string) => {
    setPhone(value)
    // Format and validate phone number
    const result = formatUgandanPhone(value)
    if (result.error && value.length > 0) {
      setPhoneError(result.error)
    } else {
      setPhoneError('')
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (phoneError) {
      setError('Please enter a valid phone number')
      return
    }

    if (!phone) {
      setError('Phone number is required')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setIsLoading(true)
    try {
      // Format phone number for storage
      const formattedPhoneResult = formatUgandanPhone(phone)
      const result = await register({
        data: {
          email: adminEmail,
          name,
          phone: formattedPhoneResult.formatted,
          password,
        },
      })

      if ('error' in result) {
        setError(result.error || 'Registration failed')
      } else {
        setSuccess(true)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
      console.error('Registration error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-screen ">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4 text-green-600">Registration Successful!</h2>
            <p className="text-gray-600 mb-4">Your admin account has been created.</p>
            <Link
              to="/admin"
              className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Dashboard
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen ">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Complete Admin Registration</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
                {error}
              </div>
            )}
            <div>
              <label htmlFor="email" className="block text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={adminEmail}
                disabled
                className="mt-1  cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">Email is set to the admin email</p>
            </div>
            <div>
              <label htmlFor="name" className="block text-sm font-medium">
                Full Name
              </label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="mt-1"
                placeholder="Your full name"
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium">
                Phone Number
              </label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                required
                className={`mt-1 ${phoneError ? 'border-red-500' : ''}`}
                placeholder="+256 7xx xxx xxx or 07xx xxx xxx"
              />
              {phoneError && (
                <p className="text-xs text-red-600 mt-1">{phoneError}</p>
              )}
              {phone && !phoneError && (
                <p className="text-xs text-green-600 mt-1">✓ Valid format</p>
              )}
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
                placeholder="Minimum 8 characters"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium">
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="mt-1"
                placeholder="Confirm your password"
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Creating Account...' : 'Create Admin Account'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
