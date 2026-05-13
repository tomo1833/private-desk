'use client';

import { useState, useMemo } from 'react';
import { format, addDays, differenceInDays, startOfDay, endOfDay, isSameDay, startOfWeek } from 'date-fns';
import { ja } from 'date-fns/locale';
import type { Task } from '@/types/project';

interface GanttChartProps {
  projectId: number;
  tasks: Task[];
  onUpdate: () => void;
}

const GanttChart = ({ projectId, tasks, onUpdate }: GanttChartProps) => {
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('day');
  const [startDate, setStartDate] = useState<Date>(startOfWeek(new Date(), { locale: ja }));
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Gantt timeline settings
  const columnWidth = viewMode === 'day' ? 40 : viewMode === 'week' ? 100 : 150;
  const daysToShow = viewMode === 'day' ? 30 : viewMode === 'week' ? 12 * 7 : 12 * 30;
  
  const timelineDates = useMemo(() => {
    return Array.from({ length: daysToShow }).map((_, i) => addDays(startDate, i));
  }, [startDate, daysToShow]);

  const handleAddTask = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      projectId,
      title: formData.get('title') as string,
      startDate: formData.get('startDate') as string || null,
      endDate: formData.get('endDate') as string || null,
      progress: Number(formData.get('progress') || 0),
      description: formData.get('description') as string,
      parentId: formData.get('parentId') ? Number(formData.get('parentId')) : null,
    };

    const url = editingTask ? `/api/tasks/${editingTask.id}` : '/api/tasks';
    const method = editingTask ? 'PATCH' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('保存失敗');
      setIsModalOpen(false);
      onUpdate();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('タスクを削除しますか？')) return;
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('削除失敗');
      onUpdate();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const getTaskBarStyles = (task: Task) => {
    if (!task.start_date || !task.end_date) return null;
    
    const taskStart = startOfDay(new Date(task.start_date));
    const taskEnd = endOfDay(new Date(task.end_date));
    
    const startDiff = differenceInDays(taskStart, startDate);
    const duration = differenceInDays(taskEnd, taskStart) + 1;
    
    return {
      left: `${startDiff * (columnWidth / (viewMode === 'day' ? 1 : viewMode === 'week' ? 7 : 30))}px`,
      width: `${duration * (columnWidth / (viewMode === 'day' ? 1 : viewMode === 'week' ? 7 : 30))}px`,
    };
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
      {/* Header / Controls */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
        <div className="flex gap-2">
          <button onClick={() => setStartDate(addDays(startDate, -7))} className="btn btn-sm btn-outline px-3">前週</button>
          <button onClick={() => setStartDate(new Date())} className="btn btn-sm btn-outline px-3">今日</button>
          <button onClick={() => setStartDate(addDays(startDate, 7))} className="btn btn-sm btn-outline px-3">次週</button>
        </div>
        <div className="flex items-center gap-4">
           <select 
             value={viewMode} 
             onChange={(e) => setViewMode(e.target.value as 'day' | 'week' | 'month')}
             className="bg-transparent border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm dark:text-white"
           >
             <option value="day">日次</option>
             <option value="week">週次</option>
             <option value="month">月次</option>
           </select>
           <button onClick={handleAddTask} className="btn btn-sm btn-primary">タスク追加</button>
        </div>
      </div>

      <div className="flex overflow-hidden h-[600px]">
        {/* Task List (Left Sidebar) */}
        <div className="w-64 sm:w-80 flex-shrink-0 border-right border-gray-200 dark:border-gray-700 flex flex-col bg-gray-50 dark:bg-gray-900/30">
           <div className="h-10 border-b border-gray-200 dark:border-gray-700 flex items-center px-4 font-bold text-xs uppercase text-gray-500 tracking-wider">
              タスク名
           </div>
           <div className="flex-1 overflow-y-auto overflow-x-hidden">
              {tasks.map(task => (
                <div key={task.id} className="h-12 border-b border-gray-100 dark:border-gray-800 flex items-center px-4 group hover:bg-white dark:hover:bg-gray-700 transition-colors">
                   <div className="flex-1 truncate text-sm font-medium dark:text-gray-200 cursor-pointer" onClick={() => handleEditTask(task)}>
                      {task.title}
                   </div>
                   <div className="text-xs text-gray-400 font-mono w-10 text-right mr-2">
                      {task.progress}%
                   </div>
                   <button onClick={() => handleDelete(task.id)} className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-opacity p-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                   </button>
                </div>
              ))}
           </div>
        </div>

        {/* Timeline (Right Content) */}
        <div className="flex-1 overflow-auto relative">
           {/* Timeline Header */}
           <div className="sticky top-0 z-10 flex bg-gray-50 dark:bg-gray-900/80 backdrop-blur">
              {timelineDates.map((date, i) => (
                <div 
                  key={i} 
                  className={`h-10 flex-shrink-0 border-r border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center text-[10px] ${isSameDay(date, new Date()) ? 'bg-accent-gold/20' : ''}`}
                  style={{ width: columnWidth }}
                >
                  <span className="font-bold text-primary-navy dark:text-gray-300">{format(date, 'd')}</span>
                  <span className="text-gray-500">{format(date, 'eee', { locale: ja })}</span>
                </div>
              ))}
           </div>

           {/* Grid & Bars */}
           <div className="relative" style={{ width: daysToShow * columnWidth }}>
              {/* Vertical Grid Lines */}
              <div className="absolute inset-0 flex pointer-events-none">
                 {timelineDates.map((date, i) => (
                   <div 
                     key={i} 
                     className={`h-full border-r border-gray-100 dark:border-gray-800/50 flex-shrink-0 ${isSameDay(date, new Date()) ? 'bg-accent-gold/5' : ''}`}
                     style={{ width: columnWidth }} 
                   />
                 ))}
              </div>

              {/* Task Rows */}
              <div className="relative z-0">
                 {tasks.map(task => {
                   const styles = getTaskBarStyles(task);
                   return (
                    <div key={task.id} className="h-12 border-b border-gray-100 dark:border-gray-800/50 relative flex items-center">
                       {styles && (
                         <div 
                           className="absolute h-6 rounded-full shadow-sm cursor-pointer group/bar transition-transform hover:scale-[1.02]"
                           style={{ 
                             ...styles, 
                             backgroundColor: 'var(--primary-navy)',
                             border: '2px solid rgba(255,255,255,0.2)'
                           }}
                           onClick={() => handleEditTask(task)}
                         >
                           {/* Progress Fill */}
                           <div 
                             className="h-full rounded-full bg-accent-gold" 
                             style={{ width: `${task.progress}%` }} 
                           />
                           {/* Tooltip on hover */}
                           <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-black text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover/bar:opacity-100 whitespace-nowrap pointer-events-none transition-opacity">
                             {task.title}: {task.progress}%
                           </div>
                         </div>
                       )}
                    </div>
                   );
                 })}
              </div>
           </div>
        </div>
      </div>

      {/* Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
           <div className="card-form w-full max-w-md">
              <h3 className="text-xl font-bold mb-4 text-primary-navy dark:text-white">
                {editingTask ? 'タスク編集' : 'タスク追加'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-3">
                 <div>
                    <label className="form-label text-sm">タイトル</label>
                    <input name="title" defaultValue={editingTask?.title} className="form-input" required />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="form-label text-sm">開始日</label>
                       <input name="startDate" type="date" defaultValue={editingTask?.start_date ? format(new Date(editingTask.start_date), 'yyyy-MM-dd') : ''} className="form-input" />
                    </div>
                    <div>
                       <label className="form-label text-sm">終了日</label>
                       <input name="endDate" type="date" defaultValue={editingTask?.end_date ? format(new Date(editingTask.end_date), 'yyyy-MM-dd') : ''} className="form-input" />
                    </div>
                 </div>
                 <div>
                    <label className="form-label text-sm">進捗 (%)</label>
                    <input name="progress" type="number" min="0" max="100" defaultValue={editingTask?.progress || 0} className="form-input" />
                 </div>
                 <div>
                    <label className="form-label text-sm">メモ</label>
                    <textarea name="description" defaultValue={editingTask?.description || ''} className="form-textarea h-20" />
                 </div>
                 <div className="flex justify-end gap-2 pt-4">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">キャンセル</button>
                    <button type="submit" className="btn btn-primary">保存</button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default GanttChart;
