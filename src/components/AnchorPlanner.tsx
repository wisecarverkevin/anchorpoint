import { useState, useEffect } from 'react';
import { Plus, ListTodo, Zap, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Task, TaskStatus, Cornerstone } from '../lib/types';
import { TaskCard } from './TaskCard';
import { TaskForm } from './TaskForm';

interface ColumnConfig {
  status: TaskStatus;
  title: string;
  icon: React.ComponentType<{ size: number; className?: string }>;
  color: string;
  description: string;
}

const columns: ColumnConfig[] = [
  {
    status: 'quicklist',
    title: 'On deck',
    icon: ListTodo,
    color: '#6B7280',
    description: 'Ideas waiting for their turn',
  },
  {
    status: 'hotlist',
    title: "Today's focus",
    icon: Zap,
    color: '#EF4444',
    description: 'What you are actually doing today',
  },
  {
    status: 'achieved',
    title: 'Done',
    icon: CheckCircle2,
    color: '#10B981',
    description: 'Finished',
  },
];

export function AnchorPlanner() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [cornerstones, setCornerstones] = useState<Cornerstone[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formColumn, setFormColumn] = useState<TaskStatus>('quicklist');
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [tasksRes, cornerstonesRes] = await Promise.all([
      supabase.from('tasks').select('*').order('order_index', { ascending: true }),
      supabase.from('cornerstones').select('*').order('order_index', { ascending: true }),
    ]);

    if (tasksRes.data) setTasks(tasksRes.data);
    if (cornerstonesRes.data) setCornerstones(cornerstonesRes.data);
    setLoading(false);
  };

  const handleAddTask = (status: TaskStatus) => {
    setFormColumn(status);
    setShowForm(true);
  };

  const handleDeleteTask = async (taskId: string) => {
    await supabase.from('tasks').delete().eq('id', taskId);
    fetchData();
  };

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, newStatus: TaskStatus) => {
    e.preventDefault();
    if (!draggedTask || draggedTask.status === newStatus) {
      setDraggedTask(null);
      return;
    }

    const updates: any = {
      status: newStatus,
      updated_at: new Date().toISOString(),
    };

    if (newStatus === 'achieved') {
      updates.completed_at = new Date().toISOString();
    }

    await supabase.from('tasks').update(updates).eq('id', draggedTask.id);

    setDraggedTask(null);
    fetchData();
  };

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter((task) => task.status === status);
  };

  const getCornerstoneById = (id: string) => {
    return cornerstones.find((c) => c.id === id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your planner...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-3">Anchor Planner</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Organize tasks across your cornerstones, from ideas to action to achievement
        </p>
      </div>

      {showForm && (
        <div className="mb-6">
          <TaskForm
            cornerstones={cornerstones}
            initialStatus={formColumn}
            onSave={() => {
              setShowForm(false);
              fetchData();
            }}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {columns.map((column) => {
          const Icon = column.icon;
          const columnTasks = getTasksByStatus(column.status);

          return (
            <div
              key={column.status}
              className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg border border-gray-200"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.status)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: `${column.color}20` }}
                  >
                    <Icon size={24} style={{ color: column.color }} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{column.title}</h3>
                    <p className="text-sm text-gray-500">{column.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleAddTask(column.status)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  style={{ color: column.color }}
                >
                  <Plus size={20} />
                </button>
              </div>

              <div className="space-y-3 min-h-[200px]">
                {columnTasks.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <p className="text-sm">No tasks yet</p>
                  </div>
                ) : (
                  columnTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      cornerstone={getCornerstoneById(task.cornerstone_id)}
                      onDelete={handleDeleteTask}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                    />
                  ))
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  {columnTasks.length} {columnTasks.length === 1 ? 'task' : 'tasks'}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
