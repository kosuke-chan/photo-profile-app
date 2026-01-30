'use client';

import { useState, FormEvent } from 'react';
import { motion } from 'framer-motion';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categories, setCategories] = useState('nature');
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [preview, setPreview] = useState<string | null>(null);

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    // 簡易的な認証チェック（実際の認証はAPI側で行う）
    if (password) {
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('パスワードを入力してください');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      // プレビュー表示
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleUpload = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setUploadStatus('アップロード中...');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('categories', categories);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${password}`,
        },
        body: formData,
      });

      if (response.ok) {
        setUploadStatus('✓ アップロード成功！');
        // フォームをリセット
        setFile(null);
        setTitle('');
        setDescription('');
        setCategories('nature');
        setPreview(null);
        setTimeout(() => setUploadStatus(''), 3000);
      } else {
        const error = await response.json();
        setUploadStatus(`エラー: ${error.error}`);
      }
    } catch (error) {
      setUploadStatus('エラー: アップロードに失敗しました');
    } finally {
      setUploading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-lg shadow-md w-full max-w-md"
        >
          <h1 className="text-2xl font-serif text-gray-800 mb-6 text-center">
            管理画面ログイン
          </h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-2">
                パスワード
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                placeholder="パスワードを入力"
              />
            </div>
            {authError && (
              <p className="text-red-500 text-sm">{authError}</p>
            )}
            <button
              type="submit"
              className="w-full bg-gray-800 text-white py-2 rounded-lg hover:bg-gray-700 transition"
            >
              ログイン
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-serif text-gray-800 mb-8 text-center">
            写真アップロード
          </h1>

          <form onSubmit={handleUpload} className="space-y-6">
            {/* ファイル選択 */}
            <div>
              <label className="block text-sm text-gray-600 mb-2">
                写真を選択 *
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                required
              />
            </div>

            {/* プレビュー */}
            {preview && (
              <div className="mt-4">
                <img
                  src={preview}
                  alt="プレビュー"
                  className="w-full max-w-md mx-auto rounded-lg shadow-md"
                />
              </div>
            )}

            {/* タイトル */}
            <div>
              <label className="block text-sm text-gray-600 mb-2">
                タイトル（任意）
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                placeholder="写真のタイトル"
              />
            </div>

            {/* 説明 */}
            <div>
              <label className="block text-sm text-gray-600 mb-2">
                説明（任意）
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                placeholder="写真の説明"
                rows={3}
              />
            </div>

            {/* カテゴリ */}
            <div>
              <label className="block text-sm text-gray-600 mb-2">
                カテゴリ（カンマ区切り）
              </label>
              <input
                type="text"
                value={categories}
                onChange={(e) => setCategories(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                placeholder="例: nature, monochrome"
              />
            </div>

            {/* アップロードボタン */}
            <button
              type="submit"
              disabled={!file || uploading}
              className="w-full bg-gray-800 text-white py-3 rounded-lg hover:bg-gray-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {uploading ? 'アップロード中...' : 'アップロード'}
            </button>

            {/* ステータス表示 */}
            {uploadStatus && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`text-center ${
                  uploadStatus.includes('成功') ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {uploadStatus}
              </motion.p>
            )}
          </form>

          {/* トップページへのリンク */}
          <div className="mt-8 text-center">
            <a
              href="/"
              className="text-gray-600 hover:text-gray-800 underline"
            >
              ← トップページに戻る
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
