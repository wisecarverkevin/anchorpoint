import { useState, useEffect } from 'react';
import { MessageCircle, Send, Heart } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { JournalEntryComment, SupportCrewMember } from '../lib/types';

interface JournalCommentsProps {
  journalEntryId: string;
  isOwner?: boolean;
}

interface CommentWithMember extends JournalEntryComment {
  member?: SupportCrewMember;
}

export default function JournalComments({ journalEntryId, isOwner = false }: JournalCommentsProps) {
  const [comments, setComments] = useState<CommentWithMember[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [canComment, setCanComment] = useState(false);
  const [currentCrewMemberId, setCurrentCrewMemberId] = useState<string | null>(null);

  useEffect(() => {
    loadComments();
    checkCommentPermission();
  }, [journalEntryId]);

  async function loadComments() {
    try {
      const { data: commentsData, error: commentsError } = await supabase
        .from('journal_entry_comments')
        .select('*')
        .eq('journal_entry_id', journalEntryId)
        .order('created_at', { ascending: true });

      if (commentsError) throw commentsError;

      if (commentsData && commentsData.length > 0) {
        const memberIds = [...new Set(commentsData.map(c => c.crew_member_id))];
        const { data: membersData, error: membersError } = await supabase
          .from('support_crew_members')
          .select('*')
          .in('id', memberIds);

        if (membersError) throw membersError;

        const membersMap = new Map(membersData?.map(m => [m.id, m]) || []);
        const commentsWithMembers = commentsData.map(comment => ({
          ...comment,
          member: membersMap.get(comment.crew_member_id)
        }));

        setComments(commentsWithMembers);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function checkCommentPermission() {
    if (isOwner) {
      setCanComment(false);
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) return;

      const { data: crewMember } = await supabase
        .from('support_crew_members')
        .select('id')
        .eq('member_email', user.email)
        .eq('status', 'active')
        .maybeSingle();

      if (!crewMember) return;
      setCurrentCrewMemberId(crewMember.id);

      const { data: share } = await supabase
        .from('journal_entry_shares')
        .select('can_comment')
        .eq('journal_entry_id', journalEntryId)
        .eq('shared_with_member_id', crewMember.id)
        .maybeSingle();

      setCanComment(share?.can_comment || false);
    } catch (error) {
      console.error('Error checking comment permission:', error);
    }
  }

  async function handleSubmitComment(e: React.FormEvent) {
    e.preventDefault();

    if (!newComment.trim() || !currentCrewMemberId) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('journal_entry_comments')
        .insert({
          journal_entry_id: journalEntryId,
          crew_member_id: currentCrewMemberId,
          comment_text: newComment.trim(),
        });

      if (error) throw error;

      setNewComment('');
      await loadComments();
    } catch (error) {
      console.error('Error submitting comment:', error);
      alert('Failed to post comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-slate-700">
        <MessageCircle className="w-5 h-5" />
        <h3 className="font-semibold">
          {isOwner ? 'Encouragement from Your Crew' : 'Comments'}
        </h3>
        {comments.length > 0 && (
          <span className="text-sm text-slate-500">({comments.length})</span>
        )}
      </div>

      {comments.length === 0 ? (
        <div className="text-center py-6 bg-slate-50 rounded-lg border border-slate-200">
          <Heart className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-600">
            {isOwner
              ? 'No comments yet. Your crew will see this when you share it.'
              : 'Be the first to leave an encouraging comment!'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-slate-50 border border-slate-200 rounded-lg p-4"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="font-medium text-slate-900">
                    {comment.member?.member_name || 'Support Crew Member'}
                  </span>
                  <span className="text-xs text-slate-500 ml-2">
                    {comment.member?.role.replace('_', ' ')}
                  </span>
                </div>
                <span className="text-xs text-slate-500">
                  {formatDate(comment.created_at)}
                </span>
              </div>
              <p className="text-slate-700 whitespace-pre-wrap">{comment.comment_text}</p>
            </div>
          ))}
        </div>
      )}

      {canComment && (
        <form onSubmit={handleSubmitComment} className="space-y-3">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Leave an encouraging comment..."
            rows={3}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
            disabled={isSubmitting}
          />
          <button
            type="submit"
            disabled={isSubmitting || !newComment.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
            {isSubmitting ? 'Posting...' : 'Post Comment'}
          </button>
        </form>
      )}
    </div>
  );
}
