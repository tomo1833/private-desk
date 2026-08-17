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
    if (!task.startDate || !task.endDate) return null;
    
    const taskStart = startOfDay(new Date(task.startDate));
    const taskEnd = endOfDay(new Date(task.endDate));
    
    const startDiff = differenceInDays(taskStart, startDate);
    const duration = differenceInDays(taskEnd, taskStart) + 1;
    
    return {
      left: `${startDiff * (columnWidth / (viewMode === 'day' ? 1 : viewMode === 'week' ? 7 : 30))}px`,
      width: `${duration * (columnWidth / (viewMode === 'day' ? 1 : viewMode === 'week' ? 7 : 30))}px`,
    };
  };

  return (
    <div className="card-basic p-0 overflow-hidden">
      {/* Header / Controls */}
      <div className="p-4 border-b border-slate-700/80 flex flex-wrap justify-between items-center bg-slate-900/90 gap-3">
        <div className="flex gap-2">
          <button onClick={() => setStartDate(addDays(startDate, -7))} className="btn btn-sm btn-secondary">前週</button>
          <button onClick={() => setStartDate(new Date())} className="btn btn-sm btn-secondary">今日</button>
          <button onClick={() => setStartDate(addDays(startDate, 7))} className="btn btn-sm btn-secondary">次週</button>
        </div>
        <div className="flex items-center gap-3">
           <select 
             value={viewMode} 
             onChange={(e) => setViewMode(e.target.value as 'day' | 'week' | 'month')}
             className="px-3 py-1.5 bg-slate-900 border border-slate-700 text-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
           >
             <option value="day">日次</option>
             <option value="week">週次</option>
             <option value="month">月次</option>
           </select>
           <button onClick={handleAddTask} className="btn btn-sm btn-primary">➕ タスク追加</button>
        </div>
      </div>

      <div className="flex overflow-hidden h-[600px]">
        {/* Task List (Left Sidebar) */}
        <div className="w-64 sm:w-80 flex-shrink-0 border-r border-slate-700/80 flex flex-col bg-slate-900/60">
           <div className="h-10 border-b border-slate-700/80 flex items-center px-4 font-bold text-xs uppercase text-slate-300 tracking-wider">
              タスク名
           </div>
           <div className="flex-1 overflow-y-auto overflow-x-hidden">
              {tasks.map(task => (
                <div key={task.id} className="h-12 border-b border-slate-800 flex items-center px-4 group hover:bg-slate-800/80 transition-colors">
                   <div className="flex-1 truncate text-sm font-semibold text-white cursor-pointer hover:text-indigo-300" onClick={() => handleEditTask(task)}>
                      {task.title}
                   </div>
                   <div className="text-xs text-indigo-400 font-mono font-bold w-10 text-right mr-2">
                      {task.progress}%
                   </div>
                   <button onClick={() => handleDelete(task.id)} className="opacity-0 group-hover:opacity-100 text-rose-400 hover:text-rose-300 transition-opacity p-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                   </button>
                </div>
              ))}
           </div>
        </div>

        {/* Timeline (Right Content) */}
        <div className="flex-1 overflow-auto relative bg-slate-950/40">
           {/* Timeline Header */}
           <div className="sticky top-0 z-10 flex bg-slate-900/95 border-b border-slate-700/80 backdrop-blur">
              {timelineDates.map((date, i) => (
                <div 
                  key={i} 
                  className={`h-10 flex-shrink-0 border-r border-slate-700/60 flex flex-col items-center justify-center text-[10px] ${isSameDay(date, new Date()) ? 'bg-indigo-500/25 border-indigo-400' : ''}`}
                  style={{ width: columnWidth }}
                >
                  <span className="font-bold text-white font-mono">{format(date, 'd')}</span>
                  <span className="text-slate-400 font-semibold">{format(date, 'eee', { locale: ja })}</span>
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
                     className={`h-full border-r border-slate-800/80 flex-shrink-0 ${isSameDay(date, new Date()) ? 'bg-indigo-500/10' : ''}`}
                     style={{ width: columnWidth }} 
                   />
                 ))}
              </div>

              {/* Task Rows */}
              <div className="relative z-0">
                 {tasks.map(task => {
                   const styles = getTaskBarStyles(task);
                   return (
                    <div key={task.id} className="h-12 border-b border-slate-800/60 relative flex items-center">
                       {styles && (
                         <div 
                           className="absolute h-6 rounded-full shadow-md cursor-pointer group/bar transition-transform hover:scale-[1.02]"
                           style={{ 
                             ...styles, 
                             backgroundColor: '#312e81',
                             border: '1.5px solid #818cf8'
                           }}
                           onClick={() => handleEditTask(task)}
                         >
                           {/* Progress Fill */}
                           <div 
                             className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400" 
                             style={{ width: `${task.progress}%` }} 
                           />
                           {/* Tooltip on hover */}
                           <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900 text-white text-[11px] font-semibold py-1 px-2.5 rounded-lg border border-slate-700 shadow-xl opacity-0 group-hover/bar:opacity-100 whitespace-nowrap pointer-events-none transition-opacity">
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
           <div className="card-form w-full max-w-md shadow-2xl border border-indigo-500/30">
              <h3 className="text-lg font-bold mb-4 text-white border-b border-slate-700/80 pb-3 flex items-center gap-2">
                <span>📌</span> {editingTask ? 'タスク編集' : 'タスク追加'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-3">
                 <div>
                    <label className="form-label text-xs">タイトル</label>
                    <input name="title" defaultValue={editingTask?.title} className="form-input text-xs" required />
                 </div>
                 <div className="grid grid-cols-2 gap-3">
                    <div>
                       <label className="form-label text-xs">開始日</label>
                       <input name="startDate" type="date" defaultValue={editingTask?.startDate ? format(new Date(editingTask.startDate), 'yyyy-MM-dd') : ''} className="form-input text-xs font-mono" />
                    </div>
                    <div>
                       <label className="form-label text-xs">終了日</label>
                       <input name="endDate" type="date" defaultValue={editingTask?.endDate ? format(new Date(editingTask.endDate), 'yyyy-MM-dd') : ''} className="form-input text-xs font-mono" />
                    </div>
                 </div>
                 <div>
                    <label className="form-label text-xs">進捗 (%)</label>
                    <input name="progress" type="number" min="0" max="100" defaultValue={editingTask?.progress || 0} className="form-input text-xs font-mono" />
                 </div>
                 <div>
                    <label className="form-label text-xs">メモ</label>
                    <textarea name="description" defaultValue={editingTask?.description || ''} className="form-textarea text-xs h-20" />
                 </div>
                 <div className="flex justify-end gap-2 pt-3 border-t border-slate-700/80">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary text-xs px-3.5 py-1.5">キャンセル</button>
                    <button type="submit" className="btn btn-primary text-xs px-4 py-1.5">保存</button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default GanttChart;
