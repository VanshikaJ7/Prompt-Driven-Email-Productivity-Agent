import { Mail, CheckCircle2, Play, Loader2 } from 'lucide-react';
import { Email } from '../lib/supabase';

interface EmailCardProps {
  email: Email;
  isSelected: boolean;
  onClick: () => void;
  onProcess?: () => void;
  isProcessing?: boolean;
}

export default function EmailCard({ email, isSelected, onClick, onProcess, isProcessing }: EmailCardProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left bg-white rounded-lg border-2 p-4 transition-all hover:shadow-md ${
        isSelected ? 'border-blue-500 shadow-md' : 'border-gray-200'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <span className="font-medium text-gray-900 truncate">{email.sender_name}</span>
        </div>
        {email.is_processed && (
          <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 ml-2" />
        )}
      </div>

      <h4 className="font-semibold text-gray-900 mb-1 line-clamp-1">
        {email.subject}
      </h4>

      <p className="text-sm text-gray-600 line-clamp-2 mb-2">
        {email.body}
      </p>

      <div className="flex items-center justify-between space-x-2">
        <span className="text-xs text-gray-500">
          {new Date(email.timestamp).toLocaleDateString()} {new Date(email.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>

        <div className="flex items-center space-x-2">
          {email.category && (
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              email.category === 'Important' ? 'bg-red-100 text-red-700' :
              email.category === 'To-Do' ? 'bg-yellow-100 text-yellow-700' :
              email.category === 'Newsletter' ? 'bg-blue-100 text-blue-700' :
              email.category === 'Spam' ? 'bg-gray-100 text-gray-700' :
              'bg-gray-100 text-gray-600'
            }`}>
              {email.category}
            </span>
          )}

          {onProcess && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (!isProcessing) onProcess();
              }}
              disabled={isProcessing}
              className="p-1 rounded-full border border-blue-500 text-blue-600 hover:bg-blue-50 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center"
              aria-label="Process this email"
            >
              {isProcessing ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Play className="w-3 h-3" />
              )}
            </button>
          )}
        </div>
      </div>
    </button>
  );
}
