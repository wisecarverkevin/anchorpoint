import { useState, useEffect } from 'react';
import { Plus, Edit2, Save, X } from 'lucide-react';
import type { Cornerstone, YearlyVision, QuarterlyGoal, MonthlyMilestone, WeeklyAnchor } from '../lib/types';
import { supabase } from '../lib/supabase';

interface CornerstoneDetailProps {
  cornerstone: Cornerstone;
}

export function CornerstoneDetail({ cornerstone }: CornerstoneDetailProps) {
  const currentYear = new Date().getFullYear();
  const currentQuarter = Math.ceil((new Date().getMonth() + 1) / 3);
  const currentMonth = new Date().getMonth() + 1;
  const currentWeek = Math.ceil((new Date().getTime() - new Date(currentYear, 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));

  const [yearlyVision, setYearlyVision] = useState<YearlyVision | null>(null);
  const [quarterlyGoal, setQuarterlyGoal] = useState<QuarterlyGoal | null>(null);
  const [monthlyMilestone, setMonthlyMilestone] = useState<MonthlyMilestone | null>(null);
  const [weeklyAnchor, setWeeklyAnchor] = useState<WeeklyAnchor | null>(null);

  const [editingVision, setEditingVision] = useState(false);
  const [editingGoal, setEditingGoal] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState(false);
  const [editingAnchor, setEditingAnchor] = useState(false);

  const [visionText, setVisionText] = useState('');
  const [goalText, setGoalText] = useState('');
  const [milestoneText, setMilestoneText] = useState('');
  const [anchorText, setAnchorText] = useState('');

  useEffect(() => {
    fetchData();
  }, [cornerstone.id]);

  const fetchData = async () => {
    const [visionRes, goalRes, milestoneRes, anchorRes] = await Promise.all([
      supabase
        .from('yearly_visions')
        .select('*')
        .eq('cornerstone_id', cornerstone.id)
        .eq('year', currentYear)
        .maybeSingle(),
      supabase
        .from('quarterly_goals')
        .select('*')
        .eq('cornerstone_id', cornerstone.id)
        .eq('year', currentYear)
        .eq('quarter', currentQuarter)
        .maybeSingle(),
      supabase
        .from('monthly_milestones')
        .select('*')
        .eq('cornerstone_id', cornerstone.id)
        .eq('year', currentYear)
        .eq('month', currentMonth)
        .maybeSingle(),
      supabase
        .from('weekly_anchors')
        .select('*')
        .eq('cornerstone_id', cornerstone.id)
        .eq('year', currentYear)
        .eq('week', currentWeek)
        .maybeSingle(),
    ]);

    if (visionRes.data) {
      setYearlyVision(visionRes.data);
      setVisionText(visionRes.data.content);
    }
    if (goalRes.data) {
      setQuarterlyGoal(goalRes.data);
      setGoalText(goalRes.data.content);
    }
    if (milestoneRes.data) {
      setMonthlyMilestone(milestoneRes.data);
      setMilestoneText(milestoneRes.data.content);
    }
    if (anchorRes.data) {
      setWeeklyAnchor(anchorRes.data);
      setAnchorText(anchorRes.data.content);
    }
  };

  const saveVision = async () => {
    if (!visionText.trim()) return;

    if (yearlyVision) {
      await supabase
        .from('yearly_visions')
        .update({ content: visionText, updated_at: new Date().toISOString() })
        .eq('id', yearlyVision.id);
    } else {
      const { data } = await supabase
        .from('yearly_visions')
        .insert({ cornerstone_id: cornerstone.id, year: currentYear, content: visionText })
        .select()
        .single();
      if (data) setYearlyVision(data);
    }
    setEditingVision(false);
    fetchData();
  };

  const saveGoal = async () => {
    if (!goalText.trim()) return;

    if (quarterlyGoal) {
      await supabase
        .from('quarterly_goals')
        .update({ content: goalText, updated_at: new Date().toISOString() })
        .eq('id', quarterlyGoal.id);
    } else {
      const { data } = await supabase
        .from('quarterly_goals')
        .insert({ cornerstone_id: cornerstone.id, year: currentYear, quarter: currentQuarter, content: goalText })
        .select()
        .single();
      if (data) setQuarterlyGoal(data);
    }
    setEditingGoal(false);
    fetchData();
  };

  const saveMilestone = async () => {
    if (!milestoneText.trim()) return;

    if (monthlyMilestone) {
      await supabase
        .from('monthly_milestones')
        .update({ content: milestoneText, updated_at: new Date().toISOString() })
        .eq('id', monthlyMilestone.id);
    } else {
      const { data } = await supabase
        .from('monthly_milestones')
        .insert({ cornerstone_id: cornerstone.id, year: currentYear, month: currentMonth, content: milestoneText })
        .select()
        .single();
      if (data) setMonthlyMilestone(data);
    }
    setEditingMilestone(false);
    fetchData();
  };

  const saveAnchor = async () => {
    if (!anchorText.trim()) return;

    if (weeklyAnchor) {
      await supabase
        .from('weekly_anchors')
        .update({ content: anchorText, updated_at: new Date().toISOString() })
        .eq('id', weeklyAnchor.id);
    } else {
      const { data } = await supabase
        .from('weekly_anchors')
        .insert({ cornerstone_id: cornerstone.id, year: currentYear, week: currentWeek, content: anchorText })
        .select()
        .single();
      if (data) setWeeklyAnchor(data);
    }
    setEditingAnchor(false);
    fetchData();
  };

  const renderSection = (
    title: string,
    subtitle: string,
    content: string | null,
    isEditing: boolean,
    editText: string,
    setEditText: (text: string) => void,
    setEditing: (editing: boolean) => void,
    onSave: () => void
  ) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="text-lg font-semibold text-gray-900">{title}</h4>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
        {!isEditing && (
          <button
            onClick={() => {
              setEditing(true);
              if (!content) setEditText('');
            }}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            style={{ color: cornerstone.color }}
          >
            {content ? <Edit2 size={18} /> : <Plus size={18} />}
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent resize-none"
            style={{
              focusRing: `2px solid ${cornerstone.color}40`,
              minHeight: '120px'
            }}
            placeholder={`Enter your ${title.toLowerCase()}...`}
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={onSave}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
              style={{ backgroundColor: cornerstone.color }}
            >
              <Save size={16} />
              Save
            </button>
            <button
              onClick={() => {
                setEditing(false);
                setEditText(content || '');
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors"
            >
              <X size={16} />
              Cancel
            </button>
          </div>
        </div>
      ) : content ? (
        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{content}</p>
      ) : (
        <p className="text-gray-400 italic">No {title.toLowerCase()} set yet</p>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="border-l-4 pl-6" style={{ borderColor: cornerstone.color }}>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">{cornerstone.name}</h2>
        <p className="text-gray-600">{cornerstone.description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderSection(
          'Yearly Vision',
          `Vision for ${currentYear}`,
          yearlyVision?.content || null,
          editingVision,
          visionText,
          setVisionText,
          setEditingVision,
          saveVision
        )}

        {renderSection(
          'Quarterly Goal',
          `Q${currentQuarter} ${currentYear}`,
          quarterlyGoal?.content || null,
          editingGoal,
          goalText,
          setGoalText,
          setEditingGoal,
          saveGoal
        )}

        {renderSection(
          'Monthly Milestone',
          new Date(currentYear, currentMonth - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          monthlyMilestone?.content || null,
          editingMilestone,
          milestoneText,
          setMilestoneText,
          setEditingMilestone,
          saveMilestone
        )}

        {renderSection(
          'Weekly Anchor',
          `Week ${currentWeek}`,
          weeklyAnchor?.content || null,
          editingAnchor,
          anchorText,
          setAnchorText,
          setEditingAnchor,
          saveAnchor
        )}
      </div>
    </div>
  );
}
