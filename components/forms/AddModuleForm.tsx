'use client'

import { useEffect, useState } from 'react'
import { ModuleSchema, ModuleValues } from '@/validations/moduleSchema'
import { z } from 'zod'
import { UserPlus } from 'lucide-react'
import InputWithIcon from '@/components/InputWithIcon'
import {
  zodResolver,
  useForm,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
   Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SheetClose,
  toast,
  status,
} from '@/lib/imports'
import { getIndianFormattedDate } from '@/lib/formatIndianDate'
import { apiRequest } from '@/lib/apiRequest'

/* ================= TYPES ================= */

type AddModuleFormProps = {
  defaultValues?: Partial<ModuleValues & { _id: string }>
  onSave: (entry: ModuleValues & { _id: string }) => void
}

/* ================= COMPONENT ================= */

export default function AddModuleForm({
  defaultValues,
  onSave,
}: AddModuleFormProps) {
  const [loading, setLoading] = useState(false)

  const form = useForm<ModuleValues>({
    resolver: zodResolver(ModuleSchema),
    defaultValues: {
      moduleName: '',
      status: 'Active',
      ...defaultValues,
    },
  })

  /* ================= EFFECT ================= */

  useEffect(() => {
    if (defaultValues) {
      form.reset(defaultValues)
    } else {
      form.reset({ ...form.getValues(), status: 'Active' })
    }
  }, [defaultValues, form])

  /* ================= SUBMIT ================= */

  const onSubmit = async (values: z.infer<typeof ModuleSchema>) => {
    if (loading) return // ✅ double-click guard

    try {
      setLoading(true)

      const isEdit = Boolean(defaultValues?._id)

      const result = await apiRequest<
        z.infer<typeof ModuleSchema>,
        { data: ModuleValues & { _id: string } }
      >({
        endpoint: isEdit
          ? `/api/modules/${defaultValues!._id}`
          : `/api/modules`,
        method: isEdit ? 'PUT' : 'POST',
        body: values,
        showToast: false,
      })

      toast.success(
        isEdit
          ? 'Module updated successfully!'
          : 'Module created successfully!',
        { description: getIndianFormattedDate() }
      )

      onSave?.(result.data) // ✅ backend source of truth
      form.reset()
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong ❌')
    } finally {
      setLoading(false)
    }
  }

  /* ================= UI ================= */

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-y-auto custom-scroll">
        <Form {...form}>
          <form
            id="module-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 pr-3 pl-3"
          >
            {/* Module Name */}
            <FormField
              control={form.control}
              name="moduleName"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>Module Name *</FormLabel>
                  <FormControl>
                    <InputWithIcon
                      {...field}
                      placeholder="Type module name e.g. Day 1 Lunch"
                      icon={<UserPlus className="w-5 h-5 text-orange-600" />}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Status */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full p-3">
                        <SelectValue placeholder="Select status type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {status.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 left-0 right-0 border-t px-6 py-4 flex justify-between bg-white/90 backdrop-blur">
        <SheetClose asChild>
          <Button
            type="button"
            variant="outline"
            className="border border-gray-400"
            disabled={loading}
          >
            Close
          </Button>
        </SheetClose>

        <Button
          type="submit"
          form="module-form"
          disabled={loading}
          className="bg-orange-600 text-white hover:bg-orange-700 px-6 py-3"
        >
          {loading
            ? defaultValues?._id
              ? 'Updating...'
              : 'Creating...'
            : defaultValues?._id
            ? 'Update'
            : 'Create'}
        </Button>
      </div>
    </div>
  )
}