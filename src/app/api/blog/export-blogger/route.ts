import { NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
import { runSelect } from '@/lib/db';

interface BlogRow {
  title: string;
  content_html: string;
  permalink: string;
}

export async function GET() {
  const rows = await runSelect<BlogRow>(
    "SELECT title, content_html, permalink FROM blog WHERE site = 'blogger' ORDER BY id"
  );
  const data = rows.map((row) => ({
    title: row.title,
    content: row.content_html.replace(/<[^>]+>/g, ''),
    permalink: row.permalink,
  }));
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Blogger');
  worksheet.columns = [
    { header: 'title', key: 'title' },
    { header: 'content', key: 'content' },
    { header: 'permalink', key: 'permalink' },
  ];
  worksheet.addRows(data);
  const buffer = await workbook.xlsx.writeBuffer();
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer as ArrayBuffer);
  return new NextResponse(bytes, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="blogger_list.xlsx"',
    },
  });
}
