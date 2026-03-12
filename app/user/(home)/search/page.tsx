"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";
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

import { Search } from "lucide-react";

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

 /*================ Generate Qr Code ===========*/

 const handleGenerateSingle = async (
  regNum: string,
  name: string,
  id?: string,
  isReprint?: boolean
 ) => {

  try {

   /* call PATCH API only for first print */

   if (!isReprint && id) {

    await apiRequest({
     endpoint: `/api/registers/${id}/print`,
     method: "PATCH",
    })

    /* update UI instantly */

    setResults((prev) =>
     prev.map((r) =>
      r._id === id ? { ...r, isPrinted: true } : r
     )
    )

   }

  } catch (err) {
   console.error("Print API failed", err)
  }

  const qr = await QRCode.toDataURL(regNum);

  const printWindow = window.open("", "_blank");

  if (!printWindow) return;

  printWindow.document.write(`
    <html>
      <head>
        <title>Badge</title>
        <style>
          body{
            margin:0;
            display:flex;
            justify-content:center;
            align-items:center;
            height:100vh;
            background:white;
            font-family: Arial, sans-serif;
          }

          .badge{
            width:3.5in;
            height:5.5in;
            border:1px solid #ddd;
            display:flex;
            flex-direction:column;
          }

          .banner{
            height:50%;
            background-image:url('/badge-banner.png');
            background-size:cover;
            background-position:center;
          }

          .name{
            text-align:center;
            font-size:20px;
            font-weight:bold;
            padding:20px 10px;
          }

          .qr{
            flex:1;
            display:flex;
            justify-content:center;
            align-items:center;
          }

          .qr img{
            width:160px;
            height:160px;
          }
        </style>
      </head>

      <body>

        <div class="badge">

          <div class="banner"></div>

          <div class="name">
            ${name}
          </div>

          <div class="qr">
            <img src="${qr}" />
          </div>

        </div>

        <script>
          window.onload = function(){
            window.print();
            window.close();
          }
        </script>

      </body>
    </html>
  `);

  printWindow.document.close();

 };

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

  <div className="min-h-screen flex flex-col bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 p-4">

   <div className="max-w-4xl mx-auto pt-16 flex-1 w-full">

    {/* HEADER */}

    <div className="text-center mb-10">

     <h1 className="text-3xl font-bold text-[#504943] mb-4 font-cinzel">
      Badge Printing
     </h1>

     <p className="text-xl text-gray-600 font-cinzel">
      Print Guest Badges
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

             <div className="flex flex-col gap-2">

              <Button
               disabled={item.isPrinted}
               onClick={() =>
                handleGenerateSingle(
                 item.regNum,
                 item.name,
                 item._id,
                 false
                )
               }
               className="bg-gradient-to-r from-amber-600 to-red-600 h-12 px-6"
              >
               {item.isPrinted ? "Printed" : "Print Badge"}
              </Button>

              {item.isPrinted && (
               <Button
                variant="outline"
                onClick={() =>
                 handleGenerateSingle(
                  item.regNum,
                  item.name,
                  item._id,
                  true
                 )
                }
               >
                Re-Print
               </Button>
              )}

             </div>

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