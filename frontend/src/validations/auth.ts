import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: z.string().min(1, "Full name is required").max(100, "Name is too long"),
    email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

export const registerStep1Schema = z
  .object({
    name: z.string().min(2, "Full name must be at least 2 characters").max(100, "Name is too long"),
    email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    phone: z.string().min(10, "Please enter a valid phone number (at least 10 digits)"),
    dob: z.string().min(1, "Date of birth is required"),
    gender: z.string().optional(),
    city: z.string().min(2, "City is required"),
    state: z.string().min(2, "State is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterStep1FormData = z.infer<typeof registerStep1Schema>;

export const registerStep2Schema = z
  .object({
    collegeName: z.string().min(2, "College / Institution name is required"),
    course: z.string().min(1, "Please select your course / degree program"),
    branch: z.string().min(2, "Branch / Specialization is required"),
    yearSemester: z.string().min(1, "Please select your current year / semester"),
    rollNumber: z.string().min(2, "Student roll or registration number is required"),
    graduationYear: z.string().min(4, "Expected graduation year is required"),
    cgpa: z.string().optional(),
  })
  .refine((data) => !!data.course && data.course.trim().length > 0, {
    message: "Course selection is required before picking year / semester",
    path: ["yearSemester"],
  });

export type RegisterStep2FormData = z.infer<typeof registerStep2Schema>;

export const registerStep3Schema = z.object({
  nameOnId: z.string().min(2, "Name as printed on ID is required"),
  collegeNameOnId: z.string().min(2, "College name as printed on ID is required"),
  rollNumberOnId: z.string().min(2, "Roll number as printed on ID is required"),
  consentChecked: z.boolean().refine((val) => val === true, {
    message: "You must confirm accuracy consent before submitting",
  }),
});

export type RegisterStep3FormData = z.infer<typeof registerStep3Schema>;

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    otp: z.string().trim().length(6, "OTP must be exactly 6 digits").regex(/^\d{6}$/, "OTP must be 6 numeric digits"),
    newPassword: z.string().min(6, "New password must be at least 6 characters long"),
    confirmNewPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords do not match",
    path: ["confirmNewPassword"],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
