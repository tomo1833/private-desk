export type Schedule = {
  id: number;
  title: string;
  start: string;
  end: string;
  memo: string | null;
  google_event_id: string | null;
  createdAt: string;
};
