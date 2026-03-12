'use client';

import { useEffect, useRef, useState } from 'react'
import useSWR from 'swr'
import { Html5Qrcode } from 'html5-qrcode'
import { Button } from '@/components/ui/button'
import {
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
} from "@/components/ui/select"
import { CheckCircle2, XCircle } from 'lucide-react'
import { toast } from 'sonner'

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


export default function QrScanner() {

 const scannerRef = useRef<Html5Qrcode | null>(null)

 const [selectedModule, setSelectedModule] = useState<string | null>(null)
 const [isScanning, setIsScanning] = useState(false)
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

 const { data: moduleResponse } = useSWR<{ data: Module[] }>(
  'modules-active',
  fetchModules
 )

 const modules: Module[] = moduleResponse?.data || []

 // ==========================
 // Professional Beep
 // ==========================
 const playBeep = (type: 'success' | 'error') => {
  const ctx = new AudioContext()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.frequency.value = type === 'success' ? 880 : 220
  gain.gain.value = 0.15

  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.start()
  osc.stop(ctx.currentTime + 0.15)
 }

 const stopScanner = async () => {
  if (scannerRef.current) {
   try {
    await scannerRef.current.stop()
    await scannerRef.current.clear()
   } catch {
   } finally {
    scannerRef.current = null
    setIsScanning(false)
   }
  }
 }

 // ==========================
 // Handle Module Change
 // ==========================
 const handleModuleChange = async (value: string) => {

  await stopScanner()

  setSelectedModule(value)
  setResult(null)
  setIsScanning(false)

 }

 // ==========================
 // Start Scan
 // ==========================
 const startScan = async () => {

  if (!selectedModule) {
   toast.error('Please select module before scanning')
   return
  }

  if (isScanning) return

  setResult(null)

  const scanner = new Html5Qrcode('qr-reader')
  scannerRef.current = scanner

  try {

   await scanner.start(
    { facingMode: 'environment' },
    { fps: 10, qrbox: { width: 260, height: 260 } },

    async (decodedText) => {
     await stopScanner()
     await markDelivered(decodedText)
    },

    () => {}
   )

   setIsScanning(true)

  } catch {
   toast.error('Camera permission denied')
  }
 }

 // ==========================
 // POST /api/scans
 // ==========================
 const markDelivered = async (regNum: string) => {

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

   playBeep(res.success ? 'success' : 'error')
   navigator.vibrate?.(120)

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

  } catch (err: any) {

   playBeep('error')
   navigator.vibrate?.([80,40,80])

   setResult({
    success: false,
    message: err.message || 'Scan failed'
   })
  }
 }

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

 // Cleanup
 useEffect(() => {
  return () => {
   stopScanner()
  }
 }, [])

 return (
  <div className="min-h-screen flex flex-col bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 p-4">

   {/* ---------------- MODULE SELECT ---------------- */}
   <div className="max-w-sm mx-auto p-4">

    <Select
     value={selectedModule ?? ''}
     onValueChange={handleModuleChange}
    >

     <SelectTrigger className='w-[320px]'>
      <SelectValue placeholder="Please select module" />
     </SelectTrigger>

     <SelectContent>

      {modules.length === 0 && (
       <SelectItem value="loading" disabled>
        Loading modules...
       </SelectItem>
      )}

      {modules.map((module)=>(
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
     className={`relative w-full rounded-lg p-4 text-white space-y-3
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

     {/* Message */}
     <div className="flex items-center gap-2">
      {result.success ? <CheckCircle2 /> : <XCircle />}
      <span className="font-bold text-lg">
       {result.message}
      </span>
     </div>

     {/* Module */}
     {result.moduleName && (
      <div className="font-semibold text-sm">
       Module: {result.moduleName}
      </div>
     )}

     {/* Details */}
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

   {/* ---------------- SCANNER ---------------- */}
   <div className="mx-auto w-full max-w-sm">
    <div id="qr-reader" className="rounded-xl border overflow-hidden" />
   </div>

   {/* ---------------- ACTION ---------------- */}
   <div className="max-w-sm mx-auto">
    <Button
     onClick={startScan}
     disabled={isScanning}
     className="w-[340px] bg-orange-600 hover:bg-orange-700"
    >
     {isScanning ? 'Scanning…' : 'Start Scan'}
    </Button>
   </div>

  </div>
 )
}