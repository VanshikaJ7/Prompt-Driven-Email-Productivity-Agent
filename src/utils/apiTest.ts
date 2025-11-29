import { testSupabaseConnection } from '../lib/supabase';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

export interface APIStatus {
  supabase: {
    connected: boolean;
    message: string;
  };
  anthropic: {
    connected: boolean;
    message: string;
  };
}

export async function testAPIConnections(): Promise<APIStatus> {
  const status: APIStatus = {
    supabase: {
      connected: false,
      message: 'Not tested'
    },
    anthropic: {
      connected: false,
      message: 'Not tested'
    }
  };

  // Test Supabase connection
  try {
    const isConnected = await testSupabaseConnection();
    if (isConnected) {
      status.supabase.connected = true;
      status.supabase.message = 'Connected successfully';
    } else {
      status.supabase.message = 'Unable to connect to database';
    }
  } catch (error) {
    status.supabase.message = error instanceof Error ? error.message : 'Connection failed';
  }

  // Test Gemini API connection
  try {
    if (!GEMINI_API_KEY) {
      status.anthropic.message = 'API key not configured';
    } else {
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

      if (response.ok) {
        status.anthropic.connected = true;
        status.anthropic.message = 'Connected successfully';
      } else {
        const errorData = await response.text();
        status.anthropic.message = `API error (${response.status}): ${errorData}`;
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        status.anthropic.message = 'Connection timed out';
      } else {
        status.anthropic.message = error.message;
      }
    } else {
      status.anthropic.message = 'Connection failed';
    }
  }

  return status;
}

export async function getDetailedStatus(): Promise<string> {
  console.log('Testing API connections...');
  const status = await testAPIConnections();

  let report = '=== API Connection Status ===\n\n';

  report += `Supabase Database:\n`;
  report += `  Status: ${status.supabase.connected ? '✅ Connected' : '❌ Disconnected'}\n`;
  report += `  Message: ${status.supabase.message}\n\n`;

  report += `Anthropic API:\n`;
  report += `  Status: ${status.anthropic.connected ? '✅ Connected' : '❌ Disconnected'}\n`;
  report += `  Message: ${status.anthropic.message}\n\n`;

  if (!status.supabase.connected || !status.anthropic.connected) {
    report += '=== Troubleshooting Tips ===\n';
    
    if (!status.supabase.connected) {
      report += '- Check your internet connection\n';
      report += '- Verify VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env\n';
      report += '- Ensure your Supabase project is active\n';
      report += '- Check if database migrations have been applied\n\n';
    }
    
    if (!status.anthropic.connected) {
      report += '- Check your internet connection\n';
      report += '- Verify VITE_GEMINI_API_KEY in .env\n';
      report += '- Ensure your API key has sufficient quota\n';
      report += '- Check if the API key is valid and not expired\n';
    }
  } else {
    report += 'All APIs are connected and ready! ✅';
  }

  return report;
}
