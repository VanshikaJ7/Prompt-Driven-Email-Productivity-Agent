import { useState, useEffect } from 'react';
import { Mail, Settings, MessageSquare, FileText, Loader2 } from 'lucide-react';
import InboxView from './components/InboxView';
import PromptsView from './components/PromptsView';
import ChatView from './components/ChatView';
import DraftsView from './components/DraftsView';
import SetupView from './components/SetupView';
import { promptService } from './services/promptService';
import { emailService } from './services/emailService';
import { defaultPrompts, mockEmails } from './data/seedData';
import { testAPIConnections } from './utils/apiTest';

type View = 'inbox' | 'prompts' | 'chat' | 'drafts';

function App() {
  const [currentView, setCurrentView] = useState<View>('inbox');
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkInitialization();
  }, []);

  const checkInitialization = async () => {
    try {
      // First test API connections
      const apiStatus = await testAPIConnections();
      
      if (!apiStatus.supabase.connected) {
        console.error('Supabase connection failed:', apiStatus.supabase.message);
        alert(`Database connection failed: ${apiStatus.supabase.message}\n\nPlease check your .env configuration and internet connection.`);
        setIsLoading(false);
        return;
      }
      
      if (!apiStatus.anthropic.connected) {
        console.warn('Anthropic API connection failed:', apiStatus.anthropic.message);
        console.warn('You can still view emails, but AI features will not work.');
      }
      
      const prompts = await promptService.getAllPrompts();
      const emails = await emailService.getAllEmails();

      setIsInitialized(prompts.length > 0 || emails.length > 0);
    } catch (error) {
      console.error('Error checking initialization:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to initialize: ${errorMessage}\n\nPlease check the console for more details.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetupComplete = async () => {
    try {
      const existingPrompts = await promptService.getAllPrompts();

      if (existingPrompts.length === 0) {
        for (const prompt of defaultPrompts) {
          await promptService.createPrompt(prompt);
        }
      }

      for (const email of mockEmails) {
        await emailService.createEmail(email);
      }

      setIsInitialized(true);
    } catch (error) {
      console.error('Setup error:', error);
      alert('Failed to initialize the system. Please check the console for errors.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!isInitialized) {
    return <SetupView onSetupComplete={handleSetupComplete} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Mail className="w-8 h-8 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">Email Productivity Agent</h1>
            </div>

            <nav className="flex space-x-1">
              <button
                onClick={() => setCurrentView('inbox')}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                  currentView === 'inbox'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Mail className="w-5 h-5" />
                <span className="font-medium">Inbox</span>
              </button>

              <button
                onClick={() => setCurrentView('chat')}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                  currentView === 'chat'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <MessageSquare className="w-5 h-5" />
                <span className="font-medium">Email Agent</span>
              </button>

              <button
                onClick={() => setCurrentView('drafts')}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                  currentView === 'drafts'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <FileText className="w-5 h-5" />
                <span className="font-medium">Drafts</span>
              </button>

              <button
                onClick={() => setCurrentView('prompts')}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                  currentView === 'prompts'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Settings className="w-5 h-5" />
                <span className="font-medium">Prompts</span>
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'inbox' && <InboxView />}
        {currentView === 'prompts' && <PromptsView />}
        {currentView === 'chat' && <ChatView />}
        {currentView === 'drafts' && <DraftsView />}
      </main>
    </div>
  );
}

export default App;
