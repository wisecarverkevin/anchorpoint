import { useState, useEffect } from 'react';
import { RefreshCw, BookOpen } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { ResetType, JournalEntry } from '../lib/types';
import { ResetTypeSelector } from './ResetTypeSelector';
import { JournalEntryForm } from './JournalEntryForm';
import { JournalEntriesList } from './JournalEntriesList';

export function DailyReset() {
  const [selectedResetType, setSelectedResetType] = useState<ResetType | null>(null);
  const [isWriting, setIsWriting] = useState(false);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setEntries(data);
    }
    setLoading(false);
  };

  const handleSelectResetType = (type: ResetType) => {
    setSelectedResetType(type);
    setIsWriting(true);
  };

  const handleSaveEntry = async (content: string, tags: string[]) => {
    if (!selectedResetType) return;

    const { error } = await supabase
      .from('journal_entries')
      .insert({
        reset_type: selectedResetType,
        content,
        tags,
      });

    if (!error) {
      await fetchEntries();
      setIsWriting(false);
      setSelectedResetType(null);
    }
  };

  const handleCancel = () => {
    setIsWriting(false);
    setSelectedResetType(null);
  };

  const handleStartNew = () => {
    setSelectedResetType(null);
    setIsWriting(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-600 mx-auto mb-4"></div>
          <p className="text-stone-600">Loading your journal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {!isWriting && (
        <>
          <div className="text-center">
            <h2 className="text-3xl font-light text-stone-900 mb-3">Daily Reset</h2>
            <p className="text-lg text-stone-600 max-w-2xl mx-auto">
              Take a moment to reset, reflect, and refocus with guided journaling
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-sm border border-stone-200">
            <h3 className="text-xl font-medium text-stone-900 mb-6 text-center">
              Choose Your Reset
            </h3>
            <ResetTypeSelector
              selectedType={selectedResetType}
              onSelect={handleSelectResetType}
            />
          </div>
        </>
      )}

      {isWriting && selectedResetType && (
        <div>
          <JournalEntryForm
            resetType={selectedResetType}
            onSave={handleSaveEntry}
            onCancel={handleCancel}
          />
        </div>
      )}

      {!isWriting && entries.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <BookOpen size={24} className="text-stone-600" />
              <h3 className="text-xl font-medium text-stone-900">
                Past Entries
              </h3>
            </div>
            {!isWriting && (
              <button
                onClick={handleStartNew}
                className="px-4 py-2 bg-stone-700 text-white rounded-lg font-medium hover:bg-stone-800 transition-colors"
              >
                New Entry
              </button>
            )}
          </div>
          <JournalEntriesList entries={entries} />
        </div>
      )}
    </div>
  );
}
