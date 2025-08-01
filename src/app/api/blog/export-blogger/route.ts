import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { runSelect } from '@/lib/db';

interface BlogRow {
  title: string;
  content_html: string;
  permalink: string;
}

export async function GET() {
  const rows = runSelect<BlogRow>(
    "SELECT title, content_html, permalink FROM blog WHERE site = 'blogger' ORDER BY id"
  );
  const data = rows.map((row) => ({
    title: row.title,
    content: row.content_html.replace(/<[^>]+>/g, ''),
    permalink: row.permalink,
  }));
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Blogger');
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
  const bytes = new Uint8Array(buffer);
  return new NextResponse(bytes, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="blogger_list.xlsx"',
    },
  });
}
