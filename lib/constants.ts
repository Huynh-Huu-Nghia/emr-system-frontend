export const GENDERS = {
  MALE: "MALE",
  FEMALE: "FEMALE",
  OTHER: "OTHER",
} as const;

export const GENDER_LABELS: Record<string, string> = {
  [GENDERS.MALE]: "Nam",
  [GENDERS.FEMALE]: "Nữ",
  [GENDERS.OTHER]: "Khác",
};

// Bạn có thể thêm các hằng số khác ở đây sau này
export const PAGE_SIZE = 10;