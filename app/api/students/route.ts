import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID!, serviceAccountAuth);
    await doc.loadInfo(); 

    const mainSheet = doc.sheetsByIndex[0];
    const rows = await mainSheet.getRows();
    
    // Map through the rows and pull out only the data we need for the UI
    const students = rows
      .filter(row => row.get('Student ID')) 
      .map(row => ({
        id: row.get('Student ID'),
        name: row.get('Student Name'),
        cycleProgress: `Class ${row.get('Classes in Current Cycle')} of 4`,
        status: row.get('System Action'),
        // ADD THIS NEW LINE:
        paymentStatus: row.get('Payment Status') || 'Pending',
      }));

    return NextResponse.json({ students });

  } catch (error) {
    console.error("Failed to fetch students:", error);
    return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 });
  }
}