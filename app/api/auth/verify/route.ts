import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    if (password === process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, error: 'パスワードが正しくありません' }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: '認証エラー' }, { status: 500 });
  }
}
