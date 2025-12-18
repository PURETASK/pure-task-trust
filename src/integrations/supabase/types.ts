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
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
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
