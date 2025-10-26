'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'

export default function SignupPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters long')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.email,
          email: formData.email,
          password: formData.password,
          full_name: formData.fullName,
          phone_number: formData.phone,
        }),
      })

      if (response.ok) {
        toast.success('Account created successfully!', {
          description: 'Please sign in to continue',
        })

        setTimeout(() => {
          router.push('/login')
        }, 1500)
      } else {
        const error = await response.json()
        toast.error('Signup failed', {
          description: error.detail || 'Unable to create account',
        })
      }
    } catch (error) {
      console.error('Signup error:', error)
      toast.error('Signup failed', {
        description: 'Unable to connect to server',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="flex min-h-screen">
        {/* Left Side - Image/Branding */}
        <div className="hidden lg:block lg:w-1/2">
          <div className="relative flex h-full items-center justify-center bg-black">
            {/* Minimal geometric pattern */}
            <div className="absolute inset-0 opacity-5">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
                  backgroundSize: '40px 40px',
                }}
              />
            </div>

            {/* Content */}
            <div className="relative z-10 px-12 text-center">
              <div className="mb-6 text-8xl">💎</div>
              <h2 className="mb-4 text-3xl font-light text-white">
                Join Our
                <br />
                <span className="font-semibold">Premium Community</span>
              </h2>
              <p className="text-zinc-400">
                Get access to exclusive deals, faster checkout, and order tracking
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="flex w-full items-center justify-center px-6 py-12 lg:w-1/2 lg:px-12">
          <div className="w-full max-w-md">
            {/* Logo */}
            <Link href="/" className="mb-8 inline-flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600">
                <span className="text-xl font-bold text-white">E</span>
              </div>
              <div className="text-2xl font-light text-zinc-900">
                Emen<span className="font-semibold">Tech</span>
              </div>
            </Link>

            {/* Header */}
            <div className="mb-8">
              <h1 className="mb-2 text-3xl font-light text-zinc-900">
                Create <span className="font-semibold">Account</span>
              </h1>
              <p className="text-zinc-600">Join us and start your tech journey</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Full Name */}
              <div>
                <label htmlFor="fullName" className="mb-2 block text-sm font-medium text-zinc-900">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
                  <input
                    id="fullName"
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full border border-zinc-300 bg-white py-3 pl-10 pr-4 text-zinc-900 transition-colors focus:border-zinc-900 focus:outline-none"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-zinc-900">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
                  <input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full border border-zinc-300 bg-white py-3 pl-10 pr-4 text-zinc-900 transition-colors focus:border-zinc-900 focus:outline-none"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="mb-2 block text-sm font-medium text-zinc-900">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
                  <input
                    id="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full border border-zinc-300 bg-white py-3 pl-10 pr-4 text-zinc-900 transition-colors focus:border-zinc-900 focus:outline-none"
                    placeholder="+254 700 000 000"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-medium text-zinc-900">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    className="w-full border border-zinc-300 bg-white py-3 pl-10 pr-12 text-zinc-900 transition-colors focus:border-zinc-900 focus:outline-none"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-medium text-zinc-900"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={formData.confirmPassword}
                    onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full border border-zinc-300 bg-white py-3 pl-10 pr-12 text-zinc-900 transition-colors focus:border-zinc-900 focus:outline-none"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Terms */}
              <label className="flex items-start gap-2">
                <input
                  type="checkbox"
                  required
                  className="mt-1 h-4 w-4 border-zinc-300 text-zinc-900 focus:ring-0 focus:ring-offset-0"
                />
                <span className="text-sm text-zinc-600">
                  I agree to the{' '}
                  <Link href="/terms" className="font-medium text-zinc-900 hover:underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="font-medium text-zinc-900 hover:underline">
                    Privacy Policy
                  </Link>
                </span>
              </label>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center gap-2 border border-amber-600 bg-amber-600 px-6 py-3 font-medium text-white transition-all hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  'Creating Account...'
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>

            {/* Login Link */}
            <p className="mt-6 text-center text-sm text-zinc-600">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-zinc-900 hover:underline">
                Sign in instead
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
