import { GripVertical, Clock, Link2, Trash2 } from 'lucide-react';
import type { Task, Cornerstone } from '../lib/types';

interface TaskCardProps {
  task: Task;
  cornerstone: Cornerstone | undefined;
  onDelete: (taskId: string) => void;
  onDragStart: (e: React.DragEvent, task: Task) => void;
  onDragEnd: (e: React.DragEvent) => void;
}

export function TaskCard({ task, cornerstone, onDelete, onDragStart, onDragEnd }: TaskCardProps) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task)}
      onDragEnd={onDragEnd}
      className="group bg-white rounded-lg p-4 shadow-sm border-l-4 hover:shadow-md transition-all cursor-move"
      style={{
        borderLeftColor: cornerstone?.color || '#3B82F6',
      }}
    >
      <div className="flex items-start gap-3">
        <div className="mt-1 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
          <GripVertical size={16} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 mb-1">{task.title}</h4>
          {task.description && (
            <p className="text-sm text-gray-600 mb-2 line-clamp-2">{task.description}</p>
          )}

          <div className="flex flex-wrap items-center gap-2">
            {cornerstone && (
              <span
                className="inline-flex items-center px-2 py-1 rounded text-xs font-medium text-white"
                style={{ backgroundColor: cornerstone.color }}
              >
                {cornerstone.name}
              </span>
            )}

            {task.power_block && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-amber-100 text-amber-800 text-xs font-medium">
                <Clock size={12} />
                {task.power_block}
              </span>
            )}

            {task.weekly_anchor_id && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-blue-100 text-blue-800 text-xs font-medium">
                <Link2 size={12} />
                Linked
              </span>
            )}
          </div>
        </div>

        <button
          onClick={() => onDelete(task.id)}
          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-600 transition-all"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
