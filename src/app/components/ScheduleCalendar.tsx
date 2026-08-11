'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import { EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import { EventClickArg } from '@fullcalendar/core';
import { format } from 'date-fns';
import { copyToClipboard } from '@/lib/diaryExport';

interface FormState {
  title: string;
  start: string;
  end: string;
  memo: string;
  display_order: number;
}

const QUICK_TIMES = ['09:00', '12:00', '15:00', '18:00'];

const ScheduleCalendar = () => {
  const [events, setEvents] = useState<EventInput[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
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

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCopyTime = async (time: string) => {
    const success = await copyToClipboard(time);
    if (success) {
      showToast(`「${time}」をクリップボードにコピーしました`);
    }
  };

  const applyTimeToField = (field: 'start' | 'end', time: string) => {
    const currentVal = form[field];
    const datePart = currentVal ? currentVal.split('T')[0] : format(new Date(), 'yyyy-MM-dd');
    const newVal = `${datePart}T${time}`;

    setForm((prev) => {
      const updated = { ...prev, [field]: newVal };

      // 開始時刻を変更した際、終了時刻が未入力または開始時刻より前の場合、1時間後を自動セット
      if (field === 'start') {
        const [hours, minutes] = time.split(':').map(Number);
        const endHour = (hours + 1) % 24;
        const endHourStr = String(endHour).padStart(2, '0');
        const defaultEndVal = `${datePart}T${endHourStr}:${String(minutes).padStart(2, '0')}`;
        
        if (!prev.end || prev.end <= newVal) {
          updated.end = defaultEndVal;
        }
      }
      return updated;
    });
  };

  const handleDateClick = (arg: DateClickArg) => {
    const dateStr = format(arg.date, "yyyy-MM-dd'T'09:00");
    const endStr = format(arg.date, "yyyy-MM-dd'T'10:00");
    setForm({ title: '', start: dateStr, end: endStr, memo: '', display_order: 0 });
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
    <div className="w-full space-y-3">
      {/* トースト表示 */}
      {toastMessage && (
        <div className="p-3 text-xs bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 rounded-lg border border-emerald-200 dark:border-emerald-800 shadow transition-all">
          {toastMessage}
        </div>
      )}

      {/* よく使う時間クイックコピーバー */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-gray-50 dark:bg-gray-800/60 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1">
            <svg className="w-3.5 h-3.5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            よく使う時間をコピー:
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {QUICK_TIMES.map((time) => (
              <button
                key={time}
                type="button"
                onClick={() => handleCopyTime(time)}
                className="px-2.5 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-700 hover:bg-indigo-50 dark:hover:bg-gray-600 rounded border border-indigo-200 dark:border-indigo-800 shadow-sm transition-colors flex items-center gap-1"
                title={`「${time}」をクリップボードにコピー`}
              >
                <span>{time}</span>
                <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={handleSync}
          className="text-xs bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white px-2.5 py-1 rounded transition-colors"
        >
          同期
        </button>
      </div>

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

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg p-5 w-full max-w-md shadow-2xl border border-gray-200 dark:border-gray-700 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-2">
              {editId ? '予定編集' : '予定登録'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label htmlFor="schedule-title" className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">タイトル</label>
                <input
                  id="schedule-title"
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  className="w-full border border-gray-300 dark:border-gray-600 rounded px-2.5 py-1.5 text-sm dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="schedule-start" className="block text-xs font-semibold text-gray-700 dark:text-gray-300">開始日時</label>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-gray-400">クイック指定:</span>
                    {QUICK_TIMES.map((time) => (
                      <button
                        key={`start-${time}`}
                        type="button"
                        onClick={() => applyTimeToField('start', time)}
                        className="px-1.5 py-0.5 text-[11px] font-medium bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 rounded border border-indigo-200 dark:border-indigo-800"
                        title={`開始時刻を${time}に変更`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
                <input
                  id="schedule-start"
                  type="datetime-local"
                  value={form.start}
                  onChange={(e) => setForm({ ...form, start: e.target.value })}
                  required
                  className="w-full border border-gray-300 dark:border-gray-600 rounded px-2.5 py-1.5 text-sm dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="schedule-end" className="block text-xs font-semibold text-gray-700 dark:text-gray-300">終了日時</label>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-gray-400">クイック指定:</span>
                    {QUICK_TIMES.map((time) => (
                      <button
                        key={`end-${time}`}
                        type="button"
                        onClick={() => applyTimeToField('end', time)}
                        className="px-1.5 py-0.5 text-[11px] font-medium bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 rounded border border-indigo-200 dark:border-indigo-800"
                        title={`終了時刻を${time}に変更`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
                <input
                  id="schedule-end"
                  type="datetime-local"
                  value={form.end}
                  onChange={(e) => setForm({ ...form, end: e.target.value })}
                  required
                  className="w-full border border-gray-300 dark:border-gray-600 rounded px-2.5 py-1.5 text-sm dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">メモ</label>
                <textarea
                  value={form.memo}
                  onChange={(e) => setForm({ ...form, memo: e.target.value })}
                  rows={3}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded px-2.5 py-1.5 text-sm dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">表示順</label>
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={form.display_order}
                  onChange={(e) =>
                    setForm({ ...form, display_order: Number(e.target.value) })
                  }
                  className="w-full border border-gray-300 dark:border-gray-600 rounded px-2.5 py-1.5 text-sm dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                <button 
                  type="button" 
                  onClick={() => setIsOpen(false)} 
                  className="px-3.5 py-1.5 text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                >
                  キャンセル
                </button>
                {editId && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="px-3.5 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 rounded border border-red-200 dark:border-red-800 transition-colors"
                  >
                    削除
                  </button>
                )}
                <button 
                  type="submit" 
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded shadow transition-colors"
                >
                  {editId ? '更新' : '登録'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleCalendar;
