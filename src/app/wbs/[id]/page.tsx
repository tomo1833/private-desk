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

  if (error) return <div className="page-wrap text-white py-10">エラー: {error}</div>;
  if (!project) return <div className="page-wrap text-white py-10">読み込み中...</div>;

  return (
    <div className="space-y-6 page-wrap pb-20">
      {/* Breadcrumbs */}
      <nav className="flex text-sm text-gray-400 gap-2 mb-2">
        <Link href="/wbs" className="hover:text-accent-gold transition-colors">WBS一覧</Link>
        <span>/</span>
        <span className="text-white font-medium">{project.name}</span>
      </nav>

      {/* Project Header */}
      <div className="card-basic">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-primary-navy dark:text-accent-gold">{project.name}</h1>
            <p className="text-gray-600 dark:text-gray-400">{project.description || 'プロジェクトの説明はありません。'}</p>
          </div>
          <div className="flex gap-2">
             <button onClick={() => setIsEditingProject(true)} className="btn btn-sm btn-outline">設定</button>
             <Link href="/wbs" className="btn btn-sm btn-secondary">戻る</Link>
          </div>
        </div>
        
        <div className="mt-6 flex flex-wrap gap-4 text-sm border-t border-gray-100 dark:border-gray-800 pt-4">
           <div className="flex items-center gap-2">
              <span className="text-gray-500">ステータス:</span>
              <span className="bg-success/10 text-success px-2 py-0.5 rounded-full font-bold">{project.status}</span>
           </div>
           <div className="flex items-center gap-2">
              <span className="text-gray-500">期間:</span>
              <span className="text-gray-700 dark:text-gray-300">
                {project.start_date ? new Date(project.start_date).toLocaleDateString() : '未設定'} 
                - 
                {project.end_date ? new Date(project.end_date).toLocaleDateString() : '未設定'}
              </span>
           </div>
        </div>
      </div>

      {/* Gantt Chart Section */}
      <div className="w-full overflow-x-auto">
        <GanttChart 
          projectId={project.id} 
          tasks={project.tasks || []} 
          onUpdate={load} 
        />
      </div>

      {/* Project Settings Modal */}
      {isEditingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
           <div className="card-form w-full max-w-md">
              <h2 className="text-2xl font-bold mb-6 text-primary-navy">プロジェクト設定</h2>
              <form onSubmit={handleUpdateProject} className="space-y-4">
                 <div>
                    <label className="form-label">名前</label>
                    <input name="name" defaultValue={project.name} className="form-input" required />
                 </div>
                 <div>
                    <label className="form-label">説明</label>
                    <textarea name="description" defaultValue={project.description || ''} className="form-textarea h-24" />
                 </div>
                 <div>
                    <label className="form-label">ステータス</label>
                    <select name="status" defaultValue={project.status} className="form-input">
                       <option value="Active">進行中</option>
                       <option value="Completed">完了</option>
                       <option value="On Hold">保留</option>
                    </select>
                 </div>
                 <div className="flex justify-end gap-3 pt-4">
                    <button type="button" onClick={() => setIsEditingProject(false)} className="btn btn-secondary">キャンセル</button>
                    <button type="submit" className="btn btn-primary">更新</button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetailPage;
