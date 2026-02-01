import { NextRequest, NextResponse } from 'next/server';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // 事前に認証チェック
    const authHeader = request.headers.get('authorization');
    const password = authHeader?.replace('Bearer ', '');
    
    if (password !== process.env.ADMIN_PASSWORD) {
      console.error('Authentication failed in upload API');
      return NextResponse.json({ error: '認証エラー' }, { status: 401 });
    }

    const body = (await request.json()) as HandleUploadBody;

    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        // 認証は既に通過しているので、トークンを生成
        return {
          allowedContentTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg'],
          tokenPayload: JSON.stringify({}),
        };
      },
      onUploadCompleted: async () => {
        console.log('Upload completed:', pathname);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error('Upload token error:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}
