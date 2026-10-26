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
    <div className="w-full space-y-4">
      {/* トースト表示 */}
      {toastMessage && (
        <div className="p-3 text-xs bg-emerald-500/20 text-emerald-300 rounded-xl border border-emerald-500/30 shadow transition-all font-medium">
          ✨ {toastMessage}
        </div>
      )}

      {/* よく使う時間クイックコピーバー */}
      <div className="card-basic p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
            ⏰ よく使う時間をコピー:
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {QUICK_TIMES.map((time) => (
              <button
                key={time}
                type="button"
                onClick={() => handleCopyTime(time)}
                className="px-2.5 py-1 text-xs font-mono font-medium text-indigo-300 bg-slate-900/80 hover:bg-indigo-600 hover:text-white rounded-lg border border-indigo-500/30 shadow-sm transition-all flex items-center gap-1 cursor-pointer"
                title={`「${time}」をクリップボードにコピー`}
              >
                <span>{time}</span>
                <span className="text-[10px]">📋</span>
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={handleSync}
          className="btn btn-secondary text-xs px-3 py-1.5"
        >
          🔄 同期
        </button>
      </div>

      {/* フルカレンダー表示エリア */}
      <div className="card-basic p-4 calendar-scroll">
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

      {/* 予定登録・編集モーダル */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="card-form w-full max-w-md shadow-2xl border border-indigo-500/30 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-white border-b border-slate-700/80 pb-3 flex items-center gap-2">
              <span>📅</span> {editId ? '予定の編集' : '新規予定の登録'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="schedule-title" className="form-label text-xs">タイトル</label>
                <input
                  id="schedule-title"
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="予定のタイトル..."
                  required
                  className="form-input"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="schedule-start" className="form-label text-xs mb-0">開始日時</label>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-slate-400">ワンタップ指定:</span>
                    {QUICK_TIMES.map((time) => (
                      <button
                        key={`start-${time}`}
                        type="button"
                        onClick={() => applyTimeToField('start', time)}
                        className="px-1.5 py-0.5 text-[11px] font-mono text-indigo-300 bg-slate-900 hover:bg-indigo-600 hover:text-white rounded border border-indigo-500/30 transition-colors"
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
                  className="form-input font-mono"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="schedule-end" className="form-label text-xs mb-0">終了日時</label>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-slate-400">ワンタップ指定:</span>
                    {QUICK_TIMES.map((time) => (
                      <button
                        key={`end-${time}`}
                        type="button"
                        onClick={() => applyTimeToField('end', time)}
                        className="px-1.5 py-0.5 text-[11px] font-mono text-indigo-300 bg-slate-900 hover:bg-indigo-600 hover:text-white rounded border border-indigo-500/30 transition-colors"
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
                  className="form-input font-mono"
                />
              </div>

              <div>
                <label className="form-label">メモ</label>
                <textarea
                  value={form.memo}
                  onChange={(e) => setForm({ ...form, memo: e.target.value })}
                  placeholder="メモ・補足情報..."
                  rows={3}
                  className="form-textarea"
                />
              </div>

              <div>
                <label className="form-label">表示順</label>
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={form.display_order}
                  onChange={(e) =>
                    setForm({ ...form, display_order: Number(e.target.value) })
                  }
                  className="form-input font-mono"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-700/80">
                <button 
                  type="button" 
                  onClick={() => setIsOpen(false)} 
                  className="btn btn-secondary text-xs px-3.5 py-1.5"
                >
                  キャンセル
                </button>
                {editId && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="btn btn-danger text-xs px-3.5 py-1.5"
                  >
                    削除
                  </button>
                )}
                <button 
                  type="submit" 
                  className="btn btn-primary text-xs px-4 py-1.5"
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
