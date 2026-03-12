'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { apiRequest } from '@/lib/apiRequest'
import { useAuthStore } from '@/stores/authStore'
import { toast } from 'sonner'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

type MobileNavbarProps = {
  handleLogout?: () => void
}

const menuItems = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Search', href: '/search' },
  { name: 'Add Invitation', href: '/add-invitation' },
  { name: 'Add Module', href: '/modules' },
  { name: 'Create User', href: '/users' },
]

export default function AdminNavbar({ handleLogout }: MobileNavbarProps) {

  const logout = useAuthStore((state) => state.logout)

  const pathname = usePathname()
  const router = useRouter()

  const navItems = useMemo(() => menuItems, [])

  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  /* ================= LOGOUT ================= */

  const confirmLogout = async () => {

    setLoading(true)

    try {

      await apiRequest({
        endpoint: '/api/admin/logout',
        method: 'POST',
      })

      /* clear auth */
      logout()

      toast.success('Logged out successfully')

      router.replace('/admin/login')

    } catch (error) {

      console.error('Logout failed')
      toast.error('Logout failed')

    } finally {

      setLoading(false)
      setOpen(false)

    }

  }

  return (
    <div className="sticky top-0 bg-white z-50">

      {/* MENU */}
      <div className="relative flex justify-start md:justify-center gap-3 overflow-x-auto no-scrollbar px-4 py-2">

        {navItems.map((item) => {
          const isActive =
            pathname === `/admin${item.href}` ||
            pathname?.startsWith(`/admin${item.href}/`)

          return (
            <Link
              key={item.name}
              href={`/admin${item.href}`}
              className={cn(
                'flex-shrink-0 whitespace-nowrap px-4 py-2 rounded-md font-semibold transition-colors',
                isActive
                  ? 'text-white bg-orange-600'
                  : 'text-orange-700 hover:bg-orange-100'
              )}
            >
              {item.name}
            </Link>
          )
        })}

        {/* Mobile Logout (keeps original position) */}
        <button
          onClick={() => setOpen(true)}
          className="md:hidden px-4 py-2 text-orange-700 font-semibold rounded-md hover:bg-orange-100 transition-colors"
        >
          Logout
        </button>

        {/* Desktop/Tablet Logout (top right) */}
        <button
          onClick={() => setOpen(true)}
          className="hidden md:block absolute right-4 px-4 py-2 text-orange-700 font-semibold rounded-md hover:bg-orange-100 transition-colors"
        >
          Logout
        </button>

      </div>



      {/* ALERT DIALOG */}

      <AlertDialog open={open} onOpenChange={setOpen}>

        <AlertDialogContent>

          <AlertDialogHeader>

            <AlertDialogTitle>
              Logout Confirmation
            </AlertDialogTitle>

            <AlertDialogDescription>
              Are you sure you want to logout?
            </AlertDialogDescription>

          </AlertDialogHeader>

          <AlertDialogFooter>

            <AlertDialogCancel disabled={loading}>
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={confirmLogout}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {loading ? 'Logging out...' : 'Confirm'}
            </AlertDialogAction>

          </AlertDialogFooter>

        </AlertDialogContent>

      </AlertDialog>

    </div>
  )
}