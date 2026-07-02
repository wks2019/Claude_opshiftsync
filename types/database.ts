/**
 * Hand-written to match database/migrations/001_initial_schema.sql and
 * 003_security_hardening.sql exactly. Covers only the tables and
 * functions the application code actually queries. Regenerate with
 * `npm run db:types` once a live Supabase project exists; that command
 * will produce the full 31-table schema and should replace this file
 * wholesale, not merge with it.
 */
export type Database = {
  public: {
    Tables: {
      user_roles: {
        Row: {
          id: string
          user_id: string
          role_id: string
        }
        Insert: {
          id?: string
          user_id: string
          role_id: string
        }
        Update: Partial<Database['public']['Tables']['user_roles']['Row']>
        Relationships: [
          {
            foreignKeyName: 'user_roles_role_id_fkey'
            columns: ['role_id']
            isOneToOne: false
            referencedRelation: 'roles'
            referencedColumns: ['id']
          },
        ]
      }
      roles: {
        Row: {
          id: string
          name: 'guest' | 'staff' | 'manager' | 'administrator'
        }
        Insert: {
          id?: string
          name: 'guest' | 'staff' | 'manager' | 'administrator'
        }
        Update: {
          id?: string
          name?: 'guest' | 'staff' | 'manager' | 'administrator'
        }
        Relationships: []
      }
      simulations: {
        Row: {
          id: string
          hotel_group_id: string
          title: string
          type: 'in_room_dining' | 'concierge' | 'housekeeping' | 'front_office' | 'butler_service' | 'complaint_recovery' | 'vip_scenario'
          status: 'draft' | 'pending_approval' | 'published' | 'archived'
          entry_state_id: string | null
          difficulty: 'standard' | 'advanced' | 'vip'
          generated_by_ai: boolean
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['simulations']['Row']> & {
          hotel_group_id: string
          title: string
          type: 'in_room_dining' | 'concierge' | 'housekeeping' | 'front_office' | 'butler_service' | 'complaint_recovery' | 'vip_scenario'
        }
        Update: Partial<Database['public']['Tables']['simulations']['Row']>
        Relationships: []
      }
      simulation_states: {
        Row: {
          id: string
          simulation_id: string
          name: string
          guest_context: { mood?: string; request?: string; backstory?: string }
          is_terminal: boolean
          created_at: string
        }
        Insert: Partial<Database['public']['Tables']['simulation_states']['Row']> & {
          simulation_id: string
          name: string
        }
        Update: Partial<Database['public']['Tables']['simulation_states']['Row']>
        Relationships: []
      }
      simulation_choices: {
        Row: {
          id: string
          state_id: string
          label: string
          next_state_id: string
          forbes_delta: number
          lqa_delta: number
          sop_delta: number
          ei_delta: number
          sop_reference_id: string | null
          guest_reaction: { dialogue?: string; moodShift?: string }
        }
        Insert: Partial<Database['public']['Tables']['simulation_choices']['Row']> & {
          state_id: string
          label: string
          next_state_id: string
        }
        Update: Partial<Database['public']['Tables']['simulation_choices']['Row']>
        Relationships: []
      }
      simulation_sessions: {
        Row: {
          id: string
          user_id: string
          simulation_id: string
          current_state_id: string | null
          status: 'in_progress' | 'completed' | 'abandoned'
          started_at: string
          completed_at: string | null
        }
        Insert: Partial<Database['public']['Tables']['simulation_sessions']['Row']> & {
          user_id: string
          simulation_id: string
        }
        Update: Partial<Database['public']['Tables']['simulation_sessions']['Row']>
        Relationships: [
          {
            foreignKeyName: 'simulation_sessions_simulation_id_fkey'
            columns: ['simulation_id']
            isOneToOne: false
            referencedRelation: 'simulations'
            referencedColumns: ['id']
          },
        ]
      }
      simulation_session_events: {
        Row: {
          id: string
          session_id: string
          state_id: string
          choice_id: string
          event_key: string | null
          occurred_at: string
        }
        Insert: Partial<Database['public']['Tables']['simulation_session_events']['Row']> & {
          session_id: string
          state_id: string
          choice_id: string
        }
        Update: Partial<Database['public']['Tables']['simulation_session_events']['Row']>
        Relationships: []
      }
      simulation_results: {
        Row: {
          id: string
          session_id: string
          forbes_score: number
          lqa_score: number
          sop_score: number
          ei_score: number
          final_score: number
          created_at: string
        }
        Insert: Partial<Database['public']['Tables']['simulation_results']['Row']> & {
          session_id: string
          forbes_score: number
          lqa_score: number
          sop_score: number
          ei_score: number
          final_score: number
        }
        Update: Partial<Database['public']['Tables']['simulation_results']['Row']>
        Relationships: []
      }
      certificates: {
        Row: {
          id: string
          user_id: string
          course_id: string | null
          competency_id: string | null
          certificate_number: string
          qr_token: string
          storage_path: string
          issued_at: string
          revoked_at: string | null
        }
        Insert: Partial<Database['public']['Tables']['certificates']['Row']> & {
          user_id: string
          certificate_number: string
          qr_token: string
          storage_path: string
        }
        Update: Partial<Database['public']['Tables']['certificates']['Row']>
        Relationships: [
          {
            foreignKeyName: 'certificates_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'certificates_course_id_fkey'
            columns: ['course_id']
            isOneToOne: false
            referencedRelation: 'courses'
            referencedColumns: ['id']
          },
        ]
      }
      users: {
        Row: {
          id: string
          hotel_group_id: string
          hotel_id: string | null
          department_id: string | null
          team_id: string | null
          full_name: string
          email: string
          status: 'active' | 'suspended' | 'invited'
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['users']['Row']> & {
          id: string
          hotel_group_id: string
          full_name: string
          email: string
        }
        Update: Partial<Database['public']['Tables']['users']['Row']>
        Relationships: []
      }
      courses: {
        Row: {
          id: string
          hotel_group_id: string
          title: string
          description: string | null
          status: 'draft' | 'published' | 'archived'
          standard_tags: string[]
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['courses']['Row']> & {
          hotel_group_id: string
          title: string
        }
        Update: Partial<Database['public']['Tables']['courses']['Row']>
        Relationships: []
      }
      rate_limits: {
        Row: {
          bucket: string
          window_start: string
          hits: number
        }
        Insert: {
          bucket: string
          window_start: string
          hits?: number
        }
        Update: Partial<Database['public']['Tables']['rate_limits']['Row']>
        Relationships: []
      }
      audit_logs: {
        Row: {
          id: string
          hotel_group_id: string
          actor_id: string | null
          action: string
          entity_type: string
          entity_id: string
          metadata: Record<string, unknown>
          created_at: string
        }
        Insert: Partial<Database['public']['Tables']['audit_logs']['Row']> & {
          hotel_group_id: string
          action: string
          entity_type: string
          entity_id: string
        }
        Update: Partial<Database['public']['Tables']['audit_logs']['Row']>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      check_rate_limit: {
        Args: {
          p_bucket: string
          p_max_hits: number
          p_window_seconds: number
        }
        Returns: boolean
      }
      write_audit_log: {
        Args: {
          p_action: string
          p_entity_type: string
          p_entity_id: string
          p_metadata?: Record<string, unknown>
        }
        Returns: undefined
      }
      get_team_analytics: {
        Args: Record<string, never>
        Returns: {
          user_id: string
          hotel_group_id: string
          hotel_id: string | null
          department_id: string | null
          team_id: string | null
          courses_completed: number
          courses_enrolled: number
          simulations_completed: number
          avg_final_score: number | null
          avg_forbes_score: number | null
          avg_lqa_score: number | null
          avg_sop_score: number | null
          avg_ei_score: number | null
          last_simulation_at: string | null
        }[]
      }
    }
    Enums: Record<string, never>
  }
}
