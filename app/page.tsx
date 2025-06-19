'use client';

import { useState } from 'react';

export default function Home() {
  const [likes, setLikes] = useState(0);

  const handleLike = () => {
    setLikes(likes + 1);
  };

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>📷 takuyaのプロフィール</h1>
      <p>写真が好きなWebアプリ開発見習いです！</p>

      <h2>🖼️ ギャラリー</h2>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <img src="/sample1.jpg" width={200} height={150} alt="sample1" />
        <img src="/sample2.jpg" width={200} height={150} alt="sample2" />
      </div>

      <h2>💛 いいねボタン</h2>
      <button onClick={handleLike}>💛 {likes} いいね！</button>
    </main>
  );
}
