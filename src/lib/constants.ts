export const USER_ROLES = {
  connectedMenaAdmin: "connected_mena_admin",
  schoolAdmin: "school_admin",
  academicCoordinator: "academic_coordinator",
  teacher: "teacher",
  student: "student"
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  connected_mena_admin: "CONNECTED MENA Admin",
  school_admin: "School Admin",
  academic_coordinator: "Academic Coordinator",
  teacher: "Teacher",
  student: "Student"
};

export const DELIVERY_MODES = {
  teacherLed: "teacher_led",
  studentAccount: "student_account",
  hybrid: "hybrid"
} as const;

export type DeliveryMode = (typeof DELIVERY_MODES)[keyof typeof DELIVERY_MODES];

export const DELIVERY_MODE_LABELS: Record<DeliveryMode, string> = {
  teacher_led: "Teacher-led",
  student_account: "Student accounts",
  hybrid: "Hybrid"
};

export const DELIVERY_MODE_DESCRIPTIONS: Record<DeliveryMode, string> = {
  teacher_led: "K to Grade 6 delivery with teacher accounts only and class-level progress.",
  student_account: "Grades 7 to 12 delivery with individual student accounts planned.",
  hybrid: "Reserved for schools that blend teacher-led and student-account workflows."
};

export const GRADE_BANDS = {
  kTo6: "k_to_6",
  grades7To12: "grades_7_to_12"
} as const;

export type GradeBand = (typeof GRADE_BANDS)[keyof typeof GRADE_BANDS];

export const GRADE_BAND_LABELS: Record<GradeBand, string> = {
  k_to_6: "K to Grade 6",
  grades_7_to_12: "Grades 7 to 12"
};
