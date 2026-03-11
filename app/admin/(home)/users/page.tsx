'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import useSWR from 'swr'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
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
import AddUserForm from '@/components/forms/AddUserForm'
import { toast } from 'sonner'
import { fetchClient } from '@/lib/fetchClient'
import { fetcher } from '@/lib/fetcher'
import { getIndianFormattedDate } from '@/lib/formatIndianDate'
import { MoreVertical, Trash2, Pencil, Search } from 'lucide-react'

export default function UsersPage() {

  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<any | null>(null)

  const [menuOpen, setMenuOpen] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const [search, setSearch] = useState('')

  const menuRef = useRef<HTMLDivElement | null>(null)

  /* ================= FETCH ================= */

  const { data, isLoading, mutate } = useSWR(
    `${process.env.NEXT_PUBLIC_API_URL}/api/users`,
    fetcher
  )

  const users = useMemo(() => data?.data ?? [], [data])

  /* ================= SEARCH ================= */

  const filteredUsers = useMemo(() => {
    return users.filter((u: any) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    )
  }, [users, search])

  /* ================= CLICK OUTSIDE MENU ================= */

  useEffect(() => {
    const handleClickOutside = (e: any) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  /* ================= DELETE ================= */

  const handleDelete = async () => {

    if (!deleteId) return

    setDeleting(true)

    try {

      await new Promise((r) => setTimeout(r, 1500))

      const res = await fetchClient(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/${deleteId}`,
        { method: 'DELETE' }
      )

      const result = await res.json()

      if (!res.ok) throw new Error(result.message)

      toast.success("User deleted", {
        description: getIndianFormattedDate(),
      })

      mutate()
      setDeleteId(null)

    } catch (err: any) {

      toast.error(err.message || "Delete failed")

    } finally {
      setDeleting(false)
    }
  }

  /* ================= EDIT ================= */

  const handleEdit = (user: any) => {
    setEditingUser(user)
    setSheetOpen(true)
  }

  const handleAdd = () => {
    setEditingUser(null)
    setSheetOpen(true)
  }

  const handleSave = async () => {
    setSheetOpen(false)
    setEditingUser(null)
    await mutate()
  }

  /* ================= SHIMMER CARD ================= */

  const ShimmerCard = () => (
    <div className="relative border rounded-xl p-5 bg-white shadow-sm overflow-hidden">
      <div className="animate-pulse space-y-3">
        <div className="h-5 w-32 bg-gray-200 rounded"></div>
        <div className="h-4 w-40 bg-gray-200 rounded"></div>
        <div className="h-3 w-24 bg-gray-200 rounded"></div>
      </div>
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent animate-[shimmer_1.5s_infinite]" />
    </div>
  )

  /* ================= UI ================= */

  return (
    <div className="bg-background text-foreground p-4">

      {/* HEADER */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

        <h1 className="text-2xl font-bold">
          All Users ({filteredUsers.length})
        </h1>

        <div className="flex gap-3">

          <div className="relative w-[220px]">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Button
            onClick={handleAdd}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            + Create User
          </Button>

        </div>

      </div>

      {/* GRID */}

      {!isLoading && filteredUsers.length === 0 ? (

        <div className="text-center py-20 text-muted-foreground text-sm">
          No user found
        </div>

      ) : (

        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">

          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <ShimmerCard key={i} />
              ))

            : filteredUsers.map((user: any) => (

                <div
                  key={user._id}
                  className="relative border rounded-xl p-5 shadow-sm hover:shadow-md transition bg-white"
                >

                  {/* MENU */}

                  <div className="absolute right-3 top-3" ref={menuRef}>

                    <button
                      onClick={() =>
                        setMenuOpen(menuOpen === user._id ? null : user._id)
                      }
                    >
                      <MoreVertical className="w-5 h-5 text-muted-foreground" />
                    </button>

                    {menuOpen === user._id && (

                      <div className="absolute right-0 mt-2 w-32 bg-white border rounded-lg shadow-md z-20">

                        <button
                          onClick={() => {
                            handleEdit(user)
                            setMenuOpen(null)
                          }}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-100"
                        >
                          <Pencil size={16} />
                          Edit
                        </button>

                        <button
                          onClick={() => {
                            setDeleteId(user._id)
                            setMenuOpen(null)
                          }}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>

                      </div>

                    )}

                  </div>

                  {/* USER INFO */}

                  <h3 className="text-lg font-semibold">
                    {user.name}
                  </h3>

                  <p className="text-sm text-muted-foreground mt-1">
                    {user.email}
                  </p>

                  <p className="text-xs text-muted-foreground mt-3">
                    Created: {getIndianFormattedDate(new Date(user.createdAt))}
                  </p>

                </div>

            ))}

        </div>

      )}

      {/* DELETE DIALOG */}

      <AlertDialog open={!!deleteId}>

        <AlertDialogContent>

          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>

            <AlertDialogCancel
              disabled={deleting}
              onClick={() => setDeleteId(null)}
            >
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleting ? "Deleting..." : "Confirm"}
            </AlertDialogAction>

          </AlertDialogFooter>

        </AlertDialogContent>

      </AlertDialog>

      {/* SHEET */}

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>

        <SheetContent side="right" className="w-[500px] sm:w-[600px]">

          <div className="p-4 border-b">
            <h2 className="text-xl font-semibold">
              {editingUser ? "Edit User" : "Add User"}
            </h2>
          </div>

          <AddUserForm
            defaultValues={editingUser || undefined}
            onSave={handleSave}
          />

        </SheetContent>

      </Sheet>

    </div>
  )
}