'use client';

import { useEffect, useState, use, useCallback } from 'react';
import Link from 'next/link';
import type { Project } from '@/types/project';
import GanttChart from '@/app/components/GanttChart';

const ProjectDetailPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = use(params);
  const [project, setProject] = useState<Project | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isEditingProject, setIsEditingProject] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/${id}`);
      if (!res.ok) throw new Error('プロジェクトが見つかりません');
      const data = await res.json();
      setProject(data);
    } catch (err) {
      setError((err as Error).message);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleUpdateProject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      status: formData.get('status') as string,
    };

    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('更新失敗');
      setIsEditingProject(false);
      load();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  if (error) return <div className="page-wrap text-rose-400 p-8 text-center card-basic">エラー: {error}</div>;
  if (!project) return <div className="page-wrap text-slate-300 p-8 text-center card-basic">読み込み中...</div>;

  return (
    <div className="space-y-6 page-wrap pb-20">
      {/* Breadcrumbs */}
      <nav className="flex text-xs font-semibold text-slate-400 gap-2 mb-2">
        <Link href="/wbs" className="hover:text-indigo-400 transition-colors">WBS一覧</Link>
        <span>/</span>
        <span className="text-white font-bold">{project.name}</span>
      </nav>

      {/* Project Header */}
      <div className="card-basic space-y-4 p-6">
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
              <span>📊</span> {project.name}
            </h1>
            <p className="text-sm text-slate-300">{project.description || 'プロジェクトの説明はありません。'}</p>
          </div>
          <div className="flex gap-2">
             <button onClick={() => setIsEditingProject(true)} className="btn btn-secondary text-xs px-3.5 py-1.5">⚙️ 設定</button>
             <Link href="/wbs" className="btn btn-secondary text-xs px-3.5 py-1.5">← 戻る</Link>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-4 text-xs font-mono border-t border-slate-700/80 pt-4">
           <div className="flex items-center gap-2">
              <span className="text-slate-400">ステータス:</span>
              <span className="bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-full font-bold border border-emerald-500/30">{project.status}</span>
           </div>
           <div className="flex items-center gap-2">
              <span className="text-slate-400">期間:</span>
              <span className="text-slate-200">
                {project.startDate ? new Date(project.startDate).toLocaleDateString() : '未設定'} 
                - 
                {project.endDate ? new Date(project.endDate).toLocaleDateString() : '未設定'}
              </span>
           </div>
        </div>
      </div>

      {/* Gantt Chart Section */}
      <div className="w-full">
        <GanttChart 
          projectId={project.id} 
          tasks={project.tasks || []} 
          onUpdate={load} 
        />
      </div>

      {/* Project Settings Modal */}
      {isEditingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
           <div className="card-form w-full max-w-md shadow-2xl border border-indigo-500/30">
              <h2 className="text-xl font-bold mb-4 text-white border-b border-slate-700/80 pb-3 flex items-center gap-2">
                <span>⚙️</span> プロジェクト設定
              </h2>
              <form onSubmit={handleUpdateProject} className="space-y-4">
                 <div>
                    <label className="form-label text-xs">名前</label>
                    <input name="name" defaultValue={project.name} className="form-input text-xs" required />
                 </div>
                 <div>
                    <label className="form-label text-xs">説明</label>
                    <textarea name="description" defaultValue={project.description || ''} className="form-textarea text-xs h-24" />
                 </div>
                 <div>
                    <label className="form-label text-xs">ステータス</label>
                    <select name="status" defaultValue={project.status} className="form-input text-xs">
                       <option value="Active">進行中</option>
                       <option value="Completed">完了</option>
                       <option value="On Hold">保留</option>
                    </select>
                 </div>
                 <div className="flex justify-end gap-2 pt-3 border-t border-slate-700/80">
                    <button type="button" onClick={() => setIsEditingProject(false)} className="btn btn-secondary text-xs px-3.5 py-1.5">キャンセル</button>
                    <button type="submit" className="btn btn-primary text-xs px-4 py-1.5">更新</button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetailPage;
