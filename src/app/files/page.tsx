'use client';

import { useEffect, useState } from 'react';
import type { FileEntry } from '@/types/fileEntry';

const FileManagerPage = () => {
  const [path, setPath] = useState('');
  const [entries, setEntries] = useState<FileEntry[]>([]);
  const [folderName, setFolderName] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const load = async (p: string) => {
    const res = await fetch(`/api/files?path=${encodeURIComponent(p)}`);
    if (res.ok) {
      const data: FileEntry[] = await res.json();
      setEntries(data);
      setPath(p);
    }
  };

  useEffect(() => {
    load('');
  }, []);

  const goUp = () => {
    const parts = path.split('/');
    parts.pop();
    const parent = parts.join('/');
    load(parent);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/files', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path, name: folderName }),
    });
    if (res.ok) {
      setFolderName('');
      load(path);
    } else {
      alert('作成失敗');
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    fd.append('path', path);
    const res = await fetch('/api/files/upload', { method: 'POST', body: fd });
    if (res.ok) {
      setFile(null);
      (e.target as HTMLFormElement).reset();
      load(path);
    } else {
      alert('アップロード失敗');
    }
  };

  const openDir = (name: string) => {
    const newPath = path ? `${path}/${name}` : name;
    load(newPath);
  };

  return (
    <div className="w-full px-2 sm:px-6 lg:px-8">
      <div className="bg-white dark:bg-gray-800 backdrop-blur-sm rounded-xl p-8 space-y-6 border border-gray-200 dark:border-gray-700 shadow-lg">
        <div className="form-header">
          <h1 className="text-3xl font-bold mb-2 text-blue-800">ファイル管理</h1>
          <p className="form-subtitle">ファイルのアップロードやフォルダ作成を行います</p>
        </div>
      {path && (
        <button onClick={goUp} className="text-blue-600 dark:text-blue-400 hover:underline">
          上のフォルダへ
        </button>
      )}
      <ul className="space-y-1">
        {entries.map((e) => (
          <li key={e.name}>
            {e.isDirectory ? (
              <button onClick={() => openDir(e.name)} className="text-blue-600 dark:text-blue-400 hover:underline">
                {e.name}/
              </button>
            ) : (
              <a href={`/docs/${path ? path + '/' : ''}${e.name}`} download className="text-blue-600 dark:text-blue-400 hover:underline">
                {e.name}
              </a>
            )}
          </li>
        ))}
      </ul>
      <div className="space-y-4 mb-6">
        <label className="block text-gray-800 font-semibold mb-2">フォルダ作成</label>
        <form onSubmit={handleCreate} className="flex gap-2">
          <input
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            placeholder="フォルダ名"
            className="w-full border border-gray-300 p-3 rounded-lg bg-white text-gray-900 placeholder-gray-500 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 flex-1"
            required
          />
          <button type="submit" className="btn btn-sm btn-primary">
            作成
          </button>
        </form>
      </div>
      <div className="space-y-4 mb-6">
        <label className="block text-gray-800 font-semibold mb-2">ファイルアップロード</label>
        <form onSubmit={handleUpload} className="flex gap-2">
          <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="form-file flex-1" />
          <button type="submit" className="btn btn-sm btn-primary">
            アップロード
          </button>
        </form>
      </div>
      </div>
    </div>
  );
};

export default FileManagerPage;
