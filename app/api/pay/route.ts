import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { studentId } = await req.json();

    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID!, serviceAccountAuth);
    await doc.loadInfo(); 

    const mainSheet = doc.sheetsByIndex[0];
    const rows = await mainSheet.getRows();
    // Find the student
    const studentRow = rows.find(row => row.get('Student ID') === studentId);

    if (!studentRow) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // THE FIX: Load and update ONLY Column I (Payment Status)
    await mainSheet.loadCells(`I${studentRow.rowNumber}`);
    const paymentCell = mainSheet.getCellByA1(`I${studentRow.rowNumber}`);
    paymentCell.value = 'Paid';
    await mainSheet.saveUpdatedCells();

    // Log the payment in the Attendance Log tab manually!
    const logSheet = doc.sheetsByIndex[1];
    const logRows = await logSheet.getRows();
    
    const nextRowNumber = logRows.length + 2; 

    // THE ULTIMATE FIX: Expand the sheet if we run out of room
    if (nextRowNumber > logSheet.rowCount) {
      await logSheet.resize({ 
        rowCount: logSheet.rowCount + 50, 
        columnCount: logSheet.columnCount 
      });
    }

    await logSheet.loadCells(`A${nextRowNumber}:C${nextRowNumber}`);
    
    const timestampCell = logSheet.getCellByA1(`A${nextRowNumber}`);
    timestampCell.value = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    const idCell = logSheet.getCellByA1(`B${nextRowNumber}`);
    idCell.value = studentId;

    const actionCell = logSheet.getCellByA1(`C${nextRowNumber}`);
    actionCell.value = 'Payment Received';

    await logSheet.saveUpdatedCells();

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Payment API Error:", error);
    return NextResponse.json({ error: 'Failed to update payment' }, { status: 500 });
  }
}