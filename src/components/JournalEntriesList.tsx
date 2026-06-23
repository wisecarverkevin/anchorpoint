import { useState, useMemo, useEffect } from 'react';
import { Calendar, Filter, Tag, Share2, Users, X } from 'lucide-react';
import type { JournalEntry, ResetType, SupportCrewMember, JournalEntryShare } from '../lib/types';
import { getResetTypeName } from './ResetTypeSelector';
import { supabase } from '../lib/supabase';
import JournalComments from './JournalComments';

interface JournalEntriesListProps {
  entries: JournalEntry[];
}

export function JournalEntriesList({ entries }: JournalEntriesListProps) {
  const [filterType, setFilterType] = useState<ResetType | 'all'>('all');
  const [filterDate, setFilterDate] = useState<string>('all');
  const [crewMembers, setCrewMembers] = useState<SupportCrewMember[]>([]);
  const [entryShares, setEntryShares] = useState<Map<string, JournalEntryShare[]>>(new Map());
  const [expandedEntryId, setExpandedEntryId] = useState<string | null>(null);
  const [shareModalEntry, setShareModalEntry] = useState<JournalEntry | null>(null);

  useEffect(() => {
    loadCrewMembers();
    loadShares();
  }, [entries]);

  async function loadCrewMembers() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('support_crew_members')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (error) throw error;
      setCrewMembers(data || []);
    } catch (error) {
      console.error('Error loading crew members:', error);
    }
  }

  async function loadShares() {
    if (entries.length === 0) return;

    try {
      const entryIds = entries.map(e => e.id);
      const { data, error } = await supabase
        .from('journal_entry_shares')
        .select('*')
        .in('journal_entry_id', entryIds);

      if (error) throw error;

      const sharesMap = new Map<string, JournalEntryShare[]>();
      data?.forEach(share => {
        const existing = sharesMap.get(share.journal_entry_id) || [];
        sharesMap.set(share.journal_entry_id, [...existing, share]);
      });

      setEntryShares(sharesMap);
    } catch (error) {
      console.error('Error loading shares:', error);
    }
  }

  function getSharedMemberNames(entryId: string): string[] {
    const shares = entryShares.get(entryId) || [];
    return shares.map(share => {
      const member = crewMembers.find(m => m.id === share.shared_with_member_id);
      return member?.member_name || 'Unknown';
    });
  }

  const uniqueDates = useMemo(() => {
    const dates = entries.map((entry) => {
      const date = new Date(entry.created_at);
      return date.toISOString().split('T')[0];
    });
    return Array.from(new Set(dates)).sort().reverse();
  }, [entries]);

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      const matchesType = filterType === 'all' || entry.reset_type === filterType;
      const matchesDate = filterDate === 'all' || entry.created_at.startsWith(filterDate);
      return matchesType && matchesDate;
    });
  }, [entries, filterType, filterDate]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateShort = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (entries.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 shadow-lg border border-gray-100 text-center">
        <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Entries Yet</h3>
        <p className="text-gray-600">Start your first Daily Reset to see your entries here</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <Filter size={20} className="text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Filter Entries</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reset Type
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as ResetType | 'all')}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Types</option>
              <option value="clarity">Clarity Reset</option>
              <option value="gratitude">Gratitude Reset</option>
              <option value="insight">Insight Reset</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <select
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Dates</option>
              {uniqueDates.map((date) => (
                <option key={date} value={date}>
                  {formatDateShort(date)}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredEntries.length} of {entries.length} entries
        </div>
      </div>

      <div className="space-y-4">
        {filteredEntries.map((entry) => {
          const typeName = getResetTypeName(entry.reset_type);
          const sharedWith = getSharedMemberNames(entry.id);
          const isExpanded = expandedEntryId === entry.id;

          return (
            <div
              key={entry.id}
              className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-stone-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="inline-block px-3 py-1 rounded-full bg-stone-100 text-stone-700 text-sm font-medium mb-2">
                    {typeName}
                  </span>
                  <p className="text-sm text-gray-500">
                    {formatDate(entry.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {crewMembers.length > 0 && (
                    <button
                      onClick={() => setShareModalEntry(entry)}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                    >
                      <Share2 className="w-4 h-4" />
                      Share
                    </button>
                  )}
                </div>
              </div>

              <p className="text-gray-800 leading-relaxed whitespace-pre-wrap mb-3">
                {entry.content}
              </p>

              {entry.tags && entry.tags.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap mb-3">
                  <Tag size={14} className="text-gray-400" />
                  {entry.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {sharedWith.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-slate-600 mb-3 pb-3 border-b">
                  <Users className="w-4 h-4" />
                  <span>Shared with: {sharedWith.join(', ')}</span>
                </div>
              )}

              {sharedWith.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <button
                    onClick={() => setExpandedEntryId(isExpanded ? null : entry.id)}
                    className="text-sm font-medium text-slate-700 hover:text-slate-900 mb-3"
                  >
                    {isExpanded ? 'Hide' : 'View'} Comments
                  </button>
                  {isExpanded && <JournalComments journalEntryId={entry.id} isOwner={true} />}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {shareModalEntry && (
        <ShareModal
          entry={shareModalEntry}
          crewMembers={crewMembers}
          existingShares={entryShares.get(shareModalEntry.id) || []}
          onClose={() => setShareModalEntry(null)}
          onSuccess={() => {
            setShareModalEntry(null);
            loadShares();
          }}
        />
      )}
    </div>
  );
}

interface ShareModalProps {
  entry: JournalEntry;
  crewMembers: SupportCrewMember[];
  existingShares: JournalEntryShare[];
  onClose: () => void;
  onSuccess: () => void;
}

function ShareModal({ entry, crewMembers, existingShares, onClose, onSuccess }: ShareModalProps) {
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(
    new Set(existingShares.map(s => s.shared_with_member_id))
  );
  const [allowComments, setAllowComments] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const existingMemberIds = new Set(existingShares.map(s => s.shared_with_member_id));
      const toAdd = Array.from(selectedMembers).filter(id => !existingMemberIds.has(id));
      const toRemove = Array.from(existingMemberIds).filter(id => !selectedMembers.has(id));

      if (toAdd.length > 0) {
        const { error: insertError } = await supabase
          .from('journal_entry_shares')
          .insert(
            toAdd.map(memberId => ({
              journal_entry_id: entry.id,
              shared_by_user_id: user.id,
              shared_with_member_id: memberId,
              can_comment: allowComments,
            }))
          );

        if (insertError) throw insertError;
      }

      if (toRemove.length > 0) {
        const { error: deleteError } = await supabase
          .from('journal_entry_shares')
          .delete()
          .eq('journal_entry_id', entry.id)
          .in('shared_with_member_id', toRemove);

        if (deleteError) throw deleteError;
      }

      onSuccess();
    } catch (error) {
      console.error('Error sharing entry:', error);
      alert('Failed to update sharing. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function toggleMember(memberId: string) {
    const newSelected = new Set(selectedMembers);
    if (newSelected.has(memberId)) {
      newSelected.delete(memberId);
    } else {
      newSelected.add(memberId);
    }
    setSelectedMembers(newSelected);
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 px-6 py-4 flex items-center justify-between rounded-t-xl">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-white" />
            <h3 className="text-lg font-semibold text-white">Share Entry</h3>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-emerald-700 p-2 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {crewMembers.length === 0 ? (
            <div className="text-center py-6">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-600">
                No active crew members to share with. Invite someone to your support crew first.
              </p>
            </div>
          ) : (
            <>
              <div>
                <h4 className="font-medium text-slate-900 mb-3">Share with:</h4>
                <div className="space-y-2">
                  {crewMembers.map((member) => (
                    <label
                      key={member.id}
                      className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedMembers.has(member.id)
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedMembers.has(member.id)}
                        onChange={() => toggleMember(member.id)}
                        className="w-4 h-4 text-emerald-600 rounded"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-slate-900">{member.member_name}</div>
                        <div className="text-sm text-slate-600">
                          {member.role.replace('_', ' ')}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowComments}
                    onChange={(e) => setAllowComments(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span className="text-sm text-slate-700">Allow comments</span>
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || selectedMembers.size === 0}
                  className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Sharing...' : 'Share'}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
