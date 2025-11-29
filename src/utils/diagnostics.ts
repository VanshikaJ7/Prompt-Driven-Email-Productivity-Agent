import { testSupabaseConnection } from '../lib/supabase';
import { emailService } from '../services/emailService';
import { promptService } from '../services/promptService';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

export interface DiagnosticResults {
  environment: {
    supabaseUrl: boolean;
    supabaseKey: boolean;
    anthropicKey: boolean;
  };
  connectivity: {
    supabase: boolean;
    anthropic: boolean;
  };
  database: {
    emailsTable: boolean;
    promptsTable: boolean;
    emailCount: number;
    promptCount: number;
  };
  errors: string[];
}

export async function runDiagnostics(): Promise<DiagnosticResults> {
  const results: DiagnosticResults = {
    environment: {
      supabaseUrl: !!import.meta.env.VITE_SUPABASE_URL,
      supabaseKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
      anthropicKey: !!GEMINI_API_KEY
    },
    connectivity: {
      supabase: false,
      anthropic: false
    },
    database: {
      emailsTable: false,
      promptsTable: false,
      emailCount: 0,
      promptCount: 0
    },
    errors: []
  };

  // Check environment variables
  if (!results.environment.supabaseUrl) {
    results.errors.push('VITE_SUPABASE_URL is not set in .env file');
  }
  if (!results.environment.supabaseKey) {
    results.errors.push('VITE_SUPABASE_ANON_KEY is not set in .env file');
  }
  if (!results.environment.anthropicKey) {
    results.errors.push('VITE_GEMINI_API_KEY is not set in .env file');
  }

  // Test Supabase connectivity
  try {
    results.connectivity.supabase = await testSupabaseConnection();
    if (!results.connectivity.supabase) {
      results.errors.push('Cannot connect to Supabase database');
    }
  } catch (error) {
    results.errors.push(`Supabase connection error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  // Test database tables
  if (results.connectivity.supabase) {
    try {
      const emails = await emailService.getAllEmails();
      results.database.emailsTable = true;
      results.database.emailCount = emails.length;
    } catch (error) {
      results.database.emailsTable = false;
      results.errors.push(`Emails table error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    try {
      const prompts = await promptService.getAllPrompts();
      results.database.promptsTable = true;
      results.database.promptCount = prompts.length;
    } catch (error) {
      results.database.promptsTable = false;
      results.errors.push(`Prompts table error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Test Gemini API connectivity
  if (results.environment.anthropicKey) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + encodeURIComponent(GEMINI_API_KEY), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: 'test' }] }]
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      results.connectivity.anthropic = response.ok;

      if (!response.ok) {
        const errorText = await response.text();
        results.errors.push(`Gemini API error (${response.status}): ${errorText}`);
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          results.errors.push('Gemini API connection timed out');
        } else {
          results.errors.push(`Gemini API error: ${error.message}`);
        }
      }
    }
  }

  return results;
}

export function formatDiagnosticReport(results: DiagnosticResults): string {
  let report = '=== Email Productivity Agent Diagnostics ===\n\n';

  report += '1. Environment Variables:\n';
  report += `   - Supabase URL: ${results.environment.supabaseUrl ? '✅ Set' : '❌ Missing'}\n`;
  report += `   - Supabase Key: ${results.environment.supabaseKey ? '✅ Set' : '❌ Missing'}\n`;
  report += `   - Gemini Key: ${results.environment.anthropicKey ? '✅ Set' : '❌ Missing'}\\n`;

  report += '2. API Connectivity:\\n';
  report += `   - Supabase: ${results.connectivity.supabase ? '✅ Connected' : '❌ Failed'}\\n`;
  report += `   - Gemini: ${results.connectivity.anthropic ? '✅ Connected' : '❌ Failed'}\\n\\n`;

  report += '3. Database Tables:\n';
  report += `   - Emails: ${results.database.emailsTable ? `✅ Available (${results.database.emailCount} records)` : '❌ Not Found'}\n`;
  report += `   - Prompts: ${results.database.promptsTable ? `✅ Available (${results.database.promptCount} records)` : '❌ Not Found'}\n\n`;

  if (results.errors.length > 0) {
    report += '4. Errors:\n';
    results.errors.forEach((error, idx) => {
      report += `   ${idx + 1}. ${error}\n`;
    });
    report += '\n';
  }

  const allGood = results.errors.length === 0 &&
    results.connectivity.supabase &&
    results.connectivity.anthropic &&
    results.database.emailsTable &&
    results.database.promptsTable;

  if (allGood) {
    report += '✅ All checks passed! Your application is ready to use.\n';
  } else {
    report += '⚠️ Some issues were found. Please fix the errors above.\n';
  }

  return report;
}
