import { Email, Prompt } from '../lib/supabase';
import { promptService } from './promptService';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// Helper function to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const llmService = {
  async categorizeEmail(email: Email, prompt: Prompt): Promise<string> {
    const userPrompt = `Email from: ${email.sender_name} <${email.sender}>
Subject: ${email.subject}
Body: ${email.body}

${prompt.content}`;

    try {
      const raw = await this.callClaude(userPrompt);
      return raw.trim();
    } catch (error) {
      console.error('Categorization error:', error);
      return 'Uncategorized';
    }
  },

  async extractActionItems(email: Email, prompt: Prompt): Promise<Array<{ task: string; deadline: string }>> {
    const userPrompt = `Email from: ${email.sender_name} <${email.sender}>
Subject: ${email.subject}
Body: ${email.body}

${prompt.content}`;

    try {
      const response = await this.callClaude(userPrompt);
      const parsed = JSON.parse(response);

      if (Array.isArray(parsed)) {
        return parsed;
      } else if (parsed.task) {
        return [parsed];
      }
      return [];
    } catch (error) {
      console.error('Action item extraction error:', error);
      return [];
    }
  },

  async generateReply(email: Email, prompt: Prompt, customInstructions?: string): Promise<string> {
    const userPrompt = `Original Email:
From: ${email.sender_name} <${email.sender}>
Subject: ${email.subject}
Body: ${email.body}

Instructions: ${prompt.content}
${customInstructions ? `\nAdditional instructions: ${customInstructions}` : ''}

Generate a professional reply email.`;

    try {
      const response = await this.callClaude(userPrompt);
      return response;
    } catch (error) {
      console.error('Reply generation error:', error);
      throw error;
    }
  },

  async runPromptOnEmail(prompt: Prompt, options: { email?: Email; allEmails?: Email[]; userMessage?: string }): Promise<string> {
    const { email, allEmails, userMessage } = options;

    let contextInfo = '';

    if (email) {
      contextInfo = `Email from: ${email.sender_name} <${email.sender}>
Subject: ${email.subject}
Body: ${email.body}
Category: ${email.category || 'Not categorized'}`;
    }

    if (allEmails && allEmails.length > 0) {
      contextInfo += `\n\nInbox Summary:
Total emails: ${allEmails.length}
Categories: ${this.getCategorySummary(allEmails)}`;
    }

    const userPrompt = `${contextInfo}

Prompt instructions:
${prompt.content}

${userMessage ? `Additional user instruction: ${userMessage}` : ''}`;

    return this.callClaude(userPrompt, 'You are an email assistant. Follow the provided prompt instructions exactly.');
  },

  async chatWithAgent(userMessage: string, context?: { email?: Email; allEmails?: Email[] }): Promise<string> {
    let contextInfo = '';

    if (context?.email) {
      contextInfo = `\n\nCurrent Email Context:
From: ${context.email.sender_name} <${context.email.sender}>
Subject: ${context.email.subject}
Body: ${context.email.body}
Category: ${context.email.category || 'Not categorized'}`;
    }

    if (context?.allEmails) {
      contextInfo += `\n\nInbox Summary:
Total emails: ${context.allEmails.length}
Categories: ${this.getCategorySummary(context.allEmails)}`;
    }

    // Pull stored prompts so chat behavior is fully prompt-driven
    let promptText = '';
    try {
      const prompts = await promptService.getAllPrompts();
      const categorization = prompts.find(p => p.name === 'categorization');
      const actionItem = prompts.find(p => p.name === 'action_item');
      const autoReply = prompts.find(p => p.name === 'auto_reply');

      promptText = `\n\n=== Agent Behavior Prompts ===\n` +
        `${categorization ? `Categorization prompt:\n${categorization.content}\n\n` : ''}` +
        `${actionItem ? `Action item extraction prompt:\n${actionItem.content}\n\n` : ''}` +
        `${autoReply ? `Auto-reply drafting prompt:\n${autoReply.content}\n\n` : ''}`;
    } catch (error) {
      console.error('Error loading prompts for chat:', error);
    }

    const systemPrompt = `You are an intelligent email assistant. Help the user manage their emails, answer questions about them, and perform tasks like summarizing, categorizing, and drafting replies.
Always follow the following internal prompts when reasoning about categorization, action items, and replies:${promptText}${contextInfo}`;

    try {
      const response = await this.callClaude(userMessage, systemPrompt);
      return response;
    } catch (error) {
      console.error('Chat error:', error);
      throw error;
    }
  },

  getCategorySummary(emails: Email[]): string {
    const categories = emails.reduce((acc, email) => {
      const cat = email.category || 'Uncategorized';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categories)
      .map(([cat, count]) => `${cat}: ${count}`)
      .join(', ');
  },

  async callClaude(userMessage: string, systemMessage?: string): Promise<string> {
    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured. Please set VITE_GEMINI_API_KEY in your .env file.');
    }

    let lastError: Error | null = null;

    // Retry logic
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      // Create an AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      try {
      const response = await fetch(`${GEMINI_API_URL}?key=${encodeURIComponent(GEMINI_API_KEY)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          system_instruction: systemMessage
            ? { parts: [{ text: systemMessage }] }
            : undefined,
          contents: [
            {
              role: 'user',
              parts: [{ text: userMessage }]
            }
          ]
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Gemini API error (${response.status}): ${errorText}`;
        
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.error?.message) {
            errorMessage = `Gemini API error: ${errorJson.error.message}`;
          }
        } catch {
          // If parsing fails, use the default error message
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        throw new Error('Invalid response format from Gemini API');
      }
      
      return text;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error) {
        lastError = error;
        
        // Check if it's a timeout error
        if (error.name === 'AbortError') {
          console.error(`Attempt ${attempt}/${MAX_RETRIES} - Request timed out`);
          if (attempt < MAX_RETRIES) {
            await delay(RETRY_DELAY * attempt);
            continue;
          }
          throw new Error('Request timed out after 30 seconds. Please check your internet connection and try again.');
        }
        
        // Check if it's a network error
        if (error.message.includes('fetch') || error.message.includes('network')) {
          console.error(`Attempt ${attempt}/${MAX_RETRIES} - Network error:`, error.message);
          if (attempt < MAX_RETRIES) {
            await delay(RETRY_DELAY * attempt);
            continue;
          }
          throw new Error('Network error. Please check your internet connection and try again.');
        }
        
        // For other errors, don't retry
        throw error;
      }
      
      throw new Error('Unknown error occurred while calling Gemini API');
    }
  }
  
  // If all retries failed
  throw lastError || new Error('Failed to connect to Gemini API after multiple attempts');
}
};
