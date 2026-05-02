/**
 * Patient Service
 * Handles all patient-related API calls and data transformations.
 * Currently mocked for testing; integrate with real API endpoint later.
 * 
 * TODO: Implement real API calls once backend is ready
 */

export interface Patient {
  id: string
  fullName: string
  dateOfBirth: string
  gender: "MALE" | "FEMALE" | "OTHER"
  phoneNumber: string
  email: string
  address: string
  medicalHistoryNumber: string
  createdAt: string
  updatedAt: string
}

export interface PatientCreateRequest {
  fullName: string
  dateOfBirth: string
  gender: "MALE" | "FEMALE" | "OTHER"
  phoneNumber: string
  email: string
  address: string
}

export interface PatientListResponse {
  success: boolean
  data: Patient[]
  total: number
}

/**
 * Mock patient data for testing
 */
const MOCK_PATIENTS: Patient[] = [
  {
    id: "patient_001",
    fullName: "Trần Thị An",
    dateOfBirth: "1990-05-15",
    gender: "FEMALE",
    phoneNumber: "0901234567",
    email: "an.tran@example.com",
    address: "123 Nguyễn Huệ, Hà Nội",
    medicalHistoryNumber: "BN001",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "patient_002",
    fullName: "Phạm Văn Bình",
    dateOfBirth: "1985-08-20",
    gender: "MALE",
    phoneNumber: "0902345678",
    email: "binh.pham@example.com",
    address: "456 Tôn Đức Thắng, TP.HCM",
    medicalHistoryNumber: "BN002",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "patient_003",
    fullName: "Lê Thị Cúc",
    dateOfBirth: "1995-12-10",
    gender: "FEMALE",
    phoneNumber: "0903456789",
    email: "cuc.le@example.com",
    address: "789 Lý Thường Kiệt, Đà Nẵng",
    medicalHistoryNumber: "BN003",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

/**
 * Patient Service object with async methods
 * Template for team members to extend with real API calls
 */
const patientService = {
  /**
   * Get all patients
   * @returns Promise<PatientListResponse>
   */
  async getAllPatients(): Promise<PatientListResponse> {
    return new Promise((resolve) => {
      // Simulate API delay
      setTimeout(() => {
        resolve({
          success: true,
          data: MOCK_PATIENTS,
          total: MOCK_PATIENTS.length,
        })
      }, 800)
    })
  },

  /**
   * Get patient by ID
   * @param id - Patient ID
   * @returns Promise<Patient | null>
   */
  async getPatientById(id: string): Promise<Patient | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const patient = MOCK_PATIENTS.find((p) => p.id === id)
        resolve(patient || null)
      }, 500)
    })
  },

  /**
   * Create a new patient
   * @param data - PatientCreateRequest
   * @returns Promise<Patient>
   */
  async createPatient(data: PatientCreateRequest): Promise<Patient> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newPatient: Patient = {
          id: `patient_${Date.now()}`,
          ...data,
          medicalHistoryNumber: `BN${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        resolve(newPatient)
      }, 500)
    })
  },

  /**
   * Update patient information
   * @param id - Patient ID
   * @param data - Partial patient data to update
   * @returns Promise<Patient>
   */
  async updatePatient(id: string, data: Partial<Patient>): Promise<Patient> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const patient = MOCK_PATIENTS.find((p) => p.id === id)
        if (patient) {
          const updated = { ...patient, ...data, updatedAt: new Date().toISOString() }
          resolve(updated)
        } else {
          throw new Error("Patient not found")
        }
      }, 500)
    })
  },

  /**
   * Delete patient
   * @param id - Patient ID
   * @returns Promise<boolean>
   */
  async deletePatient(id: string): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true)
      }, 400)
    })
  },
}

export { patientService }
