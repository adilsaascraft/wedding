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
import AddModuleForm from '@/components/forms/AddModuleForm'
import { toast } from 'sonner'
import { fetchClient } from '@/lib/fetchClient'
import { fetcher } from '@/lib/fetcher'
import { getIndianFormattedDate } from '@/lib/formatIndianDate'
import { MoreVertical, Trash2, Pencil, Search } from 'lucide-react'

export default function ModulePage() {

  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingModule, setEditingModule] = useState<any | null>(null)

  const [menuOpen, setMenuOpen] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const [search, setSearch] = useState('')

  const menuRef = useRef<HTMLDivElement | null>(null)

  /* ================= FETCH ================= */

  const { data, isLoading, mutate } = useSWR(
    `${process.env.NEXT_PUBLIC_API_URL}/api/modules`,
    fetcher
  )

  const modules = useMemo(() => data?.data ?? [], [data])

  /* ================= SEARCH ================= */

  const filteredModules = useMemo(() => {
    return modules.filter((m: any) =>
      m.moduleName.toLowerCase().includes(search.toLowerCase())
    )
  }, [modules, search])

  /* ================= CLICK OUTSIDE MENU ================= */

  useEffect(() => {
    const handleClickOutside = (e: any) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  /* ================= DELETE ================= */

  const handleDelete = async () => {

    if (!deleteId) return

    setDeleting(true)

    try {

      await new Promise((r) => setTimeout(r, 1500))

      const res = await fetchClient(
        `${process.env.NEXT_PUBLIC_API_URL}/api/modules/${deleteId}`,
        { method: 'DELETE' }
      )

      const result = await res.json()

      if (!res.ok) throw new Error(result.message)

      toast.success("Module deleted", {
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

  const handleEdit = (module: any) => {
    setEditingModule(module)
    setSheetOpen(true)
  }

  const handleAdd = () => {
    setEditingModule(null)
    setSheetOpen(true)
  }

  const handleSave = async () => {
    setSheetOpen(false)
    setEditingModule(null)
    await mutate()
  }

  /* ================= SHIMMER ================= */

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

  /* ================= STATUS BADGE ================= */

  const StatusBadge = ({ status }: { status: string }) => {

    const active = status === "Active"

    return (
      <span
        className={`px-3 py-1 text-xs rounded-full font-medium ${
          active
            ? "bg-green-100 text-green-800"
            : "bg-red-100 text-red-800"
        }`}
      >
        {status}
      </span>
    )
  }

  /* ================= UI ================= */

  return (
    <div className="bg-background text-foreground p-4">

      {/* HEADER */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

        <h1 className="text-2xl font-bold">
          Modules ({filteredModules.length})
        </h1>

        <div className="flex gap-3">

          <div className="relative w-[220px]">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search modules..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Button
            onClick={handleAdd}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            + Add Module
          </Button>

        </div>

      </div>

      {/* EMPTY STATE */}

      {!isLoading && filteredModules.length === 0 && (
        <div className="text-center py-20 text-muted-foreground text-sm">
          No module found
        </div>
      )}

      {/* GRID */}

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">

        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => (
              <ShimmerCard key={i} />
            ))

          : filteredModules.map((module: any) => (

              <div
                key={module._id}
                className="relative border rounded-xl p-5 shadow-sm hover:shadow-md transition bg-white"
              >

                {/* MENU */}

                <div className="absolute right-3 top-3">

                  <button
                    onClick={() =>
                      setMenuOpen(menuOpen === module._id ? null : module._id)
                    }
                  >
                    <MoreVertical className="w-5 h-5 text-muted-foreground" />
                  </button>

                  {menuOpen === module._id && (

                    <div
                      ref={menuRef}
                      className="absolute right-0 mt-2 w-32 bg-white border rounded-lg shadow-md z-20"
                    >

                      <button
                        onClick={() => {
                          handleEdit(module)
                          setMenuOpen(null)
                        }}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-100"
                      >
                        <Pencil size={16} />
                        Edit
                      </button>

                      <button
                        onClick={() => {
                          setDeleteId(module._id)
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

                {/* MODULE INFO */}

                <h3 className="text-lg font-semibold">
                  {module.moduleName}
                </h3>

                <div className="mt-2">
                  <StatusBadge status={module.status} />
                </div>

                <p className="text-xs text-muted-foreground mt-3">
                  Created: {getIndianFormattedDate(new Date(module.createdAt))}
                </p>

              </div>

          ))}

      </div>

      {/* DELETE DIALOG */}

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null)
        }}
      >

        <AlertDialogContent>

          <AlertDialogHeader>
            <AlertDialogTitle>Delete Module</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>

            <AlertDialogCancel disabled={deleting}>
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
              {editingModule ? "Edit Module" : "Add Module"}
            </h2>
          </div>

          <AddModuleForm
            defaultValues={editingModule || undefined}
            onSave={handleSave}
          />

        </SheetContent>

      </Sheet>

    </div>
  )
}