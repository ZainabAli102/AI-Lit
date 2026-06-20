export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      academic_years: {
        Row: {
          created_at: string;
          ends_on: string | null;
          id: string;
          is_current: boolean;
          name: string;
          school_id: string;
          starts_on: string | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          ends_on?: string | null;
          id?: string;
          is_current?: boolean;
          name: string;
          school_id: string;
          starts_on?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          ends_on?: string | null;
          id?: string;
          is_current?: boolean;
          name?: string;
          school_id?: string;
          starts_on?: string | null;
          updated_at?: string;
        };
      };
      activities: {
        Row: {
          activity_type: string;
          created_at: string;
          delivery_mode: Database["public"]["Enums"]["delivery_mode"];
          id: string;
          is_smartboard_ready: boolean;
          lesson_id: string;
          sequence_order: number;
          title: string;
          updated_at: string;
        };
        Insert: {
          activity_type?: string;
          created_at?: string;
          delivery_mode?: Database["public"]["Enums"]["delivery_mode"];
          id?: string;
          is_smartboard_ready?: boolean;
          lesson_id: string;
          sequence_order?: number;
          title: string;
          updated_at?: string;
        };
        Update: {
          activity_type?: string;
          created_at?: string;
          delivery_mode?: Database["public"]["Enums"]["delivery_mode"];
          id?: string;
          is_smartboard_ready?: boolean;
          lesson_id?: string;
          sequence_order?: number;
          title?: string;
          updated_at?: string;
        };
      };
      assignment_rubrics: {
        Row: {
          assignment_id: string;
          created_at: string;
          rubric_id: string;
        };
        Insert: {
          assignment_id: string;
          created_at?: string;
          rubric_id: string;
        };
        Update: {
          assignment_id?: string;
          created_at?: string;
          rubric_id?: string;
        };
      };
      assignment_submissions: {
        Row: {
          assignment_id: string;
          attachment_urls: string[];
          content: string | null;
          created_at: string;
          id: string;
          returned_at: string | null;
          status: Database["public"]["Enums"]["submission_status"];
          student_profile_id: string;
          submitted_at: string | null;
          updated_at: string;
        };
        Insert: {
          assignment_id: string;
          attachment_urls?: string[];
          content?: string | null;
          created_at?: string;
          id?: string;
          returned_at?: string | null;
          status?: Database["public"]["Enums"]["submission_status"];
          student_profile_id: string;
          submitted_at?: string | null;
          updated_at?: string;
        };
        Update: {
          assignment_id?: string;
          attachment_urls?: string[];
          content?: string | null;
          created_at?: string;
          id?: string;
          returned_at?: string | null;
          status?: Database["public"]["Enums"]["submission_status"];
          student_profile_id?: string;
          submitted_at?: string | null;
          updated_at?: string;
        };
      };
      assignments: {
        Row: {
          assigned_at: string | null;
          class_id: string;
          created_at: string;
          created_by_teacher_id: string | null;
          due_at: string | null;
          id: string;
          instructions: string | null;
          lesson_id: string | null;
          status: Database["public"]["Enums"]["assignment_status"];
          title: string;
          updated_at: string;
        };
        Insert: {
          assigned_at?: string | null;
          class_id: string;
          created_at?: string;
          created_by_teacher_id?: string | null;
          due_at?: string | null;
          id?: string;
          instructions?: string | null;
          lesson_id?: string | null;
          status?: Database["public"]["Enums"]["assignment_status"];
          title: string;
          updated_at?: string;
        };
        Update: {
          assigned_at?: string | null;
          class_id?: string;
          created_at?: string;
          created_by_teacher_id?: string | null;
          due_at?: string | null;
          id?: string;
          instructions?: string | null;
          lesson_id?: string | null;
          status?: Database["public"]["Enums"]["assignment_status"];
          title?: string;
          updated_at?: string;
        };
      };
      class_lesson_progress: {
        Row: {
          class_id: string;
          class_notes: string | null;
          completed_at: string | null;
          created_at: string;
          id: string;
          last_activity_at: string | null;
          lesson_id: string;
          status: Database["public"]["Enums"]["progress_status"];
          updated_at: string;
        };
        Insert: {
          class_id: string;
          class_notes?: string | null;
          completed_at?: string | null;
          created_at?: string;
          id?: string;
          last_activity_at?: string | null;
          lesson_id: string;
          status?: Database["public"]["Enums"]["progress_status"];
          updated_at?: string;
        };
        Update: {
          class_id?: string;
          class_notes?: string | null;
          completed_at?: string | null;
          created_at?: string;
          id?: string;
          last_activity_at?: string | null;
          lesson_id?: string;
          status?: Database["public"]["Enums"]["progress_status"];
          updated_at?: string;
        };
      };
      class_lesson_assessments: {
        Row: {
          activity_completed: Database["public"]["Enums"]["assessment_response"];
          class_id: string;
          created_at: string;
          id: string;
          lesson_id: string;
          objective_met: Database["public"]["Enums"]["assessment_response"];
          overall_status: Database["public"]["Enums"]["k6_assessment_status"];
          students_explained_thinking: Database["public"]["Enums"]["assessment_response"];
          students_needing_support: string | null;
          teacher_id: string;
          teacher_notes: string | null;
          updated_at: string;
        };
        Insert: {
          activity_completed: Database["public"]["Enums"]["assessment_response"];
          class_id: string;
          created_at?: string;
          id?: string;
          lesson_id: string;
          objective_met: Database["public"]["Enums"]["assessment_response"];
          overall_status?: Database["public"]["Enums"]["k6_assessment_status"];
          students_explained_thinking: Database["public"]["Enums"]["assessment_response"];
          students_needing_support?: string | null;
          teacher_id: string;
          teacher_notes?: string | null;
          updated_at?: string;
        };
        Update: {
          activity_completed?: Database["public"]["Enums"]["assessment_response"];
          class_id?: string;
          created_at?: string;
          id?: string;
          lesson_id?: string;
          objective_met?: Database["public"]["Enums"]["assessment_response"];
          overall_status?: Database["public"]["Enums"]["k6_assessment_status"];
          students_explained_thinking?: Database["public"]["Enums"]["assessment_response"];
          students_needing_support?: string | null;
          teacher_id?: string;
          teacher_notes?: string | null;
          updated_at?: string;
        };
      };
      classes: {
        Row: {
          academic_year_id: string | null;
          created_at: string;
          delivery_mode: Database["public"]["Enums"]["delivery_mode"];
          grade_band: Database["public"]["Enums"]["grade_band"];
          grade_level: number;
          id: string;
          is_active: boolean;
          name: string;
          primary_teacher_id: string | null;
          school_id: string;
          updated_at: string;
        };
        Insert: {
          academic_year_id?: string | null;
          created_at?: string;
          delivery_mode: Database["public"]["Enums"]["delivery_mode"];
          grade_band: Database["public"]["Enums"]["grade_band"];
          grade_level: number;
          id?: string;
          is_active?: boolean;
          name: string;
          primary_teacher_id?: string | null;
          school_id: string;
          updated_at?: string;
        };
        Update: {
          academic_year_id?: string | null;
          created_at?: string;
          delivery_mode?: Database["public"]["Enums"]["delivery_mode"];
          grade_band?: Database["public"]["Enums"]["grade_band"];
          grade_level?: number;
          id?: string;
          is_active?: boolean;
          name?: string;
          primary_teacher_id?: string | null;
          school_id?: string;
          updated_at?: string;
        };
      };
      curriculum_units: {
        Row: {
          created_at: string;
          description: string | null;
          grade_band: Database["public"]["Enums"]["grade_band"];
          id: string;
          is_active: boolean;
          sequence_order: number;
          title: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          grade_band: Database["public"]["Enums"]["grade_band"];
          id?: string;
          is_active?: boolean;
          sequence_order?: number;
          title: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          grade_band?: Database["public"]["Enums"]["grade_band"];
          id?: string;
          is_active?: boolean;
          sequence_order?: number;
          title?: string;
          updated_at?: string;
        };
      };
      lessons: {
        Row: {
          created_at: string;
          curriculum_unit_id: string;
          estimated_minutes: number | null;
          grade_band: Database["public"]["Enums"]["grade_band"];
          id: string;
          is_active: boolean;
          sequence_order: number;
          summary: string | null;
          title: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          curriculum_unit_id: string;
          estimated_minutes?: number | null;
          grade_band: Database["public"]["Enums"]["grade_band"];
          id?: string;
          is_active?: boolean;
          sequence_order?: number;
          summary?: string | null;
          title: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          curriculum_unit_id?: string;
          estimated_minutes?: number | null;
          grade_band?: Database["public"]["Enums"]["grade_band"];
          id?: string;
          is_active?: boolean;
          sequence_order?: number;
          summary?: string | null;
          title?: string;
          updated_at?: string;
        };
      };
      lesson_resources: {
        Row: {
          content: string | null;
          created_at: string;
          description: string | null;
          file_url: string | null;
          id: string;
          lesson_id: string;
          resource_type: Database["public"]["Enums"]["lesson_resource_type"];
          title: string;
          updated_at: string;
        };
        Insert: {
          content?: string | null;
          created_at?: string;
          description?: string | null;
          file_url?: string | null;
          id?: string;
          lesson_id: string;
          resource_type: Database["public"]["Enums"]["lesson_resource_type"];
          title: string;
          updated_at?: string;
        };
        Update: {
          content?: string | null;
          created_at?: string;
          description?: string | null;
          file_url?: string | null;
          id?: string;
          lesson_id?: string;
          resource_type?: Database["public"]["Enums"]["lesson_resource_type"];
          title?: string;
          updated_at?: string;
        };
      };
      profiles: {
        Row: {
          auth_user_id: string | null;
          created_at: string;
          email: string | null;
          full_name: string;
          id: string;
          is_active: boolean;
          role: Database["public"]["Enums"]["app_role"];
          school_id: string | null;
          updated_at: string;
        };
        Insert: {
          auth_user_id?: string | null;
          created_at?: string;
          email?: string | null;
          full_name: string;
          id?: string;
          is_active?: boolean;
          role: Database["public"]["Enums"]["app_role"];
          school_id?: string | null;
          updated_at?: string;
        };
        Update: {
          auth_user_id?: string | null;
          created_at?: string;
          email?: string | null;
          full_name?: string;
          id?: string;
          is_active?: boolean;
          role?: Database["public"]["Enums"]["app_role"];
          school_id?: string | null;
          updated_at?: string;
        };
      };
      rubric_criteria: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          label: string;
          max_score: number;
          rubric_id: string;
          sequence_order: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          label: string;
          max_score?: number;
          rubric_id: string;
          sequence_order?: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          label?: string;
          max_score?: number;
          rubric_id?: string;
          sequence_order?: number;
          updated_at?: string;
        };
      };
      rubrics: {
        Row: {
          created_at: string;
          created_by_profile_id: string | null;
          description: string | null;
          grade_band: Database["public"]["Enums"]["grade_band"];
          id: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          created_by_profile_id?: string | null;
          description?: string | null;
          grade_band?: Database["public"]["Enums"]["grade_band"];
          id?: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          created_by_profile_id?: string | null;
          description?: string | null;
          grade_band?: Database["public"]["Enums"]["grade_band"];
          id?: string;
          title?: string;
          updated_at?: string;
        };
      };
      schools: {
        Row: {
          country_code: string | null;
          created_at: string;
          id: string;
          name: string;
          region: string | null;
          status: string;
          updated_at: string;
        };
        Insert: {
          country_code?: string | null;
          created_at?: string;
          id?: string;
          name: string;
          region?: string | null;
          status?: string;
          updated_at?: string;
        };
        Update: {
          country_code?: string | null;
          created_at?: string;
          id?: string;
          name?: string;
          region?: string | null;
          status?: string;
          updated_at?: string;
        };
      };
      student_class_enrollments: {
        Row: {
          class_id: string;
          created_at: string;
          id: string;
          status: string;
          student_profile_id: string;
        };
        Insert: {
          class_id: string;
          created_at?: string;
          id?: string;
          status?: string;
          student_profile_id: string;
        };
        Update: {
          class_id?: string;
          created_at?: string;
          id?: string;
          status?: string;
          student_profile_id?: string;
        };
      };
      student_lesson_progress: {
        Row: {
          class_id: string;
          completed_at: string | null;
          created_at: string;
          id: string;
          last_activity_at: string | null;
          lesson_id: string;
          status: Database["public"]["Enums"]["progress_status"];
          student_profile_id: string;
          updated_at: string;
        };
        Insert: {
          class_id: string;
          completed_at?: string | null;
          created_at?: string;
          id?: string;
          last_activity_at?: string | null;
          lesson_id: string;
          status?: Database["public"]["Enums"]["progress_status"];
          student_profile_id: string;
          updated_at?: string;
        };
        Update: {
          class_id?: string;
          completed_at?: string | null;
          created_at?: string;
          id?: string;
          last_activity_at?: string | null;
          lesson_id?: string;
          status?: Database["public"]["Enums"]["progress_status"];
          student_profile_id?: string;
          updated_at?: string;
        };
      };
      student_profiles: {
        Row: {
          created_at: string;
          external_student_ref: string | null;
          grade_band: Database["public"]["Enums"]["grade_band"];
          profile_id: string;
          school_id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          external_student_ref?: string | null;
          grade_band?: Database["public"]["Enums"]["grade_band"];
          profile_id: string;
          school_id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          external_student_ref?: string | null;
          grade_band?: Database["public"]["Enums"]["grade_band"];
          profile_id?: string;
          school_id?: string;
          updated_at?: string;
        };
      };
      submission_feedback: {
        Row: {
          created_at: string;
          id: string;
          next_steps: string | null;
          overall_score: number | null;
          published_at: string | null;
          submission_id: string;
          summary: string | null;
          teacher_profile_id: string | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          next_steps?: string | null;
          overall_score?: number | null;
          published_at?: string | null;
          submission_id: string;
          summary?: string | null;
          teacher_profile_id?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          next_steps?: string | null;
          overall_score?: number | null;
          published_at?: string | null;
          submission_id?: string;
          summary?: string | null;
          teacher_profile_id?: string | null;
          updated_at?: string;
        };
      };
      submission_rubric_scores: {
        Row: {
          comments: string | null;
          created_at: string;
          feedback_id: string;
          id: string;
          rubric_criterion_id: string;
          score: number;
          updated_at: string;
        };
        Insert: {
          comments?: string | null;
          created_at?: string;
          feedback_id: string;
          id?: string;
          rubric_criterion_id: string;
          score: number;
          updated_at?: string;
        };
        Update: {
          comments?: string | null;
          created_at?: string;
          feedback_id?: string;
          id?: string;
          rubric_criterion_id?: string;
          score?: number;
          updated_at?: string;
        };
      };
      teacher_class_assignments: {
        Row: {
          assignment_role: string;
          class_id: string;
          created_at: string;
          id: string;
          teacher_profile_id: string;
        };
        Insert: {
          assignment_role?: string;
          class_id: string;
          created_at?: string;
          id?: string;
          teacher_profile_id: string;
        };
        Update: {
          assignment_role?: string;
          class_id?: string;
          created_at?: string;
          id?: string;
          teacher_profile_id?: string;
        };
      };
      teacher_profiles: {
        Row: {
          created_at: string;
          profile_id: string;
          supports_grades_7_to_12: boolean;
          supports_k_to_6: boolean;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          profile_id: string;
          supports_grades_7_to_12?: boolean;
          supports_k_to_6?: boolean;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          profile_id?: string;
          supports_grades_7_to_12?: boolean;
          supports_k_to_6?: boolean;
          updated_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: {
      ensure_k6_class_lesson_assessment_scope: {
        Args: Record<string, never>;
        Returns: unknown;
      };
      ensure_student_account_class_scope: {
        Args: Record<string, never>;
        Returns: unknown;
      };
      set_updated_at: {
        Args: Record<string, never>;
        Returns: unknown;
      };
    };
    Enums: {
      app_role: "connected_mena_admin" | "school_admin" | "academic_coordinator" | "teacher" | "student";
      assessment_response: "yes" | "partly" | "no";
      assignment_status: "draft" | "published" | "archived";
      delivery_mode: "teacher_led" | "student_account" | "hybrid";
      grade_band: "k_to_6" | "grades_7_to_12";
      k6_assessment_status: "completed" | "needs_review";
      lesson_resource_type:
        | "teacher_guide"
        | "worksheet"
        | "printable_material"
        | "smartboard_activity"
        | "support_activity"
        | "extension_activity"
        | "assessment"
        | "rubric"
        | "student_activity";
      progress_status: "not_started" | "in_progress" | "completed";
      submission_status: "draft" | "submitted" | "returned";
    };
    CompositeTypes: Record<string, never>;
  };
};
