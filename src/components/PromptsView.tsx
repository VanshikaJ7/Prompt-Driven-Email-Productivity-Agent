import { useState, useEffect } from 'react';
import { Loader2, Save, Plus, Edit2, Trash2 } from 'lucide-react';
import { Prompt } from '../lib/supabase';
import { promptService } from '../services/promptService';

export default function PromptsView() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    content: '',
    description: ''
  });

  useEffect(() => {
    loadPrompts();
  }, []);

  const loadPrompts = async () => {
    try {
      const data = await promptService.getAllPrompts();
      setPrompts(data);
    } catch (error) {
      console.error('Error loading prompts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (prompt: Prompt) => {
    setEditingPrompt(prompt);
    setFormData({
      name: prompt.name,
      content: prompt.content,
      description: prompt.description
    });
    setIsCreating(false);
  };

  const handleCreate = () => {
    setIsCreating(true);
    setEditingPrompt(null);
    setFormData({
      name: '',
      content: '',
      description: ''
    });
  };

  const handleSave = async () => {
    try {
      if (editingPrompt) {
        await promptService.updatePrompt(editingPrompt.id, formData);
      } else {
        await promptService.createPrompt(formData);
      }

      await loadPrompts();
      setEditingPrompt(null);
      setIsCreating(false);
      setFormData({ name: '', content: '', description: '' });
    } catch (error) {
      console.error('Error saving prompt:', error);
      alert('Error saving prompt. Check console for details.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this prompt?')) {
      return;
    }

    try {
      await promptService.deletePrompt(id);
      await loadPrompts();
    } catch (error) {
      console.error('Error deleting prompt:', error);
      alert('Error deleting prompt. Check console for details.');
    }
  };

  const handleCancel = () => {
    setEditingPrompt(null);
    setIsCreating(false);
    setFormData({ name: '', content: '', description: '' });
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
          <h2 className="text-2xl font-bold text-gray-900">Prompt Configuration</h2>
          <p className="text-gray-600 mt-1">
            Customize how the agent processes and responds to emails
          </p>
        </div>

        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Prompt</span>
        </button>
      </div>

      {(isCreating || editingPrompt) && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingPrompt ? 'Edit Prompt' : 'Create New Prompt'}
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prompt Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., categorization, action_item, auto_reply"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!!editingPrompt}
              />
              <p className="text-xs text-gray-500 mt-1">
                Use lowercase with underscores. Cannot be changed after creation.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of what this prompt does"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prompt Content
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Enter the prompt instructions..."
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                This is the instruction that will be sent to the LLM
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleSave}
                disabled={!formData.name || !formData.content}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Prompt</span>
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
        {prompts.map(prompt => (
          <div
            key={prompt.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {prompt.name}
                </h3>
                <p className="text-sm text-gray-600">{prompt.description}</p>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(prompt)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(prompt.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                {prompt.content}
              </pre>
            </div>

            <div className="mt-3 text-xs text-gray-500">
              Last updated: {new Date(prompt.updated_at).toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      {prompts.length === 0 && !isCreating && (
        <div className="bg-white rounded-lg p-12 text-center text-gray-500">
          No prompts configured. Click "New Prompt" to create one.
        </div>
      )}
    </div>
  );
}
