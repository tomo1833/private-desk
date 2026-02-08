'use client';

import ScheduleCalendar from '@/app/components/ScheduleCalendar';

const SchedulePage = () => {
  return (
    <div className="space-y-4 page-wrap">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">カレンダー</h1>
      </div>
      <div className="bg-white dark:bg-gray-800 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg p-2 sm:p-4">
        <ScheduleCalendar />
      </div>
    </div>
  );
};

export default SchedulePage;
