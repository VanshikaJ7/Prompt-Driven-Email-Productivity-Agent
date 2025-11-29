import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false
  },
  global: {
    headers: {
      'X-Client-Info': 'email-productivity-agent'
    }
  },
  db: {
    schema: 'public'
  }
});

// Test connection function
export async function testSupabaseConnection(): Promise<boolean> {
  try {
    const { error } = await supabase.from('emails').select('count').limit(1);
    return !error;
  } catch {
    return false;
  }
}

export type Email = {
  id: string;
  sender: string;
  sender_name: string;
  subject: string;
  body: string;
  category: string;
  timestamp: string;
  is_processed: boolean;
  created_at: string;
};

export type Prompt = {
  id: string;
  name: string;
  content: string;
  description: string;
  created_at: string;
  updated_at: string;
};

export type ActionItem = {
  id: string;
  email_id: string;
  task: string;
  deadline: string;
  is_completed: boolean;
  created_at: string;
};

export type Draft = {
  id: string;
  email_id: string | null;
  subject: string;
  body: string;
  suggested_followups: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type ChatMessage = {
  id: string;
  email_id: string | null;
  user_message: string;
  agent_response: string;
  created_at: string;
};
