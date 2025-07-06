import { NextResponse } from 'next/server';
import { runGet, runExecute } from '../../../../lib/db';
import type { Password } from '@/types/password';


// GET: 特定のパスワード情報を取得
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id || isNaN(Number(id))) {
    return NextResponse.json(
      { error: 'Invalid password_manager ID.' },
      { status: 400 }
    );
  }

  try {
    const result = runGet<Password>(
      'SELECT * FROM password_manager WHERE id = ?',
      [Number(id)]
    );

    if (!result) {
      return NextResponse.json(
        { error: 'password_manager entry not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching password_manager entry:', error);
    return NextResponse.json(
      { error: 'Failed to fetch password_manager entry.' },
      { status: 500 }
    );
  }
}

// PUT: 特定のパスワード情報を更新
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await request.json();
    const {
      category,
      siteName,
      siteUrl,
      loginId,
      pass,
      email,
      memo,
    } = body;

    if (!siteName || !siteUrl || !pass) {
      return NextResponse.json(
        { error: 'site_name, site_url, and password are required.' },
        { status: 400 }
      );
    }

    runExecute(
      'UPDATE password_manager SET category = ?, site_name = ?, site_url = ?, login_id = ?, password = ?, email = ?, memo = ? WHERE id = ?',
      [category, siteName, siteUrl, loginId, pass, email, memo, Number(id)]
    );
    return NextResponse.json({
      message: 'password_manager entry updated successfully.',
    });
  } catch (error) {
    console.error('Error updating password_manager entry:', error);
    return NextResponse.json(
      { error: 'Failed to update password_manager entry.' },
      { status: 500 }
    );
  }
}
