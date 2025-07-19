const db = require('../src/lib/db').default;

// Add product_name column to expenses table if it doesn't exist
try {
  db.exec(`ALTER TABLE expenses ADD COLUMN product_name TEXT;`);
  console.log('product_name列をexpensesテーブルに追加しました');
} catch (error: any) {
  if (error.message.includes('duplicate column name')) {
    console.log('product_name列は既に存在します');
  } else {
    console.error('エラー:', error.message);
    throw error;
  }
}