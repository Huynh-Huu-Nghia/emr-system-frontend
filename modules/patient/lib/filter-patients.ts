import type { Patient } from "@/modules/patient/types"
import type {
  PatientGenderFilter,
  PatientInsuranceFilter,
} from "@/modules/patient/types"

export function filterPatients(
  patients: Patient[],
  opts: {
    searchQuery: string
    genderFilter: PatientGenderFilter
    insuranceFilter: PatientInsuranceFilter
  }
): Patient[] {
  const query = opts.searchQuery.trim().toLowerCase()

  return patients.filter((patient) => {
    const matchesSearch =
      !query ||
      patient.full_name.toLowerCase().includes(query) ||
      patient.medicalHistoryNumber.toLowerCase().includes(query) ||
      patient.phone.toLowerCase().includes(query) ||
      (patient.insurance_code ?? "").toLowerCase().includes(query)

    const matchesGender =
      opts.genderFilter === "ALL" || patient.gender === opts.genderFilter

    const matchesInsurance =
      opts.insuranceFilter === "ALL" ||
      (opts.insuranceFilter === "HAS" && !!patient.insurance_code) ||
      (opts.insuranceFilter === "NONE" && !patient.insurance_code)

    return matchesSearch && matchesGender && matchesInsurance
  })
}
