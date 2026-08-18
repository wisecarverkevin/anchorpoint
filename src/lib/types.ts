/*
  Database types generated from the live schema with:
    supabase gen types typescript --project-id cbxdsvhhygpdnyvapigf

  Regenerate after any migration. Hand-written domain aliases live below the
  generated block and are preserved across regeneration.
*/

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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      calendar_preferences: {
        Row: {
          auto_suggest_enabled: boolean | null
          created_at: string | null
          default_power_block_duration: number | null
          id: string
          notification_enabled: boolean | null
          notification_minutes_before: number | null
          updated_at: string | null
          user_id: string
          work_end_time: string | null
          work_start_time: string | null
        }
        Insert: {
          auto_suggest_enabled?: boolean | null
          created_at?: string | null
          default_power_block_duration?: number | null
          id?: string
          notification_enabled?: boolean | null
          notification_minutes_before?: number | null
          updated_at?: string | null
          user_id?: string
          work_end_time?: string | null
          work_start_time?: string | null
        }
        Update: {
          auto_suggest_enabled?: boolean | null
          created_at?: string | null
          default_power_block_duration?: number | null
          id?: string
          notification_enabled?: boolean | null
          notification_minutes_before?: number | null
          updated_at?: string | null
          user_id?: string
          work_end_time?: string | null
          work_start_time?: string | null
        }
        Relationships: []
      }
      calendar_settings: {
        Row: {
          access_token_encrypted: string | null
          created_at: string | null
          id: string
          is_connected: boolean | null
          last_synced_at: string | null
          provider: string
          refresh_token_encrypted: string | null
          sync_enabled: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token_encrypted?: string | null
          created_at?: string | null
          id?: string
          is_connected?: boolean | null
          last_synced_at?: string | null
          provider: string
          refresh_token_encrypted?: string | null
          sync_enabled?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Update: {
          access_token_encrypted?: string | null
          created_at?: string | null
          id?: string
          is_connected?: boolean | null
          last_synced_at?: string | null
          provider?: string
          refresh_token_encrypted?: string | null
          sync_enabled?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      cornerstones: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
          order_index: number
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          order_index: number
          user_id?: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          order_index?: number
          user_id?: string
        }
        Relationships: []
      }
      daily_checkins: {
        Row: {
          carrying: string
          created_at: string
          date: string
          id: string
          sleep_quality: string
          user_id: string
        }
        Insert: {
          carrying: string
          created_at?: string
          date: string
          id?: string
          sleep_quality: string
          user_id?: string
        }
        Update: {
          carrying?: string
          created_at?: string
          date?: string
          id?: string
          sleep_quality?: string
          user_id?: string
        }
        Relationships: []
      }
      daily_core_8: {
        Row: {
          created_at: string
          date: string
          declare: boolean
          discovery: boolean
          fitness: boolean
          fuel: boolean
          id: string
          meditation: boolean
          memoirs: boolean
          notes: Json
          person_1: boolean
          person_2: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date?: string
          declare?: boolean
          discovery?: boolean
          fitness?: boolean
          fuel?: boolean
          id?: string
          meditation?: boolean
          memoirs?: boolean
          notes?: Json
          person_1?: boolean
          person_2?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          declare?: boolean
          discovery?: boolean
          fitness?: boolean
          fuel?: boolean
          id?: string
          meditation?: boolean
          memoirs?: boolean
          notes?: Json
          person_1?: boolean
          person_2?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      journal_entries: {
        Row: {
          content: string
          created_at: string | null
          id: string
          reset_type: string
          tags: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          reset_type: string
          tags?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          reset_type?: string
          tags?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      journal_entry_comments: {
        Row: {
          comment_text: string
          created_at: string | null
          crew_member_id: string
          id: string
          journal_entry_id: string
          updated_at: string | null
        }
        Insert: {
          comment_text: string
          created_at?: string | null
          crew_member_id: string
          id?: string
          journal_entry_id: string
          updated_at?: string | null
        }
        Update: {
          comment_text?: string
          created_at?: string | null
          crew_member_id?: string
          id?: string
          journal_entry_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "journal_entry_comments_crew_member_id_fkey"
            columns: ["crew_member_id"]
            isOneToOne: false
            referencedRelation: "support_crew_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_entry_comments_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      journal_entry_shares: {
        Row: {
          can_comment: boolean | null
          created_at: string | null
          id: string
          journal_entry_id: string
          shared_by_user_id: string
          shared_with_member_id: string
        }
        Insert: {
          can_comment?: boolean | null
          created_at?: string | null
          id?: string
          journal_entry_id: string
          shared_by_user_id: string
          shared_with_member_id: string
        }
        Update: {
          can_comment?: boolean | null
          created_at?: string | null
          id?: string
          journal_entry_id?: string
          shared_by_user_id?: string
          shared_with_member_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "journal_entry_shares_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_entry_shares_shared_with_member_id_fkey"
            columns: ["shared_with_member_id"]
            isOneToOne: false
            referencedRelation: "support_crew_members"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_milestones: {
        Row: {
          content: string
          cornerstone_id: string
          created_at: string | null
          id: string
          month: number
          updated_at: string | null
          user_id: string
          year: number
        }
        Insert: {
          content: string
          cornerstone_id: string
          created_at?: string | null
          id?: string
          month: number
          updated_at?: string | null
          user_id?: string
          year: number
        }
        Update: {
          content?: string
          cornerstone_id?: string
          created_at?: string | null
          id?: string
          month?: number
          updated_at?: string | null
          user_id?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "monthly_milestones_cornerstone_id_user_id_fkey"
            columns: ["cornerstone_id", "user_id"]
            isOneToOne: false
            referencedRelation: "cornerstones"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      quarterly_goals: {
        Row: {
          content: string
          cornerstone_id: string
          created_at: string | null
          id: string
          quarter: number
          updated_at: string | null
          user_id: string
          year: number
        }
        Insert: {
          content: string
          cornerstone_id: string
          created_at?: string | null
          id?: string
          quarter: number
          updated_at?: string | null
          user_id?: string
          year: number
        }
        Update: {
          content?: string
          cornerstone_id?: string
          created_at?: string | null
          id?: string
          quarter?: number
          updated_at?: string | null
          user_id?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "quarterly_goals_cornerstone_id_user_id_fkey"
            columns: ["cornerstone_id", "user_id"]
            isOneToOne: false
            referencedRelation: "cornerstones"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      reset_prompts: {
        Row: {
          created_at: string | null
          id: string
          order_index: number
          prompt_text: string
          reset_type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          order_index?: number
          prompt_text: string
          reset_type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          order_index?: number
          prompt_text?: string
          reset_type?: string
        }
        Relationships: []
      }
      scheduled_events: {
        Row: {
          created_at: string | null
          description: string | null
          end_time: string
          event_type: Database["public"]["Enums"]["event_type"]
          external_calendar_id: string | null
          id: string
          is_synced: boolean | null
          journal_entry_id: string | null
          start_time: string
          task_id: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          end_time: string
          event_type?: Database["public"]["Enums"]["event_type"]
          external_calendar_id?: string | null
          id?: string
          is_synced?: boolean | null
          journal_entry_id?: string | null
          start_time: string
          task_id?: string | null
          title: string
          updated_at?: string | null
          user_id?: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          end_time?: string
          event_type?: Database["public"]["Enums"]["event_type"]
          external_calendar_id?: string | null
          id?: string
          is_synced?: boolean | null
          journal_entry_id?: string | null
          start_time?: string
          task_id?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_events_journal_entry_id_user_id_fkey"
            columns: ["journal_entry_id", "user_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "scheduled_events_task_id_user_id_fkey"
            columns: ["task_id", "user_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      support_crew_members: {
        Row: {
          accepted_at: string | null
          auto_share_resets: boolean | null
          can_view_resets: boolean | null
          created_at: string | null
          id: string
          invitation_token: string | null
          invited_at: string | null
          member_email: string
          member_name: string
          member_phone: string | null
          role: string
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          accepted_at?: string | null
          auto_share_resets?: boolean | null
          can_view_resets?: boolean | null
          created_at?: string | null
          id?: string
          invitation_token?: string | null
          invited_at?: string | null
          member_email: string
          member_name: string
          member_phone?: string | null
          role: string
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          accepted_at?: string | null
          auto_share_resets?: boolean | null
          can_view_resets?: boolean | null
          created_at?: string | null
          id?: string
          invitation_token?: string | null
          invited_at?: string | null
          member_email?: string
          member_name?: string
          member_phone?: string | null
          role?: string
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          completed_at: string | null
          cornerstone_id: string
          created_at: string | null
          description: string | null
          id: string
          order_index: number
          power_block: string | null
          status: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at: string | null
          user_id: string
          weekly_anchor_id: string | null
        }
        Insert: {
          completed_at?: string | null
          cornerstone_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          order_index?: number
          power_block?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at?: string | null
          user_id?: string
          weekly_anchor_id?: string | null
        }
        Update: {
          completed_at?: string | null
          cornerstone_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          order_index?: number
          power_block?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          title?: string
          updated_at?: string | null
          user_id?: string
          weekly_anchor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_cornerstone_id_user_id_fkey"
            columns: ["cornerstone_id", "user_id"]
            isOneToOne: false
            referencedRelation: "cornerstones"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "tasks_weekly_anchor_id_fkey"
            columns: ["weekly_anchor_id"]
            isOneToOne: false
            referencedRelation: "weekly_anchors"
            referencedColumns: ["id"]
          },
        ]
      }
      user_avatar_preferences: {
        Row: {
          avatar_style: string
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_style?: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_style?: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      weekly_anchors: {
        Row: {
          content: string
          cornerstone_id: string
          created_at: string | null
          id: string
          updated_at: string | null
          user_id: string
          week: number
          year: number
        }
        Insert: {
          content: string
          cornerstone_id: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
          week: number
          year: number
        }
        Update: {
          content?: string
          cornerstone_id?: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
          week?: number
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "weekly_anchors_cornerstone_id_user_id_fkey"
            columns: ["cornerstone_id", "user_id"]
            isOneToOne: false
            referencedRelation: "cornerstones"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      yearly_visions: {
        Row: {
          content: string
          cornerstone_id: string
          created_at: string | null
          id: string
          updated_at: string | null
          user_id: string
          year: number
        }
        Insert: {
          content: string
          cornerstone_id: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
          year: number
        }
        Update: {
          content?: string
          cornerstone_id?: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "yearly_visions_cornerstone_id_user_id_fkey"
            columns: ["cornerstone_id", "user_id"]
            isOneToOne: false
            referencedRelation: "cornerstones"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      seed_default_cornerstones: {
        Args: { target_user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      event_type: "power_block" | "reset" | "task" | "other"
      task_status: "quicklist" | "hotlist" | "achieved"
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
      event_type: ["power_block", "reset", "task", "other"],
      task_status: ["quicklist", "hotlist", "achieved"],
    },
  },
} as const

export type Cornerstone = Database['public']['Tables']['cornerstones']['Row'];
export type YearlyVision = Database['public']['Tables']['yearly_visions']['Row'];
export type QuarterlyGoal = Database['public']['Tables']['quarterly_goals']['Row'];
export type MonthlyMilestone = Database['public']['Tables']['monthly_milestones']['Row'];
export type WeeklyAnchor = Database['public']['Tables']['weekly_anchors']['Row'];
export type JournalEntry = Database['public']['Tables']['journal_entries']['Row'];
export type Task = Database['public']['Tables']['tasks']['Row'];
export type CalendarSettings = Database['public']['Tables']['calendar_settings']['Row'];
export type CalendarPreferences = Database['public']['Tables']['calendar_preferences']['Row'];
export type ScheduledEvent = Database['public']['Tables']['scheduled_events']['Row'];
export type SupportCrewMember = Database['public']['Tables']['support_crew_members']['Row'];
export type JournalEntryShare = Database['public']['Tables']['journal_entry_shares']['Row'];
export type JournalEntryComment = Database['public']['Tables']['journal_entry_comments']['Row'];
export type DailyCore8 = Database['public']['Tables']['daily_core_8']['Row'];
export type UserAvatarPreferences = Database['public']['Tables']['user_avatar_preferences']['Row'];

/*
  The primary emotion family a reset was filed under. Mirrors the CHECK
  constraint on journal_entries.reset_type (see the 20260815000000 migration).
  'unspecified' covers a completed reset where no feeling was named.
*/
export type ResetType = 'anger' | 'fear' | 'sadness' | 'joy' | 'confusion' | 'unspecified';
export type TaskStatus = 'quicklist' | 'hotlist' | 'achieved';
export type CalendarProvider = 'google' | 'apple' | 'outlook';
export type EventType = 'power_block' | 'reset' | 'task' | 'other';
export type CrewRole = 'coach' | 'counselor' | 'accountability_partner';
export type CrewMemberStatus = 'pending' | 'active' | 'declined';
export type AvatarStyle = 'human_silhouette' | 'flame_spirit' | 'geometry_being' | 'animal_totem' | 'faith_variant';
export type AvatarStage = 'still' | 'centered' | 'rising' | 'awakened' | 'energized' | 'empowered' | 'radiant' | 'ascended' | 'anchorpoint';

export interface TimeSlot {
  start: Date;
  end: Date;
  duration: number;
}

export interface SuggestedSlot extends TimeSlot {
  score: number;
  reason: string;
}

export interface JournalEntryWithShares extends JournalEntry {
  shares?: JournalEntryShare[];
  comments?: JournalEntryComment[];
}

export interface AvatarStageInfo {
  stage: AvatarStage;
  name: string;
  affirmation: string;
  progress: number;
}
