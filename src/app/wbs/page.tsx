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

  if (error) return <div className="page-wrap p-8 text-center text-rose-400 card-basic">読み込みエラー: {error}</div>;
  if (!projects) return <div className="page-wrap p-8 text-center text-slate-300 card-basic">読み込み中...</div>;

  return (
    <div className="space-y-6 page-wrap pb-10">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
          <span className="text-amber-400">📊 WBS</span> プロジェクト管理
        </h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary text-xs sm:text-sm"
        >
          ➕ 新規プロジェクト
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => (
          <div key={project.id} className="card-basic hover:border-indigo-500/40 transition-all group relative overflow-hidden p-5">
             <div className="space-y-4">
                <div>
                  <Link href={`/wbs/${project.id}`} className="text-lg font-bold text-white hover:text-indigo-300 transition-colors">
                    {project.name}
                  </Link>
                  <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                    {project.description || '説明なし'}
                  </p>
                </div>
                
                <div className="flex justify-between items-center text-xs text-slate-400 font-mono">
                  <span>ステータス: <span className="text-emerald-400 font-semibold">{project.status}</span></span>
                  <span>作成日: {new Date(project.createdAt).toLocaleDateString('ja-JP')}</span>
                </div>

                <div className="flex gap-2 pt-2 border-t border-slate-700/60">
                  <Link href={`/wbs/${project.id}`} className="btn btn-secondary text-xs flex-1 text-center py-2">
                    📊 ガントチャートを表示
                  </Link>
                </div>
             </div>
          </div>
        ))}
        {projects.length === 0 && (
          <div className="col-span-full py-16 text-center text-slate-300 border-2 border-dashed border-slate-700 rounded-2xl bg-slate-900/40 card-basic">
             プロジェクトがありません。新しく作成してください。
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="card-form w-full max-w-md shadow-2xl border border-indigo-500/30 space-y-4">
            <h2 className="text-xl font-bold text-white mb-4 border-b border-slate-700/80 pb-3 flex items-center gap-2">
              <span>📌</span> 新規プロジェクト
            </h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="form-label text-xs">プロジェクト名</label>
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
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-700/80">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary text-xs px-3.5 py-1.5">
                  キャンセル
                </button>
                <button type="submit" className="btn btn-primary text-xs px-4 py-1.5">
                  作成する
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectListPage;
