'use client';

import { useState, useEffect } from 'react';
import { motion, Reorder } from 'framer-motion';
import type { Photo } from '../../types/photo';

export default function ManagePhotosPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // セッションストレージから認証状態を確認
    const savedPassword = sessionStorage.getItem('adminPassword');
    if (savedPassword) {
      setPassword(savedPassword);
      setIsAuthenticated(true);
      fetchPhotos(savedPassword);
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    sessionStorage.setItem('adminPassword', password);
    setIsAuthenticated(true);
    fetchPhotos(password);
  };

  const fetchPhotos = async (pwd: string) => {
    try {
      const response = await fetch('/api/photos');
      const data = await response.json();
      if (data.length > 0) {
        const sortedPhotos = data.sort((a: Photo, b: Photo) => {
          const orderA = a.order !== undefined ? a.order : 999;
          const orderB = b.order !== undefined ? b.order : 999;
          return orderA - orderB;
        });
        setPhotos(sortedPhotos);
      }
    } catch (error) {
      console.error('Failed to fetch photos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveOrder = async () => {
    setSaving(true);
    setMessage('');

    // orderを更新
    const updatedPhotos = photos.map((photo, index) => ({
      ...photo,
      order: index,
    }));

    try {
      const response = await fetch('/api/photos/manage', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${password}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ photos: updatedPhotos }),
      });

      if (response.ok) {
        setMessage('✓ 順序を保存しました');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('エラー: 保存に失敗しました');
      }
    } catch (error) {
      setMessage('エラー: 保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (photo: Photo) => {
    if (!confirm(`「${photo.title || photo.src}」を削除しますか？`)) {
      return;
    }

    try {
      const response = await fetch(
        `/api/photos/manage?id=${photo.id}&url=${encodeURIComponent(photo.src)}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${password}`,
          },
        }
      );

      if (response.ok) {
        setPhotos(photos.filter(p => p.id !== photo.id));
        setMessage('✓ 削除しました');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('エラー: 削除に失敗しました');
      }
    } catch (error) {
      setMessage('エラー: 削除に失敗しました');
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
            写真管理画面
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-serif text-gray-800">写真管理</h1>
            <div className="flex gap-3">
              <a
                href="/admin"
                className="px-4 py-2 text-gray-600 hover:text-gray-800 underline"
              >
                アップロード画面へ
              </a>
              <a
                href="/"
                className="px-4 py-2 text-gray-600 hover:text-gray-800 underline"
              >
                トップページへ
              </a>
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-6">
            ドラッグ&ドロップで順序を変更できます
          </p>

          {message && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`mb-6 p-3 rounded-lg text-center ${
                message.includes('✓') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}
            >
              {message}
            </motion.div>
          )}

          <Reorder.Group axis="y" values={photos} onReorder={setPhotos} className="space-y-4">
            {photos.map((photo) => (
              <Reorder.Item
                key={photo.id}
                value={photo}
                className="bg-white border border-gray-200 rounded-lg p-4 cursor-move hover:shadow-md transition"
              >
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <img
                      src={photo.src}
                      alt={photo.title}
                      className="w-24 h-24 object-cover rounded"
                    />
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-medium text-gray-800">
                      {photo.title || '（タイトルなし）'}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {photo.category.join(', ')}
                    </p>
                    {photo.description && (
                      <p className="text-sm text-gray-600 mt-1">{photo.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(photo)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                  >
                    削除
                  </button>
                </div>
              </Reorder.Item>
            ))}
          </Reorder.Group>

          <div className="mt-8 flex justify-center">
            <button
              onClick={handleSaveOrder}
              disabled={saving}
              className="px-8 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition disabled:bg-gray-400"
            >
              {saving ? '保存中...' : '順序を保存'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
