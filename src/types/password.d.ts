export type Password = {
  id: number;
  site_name: string;
  site_url: string;
  login_id: string | null;
  password: string;
  email: string | null;
  memo: string | null;
  category: string | null;
  created_at: string; // SQLite の DATETIME は string で受け取られる
  updated_at: string;
};