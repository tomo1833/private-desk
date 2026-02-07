import { NextResponse } from 'next/server';
import { runGet, runExecute } from '@/lib/db';
import type { Expense } from '@/types/expense';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!id || isNaN(Number(id))) {
    return NextResponse.json({ error: 'Invalid expense ID.' }, { status: 400 });
  }
  try {
    const result = await runGet<Expense>('SELECT * FROM expenses WHERE id = ?', [Number(id)]);
    if (!result) {
      return NextResponse.json({ error: 'expense not found.' }, { status: 404 });
    }
    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch expense.' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await request.json();
    const { category, amount, shop, used_at, used_by, product_name, remark } = body;
    if (!category || !amount || !shop || !used_at) {
      return NextResponse.json({ error: 'required fields missing' }, { status: 400 });
    }
    await runExecute(
      'UPDATE expenses SET category = ?, amount = ?, shop = ?, used_at = ?, used_by = ?, product_name = ?, remark = ? WHERE id = ?',
      [category, Number(amount), shop, used_at, used_by ?? null, product_name ?? null, remark ?? null, Number(id)]
    );
    return NextResponse.json({ message: 'expense updated successfully.' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update expense.' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await runExecute('DELETE FROM expenses WHERE id = ?', [Number(id)]);
    return NextResponse.json({ message: 'expense deleted successfully.' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to delete expense.' }, { status: 500 });
  }
}
