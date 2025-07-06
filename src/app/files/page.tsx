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
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">ファイル管理</h1>
      {path && (
        <button onClick={goUp} className="text-blue-600 hover:underline">
          上のフォルダへ
        </button>
      )}
      <ul className="space-y-1">
        {entries.map((e) => (
          <li key={e.name}>
            {e.isDirectory ? (
              <button onClick={() => openDir(e.name)} className="text-blue-600 hover:underline">
                {e.name}/
              </button>
            ) : (
              <a href={`/docs/${path ? path + '/' : ''}${e.name}`} download className="text-blue-600 hover:underline">
                {e.name}
              </a>
            )}
          </li>
        ))}
      </ul>
      <form onSubmit={handleCreate} className="space-x-2">
        <input
          value={folderName}
          onChange={(e) => setFolderName(e.target.value)}
          placeholder="フォルダ名"
          className="border p-1"
          required
        />
        <button type="submit" className="bg-blue-500 text-white px-2 py-1 rounded">
          フォルダ作成
        </button>
      </form>
      <form onSubmit={handleUpload} className="space-x-2">
        <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <button type="submit" className="bg-blue-500 text-white px-2 py-1 rounded">
          アップロード
        </button>
      </form>
    </div>
  );
};

export default FileManagerPage;
