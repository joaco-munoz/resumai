export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string | null
          created_by: string | null
          email: string
          id: string
          is_active: boolean | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          email: string
          id?: string
          is_active?: boolean | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          user_id?: string | null
        }
        Relationships: []
      }
      business_metrics: {
        Row: {
          active_users: number | null
          arr: number | null
          avg_revenue_per_user: number | null
          churn_rate: number | null
          churned_users: number | null
          conversion_rate: number | null
          created_at: string
          daily_active_users: number | null
          daily_signups: number | null
          date: string
          free_users: number | null
          id: string
          mrr: number | null
          new_signups: number | null
          pro_users: number | null
          total_cvs_created: number | null
          total_jobs_matched: number | null
          total_payments_today: number | null
          total_revenue: number | null
          total_users: number | null
        }
        Insert: {
          active_users?: number | null
          arr?: number | null
          avg_revenue_per_user?: number | null
          churn_rate?: number | null
          churned_users?: number | null
          conversion_rate?: number | null
          created_at?: string
          daily_active_users?: number | null
          daily_signups?: number | null
          date: string
          free_users?: number | null
          id?: string
          mrr?: number | null
          new_signups?: number | null
          pro_users?: number | null
          total_cvs_created?: number | null
          total_jobs_matched?: number | null
          total_payments_today?: number | null
          total_revenue?: number | null
          total_users?: number | null
        }
        Update: {
          active_users?: number | null
          arr?: number | null
          avg_revenue_per_user?: number | null
          churn_rate?: number | null
          churned_users?: number | null
          conversion_rate?: number | null
          created_at?: string
          daily_active_users?: number | null
          daily_signups?: number | null
          date?: string
          free_users?: number | null
          id?: string
          mrr?: number | null
          new_signups?: number | null
          pro_users?: number | null
          total_cvs_created?: number | null
          total_jobs_matched?: number | null
          total_payments_today?: number | null
          total_revenue?: number | null
          total_users?: number | null
        }
        Relationships: []
      }
      cv_job_matches: {
        Row: {
          created_at: string
          cv_id: string
          id: string
          job_id: string
          match_details: Json | null
          match_score: number | null
        }
        Insert: {
          created_at?: string
          cv_id: string
          id?: string
          job_id: string
          match_details?: Json | null
          match_score?: number | null
        }
        Update: {
          created_at?: string
          cv_id?: string
          id?: string
          job_id?: string
          match_details?: Json | null
          match_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cv_job_matches_cv_id_fkey"
            columns: ["cv_id"]
            isOneToOne: false
            referencedRelation: "cvs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cv_job_matches_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_descriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      cvs: {
        Row: {
          ai_feedback: Json | null
          ai_score: number | null
          content: Json | null
          created_at: string
          cv_source: string
          download_count: number | null
          id: string
          is_primary: boolean | null
          is_public: boolean | null
          last_updated: string | null
          pdf_url: string | null
          status: Database["public"]["Enums"]["cv_status"] | null
          target_industry: string | null
          target_job_title: string | null
          template_name: string | null
          title: string
          user_id: string
          view_count: number | null
        }
        Insert: {
          ai_feedback?: Json | null
          ai_score?: number | null
          content?: Json | null
          created_at?: string
          cv_source?: string
          download_count?: number | null
          id?: string
          is_primary?: boolean | null
          is_public?: boolean | null
          last_updated?: string | null
          pdf_url?: string | null
          status?: Database["public"]["Enums"]["cv_status"] | null
          target_industry?: string | null
          target_job_title?: string | null
          template_name?: string | null
          title: string
          user_id: string
          view_count?: number | null
        }
        Update: {
          ai_feedback?: Json | null
          ai_score?: number | null
          content?: Json | null
          created_at?: string
          cv_source?: string
          download_count?: number | null
          id?: string
          is_primary?: boolean | null
          is_public?: boolean | null
          last_updated?: string | null
          pdf_url?: string | null
          status?: Database["public"]["Enums"]["cv_status"] | null
          target_industry?: string | null
          target_job_title?: string | null
          template_name?: string | null
          title?: string
          user_id?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cvs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_usage: {
        Row: {
          created_at: string
          feature_name: string
          id: string
          last_used: string | null
          usage_count: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          feature_name: string
          id?: string
          last_used?: string | null
          usage_count?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          feature_name?: string
          id?: string
          last_used?: string | null
          usage_count?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feature_usage_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      job_applications: {
        Row: {
          applied_date: string | null
          cover_letter: string | null
          created_at: string
          cv_id: string | null
          id: string
          interview_date: string | null
          job_id: string
          notes: string | null
          status: Database["public"]["Enums"]["application_status"] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          applied_date?: string | null
          cover_letter?: string | null
          created_at?: string
          cv_id?: string | null
          id?: string
          interview_date?: string | null
          job_id: string
          notes?: string | null
          status?: Database["public"]["Enums"]["application_status"] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          applied_date?: string | null
          cover_letter?: string | null
          created_at?: string
          cv_id?: string | null
          id?: string
          interview_date?: string | null
          job_id?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["application_status"] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_applications_cv_id_fkey"
            columns: ["cv_id"]
            isOneToOne: false
            referencedRelation: "cvs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_descriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_applications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      job_applications_tracking: {
        Row: {
          applied_date: string
          company: string
          created_at: string
          cv_id: string | null
          id: string
          interview_date: string | null
          interview_link: string | null
          job_type: string | null
          location: string | null
          notes: string | null
          position: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          applied_date?: string
          company: string
          created_at?: string
          cv_id?: string | null
          id?: string
          interview_date?: string | null
          interview_link?: string | null
          job_type?: string | null
          location?: string | null
          notes?: string | null
          position: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          applied_date?: string
          company?: string
          created_at?: string
          cv_id?: string | null
          id?: string
          interview_date?: string | null
          interview_link?: string | null
          job_type?: string | null
          location?: string | null
          notes?: string | null
          position?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_applications_tracking_cv_id_fkey"
            columns: ["cv_id"]
            isOneToOne: false
            referencedRelation: "cvs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_descriptions: {
        Row: {
          benefits: Json | null
          company: string | null
          created_at: string
          currency: string | null
          description: string
          experience_level: string | null
          expires_date: string | null
          id: string
          is_active: boolean | null
          job_type: string | null
          job_url: string | null
          location: string | null
          posted_date: string | null
          remote_allowed: boolean | null
          requirements: Json | null
          salary_max: number | null
          salary_min: number | null
          skills_required: Json | null
          source: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          benefits?: Json | null
          company?: string | null
          created_at?: string
          currency?: string | null
          description: string
          experience_level?: string | null
          expires_date?: string | null
          id?: string
          is_active?: boolean | null
          job_type?: string | null
          job_url?: string | null
          location?: string | null
          posted_date?: string | null
          remote_allowed?: boolean | null
          requirements?: Json | null
          salary_max?: number | null
          salary_min?: number | null
          skills_required?: Json | null
          source?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          benefits?: Json | null
          company?: string | null
          created_at?: string
          currency?: string | null
          description?: string
          experience_level?: string | null
          expires_date?: string | null
          id?: string
          is_active?: boolean | null
          job_type?: string | null
          job_url?: string | null
          location?: string | null
          posted_date?: string | null
          remote_allowed?: boolean | null
          requirements?: Json | null
          salary_max?: number | null
          salary_min?: number | null
          skills_required?: Json | null
          source?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_descriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      nps_responses: {
        Row: {
          created_at: string | null
          feedback: string | null
          id: string
          score: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          feedback?: string | null
          id?: string
          score: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          feedback?: string | null
          id?: string
          score?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          currency: string | null
          description: string | null
          failed_at: string | null
          failure_reason: string | null
          flow_order_number: string | null
          flow_payment_date: string | null
          flow_token: string | null
          id: string
          invoice_url: string | null
          payment_method: Database["public"]["Enums"]["payment_method"]
          processed_at: string | null
          refund_amount: number | null
          refunded_at: string | null
          status: Database["public"]["Enums"]["payment_status"]
          stripe_payment_id: string | null
          subscription_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string | null
          description?: string | null
          failed_at?: string | null
          failure_reason?: string | null
          flow_order_number?: string | null
          flow_payment_date?: string | null
          flow_token?: string | null
          id?: string
          invoice_url?: string | null
          payment_method: Database["public"]["Enums"]["payment_method"]
          processed_at?: string | null
          refund_amount?: number | null
          refunded_at?: string | null
          status: Database["public"]["Enums"]["payment_status"]
          stripe_payment_id?: string | null
          subscription_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string | null
          description?: string | null
          failed_at?: string | null
          failure_reason?: string | null
          flow_order_number?: string | null
          flow_payment_date?: string | null
          flow_token?: string | null
          id?: string
          invoice_url?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"]
          processed_at?: string | null
          refund_amount?: number | null
          refunded_at?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          stripe_payment_id?: string | null
          subscription_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          acquisition_channel:
            | Database["public"]["Enums"]["acquisition_channel"]
            | null
          acquisition_date: string | null
          avatar_url: string | null
          bio: string | null
          churn_reason: string | null
          churned_at: string | null
          city: string | null
          company: string | null
          country: string | null
          created_at: string
          email: string | null
          first_login_date: string | null
          full_name: string | null
          id: string
          industry: string | null
          is_premium: boolean | null
          job_title: string | null
          last_login_date: string | null
          last_payment_date: string | null
          linkedin_url: string | null
          onboarding_completed: boolean | null
          phone: string | null
          premium_expires_at: string | null
          referral_code: string | null
          referred_by_user_id: string | null
          subscription_tier:
            | Database["public"]["Enums"]["subscription_tier"]
            | null
          total_logins: number | null
          total_revenue: number | null
          trial_expires_at: string | null
          trial_started_at: string | null
          updated_at: string
          user_status: Database["public"]["Enums"]["user_status"] | null
          website_url: string | null
          years_experience: number | null
        }
        Insert: {
          acquisition_channel?:
            | Database["public"]["Enums"]["acquisition_channel"]
            | null
          acquisition_date?: string | null
          avatar_url?: string | null
          bio?: string | null
          churn_reason?: string | null
          churned_at?: string | null
          city?: string | null
          company?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          first_login_date?: string | null
          full_name?: string | null
          id: string
          industry?: string | null
          is_premium?: boolean | null
          job_title?: string | null
          last_login_date?: string | null
          last_payment_date?: string | null
          linkedin_url?: string | null
          onboarding_completed?: boolean | null
          phone?: string | null
          premium_expires_at?: string | null
          referral_code?: string | null
          referred_by_user_id?: string | null
          subscription_tier?:
            | Database["public"]["Enums"]["subscription_tier"]
            | null
          total_logins?: number | null
          total_revenue?: number | null
          trial_expires_at?: string | null
          trial_started_at?: string | null
          updated_at?: string
          user_status?: Database["public"]["Enums"]["user_status"] | null
          website_url?: string | null
          years_experience?: number | null
        }
        Update: {
          acquisition_channel?:
            | Database["public"]["Enums"]["acquisition_channel"]
            | null
          acquisition_date?: string | null
          avatar_url?: string | null
          bio?: string | null
          churn_reason?: string | null
          churned_at?: string | null
          city?: string | null
          company?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          first_login_date?: string | null
          full_name?: string | null
          id?: string
          industry?: string | null
          is_premium?: boolean | null
          job_title?: string | null
          last_login_date?: string | null
          last_payment_date?: string | null
          linkedin_url?: string | null
          onboarding_completed?: boolean | null
          phone?: string | null
          premium_expires_at?: string | null
          referral_code?: string | null
          referred_by_user_id?: string | null
          subscription_tier?:
            | Database["public"]["Enums"]["subscription_tier"]
            | null
          total_logins?: number | null
          total_revenue?: number | null
          trial_expires_at?: string | null
          trial_started_at?: string | null
          updated_at?: string
          user_status?: Database["public"]["Enums"]["user_status"] | null
          website_url?: string | null
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_referred_by_user_id_fkey"
            columns: ["referred_by_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          cancel_reason: string | null
          cancelled_at: string | null
          created_at: string
          currency: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          price_per_month: number | null
          provider: string | null
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          tier: Database["public"]["Enums"]["subscription_tier"]
          trial_end: string | null
          trial_start: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_reason?: string | null
          cancelled_at?: string | null
          created_at?: string
          currency?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          price_per_month?: number | null
          provider?: string | null
          status: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier: Database["public"]["Enums"]["subscription_tier"]
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_reason?: string | null
          cancelled_at?: string | null
          created_at?: string
          currency?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          price_per_month?: number | null
          provider?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier?: Database["public"]["Enums"]["subscription_tier"]
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_activity_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: unknown | null
          metadata: Json | null
          resource_id: string | null
          resource_type: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_usage: {
        Row: {
          created_at: string
          feature_type: string
          id: string
          period_end: string
          period_start: string
          updated_at: string
          usage_count: number
          user_id: string
        }
        Insert: {
          created_at?: string
          feature_type: string
          id?: string
          period_end?: string
          period_start?: string
          updated_at?: string
          usage_count?: number
          user_id: string
        }
        Update: {
          created_at?: string
          feature_type?: string
          id?: string
          period_end?: string
          period_start?: string
          updated_at?: string
          usage_count?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_usage_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_churn_rate: {
        Args: { period_days?: number }
        Returns: number
      }
      calculate_mrr: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      can_use_feature: {
        Args: { p_user_id: string; p_feature_type: string }
        Returns: boolean
      }
      get_user_limits: {
        Args: { user_plan: string }
        Returns: Json
      }
      increment_feature_usage: {
        Args: { p_user_id: string; p_feature_type: string }
        Returns: boolean
      }
      is_admin: {
        Args: { user_id?: string }
        Returns: boolean
      }
      log_user_activity: {
        Args: {
          p_user_id: string
          p_action: string
          p_resource_type?: string
          p_resource_id?: string
          p_metadata?: Json
        }
        Returns: undefined
      }
      update_daily_metrics: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      acquisition_channel:
        | "organic"
        | "google_ads"
        | "facebook_ads"
        | "referral"
        | "direct"
        | "linkedin"
        | "other"
      application_status:
        | "pending"
        | "applied"
        | "interview"
        | "rejected"
        | "accepted"
      cv_status: "draft" | "completed" | "published" | "archived"
      payment_method: "stripe" | "paypal" | "bank_transfer" | "other"
      payment_status:
        | "pending"
        | "completed"
        | "failed"
        | "refunded"
        | "cancelled"
      subscription_tier: "free" | "basic" | "premium" | "enterprise" | "pro"
      user_status: "active" | "inactive" | "churned" | "at_risk"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      acquisition_channel: [
        "organic",
        "google_ads",
        "facebook_ads",
        "referral",
        "direct",
        "linkedin",
        "other",
      ],
      application_status: [
        "pending",
        "applied",
        "interview",
        "rejected",
        "accepted",
      ],
      cv_status: ["draft", "completed", "published", "archived"],
      payment_method: ["stripe", "paypal", "bank_transfer", "other"],
      payment_status: [
        "pending",
        "completed",
        "failed",
        "refunded",
        "cancelled",
      ],
      subscription_tier: ["free", "basic", "premium", "enterprise", "pro"],
      user_status: ["active", "inactive", "churned", "at_risk"],
    },
  },
} as const
