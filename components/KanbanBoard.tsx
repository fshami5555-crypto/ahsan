
import React, { useState } from 'react';
import { Task, TaskStatus } from '../types';
import { useData } from '../context';
import { MoreVertical, UserCircle } from 'lucide-react';

interface KanbanProps {
  charityId: string;
  onTaskClick?: (task: Task) => void;
}

const COLUMNS: { id: TaskStatus; title: string; color: string }[] = [
  { id: 'TODO', title: 'قائمة المهام', color: 'bg-gray-100 dark:bg-gray-800' },
  { id: 'IN_PROGRESS', title: 'قيد التنفيذ', color: 'bg-blue-50 dark:bg-blue-900/20' },
  { id: 'REVIEW', title: 'مراجعة', color: 'bg-yellow-50 dark:bg-yellow-900/20' },
  { id: 'APPROVED', title: 'مهام معتمدة', color: 'bg-green-50 dark:bg-green-900/20' },
];

const KanbanBoard: React.FC<KanbanProps> = ({ charityId, onTaskClick }) => {
  const { tasks, updateTask } = useData();
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  // Filter tasks for this charity
  const charityTasks = tasks.filter(t => t.charityId === charityId);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    if (draggedTaskId) {
      const task = tasks.find(t => t.id === draggedTaskId);
      if (task && task.status !== status) {
        updateTask({ ...task, status });
      }
      setDraggedTaskId(null);
    }
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 h-full">
      {COLUMNS.map(col => (
        <div 
          key={col.id}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, col.id)}
          className={`min-w-[280px] w-full max-w-[350px] rounded-xl p-4 flex flex-col ${col.color} border border-gray-200 dark:border-gray-700 transition-colors`}
        >
          <h3 className="font-bold text-lg mb-4 text-gray-700 dark:text-gray-200 flex justify-between items-center">
            {col.title}
            <span className="bg-white dark:bg-gray-700 px-2 py-0.5 rounded-full text-xs shadow-sm">
              {charityTasks.filter(t => t.status === col.id).length}
            </span>
          </h3>
          
          <div className="flex-1 space-y-3 overflow-y-auto min-h-[200px]">
            {charityTasks.filter(t => t.status === col.id).map(task => (
              <div
                key={task.id}
                draggable
                onDragStart={(e) => handleDragStart(e, task.id)}
                onClick={() => onTaskClick && onTaskClick(task)}
                className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 cursor-pointer hover:shadow-md transition-all"
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-gray-800 dark:text-gray-100">{task.title}</h4>
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreVertical size={16} />
                  </button>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
                  {task.description}
                </p>
                
                {task.isFromAdmin && (
                   <span className="inline-block px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded mb-2">
                     مشروع وارد
                   </span>
                )}

                <div className="flex justify-between items-center pt-2 border-t border-gray-50 dark:border-gray-700">
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                     <UserCircle size={14} />
                     {task.assigneeName || 'غير مسند'}
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(task.createdAt).toLocaleDateString('ar-SA')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default KanbanBoard;
