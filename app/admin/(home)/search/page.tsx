"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Alert, AlertDescription } from "@/components/ui/alert";

import { Search, Users, User } from "lucide-react";

import { apiRequest } from "@/lib/apiRequest";

export default function HomePage() {

  const router = useRouter()

  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [results, setResults] = useState<any[]>([])
  const [searched, setSearched] = useState(false)

  const [activeIndex, setActiveIndex] = useState(-1)

  const debounceRef = useRef<any>(null)

  /* ================= SEARCH TYPE ================= */

  const getPayload = (value: string) => {

    if (/^\d+$/.test(value)) return { mobile: value }

    if (/^[A-Za-z0-9]+$/.test(value) && value.length >= 6)
      return { regNum: value.toUpperCase() }

    return { name: value }

  }

  /* ================= HIGHLIGHT ================= */

  const highlight = (text: string) => {

    if (!searchTerm) return text

    const regex = new RegExp(`(${searchTerm})`, "gi")

    const parts = text.split(regex)

    return parts.map((part, i) =>
      regex.test(part) ?
        <span key={i} className="bg-yellow-200 font-semibold">{part}</span>
        :
        part
    )

  }

  /* ================= DEBOUNCE SEARCH ================= */

 useEffect(() => {

  const value = searchTerm.trim()

  /* Stop search if less than 3 characters */
  if (value.length < 3) {
    clearTimeout(debounceRef.current)
    setResults([])
    setSearched(false)
    setActiveIndex(-1)
    setLoading(false)
    return
  }

  clearTimeout(debounceRef.current)

  debounceRef.current = setTimeout(async () => {

    setLoading(true)
    setError("")

    try {

      const payload = getPayload(value)

      const res = await apiRequest({
        endpoint: "/api/registers/search",
        method: "POST",
        body: payload
      })

      setResults(res?.data || [])
      setSearched(true)
      setActiveIndex(-1)

    } catch (err: any) {

      setError(err.message || "Search failed")

    } finally {

      setLoading(false)

    }

  }, 500)

}, [searchTerm])

  /* ================= KEYBOARD NAV ================= */

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {

    if (!results.length) return

    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActiveIndex((prev) => Math.min(prev + 1, results.length - 1))
    }

    if (e.key === "ArrowUp") {
      e.preventDefault()
      setActiveIndex((prev) => Math.max(prev - 1, 0))
    }

    if (e.key === "Enter" && activeIndex >= 0) {
      const item = results[activeIndex]
      router.push(`/admin/generate?code=${item.regNum}&name=${encodeURIComponent(item.name)}`)
    }

  }

  /* ================= GENERATE ================= */

  const handleGenerateSingle = (regNum: string, name: string) => {

    router.push(`/admin/generate?code=${regNum}&name=${encodeURIComponent(name)}`)

  }

  const handleGenerateMultiple = () => {

    if (results.length > 0) {

      const codes = results.map(r => r.regNum).join(",")
      const names = results.map(r => r.name).join("|")
      const mobiles = results.map(r => r.mobile).join(",")

      router.push(`/admin/generate-multiple?codes=${codes}&names=${encodeURIComponent(names)}&mobiles=${mobiles}`)

    }

  }

  const isMobileSearch = /^\d{10}$/.test(searchTerm)

  /* ================= SKELETON ================= */

  const SkeletonCard = () => (
    <div className="p-6 border rounded-lg animate-pulse bg-white">
      <div className="h-4 w-40 bg-gray-200 mb-2 rounded" />
      <div className="h-3 w-32 bg-gray-200 mb-2 rounded" />
      <div className="h-3 w-20 bg-gray-200 rounded" />
    </div>
  )

  /* ================= UI ================= */

  return (

    <div className="min-h-screen flex flex-col p-4">

      <div className="max-w-4xl mx-auto pt-16 flex-1 w-full">

        {/* HEADER */}

        <div className="text-center mb-10">

          <h1 className="text-5xl font-bold text-[#504943] mb-4 font-cinzel">
            Wedding Invitation
          </h1>

          <p className="text-xl text-gray-600 font-cinzel">
            Generate your personalized flyer
          </p>

        </div>

        {/* SEARCH CARD */}

        <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur">

          <CardHeader>

            <CardTitle className="text-2xl text-center text-[#504943] font-cinzel">
              Search by Name or Mobile Number
            </CardTitle>

            <CardDescription className="text-center text-gray-600">
              Enter name, mobile or registration number
            </CardDescription>

          </CardHeader>

          <CardContent>

            <div className="relative mb-6">

              <Input
                type="text"
                placeholder="e.g., Asif / 9876543210 / AB12CD34"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-12 h-14 text-lg border-2 border-amber-200 focus:border-amber-400"
              />

              <Search className="absolute left-4 top-4 h-6 w-6 text-amber-400" />

            </div>

            {searchTerm.length > 0 && searchTerm.length < 3 && (
              <p className="text-sm text-gray-500 mt-3">
                Type at least 3 characters to search
              </p>
            )}

            {/* ERROR */}

            {error && (

              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>

            )}

            {/* SKELETON */}

            {loading && (

              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>

            )}

            {/* RESULTS */}

            {searched && results.length > 0 && !loading && (

              <div className="mt-6">

                {isMobileSearch && results.length > 1 && (

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">

                    <div className="flex items-center justify-between">

                      <div>

                        <h3 className="font-semibold text-[#504943] flex items-center">
                          <Users className="h-5 w-5 mr-2 text-amber-600" />
                          Found {results.length} people
                        </h3>

                      </div>

                      <Button
                        onClick={handleGenerateMultiple}
                        className="bg-gradient-to-r from-amber-600 to-red-600"
                      >

                        <Users className="mr-2 h-4 w-4" />
                        Generate All ({results.length})

                      </Button>

                    </div>

                  </div>

                )}

                <div className="space-y-3">

                  {results.map((item, index) => {

                    const active = index === activeIndex

                    return (

                      <Card
                        key={index}
                        className={`p-6 transition-shadow cursor-pointer
${active ? "ring-2 ring-orange-500" : "hover:shadow-lg"}`}
                      >

                        <div className="flex justify-between items-center">

                          <div>

                            <h4 className="font-semibold text-[#504943] font-cinzel text-xl">
                              {highlight(item.name)}
                            </h4>

                            <p className="text-sm text-gray-500">
                              Mobile: {highlight(item.mobile)}
                            </p>

                            <p className="text-xs text-gray-400">
                              Reg#: {highlight(item.regNum)}
                            </p>

                          </div>

                          <Button
                            onClick={() => handleGenerateSingle(item.regNum, item.name)}
                            className="bg-gradient-to-r from-amber-600 to-red-600 h-12 px-6"
                          >

                            Generate Flyer

                          </Button>

                        </div>

                      </Card>

                    )

                  })}

                </div>

              </div>

            )}

            {searched && results.length === 0 && !loading && (

              <div className="text-center py-8 text-gray-500">
                No records found for "{searchTerm}"
              </div>

            )}

          </CardContent>

        </Card>

      </div>

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