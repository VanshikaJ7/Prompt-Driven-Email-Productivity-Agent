import { useState, useEffect } from 'react';
import { Loader2, Plus, Save, Trash2, Mail, Edit2, X } from 'lucide-react';
import { Draft, Email } from '../lib/supabase';
import { emailService } from '../services/emailService';
import { promptService } from '../services/promptService';
import { llmService } from '../services/llmService';

export default function DraftsView() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [emails, setEmails] = useState<Email[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingDraft, setEditingDraft] = useState<Draft | null>(null);
  const [formData, setFormData] = useState({
    email_id: null as string | null,
    subject: '',
    body: '',
    suggested_followups: '',
    metadata: {}
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [draftsData, emailsData] = await Promise.all([
        emailService.getAllDrafts(),
        emailService.getAllEmails()
      ]);
      setDrafts(draftsData);
      setEmails(emailsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setIsCreating(true);
    setEditingDraft(null);
    setFormData({
      email_id: null,
      subject: '',
      body: '',
      suggested_followups: '',
      metadata: {}
    });
  };

  const handleEdit = (draft: Draft) => {
    setEditingDraft(draft);
    setIsCreating(false);
    setFormData({
      email_id: draft.email_id,
      subject: draft.subject,
      body: draft.body,
      suggested_followups: draft.suggested_followups,
      metadata: draft.metadata
    });
  };

  const handleGenerateReply = async () => {
    if (!formData.email_id) {
      alert('Please select an email to reply to');
      return;
    }

    setIsGenerating(true);
    try {
      const email = emails.find(e => e.id === formData.email_id);
      if (!email) return;

      const prompts = await promptService.getAllPrompts();
      const replyPrompt = prompts.find(p => p.name === 'auto_reply');

      if (!replyPrompt) {
        alert('Auto-reply prompt not found. Please configure it first.');
        return;
      }

      const replyBody = await llmService.generateReply(email, replyPrompt);

      setFormData(prev => ({
        ...prev,
        subject: `Re: ${email.subject}`,
        body: replyBody,
        metadata: {
          ...(prev.metadata || {}),
          source: 'auto_reply',
          email_id: email.id,
          category: email.category || null,
          generated_at: new Date().toISOString(),
        }
      }));
    } catch (error) {
      console.error('Error generating reply:', error);
      alert('Error generating reply. Check console for details.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    try {
      const baseMetadata = {
        ...(formData.metadata || {}),
        last_saved_at: new Date().toISOString(),
        has_reply_email: !!formData.email_id,
      };

      if (editingDraft) {
        await emailService.updateDraft(editingDraft.id, { ...formData, metadata: baseMetadata });
      } else {
        await emailService.createDraft({ ...formData, metadata: baseMetadata });
      }

      await loadData();
      setIsCreating(false);
      setEditingDraft(null);
      setFormData({
        email_id: null,
        subject: '',
        body: '',
        suggested_followups: '',
        metadata: {}
      });
    } catch (error) {
      console.error('Error saving draft:', error);
      alert('Error saving draft. Check console for details.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this draft?')) {
      return;
    }

    try {
      await emailService.deleteDraft(id);
      await loadData();
    } catch (error) {
      console.error('Error deleting draft:', error);
      alert('Error deleting draft. Check console for details.');
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingDraft(null);
    setFormData({
      email_id: null,
      subject: '',
      body: '',
      suggested_followups: '',
      metadata: {}
    });
  };

  const getEmailSubject = (emailId: string | null) => {
    if (!emailId) return 'New Email';
    const email = emails.find(e => e.id === emailId);
    return email ? `Re: ${email.subject}` : 'Unknown Email';
  };

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
          <h2 className="text-2xl font-bold text-gray-900">Email Drafts</h2>
          <p className="text-gray-600 mt-1">
            {drafts.length} draft{drafts.length !== 1 ? 's' : ''} saved
          </p>
        </div>

        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Draft</span>
        </button>
      </div>

      {(isCreating || editingDraft) && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {editingDraft ? 'Edit Draft' : 'New Draft'}
            </h3>
            <button onClick={handleCancel} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reply To (Optional)
              </label>
              <div className="flex space-x-2">
                <select
                  value={formData.email_id || ''}
                  onChange={(e) => setFormData({ ...formData, email_id: e.target.value || null })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">New email (not a reply)</option>
                  {emails.map(email => (
                    <option key={email.id} value={email.id}>
                      {email.subject} - from {email.sender_name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleGenerateReply}
                  disabled={!formData.email_id || isGenerating}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center space-x-2"
                >
                  {isGenerating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Mail className="w-4 h-4" />
                  )}
                  <span>Generate</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Email subject"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Body
              </label>
              <textarea
                value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                placeholder="Email body..."
                rows={12}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Suggested Follow-ups (Optional)
              </label>
              <textarea
                value={formData.suggested_followups}
                onChange={(e) => setFormData({ ...formData, suggested_followups: e.target.value })}
                placeholder="Next steps or follow-up actions..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleSave}
                disabled={!formData.subject || !formData.body}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Draft</span>
              </button>

              <button
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {drafts.map(draft => (
          <div
            key={draft.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {draft.subject}
                </h3>
                {draft.email_id && (
                  <p className="text-sm text-gray-600 flex items-center">
                    <Mail className="w-3 h-3 mr-1" />
                    In reply to: {getEmailSubject(draft.email_id)}
                  </p>
                )}
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(draft)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(draft.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-3">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                {draft.body}
              </pre>
            </div>

            {draft.suggested_followups && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                <p className="text-xs font-medium text-blue-900 mb-1">Suggested Follow-ups:</p>
                <p className="text-sm text-blue-800">{draft.suggested_followups}</p>
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Created: {new Date(draft.created_at).toLocaleString()}</span>
              {draft.updated_at !== draft.created_at && (
                <span>Updated: {new Date(draft.updated_at).toLocaleString()}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {drafts.length === 0 && !isCreating && (
        <div className="bg-white rounded-lg p-12 text-center text-gray-500">
          No drafts yet. Click "New Draft" to create one.
        </div>
      )}
    </div>
  );
}
