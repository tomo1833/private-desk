import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

// FullCalendar and plugins mock
jest.mock('@fullcalendar/react', () => {
  return function MockFullCalendar(props: any) {
    return (
      <div data-testid="fullcalendar-mock">
        <button
          onClick={() =>
            props.dateClick({
              date: new Date('2026-08-12T00:00:00Z'),
            })
          }
        >
          Simulate Date Click
        </button>
      </div>
    );
  };
});
jest.mock('@fullcalendar/daygrid', () => ({}));
jest.mock('@fullcalendar/list', () => ({}));
jest.mock('@fullcalendar/interaction', () => ({}));

import ScheduleCalendar from '@/app/components/ScheduleCalendar';

const mockCopyToClipboard = jest.fn().mockResolvedValue(true);

jest.mock('@/lib/diaryExport', () => ({
  ...jest.requireActual('@/lib/diaryExport'),
  copyToClipboard: (...args: any[]) => mockCopyToClipboard(...args),
}));

describe('ScheduleCalendar Quick Time Features', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => [],
    } as any);
  });

  it('renders quick time copy buttons and handles copy', async () => {
    render(<ScheduleCalendar />);

    const copyBtn = screen.getByTitle('「09:00」をクリップボードにコピー');
    expect(copyBtn).toBeInTheDocument();

    fireEvent.click(copyBtn);

    expect(mockCopyToClipboard).toHaveBeenCalledWith('09:00');
  });

  it('allows quick time selection when editing schedule start/end', async () => {
    render(<ScheduleCalendar />);

    // Open modal by clicking simulated date
    const dateClickBtn = screen.getByText('Simulate Date Click');
    fireEvent.click(dateClickBtn);

    expect(screen.getByText('予定登録')).toBeInTheDocument();

    // Click 15:00 for start time
    const start15Btn = screen.getByTitle('開始時刻を15:00に変更');
    fireEvent.click(start15Btn);

    const startInput = screen.getByLabelText('開始日時', { exact: false }) as HTMLInputElement;
    expect(startInput.value).toContain('15:00');
  });
});
