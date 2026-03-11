
'use client'
import { useRouter } from 'next/navigation'

export default function AdminDashboardPage() {
  const router = useRouter()

  const handleLogout = () => {
    // Example logout logic
    console.log('Logging out...')
    // Clear auth tokens, redirect to login page
    router.push('/login')
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">

      {/* Main Content */}
      <main className="flex-1 p-4 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-6">

          <h1 className="text-3xl font-semibold text-gray-800">
            Admin Dashboard
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Example cards */}
            <div className="p-4 bg-white rounded-lg shadow hover:shadow-lg transition">
              <h2 className="font-semibold text-lg text-gray-700">Total Guest</h2>
              <p className="mt-2 text-gray-500 text-sm">1234</p>
            </div>

            <div className="p-4 bg-white rounded-lg shadow hover:shadow-lg transition">
              <h2 className="font-semibold text-lg text-gray-700">Scanned</h2>
              <p className="mt-2 text-gray-500 text-sm">45</p>
            </div>

            <div className="p-4 bg-white rounded-lg shadow hover:shadow-lg transition">
              <h2 className="font-semibold text-lg text-gray-700">Not Scanned</h2>
              <p className="mt-2 text-gray-500 text-sm">1180</p>
            </div>
          </div>

          {/* More content */}
          <div className="p-4 bg-white rounded-lg shadow hover:shadow-lg transition">
            <h2 className="font-semibold text-lg text-gray-700">Announcements</h2>
            <ul className="mt-2 list-disc list-inside text-gray-500 text-sm">
              <li>System maintenance on 15th March</li>
              <li>New data added</li>
              <li>scan schedule updated</li>
            </ul>
          </div>

        </div>
      </main>
    </div>
  )
}




