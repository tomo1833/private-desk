'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import { EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import { EventClickArg } from '@fullcalendar/core';
import { format } from 'date-fns';
interface FormState {
  title: string;
  start: string;
  end: string;
  memo: string;
  display_order: number;
}

const ScheduleCalendar = () => {
  const [events, setEvents] = useState<EventInput[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const calendarRef = useRef<FullCalendar | null>(null);
  const [form, setForm] = useState<FormState>({
    title: '',
    start: '',
    end: '',
    memo: '',
    display_order: 0,
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

  useEffect(() => {
    const updateViewport = () => {
      setIsMobile(window.matchMedia('(max-width: 640px)').matches);
    };

    updateViewport();
    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  const currentView = useMemo(
    () => (isMobile ? 'listWeek' : 'dayGridMonth'),
    [isMobile]
  );

  useEffect(() => {
    const api = calendarRef.current?.getApi();
    if (!api || api.view.type === currentView) return;
    api.changeView(currentView);
  }, [currentView]);

  const handleDateClick = (arg: DateClickArg) => {
    const dateStr = format(arg.date, "yyyy-MM-dd'T'HH:mm");
    setForm({ title: '', start: dateStr, end: dateStr, memo: '', display_order: 0 });
    setEditId(null);
    setIsOpen(true);
  };

  const handleEventClick = (arg: EventClickArg) => {
    const e = arg.event;
    const startDate = e.start instanceof Date && !isNaN(e.start.getTime()) ? e.start : undefined;
    const endDate = e.end instanceof Date && !isNaN(e.end.getTime()) ? e.end : undefined;
    setForm({
      title: e.title,
      start: startDate ? format(startDate, "yyyy-MM-dd'T'HH:mm") : '',
      end: endDate ? format(endDate, "yyyy-MM-dd'T'HH:mm") : '',
      memo: (e.extendedProps.memo as string) || '',
      display_order: Number(e.extendedProps.display_order ?? 0),
    });
    setEditId(Number(e.id));
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editId ? `/api/schedule/${editId}` : '/api/schedule';
    const method = editId ? 'PUT' : 'POST';
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setIsOpen(false);
    setEditId(null);
    fetchEvents();
  };

  const handleDelete = async () => {
    if (editId === null) return;
    if (!confirm('削除しますか？')) return;
    await fetch(`/api/schedule/${editId}`, { method: 'DELETE' });
    setIsOpen(false);
    setEditId(null);
    fetchEvents();
  };

  const handleSync = async () => {
    await fetch('/api/schedule/sync', { method: 'POST' });
    fetchEvents();
  };

  return (
    <div className="w-full">
      <div className="calendar-scroll">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, listPlugin, interactionPlugin]}
          initialView={currentView}
          events={events}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          height="auto"
          headerToolbar={
            isMobile
              ? { left: 'prev,next', center: 'title', right: '' }
              : { left: 'prev,next today', center: 'title', right: 'dayGridMonth,listWeek' }
          }
        />
      </div>
      <div className="flex justify-end py-2">
        <button
          onClick={handleSync}
          className="text-sm bg-gray-300 dark:bg-gray-600 dark:text-white px-2 py-1 rounded"
        >
          同期
        </button>
      </div>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded p-4 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold mb-4">{editId ? '予定編集' : '予定登録'}</h2>
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
              <div>
                <label className="block text-sm mb-1">表示順</label>
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={form.display_order}
                  onChange={(e) =>
                    setForm({ ...form, display_order: Number(e.target.value) })
                  }
                  className="w-full border px-2 py-1"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2">キャンセル</button>
                {editId && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="btn btn-danger"
                  >
                    削除
                  </button>
                )}
                <button type="submit" className="btn btn-primary">{editId ? '更新' : '登録'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

};

export default ScheduleCalendar;
