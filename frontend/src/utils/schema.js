import { z } from "zod";

export const registerSchema = z.object({
  fullname: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  avatar: z
    .any()
    .refine((files) => files?.length === 1, "Avatar is required"),
  coverImage: z
    .any()
    .refine((files) => files?.length === 1, "Cover image is required"),
});


export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
