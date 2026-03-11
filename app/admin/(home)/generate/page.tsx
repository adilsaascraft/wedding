"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useVirtualizer } from "@tanstack/react-virtual"

import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

import { Search } from "lucide-react"
import { apiRequest } from "@/lib/apiRequest"

export default function HomePage() {

  const router = useRouter()

  const [search, setSearch] = useState("")
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [active, setActive] = useState(-1)

  const parentRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef("")

  const showDropdown = search.trim().length >= 3

  /* ================= SEARCH TYPE ================= */

  const getPayload = (value: string) => {

    if (/^\d+$/.test(value)) return { mobile: value }

    if (/^[A-Za-z0-9]+$/.test(value) && value.length >= 6)
      return { regNum: value.toUpperCase() }

    return { name: value }

  }

  /* ================= HIGHLIGHT ================= */

  const highlight = (text: string) => {

    if (!search) return text

    const regex = new RegExp(`(${search})`, "gi")

    return text.split(regex).map((part, i) =>
      regex.test(part)
        ? <span key={i} className="bg-yellow-200 font-semibold">{part}</span>
        : part
    )

  }

  /* ================= DEBOUNCED SEARCH ================= */

  useEffect(() => {

    const value = search.trim()

    if (value.length < 3) {
      setResults([])
      setActive(-1)
      return
    }

    searchRef.current = value

    const timer = setTimeout(async () => {

      try {

        setLoading(true)
        setError("")

        const res = await apiRequest({
          endpoint: "/api/registers/search",
          method: "POST",
          body: getPayload(value)
        })

        /* ignore stale responses */
        if (searchRef.current !== value) return

        setResults(res?.data || [])
        setActive(-1)

      } catch (err: any) {

        setError(err.message || "Search failed")

      } finally {

        setLoading(false)

      }

    }, 300)

    return () => clearTimeout(timer)

  }, [search])

  /* ================= KEYBOARD NAVIGATION ================= */

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {

    if (!results.length) return

    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActive(v => Math.min(v + 1, results.length - 1))
    }

    if (e.key === "ArrowUp") {
      e.preventDefault()
      setActive(v => Math.max(v - 1, 0))
    }

    if (e.key === "Enter" && active >= 0) {

      const r = results[active]

      router.push(`/admin/generate?code=${r.regNum}&name=${encodeURIComponent(r.name)}`)

    }

    if (e.key === "Escape") {
      setResults([])
      setSearch("")
    }

  }

  /* ================= VIRTUAL LIST ================= */

  const rowVirtualizer = useVirtualizer({
    count: results.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 70
  })

  const items = rowVirtualizer.getVirtualItems()

  /* ================= UI ================= */

  return (

    <div className="min-h-screen flex flex-col bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 p-4">

      <div className="max-w-4xl mx-auto pt-16 flex-1 w-full">

        {/* SEARCH INPUT */}

        <div className="relative">

          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search name / mobile / reg number"
            className="pl-12 h-14 text-lg border-2 border-amber-200 focus:border-amber-400"
          />

          <Search className="absolute left-4 top-4 h-6 w-6 text-amber-400" />

        </div>

        {/* HELP TEXT */}

        {search.length > 0 && search.length < 3 && (
          <p className="text-sm text-gray-500 mt-3">
            Type at least 3 characters to search
          </p>
        )}

        {/* BLUR OVERLAY */}

        {showDropdown && (
          <div
            className="fixed inset-0 backdrop-blur-sm bg-black/10 z-10"
            onClick={() => setSearch("")}
          />
        )}

        {/* DROPDOWN RESULTS */}

        {showDropdown && (

          <Card className="absolute mt-2 w-full z-20 shadow-xl">

            <div ref={parentRef} className="max-h-[400px] overflow-auto">

              <div
                style={{
                  height: `${rowVirtualizer.getTotalSize()}px`,
                  position: "relative"
                }}
              >

                {items.map(vRow => {

                  const item = results[vRow.index]
                  const isActive = vRow.index === active

                  return (

                    <div
                      key={item._id || vRow.index}
                      className={`absolute w-full px-4 py-3 cursor-pointer border-b
                      ${isActive ? "bg-orange-100" : "hover:bg-orange-50"}`}
                      style={{
                        transform: `translateY(${vRow.start}px)`
                      }}
                      onMouseEnter={() => setActive(vRow.index)}
                      onClick={() =>
                        router.push(`/admin/generate?code=${item.regNum}&name=${encodeURIComponent(item.name)}`)
                      }
                    >

                      <div className="font-semibold text-[#504943]">
                        {highlight(item.name)}
                      </div>

                      <div className="text-sm text-gray-500">
                        Mobile: {highlight(item.mobile)}
                      </div>

                      <div className="text-xs text-gray-400">
                        Reg#: {highlight(item.regNum)}
                      </div>

                    </div>

                  )

                })}

                {loading && (
                  <div className="p-4 text-center text-gray-500">
                    Searching...
                  </div>
                )}

                {!loading && results.length === 0 && (
                  <div className="p-4 text-center text-gray-500">
                    No records found
                  </div>
                )}

              </div>

            </div>

          </Card>

        )}

        {/* ERROR */}

        {error && (
          <Alert className="mt-4" variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

      </div>

      {/* FOOTER */}

      <footer className="mt-auto border-t bg-white/60 backdrop-blur">

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