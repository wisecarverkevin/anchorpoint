export interface Database {
  public: {
    Tables: {
      cornerstones: {
        Row: {
          id: string;
          name: string;
          description: string;
          icon: string;
          color: string;
          order_index: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string;
          icon?: string;
          color?: string;
          order_index: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          icon?: string;
          color?: string;
          order_index?: number;
          created_at?: string;
        };
      };
      yearly_visions: {
        Row: {
          id: string;
          cornerstone_id: string;
          year: number;
          content: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          cornerstone_id: string;
          year: number;
          content: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          cornerstone_id?: string;
          year?: number;
          content?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      quarterly_goals: {
        Row: {
          id: string;
          cornerstone_id: string;
          year: number;
          quarter: number;
          content: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          cornerstone_id: string;
          year: number;
          quarter: number;
          content: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          cornerstone_id?: string;
          year?: number;
          quarter?: number;
          content?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      monthly_milestones: {
        Row: {
          id: string;
          cornerstone_id: string;
          year: number;
          month: number;
          content: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          cornerstone_id: string;
          year: number;
          month: number;
          content: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          cornerstone_id?: string;
          year?: number;
          month?: number;
          content?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      weekly_anchors: {
        Row: {
          id: string;
          cornerstone_id: string;
          year: number;
          week: number;
          content: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          cornerstone_id: string;
          year: number;
          week: number;
          content: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          cornerstone_id?: string;
          year?: number;
          week?: number;
          content?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      journal_entries: {
        Row: {
          id: string;
          reset_type: 'clarity' | 'gratitude' | 'insight';
          content: string;
          tags: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          reset_type: 'clarity' | 'gratitude' | 'insight';
          content: string;
          tags?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          reset_type?: 'clarity' | 'gratitude' | 'insight';
          content?: string;
          tags?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          title: string;
          description: string;
          status: 'quicklist' | 'hotlist' | 'achieved';
          cornerstone_id: string;
          weekly_anchor_id: string | null;
          power_block: string;
          order_index: number;
          created_at: string;
          updated_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string;
          status?: 'quicklist' | 'hotlist' | 'achieved';
          cornerstone_id: string;
          weekly_anchor_id?: string | null;
          power_block?: string;
          order_index?: number;
          created_at?: string;
          updated_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          status?: 'quicklist' | 'hotlist' | 'achieved';
          cornerstone_id?: string;
          weekly_anchor_id?: string | null;
          power_block?: string;
          order_index?: number;
          created_at?: string;
          updated_at?: string;
          completed_at?: string | null;
        };
      };
      calendar_settings: {
        Row: {
          id: string;
          provider: 'google' | 'apple' | 'outlook';
          is_connected: boolean;
          sync_enabled: boolean;
          last_synced_at: string | null;
          access_token_encrypted: string;
          refresh_token_encrypted: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          provider: 'google' | 'apple' | 'outlook';
          is_connected?: boolean;
          sync_enabled?: boolean;
          last_synced_at?: string | null;
          access_token_encrypted?: string;
          refresh_token_encrypted?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          provider?: 'google' | 'apple' | 'outlook';
          is_connected?: boolean;
          sync_enabled?: boolean;
          last_synced_at?: string | null;
          access_token_encrypted?: string;
          refresh_token_encrypted?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      calendar_preferences: {
        Row: {
          id: string;
          auto_suggest_enabled: boolean;
          default_power_block_duration: number;
          notification_enabled: boolean;
          notification_minutes_before: number;
          work_start_time: string;
          work_end_time: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          auto_suggest_enabled?: boolean;
          default_power_block_duration?: number;
          notification_enabled?: boolean;
          notification_minutes_before?: number;
          work_start_time?: string;
          work_end_time?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          auto_suggest_enabled?: boolean;
          default_power_block_duration?: number;
          notification_enabled?: boolean;
          notification_minutes_before?: number;
          work_start_time?: string;
          work_end_time?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      scheduled_events: {
        Row: {
          id: string;
          title: string;
          description: string;
          start_time: string;
          end_time: string;
          event_type: 'power_block' | 'reset' | 'task' | 'other';
          task_id: string | null;
          journal_entry_id: string | null;
          external_calendar_id: string;
          is_synced: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string;
          start_time: string;
          end_time: string;
          event_type?: 'power_block' | 'reset' | 'task' | 'other';
          task_id?: string | null;
          journal_entry_id?: string | null;
          external_calendar_id?: string;
          is_synced?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          start_time?: string;
          end_time?: string;
          event_type?: 'power_block' | 'reset' | 'task' | 'other';
          task_id?: string | null;
          journal_entry_id?: string | null;
          external_calendar_id?: string;
          is_synced?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      support_crew_members: {
        Row: {
          id: string;
          user_id: string;
          member_email: string;
          member_phone: string;
          member_name: string;
          role: 'coach' | 'counselor' | 'accountability_partner';
          status: 'pending' | 'active' | 'declined';
          can_view_resets: boolean;
          auto_share_resets: boolean;
          invitation_token: string;
          invited_at: string;
          accepted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          member_email: string;
          member_phone?: string;
          member_name: string;
          role: 'coach' | 'counselor' | 'accountability_partner';
          status?: 'pending' | 'active' | 'declined';
          can_view_resets?: boolean;
          auto_share_resets?: boolean;
          invitation_token?: string;
          invited_at?: string;
          accepted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          member_email?: string;
          member_phone?: string;
          member_name?: string;
          role?: 'coach' | 'counselor' | 'accountability_partner';
          status?: 'pending' | 'active' | 'declined';
          can_view_resets?: boolean;
          auto_share_resets?: boolean;
          invitation_token?: string;
          invited_at?: string;
          accepted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      journal_entry_shares: {
        Row: {
          id: string;
          journal_entry_id: string;
          shared_by_user_id: string;
          shared_with_member_id: string;
          can_comment: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          journal_entry_id: string;
          shared_by_user_id: string;
          shared_with_member_id: string;
          can_comment?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          journal_entry_id?: string;
          shared_by_user_id?: string;
          shared_with_member_id?: string;
          can_comment?: boolean;
          created_at?: string;
        };
      };
      journal_entry_comments: {
        Row: {
          id: string;
          journal_entry_id: string;
          crew_member_id: string;
          comment_text: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          journal_entry_id: string;
          crew_member_id: string;
          comment_text: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          journal_entry_id?: string;
          crew_member_id?: string;
          comment_text?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      daily_core_8: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          fitness: boolean;
          fuel: boolean;
          meditation: boolean;
          memoirs: boolean;
          person_1: boolean;
          person_2: boolean;
          discovery: boolean;
          declare: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date?: string;
          fitness?: boolean;
          fuel?: boolean;
          meditation?: boolean;
          memoirs?: boolean;
          person_1?: boolean;
          person_2?: boolean;
          discovery?: boolean;
          declare?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          fitness?: boolean;
          fuel?: boolean;
          meditation?: boolean;
          memoirs?: boolean;
          person_1?: boolean;
          person_2?: boolean;
          discovery?: boolean;
          declare?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_avatar_preferences: {
        Row: {
          id: string;
          user_id: string;
          avatar_style: 'human_silhouette' | 'flame_spirit' | 'geometry_being' | 'animal_totem' | 'faith_variant';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          avatar_style?: 'human_silhouette' | 'flame_spirit' | 'geometry_being' | 'animal_totem' | 'faith_variant';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          avatar_style?: 'human_silhouette' | 'flame_spirit' | 'geometry_being' | 'animal_totem' | 'faith_variant';
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

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

export type ResetType = 'clarity' | 'gratitude' | 'insight';
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
