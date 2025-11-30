import { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Loader2, Mail } from 'lucide-react';
import { Email, Prompt } from '../lib/supabase';
import { emailService } from '../services/emailService';
import { promptService } from '../services/promptService';
import { llmService } from '../services/llmService';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatView() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m your Email Productivity Agent. I can help you summarize emails, extract tasks, draft replies, and manage your inbox. What would you like to do?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emails, setEmails] = useState<Email[]>([]);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadData = async () => {
    try {
      const [emailData, promptData] = await Promise.all([
        emailService.getAllEmails(),
        promptService.getAllPrompts(),
      ]);
      setEmails(emailData);
      setPrompts(promptData);
    } catch (error) {
      console.error('Error loading chat data:', error);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const selectedEmail = selectedEmailId
        ? emails.find(e => e.id === selectedEmailId)
        : undefined;

      const context = {
        email: selectedEmail,
        allEmails: emails
      };

      // If the user message exactly matches a prompt name, run that prompt directly
      const matchedPrompt = prompts.find(
        (p) => p.name.toLowerCase() === userMessage.toLowerCase()
      );

      let response: string;
      if (matchedPrompt) {
        response = await llmService.runPromptOnEmail(matchedPrompt, {
          email: selectedEmail,
          allEmails: emails,
          userMessage,
        });
      } else {
        response = await llmService.chatWithAgent(userMessage, context);
      }

      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please make sure your API key is configured correctly.'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickPrompts = [
    'Summarize the email',
    'What tasks do I need to do?',
    'Draft a reply to the selected email'
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Email Agent Chat</h2>
        <p className="text-gray-600 mt-1">
          Chat with your AI assistant to manage and understand your emails
        </p>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-4 space-y-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Context Email</h3>
            <select
              value={selectedEmailId || ''}
              onChange={(e) => setSelectedEmailId(e.target.value || null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">No email selected</option>
              {emails.map(email => (
                <option key={email.id} value={email.id}>
                  {email.subject.substring(0, 50)}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-2">
              Select an email to provide context for your questions
            </p>

            {selectedEmailId && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Mail className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-blue-900 truncate">
                      {emails.find(e => e.id === selectedEmailId)?.subject}
                    </p>
                    <p className="text-xs text-blue-700 mt-1">
                      From: {emails.find(e => e.id === selectedEmailId)?.sender_name}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => setInput(prompt)}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col h-[calc(100vh-300px)]">
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((message, idx) => (
                <div
                  key={idx}
                  className={`flex items-start space-x-3 ${
                    message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}
                >
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {message.role === 'user' ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <Bot className="w-4 h-4" />
                    )}
                  </div>

                  <div
                    className={`flex-1 px-4 py-3 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">
                      {message.content}
                    </p>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="flex-1 px-4 py-3 rounded-lg bg-gray-100">
                    <Loader2 className="w-5 h-5 animate-spin text-gray-600" />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-gray-200 p-4">
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about your emails..."
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Send</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
