import { useState, useEffect } from 'react';
import { Users, Plus, Mail, Phone, Shield, Heart, Target, Trash2, Check, Clock, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { SupportCrewMember, CrewRole } from '../lib/types';

const MAX_CREW_MEMBERS = 2;

const roleConfig: Record<CrewRole, { label: string; icon: typeof Shield; color: string; description: string }> = {
  coach: {
    label: 'Coach',
    icon: Target,
    color: 'text-blue-600 bg-blue-100',
    description: 'Guides you toward your goals'
  },
  counselor: {
    label: 'Counselor',
    icon: Heart,
    color: 'text-rose-600 bg-rose-100',
    description: 'Provides emotional support'
  },
  accountability_partner: {
    label: 'Accountability Partner',
    icon: Shield,
    color: 'text-emerald-600 bg-emerald-100',
    description: 'Keeps you on track'
  }
};

export default function SupportCrewManager() {
  const [crewMembers, setCrewMembers] = useState<SupportCrewMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showInviteForm, setShowInviteForm] = useState(false);

  useEffect(() => {
    loadCrewMembers();
  }, []);

  async function loadCrewMembers() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('support_crew_members')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at');

      if (error) throw error;
      setCrewMembers(data || []);
    } catch (error) {
      console.error('Error loading crew members:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function deleteMember(memberId: string) {
    if (!confirm('Are you sure you want to remove this crew member?')) return;

    try {
      const { error } = await supabase
        .from('support_crew_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;
      await loadCrewMembers();
    } catch (error) {
      console.error('Error deleting member:', error);
    }
  }

  async function togglePermission(memberId: string, field: 'can_view_resets' | 'auto_share_resets', currentValue: boolean) {
    try {
      const { error } = await supabase
        .from('support_crew_members')
        .update({ [field]: !currentValue })
        .eq('id', memberId);

      if (error) throw error;
      await loadCrewMembers();
    } catch (error) {
      console.error('Error updating permission:', error);
    }
  }

  const canAddMore = crewMembers.length < MAX_CREW_MEMBERS;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-white" />
            <div>
              <h2 className="text-xl font-semibold text-white">Support Crew</h2>
              <p className="text-sm text-emerald-100">
                {crewMembers.length} of {MAX_CREW_MEMBERS} members
              </p>
            </div>
          </div>
          {canAddMore && (
            <button
              onClick={() => setShowInviteForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              Invite Member
            </button>
          )}
        </div>
      </div>

      <div className="p-6">
        {crewMembers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No Crew Members Yet</h3>
            <p className="text-slate-600 mb-6 max-w-md mx-auto">
              Invite up to 2 people to support your journey. They can view your resets, leave encouraging comments, and help keep you accountable.
            </p>
            <button
              onClick={() => setShowInviteForm(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              Invite Your First Member
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {crewMembers.map((member) => {
              const config = roleConfig[member.role];
              const Icon = config.icon;

              return (
                <div
                  key={member.id}
                  className="border border-slate-200 rounded-lg p-4 hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`p-2 rounded-lg ${config.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900">{member.member_name}</h3>
                        <p className="text-sm text-slate-600">{config.label}</p>
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-slate-500">
                          {member.member_email && (
                            <div className="flex items-center gap-1">
                              <Mail className="w-4 h-4" />
                              <span>{member.member_email}</span>
                            </div>
                          )}
                          {member.member_phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="w-4 h-4" />
                              <span>{member.member_phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {member.status === 'pending' && (
                        <span className="flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded">
                          <Clock className="w-3 h-3" />
                          Pending
                        </span>
                      )}
                      {member.status === 'active' && (
                        <span className="flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded">
                          <Check className="w-3 h-3" />
                          Active
                        </span>
                      )}
                      {member.status === 'declined' && (
                        <span className="flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded">
                          <X className="w-3 h-3" />
                          Declined
                        </span>
                      )}
                      <button
                        onClick={() => deleteMember(member.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove member"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="border-t pt-3 space-y-2">
                    <label className="flex items-center justify-between p-2 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
                      <span className="text-sm font-medium text-slate-700">Can view resets</span>
                      <input
                        type="checkbox"
                        checked={member.can_view_resets}
                        onChange={() => togglePermission(member.id, 'can_view_resets', member.can_view_resets)}
                        className="w-4 h-4 text-emerald-600 rounded focus:ring-2 focus:ring-emerald-500"
                      />
                    </label>

                    <label className="flex items-center justify-between p-2 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
                      <span className="text-sm font-medium text-slate-700">Auto-share new resets</span>
                      <input
                        type="checkbox"
                        checked={member.auto_share_resets}
                        onChange={() => togglePermission(member.id, 'auto_share_resets', member.auto_share_resets)}
                        className="w-4 h-4 text-emerald-600 rounded focus:ring-2 focus:ring-emerald-500"
                      />
                    </label>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showInviteForm && (
        <InviteMemberForm
          onClose={() => setShowInviteForm(false)}
          onSuccess={() => {
            setShowInviteForm(false);
            loadCrewMembers();
          }}
        />
      )}
    </div>
  );
}

interface InviteMemberFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

function InviteMemberForm({ onClose, onSuccess }: InviteMemberFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<CrewRole>('accountability_partner');
  const [canViewResets, setCanViewResets] = useState(true);
  const [autoShareResets, setAutoShareResets] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim() || !email.trim()) return;

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('support_crew_members')
        .insert({
          user_id: user.id,
          member_name: name.trim(),
          member_email: email.trim().toLowerCase(),
          member_phone: phone.trim(),
          role,
          can_view_resets: canViewResets,
          auto_share_resets: autoShareResets,
        });

      if (error) throw error;

      onSuccess();
    } catch (error) {
      console.error('Error inviting member:', error);
      alert('Failed to send invitation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 px-6 py-4 flex items-center justify-between rounded-t-xl">
          <h3 className="text-lg font-semibold text-white">Invite Crew Member</h3>
          <button
            onClick={onClose}
            className="text-white hover:bg-emerald-700 p-2 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter their name"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="their.email@example.com"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Phone (Optional)
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Role
            </label>
            <div className="space-y-2">
              {(Object.keys(roleConfig) as CrewRole[]).map((roleKey) => {
                const config = roleConfig[roleKey];
                const Icon = config.icon;
                return (
                  <label
                    key={roleKey}
                    className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      role === roleKey
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={roleKey}
                      checked={role === roleKey}
                      onChange={(e) => setRole(e.target.value as CrewRole)}
                      className="w-4 h-4 text-emerald-600"
                    />
                    <div className={`p-2 rounded-lg ${config.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-slate-900">{config.label}</div>
                      <div className="text-sm text-slate-600">{config.description}</div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={canViewResets}
                onChange={(e) => setCanViewResets(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-sm text-slate-700">Allow them to view your resets</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoShareResets}
                onChange={(e) => setAutoShareResets(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-sm text-slate-700">Automatically share new resets</span>
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
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Sending...' : 'Send Invitation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
