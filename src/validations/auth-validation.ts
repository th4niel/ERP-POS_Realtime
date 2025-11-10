import z from 'zod';

export const loginSchemaForm = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

export const createUserSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email'),
  password: z.string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(/[^A-Za-z0-9]/,"Password must contain at least one special character"),
  name: z.string().min(1, 'Name is required'),
  role: z.string().min(1, 'Role is required'),
  avatar_url: z.union([z.string().min(1, 'Image URL is required'), z.instanceof(File),]),
});

export const updateUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  role: z.string().min(1, 'Role is required'),
  avatar_url: z.union([z.string().min(1, 'Image URL is required'), z.instanceof(File),]),
});


export type LoginForm = z.infer<typeof loginSchemaForm>;
export type CreateUserForm = z.infer<typeof createUserSchema>;
export type UpdateUserForm = z.infer<typeof updateUserSchema>;