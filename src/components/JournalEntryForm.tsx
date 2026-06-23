import { useState, useEffect } from 'react';
import { Save, Tag, X } from 'lucide-react';
import type { ResetType } from '../lib/types';
import { supabase } from '../lib/supabase';

interface JournalEntryFormProps {
  resetType: ResetType;
  onSave: (content: string, tags: string[]) => Promise<void>;
  onCancel: () => void;
}

interface ResetPrompt {
  id: string;
  prompt_text: string;
  order_index: number;
}

export function JournalEntryForm({ resetType, onSave, onCancel }: JournalEntryFormProps) {
  const [prompts, setPrompts] = useState<ResetPrompt[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrompts();
  }, [resetType]);

  const fetchPrompts = async () => {
    const { data, error } = await supabase
      .from('reset_prompts')
      .select('*')
      .eq('reset_type', resetType)
      .order('order_index', { ascending: true });

    if (data) {
      setPrompts(data);
      const initialAnswers: Record<string, string> = {};
      data.forEach((prompt) => {
        initialAnswers[prompt.id] = '';
      });
      setAnswers(initialAnswers);
    }
    setLoading(false);
  };

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleUpdateAnswer = (promptId: string, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [promptId]: value,
    }));
  };

  const handleSubmit = async () => {
    const answeredPrompts = Object.values(answers).filter((a) => a.trim());
    if (answeredPrompts.length === 0) return;

    const content = prompts
      .map((prompt, index) => {
        const answer = answers[prompt.id]?.trim();
        if (answer) {
          return `${index + 1}. ${prompt.prompt_text}\n${answer}`;
        }
        return '';
      })
      .filter((entry) => entry)
      .join('\n\n');

    setIsSaving(true);
    await onSave(content, tags);
    setIsSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-600 mx-auto mb-4"></div>
          <p className="text-stone-600">Loading prompts...</p>
        </div>
      </div>
    );
  }

  const hasAnswers = Object.values(answers).some((a) => a.trim());

  return (
    <div className="bg-white rounded-xl p-8 shadow-sm border border-stone-200">
      <div className="space-y-6">
        <div className="mb-8">
          <h3 className="text-2xl font-light text-stone-900 mb-2 capitalize">
            {resetType} Reset
          </h3>
          <p className="text-stone-600">
            Take your time with each question. There are no right or wrong answers.
          </p>
        </div>

        <div className="space-y-6">
          {prompts.map((prompt, index) => (
            <div key={prompt.id} className="space-y-2">
              <label className="block text-sm font-medium text-stone-700">
                {index + 1}. {prompt.prompt_text}
              </label>
              <textarea
                value={answers[prompt.id] || ''}
                onChange={(e) => handleUpdateAnswer(prompt.id, e.target.value)}
                className="w-full p-4 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-300 focus:border-transparent resize-none transition-all"
                rows={3}
                placeholder="Your response..."
                autoFocus={index === 0}
              />
            </div>
          ))}
        </div>

        <div className="border-t border-stone-200 pt-6">
          <label className="block text-sm font-medium text-stone-700 mb-3">
            Tags (Optional)
          </label>
          <div className="flex gap-2 mb-3">
            <div className="relative flex-1">
              <Tag size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full pl-10 pr-4 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-300 focus:border-transparent"
                placeholder="Add a tag and press Enter"
              />
            </div>
            <button
              onClick={handleAddTag}
              className="px-4 py-2 bg-stone-700 text-white rounded-lg font-medium hover:bg-stone-800 transition-colors"
            >
              Add
            </button>
          </div>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-stone-100 text-stone-700 rounded-full text-sm font-medium"
                >
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:bg-stone-200 rounded-full p-0.5 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <button
            onClick={handleSubmit}
            disabled={!hasAnswers || isSaving}
            className="flex items-center gap-2 px-6 py-3 bg-stone-700 text-white rounded-lg font-medium hover:bg-stone-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={18} />
            {isSaving ? 'Saving...' : 'Save Entry'}
          </button>
          <button
            onClick={onCancel}
            className="px-6 py-3 bg-stone-100 text-stone-700 rounded-lg font-medium hover:bg-stone-200 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
