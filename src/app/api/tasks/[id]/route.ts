import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const { title, description, startDate, endDate, progress, displayOrder, parentId } = body;

    const task = await prisma.task.update({
      where: { id: Number(id) },
      data: {
        title,
        description,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        progress: progress !== undefined ? Number(progress) : undefined,
        displayOrder: displayOrder !== undefined ? Number(displayOrder) : undefined,
        parentId: parentId !== undefined ? (parentId ? Number(parentId) : null) : undefined,
      },
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: '更新失敗' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await prisma.task.delete({
      where: { id: Number(id) },
    });
    return NextResponse.json({ message: '削除成功' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: '削除失敗' }, { status: 500 });
  }
}
