export type Stock = {
  id: number;
  code: string;
  name: string;
  market: string;
  shares: number;
  acquisition_price: number;
  current_price: number;
  dividend_per_share: number;
  memo?: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
};
