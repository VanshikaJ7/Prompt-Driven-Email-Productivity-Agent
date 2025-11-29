import { supabase, Email, ActionItem, Draft } from '../lib/supabase';

// Helper to format Supabase errors
function handleSupabaseError(error: any): never {
  console.error('Supabase error:', error);
  
  if (error.message?.includes('Failed to fetch')) {
    throw new Error('Unable to connect to database. Please check your internet connection.');
  }
  
  if (error.code === 'PGRST116') {
    throw new Error('Database table not found. Please ensure database migrations are applied.');
  }
  
  if (error.message?.includes('JWT')) {
    throw new Error('Invalid database credentials. Please check your Supabase configuration.');
  }
  
  throw new Error(`Database error: ${error.message || 'Unknown error'}`);
}

export const emailService = {
  async getAllEmails(): Promise<Email[]> {
    try {
      const { data, error } = await supabase
        .from('emails')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) handleSupabaseError(error);
      return data || [];
    } catch (error) {
      if (error instanceof Error && error.message.includes('Database error')) {
        throw error;
      }
      handleSupabaseError(error);
    }
  },

  async getEmailById(id: string): Promise<Email | null> {
    try {
      const { data, error } = await supabase
        .from('emails')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) handleSupabaseError(error);
      return data;
    } catch (error) {
      if (error instanceof Error && error.message.includes('Database error')) {
        throw error;
      }
      handleSupabaseError(error);
    }
  },

  async createEmail(email: Omit<Email, 'id' | 'created_at' | 'is_processed' | 'category'>): Promise<Email> {
    const { data, error } = await supabase
      .from('emails')
      .insert([email])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateEmail(id: string, updates: Partial<Email>): Promise<Email> {
    const { data, error } = await supabase
      .from('emails')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteEmail(id: string): Promise<void> {
    const { error } = await supabase
      .from('emails')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async deleteAllEmails(): Promise<void> {
    const { error } = await supabase
      .from('emails')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (error) throw error;
  },

  async getActionItems(emailId: string): Promise<ActionItem[]> {
    const { data, error } = await supabase
      .from('action_items')
      .select('*')
      .eq('email_id', emailId);

    if (error) throw error;
    return data || [];
  },

  async createActionItem(actionItem: Omit<ActionItem, 'id' | 'created_at' | 'is_completed'>): Promise<ActionItem> {
    const { data, error } = await supabase
      .from('action_items')
      .insert([actionItem])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getAllActionItems(): Promise<ActionItem[]> {
    const { data, error } = await supabase
      .from('action_items')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async updateActionItem(id: string, updates: Partial<ActionItem>): Promise<ActionItem> {
    const { data, error } = await supabase
      .from('action_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getDraftsByEmailId(emailId: string): Promise<Draft[]> {
    const { data, error } = await supabase
      .from('drafts')
      .select('*')
      .eq('email_id', emailId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getAllDrafts(): Promise<Draft[]> {
    const { data, error } = await supabase
      .from('drafts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createDraft(draft: Omit<Draft, 'id' | 'created_at' | 'updated_at'>): Promise<Draft> {
    const { data, error } = await supabase
      .from('drafts')
      .insert([draft])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateDraft(id: string, updates: Partial<Draft>): Promise<Draft> {
    const { data, error } = await supabase
      .from('drafts')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteDraft(id: string): Promise<void> {
    const { error } = await supabase
      .from('drafts')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
