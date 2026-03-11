'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"

import { Alert, AlertDescription } from "@/components/ui/alert"

import { Loader2, Save, User, Phone, CheckCircle2 } from "lucide-react"

import { apiRequest } from "@/lib/apiRequest"
import { fetcher } from "@/lib/fetcher"

type FormValues = {
  name: string
  mobile: string
  note: string
  modules: string[]
}

export default function AddInvitationPage() {

  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  /* ================= FETCH MODULES ================= */

  const { data } = useSWR(
    `${process.env.NEXT_PUBLIC_API_URL}/api/modules/active`,
    fetcher
  )

  const modules = data?.data ?? []

  /* ================= FORM ================= */

  const form = useForm<FormValues>({
    defaultValues: {
      name: "",
      mobile: "",
      note: "",
      modules: []
    }
  })

  /* ================= SUBMIT ================= */

  const onSubmit = async (values: FormValues) => {

    setError("")
    setLoading(true)

    try {

      await apiRequest({
        endpoint: "/api/registers",
        method: "POST",
        body: values,
      })

      setSuccess(true)
      form.reset()

    } catch (err: any) {

      setError(err.message || "Failed to add invitation")

    } finally {

      setLoading(false)

    }
  }

  /* ================= UI ================= */

  return (

    <div className="min-h-screen flex flex-col bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 p-4">

      <div className="max-w-4xl mx-auto pt-16 flex-1 w-full">

        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur overflow-hidden">

          {/* HEADER (hidden when success) */}

          {!success && (
            <CardHeader className="text-center transition-all duration-500">

              <CardTitle className="text-3xl font-bold text-[#504943] font-cinzel">
                Add New Invitation
              </CardTitle>

              <CardDescription className="text-gray-600">
                Enter the details for the new wedding invitation
              </CardDescription>

            </CardHeader>
          )}

          <CardContent className="relative">

            {/* ERROR */}

            {error && !success && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* SUCCESS VIEW */}

            <div
              className={`transition-all duration-500 ease-in-out ${success
                  ? "opacity-100 scale-100 translate-y-0"
                  : "opacity-0 scale-95 -translate-y-6 pointer-events-none absolute inset-0"
                }`}
            >

              {success && (

                <div className="flex flex-col items-center justify-center py-16 space-y-6">

                  <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center">

                    <CheckCircle2 className="w-16 h-16 text-green-600 animate-bounce" />

                  </div>

                  <p className="text-xl font-semibold text-green-700">
                    Invitation Added Successfully
                  </p>

                  <Button
                    onClick={() => {
                      setSuccess(false)
                      form.reset()
                    }}
                    className="bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-700 hover:to-red-700 text-white px-8"
                  >
                    Add New Invitation
                  </Button>

                </div>

              )}

            </div>

            {/* FORM */}

            <div
              className={`transition-all duration-500 ease-in-out ${success
                  ? "opacity-0 scale-95 translate-y-6 pointer-events-none absolute inset-0"
                  : "opacity-100 scale-100 translate-y-0"
                }`}
            >

              {!success && (

                <Form {...form}>

                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                  >

                    {/* NAME */}

                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (

                        <FormItem>

                          <FormLabel className="flex items-center">
                            <User className="h-4 w-4 mr-2 text-amber-600" />
                            Full Name *
                          </FormLabel>

                          <FormControl>

                            <Input
                              placeholder="e.g., Dr. Vijay Patil"
                              className="h-12 text-lg border-2 border-amber-200 focus:border-amber-400"
                              {...field}
                            />

                          </FormControl>

                          <FormMessage />

                        </FormItem>

                      )}
                    />

                    {/* MOBILE */}

                    <FormField
                      control={form.control}
                      name="mobile"
                      render={({ field }) => (

                        <FormItem>

                          <FormLabel className="flex items-center">
                            <Phone className="h-4 w-4 mr-2 text-amber-600" />
                            Mobile Number *
                          </FormLabel>

                          <FormControl>

                            <Input
                              placeholder="e.g., 9920755555"
                              maxLength={10}
                              className="h-12 text-lg border-2 border-amber-200 focus:border-amber-400"
                              value={field.value}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value.replace(/\D/g, '')
                                )
                              }
                            />

                          </FormControl>

                          <FormMessage />

                        </FormItem>

                      )}
                    />

                    {/* NOTE */}

                    <FormField
                      control={form.control}
                      name="note"
                      render={({ field }) => (

                        <FormItem>

                          <FormLabel>Note</FormLabel>

                          <FormControl>

                            <Textarea
                              placeholder="Add invitation note..."
                              className="border-amber-200 focus:border-amber-400"
                              {...field}
                            />

                          </FormControl>

                          <FormMessage />

                        </FormItem>

                      )}
                    />

                    {/* MODULE CHECKBOXES */}

                    <div className="space-y-3">

                      <FormLabel>Allow Modules</FormLabel>

                      <div className="grid grid-cols-2 gap-3">

                        {modules.map((module: any) => (

                          <FormField
                            key={module._id}
                            control={form.control}
                            name="modules"
                            render={({ field }) => {

                              const checked = field.value?.includes(module._id)

                              return (

                                <FormItem className="flex items-center space-x-2">

                                  <Checkbox
                                    checked={checked}
                                    onCheckedChange={(isChecked) => {

                                      if (isChecked) {
                                        field.onChange([...field.value, module._id])
                                      } else {
                                        field.onChange(
                                          field.value.filter((id: string) => id !== module._id)
                                        )
                                      }

                                    }}
                                  />

                                  <FormLabel className="font-normal">
                                    {module.moduleName}
                                  </FormLabel>

                                </FormItem>

                              )

                            }}
                          />

                        ))}

                      </div>

                    </div>

                    {/* SUBMIT */}

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-14 text-lg bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-700 hover:to-red-700 font-cinzel mt-6"
                    >

                      {loading ? (

                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Saving Invitation...
                        </>

                      ) : (

                        <>
                          <Save className="mr-2 h-5 w-5" />
                          Save Invitation
                        </>

                      )}

                    </Button>

                  </form>

                </Form>

              )}

            </div>

          </CardContent>

        </Card>

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