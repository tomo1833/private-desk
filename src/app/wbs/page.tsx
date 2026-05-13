'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Project } from '@/types/project';

const ProjectListPage = () => {
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  const load = async () => {
    try {
      const res = await fetch('/api/projects');
      if (!res.ok) throw new Error('読み込み失敗');
      const data: Project[] = await res.json();
      setProjects(data);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newProjectName }),
      });
      if (!res.ok) throw new Error('作成失敗');
      setNewProjectName('');
      setIsModalOpen(false);
      load();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  if (error) return <div className="page-wrap text-white">読み込みエラー: {error}</div>;
  if (!projects) return <div className="page-wrap text-white">読み込み中...</div>;

  return (
    <div className="space-y-6 page-wrap pb-10">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <span className="text-accent-gold">WBS</span> プロジェクト管理
        </h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary"
        >
          新規プロジェクト
        </button>
      </div>

      <div className="grid-responsive">
        {projects.map((project) => (
          <div key={project.id} className="card-basic hover:scale-[1.02] transition-all group relative overflow-hidden">
             <div className="absolute top-0 left-0 w-1 h-full bg-primary-navy group-hover:bg-accent-gold transition-colors" />
             <div className="space-y-4">
                <div>
                  <Link href={`/wbs/${project.id}`} className="text-xl font-bold text-primary-navy dark:text-accent-gold hover:underline">
                    {project.name}
                  </Link>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                    {project.description || '説明なし'}
                  </p>
                </div>
                
                <div className="flex justify-between items-center text-xs text-gray-400">
                  <span>ステータス: <span className="text-success font-semibold">{project.status}</span></span>
                  <span>作成日: {new Date(project.created_at).toLocaleDateString('ja-JP')}</span>
                </div>

                <div className="flex gap-2">
                  <Link href={`/wbs/${project.id}`} className="btn btn-sm btn-outline flex-1">
                    チャートを表示
                  </Link>
                </div>
             </div>
          </div>
        ))}
        {projects.length === 0 && (
          <div className="col-span-full py-20 text-center text-gray-300 border-2 border-dashed border-gray-600 rounded-xl">
             プロジェクトがありません。新しく作成してください。
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="card-form w-full max-w-md animate-float-in">
            <h2 className="text-2xl font-bold text-primary-navy dark:text-white mb-6">新規プロジェクト</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="form-label">プロジェクト名</label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="form-input"
                  placeholder="例: 新規事業開発 WBS"
                  required
                  autoFocus
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                  キャンセル
                </button>
                <button type="submit" className="btn btn-primary">
                  作成する
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes float-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-float-in {
          animation: float-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default ProjectListPage;
