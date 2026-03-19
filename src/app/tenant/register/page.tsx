'use client'

import { useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Mail, Lock, Eye, EyeOff, User, Phone, Hash, KeyRound } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import { useAuthStore } from '@/store/auth'
import { authEndpoints } from '@/lib/api/endpoints/auth'
import { registerSchema, type RegisterFormValues } from '@/lib/validations/tenant-auth'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { STORAGE_KEYS } from '@/lib/api/client'
import { LogoLockupLight } from '@/components/shared/logo'

function RegisterForm() {
  const router = useRouter()
  const { isAuthenticated, isHydrated } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  })

  useEffect(() => {
    if (isHydrated && isAuthenticated) {
      router.replace('/tenant/dashboard')
    }
  }, [isAuthenticated, isHydrated, router])

  const onSubmit = async (values: RegisterFormValues) => {
    setIsLoading(true)
    try {
      const data = await authEndpoints.register({
        auth: {
          full_name: values.full_name,
          email: values.email,
          password: values.password,
          phone: values.phone,
          national_id: values.national_id || undefined,
          property_code: values.property_code,
        },
      })

      // Sync tokens to localStorage
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.access_token)
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.refresh_token)
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user))

      // Set cookie
      document.cookie = `pm_auth=${encodeURIComponent(
        JSON.stringify({ authenticated: true, role: data.user.role })
      )};path=/;max-age=86400;SameSite=Lax`

      // Update Zustand store
      useAuthStore.setState({
        user: data.user,
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        access_expires_at: data.access_expires_at,
        is_authenticated: true,
        is_loading: false,
      })

      toast.success('Account created successfully!')
      router.replace('/tenant/dashboard')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <LogoLockupLight iconSize={44} subtitle="Tenant Portal" />
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-white p-8 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Create your account</h2>
          <p className="text-sm text-gray-500 mb-6">Register as a tenant to access your portal</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {/* Full Name */}
            <div className="space-y-1">
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
                Full name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  id="full_name"
                  type="text"
                  autoComplete="name"
                  {...register('full_name')}
                  className={cn(
                    'h-10 w-full rounded-lg border border-gray-300 bg-white pl-9 pr-3 text-sm shadow-sm transition-colors placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500',
                    errors.full_name && 'border-red-500 focus:ring-red-500'
                  )}
                  placeholder="John Doe"
                />
              </div>
              {errors.full_name && (
                <p className="text-xs text-red-600">{errors.full_name.message}</p>
              )}
            </div>

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
                    'h-10 w-full rounded-lg border border-gray-300 bg-white pl-9 pr-3 text-sm shadow-sm transition-colors placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500',
                    errors.email && 'border-red-500 focus:ring-red-500'
                  )}
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-1">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  {...register('phone')}
                  className={cn(
                    'h-10 w-full rounded-lg border border-gray-300 bg-white pl-9 pr-3 text-sm shadow-sm transition-colors placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500',
                    errors.phone && 'border-red-500 focus:ring-red-500'
                  )}
                  placeholder="0244000000"
                />
              </div>
              {errors.phone && (
                <p className="text-xs text-red-600">{errors.phone.message}</p>
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
                  autoComplete="new-password"
                  {...register('password')}
                  className={cn(
                    'h-10 w-full rounded-lg border border-gray-300 bg-white pl-9 pr-10 text-sm shadow-sm transition-colors placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500',
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

            {/* National ID (optional) */}
            <div className="space-y-1">
              <label htmlFor="national_id" className="block text-sm font-medium text-gray-700">
                National ID <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  id="national_id"
                  type="text"
                  {...register('national_id')}
                  className="h-10 w-full rounded-lg border border-gray-300 bg-white pl-9 pr-3 text-sm shadow-sm transition-colors placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="GHA-000000000-0"
                />
              </div>
            </div>

            {/* Property Code */}
            <div className="space-y-1">
              <label htmlFor="property_code" className="block text-sm font-medium text-gray-700">
                Property code
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  id="property_code"
                  type="text"
                  {...register('property_code')}
                  className={cn(
                    'h-10 w-full rounded-lg border border-gray-300 bg-white pl-9 pr-3 text-sm shadow-sm transition-colors placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500',
                    errors.property_code && 'border-red-500 focus:ring-red-500'
                  )}
                  placeholder="e.g. PROP-001"
                />
              </div>
              <p className="text-xs text-gray-400">Enter the code provided by your property manager</p>
              {errors.property_code && (
                <p className="text-xs text-red-600">{errors.property_code.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-10 text-sm bg-emerald-600 hover:bg-emerald-700 text-white"
              loading={isLoading}
            >
              Create account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link href="/tenant/login" className="text-emerald-600 hover:text-emerald-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function TenantRegisterPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-gray-50" />}>
      <RegisterForm />
    </Suspense>
  )
}
