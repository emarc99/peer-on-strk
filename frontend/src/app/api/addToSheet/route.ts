import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { formatInTimeZone } from 'date-fns-tz';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userType, name, email, role } = body;

    // Format the current date and time in desired timezone as yyyy/MM/dd HH:mm:ss
    const createdAt = formatInTimeZone(
      new Date(),
      process.env.WAITLIST_TIMEZONE || 'UTC',
      'yyyy/MM/dd HH:mm:ss'
    );

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    const spreadsheetId = process.env.SPREADSHEET_ID;

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Sheet1!A:C',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[userType, name, email, role, createdAt]],
      },
    });

    return NextResponse.json({ message: 'Success', data: response.data }, { status: 200 });
  } catch (error) {
    console.error('Error adding data to Google Sheet:', error);
    return NextResponse.json({ message: 'Error adding data to Google Sheet' }, { status: 500 });
  }
}
