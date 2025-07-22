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
        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-8 space-y-6 border border-white/40 shadow-lg">
            <div className="form-header">
                <h1 className="text-3xl font-bold mb-2 text-blue-800">パスワード登録</h1>
                <p className="form-subtitle">新しいサイトのパスワード情報を登録します</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4 mb-6">
                    <label className="block text-gray-800 font-semibold mb-2">カテゴリ</label>
                    <input
                        type="text"
                        name="category"
                        value={formData.category}
                        className="w-full border border-gray-300 p-3 rounded-lg bg-white text-gray-900 placeholder-gray-500 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400"
                        onChange={handleChange}
                    />
                </div>
                <div className="space-y-4 mb-6">
                    <label className="block text-gray-800 font-semibold mb-2">サイト名</label>
                    <input
                        type="text"
                        name="site_name"
                        value={formData.site_name}
                        className="w-full border border-gray-300 p-3 rounded-lg bg-white text-gray-900 placeholder-gray-500 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400"
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="space-y-4 mb-6">
                    <label className="block text-gray-800 font-semibold mb-2">サイトURL</label>
                    <input
                        type="text"
                        name="site_url"
                        value={formData.site_url}
                        className="w-full border border-gray-300 p-3 rounded-lg bg-white text-gray-900 placeholder-gray-500 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400"
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="space-y-4 mb-6">
                    <label className="block text-gray-800 font-semibold mb-2">ログインID</label>
                    <input
                        type="text"
                        name="login_id"
                        value={formData.login_id}
                        className="w-full border border-gray-300 p-3 rounded-lg bg-white text-gray-900 placeholder-gray-500 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400"
                        onChange={handleChange}
                    />
                </div>
                <div className="space-y-4 mb-6">
                    <label className="block text-gray-800 font-semibold mb-2">パスワード</label>
                    <input
                        type="text"
                        name="password"
                        value={formData.password}
                        className="w-full border border-gray-300 p-3 rounded-lg bg-white text-gray-900 placeholder-gray-500 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400"
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="space-y-4 mb-6">
                    <label className="block text-gray-800 font-semibold mb-2">メールアドレス</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        className="w-full border border-gray-300 p-3 rounded-lg bg-white text-gray-900 placeholder-gray-500 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400"
                        onChange={handleChange}
                    />
                </div>
                <div className="space-y-4 mb-6">
                    <label className="block text-gray-800 font-semibold mb-2">メモ</label>
                    <textarea
                        name="memo"
                        value={formData.memo}
                        className="form-textarea"
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
