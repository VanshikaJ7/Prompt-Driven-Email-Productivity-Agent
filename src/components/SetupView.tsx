import { Inbox, Sparkles } from 'lucide-react';

interface SetupViewProps {
  onSetupComplete: () => void;
}

export default function SetupView({ onSetupComplete }: SetupViewProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Inbox className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Email Productivity Agent
          </h1>
          <p className="text-lg text-gray-600">
            Your intelligent assistant for managing emails efficiently
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
            <Sparkles className="w-5 h-5 mr-2" />
            What this agent can do:
          </h2>
          <ul className="space-y-2 text-blue-800">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Automatically categorize emails into Important, Newsletter, Spam, and To-Do</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Extract action items and deadlines from your emails</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Generate draft replies based on context and your preferences</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Chat with an AI agent to query and manage your inbox</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Customize prompts to control the agent's behavior</span>
            </li>
          </ul>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <h3 className="font-semibold text-gray-900 mb-2">Getting Started</h3>
          <p className="text-gray-600 mb-4">
            Click the button below to load 20 sample emails and default prompt templates.
            You can customize everything later from the Prompts section.
          </p>
          <div className="text-sm text-gray-500">
            <p className="mb-1">This will initialize:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>20 mock emails with various types of content</li>
              <li>3 default prompt templates (Categorization, Action Items, Auto-Reply)</li>
            </ul>
          </div>
        </div>

        <button
          onClick={onSetupComplete}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
        >
          <Sparkles className="w-5 h-5" />
          <span>Load Mock Inbox & Initialize</span>
        </button>
      </div>
    </div>
  );
}
