import { NextRequest, NextResponse } from 'next/server';
import { put, list, del } from '@vercel/blob';

// 写真の順序を更新
export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const password = authHeader?.replace('Bearer ', '');
    
    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: '認証エラー' }, { status: 401 });
    }

    const body = await request.json();
    const { photos } = body;

    if (!photos || !Array.isArray(photos)) {
      return NextResponse.json({ error: '写真データが必要です' }, { status: 400 });
    }

    // 更新された写真データをBlobに保存
    await put('photos.json', JSON.stringify(photos, null, 2), {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: false,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update photos error:', error);
    return NextResponse.json({ error: '更新に失敗しました' }, { status: 500 });
  }
}

// 写真を削除
export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const password = authHeader?.replace('Bearer ', '');
    
    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: '認証エラー' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const photoId = searchParams.get('id');
    const blobUrl = searchParams.get('url');

    if (!photoId) {
      return NextResponse.json({ error: '写真IDが必要です' }, { status: 400 });
    }

    // 既存の写真データを取得
    const { blobs } = await list({ prefix: 'photos.json' });
    let photos = [];
    
    if (blobs.length > 0) {
      const response = await fetch(blobs[0].url);
      photos = await response.json();
    }

    // 写真を削除
    photos = photos.filter((p: any) => p.id !== Number(photoId));

    // Blobから画像も削除（オプション）
    if (blobUrl) {
      try {
        await del(blobUrl);
      } catch (error) {
        console.error('Failed to delete blob:', error);
      }
    }

    // 更新された写真データを保存
    await put('photos.json', JSON.stringify(photos, null, 2), {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: false,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete photo error:', error);
    return NextResponse.json({ error: '削除に失敗しました' }, { status: 500 });
  }
}
