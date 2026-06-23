import { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import type { Cornerstone, WeeklyAnchor, TaskStatus } from '../lib/types';
import { supabase } from '../lib/supabase';

interface TaskFormProps {
  cornerstones: Cornerstone[];
  initialStatus?: TaskStatus;
  onSave: () => void;
  onCancel: () => void;
}

export function TaskForm({ cornerstones, initialStatus = 'quicklist', onSave, onCancel }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCornerstoneId, setSelectedCornerstoneId] = useState(cornerstones[0]?.id || '');
  const [powerBlock, setPowerBlock] = useState('');
  const [weeklyAnchorId, setWeeklyAnchorId] = useState<string>('');
  const [weeklyAnchors, setWeeklyAnchors] = useState<WeeklyAnchor[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const selectedCornerstone = cornerstones.find((c) => c.id === selectedCornerstoneId);

  useEffect(() => {
    if (selectedCornerstoneId) {
      fetchWeeklyAnchors(selectedCornerstoneId);
    }
  }, [selectedCornerstoneId]);

  const fetchWeeklyAnchors = async (cornerstoneId: string) => {
    const currentYear = new Date().getFullYear();
    const { data } = await supabase
      .from('weekly_anchors')
      .select('*')
      .eq('cornerstone_id', cornerstoneId)
      .eq('year', currentYear)
      .order('week', { ascending: false })
      .limit(10);

    if (data) {
      setWeeklyAnchors(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !selectedCornerstoneId) return;

    setIsSaving(true);

    await supabase.from('tasks').insert({
      title: title.trim(),
      description: description.trim(),
      status: initialStatus,
      cornerstone_id: selectedCornerstoneId,
      weekly_anchor_id: weeklyAnchorId || null,
      power_block: powerBlock.trim(),
      order_index: 0,
    });

    setIsSaving(false);
    onSave();
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">New Task</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Task Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
            placeholder="Enter task title"
            required
            autoFocus
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description (Optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 resize-none"
            placeholder="Add more details..."
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cornerstone *
          </label>
          <select
            value={selectedCornerstoneId}
            onChange={(e) => setSelectedCornerstoneId(e.target.value)}
            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
            required
          >
            {cornerstones.map((cornerstone) => (
              <option key={cornerstone.id} value={cornerstone.id}>
                {cornerstone.name}
              </option>
            ))}
          </select>
          {selectedCornerstone && (
            <div
              className="mt-2 p-2 rounded"
              style={{ backgroundColor: `${selectedCornerstone.color}10` }}
            >
              <p className="text-sm" style={{ color: selectedCornerstone.color }}>
                {selectedCornerstone.description}
              </p>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Power Block (Optional)
          </label>
          <input
            type="text"
            value={powerBlock}
            onChange={(e) => setPowerBlock(e.target.value)}
            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
            placeholder="e.g., Morning, 9-11am, Evening"
          />
        </div>

        {weeklyAnchors.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Link to Weekly Anchor (Optional)
            </label>
            <select
              value={weeklyAnchorId}
              onChange={(e) => setWeeklyAnchorId(e.target.value)}
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="">None</option>
              {weeklyAnchors.map((anchor) => (
                <option key={anchor.id} value={anchor.id}>
                  Week {anchor.week}: {anchor.content.substring(0, 50)}
                  {anchor.content.length > 50 ? '...' : ''}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={!title.trim() || !selectedCornerstoneId || isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus size={18} />
            {isSaving ? 'Creating...' : 'Create Task'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            <X size={18} className="inline mr-1" />
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
