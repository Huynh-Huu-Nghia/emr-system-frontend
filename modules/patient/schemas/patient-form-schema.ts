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
  create_account: z.boolean().optional(),
  username: z.string().optional(),
  password: z.string().optional(),
}).superRefine((data, ctx) => {
  if (!data.create_account) return
  if (!data.username || data.username.trim().length < 4) {
    ctx.addIssue({
      code: "custom",
      message: "Tên đăng nhập tối thiểu 4 ký tự",
      path: ["username"],
    })
  }
  if (!data.password || data.password.length < 6) {
    ctx.addIssue({
      code: "custom",
      message: "Mật khẩu tối thiểu 6 ký tự",
      path: ["password"],
    })
  }
})

export type PatientFormValues = z.infer<typeof patientFormSchema>
