'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { User, Shield } from 'lucide-react'

export default function Home() {
  const router = useRouter()

  return (
  <div className="relative min-h-screen flex flex-col
  bg-gradient-to-br from-orange-50 via-orange-100 to-orange-200">

    {/* Decorative Background Blobs */}
    <div className="absolute -top-40 -left-40 w-96 h-96 bg-orange-300 opacity-30 rounded-full blur-3xl"></div>
    <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-400 opacity-30 rounded-full blur-3xl"></div>

    {/* Main Content */}
    <div className="relative z-10 flex-1 w-full max-w-5xl mx-auto px-6 py-16">

      {/* Hero Section */}
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-bold text-orange-900 mb-4">
          QR Scanning, Badge Printing & Invitation Management Software
        </h1>

        <p className="max-w-2xl mx-auto text-gray-700 text-lg">
          A modern platform for QR scanning, badge printing, and invitation management,
          designed to streamline event operations. Easily generate and send invitations,
          print attendee badges instantly, and manage check-ins with fast QR code scanning
          — giving organizers full control over registrations, access, and on-site event administration.
        </p>
      </div>

      {/* Login Card */}
      <div className="flex justify-center">
        <Card className="w-full max-w-md bg-white/80 backdrop-blur-xl border border-white/40 shadow-2xl rounded-2xl">

          <CardHeader>
            <CardTitle className="text-center text-black text-xl font-semibold">
              Select Access Mode
            </CardTitle>
          </CardHeader>

          <CardContent className="flex flex-col gap-4">

            <Button
              className="w-full bg-orange-600 hover:bg-orange-700 text-white text-lg font-semibold flex items-center justify-center gap-2 h-14"
              onClick={() => router.push('/user/login')}
            >
              <User size={24} />
              User Login
            </Button>

            <Button
              className="w-full bg-green-600 hover:bg-green-700 text-white text-lg font-semibold flex items-center justify-center gap-2 h-14"
              onClick={() => router.push('/admin/login')}
            >
              <Shield size={24} />
              Admin Login
            </Button>

          </CardContent>

        </Card>
      </div>
    </div>

    {/* Footer */}
    <footer className="w-full border-t bg-white/60 backdrop-blur mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-4 text-center text-sm text-gray-600">
        © {new Date().getFullYear()} All Rights Reserved. Powered by
        <span className="font-semibold text-orange-700">
          {" "}SaaScraft Studio (India) Pvt. Ltd.
        </span>
      </div>
    </footer>

  </div>
)
}


