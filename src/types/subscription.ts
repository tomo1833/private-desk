export interface Subscription {
  id: number;
  name: string;
  category: string; // "Subscription" | "One-time" | "Free"
  price: number;
  cycle: 'monthly' | 'yearly' | 'one_time' | 'free' | string;
  next_billing?: string | null;
  status: 'Active' | 'Canceling' | 'Canceled' | 'Trial' | string;
  url?: string | null;
  account_email?: string | null;
  license_key?: string | null;
  memo?: string | null;
  display_order?: number;
  created_at?: string;
  updated_at?: string;
}
