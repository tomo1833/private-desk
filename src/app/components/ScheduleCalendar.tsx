'use client';

import { useEffect, useState } from 'react';
import FullCalendar, { EventInput } from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import { format } from 'date-fns';

interface FormState {
  title: string;
  start: string;
  end: string;
  memo: string;
}

const ScheduleCalendar = () => {
  const [events, setEvents] = useState<EventInput[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<FormState>({
    title: '',
    start: '',
    end: '',
    memo: '',
  });

  const fetchEvents = async () => {
    const res = await fetch('/api/schedule');
    if (res.ok) {
      const data = await res.json();
      setEvents(data);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleDateClick = (arg: DateClickArg) => {
    const dateStr = format(arg.date, "yyyy-MM-dd'T'HH:mm");
    setForm({ title: '', start: dateStr, end: dateStr, memo: '' });
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/schedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setIsOpen(false);
    fetchEvents();
  };

return (
  <div className="w-full">
    <FullCalendar
      plugins={[dayGridPlugin, interactionPlugin]}
      initialView="dayGridMonth"
      events={events}
      dateClick={handleDateClick}
      height="auto"
    />
    {isOpen && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        onClick={() => setIsOpen(false)}
      >
        <div
          className="bg-white rounded p-4 w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-lg font-bold mb-4">予定登録</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm mb-1">タイトル</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                className="w-full border px-2 py-1"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">開始</label>
              <input
                type="datetime-local"
                value={form.start}
                onChange={(e) => setForm({ ...form, start: e.target.value })}
                required
                className="w-full border px-2 py-1"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">終了</label>
              <input
                type="datetime-local"
                value={form.end}
                onChange={(e) => setForm({ ...form, end: e.target.value })}
                required
                className="w-full border px-2 py-1"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">メモ</label>
              <textarea
                value={form.memo}
                onChange={(e) => setForm({ ...form, memo: e.target.value })}
                className="w-full border px-2 py-1"
              />
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2">キャンセル</button>
              <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">登録</button>
            </div>
          </form>
        </div>
      </div>
    )}
  </div>
);

};

export default ScheduleCalendar;
