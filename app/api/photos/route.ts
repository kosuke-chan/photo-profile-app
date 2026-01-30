import { NextResponse } from 'next/server';
import { list, head } from '@vercel/blob';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Blobから photos.json を取得
    const { blobs } = await list({ prefix: 'photos.json' });
    
    if (blobs.length === 0) {
      // 初期データを返す
      return NextResponse.json([]);
    }

    const photoDataBlob = blobs[0];
    const response = await fetch(photoDataBlob.url);
    const photos = await response.json();
    
    return NextResponse.json(photos);
  } catch (error) {
    console.error('Error fetching photos:', error);
    return NextResponse.json([]);
  }
}
