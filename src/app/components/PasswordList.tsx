'use client';

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import type { Password } from '@/types/password';

type PasswordListProps = {
    passwords: Password[];
};

const PasswordList: React.FC<PasswordListProps> = ({ passwords }) => {
    const router = useRouter();
    const [visiblePasswordId, setVisiblePasswordId] = useState<number | null>(null);

    const handleUpdate = (id: number) => {
        router.push(`/passwords/edit/${id}`);
    };

    const handlePasswordClick = (password: string, id: number) => {
        // 表示切り替え
        setVisiblePasswordId(visiblePasswordId === id ? null : id);

        // 一時的なテキストエリアを作成してパスワードをコピー
        const textArea = document.createElement('textarea');
        textArea.value = password;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            alert('パスワードがクリップボードにコピーされました');
        } catch (err) {
            console.error('クリップボードへのコピーに失敗しました', err);
        }
        document.body.removeChild(textArea);
    };

    const renderLink = (url: string) => (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-400 hover:text-indigo-300 hover:underline transition-colors font-medium"
            aria-label={`Open ${url} in a new tab`}
        >
            {url}
        </a>
    );

    const TableRow: React.FC<{ password: Password }> = ({ password }) => (
        <tr key={password.id} className="table-row">
            <td className="table-cell font-semibold text-slate-100">{password.site_name}</td>
            <td className="table-cell">{renderLink(password.site_url)}</td>
            <td className="table-cell font-mono text-slate-200">{password.login_id ?? "N/A"}</td>
            <td
                className="table-cell font-mono cursor-pointer text-center text-indigo-300 hover:text-indigo-200 transition-colors"
                onClick={() => handlePasswordClick(password.password, password.id)}
                aria-label={`Click to copy password for ${password.site_name}`}
                title="クリックでコピー"
            >
                {visiblePasswordId === password.id ? password.password : '••••••••••••'}
            </td>
            <td className="table-cell font-mono text-slate-300">{password.email ?? "N/A"}</td>
            <td className="table-cell text-center">
                <button
                    onClick={() => handleUpdate(password.id)}
                    className="btn btn-primary btn-sm"
                    aria-label={`Update details for ${password.site_name}`}
                >
                    更新
                </button>
            </td>
        </tr>
    );

    return (
        <div className="table-container">
            <table className="table-basic">
                <thead>
                    <tr>
                        <th className="table-header w-1/6 text-left">サイト名</th>
                        <th className="table-header w-1/6 text-left">サイトURL</th>
                        <th className="table-header w-1/6 text-left">ログインID</th>
                        <th className="table-header w-1/6 text-center">パスワード</th>
                        <th className="table-header w-1/6 text-left">メールアドレス</th>
                        <th className="table-header w-1/6 text-center">操作</th>
                    </tr>
                </thead>
                <tbody>
                    {passwords.map((password) => (
                        <TableRow key={password.id} password={password} />
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default PasswordList;
