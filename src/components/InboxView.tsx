import { useState, useEffect } from 'react';
import { Loader2, Play, Trash2, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Email, ActionItem } from '../lib/supabase';
import { emailService } from '../services/emailService';
import { promptService } from '../services/promptService';
import { llmService } from '../services/llmService';
import EmailCard from './EmailCard';

export default function InboxView() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingEmailId, setProcessingEmailId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadEmails();
  }, []);

  useEffect(() => {
    if (selectedEmail) {
      loadActionItems(selectedEmail.id);
    }
  }, [selectedEmail]);

  const loadEmails = async () => {
    try {
      const data = await emailService.getAllEmails();
      setEmails(data);
      if (data.length > 0 && !selectedEmail) {
        setSelectedEmail(data[0]);
      }
    } catch (error) {
      console.error('Error loading emails:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadActionItems = async (emailId: string) => {
    try {
      const items = await emailService.getActionItems(emailId);
      setActionItems(items);
    } catch (error) {
      console.error('Error loading action items:', error);
    }
  };

  const processEmail = async (email: Email) => {
    setProcessingEmailId(email.id);
    try {
      const prompts = await promptService.getAllPrompts();
      const categorizationPrompt = prompts.find(p => p.name === 'categorization');
      const actionItemPrompt = prompts.find(p => p.name === 'action_item');

      if (!categorizationPrompt || !actionItemPrompt) {
        alert('Default prompts not found. Please configure prompts first.');
        return;
      }

      const category = await llmService.categorizeEmail(email, categorizationPrompt);
      await emailService.updateEmail(email.id, {
        category,
        is_processed: true
      });

      const extractedItems = await llmService.extractActionItems(email, actionItemPrompt);
      for (const item of extractedItems) {
        await emailService.createActionItem({
          email_id: email.id,
          task: item.task,
          deadline: item.deadline
        });
      }

      await loadEmails();
      alert('Email processed successfully!');
    } catch (error) {
      console.error('Error processing email:', email.id, error);
      alert('Error processing this email. Check console for details.');
    } finally {
      setProcessingEmailId(null);
    }
  };

  const processAllEmails = async () => {
    setIsProcessing(true);
    try {
      const prompts = await promptService.getAllPrompts();
      const categorizationPrompt = prompts.find(p => p.name === 'categorization');
      const actionItemPrompt = prompts.find(p => p.name === 'action_item');

      if (!categorizationPrompt || !actionItemPrompt) {
        alert('Default prompts not found. Please configure prompts first.');
        return;
      }

      const MAX_PASSES = 3;
      let totalProcessed = 0;
      let totalFailed = 0;

      for (let pass = 1; pass <= MAX_PASSES; pass++) {
        const currentEmails = await emailService.getAllEmails();

        let processedThisPass = 0;
        let failedThisPass = 0;

        for (const email of currentEmails) {
          // Reprocess emails that are not processed OR that have no category/are Uncategorized
          const needsProcessing =
            !email.is_processed ||
            !email.category ||
            email.category.toLowerCase() === 'uncategorized';

          if (!needsProcessing) continue;

          try {
            const category = await llmService.categorizeEmail(email, categorizationPrompt);
            await emailService.updateEmail(email.id, {
              category,
              is_processed: true
            });

            const extractedItems = await llmService.extractActionItems(email, actionItemPrompt);
            for (const item of extractedItems) {
              await emailService.createActionItem({
                email_id: email.id,
                task: item.task,
                deadline: item.deadline
              });
            }

            processedThisPass += 1;
            totalProcessed += 1;

            // Small delay to avoid hitting rate limits too quickly
            await new Promise(resolve => setTimeout(resolve, 250));
          } catch (err) {
            console.error('Error processing individual email:', email.id, err);
            failedThisPass += 1;
            totalFailed += 1;
            // Continue to next email instead of aborting the whole batch
          }
        }

        // If there were no failures or no progress this pass, stop looping
        if (failedThisPass === 0 || processedThisPass === 0) {
          break;
        }

        // Optional small pause between passes
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      await loadEmails();

      // Figure out how many emails still need processing
      const finalEmails = await emailService.getAllEmails();
      const remaining = finalEmails.filter(e => !e.is_processed || !e.category || e.category.toLowerCase() === 'uncategorized').length;

      if (remaining === 0) {
        alert('All emails processed successfully!');
      } else if (totalProcessed > 0) {
        alert(`Processed ${totalProcessed} emails. ${remaining} still need processing; check console for details.`);
      } else if (totalFailed > 0) {
        alert('All emails failed to process. Please check the console for error details.');
      } else {
        alert('No emails needed processing.');
      }
    } catch (error) {
      console.error('Error processing emails:', error);
      alert('Error processing emails. Check console for details.');
    } finally {
      setIsProcessing(false);
    }
  };

  const clearInbox = async () => {
    if (!confirm('Are you sure you want to delete all emails? This cannot be undone.')) {
      return;
    }

    try {
      await emailService.deleteAllEmails();
      setEmails([]);
      setSelectedEmail(null);
      setActionItems([]);
    } catch (error) {
      console.error('Error clearing inbox:', error);
      alert('Error clearing inbox. Check console for details.');
    }
  };

  const filteredEmails = filter === 'all'
    ? emails
    : emails.filter(e => e.category && e.category.toLowerCase() === filter.toLowerCase());

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Inbox</h2>
          <p className="text-gray-600 mt-1">
            {emails.length} emails • {emails.filter(e => e.is_processed).length} processed
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={loadEmails}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>

          <button
            onClick={processAllEmails}
            disabled={isProcessing}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center space-x-2"
          >
            {isProcessing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            <span>{isProcessing ? 'Processing...' : 'Process All'}</span>
          </button>

          <button
            onClick={clearInbox}
            className="px-4 py-2 border border-red-300 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center space-x-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear Inbox</span>
          </button>
        </div>
      </div>

      <div className="flex space-x-2">
        {['all', 'Important', 'To-Do', 'Newsletter', 'Spam'].map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === cat
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {cat === 'all' ? 'All' : cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-5 space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
          {filteredEmails.length === 0 ? (
            <div className="bg-white rounded-lg p-8 text-center text-gray-500">
              No emails found
            </div>
          ) : (
            filteredEmails.map(email => (
              <EmailCard
                key={email.id}
                email={email}
                isSelected={selectedEmail?.id === email.id}
                onClick={() => setSelectedEmail(email)}
                onProcess={() => processEmail(email)}
                isProcessing={isProcessing || processingEmailId === email.id}
              />
            ))
          )}
        </div>

        <div className="col-span-7">
          {selectedEmail ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="mb-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {selectedEmail.subject}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>From: {selectedEmail.sender_name}</span>
                      <span>•</span>
                      <span>{new Date(selectedEmail.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {selectedEmail.is_processed && (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    )}
                    <button
                      onClick={() => processEmail(selectedEmail)}
                      disabled={isProcessing || processingEmailId === selectedEmail.id}
                      className="px-3 py-1 text-xs rounded-lg border border-blue-500 text-blue-600 hover:bg-blue-50 disabled:opacity-60 disabled:cursor-not-allowed flex items-center space-x-1"
                    >
                      {processingEmailId === selectedEmail.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Play className="w-3 h-3" />
                      )}
                      <span>Process</span>
                    </button>
                  </div>
                </div>

                {selectedEmail.category && (
                  <div className="inline-block">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      selectedEmail.category === 'Important' ? 'bg-red-100 text-red-700' :
                      selectedEmail.category === 'To-Do' ? 'bg-yellow-100 text-yellow-700' :
                      selectedEmail.category === 'Newsletter' ? 'bg-blue-100 text-blue-700' :
                      selectedEmail.category === 'Spam' ? 'bg-gray-100 text-gray-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {selectedEmail.category}
                    </span>
                  </div>
                )}
              </div>

              <div className="prose max-w-none mb-6">
                <div className="whitespace-pre-wrap text-gray-700 text-sm leading-relaxed">
                  {selectedEmail.body}
                </div>
              </div>

              {actionItems.length > 0 && (
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Action Items</h4>
                  <div className="space-y-2">
                    {actionItems.map(item => (
                      <div key={item.id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{item.task}</p>
                            {item.deadline && (
                              <p className="text-xs text-gray-600 mt-1">Deadline: {item.deadline}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center text-gray-500">
              Select an email to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
