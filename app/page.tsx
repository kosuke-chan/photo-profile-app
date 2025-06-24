'use client';

import { useState } from 'react';

type Photo = {
  id: number;
  src: string;
  title: string;
  description: string;
  category: string;
};

const photos: Photo[] = [
  {
    id: 1,
    src: '/DSC04115.jpg',
    title: '空と雲',
    description: '静かな午後、空の色が移ろう時間。',
    category: 'nature',
  },
  {
    id: 2,
    src: '/DSC04116.jpg',
    title: '木と光',
    description: '木漏れ日に包まれた優しい森の道。',
    category: 'nature',
  },
  {
    id: 3,
    src: '/DSC04117.jpg',
    title: '街と夕日',
    description: '暮れゆく街並みに沈む太陽。',
    category: 'street',
  },
  {
    id: 4,
    src: '/DSC04118.jpg',
    title: '机と光',
    description: '自宅の窓辺に射す穏やかな朝日。',
    category: 'home',
  },
  {
    id: 5,
    src: '/DSC04119.jpg',
    title: '影と壁',
    description: 'モノクロの世界に差し込む光と陰。',
    category: 'monochrome',
  },
];

const categories = ['all', 'nature', 'monochrome', 'street', 'home'];

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredPhotos =
    selectedCategory === 'all'
      ? photos
      : photos.filter((p) => p.category === selectedCategory);

  return (
    <main className="min-h-screen py-12 px-6 max-w-3xl mx-auto">
      {/* プロフィール */}
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-serif text-gray-800 mb-2">Kosuke Kosukegawa</h1>
        <p className="text-md text-gray-500 mb-1">写真家 / 趣味フォトグラファー</p>
        <p className="text-gray-500 text-sm font-light">
          日々の中にある「光」と「静けさ」を、カメラで切り取っています。
        </p>
      </header>

      {/* カテゴリ選択 */}
      <div className="flex justify-center flex-wrap gap-3 mb-10">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-1 rounded-full text-sm border transition
              ${
                selectedCategory === cat
                  ? 'bg-gray-800 text-white'
                  : 'border-gray-400 text-gray-600 hover:bg-gray-100'
              }
            `}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 写真ギャラリー */}
      <section className="space-y-16">
        {filteredPhotos.map((photo) => (
          <div key={photo.id} className="flex flex-col items-center">
            <img
              src={photo.src}
              alt={photo.title}
              className="w-full max-w-md mx-auto rounded-lg shadow-md mb-4"
            />
            <h2 className="text-xl font-serif text-gray-800 mb-1">{photo.title}</h2>
            <p className="text-sm text-gray-500">{photo.description}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
