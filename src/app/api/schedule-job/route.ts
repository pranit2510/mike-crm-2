import { NextResponse } from 'next/server';
import { google } from 'googleapis';

const GOOGLE_CALENDAR_ID = 'crm-369@atomic-nation-452421-c9.iam.gserviceaccount.com';

const serviceAccountKey = {
  type: "service_account",
  project_id: "atomic-nation-452421-c9",
  private_key_id: "b123456789abcdef",
  private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n') || '',
  client_email: "crm-369@atomic-nation-452421-c9.iam.gserviceaccount.com",
  client_id: "123456789012345678901",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/crm-369%40atomic-nation-452421-c9.iam.gserviceaccount.com"
};

export async function POST(request: Request) {
  try {
    const { title, description, start, end } = await request.json();

    if (!title || !start || !end) {
      return NextResponse.json(
        { error: 'Missing required fields: title, start, end' },
        { status: 400 }
      );
    }

    const auth = new google.auth.GoogleAuth({
      credentials: serviceAccountKey,
      scopes: ['https://www.googleapis.com/auth/calendar'],
    });

    const calendar = google.calendar({ version: 'v3', auth });

    const event = {
      summary: title,
      description: description || '',
      start: {
        dateTime: start,
        timeZone: 'America/New_York',
      },
      end: {
        dateTime: end,
        timeZone: 'America/New_York',
      },
    };

    const response = await calendar.events.insert({
      calendarId: GOOGLE_CALENDAR_ID,
      requestBody: event,
    });

    return NextResponse.json({
      success: true,
      eventId: response.data.id,
      eventLink: response.data.htmlLink,
    });
  } catch (error) {
    console.error('Error creating calendar event:', error);
    return NextResponse.json(
      { error: 'Failed to create calendar event' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: serviceAccountKey,
      scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
    });

    const calendar = google.calendar({ version: 'v3', auth });

    const now = new Date();
    const timeMin = now.toISOString();
    const timeMax = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const response = await calendar.events.list({
      calendarId: GOOGLE_CALENDAR_ID,
      timeMin,
      timeMax,
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = response.data.items?.map((event) => ({
      id: event.id || '',
      title: event.summary || '',
      start: event.start?.dateTime || '',
      end: event.end?.dateTime || '',
      description: event.description || '',
    })) || [];

    return NextResponse.json({ events });
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calendar events' },
      { status: 500 }
    );
  }
} 