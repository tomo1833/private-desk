'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const AddPasswordPage: React.FC = () => {
    const router = useRouter();

    const [formData, setFormData] = useState({
        category: "",
        site_name: "",
        site_url: "",
        login_id: "",
        password: "",
        email: "",
        memo: "",
        display_order: 0,
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ): void => {
        const { name, value } = e.target;
        if (name === "display_order") {
            setFormData({ ...formData, [name]: Number(value) });
            return;
        }
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        const res = await fetch("/api/passwords", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
        });
        if (res.ok) {
            router.push('/passwords');
        } else {
            alert("登録に失敗しました");
        }
    };

    return (
        <div className="space-y-6 page-wrap max-w-2xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
                        <span>🔑</span> パスワード新規登録
                    </h1>
                    <p className="text-xs text-slate-300 mt-1">新しいWebサービス・サイトのアカウント情報を登録します</p>
                </div>
                <Link href="/passwords" className="btn btn-secondary text-xs">
                    ← 一覧に戻る
                </Link>
            </div>

            <form onSubmit={handleSubmit} className="card-form space-y-4 shadow-2xl border border-indigo-500/30">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="form-label">サイト名 <span className="text-rose-400">*</span></label>
                        <input
                            type="text"
                            name="site_name"
                            value={formData.site_name}
                            className="form-input"
                            onChange={handleChange}
                            placeholder="例: Amazon, GitHub, Google"
                            required
                        />
                    </div>
                    <div>
                        <label className="form-label">カテゴリ</label>
                        <input
                            type="text"
                            name="category"
                            value={formData.category}
                            className="form-input"
                            onChange={handleChange}
                            placeholder="例: EC, 開発ツール, 銀行"
                        />
                    </div>
                </div>

                <div>
                    <label className="form-label">サイトURL <span className="text-rose-400">*</span></label>
                    <input
                        type="text"
                        name="site_url"
                        value={formData.site_url}
                        className="form-input font-mono"
                        onChange={handleChange}
                        placeholder="https://example.com"
                        required
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="form-label">ログインID / ユーザー名</label>
                        <input
                            type="text"
                            name="login_id"
                            value={formData.login_id}
                            className="form-input font-mono"
                            onChange={handleChange}
                            placeholder="user_id"
                        />
                    </div>
                    <div>
                        <label className="form-label">メールアドレス</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            className="form-input font-mono"
                            onChange={handleChange}
                            placeholder="user@example.com"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="form-label">パスワード <span className="text-rose-400">*</span></label>
                        <input
                            type="text"
                            name="password"
                            value={formData.password}
                            className="form-input font-mono"
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div>
                        <label className="form-label">表示順</label>
                        <input
                            type="number"
                            min={0}
                            step={1}
                            name="display_order"
                            value={formData.display_order}
                            className="form-input font-mono"
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div>
                    <label className="form-label">メモ・注意事項</label>
                    <textarea
                        name="memo"
                        value={formData.memo}
                        className="form-textarea min-h-24"
                        onChange={handleChange}
                        placeholder="2段階認証コードや秘密の質問など..."
                    ></textarea>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-700/80">
                    <Link href="/passwords" className="btn btn-secondary text-xs px-3.5 py-1.5">
                        キャンセル
                    </Link>
                    <button type="submit" className="btn btn-primary text-xs px-4 py-1.5">
                        登録する
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddPasswordPage;
