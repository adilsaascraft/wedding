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


export default function QrScanner() {

 const scannerRef = useRef<Html5Qrcode | null>(null)

 const [selectedModule, setSelectedModule] = useState<string | null>(null)
 const [isScanning, setIsScanning] = useState(false)
 const [result, setResult] = useState<ScanResult>(null)

 // ==========================
 // Fetch Modules (Protected GET)
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
 // POST /api/scans (Protected)
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

   playBeep('success')
   navigator.vibrate?.(120)

   setResult({
    type: 'success',
    message: res.message,
    name: res.data.name,
    mobile: res.data.mobile,
    note: res.data.note,
    regNum: res.data.regNum,
   })

  } catch (err: any) {

   playBeep('error')
   navigator.vibrate?.([80,40,80])

   setResult({
    type: 'error',
    message: err.message || 'Scan failed',
   })
  }
 }

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

     <SelectTrigger className='w-[340px] p-3'>
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


   {/* ---------------- RESULT ---------------- */}
   {result && (
    <div
     className={`mx-auto max-w-sm rounded-lg p-4 text-white space-y-2
      ${result.type === 'success' ? 'bg-green-600' : 'bg-red-600'}
    `}
    >
     <div className="flex items-center gap-2">
      {result.type === 'success' ? <CheckCircle2 /> : <XCircle />}

      <span className="font-bold text-base">
       {result.message}
      </span>
     </div>

     {result.type === 'success' && (
      <div className="mt-4 rounded-xl border bg-muted/40 p-4 space-y-3">

       <div className="grid grid-cols-3 gap-2 text-sm">
        <span className="font-medium text-muted-foreground">Reg No</span>
        <span className="col-span-2 font-semibold">{result.regNum}</span>
       </div>

       <div className="grid grid-cols-3 gap-2 text-sm">
        <span className="font-medium text-muted-foreground">Name</span>
        <span className="col-span-2 font-semibold">{result.name}</span>
       </div>

       <div className="grid grid-cols-3 gap-2 text-sm">
        <span className="font-medium text-muted-foreground">Mobile</span>
        <span className="col-span-2 font-semibold">{result.mobile}</span>
       </div>

       <div className="grid grid-cols-3 gap-2 text-sm">
        <span className="font-medium text-muted-foreground">Note</span>
        <span className="col-span-2 font-semibold">{result.note}</span>
       </div>

      </div>
     )}
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