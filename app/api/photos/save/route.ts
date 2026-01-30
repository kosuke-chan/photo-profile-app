import { NextRequest, NextResponse } from 'next/server';
import { put, list } from '@vercel/blob';

export async function POST(request: NextRequest) {
  try {
    // 認証チェック
    const authHeader = request.headers.get('authorization');
    const password = authHeader?.replace('Bearer ', '');
    
    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: '認証エラー' }, { status: 401 });
    }

    const body = await request.json();
    const { blobUrl, title, description, categories } = body;

    if (!blobUrl) {
      return NextResponse.json({ error: 'Blob URLが必要です' }, { status: 400 });
    }

    // 既存の写真データを取得
    const { blobs } = await list({ prefix: 'photos.json' });
    let photos = [];
    
    if (blobs.length > 0) {
      const response = await fetch(blobs[0].url);
      photos = await response.json();
    }

    // 新しい写真を追加（orderは自動的に最後に）
    const maxOrder = photos.length > 0 ? Math.max(...photos.map((p: any) => p.order || 0)) : -1;
    const newPhoto = {
      id: photos.length > 0 ? Math.max(...photos.map((p: any) => p.id)) + 1 : 1,
      src: blobUrl,
      title: title || '',
      description: description || '',
      category: categories ? categories.split(',').map((c: string) => c.trim()) : ['nature'],
      order: maxOrder + 1,
    };

    photos.push(newPhoto);

    // 更新された写真データをBlobに保存
    await put('photos.json', JSON.stringify(photos, null, 2), {
      access: 'public',
      contentType: 'application/json',
    });

    return NextResponse.json({ success: true, photo: newPhoto });
  } catch (error) {
    console.error('Save metadata error:', error);
    return NextResponse.json({ error: 'メタデータの保存に失敗しました' }, { status: 500 });
  }
}
