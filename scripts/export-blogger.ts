import { runSelect } from '../src/lib/db';
import * as XLSX from 'xlsx';

interface BlogRow {
  title: string;
  content_html: string;
  permalink: string;
}

function main() {
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
  XLSX.writeFile(workbook, 'blogger_list.xlsx');
  console.log(`Exported ${data.length} posts to blogger_list.xlsx`);
}

main();
