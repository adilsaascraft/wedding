import { z } from 'zod'

// Module Schema and Types
export const ModuleSchema = z.object({
  _id: z.string().optional(), // for Edit mode

  moduleName: z
    .string()
    .min(1, 'Module name cannot be empty.')
    .max(50, 'Module name cannot exceed 50 characters.'),

  status: z
    .string()
    .min(1, 'Status is required.')
    .max(50, 'Status cannot exceed 50 characters.'),
})

export type ModuleValues = z.infer<typeof ModuleSchema>