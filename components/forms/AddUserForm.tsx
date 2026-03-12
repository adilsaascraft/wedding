'use client'

import { useEffect, useState } from 'react'
import { UserSchema, UserValues } from '@/validations/userSchema'
import { z } from 'zod'
import { UserPlus, Mail } from 'lucide-react'
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
  SheetClose,
  toast,
} from '@/lib/imports'

import { getIndianFormattedDate } from '@/lib/formatIndianDate'
import { apiRequest } from '@/lib/apiRequest'

/* ================= TYPES ================= */

type AddUserFormProps = {
  defaultValues?: Partial<UserValues & { _id: string }>
  onSave: (entry: UserValues & { _id: string }) => void
}

/* ================= COMPONENT ================= */

export default function AddUserForm({
  defaultValues,
  onSave,
}: AddUserFormProps) {
  const [loading, setLoading] = useState(false)

  const form = useForm<UserValues>({
    resolver: zodResolver(UserSchema),
    defaultValues: {
      name: '',
      email: '',
      ...defaultValues,
    },
  })

  /* ================= EFFECT ================= */

  useEffect(() => {
    if (defaultValues) {
      form.reset(defaultValues)
    } else {
      form.reset({
        name: '',
        email: '',
      })
    }
  }, [defaultValues, form])

  /* ================= SUBMIT ================= */

  const onSubmit = async (values: z.infer<typeof UserSchema>) => {
    if (loading) return

    try {
      setLoading(true)

      const isEdit = Boolean(defaultValues?._id)

      const result = await apiRequest<
        z.infer<typeof UserSchema>,
        { data: UserValues & { _id: string } }
      >({
        endpoint: isEdit
          ? `/api/admin/users/${defaultValues!._id}`
          : `/api/admin/users/create`,
        method: isEdit ? 'PUT' : 'POST',
        body: values,
        showToast: false,
      })

      toast.success(
        isEdit
          ? 'User updated successfully!'
          : 'User created successfully!',
        { description: getIndianFormattedDate() }
      )

      onSave?.(result.data)
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
            id="user-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 pr-3 pl-3"
          >
            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>Name *</FormLabel>
                  <FormControl>
                    <InputWithIcon
                      {...field}
                      placeholder="Enter full name"
                      icon={<UserPlus className="w-5 h-5 text-orange-600" />}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <InputWithIcon
                      {...field}
                      placeholder="Enter email address"
                      icon={<Mail className="w-5 h-5 text-orange-600" />}
                    />
                  </FormControl>
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
          form="user-form"
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