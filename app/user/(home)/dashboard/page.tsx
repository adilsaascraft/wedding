'use client'

import useSWR from 'swr'
import { useMemo } from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, ScanLine, Clock, Printer, UserCheck } from 'lucide-react'

import { fetcher } from '@/lib/fetcher'

export default function UserDashboardPage() {
  /* ================= REGISTERS ================= */

  const { data: registerRes } = useSWR(
    `${process.env.NEXT_PUBLIC_API_URL}/api/registers`,
    fetcher,
  )

  const registers = useMemo(() => registerRes?.data ?? [], [registerRes])

  const totalRegistrations = registerRes?.count ?? 0

  const printedCount = useMemo(
    () => registers.filter((r: any) => r.isPrinted).length,
    [registers],
  )

  const pendingPrint = useMemo(
    () => registers.filter((r: any) => !r.isPrinted).length,
    [registers],
  )

  /* ================= SCANS ================= */

  const { data: scanRes } = useSWR(
    `${process.env.NEXT_PUBLIC_API_URL}/api/scans`,
    fetcher,
  )

  const scans = useMemo(() => scanRes?.data ?? [], [scanRes])

  const totalScans = scanRes?.count ?? 0

  const remainingScans = totalRegistrations - totalScans

  const recentScans = scans.slice(0, 10)

  /* ================= UI ================= */

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">User Dashboard</h1>

      {/* ================= STATS ================= */}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
        <Card>
          <CardHeader className="flex justify-between flex-row items-center">
            <CardTitle>Total Registration</CardTitle>
            <Users className="w-5 h-5 text-muted-foreground" />
          </CardHeader>

          <CardContent>
            <p className="text-3xl font-bold">{totalRegistrations}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex justify-between flex-row items-center">
            <CardTitle>Total Scans</CardTitle>
            <ScanLine className="w-5 h-5 text-muted-foreground" />
          </CardHeader>

          <CardContent>
            <p className="text-3xl font-bold text-green-600">{totalScans}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex justify-between flex-row items-center">
            <CardTitle>Remaining Scans</CardTitle>
            <Clock className="w-5 h-5 text-muted-foreground" />
          </CardHeader>

          <CardContent>
            <p className="text-3xl font-bold text-orange-500">
              {remainingScans}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex justify-between flex-row items-center">
            <CardTitle>Badges Printed</CardTitle>
            <Printer className="w-5 h-5 text-muted-foreground" />
          </CardHeader>

          <CardContent>
            <p className="text-3xl font-bold text-blue-600">{printedCount}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex justify-between flex-row items-center">
            <CardTitle>Pending Print</CardTitle>
            <UserCheck className="w-5 h-5 text-muted-foreground" />
          </CardHeader>

          <CardContent>
            <p className="text-3xl font-bold text-red-500">{pendingPrint}</p>
          </CardContent>
        </Card>
      </div>

      {/* ================= RECENT SCANS ================= */}

      <Card>
        <CardHeader>
          <CardTitle>Recent Scans</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-2">Name</th>
                  <th>Reg No</th>
                  <th>Module</th>
                  <th>Time</th>
                </tr>
              </thead>

              <tbody>
                {recentScans.map((scan: any) => (
                  <tr key={scan._id} className="border-b">
                    <td className="py-2">{scan.registerId?.name}</td>

                    <td>{scan.regNum}</td>

                    <td>{scan.moduleId?.moduleName}</td>

                    <td>{new Date(scan.createdAt).toLocaleTimeString()}</td>
                  </tr>
                ))}

                {recentScans.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="text-center py-6 text-muted-foreground"
                    >
                      No scans yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
