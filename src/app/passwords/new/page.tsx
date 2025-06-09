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
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">新しいサイトを作成</h1>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                    <label>カテゴリ</label>
                    <input
                        type="text"
                        name="category"
                        value={formData.category}
                        className="w-full p-2 border rounded"
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label>サイト名</label>
                    <input
                        type="text"
                        name="site_name"
                        value={formData.site_name}
                        className="w-full p-2 border rounded"
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>サイトURL</label>
                    <input
                        type="text"
                        name="site_url"
                        value={formData.site_url}
                        className="w-full p-2 border rounded"
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>ログインID</label>
                    <input
                        type="text"
                        name="login_id"
                        value={formData.login_id}
                        className="w-full p-2 border rounded"
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label>パスワード</label>
                    <input
                        type="text"
                        name="password"
                        value={formData.password}
                        className="w-full p-2 border rounded"
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>メールアドレス</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        className="w-full p-2 border rounded"
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label>メモ</label>
                    <textarea
                        name="memo"
                        value={formData.memo}
                        className="w-full p-2 border rounded"
                        onChange={handleChange}
                    ></textarea>
                </div>
                <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">登録</button>
            </form>
        </div>
    );
};

export default AddPassword;
