import { runSelect } from '../src/lib/db';
import ExcelJS from 'exceljs';

interface BlogRow {
  title: string;
  content_html: string;
  permalink: string;
}

async function main() {
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
  await workbook.xlsx.writeFile('blogger_list.xlsx');
  console.log(`Exported ${data.length} posts to blogger_list.xlsx`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
