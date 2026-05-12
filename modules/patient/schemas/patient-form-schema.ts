import * as z from "zod"

/** Form + API payload shape (snake_case — matches BE contract draft). */
export const patientFormSchema = z.object({
  full_name: z.string().min(2, "Họ tên quá ngắn").max(100, "Họ tên quá dài"),
  dob: z.string().min(1, "Vui lòng chọn ngày sinh"),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  phone: z
    .string()
    .min(10, "Số điện thoại không hợp lệ")
    .regex(/^(\+84|0)[3-9]\d{8}$/, "Số điện thoại không đúng định dạng"),
  address: z.string().optional(),
  insurance_code: z.string().optional(),
})

export type PatientFormValues = z.infer<typeof patientFormSchema>
