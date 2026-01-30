'use client';

import { useState, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { upload } from '@vercel/blob/client';
import imageCompression from 'browser-image-compression';

const AVAILABLE_CATEGORIES = ['nature', 'monochrome', 'street', 'home', 'portrait', 'landscape'];

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  
  const [file, setFile] = useState<File | null>(null);
  const [compressedFile, setCompressedFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['nature']);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [compressionStatus, setCompressionStatus] = useState('');

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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      
      // プレビュー表示
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);

      const fileSizeMB = selectedFile.size / 1024 / 1024;

      // 10MB以上のファイルのみ圧縮
      if (fileSizeMB > 10) {
        setCompressionStatus('画像を圧縮中...');
        
        try {
          const options = {
            maxSizeMB: 10,
            maxWidthOrHeight: 4096,
            useWebWorker: true,
            fileType: selectedFile.type,
          };
          
          const compressed = await imageCompression(selectedFile, options);
          setCompressedFile(compressed);
          
          const compressedSizeMB = (compressed.size / 1024 / 1024).toFixed(2);
          setCompressionStatus(`圧縮完了: ${fileSizeMB.toFixed(2)}MB → ${compressedSizeMB}MB`);
        } catch (error) {
          console.error('Compression error:', error);
          setCompressedFile(selectedFile);
          setCompressionStatus('圧縮をスキップしました');
        }
      } else {
        // 10MB以下はそのまま使用
        setCompressedFile(selectedFile);
        setCompressionStatus(`ファイルサイズ: ${fileSizeMB.toFixed(2)}MB（圧縮不要）`);
      }
    }
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleUpload = async (e: FormEvent) => {
    e.preventDefault();
    if (!compressedFile) return;

    setUploading(true);
    setUploadStatus('アップロード中...');

    try {
      // ファイル名にタイムスタンプを追加してユニークにする
      const timestamp = Date.now();
      const fileExtension = compressedFile.name.split('.').pop();
      const uniqueFileName = `${timestamp}-${Math.random().toString(36).substring(7)}.${fileExtension}`;
      
      // 1. クライアント側から直接Blobにアップロード
      const newBlob = await upload(uniqueFileName, compressedFile, {
        access: 'public',
        handleUploadUrl: '/api/upload',
        clientPayload: JSON.stringify({}),
        headers: {
          'Authorization': `Bearer ${password}`,
        },
      });

      // 2. メタデータを保存
      const metadataResponse = await fetch('/api/photos/save', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${password}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          blobUrl: newBlob.url,
          title,
          description,
          categories: selectedCategories.join(','),
        }),
      });

      if (metadataResponse.ok) {
        setUploadStatus('✓ アップロード成功！');
        // フォームをリセット
        setFile(null);
        setCompressedFile(null);
        setTitle('');
        setDescription('');
        setSelectedCategories(['nature']);
        setPreview(null);
        setCompressionStatus('');
        setTimeout(() => setUploadStatus(''), 3000);
      } else {
        const error = await metadataResponse.json();
        setUploadStatus(`エラー: ${error.error}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
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
              {compressionStatus && (
                <p className="text-xs text-gray-500 mt-1">{compressionStatus}</p>
              )}
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

            {/* カテゴリ（モダンなボタン形式） */}
            <div>
              <label className="block text-sm text-gray-600 mb-3">
                カテゴリ（複数選択可）
              </label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_CATEGORIES.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => toggleCategory(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      selectedCategories.includes(category)
                        ? 'bg-gray-800 text-white shadow-md transform scale-105'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* アップロードボタン */}
            <button
              type="submit"
              disabled={!compressedFile || uploading}
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
          <div className="mt-8 text-center space-y-2">
            <a
              href="/admin/manage"
              className="block text-gray-600 hover:text-gray-800 underline font-medium"
            >
              写真一覧・順序管理
            </a>
            <a
              href="/"
              className="block text-gray-600 hover:text-gray-800 underline"
            >
              ← トップページに戻る
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
