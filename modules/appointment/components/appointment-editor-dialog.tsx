"use client"

import { useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import type { Appointment } from "@/core/api/appointmentService"
import type { Patient } from "@/modules/patient/types"
import {
  fromDatetimeLocalValue,
  toDatetimeLocalValue,
} from "@/shared/lib/format/date"
import {
  useCreateAppointmentMutation,
  useRescheduleAppointmentMutation,
} from "@/modules/appointment/hooks/use-appointment-mutations"

type Mode = "create" | "reschedule"

type FormValues = {
  patient_id?: string
  starts_at_local: string
  reason?: string
}

function buildSchema(mode: Mode) {
  return z
    .object({
      patient_id: z.string().optional(),
      starts_at_local: z.string().min(1, "Chọn ngày giờ"),
      reason: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      if (mode === "create") {
        if (!data.patient_id) {
          ctx.addIssue({
            code: "custom",
            message: "Chọn bệnh nhân",
            path: ["patient_id"],
          })
        }
      }
    })
}

type AppointmentEditorDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: Mode
  appointment?: Appointment | null
  patients: Patient[]
}

export function AppointmentEditorDialog({
  open,
  onOpenChange,
  mode,
  appointment,
  patients,
}: AppointmentEditorDialogProps) {
  const createMut = useCreateAppointmentMutation()
  const rescheduleMut = useRescheduleAppointmentMutation()
  const saving = createMut.isPending || rescheduleMut.isPending

  const schema = useMemo(() => buildSchema(mode), [mode])

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      patient_id: "",
      starts_at_local: "",
      reason: "",
    },
  })

  useEffect(() => {
    if (!open) return
    if (mode === "reschedule" && appointment) {
      form.reset({
        patient_id: String(appointment.patient_id),
        starts_at_local: toDatetimeLocalValue(appointment.starts_at),
        reason: appointment.reason ?? "",
      })
    } else {
      const base = new Date()
      base.setMinutes(0, 0, 0)
      base.setHours(base.getHours() + 1)
      form.reset({
        patient_id: patients[0] ? String(patients[0].id) : "",
        starts_at_local: toDatetimeLocalValue(base.toISOString()),
        reason: "",
      })
    }
  }, [open, mode, appointment, patients, form])

  const onSubmit = async (values: FormValues) => {
    const iso = fromDatetimeLocalValue(values.starts_at_local)
    try {
      if (mode === "create") {
        const pid = Number(values.patient_id ?? "")
        const p = patients.find((x) => x.id === pid)
        if (!p) throw new Error("Bệnh nhân không hợp lệ")
        await createMut.mutateAsync({
          patient_id: pid,
          patient_name: p.full_name,
          medical_history_number: p.medicalHistoryNumber,
          starts_at: iso,
          reason: values.reason?.trim() || null,
        })
      } else if (appointment) {
        await rescheduleMut.mutateAsync({
          id: appointment.id,
          starts_at: iso,
          reason: values.reason?.trim() || null,
        })
      }
      onOpenChange(false)
    } catch {
      /* toast in mutation */
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl border-none bg-white p-0 shadow-2xl sm:max-w-md">
        <DialogHeader className="border-b border-slate-100 px-6 py-4">
          <DialogTitle className="text-lg font-bold text-medical-dark">
            {mode === "create" ? "Đặt lịch hẹn" : "Đổi lịch hẹn"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 px-6 py-4"
          >
            {mode === "create" ? (
              <FormField
                control={form.control}
                name="patient_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-slate-600">
                      Bệnh nhân
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={patients.length === 0}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Chọn bệnh nhân" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {patients.map((p) => (
                          <SelectItem key={p.id} value={String(p.id)}>
                            {p.full_name} · #{p.medicalHistoryNumber}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : appointment ? (
              <div className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700">
                <span className="font-semibold">{appointment.patient_name}</span>
                <span className="text-slate-400"> · </span>
                <span className="text-medical-primary">
                  #{appointment.medical_history_number}
                </span>
              </div>
            ) : null}

            <FormField
              control={form.control}
              name="starts_at_local"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-slate-600">
                    Ngày & giờ
                  </FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-slate-600">
                    Ghi chú (tuỳ chọn)
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Lý do khám / ghi chú nội bộ"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2 border-t border-slate-100 bg-slate-50/80 px-0 pb-0 pt-4">
              <Button
                type="button"
                variant="outline"
                disabled={saving}
                onClick={() => onOpenChange(false)}
              >
                Huỷ
              </Button>
              <Button
                type="submit"
                loading={saving}
                className="bg-medical-primary hover:bg-medical-dark"
              >
                {mode === "create" ? "Tạo lịch" : "Lưu lịch mới"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
