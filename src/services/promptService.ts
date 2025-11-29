import { supabase, Prompt } from '../lib/supabase';

// Helper to format Supabase errors
function handleSupabaseError(error: any, context: string): never {
  console.error(`Supabase error in ${context}:`, error);
  
  if (error.message?.includes('Failed to fetch')) {
    throw new Error('Unable to connect to database. Please check your internet connection.');
  }
  
  if (error.code === 'PGRST116') {
    throw new Error('Prompts table not found. Please ensure database migrations are applied.');
  }
  
  if (error.message?.includes('JWT')) {
    throw new Error('Invalid database credentials. Please check your Supabase configuration.');
  }
  
  throw new Error(`Database error: ${error.message || 'Unknown error'}`);
}

export const promptService = {
  async getAllPrompts(): Promise<Prompt[]> {
    try {
      const { data, error } = await supabase
        .from('prompts')
        .select('*')
        .order('name');

      if (error) handleSupabaseError(error, 'getAllPrompts');
      return data || [];
    } catch (error) {
      if (error instanceof Error && error.message.includes('Database error')) {
        throw error;
      }
      handleSupabaseError(error, 'getAllPrompts');
    }
  },

  async getPromptByName(name: string): Promise<Prompt | null> {
    const { data, error } = await supabase
      .from('prompts')
      .select('*')
      .eq('name', name)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async createPrompt(prompt: Omit<Prompt, 'id' | 'created_at' | 'updated_at'>): Promise<Prompt> {
    const { data, error } = await supabase
      .from('prompts')
      .insert([prompt])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updatePrompt(id: string, updates: Partial<Omit<Prompt, 'id' | 'created_at'>>): Promise<Prompt> {
    const { data, error } = await supabase
      .from('prompts')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deletePrompt(id: string): Promise<void> {
    const { error } = await supabase
      .from('prompts')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
