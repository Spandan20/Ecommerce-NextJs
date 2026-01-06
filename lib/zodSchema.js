import z from "zod";

export const zSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[a-z]/, "Must contain at least one lowercase letter")
    .regex(/[0-9]/, "Must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Must contain at least one special character"),
  name: z
    .string()
    .min(2, "Name must be atleast 2 characters long")
    .max(50, "Name can contain at most 50 characters")
    .regex(/^[A-Za-z\s]+$/, "Name can only contain letters and spaces"),

  otp: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "OTP must be exactly 6 digits"),
});
