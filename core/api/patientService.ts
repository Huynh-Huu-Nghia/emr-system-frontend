/**
 * Patient Service Module
 *
 * This service handles all patient-related data operations, maintaining consistency with the database schema.
 * Key design decisions:
 * - Uses snake_case naming to match database columns, ensuring seamless API integration.
 * - Supports optional user_id for offline patients (walk-ins) who aren't linked to user accounts.
 * - Implements mock data for development; replace with actual API calls in production.
 * - Provides type-safe interfaces for all operations to prevent runtime errors.
 */

/**
 * Represents a patient entity from the database.
 * @interface Patient
 * @property {number} id - Unique identifier for the patient record.
 * @property {number | null} [user_id] - Optional link to users table; null for offline patients.
 * @property {string} full_name - Patient's full name in snake_case to match DB schema.
 * @property {string} dob - Date of birth in ISO string format.
 * @property {"MALE" | "FEMALE" | "OTHER"} gender - Patient's gender.
 * @property {string} phone - Contact phone number.
 * @property {string} [address] - Optional residential address.
 * @property {string} [insurance_code] - Optional health insurance code.
 * @property {string} medicalHistoryNumber - Unique medical history identifier.
 * @property {string} created_at - Timestamp of record creation.
 */
export interface Patient {
  id: number;
  user_id?: number | null;
  full_name: string;
  dob: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  phone: string;
  address?: string;
  insurance_code?: string;
  medicalHistoryNumber: string;
  created_at: string;
}

/**
 * Request payload for creating a new patient.
 * @interface PatientCreateRequest
 * @property {string} full_name - Required full name.
 * @property {string} dob - Required date of birth.
 * @property {"MALE" | "FEMALE" | "OTHER"} gender - Required gender.
 * @property {string} phone - Required phone number.
 * @property {string} [address] - Optional address.
 * @property {string} [insurance_code] - Optional insurance code.
 * @property {number | null} [user_id] - Optional user link; null for offline patients.
 */
export interface PatientCreateRequest {
  full_name: string;
  dob: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  phone: string;
  address?: string;
  insurance_code?: string;
  user_id?: number | null;
}

/**
 * Response structure for patient list queries.
 * @interface PatientListResponse
 * @property {boolean} success - Indicates if the operation was successful.
 * @property {Patient[]} data - Array of patient records.
 * @property {number} total - Total number of records available.
 */
export interface PatientListResponse {
  success: boolean;
  data: Patient[];
  total: number;
}

/**
 * Mock patient data for development and testing.
 * Includes diverse scenarios: linked users, offline patients, various insurance statuses.
 * This simulates real database data to test UI components and pagination.
 */
const MOCK_PATIENTS: Patient[] = [
  {
    id: 1,
    user_id: 101,
    full_name: "Nguyễn Thị Mai",
    dob: "1988-03-21",
    gender: "FEMALE",
    phone: "0909123456",
    address: "Quận 1, TP.HCM",
    insurance_code: "GD1234567890123",
    medicalHistoryNumber: "BN001",
    created_at: "2025-01-10T08:30:00.000Z",
  },
  {
    id: 2,
    user_id: null,
    full_name: "Trần Văn Đức",
    dob: "1995-11-08",
    gender: "MALE",
    phone: "0987654321",
    address: "Thủ Đức, TP.HCM",
    insurance_code: undefined,
    medicalHistoryNumber: "BN002",
    created_at: "2025-02-14T10:15:00.000Z",
  },
  {
    id: 3,
    user_id: null,
    full_name: "Lê Hoàng Yến",
    dob: "2001-07-02",
    gender: "OTHER",
    phone: "0377888999",
    insurance_code: "DN9876543210987",
    medicalHistoryNumber: "BN003",
    created_at: "2025-03-01T14:00:00.000Z",
  },
]

/**
 * Retrieves the next available patient ID.
 * Uses the current mock dataset to ensure ID uniqueness.
 */
const getNextPatientId = (): number => {
  if (MOCK_PATIENTS.length === 0) return 1
  return Math.max(...MOCK_PATIENTS.map((patient) => patient.id)) + 1
}

/**
 * Generates the next unique medical history number.
 * Computes the highest existing BN### suffix and increments it.
 */
const generateMedicalHistoryNumber = (): string => {
  const sequenceNumbers = MOCK_PATIENTS
    .map((patient) => {
      const match = patient.medicalHistoryNumber.match(/^BN(\d+)$/)
      return match ? Number(match[1]) : 0
    })
  const nextSequence = sequenceNumbers.length > 0 ? Math.max(...sequenceNumbers) + 1 : 1
  return `BN${String(nextSequence).padStart(3, "0")}`
}

/**
 * Patient service object providing CRUD operations.
 * In production, replace mock implementations with actual API calls.
 * Uses async/await pattern for consistency with modern JavaScript.
 */
export const patientService = {
  /**
   * Retrieves all patients with pagination support.
   * @async
   * @returns {Promise<PatientListResponse>} Promise resolving to patient list response.
   * @note Mock implementation uses setTimeout to simulate network delay.
   */
  async getAllPatients(): Promise<PatientListResponse> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: MOCK_PATIENTS,
          total: MOCK_PATIENTS.length,
        });
      }, 500);
    });
  },

  /**
   * Retrieves a specific patient by ID.
   * @async
   * @param {number} id - The patient's unique identifier.
   * @returns {Promise<Patient>} Promise resolving to the patient record.
   * @throws {Error} If patient is not found.
   */
  async getPatientById(id: number): Promise<Patient> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const patient = MOCK_PATIENTS.find((p) => p.id === id);
        if (patient) resolve(patient);
        else reject(new Error("Không tìm thấy bệnh nhân"));
      }, 300);
    });
  },

  /**
   * Creates a new patient record.
   * @async
   * @param {PatientCreateRequest} data - Patient creation data.
   * @returns {Promise<Patient>} Promise resolving to the created patient.
   * @note Uses the existing dataset to generate a unique medicalHistoryNumber.
   */
  async createPatient(data: PatientCreateRequest): Promise<Patient> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newPatient: Patient = {
          id: getNextPatientId(),
          ...data,
          medicalHistoryNumber: generateMedicalHistoryNumber(),
          created_at: new Date().toISOString(),
        };
        MOCK_PATIENTS.push(newPatient); // Persist new mock patient in-memory
        resolve(newPatient);
      }, 500);
    });
  },

  /**
   * Updates an existing patient record.
   * @async
   * @param {number} id - Patient ID to update.
   * @param {Partial<PatientCreateRequest>} data - Partial update data.
   * @returns {Promise<Patient>} Promise resolving to the updated patient.
   * @throws {Error} If patient is not found.
   */
  async updatePatient(id: number, data: Partial<PatientCreateRequest>): Promise<Patient> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = MOCK_PATIENTS.findIndex((p) => p.id === id);
        if (index !== -1) {
          MOCK_PATIENTS[index] = { ...MOCK_PATIENTS[index], ...data }; // Actually update mock data
          resolve(MOCK_PATIENTS[index]);
        } else {
          reject(new Error("Bệnh nhân không tồn tại"));
        }
      }, 500);
    });
  },

  /**
   * Deletes a patient record by ID.
   * @async
   * @param {number} id - Patient ID to delete.
   * @returns {Promise<boolean>} Promise resolving to true if deletion successful.
   */
  async deletePatient(id: number): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = MOCK_PATIENTS.findIndex((p) => p.id === id);
        if (index !== -1) {
          MOCK_PATIENTS.splice(index, 1); // Actually remove from mock data
        }
        resolve(true);
      }, 300);
    });
  },
};