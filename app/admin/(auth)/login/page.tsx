'use client'
import { apiRequest } from '@/lib/apiRequest'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState, useEffect } from 'react'
import { loginSchema, LoginFormData } from '@/validations/loginSchema'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthStore } from '@/stores/authStore'
import { Eye, EyeOff, Loader2, AlertTriangle, ArrowLeft } from 'lucide-react'

interface LoginResponse {
  accessToken: string
  refreshToken: string
  admin: {
    id: string
    name: string
    email: string
  }
}

export default function LoginPage() {

  const router = useRouter()

  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [capsLock, setCapsLock] = useState(false)

  const setAuth = useAuthStore((state) => state.setAuth)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setFocus,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const emailRegister = register('email')

  /* ---------------- Auto Focus ---------------- */
  useEffect(() => {
    setFocus('email')
  }, [setFocus])

  /* ---------------- Login ---------------- */

  const onSubmit = async (data: LoginFormData) => {

    setError('')
    setIsLoading(true)

    try {

      await apiRequest<
        { email: string; password: string },
        LoginResponse
      >({
        endpoint: '/api/admin/login',
        method: 'POST',
        body: data,

        onSuccess: (json) => {

          setAuth(
            {
              id: json.admin.id,
              name: json.admin.name,
              email: json.admin.email,
              role: 'admin'
            },
            json.accessToken
          )

          router.replace('/admin/dashboard')

        },
      })

    } catch (err: any) {

      setError(err.message || 'Login failed')

    } finally {

      setIsLoading(false)

    }
  }

  /* ---------------- Caps Lock Detect ---------------- */

  const checkCaps = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const caps = e.getModifierState('CapsLock')
    setCapsLock(caps)
  }

  return (
    <div
      className="
      relative min-h-screen flex items-center justify-center overflow-hidden
      bg-gradient-to-br from-orange-100 via-orange-200 to-amber-200
      animate-[gradientMove_12s_ease_infinite]
      bg-[length:400%_400%]
    "
    >

      <Button
        variant="ghost"
        onClick={() => router.push('/')}
        className="absolute top-6 left-6 flex items-center gap-2 text-gray-800 px-4 py-2 rounded-md shadow-md backdrop-blur z-20"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Button>

      {/* Background blobs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-orange-400 opacity-30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-400 opacity-30 rounded-full blur-3xl"></div>

      <div className="relative z-10 w-full max-w-5xl px-6">

        <Card className="overflow-hidden p-0 bg-white/80 backdrop-blur-xl border border-white/40 shadow-2xl rounded-2xl">

          <CardContent className="grid p-0 md:grid-cols-2">

            {/* LOGIN FORM */}

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="p-6 md:p-8"
            >

              <div className="flex flex-col gap-6">

                <div className="text-center">
                  <h1 className="text-2xl font-bold text-gray-900">
                    Admin Login
                  </h1>
                  <p className="text-muted-foreground">
                    Secure access to your dashboard
                  </p>
                </div>

                {/* Email */}

                <div className="grid gap-3">
                  <Label>Email</Label>

                  <Input
                    type="email"
                    placeholder="Enter your email"
                    className="bg-gray-100"
                    {...emailRegister}
                  />

                  {errors.email && (
                    <p className="text-red-500 text-sm">
                      {errors.email.message}
                    </p>
                  )}

                </div>

                {/* Password */}

                <div className="grid gap-3 relative">

                  <div className="flex items-center">
                    <Label>Password</Label>

                    <a
                      href="/forgot-password"
                      className="ml-auto text-sm hover:underline"
                    >
                      Forgot password?
                    </a>

                  </div>

                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    className="bg-gray-100 pr-10"
                    {...register('password')}
                    onKeyUp={checkCaps}
                  />

                  {/* Toggle */}

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="
                    absolute right-3 top-[38px]
                    text-gray-500
                    transition-transform duration-200
                    hover:scale-110
                    "
                  >
                    {showPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>

                  {errors.password && (
                    <p className="text-red-500 text-sm">
                      {errors.password.message}
                    </p>
                  )}

                  {capsLock && (
                    <div className="flex items-center gap-2 text-amber-600 text-sm">
                      <AlertTriangle size={16} />
                      Caps Lock is ON
                    </div>
                  )}

                </div>

                {error && (
                  <p className="text-red-500 text-sm">{error}</p>
                )}

                {/* Login Button */}

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="
                  w-full
                  bg-orange-600 hover:bg-orange-700
                  text-white font-semibold
                  flex items-center justify-center gap-2 h-10
                  shadow-md hover:shadow-lg
                  transition
                "
                >

                  {isLoading && (
                    <Loader2 className="animate-spin" size={18} />
                  )}

                  {isLoading ? 'Authenticating...' : 'Login'}

                </Button>

              </div>

            </form>

            {/* IMAGE PANEL */}

            <div className="relative hidden md:block">

              <Image
                src="/abc.png"
                alt="image"
                fill
                className="object-cover"
                priority
              />

              <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white p-10 text-center">

                <h2 className="text-3xl font-bold mb-3">
                  Add Invitation & Generate Flyer
                </h2>

                <p className="text-sm opacity-90 max-w-xs">
                  Create event invitations and generate eye-catching flyers
                  instantly. Customize designs, add event details, and share
                  them effortlessly for conferences, exhibitions, and
                  corporate events.
                </p>

              </div>

            </div>

          </CardContent>

        </Card>

      </div>

      {/* Footer */}

      <footer className="absolute bottom-0 w-full border-t bg-white/60 backdrop-blur">

        <div className="mx-auto max-w-7xl px-4 py-4 text-center text-sm text-gray-600">

          © 2022 - {new Date().getFullYear()} All Rights Reserved. Powered by
          <span className="font-semibold text-orange-700">
            {" "}SaaScraft Studio (India) Pvt. Ltd.
          </span>

        </div>

      </footer>

    </div>
  )
}