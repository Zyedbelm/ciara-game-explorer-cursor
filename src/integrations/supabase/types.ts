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
      admin_audit_log: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      admin_tasks: {
        Row: {
          assigned_to: string | null
          city_id: string | null
          completed_at: string | null
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string | null
          id: string
          metadata: Json | null
          priority: string | null
          status: string | null
          task_type: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          city_id?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          metadata?: Json | null
          priority?: string | null
          status?: string | null
          task_type: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          city_id?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          metadata?: Json | null
          priority?: string | null
          status?: string | null
          task_type?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_tasks_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_events: {
        Row: {
          browser: string | null
          city_id: string | null
          device_type: string | null
          event_name: string
          event_type: string
          id: string
          ip_address: unknown | null
          journey_id: string | null
          platform: string | null
          properties: Json | null
          session_id: string | null
          step_id: string | null
          timestamp: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          browser?: string | null
          city_id?: string | null
          device_type?: string | null
          event_name: string
          event_type: string
          id?: string
          ip_address?: unknown | null
          journey_id?: string | null
          platform?: string | null
          properties?: Json | null
          session_id?: string | null
          step_id?: string | null
          timestamp?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          browser?: string | null
          city_id?: string | null
          device_type?: string | null
          event_name?: string
          event_type?: string
          id?: string
          ip_address?: unknown | null
          journey_id?: string | null
          platform?: string | null
          properties?: Json | null
          session_id?: string | null
          step_id?: string | null
          timestamp?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_events_journey_id_fkey"
            columns: ["journey_id"]
            isOneToOne: false
            referencedRelation: "journeys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_events_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "steps"
            referencedColumns: ["id"]
          },
        ]
      }
      articles: {
        Row: {
          author_id: string | null
          category: string | null
          city_id: string | null
          content: string
          content_de: string | null
          content_en: string | null
          created_at: string | null
          created_by: string | null
          excerpt: string | null
          excerpt_de: string | null
          excerpt_en: string | null
          featured_image_url: string | null
          id: string
          is_featured: boolean | null
          language: string | null
          meta_description: string | null
          meta_title: string | null
          published_at: string | null
          slug: string
          status: string | null
          tags: string[] | null
          title: string
          title_de: string | null
          title_en: string | null
          updated_at: string | null
          updated_by: string | null
          view_count: number | null
        }
        Insert: {
          author_id?: string | null
          category?: string | null
          city_id?: string | null
          content: string
          content_de?: string | null
          content_en?: string | null
          created_at?: string | null
          created_by?: string | null
          excerpt?: string | null
          excerpt_de?: string | null
          excerpt_en?: string | null
          featured_image_url?: string | null
          id?: string
          is_featured?: boolean | null
          language?: string | null
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          slug: string
          status?: string | null
          tags?: string[] | null
          title: string
          title_de?: string | null
          title_en?: string | null
          updated_at?: string | null
          updated_by?: string | null
          view_count?: number | null
        }
        Update: {
          author_id?: string | null
          category?: string | null
          city_id?: string | null
          content?: string
          content_de?: string | null
          content_en?: string | null
          created_at?: string | null
          created_by?: string | null
          excerpt?: string | null
          excerpt_de?: string | null
          excerpt_en?: string | null
          featured_image_url?: string | null
          id?: string
          is_featured?: boolean | null
          language?: string | null
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          slug?: string
          status?: string | null
          tags?: string[] | null
          title?: string
          title_de?: string | null
          title_en?: string | null
          updated_at?: string | null
          updated_by?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "articles_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          audio_duration: number | null
          audio_url: string | null
          content: string
          created_at: string
          id: string
          language: string | null
          message_type: string
          metadata: Json | null
          role: string
          session_id: string
        }
        Insert: {
          audio_duration?: number | null
          audio_url?: string | null
          content: string
          created_at?: string
          id?: string
          language?: string | null
          message_type?: string
          metadata?: Json | null
          role: string
          session_id: string
        }
        Update: {
          audio_duration?: number | null
          audio_url?: string | null
          content?: string
          created_at?: string
          id?: string
          language?: string | null
          message_type?: string
          metadata?: Json | null
          role?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_sessions: {
        Row: {
          context: Json | null
          created_at: string
          expires_at: string
          id: string
          is_active: boolean
          session_key: string
          updated_at: string
          user_id: string
        }
        Insert: {
          context?: Json | null
          created_at?: string
          expires_at?: string
          id?: string
          is_active?: boolean
          session_key: string
          updated_at?: string
          user_id: string
        }
        Update: {
          context?: Json | null
          created_at?: string
          expires_at?: string
          id?: string
          is_active?: boolean
          session_key?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      cities: {
        Row: {
          country: string | null
          country_id: string
          created_at: string | null
          default_language: string | null
          description: string | null
          description_de: string | null
          description_en: string | null
          hero_image_url: string | null
          id: string
          is_active: boolean | null
          is_archived: boolean | null
          is_visible_on_homepage: boolean
          latitude: number | null
          longitude: number | null
          name: string
          name_de: string | null
          name_en: string | null
          primary_color: string | null
          secondary_color: string | null
          slug: string
          subscription_plan: string | null
          supported_languages: string[] | null
          timezone: string | null
          updated_at: string | null
        }
        Insert: {
          country?: string | null
          country_id: string
          created_at?: string | null
          default_language?: string | null
          description?: string | null
          description_de?: string | null
          description_en?: string | null
          hero_image_url?: string | null
          id?: string
          is_active?: boolean | null
          is_archived?: boolean | null
          is_visible_on_homepage?: boolean
          latitude?: number | null
          longitude?: number | null
          name: string
          name_de?: string | null
          name_en?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          slug: string
          subscription_plan?: string | null
          supported_languages?: string[] | null
          timezone?: string | null
          updated_at?: string | null
        }
        Update: {
          country?: string | null
          country_id?: string
          created_at?: string | null
          default_language?: string | null
          description?: string | null
          description_de?: string | null
          description_en?: string | null
          hero_image_url?: string | null
          id?: string
          is_active?: boolean | null
          is_archived?: boolean | null
          is_visible_on_homepage?: boolean
          latitude?: number | null
          longitude?: number | null
          name?: string
          name_de?: string | null
          name_en?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          slug?: string
          subscription_plan?: string | null
          supported_languages?: string[] | null
          timezone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cities_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
      }
      city_packages: {
        Row: {
          annual_amount_chf: number
          auto_renewal: boolean | null
          billing_period: string | null
          city_id: string
          contact_person_email: string | null
          contact_person_name: string | null
          contact_person_phone: string | null
          contract_end_date: string | null
          contract_start_date: string | null
          created_at: string | null
          created_by: string | null
          custom_terms: string | null
          features_included: Json | null
          id: string
          is_active: boolean | null
          notes: string | null
          package_type: string
          payment_status: string | null
          renewal_date: string | null
          updated_at: string | null
        }
        Insert: {
          annual_amount_chf: number
          auto_renewal?: boolean | null
          billing_period?: string | null
          city_id: string
          contact_person_email?: string | null
          contact_person_name?: string | null
          contact_person_phone?: string | null
          contract_end_date?: string | null
          contract_start_date?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_terms?: string | null
          features_included?: Json | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          package_type: string
          payment_status?: string | null
          renewal_date?: string | null
          updated_at?: string | null
        }
        Update: {
          annual_amount_chf?: number
          auto_renewal?: boolean | null
          billing_period?: string | null
          city_id?: string
          contact_person_email?: string | null
          contact_person_name?: string | null
          contact_person_phone?: string | null
          contract_end_date?: string | null
          contract_start_date?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_terms?: string | null
          features_included?: Json | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          package_type?: string
          payment_status?: string | null
          renewal_date?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "city_packages_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
      client_logos: {
        Row: {
          category: string | null
          city_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          description_de: string | null
          description_en: string | null
          display_order: number | null
          id: string
          is_active: boolean
          language: string
          logo_url: string
          name: string
          name_de: string | null
          name_en: string | null
          updated_at: string
          website_url: string | null
        }
        Insert: {
          category?: string | null
          city_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          description_de?: string | null
          description_en?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean
          language?: string
          logo_url: string
          name: string
          name_de?: string | null
          name_en?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          category?: string | null
          city_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          description_de?: string | null
          description_en?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean
          language?: string
          logo_url?: string
          name?: string
          name_de?: string | null
          name_en?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_logos_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
      config_backups: {
        Row: {
          backup_type: string
          config_data: Json
          created_at: string
          created_by: string | null
          id: string
          notes: string | null
        }
        Insert: {
          backup_type: string
          config_data: Json
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
        }
        Update: {
          backup_type?: string
          config_data?: Json
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
        }
        Relationships: []
      }
      content_documents: {
        Row: {
          ai_content: string | null
          city_id: string | null
          content: string
          created_at: string
          created_by: string | null
          description: string | null
          document_type: string | null
          file_name: string | null
          file_size: number | null
          file_url: string | null
          id: string
          is_active: boolean | null
          journey_id: string | null
          language: string | null
          mime_type: string | null
          step_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          ai_content?: string | null
          city_id?: string | null
          content: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          document_type?: string | null
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          is_active?: boolean | null
          journey_id?: string | null
          language?: string | null
          mime_type?: string | null
          step_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          ai_content?: string | null
          city_id?: string | null
          content?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          document_type?: string | null
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          is_active?: boolean | null
          journey_id?: string | null
          language?: string | null
          mime_type?: string | null
          step_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      countries: {
        Row: {
          code: string
          created_at: string
          display_order: number | null
          id: string
          is_active: boolean
          name_de: string
          name_en: string
          name_fr: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          display_order?: number | null
          id?: string
          is_active?: boolean
          name_de: string
          name_en: string
          name_fr: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          display_order?: number | null
          id?: string
          is_active?: boolean
          name_de?: string
          name_en?: string
          name_fr?: string
          updated_at?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          city_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          document_type: string | null
          file_name: string | null
          file_size: number | null
          file_url: string | null
          id: string
          is_active: boolean | null
          journey_id: string | null
          language: string | null
          mime_type: string | null
          step_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          city_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          document_type?: string | null
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          is_active?: boolean | null
          journey_id?: string | null
          language?: string | null
          mime_type?: string | null
          step_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          city_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          document_type?: string | null
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          is_active?: boolean | null
          journey_id?: string | null
          language?: string | null
          mime_type?: string | null
          step_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      email_newsletter: {
        Row: {
          created_at: string
          email: string
          id: string
          is_active: boolean
          language: string | null
          subscribed_at: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_active?: boolean
          language?: string | null
          subscribed_at?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean
          language?: string | null
          subscribed_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      journey_categories: {
        Row: {
          city_id: string | null
          color: string | null
          created_at: string | null
          description: string | null
          description_de: string | null
          description_en: string | null
          difficulty: string | null
          estimated_duration: number | null
          icon: string | null
          id: string
          language: string | null
          name: string
          name_de: string | null
          name_en: string | null
          slug: string
          type: string | null
          updated_at: string | null
        }
        Insert: {
          city_id?: string | null
          color?: string | null
          created_at?: string | null
          description?: string | null
          description_de?: string | null
          description_en?: string | null
          difficulty?: string | null
          estimated_duration?: number | null
          icon?: string | null
          id?: string
          language?: string | null
          name: string
          name_de?: string | null
          name_en?: string | null
          slug: string
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          city_id?: string | null
          color?: string | null
          created_at?: string | null
          description?: string | null
          description_de?: string | null
          description_en?: string | null
          difficulty?: string | null
          estimated_duration?: number | null
          icon?: string | null
          id?: string
          language?: string | null
          name?: string
          name_de?: string | null
          name_en?: string | null
          slug?: string
          type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "journey_categories_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
      journey_steps: {
        Row: {
          created_at: string | null
          custom_instructions: string | null
          id: number
          journey_id: string
          step_id: string
          step_order: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          custom_instructions?: string | null
          id?: number
          journey_id: string
          step_id: string
          step_order: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          custom_instructions?: string | null
          id?: number
          journey_id?: string
          step_id?: string
          step_order?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "journey_steps_journey_id_fkey"
            columns: ["journey_id"]
            isOneToOne: false
            referencedRelation: "journeys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journey_steps_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "steps"
            referencedColumns: ["id"]
          },
        ]
      }
      journeys: {
        Row: {
          accessibility_info: Json | null
          category_id: string | null
          city_id: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          description_de: string | null
          description_en: string | null
          difficulty: string | null
          distance_km: number | null
          estimated_duration: number | null
          id: string
          image_url: string | null
          is_active: boolean | null
          is_predefined: boolean | null
          language: string | null
          name: string
          name_de: string | null
          name_en: string | null
          review_notes: string | null
          review_status: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          season_availability: string[] | null
          tags: string[] | null
          thumbnail_url: string | null
          total_points: number | null
          updated_at: string | null
        }
        Insert: {
          accessibility_info?: Json | null
          category_id?: string | null
          city_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          description_de?: string | null
          description_en?: string | null
          difficulty?: string | null
          distance_km?: number | null
          estimated_duration?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_predefined?: boolean | null
          language?: string | null
          name: string
          name_de?: string | null
          name_en?: string | null
          review_notes?: string | null
          review_status?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          season_availability?: string[] | null
          tags?: string[] | null
          thumbnail_url?: string | null
          total_points?: number | null
          updated_at?: string | null
        }
        Update: {
          accessibility_info?: Json | null
          category_id?: string | null
          city_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          description_de?: string | null
          description_en?: string | null
          difficulty?: string | null
          distance_km?: number | null
          estimated_duration?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_predefined?: boolean | null
          language?: string | null
          name?: string
          name_de?: string | null
          name_en?: string | null
          review_notes?: string | null
          review_status?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          season_availability?: string[] | null
          tags?: string[] | null
          thumbnail_url?: string | null
          total_points?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "journeys_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "journey_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journeys_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
      media_files: {
        Row: {
          bucket_name: string
          created_at: string
          entity_id: string | null
          entity_type: string
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          is_active: boolean | null
          mime_type: string | null
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          bucket_name: string
          created_at?: string
          entity_id?: string | null
          entity_type: string
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          is_active?: boolean | null
          mime_type?: string | null
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          bucket_name?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          is_active?: boolean | null
          mime_type?: string | null
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string
          expires_at: string | null
          id: string
          is_read: boolean | null
          message: string
          metadata: Json | null
          priority: string | null
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          metadata?: Json | null
          priority?: string | null
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          metadata?: Json | null
          priority?: string | null
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      partner_validations: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          partner_id: string
          redemption_id: string
          updated_at: string
          validated_at: string | null
          validated_by: string | null
          validation_code: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          partner_id: string
          redemption_id: string
          updated_at?: string
          validated_at?: string | null
          validated_by?: string | null
          validation_code: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          partner_id?: string
          redemption_id?: string
          updated_at?: string
          validated_at?: string | null
          validated_by?: string | null
          validation_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_validations_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_validations_redemption_id_fkey"
            columns: ["redemption_id"]
            isOneToOne: false
            referencedRelation: "reward_redemptions"
            referencedColumns: ["id"]
          },
        ]
      }
      partners: {
        Row: {
          address: string | null
          category: string | null
          city_id: string | null
          created_at: string | null
          description: string | null
          email: string | null
          id: string
          is_active: boolean | null
          latitude: number | null
          logo_url: string | null
          longitude: number | null
          name: string
          phone: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          category?: string | null
          city_id?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          name: string
          phone?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          category?: string | null
          city_id?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          name?: string
          phone?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partners_city_id_fkey"
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
          city_id: string | null
          created_at: string | null
          current_level: number | null
          email: string
          fitness_level: string | null
          full_name: string | null
          interests: string[] | null
          preferred_language: string | null
          preferred_languages: string[] | null
          role: Database["public"]["Enums"]["user_role"] | null
          total_points: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          city_id?: string | null
          created_at?: string | null
          current_level?: number | null
          email: string
          fitness_level?: string | null
          full_name?: string | null
          interests?: string[] | null
          preferred_language?: string | null
          preferred_languages?: string[] | null
          role?: Database["public"]["Enums"]["user_role"] | null
          total_points?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          city_id?: string | null
          created_at?: string | null
          current_level?: number | null
          email?: string
          fitness_level?: string | null
          full_name?: string | null
          interests?: string[] | null
          preferred_language?: string | null
          preferred_languages?: string[] | null
          role?: Database["public"]["Enums"]["user_role"] | null
          total_points?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_questions: {
        Row: {
          bonus_points: number | null
          correct_answer: string
          created_at: string
          explanation: string | null
          explanation_de: string | null
          explanation_en: string | null
          id: string
          language: string | null
          options: Json | null
          options_de: Json | null
          options_en: Json | null
          points_awarded: number | null
          question: string
          question_de: string | null
          question_en: string | null
          question_type: string | null
          step_id: string | null
          updated_at: string
        }
        Insert: {
          bonus_points?: number | null
          correct_answer: string
          created_at?: string
          explanation?: string | null
          explanation_de?: string | null
          explanation_en?: string | null
          id?: string
          language?: string | null
          options?: Json | null
          options_de?: Json | null
          options_en?: Json | null
          points_awarded?: number | null
          question: string
          question_de?: string | null
          question_en?: string | null
          question_type?: string | null
          step_id?: string | null
          updated_at?: string
        }
        Update: {
          bonus_points?: number | null
          correct_answer?: string
          created_at?: string
          explanation?: string | null
          explanation_de?: string | null
          explanation_en?: string | null
          id?: string
          language?: string | null
          options?: Json | null
          options_de?: Json | null
          options_en?: Json | null
          points_awarded?: number | null
          question?: string
          question_de?: string | null
          question_en?: string | null
          question_type?: string | null
          step_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      reward_redemptions: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          partner_validation: string | null
          points_spent: number
          redeemed_at: string
          redemption_code: string | null
          reward_id: string
          status: string | null
          updated_at: string
          used_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          partner_validation?: string | null
          points_spent: number
          redeemed_at?: string
          redemption_code?: string | null
          reward_id: string
          status?: string | null
          updated_at?: string
          used_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          partner_validation?: string | null
          points_spent?: number
          redeemed_at?: string
          redemption_code?: string | null
          reward_id?: string
          status?: string | null
          updated_at?: string
          used_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reward_redemptions_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "rewards"
            referencedColumns: ["id"]
          },
        ]
      }
      rewards: {
        Row: {
          created_at: string | null
          description: string | null
          description_de: string | null
          description_en: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          language: string | null
          max_redemptions: number | null
          max_redemptions_per_user: number | null
          partner_id: string | null
          points_required: number | null
          terms_conditions: string | null
          title: string
          title_de: string | null
          title_en: string | null
          type: string | null
          updated_at: string | null
          validity_days: number
          value_chf: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          description_de?: string | null
          description_en?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          language?: string | null
          max_redemptions?: number | null
          max_redemptions_per_user?: number | null
          partner_id?: string | null
          points_required?: number | null
          terms_conditions?: string | null
          title: string
          title_de?: string | null
          title_en?: string | null
          type?: string | null
          updated_at?: string | null
          validity_days?: number
          value_chf?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          description_de?: string | null
          description_en?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          language?: string | null
          max_redemptions?: number | null
          max_redemptions_per_user?: number | null
          partner_id?: string | null
          points_required?: number | null
          terms_conditions?: string | null
          title?: string
          title_de?: string | null
          title_en?: string | null
          type?: string | null
          updated_at?: string | null
          validity_days?: number
          value_chf?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "rewards_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      security_config: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          key: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          key: string
          updated_at?: string | null
          value: Json
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: []
      }
      security_events: {
        Row: {
          created_at: string | null
          event_data: Json
          event_type: string
          id: string
          ip_address: unknown | null
          origin: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_data?: Json
          event_type: string
          id?: string
          ip_address?: unknown | null
          origin?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_data?: Json
          event_type?: string
          id?: string
          ip_address?: unknown | null
          origin?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      step_completions: {
        Row: {
          completed_at: string
          created_at: string
          id: string
          journey_id: string | null
          points_earned: number | null
          quiz_score: number | null
          step_id: string
          user_id: string
          validation_method: string | null
        }
        Insert: {
          completed_at?: string
          created_at?: string
          id?: string
          journey_id?: string | null
          points_earned?: number | null
          quiz_score?: number | null
          step_id: string
          user_id: string
          validation_method?: string | null
        }
        Update: {
          completed_at?: string
          created_at?: string
          id?: string
          journey_id?: string | null
          points_earned?: number | null
          quiz_score?: number | null
          step_id?: string
          user_id?: string
          validation_method?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "step_completions_journey_id_fkey"
            columns: ["journey_id"]
            isOneToOne: false
            referencedRelation: "journeys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "step_completions_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "steps"
            referencedColumns: ["id"]
          },
        ]
      }
      steps: {
        Row: {
          address: string | null
          city_id: string | null
          created_at: string | null
          description: string | null
          description_de: string | null
          description_en: string | null
          has_quiz: boolean | null
          id: string
          images: string[] | null
          is_active: boolean | null
          language: string | null
          latitude: number | null
          longitude: number | null
          media_count: number | null
          name: string
          name_de: string | null
          name_en: string | null
          points_awarded: number | null
          review_notes: string | null
          review_status: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          thumbnail_url: string | null
          type: string | null
          updated_at: string | null
          validation_radius: number | null
        }
        Insert: {
          address?: string | null
          city_id?: string | null
          created_at?: string | null
          description?: string | null
          description_de?: string | null
          description_en?: string | null
          has_quiz?: boolean | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          language?: string | null
          latitude?: number | null
          longitude?: number | null
          media_count?: number | null
          name: string
          name_de?: string | null
          name_en?: string | null
          points_awarded?: number | null
          review_notes?: string | null
          review_status?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          thumbnail_url?: string | null
          type?: string | null
          updated_at?: string | null
          validation_radius?: number | null
        }
        Update: {
          address?: string | null
          city_id?: string | null
          created_at?: string | null
          description?: string | null
          description_de?: string | null
          description_en?: string | null
          has_quiz?: boolean | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          language?: string | null
          latitude?: number | null
          longitude?: number | null
          media_count?: number | null
          name?: string
          name_de?: string | null
          name_en?: string | null
          points_awarded?: number | null
          review_notes?: string | null
          review_status?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          thumbnail_url?: string | null
          type?: string | null
          updated_at?: string | null
          validation_radius?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "steps_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
      system_logs: {
        Row: {
          context: Json | null
          created_at: string
          id: string
          ip_address: unknown | null
          level: string
          message: string
          stack_trace: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          context?: Json | null
          created_at?: string
          id?: string
          ip_address?: unknown | null
          level: string
          message: string
          stack_trace?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          context?: Json | null
          created_at?: string
          id?: string
          ip_address?: unknown | null
          level?: string
          message?: string
          stack_trace?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          updated_by?: string | null
          value: Json
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          avatar_url: string | null
          city_id: string | null
          company: string | null
          company_de: string | null
          company_en: string | null
          content: string
          content_de: string | null
          content_en: string | null
          created_at: string
          created_by: string | null
          display_order: number | null
          featured: boolean | null
          id: string
          is_active: boolean
          language: string
          name: string
          name_de: string | null
          name_en: string | null
          rating: number | null
          title: string
          title_de: string | null
          title_en: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          city_id?: string | null
          company?: string | null
          company_de?: string | null
          company_en?: string | null
          content: string
          content_de?: string | null
          content_en?: string | null
          created_at?: string
          created_by?: string | null
          display_order?: number | null
          featured?: boolean | null
          id?: string
          is_active?: boolean
          language?: string
          name: string
          name_de?: string | null
          name_en?: string | null
          rating?: number | null
          title: string
          title_de?: string | null
          title_en?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          city_id?: string | null
          company?: string | null
          company_de?: string | null
          company_en?: string | null
          content?: string
          content_de?: string | null
          content_en?: string | null
          created_at?: string
          created_by?: string | null
          display_order?: number | null
          featured?: boolean | null
          id?: string
          is_active?: boolean
          language?: string
          name?: string
          name_de?: string | null
          name_en?: string | null
          rating?: number | null
          title?: string
          title_de?: string | null
          title_en?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "testimonials_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
      travel_journals: {
        Row: {
          content: string
          created_at: string
          generated_at: string
          generation_prompt: string | null
          id: string
          is_public: boolean
          journey_id: string
          language: string
          metadata: Json | null
          title: string
          updated_at: string
          user_id: string
          user_journey_progress_id: string
        }
        Insert: {
          content: string
          created_at?: string
          generated_at?: string
          generation_prompt?: string | null
          id?: string
          is_public?: boolean
          journey_id: string
          language?: string
          metadata?: Json | null
          title: string
          updated_at?: string
          user_id: string
          user_journey_progress_id: string
        }
        Update: {
          content?: string
          created_at?: string
          generated_at?: string
          generation_prompt?: string | null
          id?: string
          is_public?: boolean
          journey_id?: string
          language?: string
          metadata?: Json | null
          title?: string
          updated_at?: string
          user_id?: string
          user_journey_progress_id?: string
        }
        Relationships: []
      }
      ui_translations: {
        Row: {
          category: string | null
          context: string | null
          created_at: string | null
          id: string
          is_approved: boolean | null
          key: string
          language: string
          updated_at: string | null
          value: string
        }
        Insert: {
          category?: string | null
          context?: string | null
          created_at?: string | null
          id?: string
          is_approved?: boolean | null
          key: string
          language: string
          updated_at?: string | null
          value: string
        }
        Update: {
          category?: string | null
          context?: string | null
          created_at?: string | null
          id?: string
          is_approved?: boolean | null
          key?: string
          language?: string
          updated_at?: string | null
          value?: string
        }
        Relationships: []
      }
      user_journey_progress: {
        Row: {
          acquired_at: string | null
          completed_at: string | null
          completion_duration: unknown | null
          created_at: string
          current_step_order: number | null
          generated_at: string | null
          generation_criteria: Json | null
          generation_source: string | null
          id: string
          is_completed: boolean | null
          journey_id: string
          quiz_responses: Json | null
          started_at: string
          status: string | null
          total_points_earned: number | null
          updated_at: string
          user_comment: string | null
          user_id: string
          user_rating: number | null
        }
        Insert: {
          acquired_at?: string | null
          completed_at?: string | null
          completion_duration?: unknown | null
          created_at?: string
          current_step_order?: number | null
          generated_at?: string | null
          generation_criteria?: Json | null
          generation_source?: string | null
          id?: string
          is_completed?: boolean | null
          journey_id: string
          quiz_responses?: Json | null
          started_at?: string
          status?: string | null
          total_points_earned?: number | null
          updated_at?: string
          user_comment?: string | null
          user_id: string
          user_rating?: number | null
        }
        Update: {
          acquired_at?: string | null
          completed_at?: string | null
          completion_duration?: unknown | null
          created_at?: string
          current_step_order?: number | null
          generated_at?: string | null
          generation_criteria?: Json | null
          generation_source?: string | null
          id?: string
          is_completed?: boolean | null
          journey_id?: string
          quiz_responses?: Json | null
          started_at?: string
          status?: string | null
          total_points_earned?: number | null
          updated_at?: string
          user_comment?: string | null
          user_id?: string
          user_rating?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_journey_progress_journey_id_fkey"
            columns: ["journey_id"]
            isOneToOne: false
            referencedRelation: "journeys"
            referencedColumns: ["id"]
          },
        ]
      }
      visitor_notifications: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          is_read: boolean | null
          message: string
          metadata: Json | null
          shown_as_toast: boolean | null
          title: string
          trigger_type: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          metadata?: Json | null
          shown_as_toast?: boolean | null
          title: string
          trigger_type: string
          type?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          metadata?: Json | null
          shown_as_toast?: boolean | null
          title?: string
          trigger_type?: string
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      approve_content: {
        Args: {
          content_type: string
          content_id: string
          approval_status: string
          review_notes?: string
        }
        Returns: boolean
      }
      backup_system_config: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      can_manage_city: {
        Args: { target_city_id: string }
        Returns: boolean
      }
      can_manage_user_profile: {
        Args: { target_user_id: string }
        Returns: boolean
      }
      can_user_redeem_reward: {
        Args: { p_reward_id: string; p_user_id?: string }
        Returns: boolean
      }
      clean_duplicate_journeys: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      cleanup_chat_data: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      cleanup_expired_notifications: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      cleanup_expired_vouchers: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      cleanup_old_analytics: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      cleanup_old_data: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      cleanup_orphaned_data: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_orphaned_media: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      cleanup_security_events: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      cleanup_unacquired_journeys: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      create_standardized_content_for_city: {
        Args: { city_name: string }
        Returns: string
      }
      create_visitor_notification: {
        Args: {
          p_user_id: string
          p_title: string
          p_message: string
          p_type?: string
          p_trigger_type?: string
          p_metadata?: Json
          p_expires_hours?: number
        }
        Returns: string
      }
      delete_user_journey_completely: {
        Args: { p_user_id: string; p_journey_id: string }
        Returns: Json
      }
      exec_sql: {
        Args: { sql: string }
        Returns: string
      }
      find_duplicate_steps: {
        Args: Record<PropertyKey, never>
        Returns: {
          step_id: string
          duplicate_count: number
          city_name: string
        }[]
      }
      generate_system_report: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_admin_dashboard_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          city_id: string
          city_name: string
          total_journeys: number
          active_journeys: number
          total_steps: number
          total_users: number
          visitors: number
          total_points_awarded: number
          total_journey_starts: number
          completed_journeys: number
          completion_rate: number
        }[]
      }
      get_admin_engagement_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          city_name: string
          city_id: string
          week_start: string
          unique_users: number
          total_events: number
          journey_events: number
          step_events: number
          completions: number
        }[]
      }
      get_admin_error_monitoring: {
        Args: Record<PropertyKey, never>
        Returns: {
          level: string
          error_count: number
          last_occurrence: string
          affected_users: string[]
        }[]
      }
      get_admin_media_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          bucket_name: string
          entity_type: string
          file_count: number
          total_size_bytes: number
          total_size_mb: number
          avg_file_size: number
          active_files: number
          last_upload: string
        }[]
      }
      get_admin_overview: {
        Args: Record<PropertyKey, never>
        Returns: {
          metric_type: string
          data: Json
        }[]
      }
      get_admin_performance_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          table_name: string
          total_records: number
          active_records: number
          avg_duration: number
          oldest_record: string
          newest_record: string
        }[]
      }
      get_ai_system_prompt: {
        Args: { lang?: string }
        Returns: string
      }
      get_city_top_explorers: {
        Args: { p_city_id: string; p_limit?: number }
        Returns: {
          user_id: string
          full_name: string
          avatar_url: string
          city_points: number
          steps_completed: number
          journeys_completed: number
          rank_position: number
        }[]
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_or_create_chat_session: {
        Args: { p_session_key: string; p_context?: Json }
        Returns: string
      }
      get_reward_redemption_stats: {
        Args: { p_reward_id: string }
        Returns: {
          total_redemptions: number
          max_redemptions: number
          user_redemptions: number
          max_redemptions_per_user: number
          can_redeem: boolean
        }[]
      }
      get_translation: {
        Args: { translation_key: string; lang?: string }
        Returns: string
      }
      get_user_city_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      implement_revised_content_plan: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      log_error: {
        Args: {
          p_level: string
          p_message: string
          p_context?: Json
          p_stack_trace?: string
        }
        Returns: string
      }
      log_security_event: {
        Args: { p_event_type: string; p_event_data?: Json; p_origin?: string }
        Returns: string
      }
      log_step_validation: {
        Args: {
          p_user_id: string
          p_step_id: string
          p_validation_method: string
          p_location?: Json
          p_success?: boolean
        }
        Returns: string
      }
      repair_journey_data: {
        Args: { p_user_id: string; p_journey_id: string }
        Returns: Json
      }
      reset_journey_for_replay: {
        Args: { p_user_id: string; p_journey_id: string }
        Returns: Json
      }
      run_daily_maintenance: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      run_maintenance: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      send_ciara_welcome_email_confirmed: {
        Args: { user_email: string; user_name?: string }
        Returns: Json
      }
      send_email_confirmation_manual: {
        Args: { p_email: string; p_redirect_url?: string }
        Returns: Json
      }
      synchronize_all_journey_data: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      synchronize_journey_data: {
        Args: { p_user_id: string; p_journey_id: string }
        Returns: Json
      }
      system_health_check: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      track_event: {
        Args: {
          p_event_type: string
          p_event_name: string
          p_user_id?: string
          p_properties?: Json
          p_city_id?: string
          p_journey_id?: string
          p_step_id?: string
        }
        Returns: string
      }
      update_user_role: {
        Args: {
          user_email: string
          new_role: Database["public"]["Enums"]["user_role"]
        }
        Returns: undefined
      }
      validate_origin: {
        Args: { p_origin: string }
        Returns: boolean
      }
    }
    Enums: {
      journey_difficulty: "easy" | "medium" | "hard" | "expert"
      journey_type:
        | "old_town"
        | "hiking"
        | "gastronomy"
        | "museum"
        | "nature"
        | "family"
        | "adventure"
        | "wellness"
        | "shopping"
        | "culture"
        | "art"
        | "wine"
        | "food"
        | "city_tour"
        | "outdoor"
        | "other"
      reward_type: "discount" | "free_item" | "upgrade" | "freebie"
      step_type:
        | "monument"
        | "landmark"
        | "museum"
        | "viewpoint"
        | "activity"
        | "restaurant"
      user_role: "super_admin" | "tenant_admin" | "visitor" | "partner"
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
      journey_difficulty: ["easy", "medium", "hard", "expert"],
      journey_type: [
        "old_town",
        "hiking",
        "gastronomy",
        "museum",
        "nature",
        "family",
        "adventure",
        "wellness",
        "shopping",
        "culture",
        "art",
        "wine",
        "food",
        "city_tour",
        "outdoor",
        "other",
      ],
      reward_type: ["discount", "free_item", "upgrade", "freebie"],
      step_type: [
        "monument",
        "landmark",
        "museum",
        "viewpoint",
        "activity",
        "restaurant",
      ],
      user_role: ["super_admin", "tenant_admin", "visitor", "partner"],
    },
  },
} as const
