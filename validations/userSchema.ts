import { z } from 'zod'

// User Schema and Types
export const UserSchema = z.object({
  _id: z.string().optional(), // for Edit mode

  name: z
    .string()
    .min(1, 'name cannot be empty.')
    .max(50, 'name cannot exceed 50 characters.'),

  email: z
  .string()
  .trim()
  .email("Please enter a valid email address.")
  .max(50, "Email cannot exceed 50 characters."),
})

export type UserValues = z.infer<typeof UserSchema>