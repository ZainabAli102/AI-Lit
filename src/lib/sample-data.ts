import { DELIVERY_MODES, GRADE_BANDS, type DeliveryMode, type GradeBand } from "@/lib/constants";

export type SampleClass = {
  id: string;
  name: string;
  gradeBand: GradeBand;
  deliveryMode: DeliveryMode;
  teacherName: string;
  progressLabel: string;
  activeLessons: number;
};

export const sampleClasses: SampleClass[] = [
  {
    id: "grade-1a",
    name: "Grade 1A",
    gradeBand: GRADE_BANDS.kTo6,
    deliveryMode: DELIVERY_MODES.teacherLed,
    teacherName: "Maya Haddad",
    progressLabel: "Class-level progress",
    activeLessons: 4
  },
  {
    id: "grade-8b",
    name: "Grade 8B",
    gradeBand: GRADE_BANDS.grades7To12,
    deliveryMode: DELIVERY_MODES.studentAccount,
    teacherName: "Omar Nasser",
    progressLabel: "Individual progress planned",
    activeLessons: 6
  }
];
