'use client'

import { useEffect, useRef, useState } from 'react'
import useSWR from 'swr'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { CheckCircle2, XCircle } from 'lucide-react'
import {
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
} from '@/components/ui/select'

import { fetchClient } from '@/lib/fetchClient'
import { apiRequest } from '@/lib/apiRequest'

type Module = {
 _id: string
 moduleName: string
}

type ScanResult = {
 success: boolean
 message: string
 moduleName?: string
 name?: string
 mobile?: string
 note?: string
 regNum?: string
 createdAt?: string
} | null

export default function ZebraGateScanner() {

 const inputRef = useRef<HTMLInputElement | null>(null)

 const [selectedModule, setSelectedModule] = useState<string | null>(null)
 const [scanValue, setScanValue] = useState('')
 const [processing, setProcessing] = useState(false)
 const [result, setResult] = useState<ScanResult>(null)

 // ==========================
 // Fetch Modules
 // ==========================
 const fetchModules = async () => {
  const res = await fetchClient(
   `${process.env.NEXT_PUBLIC_API_URL}/api/modules/active`
  )
  return res.json()
 }

 const { data } = useSWR<{ data: Module[] }>(
  'modules-active',
  fetchModules
 )

 const modules: Module[] = data?.data || []

 // ==========================
 // Keep input focused
 // ==========================
 useEffect(() => {
  inputRef.current?.focus()
 }, [selectedModule, result])

 // ==========================
 // Auto hide result card
 // ==========================
 useEffect(() => {

  if (!result) return

  const timer = setTimeout(() => {
   setResult(null)
  }, 3000)

  return () => clearTimeout(timer)

 }, [result])

 // ==========================
 // Handle Module Change
 // ==========================
 const handleModuleChange = (value: string) => {
  setSelectedModule(value)
  setResult(null)
  setScanValue('')
  inputRef.current?.focus()
 }

 // ==========================
 // Scan Handler
 // ==========================
 const markAttendance = async (regNum: string) => {

  if (!selectedModule) {
   toast.error('Please select module first', { duration: 2000 })
   return
  }

  if (!regNum) return
  if (processing) return

  setProcessing(true)
  setResult(null)

  try {

   const res = await apiRequest({
    endpoint: `/api/scans`,
    method: 'POST',
    body: {
     regNum,
     moduleId: selectedModule
    }
   })

   const data = res?.data || {}

   setResult({
    success: res.success,
    message: res.message,
    moduleName: data?.moduleId?.moduleName,
    name: data?.registerId?.name,
    mobile: data?.registerId?.mobile,
    note: data?.registerId?.note,
    regNum: data?.registerId?.regNum,
    createdAt: data?.createdAt
   })

   setScanValue('')

  } catch (err: any) {

   setResult({
    success: false,
    message: err?.message || 'Scan failed'
   })

   setScanValue('')
  } finally {
   setProcessing(false)
   inputRef.current?.focus()
  }
 }

 // ==========================
 // ENTER key (Zebra scanner)
 // ==========================
 const handleKeyDown = async (
  e: React.KeyboardEvent<HTMLInputElement>,
 ) => {
  if (e.key === 'Enter') {
   const value = scanValue.trim()
   if (!value) return
   await markAttendance(value)
  }
 }

 return (
  <div className="min-h-screen flex flex-col items-center bg-background">

   {/* ---------------- MODULE SELECT ---------------- */}
   <div className="max-w-sm mx-auto p-4">

    <Select
     value={selectedModule ?? ''}
     onValueChange={handleModuleChange}
    >

     <SelectTrigger className="w-[320px]">
      <SelectValue placeholder="Please select module" />
     </SelectTrigger>

     <SelectContent>

      {modules.length === 0 && (
       <SelectItem value="loading" disabled>
        Loading modules...
       </SelectItem>
      )}

      {modules.map((module) => (
       <SelectItem key={module._id} value={module._id}>
        {module.moduleName}
       </SelectItem>
      ))}

     </SelectContent>

    </Select>

   </div>

   {/* ---------------- RESULT CARD ---------------- */}
   {result && (
    <div
     className={`relative mx-auto w-full max-w-md rounded-xl p-4 text-white space-y-3
     ${result.success ? 'bg-green-600' : 'bg-red-600'}
    `}
    >

     {/* Close button */}
     <button
      onClick={() => setResult(null)}
      className="absolute top-2 right-2 text-white text-lg"
     >
      ✕
     </button>

     <div className="flex items-center gap-2">
      {result.success ? <CheckCircle2 /> : <XCircle />}
      <span className="font-bold text-lg">{result.message}</span>
     </div>

     {result.moduleName && (
      <div className="text-sm font-semibold">
       Module: {result.moduleName}
      </div>
     )}

     <div className="rounded-xl bg-white/20 p-4 space-y-2 text-sm">

      <div className="grid grid-cols-3 gap-2">
       <span>Reg No</span>
       <span className="col-span-2 font-semibold">{result.regNum}</span>
      </div>

      <div className="grid grid-cols-3 gap-2">
       <span>Name</span>
       <span className="col-span-2 font-semibold">{result.name}</span>
      </div>

      <div className="grid grid-cols-3 gap-2">
       <span>Mobile</span>
       <span className="col-span-2 font-semibold">{result.mobile}</span>
      </div>

      <div className="grid grid-cols-3 gap-2">
       <span>Note</span>
       <span className="col-span-2 font-semibold">{result.note}</span>
      </div>

      <div className="grid grid-cols-3 gap-2">
       <span>Scanned At</span>
       <span className="col-span-2 font-semibold">
        {result.createdAt
         ? new Date(result.createdAt).toLocaleString()
         : '-'}
       </span>
      </div>

     </div>

    </div>
   )}

   {/* ---------------- INPUT ---------------- */}
   <div className="w-full max-w-xl space-y-4 p-4">

    <input
     ref={inputRef}
     value={scanValue}
     onChange={(e) => setScanValue(e.target.value)}
     onKeyDown={handleKeyDown}
     placeholder="Scanned Value..."
     className="w-full h-20 text-2xl px-6 rounded-2xl border shadow-lg focus:ring-2 focus:ring-primary outline-none"
     autoFocus
    />

    <Button
     onClick={() => markAttendance(scanValue.trim())}
     disabled={processing}
     className="w-full h-14 text-lg bg-sky-800 hover:bg-sky-900"
    >
     {processing ? 'Submitting...' : 'Submit'}
    </Button>

   </div>

  </div>
 )
}