'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const AddPassword: React.FC = () => {

    const router = useRouter();

    const [formData, setFormData] = useState({
        category: "",
        site_name: "",
        site_url: "",
        login_id: "",
        password: "",
        email: "",
        memo: "",
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ): void => {
        const { name, value } = e.target;
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
            alert("登録成功！");
            setFormData({ category: "", site_name: "", site_url: "", login_id: "", password: "", email: "", memo: "" });
            router.push('/');
        } else {
            alert("登録失敗");
        }
    };

    return (
        <div className="card-form">
            <div className="form-header">
                <h1 className="text-3xl font-bold mb-2 text-blue-800">パスワード登録</h1>
                <p className="form-subtitle">新しいサイトのパスワード情報を登録します</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4 mb-6">
                    <label className="form-label">カテゴリ</label>
                    <input
                        type="text"
                        name="category"
                        value={formData.category}
                        className="form-input"
                        onChange={handleChange}
                    />
                </div>
                <div className="space-y-4 mb-6">
                    <label className="form-label">サイト名</label>
                    <input
                        type="text"
                        name="site_name"
                        value={formData.site_name}
                        className="form-input"
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="space-y-4 mb-6">
                    <label className="form-label">サイトURL</label>
                    <input
                        type="text"
                        name="site_url"
                        value={formData.site_url}
                        className="form-input"
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="space-y-4 mb-6">
                    <label className="form-label">ログインID</label>
                    <input
                        type="text"
                        name="login_id"
                        value={formData.login_id}
                        className="form-input"
                        onChange={handleChange}
                    />
                </div>
                <div className="space-y-4 mb-6">
                    <label className="form-label">パスワード</label>
                    <input
                        type="text"
                        name="password"
                        value={formData.password}
                        className="form-input"
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="space-y-4 mb-6">
                    <label className="form-label">メールアドレス</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        className="form-input"
                        onChange={handleChange}
                    />
                </div>
                <div className="space-y-4 mb-6">
                    <label className="form-label">メモ</label>
                    <textarea
                        name="memo"
                        value={formData.memo}
                        className="form-textarea min-h-24"
                        onChange={handleChange}
                    ></textarea>
                </div>
                <div className="flex justify-between gap-3 pt-6 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={() => router.push('/')}
                        className="btn btn-secondary"
                    >
                        キャンセル
                    </button>
                    <button type="submit" className="btn btn-primary">
                        登録
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddPassword;
