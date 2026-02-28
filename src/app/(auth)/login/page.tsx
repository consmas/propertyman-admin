'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Building2, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { loginSchema, type LoginFormValues } from '@/lib/validations/auth'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { STORAGE_KEYS } from '@/lib/api/client'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, isAuthenticated, isHydrated, isLoading, error, clearError } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const redirect = searchParams.get('redirect') ?? '/app/dashboard'

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  useEffect(() => {
    const hasAuthCookie =
      typeof document !== 'undefined' && document.cookie.split('; ').some((c) => c.startsWith('pm_auth='))
    const hasAccessToken =
      typeof window !== 'undefined' && Boolean(localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN))

    if (isHydrated && isAuthenticated && hasAuthCookie && hasAccessToken) {
      router.replace(redirect)
    }
  }, [isAuthenticated, isHydrated, router, redirect])

  useEffect(() => {
    if (error) {
      toast.error(error)
      clearError()
    }
  }, [error, clearError])

  const onSubmit = async (values: LoginFormValues) => {
    try {
      // login() in store already sets the pm_auth cookie with role
      await login(values.email, values.password)
      router.replace(redirect)
    } catch {
      // Error handled by store + toast
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 shadow-lg mb-4">
            <Building2 className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">PropertyManager</h1>
          <p className="mt-1 text-sm text-gray-500">Admin Dashboard</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-white p-8 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Welcome back</h2>
          <p className="text-sm text-gray-500 mb-6">Sign in to your admin account</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {/* Email */}
            <div className="space-y-1">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...register('email')}
                  className={cn(
                    'h-10 w-full rounded-lg border border-gray-300 bg-white pl-9 pr-3 text-sm shadow-sm transition-colors placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500',
                    errors.email && 'border-red-500 focus:ring-red-500'
                  )}
                  placeholder="admin@example.com"
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  {...register('password')}
                  className={cn(
                    'h-10 w-full rounded-lg border border-gray-300 bg-white pl-9 pr-10 text-sm shadow-sm transition-colors placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500',
                    errors.password && 'border-red-500 focus:ring-red-500'
                  )}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-600">{errors.password.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full h-10 text-sm" loading={isLoading}>
              Sign in
            </Button>
          </form>

          {/* Demo accounts hint */}
          <div className="mt-6 rounded-lg bg-gray-50 p-4 text-xs text-gray-500 space-y-1">
            <p className="font-semibold text-gray-600">Demo accounts</p>
            <p>owner@demo.com / password</p>
            <p>manager@demo.com / password</p>
            <p>accountant@demo.com / password</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-gray-50" />}>
      <LoginForm />
    </Suspense>
  )
}
