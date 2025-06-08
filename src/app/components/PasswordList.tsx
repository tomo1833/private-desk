'use client';

import React, { useState } from "react";
import { useRouter } from "next/navigation";

type Password = {
    id: number;
    site_name: string;
    site_url: string;
    login_id: string | null;
    password: string;
    email: string | null;
    category: string | null;
};

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
        <tr key={password.id} className="hover:bg-gray-50">
            <td className="py-4 px-2 border-b border-gray-300">{password.site_name}</td>
            <td className="py-4 px-2 border-b border-gray-300">{renderLink(password.site_url)}</td>
            <td className="py-4 px-2 border-b border-gray-300">{password.login_id ?? "N/A"}</td>
            <td
                className="py-4 px-2 border-b border-gray-300 cursor-pointer text-center"
                onClick={() => handlePasswordClick(password.password, password.id)}
                aria-label={`Click to copy password for ${password.site_name}`}
                title="クリックでコピー"
            >
                **********
            </td>
            <td className="py-4 px-2 border-b border-gray-300">{password.email ?? "N/A"}</td>
            <td className="py-4 px-2 border-b border-gray-300 text-center">
                <button
                    onClick={() => handleUpdate(password.id)}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 focus:outline-none"
                    aria-label={`Update details for ${password.site_name}`}
                >
                    更新
                </button>
            </td>
        </tr>
    );

    return (
        <table className="w-full bg-white border border-gray-300">
            <thead>
                <tr className="bg-gray-100">
                    <th className="py-4 px-2 border-b border-gray-300 w-1/6 text-left">サイト名</th>
                    <th className="py-4 px-2 border-b border-gray-300 w-1/6 text-left">サイトURL</th>
                    <th className="py-4 px-2 border-b border-gray-300 w-1/6 text-left">ログインID</th>
                    <th className="py-4 px-2 border-b border-gray-300 w-1/6 text-left">パスワード</th>
                    <th className="py-4 px-2 border-b border-gray-300 w-1/6 text-left">メールアドレス</th>
                    <th className="py-4 px-2 border-b border-gray-300 w-1/6">操作</th>
                </tr>
            </thead>
            <tbody>
                {passwords.map((password) => (
                    <TableRow key={password.id} password={password} />
                ))}
            </tbody>
        </table>
    );
};

export default PasswordList;
