'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          action: 'login',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Store token and user info
        if (data.data?.access_token) {
          localStorage.setItem('token', data.data.access_token);
          if (data.data.user) {
            localStorage.setItem('user', JSON.stringify(data.data.user));
            if (data.data.user.role) {
              localStorage.setItem('userRole', data.data.user.role);
            }
          }

          // Check for redirect parameter
          const redirectParam = searchParams.get('redirect')
          if (redirectParam) {
            // Redirect to the page user was trying to access
            router.push(decodeURIComponent(redirectParam))
          } else {
            // Redirect based on role
            const redirectPath = data.data.user.role === 'admin' ? '/admin' : '/';
            router.push(redirectPath);
          }
        }
      } else {
        const error = await response.json();
        setFormData({ email: '', password: '' });
        alert(error.error || 'Invalid email or password');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Unable to connect to server. Make sure the backend is running.');
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="flex min-h-screen">
        {/* Left Side - Form */}
        <div className="flex w-full items-center justify-center px-6 py-12 lg:w-1/2 lg:px-12">
          <div className="w-full max-w-md">
            {/* Logo */}
            <Link href="/" className="mb-8 inline-flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600">
                <span className="text-xl font-bold text-white">E</span>
              </div>
              <div className="text-2xl font-light text-zinc-900">
                Baitech <span className="font-medium">Solutions</span>
              </div>
            </Link>

            {/* Header */}
            <div className="mb-8">
              <h1 className="mb-2 text-3xl font-light text-zinc-900">
                Welcome <span className="font-semibold">Back</span>
              </h1>
              <p className="text-zinc-600">Sign in to your account to continue</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
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

              {/* Remember & Forgot */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4 border-zinc-300 text-zinc-900 focus:ring-0 focus:ring-offset-0"
                  />
                  <span className="text-sm text-zinc-600">Remember me</span>
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-zinc-900 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center gap-2 border border-amber-600 bg-amber-600 px-6 py-3 font-medium text-white transition-all hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  'Signing in...'
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>

            {/* Sign Up Link */}
            <p className="mt-6 text-center text-sm text-zinc-600">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="font-medium text-zinc-900 hover:underline">
                Create one now
              </Link>
            </p>
          </div>
        </div>

        {/* Right Side - Image/Branding */}
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
                Premium Technology,
                <br />
                <span className="font-semibold">Expert Service</span>
              </h2>
              <p className="text-zinc-400">
                Access exclusive deals and manage your orders with ease
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
