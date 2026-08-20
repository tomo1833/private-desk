export interface WishlistItem {
  id: number;
  title: string;
  category?: string | null;
  price?: number | null;
  priority: 'High' | 'Medium' | 'Low' | string;
  status: 'Wanted' | 'Considering' | 'Purchased' | 'Archived' | string;
  url?: string | null;
  image_url?: string | null;
  imageUrl?: string | null;
  memo?: string | null;
  display_order?: number;
  displayOrder?: number;
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
  updatedAt?: string;
}

export interface WishlistInput {
  title: string;
  category?: string;
  price?: number;
  priority?: string;
  status?: string;
  url?: string;
  image_url?: string;
  imageUrl?: string;
  memo?: string;
  display_order?: number;
  displayOrder?: number;
}
