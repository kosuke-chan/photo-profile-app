'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Photo = {
  id: number;
  src: string;
  title: string;
  description: string;
  category: string[];
};

const photos: Photo[] = [
  {
    id: 1,
    src: '/DSC04115.jpg',
    title: '空と雲',
    description: '静かな午後、空の色が移ろう時間。',
    category: ['nature', 'monochrome'], 
  },
  {
    id: 2,
    src: '/DSC04116.jpg',
    title: '木と光',
    description: '木漏れ日に包まれた優しい森の道。',
    category: ['nature']
  },
  {
    id: 3,
    src: '/DSC06864-1-6.jpg',
    title: '街と夕日',
    description: '暮れゆく街並みに沈む太陽。',
    category: ['street']
  },
  {
    id: 4,
    src: '/DSC07101-Pano-1-3.jpg',
    title: '机と光',
    description: '自宅の窓辺に射す穏やかな朝日。',
    category: ['home']
  },
  {
    id: 5,
    src: '/DSC08226-1-2.jpg',
    title: '影と壁',
    description: 'モノクロの世界に差し込む光と陰。',
    category: ['nature']
  },
  {
    id: 6,
    src: '/DSC09252.jpg',
    title: '影と壁',
    description: 'モノクロの世界に差し込む光と陰。',
    category: ['nature']
  },
  {
    id: 7,
    src: '/DSC09274.jpg',
    title: '影と壁',
    description: 'モノクロの世界に差し込む光と陰。',
    category: ['nature']
  },
  {
    id: 8,
    src: '/DSC07434.jpg',
    title: '影と壁',
    description: 'モノクロの世界に差し込む光と陰。',
    category: ['home']
  },
];

const categories = ['all', 'nature', 'monochrome', 'street', 'home'];

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const filteredPhotos =
    selectedCategory === 'all'
      ? photos
      : photos.filter((p) => p.category.includes(selectedCategory));


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
            className={`px-4 py-1 rounded-full text-sm border transition ${
              selectedCategory === cat
                ? 'bg-gray-800 text-white'
                : 'border-gray-400 text-gray-600 hover:bg-gray-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 写真ギャラリー */}
      <section className="space-y-16">
        {filteredPhotos.map((photo, i) => (
          <div key={photo.id} className="flex flex-col items-center">
            <img
              src={photo.src}
              alt={photo.title}
              className="w-full max-w-md mx-auto rounded-lg shadow-md mb-4 cursor-pointer"
              onClick={() => {
                setIndex(i);
                setOpen(true);
              }}
            />
            <h2 className="text-xl font-serif text-gray-800 mb-1">{photo.title}</h2>
            <p className="text-sm text-gray-500">{photo.description}</p>
          </div>
        ))}
      </section>

      {/* モーダル */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="modal"
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            exit={{ opacity: 0, scaleX: 0 }}
            transition={{ duration: 0.8 }}
            className="fixed inset-0 z-50 flex items-center justify-center origin-left bg-white bg-opacity-95"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-center"
            >
              <img
                src={filteredPhotos[index].src}
                alt={filteredPhotos[index].title}
                className="max-w-3xl w-full mb-4 rounded shadow-lg"
              />
              <h2 className="text-xl font-serif text-gray-800">{filteredPhotos[index].title}</h2>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
