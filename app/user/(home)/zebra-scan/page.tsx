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

type ScanResult =
 | {
     type: 'success'
     message: string
     name: string
     mobile: string
     note: string
     regNum: string
   }
 | {
     type: 'error'
     message: string
   }
 | null

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
 // Always keep input focused
 // ==========================
 useEffect(() => {
  inputRef.current?.focus()
 }, [selectedModule, result])

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

   setResult({
    type: 'success',
    message: res.message || 'Success',
    name: res.data?.name || '-',
    mobile: res.data?.mobile || '-',
    note: res.data?.note || '-',
    regNum: res.data?.regNum || regNum,
   })

   setScanValue('')

  } catch (err: any) {

   setResult({
    type: 'error',
    message: err?.message || 'Scan failed',
   })

   setScanValue('')
  } finally {
   setProcessing(false)
   inputRef.current?.focus()
  }
 }

 // ==========================
 // ENTER key for Zebra scanner
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

     <SelectTrigger className="w-[340px] p-3">
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

   {/* ---------------- RESULT PANEL ---------------- */}
   {result && (
    <div
     className={`mx-auto w-full max-w-md rounded-xl p-4 text-white space-y-2 transition-all
     ${result.type === 'success' ? 'bg-green-600' : 'bg-red-600'}
    `}
    >
     <div className="flex items-center gap-2">
      {result.type === 'success' ? <CheckCircle2 /> : <XCircle />}
      <span className="font-bold text-base">{result.message}</span>
     </div>

     {result.type === 'success' && (
      <div className="mt-4 rounded-xl bg-white/20 p-4 space-y-3 text-sm">

       <div className="grid grid-cols-3 gap-2">
        <span className="font-medium opacity-80">Reg No</span>
        <span className="col-span-2 font-semibold">{result.regNum}</span>
       </div>

       <div className="grid grid-cols-3 gap-2">
        <span className="font-medium opacity-80">Name</span>
        <span className="col-span-2 font-semibold">{result.name}</span>
       </div>

       <div className="grid grid-cols-3 gap-2">
        <span className="font-medium opacity-80">Mobile</span>
        <span className="col-span-2 font-semibold">{result.mobile}</span>
       </div>

       <div className="grid grid-cols-3 gap-2">
        <span className="font-medium opacity-80">Note</span>
        <span className="col-span-2 font-semibold">{result.note}</span>
       </div>

      </div>
     )}
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