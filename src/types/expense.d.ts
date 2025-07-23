export type Expense = {
  id: number;
  category: string;
  amount: number;
  shop: string;
  used_by?: string | null;
  product_name?: string | null;
  remark?: string | null;
  used_at: string;
  created_at: string;
};
