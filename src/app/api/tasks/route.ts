import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { projectId, title, description, startDate, endDate, progress, parentId, displayOrder } = body;

    if (!projectId || !title) {
      return NextResponse.json({ error: 'プロジェクトIDとタイトルは必須です' }, { status: 400 });
    }

    const task = await prisma.task.create({
      data: {
        projectId: Number(projectId),
        title,
        description,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        progress: Number(progress || 0),
        parentId: parentId ? Number(parentId) : null,
        displayOrder: Number(displayOrder || 0),
      },
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'タスク作成失敗' }, { status: 500 });
  }
}
