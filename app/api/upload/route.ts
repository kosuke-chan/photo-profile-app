import { NextRequest, NextResponse } from 'next/server';
import { put, list } from '@vercel/blob';

export const runtime = 'edge';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    // 認証チェック
    const authHeader = request.headers.get('authorization');
    const password = authHeader?.replace('Bearer ', '');
    
    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: '認証エラー' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const categories = formData.get('categories') as string;

    if (!file) {
      return NextResponse.json({ error: 'ファイルが必要です' }, { status: 400 });
    }

    // 画像をBlobにアップロード
    const blob = await put(file.name, file, {
      access: 'public',
    });

    // 既存の写真データを取得
    const { blobs } = await list({ prefix: 'photos.json' });
    let photos = [];
    
    if (blobs.length > 0) {
      const response = await fetch(blobs[0].url);
      photos = await response.json();
    }

    // 新しい写真を追加
    const newPhoto = {
      id: photos.length > 0 ? Math.max(...photos.map((p: any) => p.id)) + 1 : 1,
      src: blob.url,
      title: title || '',
      description: description || '',
      category: categories ? categories.split(',').map((c: string) => c.trim()) : ['nature'],
    };

    photos.push(newPhoto);

    // 更新された写真データをBlobに保存
    await put('photos.json', JSON.stringify(photos, null, 2), {
      access: 'public',
      contentType: 'application/json',
    });

    return NextResponse.json({ success: true, photo: newPhoto });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'アップロードに失敗しました' }, { status: 500 });
  }
}
