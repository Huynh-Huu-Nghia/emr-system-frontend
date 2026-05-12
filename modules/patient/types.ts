/**
 * Patient domain — re-export from API layer until BE contract is frozen.
 * Team: import `Patient` from here, not from `core/api/*`, for one entry point.
 */
export type {
  Patient,
  PatientCreateRequest,
  PatientListResponse,
} from "@/core/api/patientService"

export type { PatientFormValues } from "@/modules/patient/schemas/patient-form-schema"

export type PatientGenderFilter = "ALL" | "MALE" | "FEMALE" | "OTHER"
export type PatientInsuranceFilter = "ALL" | "HAS" | "NONE"
