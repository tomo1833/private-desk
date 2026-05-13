import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const project = await prisma.project.findUnique({
      where: { id: Number(id) },
      include: {
        tasks: {
          orderBy: { displayOrder: 'asc' },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'プロジェクトが見つかりません' }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: '取得失敗' }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const { name, description, startDate, endDate, status, displayOrder } = body;

    const project = await prisma.project.update({
      where: { id: Number(id) },
      data: {
        name,
        description,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        status,
        displayOrder: displayOrder !== undefined ? Number(displayOrder) : undefined,
      },
    });

    return NextResponse.json(project);
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
    await prisma.project.delete({
      where: { id: Number(id) },
    });
    return NextResponse.json({ message: '削除成功' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: '削除失敗' }, { status: 500 });
  }
}
