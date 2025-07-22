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
            className="text-blue-600 hover:underline"
            aria-label={`Open ${url} in a new tab`}
        >
            {url}
        </a>
    );

    const TableRow: React.FC<{ password: Password }> = ({ password }) => (
        <tr key={password.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100">
            <td className="py-4 px-3 border-b border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100">{password.site_name}</td>
            <td className="py-4 px-3 border-b border-gray-200 dark:border-gray-600">{renderLink(password.site_url)}</td>
            <td className="py-4 px-3 border-b border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100">{password.login_id ?? "N/A"}</td>
            <td
                className="py-4 px-3 border-b border-gray-200 dark:border-gray-600 cursor-pointer text-center text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400"
                onClick={() => handlePasswordClick(password.password, password.id)}
                aria-label={`Click to copy password for ${password.site_name}`}
                title="クリックでコピー"
            >
                **********
            </td>
            <td className="py-4 px-3 border-b border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100">{password.email ?? "N/A"}</td>
            <td className="py-4 px-3 border-b border-gray-200 dark:border-gray-600 text-center">
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
        <div className="overflow-x-auto">
            <table className="w-full bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-lg overflow-hidden shadow-sm">
                <thead>
                    <tr className="bg-gray-50 dark:bg-gray-700">
                        <th className="py-4 px-3 border-b border-gray-200 dark:border-gray-600 w-1/6 text-left text-gray-900 dark:text-gray-100 font-semibold">サイト名</th>
                        <th className="py-4 px-3 border-b border-gray-200 dark:border-gray-600 w-1/6 text-left text-gray-900 dark:text-gray-100 font-semibold">サイトURL</th>
                        <th className="py-4 px-3 border-b border-gray-200 dark:border-gray-600 w-1/6 text-left text-gray-900 dark:text-gray-100 font-semibold">ログインID</th>
                        <th className="py-4 px-3 border-b border-gray-200 dark:border-gray-600 w-1/6 text-left text-gray-900 dark:text-gray-100 font-semibold">パスワード</th>
                        <th className="py-4 px-3 border-b border-gray-200 dark:border-gray-600 w-1/6 text-left text-gray-900 dark:text-gray-100 font-semibold">メールアドレス</th>
                        <th className="py-4 px-3 border-b border-gray-200 dark:border-gray-600 w-1/6 text-gray-900 dark:text-gray-100 font-semibold">操作</th>
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
