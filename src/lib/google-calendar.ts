import { google } from 'googleapis';

const calendar = google.calendar('v3');

function getAuth() {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n');
  if (!clientEmail || !privateKey) throw new Error('Google service account not configured');
  const auth = new google.auth.JWT(clientEmail, undefined, privateKey, ['https://www.googleapis.com/auth/calendar']);
  return auth;
}

export async function createEvent({ title, start, end, description }: { title: string; start: string; end: string; description?: string; }) {
  const auth = getAuth();
  const calendarId = process.env.GOOGLE_CALENDAR_ID as string;

  const startDate = new Date(start);
  const endDate = new Date(end);
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    throw new Error('Invalid start or end date');
  }

  const res = await calendar.events.insert({
    auth,
    calendarId,
    requestBody: {
      summary: title,
      description,
      start: { dateTime: startDate.toISOString() },
      end: { dateTime: endDate.toISOString() },
    },
  });
  return res.data.id;
}

export async function listEvents(timeMin: string, timeMax: string) {
  const auth = getAuth();
  const calendarId = process.env.GOOGLE_CALENDAR_ID as string;
  const res = await calendar.events.list({ auth, calendarId, timeMin, timeMax, singleEvents: true });
  return res.data.items ?? [];
}
