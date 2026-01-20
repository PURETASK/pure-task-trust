export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      addresses: {
        Row: {
          city: string
          country: string
          created_at: string
          id: string
          is_default: boolean
          label: string | null
          lat: number | null
          line1: string
          line2: string | null
          lng: number | null
          postal_code: string | null
          state: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          city: string
          country?: string
          created_at?: string
          id?: string
          is_default?: boolean
          label?: string | null
          lat?: number | null
          line1: string
          line2?: string | null
          lng?: number | null
          postal_code?: string | null
          state?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          city?: string
          country?: string
          created_at?: string
          id?: string
          is_default?: boolean
          label?: string | null
          lat?: number | null
          line1?: string
          line2?: string | null
          lng?: number | null
          postal_code?: string | null
          state?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      admin_audit_log: {
        Row: {
          action: string
          admin_user_id: string
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          ip_address: unknown
          metadata: Json | null
          new_values: Json | null
          old_values: Json | null
          reason: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          admin_user_id: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          reason?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          admin_user_id?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          reason?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          is_active: boolean
          password_hash: string | null
          role: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          is_active?: boolean
          password_hash?: string | null
          role?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          is_active?: boolean
          password_hash?: string | null
          role?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          action: string
          actor_id: string | null
          actor_type: Database["public"]["Enums"]["actor_type_enum"]
          created_at: string
          details: Json | null
          id: string
          target_id: string | null
          target_table: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          actor_type: Database["public"]["Enums"]["actor_type_enum"]
          created_at?: string
          details?: Json | null
          id?: string
          target_id?: string | null
          target_table?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          actor_type?: Database["public"]["Enums"]["actor_type_enum"]
          created_at?: string
          details?: Json | null
          id?: string
          target_id?: string | null
          target_table?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          actor_type: string
          created_at: string
          id: string
          ip_address: string | null
          metadata: Json | null
          new_value: Json | null
          old_value: Json | null
          resource_id: string | null
          resource_type: string
          user_agent: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          actor_type: string
          created_at?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          new_value?: Json | null
          old_value?: Json | null
          resource_id?: string | null
          resource_type: string
          user_agent?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          actor_type?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          new_value?: Json | null
          old_value?: Json | null
          resource_id?: string | null
          resource_type?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      availability_blocks: {
        Row: {
          cleaner_id: string
          created_at: string
          day_of_week: number
          end_time: string
          id: number
          is_active: boolean
          start_time: string
          updated_at: string
        }
        Insert: {
          cleaner_id: string
          created_at?: string
          day_of_week: number
          end_time: string
          id?: number
          is_active?: boolean
          start_time: string
          updated_at?: string
        }
        Update: {
          cleaner_id?: string
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: number
          is_active?: boolean
          start_time?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "availability_blocks_cleaner_id_fkey"
            columns: ["cleaner_id"]
            isOneToOne: false
            referencedRelation: "cleaner_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      background_checks: {
        Row: {
          cleaner_id: string
          completed_at: string | null
          created_at: string
          expires_at: string | null
          id: string
          metadata: Json | null
          provider: string
          provider_id: string | null
          report_url: string | null
          status: string
          updated_at: string
        }
        Insert: {
          cleaner_id: string
          completed_at?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          metadata?: Json | null
          provider?: string
          provider_id?: string | null
          report_url?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          cleaner_id?: string
          completed_at?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          metadata?: Json | null
          provider?: string
          provider_id?: string | null
          report_url?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "background_checks_cleaner_id_fkey"
            columns: ["cleaner_id"]
            isOneToOne: false
            referencedRelation: "cleaner_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      backup_runs: {
        Row: {
          id: string
          metadata: Json | null
          notes: string | null
          run_at: string
          status: string
        }
        Insert: {
          id?: string
          metadata?: Json | null
          notes?: string | null
          run_at?: string
          status: string
        }
        Update: {
          id?: string
          metadata?: Json | null
          notes?: string | null
          run_at?: string
          status?: string
        }
        Relationships: []
      }
      backups: {
        Row: {
          created_at: string
          data: Json
          id: string
          label: string
          metadata: Json
        }
        Insert: {
          created_at?: string
          data: Json
          id?: string
          label: string
          metadata?: Json
        }
        Update: {
          created_at?: string
          data?: Json
          id?: string
          label?: string
          metadata?: Json
        }
        Relationships: []
      }
      blackout_periods: {
        Row: {
          cleaner_id: string
          created_at: string
          end_ts: string
          id: number
          reason: string | null
          start_ts: string
        }
        Insert: {
          cleaner_id: string
          created_at?: string
          end_ts: string
          id?: number
          reason?: string | null
          start_ts: string
        }
        Update: {
          cleaner_id?: string
          created_at?: string
          end_ts?: string
          id?: number
          reason?: string | null
          start_ts?: string
        }
        Relationships: [
          {
            foreignKeyName: "blackout_periods_cleaner_id_fkey"
            columns: ["cleaner_id"]
            isOneToOne: false
            referencedRelation: "cleaner_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bundle_offers: {
        Row: {
          created_at: string
          credits_price: number
          current_uses: number | null
          description: string | null
          discount_percent: number | null
          hours_included: number
          id: string
          is_active: boolean
          max_uses: number | null
          name: string
          updated_at: string
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          created_at?: string
          credits_price: number
          current_uses?: number | null
          description?: string | null
          discount_percent?: number | null
          hours_included?: number
          id?: string
          is_active?: boolean
          max_uses?: number | null
          name: string
          updated_at?: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          created_at?: string
          credits_price?: number
          current_uses?: number | null
          description?: string | null
          discount_percent?: number | null
          hours_included?: number
          id?: string
          is_active?: boolean
          max_uses?: number | null
          name?: string
          updated_at?: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
      calendar_connections: {
        Row: {
          access_token: string
          created_at: string
          email: string | null
          external_id: string
          id: number
          last_synced_at: string | null
          provider: string
          refresh_token: string | null
          sync_enabled: boolean
          token_expires_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token: string
          created_at?: string
          email?: string | null
          external_id: string
          id?: number
          last_synced_at?: string | null
          provider: string
          refresh_token?: string | null
          sync_enabled?: boolean
          token_expires_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string
          created_at?: string
          email?: string | null
          external_id?: string
          id?: number
          last_synced_at?: string | null
          provider?: string
          refresh_token?: string | null
          sync_enabled?: boolean
          token_expires_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      calendar_events: {
        Row: {
          connection_id: number
          event_type: string
          external_event_id: string
          id: number
          job_id: string | null
          synced_at: string
        }
        Insert: {
          connection_id: number
          event_type?: string
          external_event_id: string
          id?: number
          job_id?: string | null
          synced_at?: string
        }
        Update: {
          connection_id?: number
          event_type?: string
          external_event_id?: string
          id?: number
          job_id?: string | null
          synced_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "calendar_connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      cancellation_events: {
        Row: {
          after_reschedule_declined: boolean
          bonus_credits_to_client: number
          bucket: string | null
          cancelled_by: string
          cleaner_comp_credits: number
          cleaner_id: string | null
          client_id: string | null
          created_at: string
          fee_credits: number
          fee_pct: number
          grace_used: boolean
          hours_before_start: number | null
          id: number
          is_emergency: boolean
          job_id: string
          job_status_at_cancellation: string | null
          platform_comp_credits: number
          reason_code: string | null
          refund_credits: number
          t_cancel: string
          type: string | null
        }
        Insert: {
          after_reschedule_declined?: boolean
          bonus_credits_to_client?: number
          bucket?: string | null
          cancelled_by: string
          cleaner_comp_credits?: number
          cleaner_id?: string | null
          client_id?: string | null
          created_at?: string
          fee_credits?: number
          fee_pct?: number
          grace_used?: boolean
          hours_before_start?: number | null
          id?: number
          is_emergency?: boolean
          job_id: string
          job_status_at_cancellation?: string | null
          platform_comp_credits?: number
          reason_code?: string | null
          refund_credits?: number
          t_cancel: string
          type?: string | null
        }
        Update: {
          after_reschedule_declined?: boolean
          bonus_credits_to_client?: number
          bucket?: string | null
          cancelled_by?: string
          cleaner_comp_credits?: number
          cleaner_id?: string | null
          client_id?: string | null
          created_at?: string
          fee_credits?: number
          fee_pct?: number
          grace_used?: boolean
          hours_before_start?: number | null
          id?: number
          is_emergency?: boolean
          job_id?: string
          job_status_at_cancellation?: string | null
          platform_comp_credits?: number
          reason_code?: string | null
          refund_credits?: number
          t_cancel?: string
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cancellation_events_cleaner_id_fkey"
            columns: ["cleaner_id"]
            isOneToOne: false
            referencedRelation: "cleaner_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cancellation_events_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cancellation_events_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      cancellation_records: {
        Row: {
          cancellation_time: string
          cancelled_by: string
          cancelled_by_role: string
          created_at: string
          fee_percent: number | null
          hours_before: number
          id: string
          is_grace_period: boolean
          job_id: string
          penalty_applied: boolean
          penalty_credits: number | null
          refund_credits: number | null
          scheduled_start: string
        }
        Insert: {
          cancellation_time?: string
          cancelled_by: string
          cancelled_by_role: string
          created_at?: string
          fee_percent?: number | null
          hours_before: number
          id?: string
          is_grace_period?: boolean
          job_id: string
          penalty_applied?: boolean
          penalty_credits?: number | null
          refund_credits?: number | null
          scheduled_start: string
        }
        Update: {
          cancellation_time?: string
          cancelled_by?: string
          cancelled_by_role?: string
          created_at?: string
          fee_percent?: number | null
          hours_before?: number
          id?: string
          is_grace_period?: boolean
          job_id?: string
          penalty_applied?: boolean
          penalty_credits?: number | null
          refund_credits?: number | null
          scheduled_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "cancellation_records_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      cities: {
        Row: {
          country_code: string
          created_at: string
          id: number
          is_active: boolean
          name: string
          state_region: string | null
          timezone: string
        }
        Insert: {
          country_code?: string
          created_at?: string
          id?: number
          is_active?: boolean
          name: string
          state_region?: string | null
          timezone?: string
        }
        Update: {
          country_code?: string
          created_at?: string
          id?: number
          is_active?: boolean
          name?: string
          state_region?: string | null
          timezone?: string
        }
        Relationships: []
      }
      cleaner_additional_services: {
        Row: {
          cleaner_id: string
          created_at: string
          id: string
          is_enabled: boolean
          price: number
          service_id: string
          updated_at: string
        }
        Insert: {
          cleaner_id: string
          created_at?: string
          id?: string
          is_enabled?: boolean
          price: number
          service_id: string
          updated_at?: string
        }
        Update: {
          cleaner_id?: string
          created_at?: string
          id?: string
          is_enabled?: boolean
          price?: number
          service_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cleaner_additional_services_cleaner_id_fkey"
            columns: ["cleaner_id"]
            isOneToOne: false
            referencedRelation: "cleaner_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cleaner_availability: {
        Row: {
          cleaner_id: string
          created_at: string
          date: string | null
          day_of_week: number | null
          end_time_local: string | null
          id: string
          is_blocked: boolean
          metadata: Json | null
          notes: string | null
          recurrence_type: Database["public"]["Enums"]["availability_recurrence_enum"]
          start_time_local: string | null
          timezone: string | null
          updated_at: string
        }
        Insert: {
          cleaner_id: string
          created_at?: string
          date?: string | null
          day_of_week?: number | null
          end_time_local?: string | null
          id?: string
          is_blocked?: boolean
          metadata?: Json | null
          notes?: string | null
          recurrence_type?: Database["public"]["Enums"]["availability_recurrence_enum"]
          start_time_local?: string | null
          timezone?: string | null
          updated_at?: string
        }
        Update: {
          cleaner_id?: string
          created_at?: string
          date?: string | null
          day_of_week?: number | null
          end_time_local?: string | null
          id?: string
          is_blocked?: boolean
          metadata?: Json | null
          notes?: string | null
          recurrence_type?: Database["public"]["Enums"]["availability_recurrence_enum"]
          start_time_local?: string | null
          timezone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cleaner_availability_cleaner_id_fkey"
            columns: ["cleaner_id"]
            isOneToOne: false
            referencedRelation: "cleaner_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cleaner_boosts: {
        Row: {
          boost_type: string
          cleaner_id: string
          created_at: string
          credits_spent: number
          ends_at: string
          id: string
          jobs_during: number
          multiplier: number
          starts_at: string
          status: string
        }
        Insert: {
          boost_type?: string
          cleaner_id: string
          created_at?: string
          credits_spent: number
          ends_at: string
          id?: string
          jobs_during?: number
          multiplier?: number
          starts_at?: string
          status?: string
        }
        Update: {
          boost_type?: string
          cleaner_id?: string
          created_at?: string
          credits_spent?: number
          ends_at?: string
          id?: string
          jobs_during?: number
          multiplier?: number
          starts_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "cleaner_boosts_cleaner_id_fkey"
            columns: ["cleaner_id"]
            isOneToOne: false
            referencedRelation: "cleaner_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cleaner_custom_services: {
        Row: {
          cleaner_id: string
          created_at: string
          description: string | null
          id: string
          is_enabled: boolean
          name: string
          price: number
          updated_at: string
        }
        Insert: {
          cleaner_id: string
          created_at?: string
          description?: string | null
          id?: string
          is_enabled?: boolean
          name: string
          price: number
          updated_at?: string
        }
        Update: {
          cleaner_id?: string
          created_at?: string
          description?: string | null
          id?: string
          is_enabled?: boolean
          name?: string
          price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cleaner_custom_services_cleaner_id_fkey"
            columns: ["cleaner_id"]
            isOneToOne: false
            referencedRelation: "cleaner_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cleaner_earnings: {
        Row: {
          cleaner_id: string
          created_at: string
          gross_credits: number
          id: string
          job_id: string
          net_credits: number
          payout_id: string | null
          platform_fee_credits: number
        }
        Insert: {
          cleaner_id: string
          created_at?: string
          gross_credits: number
          id?: string
          job_id: string
          net_credits: number
          payout_id?: string | null
          platform_fee_credits?: number
        }
        Update: {
          cleaner_id?: string
          created_at?: string
          gross_credits?: number
          id?: string
          job_id?: string
          net_credits?: number
          payout_id?: string | null
          platform_fee_credits?: number
        }
        Relationships: [
          {
            foreignKeyName: "cleaner_earnings_cleaner_id_fkey"
            columns: ["cleaner_id"]
            isOneToOne: false
            referencedRelation: "cleaner_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cleaner_earnings_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      cleaner_events: {
        Row: {
          cleaner_id: string
          created_at: string
          event_type: Database["public"]["Enums"]["cleaner_event_type"]
          id: number
          job_id: string | null
          metadata: Json | null
          weight: number
        }
        Insert: {
          cleaner_id: string
          created_at?: string
          event_type: Database["public"]["Enums"]["cleaner_event_type"]
          id?: number
          job_id?: string | null
          metadata?: Json | null
          weight: number
        }
        Update: {
          cleaner_id?: string
          created_at?: string
          event_type?: Database["public"]["Enums"]["cleaner_event_type"]
          id?: number
          job_id?: string | null
          metadata?: Json | null
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "cleaner_events_cleaner_id_fkey"
            columns: ["cleaner_id"]
            isOneToOne: false
            referencedRelation: "cleaner_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cleaner_events_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      cleaner_flex_profiles: {
        Row: {
          badge_assigned_at: string | null
          badge_removed_at: string | null
          cleaner_id: string
          last_evaluated_at: string
          low_flexibility_active: boolean
          reasonable_declines_14d: number
          reasonable_declines_30d: number
        }
        Insert: {
          badge_assigned_at?: string | null
          badge_removed_at?: string | null
          cleaner_id: string
          last_evaluated_at?: string
          low_flexibility_active?: boolean
          reasonable_declines_14d?: number
          reasonable_declines_30d?: number
        }
        Update: {
          badge_assigned_at?: string | null
          badge_removed_at?: string | null
          cleaner_id?: string
          last_evaluated_at?: string
          low_flexibility_active?: boolean
          reasonable_declines_14d?: number
          reasonable_declines_30d?: number
        }
        Relationships: [
          {
            foreignKeyName: "cleaner_flex_profiles_cleaner_id_fkey"
            columns: ["cleaner_id"]
            isOneToOne: true
            referencedRelation: "cleaner_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cleaner_goals: {
        Row: {
          awarded_at: string | null
          cleaner_id: string
          created_at: string
          current_value: number
          goal_type: string
          id: number
          is_awarded: boolean
          month: string
          reward_credits: number
          target_value: number
        }
        Insert: {
          awarded_at?: string | null
          cleaner_id: string
          created_at?: string
          current_value?: number
          goal_type?: string
          id?: number
          is_awarded?: boolean
          month: string
          reward_credits: number
          target_value: number
        }
        Update: {
          awarded_at?: string | null
          cleaner_id?: string
          created_at?: string
          current_value?: number
          goal_type?: string
          id?: number
          is_awarded?: boolean
          month?: string
          reward_credits?: number
          target_value?: number
        }
        Relationships: [
          {
            foreignKeyName: "cleaner_goals_cleaner_id_fkey"
            columns: ["cleaner_id"]
            isOneToOne: false
            referencedRelation: "cleaner_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cleaner_metrics: {
        Row: {
          attended_jobs: number
          cleaner_id: string
          communication_ok_jobs: number
          completion_ok_jobs: number
          no_show_jobs: number
          on_time_checkins: number
          photo_compliant_jobs: number
          ratings_count: number
          ratings_sum: number
          total_jobs_window: number
          updated_at: string
        }
        Insert: {
          attended_jobs?: number
          cleaner_id: string
          communication_ok_jobs?: number
          completion_ok_jobs?: number
          no_show_jobs?: number
          on_time_checkins?: number
          photo_compliant_jobs?: number
          ratings_count?: number
          ratings_sum?: number
          total_jobs_window?: number
          updated_at?: string
        }
        Update: {
          attended_jobs?: number
          cleaner_id?: string
          communication_ok_jobs?: number
          completion_ok_jobs?: number
          no_show_jobs?: number
          on_time_checkins?: number
          photo_compliant_jobs?: number
          ratings_count?: number
          ratings_sum?: number
          total_jobs_window?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cleaner_metrics_cleaner_id_fkey"
            columns: ["cleaner_id"]
            isOneToOne: true
            referencedRelation: "cleaner_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cleaner_no_shows: {
        Row: {
          bonus_credits: number
          cleaner_id: string
          client_id: string
          created_at: string
          id: string
          job_id: string
          processed: boolean
        }
        Insert: {
          bonus_credits?: number
          cleaner_id: string
          client_id: string
          created_at?: string
          id?: string
          job_id: string
          processed?: boolean
        }
        Update: {
          bonus_credits?: number
          cleaner_id?: string
          client_id?: string
          created_at?: string
          id?: string
          job_id?: string
          processed?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "cleaner_no_shows_cleaner_id_fkey"
            columns: ["cleaner_id"]
            isOneToOne: false
            referencedRelation: "cleaner_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cleaner_no_shows_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cleaner_no_shows_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      cleaner_preferences: {
        Row: {
          accepts_deep_clean: boolean
          accepts_move_out: boolean
          accepts_pets: boolean
          cleaner_id: string
          created_at: string
          has_own_supplies: boolean
          has_vehicle: boolean
          id: string
          max_job_duration_h: number
          max_jobs_per_day: number
          min_job_duration_h: number
          notes: string | null
          updated_at: string
        }
        Insert: {
          accepts_deep_clean?: boolean
          accepts_move_out?: boolean
          accepts_pets?: boolean
          cleaner_id: string
          created_at?: string
          has_own_supplies?: boolean
          has_vehicle?: boolean
          id?: string
          max_job_duration_h?: number
          max_jobs_per_day?: number
          min_job_duration_h?: number
          notes?: string | null
          updated_at?: string
        }
        Update: {
          accepts_deep_clean?: boolean
          accepts_move_out?: boolean
          accepts_pets?: boolean
          cleaner_id?: string
          created_at?: string
          has_own_supplies?: boolean
          has_vehicle?: boolean
          id?: string
          max_job_duration_h?: number
          max_jobs_per_day?: number
          min_job_duration_h?: number
          notes?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cleaner_preferences_cleaner_id_fkey"
            columns: ["cleaner_id"]
            isOneToOne: true
            referencedRelation: "cleaner_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cleaner_profiles: {
        Row: {
          accepts_high_risk: boolean | null
          avg_rating: number | null
          background_check_required: boolean | null
          background_check_status: string | null
          base_rate_cph: number | null
          bio: string | null
          created_at: string
          deep_addon_cph: number | null
          first_name: string | null
          hourly_rate_credits: number
          id: string
          instant_payout_enabled: boolean | null
          is_available: boolean | null
          jobs_completed: number
          last_name: string | null
          latitude: number | null
          longitude: number | null
          low_flexibility_badge: boolean
          max_jobs_per_day: number | null
          minimum_payout_cents: number | null
          moveout_addon_cph: number | null
          payout_percent: number | null
          payout_schedule: string | null
          push_token: string | null
          reliability_score: number
          stripe_account_id: string | null
          stripe_connect_id: string | null
          tier: string
          travel_radius_km: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          accepts_high_risk?: boolean | null
          avg_rating?: number | null
          background_check_required?: boolean | null
          background_check_status?: string | null
          base_rate_cph?: number | null
          bio?: string | null
          created_at?: string
          deep_addon_cph?: number | null
          first_name?: string | null
          hourly_rate_credits?: number
          id?: string
          instant_payout_enabled?: boolean | null
          is_available?: boolean | null
          jobs_completed?: number
          last_name?: string | null
          latitude?: number | null
          longitude?: number | null
          low_flexibility_badge?: boolean
          max_jobs_per_day?: number | null
          minimum_payout_cents?: number | null
          moveout_addon_cph?: number | null
          payout_percent?: number | null
          payout_schedule?: string | null
          push_token?: string | null
          reliability_score?: number
          stripe_account_id?: string | null
          stripe_connect_id?: string | null
          tier?: string
          travel_radius_km?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          accepts_high_risk?: boolean | null
          avg_rating?: number | null
          background_check_required?: boolean | null
          background_check_status?: string | null
          base_rate_cph?: number | null
          bio?: string | null
          created_at?: string
          deep_addon_cph?: number | null
          first_name?: string | null
          hourly_rate_credits?: number
          id?: string
          instant_payout_enabled?: boolean | null
          is_available?: boolean | null
          jobs_completed?: number
          last_name?: string | null
          latitude?: number | null
          longitude?: number | null
          low_flexibility_badge?: boolean
          max_jobs_per_day?: number | null
          minimum_payout_cents?: number | null
          moveout_addon_cph?: number | null
          payout_percent?: number | null
          payout_schedule?: string | null
          push_token?: string | null
          reliability_score?: number
          stripe_account_id?: string | null
          stripe_connect_id?: string | null
          tier?: string
          travel_radius_km?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      cleaner_reliability_events: {
        Row: {
          cleaner_id: string
          created_at: string
          event_type: Database["public"]["Enums"]["reliability_event_type"]
          id: string
          job_id: string | null
          metadata: Json | null
          notes: string | null
          weight: number
        }
        Insert: {
          cleaner_id: string
          created_at?: string
          event_type: Database["public"]["Enums"]["reliability_event_type"]
          id?: string
          job_id?: string | null
          metadata?: Json | null
          notes?: string | null
          weight?: number
        }
        Update: {
          cleaner_id?: string
          created_at?: string
          event_type?: Database["public"]["Enums"]["reliability_event_type"]
          id?: string
          job_id?: string | null
          metadata?: Json | null
          notes?: string | null
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "cleaner_reliability_events_cleaner_id_fkey"
            columns: ["cleaner_id"]
            isOneToOne: false
            referencedRelation: "cleaner_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cleaner_reliability_events_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      cleaner_reliability_scores: {
        Row: {
          cleaner_id: string
          current_score: number
          last_event_at: string | null
          last_recalculated_at: string
          total_events: number
        }
        Insert: {
          cleaner_id: string
          current_score?: number
          last_event_at?: string | null
          last_recalculated_at?: string
          total_events?: number
        }
        Update: {
          cleaner_id?: string
          current_score?: number
          last_event_at?: string | null
          last_recalculated_at?: string
          total_events?: number
        }
        Relationships: [
          {
            foreignKeyName: "cleaner_reliability_scores_cleaner_id_fkey"
            columns: ["cleaner_id"]
            isOneToOne: true
            referencedRelation: "cleaner_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cleaner_service_areas: {
        Row: {
          city: string | null
          cleaner_id: string
          created_at: string
          id: string
          latitude: number | null
          longitude: number | null
          radius_miles: number | null
          state: string | null
          zip_code: string | null
        }
        Insert: {
          city?: string | null
          cleaner_id: string
          created_at?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          radius_miles?: number | null
          state?: string | null
          zip_code?: string | null
        }
        Update: {
          city?: string | null
          cleaner_id?: string
          created_at?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          radius_miles?: number | null
          state?: string | null
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cleaner_service_areas_cleaner_id_fkey"
            columns: ["cleaner_id"]
            isOneToOne: false
            referencedRelation: "cleaner_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cleaner_teams: {
        Row: {
          created_at: string
          description: string | null
          id: number
          is_active: boolean
          max_members: number
          name: string
          owner_cleaner_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          is_active?: boolean
          max_members?: number
          name: string
          owner_cleaner_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          is_active?: boolean
          max_members?: number
          name?: string
          owner_cleaner_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cleaner_teams_owner_cleaner_id_fkey"
            columns: ["owner_cleaner_id"]
            isOneToOne: false
            referencedRelation: "cleaner_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cleaner_tier_history: {
        Row: {
          cleaner_id: string
          created_at: string
          effective_from: string
          effective_to: string | null
          from_tier: string | null
          id: string
          reason: string | null
          to_tier: string
          triggered_by: string | null
          triggered_by_user_id: string | null
        }
        Insert: {
          cleaner_id: string
          created_at?: string
          effective_from?: string
          effective_to?: string | null
          from_tier?: string | null
          id?: string
          reason?: string | null
          to_tier: string
          triggered_by?: string | null
          triggered_by_user_id?: string | null
        }
        Update: {
          cleaner_id?: string
          created_at?: string
          effective_from?: string
          effective_to?: string | null
          from_tier?: string | null
          id?: string
          reason?: string | null
          to_tier?: string
          triggered_by?: string | null
          triggered_by_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cleaner_tier_history_cleaner_id_fkey"
            columns: ["cleaner_id"]
            isOneToOne: false
            referencedRelation: "cleaner_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cleaner_time_off: {
        Row: {
          all_day: boolean
          cleaner_id: string
          created_at: string
          end_date: string
          end_time: string | null
          id: string
          reason: string | null
          start_date: string
          start_time: string | null
        }
        Insert: {
          all_day?: boolean
          cleaner_id: string
          created_at?: string
          end_date: string
          end_time?: string | null
          id?: string
          reason?: string | null
          start_date: string
          start_time?: string | null
        }
        Update: {
          all_day?: boolean
          cleaner_id?: string
          created_at?: string
          end_date?: string
          end_time?: string | null
          id?: string
          reason?: string | null
          start_date?: string
          start_time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cleaner_time_off_cleaner_id_fkey"
            columns: ["cleaner_id"]
            isOneToOne: false
            referencedRelation: "cleaner_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cleaner_weekly_streaks: {
        Row: {
          cleaner_id: string
          created_at: string
          id: number
          is_streak: boolean
          week_start: string
        }
        Insert: {
          cleaner_id: string
          created_at?: string
          id?: number
          is_streak?: boolean
          week_start: string
        }
        Update: {
          cleaner_id?: string
          created_at?: string
          id?: number
          is_streak?: boolean
          week_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "cleaner_weekly_streaks_cleaner_id_fkey"
            columns: ["cleaner_id"]
            isOneToOne: false
            referencedRelation: "cleaner_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cleaners: {
        Row: {
          bio: string | null
          hourly_rate: number | null
          id: string
          rating: number | null
          status: string
          user_id: string | null
        }
        Insert: {
          bio?: string | null
          hourly_rate?: number | null
          id?: string
          rating?: number | null
          status?: string
          user_id?: string | null
        }
        Update: {
          bio?: string | null
          hourly_rate?: number | null
          id?: string
          rating?: number | null
          status?: string
          user_id?: string | null
        }
        Relationships: []
      }
      cleaning_subscriptions: {
        Row: {
          address: string
          base_hours: number | null
          cancelled_at: string | null
          cleaner_id: string | null
          cleaning_type: string | null
          client_id: string
          created_at: string
          credit_amount: number
          day_of_week: number | null
          frequency: string
          id: string
          jobs_created: number
          latitude: number | null
          longitude: number | null
          next_job_date: string | null
          paused_reason: string | null
          preferred_time: string | null
          property_id: number | null
          status: string
          timezone: string | null
          updated_at: string
        }
        Insert: {
          address: string
          base_hours?: number | null
          cancelled_at?: string | null
          cleaner_id?: string | null
          cleaning_type?: string | null
          client_id: string
          created_at?: string
          credit_amount: number
          day_of_week?: number | null
          frequency: string
          id?: string
          jobs_created?: number
          latitude?: number | null
          longitude?: number | null
          next_job_date?: string | null
          paused_reason?: string | null
          preferred_time?: string | null
          property_id?: number | null
          status?: string
          timezone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string
          base_hours?: number | null
          cancelled_at?: string | null
          cleaner_id?: string | null
          cleaning_type?: string | null
          client_id?: string
          created_at?: string
          credit_amount?: number
          day_of_week?: number | null
          frequency?: string
          id?: string
          jobs_created?: number
          latitude?: number | null
          longitude?: number | null
          next_job_date?: string | null
          paused_reason?: string | null
          preferred_time?: string | null
          property_id?: number | null
          status?: string
          timezone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cleaning_subscriptions_cleaner_id_fkey"
            columns: ["cleaner_id"]
            isOneToOne: false
            referencedRelation: "cleaner_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cleaning_subscriptions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cleaning_subscriptions_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      client_flex_profiles: {
        Row: {
          cancellations_30d: number
          client_id: string
          flex_score: number
          last_computed_at: string
          late_reschedules_30d: number
          metadata: Json | null
          reschedules_30d: number
        }
        Insert: {
          cancellations_30d?: number
          client_id: string
          flex_score?: number
          last_computed_at?: string
          late_reschedules_30d?: number
          metadata?: Json | null
          reschedules_30d?: number
        }
        Update: {
          cancellations_30d?: number
          client_id?: string
          flex_score?: number
          last_computed_at?: string
          late_reschedules_30d?: number
          metadata?: Json | null
          reschedules_30d?: number
        }
        Relationships: [
          {
            foreignKeyName: "client_flex_profiles_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: true
            referencedRelation: "client_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      client_profiles: {
        Row: {
          created_at: string
          default_address: string | null
          first_name: string | null
          grace_cancellations_total: number | null
          grace_cancellations_used: number | null
          id: string
          last_name: string | null
          push_token: string | null
          stripe_customer_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          default_address?: string | null
          first_name?: string | null
          grace_cancellations_total?: number | null
          grace_cancellations_used?: number | null
          id?: string
          last_name?: string | null
          push_token?: string | null
          stripe_customer_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          default_address?: string | null
          first_name?: string | null
          grace_cancellations_total?: number | null
          grace_cancellations_used?: number | null
          id?: string
          last_name?: string | null
          push_token?: string | null
          stripe_customer_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      client_risk_events: {
        Row: {
          client_id: string
          created_at: string
          event_type: Database["public"]["Enums"]["client_risk_event_type"]
          id: number
          job_id: string | null
          metadata: Json | null
          weight: number
        }
        Insert: {
          client_id: string
          created_at?: string
          event_type: Database["public"]["Enums"]["client_risk_event_type"]
          id?: number
          job_id?: string | null
          metadata?: Json | null
          weight: number
        }
        Update: {
          client_id?: string
          created_at?: string
          event_type?: Database["public"]["Enums"]["client_risk_event_type"]
          id?: number
          job_id?: string | null
          metadata?: Json | null
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "client_risk_events_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_risk_events_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      client_risk_scores: {
        Row: {
          client_id: string
          last_recomputed_at: string
          risk_band: Database["public"]["Enums"]["client_risk_band"]
          risk_score: number
        }
        Insert: {
          client_id: string
          last_recomputed_at?: string
          risk_band?: Database["public"]["Enums"]["client_risk_band"]
          risk_score?: number
        }
        Update: {
          client_id?: string
          last_recomputed_at?: string
          risk_band?: Database["public"]["Enums"]["client_risk_band"]
          risk_score?: number
        }
        Relationships: [
          {
            foreignKeyName: "client_risk_scores_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: true
            referencedRelation: "client_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          created_at: string
          credit_balance: number
          email: string
          full_name: string | null
          id: string
          phone: string | null
          reliability_score: number | null
          status: Database["public"]["Enums"]["client_status_enum"]
          stripe_customer_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          credit_balance?: number
          email: string
          full_name?: string | null
          id?: string
          phone?: string | null
          reliability_score?: number | null
          status?: Database["public"]["Enums"]["client_status_enum"]
          stripe_customer_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          credit_balance?: number
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          reliability_score?: number | null
          status?: Database["public"]["Enums"]["client_status_enum"]
          stripe_customer_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      credit_accounts: {
        Row: {
          created_at: string
          current_balance: number
          held_balance: number
          id: string
          lifetime_purchased: number
          lifetime_refunded: number
          lifetime_spent: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_balance?: number
          held_balance?: number
          id?: string
          lifetime_purchased?: number
          lifetime_refunded?: number
          lifetime_spent?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_balance?: number
          held_balance?: number
          id?: string
          lifetime_purchased?: number
          lifetime_refunded?: number
          lifetime_spent?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      credit_bonuses: {
        Row: {
          amount: number
          bonus_type: string
          created_at: string
          id: string
          source: string | null
          user_id: string
          week_of_year: number
          year: number
        }
        Insert: {
          amount: number
          bonus_type: string
          created_at?: string
          id?: string
          source?: string | null
          user_id: string
          week_of_year: number
          year: number
        }
        Update: {
          amount?: number
          bonus_type?: string
          created_at?: string
          id?: string
          source?: string | null
          user_id?: string
          week_of_year?: number
          year?: number
        }
        Relationships: []
      }
      credit_ledger: {
        Row: {
          created_at: string
          delta_credits: number
          id: string
          job_id: string | null
          reason: Database["public"]["Enums"]["credit_reason"]
          user_id: string
        }
        Insert: {
          created_at?: string
          delta_credits: number
          id?: string
          job_id?: string | null
          reason: Database["public"]["Enums"]["credit_reason"]
          user_id: string
        }
        Update: {
          created_at?: string
          delta_credits?: number
          id?: string
          job_id?: string | null
          reason?: Database["public"]["Enums"]["credit_reason"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_ledger_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_purchases: {
        Row: {
          completed_at: string | null
          created_at: string
          credits_amount: number
          id: string
          package_id: string
          price_usd: number
          status: string
          stripe_checkout_session_id: string | null
          stripe_payment_intent_id: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          credits_amount: number
          id?: string
          package_id: string
          price_usd: number
          status?: string
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          credits_amount?: number
          id?: string
          package_id?: string
          price_usd?: number
          status?: string
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      credit_transactions: {
        Row: {
          amount_credits: number
          balance_after: number | null
          client_id: string
          created_at: string
          id: string
          idempotency_key: string | null
          job_id: string | null
          note: string | null
          type: Database["public"]["Enums"]["credit_transaction_type"]
        }
        Insert: {
          amount_credits: number
          balance_after?: number | null
          client_id: string
          created_at?: string
          id?: string
          idempotency_key?: string | null
          job_id?: string | null
          note?: string | null
          type: Database["public"]["Enums"]["credit_transaction_type"]
        }
        Update: {
          amount_credits?: number
          balance_after?: number | null
          client_id?: string
          created_at?: string
          id?: string
          idempotency_key?: string | null
          job_id?: string | null
          note?: string | null
          type?: Database["public"]["Enums"]["credit_transaction_type"]
        }
        Relationships: [
          {
            foreignKeyName: "credit_transactions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_transactions_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: string | null
          city: string | null
          id: string
          state: string | null
          user_id: string | null
          zipcode: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          id?: string
          state?: string | null
          user_id?: string | null
          zipcode?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          id?: string
          state?: string | null
          user_id?: string | null
          zipcode?: string | null
        }
        Relationships: []
      }
      device_tokens: {
        Row: {
          created_at: string
          device_name: string | null
          id: string
          is_active: boolean
          last_used_at: string | null
          platform: string
          token: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          device_name?: string | null
          id?: string
          is_active?: boolean
          last_used_at?: string | null
          platform: string
          token: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          device_name?: string | null
          id?: string
          is_active?: boolean
          last_used_at?: string | null
          platform?: string
          token?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      dispute_actions: {
        Row: {
          action: string
          actor_type: string
          actor_user_id: string | null
          attachments: Json | null
          created_at: string
          details: Json | null
          dispute_id: string
          id: string
        }
        Insert: {
          action: string
          actor_type: string
          actor_user_id?: string | null
          attachments?: Json | null
          created_at?: string
          details?: Json | null
          dispute_id: string
          id?: string
        }
        Update: {
          action?: string
          actor_type?: string
          actor_user_id?: string | null
          attachments?: Json | null
          created_at?: string
          details?: Json | null
          dispute_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dispute_actions_dispute_id_fkey"
            columns: ["dispute_id"]
            isOneToOne: false
            referencedRelation: "disputes"
            referencedColumns: ["id"]
          },
        ]
      }
      disputes: {
        Row: {
          admin_notes: string | null
          client_id: string
          client_notes: string
          created_at: string
          description: string | null
          id: string
          job_completed_at: string | null
          job_id: string
          opened_by_user_id: string | null
          reason_code: string | null
          refund_amount_credits: number | null
          resolution_notes: string | null
          resolution_type: string | null
          resolved_at: string | null
          resolved_by_user_id: string | null
          status: Database["public"]["Enums"]["dispute_status"]
          updated_at: string
          within_window: boolean | null
        }
        Insert: {
          admin_notes?: string | null
          client_id: string
          client_notes: string
          created_at?: string
          description?: string | null
          id?: string
          job_completed_at?: string | null
          job_id: string
          opened_by_user_id?: string | null
          reason_code?: string | null
          refund_amount_credits?: number | null
          resolution_notes?: string | null
          resolution_type?: string | null
          resolved_at?: string | null
          resolved_by_user_id?: string | null
          status?: Database["public"]["Enums"]["dispute_status"]
          updated_at?: string
          within_window?: boolean | null
        }
        Update: {
          admin_notes?: string | null
          client_id?: string
          client_notes?: string
          created_at?: string
          description?: string | null
          id?: string
          job_completed_at?: string | null
          job_id?: string
          opened_by_user_id?: string | null
          reason_code?: string | null
          refund_amount_credits?: number | null
          resolution_notes?: string | null
          resolution_type?: string | null
          resolved_at?: string | null
          resolved_by_user_id?: string | null
          status?: Database["public"]["Enums"]["dispute_status"]
          updated_at?: string
          within_window?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "disputes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disputes_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      favorite_cleaners: {
        Row: {
          cleaner_id: string
          client_id: string
          created_at: string
          id: number
          notes: string | null
        }
        Insert: {
          cleaner_id: string
          client_id: string
          created_at?: string
          id?: number
          notes?: string | null
        }
        Update: {
          cleaner_id?: string
          client_id?: string
          created_at?: string
          id?: number
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "favorite_cleaners_cleaner_id_fkey"
            columns: ["cleaner_id"]
            isOneToOne: false
            referencedRelation: "cleaner_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorite_cleaners_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_flags: {
        Row: {
          created_at: string
          description: string | null
          enabled: boolean
          key: string
          metadata: Json | null
          rollout_percentage: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          enabled?: boolean
          key: string
          metadata?: Json | null
          rollout_percentage?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          enabled?: boolean
          key?: string
          metadata?: Json | null
          rollout_percentage?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      flexibility_decline_events: {
        Row: {
          cleaner_id: string
          created_at: string
          id: number
          reschedule_event_id: number | null
        }
        Insert: {
          cleaner_id: string
          created_at?: string
          id?: number
          reschedule_event_id?: number | null
        }
        Update: {
          cleaner_id?: string
          created_at?: string
          id?: number
          reschedule_event_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "flexibility_decline_events_cleaner_id_fkey"
            columns: ["cleaner_id"]
            isOneToOne: false
            referencedRelation: "cleaner_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flexibility_decline_events_reschedule_event_id_fkey"
            columns: ["reschedule_event_id"]
            isOneToOne: false
            referencedRelation: "reschedule_events"
            referencedColumns: ["id"]
          },
        ]
      }
      fraud_alerts: {
        Row: {
          alert_type: string
          created_at: string
          description: string
          id: string
          metadata: Json | null
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          status: string
          user_id: string | null
        }
        Insert: {
          alert_type: string
          created_at?: string
          description: string
          id?: string
          metadata?: Json | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          status?: string
          user_id?: string | null
        }
        Update: {
          alert_type?: string
          created_at?: string
          description?: string
          id?: string
          metadata?: Json | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          status?: string
          user_id?: string | null
        }
        Relationships: []
      }
      grace_cancellations: {
        Row: {
          client_id: string
          created_at: string
          id: number
          job_id: string | null
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: number
          job_id?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: number
          job_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "grace_cancellations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grace_cancellations_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      id_verifications: {
        Row: {
          cleaner_id: string
          created_at: string
          document_type: string | null
          expires_at: string | null
          id: string
          metadata: Json | null
          provider: string
          status: string
          updated_at: string
          verified_at: string | null
        }
        Insert: {
          cleaner_id: string
          created_at?: string
          document_type?: string | null
          expires_at?: string | null
          id?: string
          metadata?: Json | null
          provider?: string
          status?: string
          updated_at?: string
          verified_at?: string | null
        }
        Update: {
          cleaner_id?: string
          created_at?: string
          document_type?: string | null
          expires_at?: string | null
          id?: string
          metadata?: Json | null
          provider?: string
          status?: string
          updated_at?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "id_verifications_cleaner_id_fkey"
            columns: ["cleaner_id"]
            isOneToOne: false
            referencedRelation: "cleaner_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      inconvenience_logs: {
        Row: {
          caused_by: string
          cleaner_id: string
          client_id: string
          created_at: string
          id: number
          job_id: string
          metadata: Json | null
          reason_link: string | null
          score: number
        }
        Insert: {
          caused_by: string
          cleaner_id: string
          client_id: string
          created_at?: string
          id?: number
          job_id: string
          metadata?: Json | null
          reason_link?: string | null
          score: number
        }
        Update: {
          caused_by?: string
          cleaner_id?: string
          client_id?: string
          created_at?: string
          id?: number
          job_id?: string
          metadata?: Json | null
          reason_link?: string | null
          score?: number
        }
        Relationships: [
          {
            foreignKeyName: "inconvenience_logs_cleaner_id_fkey"
            columns: ["cleaner_id"]
            isOneToOne: false
            referencedRelation: "cleaner_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inconvenience_logs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inconvenience_logs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_events: {
        Row: {
          created_at: string
          error_message: string | null
          event_type: string
          external_id: string | null
          id: string
          payload: Json | null
          provider: string
          related_cleaner_id: string | null
          related_client_id: string | null
          status: string | null
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          event_type: string
          external_id?: string | null
          id?: string
          payload?: Json | null
          provider: string
          related_cleaner_id?: string | null
          related_client_id?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string
          error_message?: string | null
          event_type?: string
          external_id?: string | null
          id?: string
          payload?: Json | null
          provider?: string
          related_cleaner_id?: string | null
          related_client_id?: string | null
          status?: string | null
        }
        Relationships: []
      }
      job_checkins: {
        Row: {
          cleaner_id: string
          created_at: string
          device_info: Json | null
          distance_from_job_meters: number | null
          id: string
          is_within_radius: boolean | null
          job_id: string
          lat: number | null
          lng: number | null
          type: string
        }
        Insert: {
          cleaner_id: string
          created_at?: string
          device_info?: Json | null
          distance_from_job_meters?: number | null
          id?: string
          is_within_radius?: boolean | null
          job_id: string
          lat?: number | null
          lng?: number | null
          type: string
        }
        Update: {
          cleaner_id?: string
          created_at?: string
          device_info?: Json | null
          distance_from_job_meters?: number | null
          id?: string
          is_within_radius?: boolean | null
          job_id?: string
          lat?: number | null
          lng?: number | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_checkins_cleaner_id_fkey"
            columns: ["cleaner_id"]
            isOneToOne: false
            referencedRelation: "cleaner_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_checkins_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_events: {
        Row: {
          actor_id: string | null
          actor_type: string
          created_at: string | null
          event_type: Database["public"]["Enums"]["job_event_type"]
          id: number
          job_id: string | null
          meta: Json | null
          payload: Json
        }
        Insert: {
          actor_id?: string | null
          actor_type: string
          created_at?: string | null
          event_type: Database["public"]["Enums"]["job_event_type"]
          id?: number
          job_id?: string | null
          meta?: Json | null
          payload?: Json
        }
        Update: {
          actor_id?: string | null
          actor_type?: string
          created_at?: string | null
          event_type?: Database["public"]["Enums"]["job_event_type"]
          id?: number
          job_id?: string | null
          meta?: Json | null
          payload?: Json
        }
        Relationships: [
          {
            foreignKeyName: "job_events_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_gps_logs: {
        Row: {
          created_at: string | null
          id: number
          job_id: string | null
          lat: number | null
          lng: number | null
          type: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          job_id?: string | null
          lat?: number | null
          lng?: number | null
          type?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          job_id?: string | null
          lat?: number | null
          lng?: number | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_gps_logs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_offers: {
        Row: {
          cleaner_id: string
          created_at: string
          decline_reason: string | null
          expires_at: string
          id: string
          job_id: string
          status: string
          updated_at: string
        }
        Insert: {
          cleaner_id: string
          created_at?: string
          decline_reason?: string | null
          expires_at: string
          id?: string
          job_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          cleaner_id?: string
          created_at?: string
          decline_reason?: string | null
          expires_at?: string
          id?: string
          job_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_offers_cleaner_id_fkey"
            columns: ["cleaner_id"]
            isOneToOne: false
            referencedRelation: "cleaner_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_offers_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_photos: {
        Row: {
          created_at: string | null
          id: number
          job_id: string | null
          photo_url: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          job_id?: string | null
          photo_url: string
        }
        Update: {
          created_at?: string | null
          id?: number
          job_id?: string | null
          photo_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_photos_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_queue: {
        Row: {
          attempts: number
          completed_at: string | null
          created_at: string
          error_message: string | null
          id: number
          max_attempts: number
          payload: Json
          priority: number
          queue_name: string
          scheduled_at: string
          started_at: string | null
          status: string
        }
        Insert: {
          attempts?: number
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: number
          max_attempts?: number
          payload: Json
          priority?: number
          queue_name: string
          scheduled_at?: string
          started_at?: string | null
          status?: string
        }
        Update: {
          attempts?: number
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: number
          max_attempts?: number
          payload?: Json
          priority?: number
          queue_name?: string
          scheduled_at?: string
          started_at?: string | null
          status?: string
        }
        Relationships: []
      }
      job_status_history: {
        Row: {
          changed_by_type: string | null
          changed_by_user_id: string | null
          created_at: string
          from_status: string | null
          id: string
          job_id: string
          metadata: Json | null
          reason: string | null
          to_status: string
        }
        Insert: {
          changed_by_type?: string | null
          changed_by_user_id?: string | null
          created_at?: string
          from_status?: string | null
          id?: string
          job_id: string
          metadata?: Json | null
          reason?: string | null
          to_status: string
        }
        Update: {
          changed_by_type?: string | null
          changed_by_user_id?: string | null
          created_at?: string
          from_status?: string | null
          id?: string
          job_id?: string
          metadata?: Json | null
          reason?: string | null
          to_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_status_history_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_time_logs: {
        Row: {
          created_at: string | null
          id: number
          job_id: string | null
          seconds: number | null
          segment_end: string | null
          segment_start: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          job_id?: string | null
          seconds?: number | null
          segment_end?: string | null
          segment_start?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          job_id?: string | null
          seconds?: number | null
          segment_end?: string | null
          segment_start?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_time_logs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          actual_end_at: string | null
          actual_hours: number | null
          actual_minutes: number | null
          actual_start_at: string | null
          base_rate_cents: number | null
          cancelled_at: string | null
          check_in_at: string | null
          check_in_lat: number | null
          check_in_lng: number | null
          check_out_at: string | null
          check_out_lat: number | null
          check_out_lng: number | null
          checkin_lat: number | null
          checkin_lng: number | null
          checkout_lat: number | null
          checkout_lng: number | null
          cleaner_id: string
          cleaner_notes: string | null
          cleaning_type: Database["public"]["Enums"]["cleaning_type"]
          client_id: string
          created_at: string | null
          credit_charge_credits: number | null
          discount_cents: number | null
          escrow_credits_reserved: number
          estimated_hours: number | null
          estimated_minutes: number | null
          extra_fees_cents: number | null
          final_charge_credits: number | null
          id: string
          is_rush: boolean | null
          metadata: Json | null
          notes: string | null
          property_id: number | null
          refund_credits: number | null
          rush_fee_credits: number | null
          scheduled_end_at: string | null
          scheduled_start_at: string | null
          snapshot_addon_rate_cph: number | null
          snapshot_base_rate_cph: number | null
          snapshot_total_rate_cph: number | null
          status: Database["public"]["Enums"]["job_status"]
          tasks_completed_json: Json | null
          team_id: number | null
          title: string | null
          total_charge_cents: number | null
          updated_at: string | null
        }
        Insert: {
          actual_end_at?: string | null
          actual_hours?: number | null
          actual_minutes?: number | null
          actual_start_at?: string | null
          base_rate_cents?: number | null
          cancelled_at?: string | null
          check_in_at?: string | null
          check_in_lat?: number | null
          check_in_lng?: number | null
          check_out_at?: string | null
          check_out_lat?: number | null
          check_out_lng?: number | null
          checkin_lat?: number | null
          checkin_lng?: number | null
          checkout_lat?: number | null
          checkout_lng?: number | null
          cleaner_id: string
          cleaner_notes?: string | null
          cleaning_type: Database["public"]["Enums"]["cleaning_type"]
          client_id: string
          created_at?: string | null
          credit_charge_credits?: number | null
          discount_cents?: number | null
          escrow_credits_reserved?: number
          estimated_hours?: number | null
          estimated_minutes?: number | null
          extra_fees_cents?: number | null
          final_charge_credits?: number | null
          id?: string
          is_rush?: boolean | null
          metadata?: Json | null
          notes?: string | null
          property_id?: number | null
          refund_credits?: number | null
          rush_fee_credits?: number | null
          scheduled_end_at?: string | null
          scheduled_start_at?: string | null
          snapshot_addon_rate_cph?: number | null
          snapshot_base_rate_cph?: number | null
          snapshot_total_rate_cph?: number | null
          status?: Database["public"]["Enums"]["job_status"]
          tasks_completed_json?: Json | null
          team_id?: number | null
          title?: string | null
          total_charge_cents?: number | null
          updated_at?: string | null
        }
        Update: {
          actual_end_at?: string | null
          actual_hours?: number | null
          actual_minutes?: number | null
          actual_start_at?: string | null
          base_rate_cents?: number | null
          cancelled_at?: string | null
          check_in_at?: string | null
          check_in_lat?: number | null
          check_in_lng?: number | null
          check_out_at?: string | null
          check_out_lat?: number | null
          check_out_lng?: number | null
          checkin_lat?: number | null
          checkin_lng?: number | null
          checkout_lat?: number | null
          checkout_lng?: number | null
          cleaner_id?: string
          cleaner_notes?: string | null
          cleaning_type?: Database["public"]["Enums"]["cleaning_type"]
          client_id?: string
          created_at?: string | null
          credit_charge_credits?: number | null
          discount_cents?: number | null
          escrow_credits_reserved?: number
          estimated_hours?: number | null
          estimated_minutes?: number | null
          extra_fees_cents?: number | null
          final_charge_credits?: number | null
          id?: string
          is_rush?: boolean | null
          metadata?: Json | null
          notes?: string | null
          property_id?: number | null
          refund_credits?: number | null
          rush_fee_credits?: number | null
          scheduled_end_at?: string | null
          scheduled_start_at?: string | null
          snapshot_addon_rate_cph?: number | null
          snapshot_base_rate_cph?: number | null
          snapshot_total_rate_cph?: number | null
          status?: Database["public"]["Enums"]["job_status"]
          tasks_completed_json?: Json | null
          team_id?: number | null
          title?: string | null
          total_charge_cents?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jobs_cleaner_id_fkey"
            columns: ["cleaner_id"]
            isOneToOne: false
            referencedRelation: "cleaner_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "cleaner_teams"
            referencedColumns: ["id"]
          },
        ]
      }
      kpi_daily: {
        Row: {
          created_at: string
          id: string
          jobs_completed: number
          jobs_created: number
          metric_date: string
          new_cleaners: number
          new_clients: number
          snapshot: Json | null
          total_credits_purchased: number
          total_credits_used: number
          total_payouts_cents: number
          total_revenue_cents: number
        }
        Insert: {
          created_at?: string
          id?: string
          jobs_completed?: number
          jobs_created?: number
          metric_date: string
          new_cleaners?: number
          new_clients?: number
          snapshot?: Json | null
          total_credits_purchased?: number
          total_credits_used?: number
          total_payouts_cents?: number
          total_revenue_cents?: number
        }
        Update: {
          created_at?: string
          id?: string
          jobs_completed?: number
          jobs_created?: number
          metric_date?: string
          new_cleaners?: number
          new_clients?: number
          snapshot?: Json | null
          total_credits_purchased?: number
          total_credits_used?: number
          total_payouts_cents?: number
          total_revenue_cents?: number
        }
        Relationships: []
      }
      kpi_snapshots: {
        Row: {
          cancelled_jobs: number
          completed_jobs: number
          created_at: string
          date: string
          disputed_jobs: number
          id: string
          total_jobs: number
        }
        Insert: {
          cancelled_jobs?: number
          completed_jobs?: number
          created_at?: string
          date: string
          disputed_jobs?: number
          id?: string
          total_jobs?: number
        }
        Update: {
          cancelled_jobs?: number
          completed_jobs?: number
          created_at?: string
          date?: string
          disputed_jobs?: number
          id?: string
          total_jobs?: number
        }
        Relationships: []
      }
      match_recommendations: {
        Row: {
          breakdown: Json | null
          cleaner_id: string
          client_id: string
          generated_at: string
          id: number
          job_id: string
          match_score: number
          rank: number
        }
        Insert: {
          breakdown?: Json | null
          cleaner_id: string
          client_id: string
          generated_at?: string
          id?: number
          job_id: string
          match_score: number
          rank: number
        }
        Update: {
          breakdown?: Json | null
          cleaner_id?: string
          client_id?: string
          generated_at?: string
          id?: number
          job_id?: string
          match_score?: number
          rank?: number
        }
        Relationships: [
          {
            foreignKeyName: "match_recommendations_cleaner_id_fkey"
            columns: ["cleaner_id"]
            isOneToOne: false
            referencedRelation: "cleaner_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_recommendations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_recommendations_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      message_threads: {
        Row: {
          cleaner_id: string | null
          client_id: string | null
          created_at: string
          id: string
          job_id: string | null
          metadata: Json | null
          subject: string | null
          updated_at: string
        }
        Insert: {
          cleaner_id?: string | null
          client_id?: string | null
          created_at?: string
          id?: string
          job_id?: string | null
          metadata?: Json | null
          subject?: string | null
          updated_at?: string
        }
        Update: {
          cleaner_id?: string | null
          client_id?: string | null
          created_at?: string
          id?: string
          job_id?: string | null
          metadata?: Json | null
          subject?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_threads_cleaner_id_fkey"
            columns: ["cleaner_id"]
            isOneToOne: false
            referencedRelation: "cleaner_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_threads_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_threads_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          body: string
          created_at: string
          external_id: string | null
          id: string
          is_read: boolean
          metadata: Json | null
          read_at: string | null
          sender_id: string | null
          sender_type: Database["public"]["Enums"]["sender_type"]
          sent_via: string | null
          thread_id: string
        }
        Insert: {
          body: string
          created_at?: string
          external_id?: string | null
          id?: string
          is_read?: boolean
          metadata?: Json | null
          read_at?: string | null
          sender_id?: string | null
          sender_type: Database["public"]["Enums"]["sender_type"]
          sent_via?: string | null
          thread_id: string
        }
        Update: {
          body?: string
          created_at?: string
          external_id?: string | null
          id?: string
          is_read?: boolean
          metadata?: Json | null
          read_at?: string | null
          sender_id?: string | null
          sender_type?: Database["public"]["Enums"]["sender_type"]
          sent_via?: string | null
          thread_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "message_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_failures: {
        Row: {
          channel: string
          created_at: string
          error_message: string | null
          id: string
          last_attempt_at: string | null
          payload: Json
          retry_count: number
          type: string
          user_id: string | null
        }
        Insert: {
          channel: string
          created_at?: string
          error_message?: string | null
          id?: string
          last_attempt_at?: string | null
          payload: Json
          retry_count?: number
          type: string
          user_id?: string | null
        }
        Update: {
          channel?: string
          created_at?: string
          error_message?: string | null
          id?: string
          last_attempt_at?: string | null
          payload?: Json
          retry_count?: number
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      notification_log: {
        Row: {
          channel: string
          created_at: string
          error_message: string | null
          id: string
          payload: Json
          sent_at: string | null
          status: string
          type: string
          user_id: string | null
        }
        Insert: {
          channel: string
          created_at?: string
          error_message?: string | null
          id?: string
          payload?: Json
          sent_at?: string | null
          status?: string
          type: string
          user_id?: string | null
        }
        Update: {
          channel?: string
          created_at?: string
          error_message?: string | null
          id?: string
          payload?: Json
          sent_at?: string | null
          status?: string
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      notification_logs: {
        Row: {
          channel: string
          created_at: string
          id: string
          metadata: Json | null
          provider_id: string | null
          recipient: string
          status: string
          subject: string | null
          type: string
          user_id: string | null
        }
        Insert: {
          channel: string
          created_at?: string
          id?: string
          metadata?: Json | null
          provider_id?: string | null
          recipient: string
          status: string
          subject?: string | null
          type: string
          user_id?: string | null
        }
        Update: {
          channel?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          provider_id?: string | null
          recipient?: string
          status?: string
          subject?: string | null
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          created_at: string
          email_enabled: boolean
          id: string
          push_enabled: boolean
          sms_enabled: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email_enabled?: boolean
          id?: string
          push_enabled?: boolean
          sms_enabled?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email_enabled?: boolean
          id?: string
          push_enabled?: boolean
          sms_enabled?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notification_templates: {
        Row: {
          body: string
          channel: Database["public"]["Enums"]["notification_channel"]
          created_at: string
          id: string
          is_active: boolean
          metadata: Json | null
          subject: string | null
          template_key: string
          updated_at: string
        }
        Insert: {
          body: string
          channel: Database["public"]["Enums"]["notification_channel"]
          created_at?: string
          id?: string
          is_active?: boolean
          metadata?: Json | null
          subject?: string | null
          template_key: string
          updated_at?: string
        }
        Update: {
          body?: string
          channel?: Database["public"]["Enums"]["notification_channel"]
          created_at?: string
          id?: string
          is_active?: boolean
          metadata?: Json | null
          subject?: string | null
          template_key?: string
          updated_at?: string
        }
        Relationships: []
      }
      payment_failures: {
        Row: {
          amount_cents: number | null
          client_id: string | null
          created_at: string
          currency: string | null
          id: string
          raw_event: Json | null
          stripe_error_code: string | null
          stripe_error_message: string | null
          stripe_event_id: string | null
          stripe_payment_intent_id: string | null
        }
        Insert: {
          amount_cents?: number | null
          client_id?: string | null
          created_at?: string
          currency?: string | null
          id?: string
          raw_event?: Json | null
          stripe_error_code?: string | null
          stripe_error_message?: string | null
          stripe_event_id?: string | null
          stripe_payment_intent_id?: string | null
        }
        Update: {
          amount_cents?: number | null
          client_id?: string | null
          created_at?: string
          currency?: string | null
          id?: string
          raw_event?: Json | null
          stripe_error_code?: string | null
          stripe_error_message?: string | null
          stripe_event_id?: string | null
          stripe_payment_intent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_failures_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_intents: {
        Row: {
          amount_cents: number
          cleaner_id: string | null
          client_id: string | null
          credits_amount: number | null
          currency: string
          id: string
          job_id: string | null
          last_event_type: string | null
          purpose: string
          raw: Json
          status: string
          updated_at_utc: string
        }
        Insert: {
          amount_cents?: number
          cleaner_id?: string | null
          client_id?: string | null
          credits_amount?: number | null
          currency?: string
          id: string
          job_id?: string | null
          last_event_type?: string | null
          purpose?: string
          raw: Json
          status: string
          updated_at_utc?: string
        }
        Update: {
          amount_cents?: number
          cleaner_id?: string | null
          client_id?: string | null
          credits_amount?: number | null
          currency?: string
          id?: string
          job_id?: string | null
          last_event_type?: string | null
          purpose?: string
          raw?: Json
          status?: string
          updated_at_utc?: string
        }
        Relationships: []
      }
      payout_adjustments: {
        Row: {
          adjustment_type: string
          amount_cents: number
          cleaner_id: string
          completed_at: string | null
          created_at: string
          id: string
          initiated_by: string | null
          metadata: Json | null
          payout_id: string | null
          reason: string
          status: string
          stripe_reversal_id: string | null
        }
        Insert: {
          adjustment_type: string
          amount_cents: number
          cleaner_id: string
          completed_at?: string | null
          created_at?: string
          id?: string
          initiated_by?: string | null
          metadata?: Json | null
          payout_id?: string | null
          reason: string
          status?: string
          stripe_reversal_id?: string | null
        }
        Update: {
          adjustment_type?: string
          amount_cents?: number
          cleaner_id?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          initiated_by?: string | null
          metadata?: Json | null
          payout_id?: string | null
          reason?: string
          status?: string
          stripe_reversal_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payout_adjustments_cleaner_id_fkey"
            columns: ["cleaner_id"]
            isOneToOne: false
            referencedRelation: "cleaner_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payout_adjustments_payout_id_fkey"
            columns: ["payout_id"]
            isOneToOne: false
            referencedRelation: "payouts"
            referencedColumns: ["id"]
          },
        ]
      }
      payout_requests: {
        Row: {
          amount_cents: number
          amount_credits: number
          cleaner_id: string
          created_at: string
          decided_at: string | null
          decided_by: string | null
          id: string
          metadata: Json | null
          payout_id: string | null
          rejection_reason: string | null
          requested_at: string
          status: string
          updated_at: string
        }
        Insert: {
          amount_cents: number
          amount_credits: number
          cleaner_id: string
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          id?: string
          metadata?: Json | null
          payout_id?: string | null
          rejection_reason?: string | null
          requested_at?: string
          status?: string
          updated_at?: string
        }
        Update: {
          amount_cents?: number
          amount_credits?: number
          cleaner_id?: string
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          id?: string
          metadata?: Json | null
          payout_id?: string | null
          rejection_reason?: string | null
          requested_at?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payout_requests_cleaner_id_fkey"
            columns: ["cleaner_id"]
            isOneToOne: false
            referencedRelation: "cleaner_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payout_requests_payout_id_fkey"
            columns: ["payout_id"]
            isOneToOne: false
            referencedRelation: "payouts"
            referencedColumns: ["id"]
          },
        ]
      }
      payout_retry_queue: {
        Row: {
          amount_cents: number
          cleaner_id: string
          created_at: string
          error_message: string | null
          id: string
          max_retries: number
          next_retry_at: string | null
          payout_id: string
          retry_count: number
          status: string
          stripe_account_id: string | null
          updated_at: string
        }
        Insert: {
          amount_cents: number
          cleaner_id: string
          created_at?: string
          error_message?: string | null
          id?: string
          max_retries?: number
          next_retry_at?: string | null
          payout_id: string
          retry_count?: number
          status?: string
          stripe_account_id?: string | null
          updated_at?: string
        }
        Update: {
          amount_cents?: number
          cleaner_id?: string
          created_at?: string
          error_message?: string | null
          id?: string
          max_retries?: number
          next_retry_at?: string | null
          payout_id?: string
          retry_count?: number
          status?: string
          stripe_account_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payout_retry_queue_cleaner_id_fkey"
            columns: ["cleaner_id"]
            isOneToOne: false
            referencedRelation: "cleaner_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payout_retry_queue_payout_id_fkey"
            columns: ["payout_id"]
            isOneToOne: false
            referencedRelation: "payouts"
            referencedColumns: ["id"]
          },
        ]
      }
      payouts: {
        Row: {
          amount_credits: number
          amount_usd: number | null
          cleaner_id: string
          created_at: string
          external_ref: string | null
          id: string
          metadata: Json
          processed_at: string | null
          status: Database["public"]["Enums"]["payout_status"]
        }
        Insert: {
          amount_credits: number
          amount_usd?: number | null
          cleaner_id: string
          created_at?: string
          external_ref?: string | null
          id?: string
          metadata?: Json
          processed_at?: string | null
          status?: Database["public"]["Enums"]["payout_status"]
        }
        Update: {
          amount_credits?: number
          amount_usd?: number | null
          cleaner_id?: string
          created_at?: string
          external_ref?: string | null
          id?: string
          metadata?: Json
          processed_at?: string | null
          status?: Database["public"]["Enums"]["payout_status"]
        }
        Relationships: [
          {
            foreignKeyName: "payouts_cleaner_id_fkey"
            columns: ["cleaner_id"]
            isOneToOne: false
            referencedRelation: "cleaner_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      phone_verifications: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          otp_code: string
          phone_number: string
          user_id: string
          verified_at: string | null
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          otp_code: string
          phone_number: string
          user_id: string
          verified_at?: string | null
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          otp_code?: string
          phone_number?: string
          user_id?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      photo_compliance: {
        Row: {
          after_photos: number
          before_photos: number
          bonus_applied: boolean
          cleaner_id: string
          created_at: string
          id: string
          job_id: string
          meets_minimum: boolean
          total_photos: number
        }
        Insert: {
          after_photos?: number
          before_photos?: number
          bonus_applied?: boolean
          cleaner_id: string
          created_at?: string
          id?: string
          job_id: string
          meets_minimum?: boolean
          total_photos?: number
        }
        Update: {
          after_photos?: number
          before_photos?: number
          bonus_applied?: boolean
          cleaner_id?: string
          created_at?: string
          id?: string
          job_id?: string
          meets_minimum?: boolean
          total_photos?: number
        }
        Relationships: [
          {
            foreignKeyName: "photo_compliance_cleaner_id_fkey"
            columns: ["cleaner_id"]
            isOneToOne: false
            referencedRelation: "cleaner_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photo_compliance_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_service_areas: {
        Row: {
          base_multiplier: number
          city_id: number
          created_at: string
          id: number
          is_active: boolean
          name: string
          zip_codes: string[]
        }
        Insert: {
          base_multiplier?: number
          city_id: number
          created_at?: string
          id?: number
          is_active?: boolean
          name: string
          zip_codes: string[]
        }
        Update: {
          base_multiplier?: number
          city_id?: number
          created_at?: string
          id?: number
          is_active?: boolean
          name?: string
          zip_codes?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "platform_service_areas_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_rules: {
        Row: {
          conditions: Json | null
          created_at: string
          display_label: string
          id: string
          is_active: boolean
          multiplier: number
          priority: number
          rule_name: string
          rule_type: string
          updated_at: string
        }
        Insert: {
          conditions?: Json | null
          created_at?: string
          display_label: string
          id?: string
          is_active?: boolean
          multiplier?: number
          priority?: number
          rule_name: string
          rule_type: string
          updated_at?: string
        }
        Update: {
          conditions?: Json | null
          created_at?: string
          display_label?: string
          id?: string
          is_active?: boolean
          multiplier?: number
          priority?: number
          rule_name?: string
          rule_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          phone_number: string | null
          phone_verified: boolean | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          phone_number?: string | null
          phone_verified?: boolean | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          phone_number?: string | null
          phone_verified?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
          address_line1: string
          address_line2: string | null
          bathrooms: number | null
          bedrooms: number | null
          city: string
          cleaning_score: number
          client_id: string
          country_code: string
          created_at: string
          has_kids: boolean | null
          has_pets: boolean | null
          id: number
          label: string
          last_basic_at: string | null
          last_deep_at: string | null
          last_moveout_at: string | null
          latitude: number | null
          longitude: number | null
          notes: string | null
          postal_code: string | null
          service_area_id: number | null
          square_feet: number | null
          state_region: string | null
          updated_at: string
        }
        Insert: {
          address_line1: string
          address_line2?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          city: string
          cleaning_score?: number
          client_id: string
          country_code?: string
          created_at?: string
          has_kids?: boolean | null
          has_pets?: boolean | null
          id?: number
          label: string
          last_basic_at?: string | null
          last_deep_at?: string | null
          last_moveout_at?: string | null
          latitude?: number | null
          longitude?: number | null
          notes?: string | null
          postal_code?: string | null
          service_area_id?: number | null
          square_feet?: number | null
          state_region?: string | null
          updated_at?: string
        }
        Update: {
          address_line1?: string
          address_line2?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          city?: string
          cleaning_score?: number
          client_id?: string
          country_code?: string
          created_at?: string
          has_kids?: boolean | null
          has_pets?: boolean | null
          id?: number
          label?: string
          last_basic_at?: string | null
          last_deep_at?: string | null
          last_moveout_at?: string | null
          latitude?: number | null
          longitude?: number | null
          notes?: string | null
          postal_code?: string | null
          service_area_id?: number | null
          square_feet?: number | null
          state_region?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "properties_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_service_area_id_fkey"
            columns: ["service_area_id"]
            isOneToOne: false
            referencedRelation: "platform_service_areas"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_codes: {
        Row: {
          code: string
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean
          max_uses: number | null
          referee_credits: number
          reward_credits: number
          type: string
          user_id: string
          uses_count: number
        }
        Insert: {
          code: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          referee_credits?: number
          reward_credits?: number
          type?: string
          user_id: string
          uses_count?: number
        }
        Update: {
          code?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          referee_credits?: number
          reward_credits?: number
          type?: string
          user_id?: string
          uses_count?: number
        }
        Relationships: []
      }
      referrals: {
        Row: {
          completed_at: string | null
          created_at: string
          credits_earned: number | null
          id: string
          referral_code: string
          referred_id: string | null
          referrer_id: string
          status: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          credits_earned?: number | null
          id?: string
          referral_code: string
          referred_id?: string | null
          referrer_id: string
          status?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          credits_earned?: number | null
          id?: string
          referral_code?: string
          referred_id?: string | null
          referrer_id?: string
          status?: string
        }
        Relationships: []
      }
      referrals_tracking: {
        Row: {
          created_at: string
          id: string
          jobs_completed: number
          jobs_required: number
          referee_id: string
          referee_reward: number
          referee_role: string
          referral_code: string
          referrer_id: string
          referrer_reward: number
          rewarded_at: string | null
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          jobs_completed?: number
          jobs_required?: number
          referee_id: string
          referee_reward?: number
          referee_role: string
          referral_code: string
          referrer_id: string
          referrer_reward?: number
          rewarded_at?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          jobs_completed?: number
          jobs_required?: number
          referee_id?: string
          referee_reward?: number
          referee_role?: string
          referral_code?: string
          referrer_id?: string
          referrer_reward?: number
          rewarded_at?: string | null
          status?: string
        }
        Relationships: []
      }
      reliability_history: {
        Row: {
          cleaner_id: string
          created_at: string
          id: string
          metadata: Json | null
          new_score: number
          new_tier: string
          old_score: number
          old_tier: string
          reason: string
        }
        Insert: {
          cleaner_id: string
          created_at?: string
          id?: string
          metadata?: Json | null
          new_score: number
          new_tier: string
          old_score: number
          old_tier: string
          reason: string
        }
        Update: {
          cleaner_id?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          new_score?: number
          new_tier?: string
          old_score?: number
          old_tier?: string
          reason?: string
        }
        Relationships: [
          {
            foreignKeyName: "reliability_history_cleaner_id_fkey"
            columns: ["cleaner_id"]
            isOneToOne: false
            referencedRelation: "cleaner_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reliability_snapshots: {
        Row: {
          breakdown: Json | null
          cleaner_id: string
          computed_at: string
          created_at: string
          id: string
          inputs: Json
          score: number
          tier: string | null
        }
        Insert: {
          breakdown?: Json | null
          cleaner_id: string
          computed_at?: string
          created_at?: string
          id?: string
          inputs: Json
          score: number
          tier?: string | null
        }
        Update: {
          breakdown?: Json | null
          cleaner_id?: string
          computed_at?: string
          created_at?: string
          id?: string
          inputs?: Json
          score?: number
          tier?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reliability_snapshots_cleaner_id_fkey"
            columns: ["cleaner_id"]
            isOneToOne: false
            referencedRelation: "cleaner_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reschedule_events: {
        Row: {
          bucket: Database["public"]["Enums"]["reschedule_bucket"]
          cleaner_id: string
          client_id: string
          created_at: string
          decline_reason_code: string | null
          declined_by: string | null
          hours_before_original: number
          id: number
          is_reasonable: boolean
          job_id: string
          reason_code: string | null
          requested_by: string
          requested_to: string
          status: Database["public"]["Enums"]["reschedule_status"]
          t_request: string
          t_start_new: string
          t_start_original: string
          updated_at: string
        }
        Insert: {
          bucket: Database["public"]["Enums"]["reschedule_bucket"]
          cleaner_id: string
          client_id: string
          created_at?: string
          decline_reason_code?: string | null
          declined_by?: string | null
          hours_before_original: number
          id?: number
          is_reasonable?: boolean
          job_id: string
          reason_code?: string | null
          requested_by: string
          requested_to: string
          status?: Database["public"]["Enums"]["reschedule_status"]
          t_request: string
          t_start_new: string
          t_start_original: string
          updated_at?: string
        }
        Update: {
          bucket?: Database["public"]["Enums"]["reschedule_bucket"]
          cleaner_id?: string
          client_id?: string
          created_at?: string
          decline_reason_code?: string | null
          declined_by?: string | null
          hours_before_original?: number
          id?: number
          is_reasonable?: boolean
          job_id?: string
          reason_code?: string | null
          requested_by?: string
          requested_to?: string
          status?: Database["public"]["Enums"]["reschedule_status"]
          t_request?: string
          t_start_new?: string
          t_start_original?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reschedule_events_cleaner_id_fkey"
            columns: ["cleaner_id"]
            isOneToOne: false
            referencedRelation: "cleaner_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reschedule_events_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reschedule_events_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      reschedule_reason_codes: {
        Row: {
          code: string
          created_at: string
          id: number
          is_active: boolean
          reason_text: string
          requester_type: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: number
          is_active?: boolean
          reason_text: string
          requester_type: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: number
          is_active?: boolean
          reason_text?: string
          requester_type?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          cleaner_id: string
          client_id: string
          created_at: string
          id: string
          job_id: string
          rating: number
          review_text: string | null
        }
        Insert: {
          cleaner_id: string
          client_id: string
          created_at?: string
          id?: string
          job_id: string
          rating: number
          review_text?: string | null
        }
        Update: {
          cleaner_id?: string
          client_id?: string
          created_at?: string
          id?: string
          job_id?: string
          rating?: number
          review_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_cleaner_id_fkey"
            columns: ["cleaner_id"]
            isOneToOne: false
            referencedRelation: "cleaner_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          booking_id: string | null
          created_at: string
          description: string
          id: string
          issue_type: string
          priority: string
          resolved_at: string | null
          status: string
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          booking_id?: string | null
          created_at?: string
          description: string
          id?: string
          issue_type: string
          priority?: string
          resolved_at?: string | null
          status?: string
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          booking_id?: string | null
          created_at?: string
          description?: string
          id?: string
          issue_type?: string
          priority?: string
          resolved_at?: string | null
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      team_members: {
        Row: {
          cleaner_id: string
          created_at: string | null
          id: string
          invited_by: string | null
          joined_at: string | null
          role: string | null
          status: string | null
          team_id: number
          updated_at: string | null
        }
        Insert: {
          cleaner_id: string
          created_at?: string | null
          id?: string
          invited_by?: string | null
          joined_at?: string | null
          role?: string | null
          status?: string | null
          team_id: number
          updated_at?: string | null
        }
        Update: {
          cleaner_id?: string
          created_at?: string | null
          id?: string
          invited_by?: string | null
          joined_at?: string | null
          role?: string | null
          status?: string | null
          team_id?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_members_cleaner_id_fkey"
            columns: ["cleaner_id"]
            isOneToOne: false
            referencedRelation: "cleaner_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "cleaner_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "cleaner_teams"
            referencedColumns: ["id"]
          },
        ]
      }
      user_credits: {
        Row: {
          balance: number
          created_at: string
          id: string
          total_earned: number
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string
          id?: string
          total_earned?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string
          id?: string
          total_earned?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_referral_code: { Args: never; Returns: string }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      actor_type_enum: "client" | "cleaner" | "admin" | "system"
      app_role: "client" | "cleaner" | "admin"
      availability_recurrence_enum:
        | "one_time"
        | "weekly"
        | "biweekly"
        | "monthly"
      cleaner_event_type:
        | "job_completed"
        | "job_cancelled"
        | "no_show"
        | "late_arrival"
        | "early_departure"
        | "photo_compliance"
        | "positive_review"
        | "negative_review"
      cleaning_type: "basic" | "deep" | "move_out" | "move_in"
      client_risk_band: "low" | "normal" | "elevated" | "high"
      client_risk_event_type:
        | "late_cancellation"
        | "no_show"
        | "payment_failed"
        | "dispute_filed"
        | "dispute_lost"
        | "multiple_reschedules"
      client_status_enum: "active" | "inactive" | "suspended" | "banned"
      credit_reason:
        | "purchase"
        | "refund"
        | "job_payment"
        | "job_earned"
        | "bonus"
        | "referral"
        | "cancellation_fee"
        | "dispute_refund"
        | "promo"
        | "adjustment"
      credit_transaction_type:
        | "purchase"
        | "spend"
        | "refund"
        | "hold"
        | "release"
        | "transfer"
        | "bonus"
        | "adjustment"
      dispute_status: "open" | "investigating" | "resolved" | "closed"
      job_event_type:
        | "created"
        | "assigned"
        | "confirmed"
        | "started"
        | "paused"
        | "resumed"
        | "completed"
        | "cancelled"
        | "disputed"
        | "rescheduled"
        | "photo_uploaded"
      job_status:
        | "created"
        | "pending"
        | "confirmed"
        | "in_progress"
        | "completed"
        | "cancelled"
        | "disputed"
        | "no_show"
      notification_channel: "email" | "sms" | "push" | "in_app"
      payout_status: "pending" | "processing" | "completed" | "failed"
      reliability_event_type:
        | "on_time"
        | "late"
        | "no_show"
        | "early_checkout"
        | "photo_compliant"
        | "photo_missing"
        | "positive_rating"
        | "negative_rating"
        | "cancellation"
      reschedule_bucket: "same_day" | "next_day" | "within_week" | "future"
      reschedule_status: "pending" | "accepted" | "declined" | "expired"
      sender_type: "client" | "cleaner" | "admin" | "system"
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
      actor_type_enum: ["client", "cleaner", "admin", "system"],
      app_role: ["client", "cleaner", "admin"],
      availability_recurrence_enum: [
        "one_time",
        "weekly",
        "biweekly",
        "monthly",
      ],
      cleaner_event_type: [
        "job_completed",
        "job_cancelled",
        "no_show",
        "late_arrival",
        "early_departure",
        "photo_compliance",
        "positive_review",
        "negative_review",
      ],
      cleaning_type: ["basic", "deep", "move_out", "move_in"],
      client_risk_band: ["low", "normal", "elevated", "high"],
      client_risk_event_type: [
        "late_cancellation",
        "no_show",
        "payment_failed",
        "dispute_filed",
        "dispute_lost",
        "multiple_reschedules",
      ],
      client_status_enum: ["active", "inactive", "suspended", "banned"],
      credit_reason: [
        "purchase",
        "refund",
        "job_payment",
        "job_earned",
        "bonus",
        "referral",
        "cancellation_fee",
        "dispute_refund",
        "promo",
        "adjustment",
      ],
      credit_transaction_type: [
        "purchase",
        "spend",
        "refund",
        "hold",
        "release",
        "transfer",
        "bonus",
        "adjustment",
      ],
      dispute_status: ["open", "investigating", "resolved", "closed"],
      job_event_type: [
        "created",
        "assigned",
        "confirmed",
        "started",
        "paused",
        "resumed",
        "completed",
        "cancelled",
        "disputed",
        "rescheduled",
        "photo_uploaded",
      ],
      job_status: [
        "created",
        "pending",
        "confirmed",
        "in_progress",
        "completed",
        "cancelled",
        "disputed",
        "no_show",
      ],
      notification_channel: ["email", "sms", "push", "in_app"],
      payout_status: ["pending", "processing", "completed", "failed"],
      reliability_event_type: [
        "on_time",
        "late",
        "no_show",
        "early_checkout",
        "photo_compliant",
        "photo_missing",
        "positive_rating",
        "negative_rating",
        "cancellation",
      ],
      reschedule_bucket: ["same_day", "next_day", "within_week", "future"],
      reschedule_status: ["pending", "accepted", "declined", "expired"],
      sender_type: ["client", "cleaner", "admin", "system"],
    },
  },
} as const
