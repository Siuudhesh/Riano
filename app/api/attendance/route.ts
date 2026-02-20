import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    // 1. Grab the Student ID sent from your frontend app
    const { studentId } = await req.json();

    if (!studentId) {
      return NextResponse.json({ error: 'Student ID is required' }, { status: 400 });
    }

    // 2. Authenticate using the Service Account credentials
    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      // The replace() function is a crucial fix for how Next.js reads multi-line env variables
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    // 3. Connect to the Google Sheet
    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID!, serviceAccountAuth);
    await doc.loadInfo(); 

    // 4. Update the Main Tracker (Tab 1)
    const mainSheet = doc.sheetsByIndex[0];
    const rows = await mainSheet.getRows();
    
    // Find the specific student by their ID
    const studentRow = rows.find(row => row.get('Student ID') === studentId);

    if (!studentRow) {
      return NextResponse.json({ error: 'Student not found in database' }, { status: 404 });
    }

    // THE FIX: Cell-based updating so we don't overwrite formulas!
    const currentTotal = parseInt(studentRow.get('Total Classes Attended') || '0', 10);
    const newTotal = currentTotal + 1;
    
    // 1. Load ONLY the specific cells we want to change using the row number
    // Column E is 'Total Classes Attended', Column I is 'Payment Status'
    await mainSheet.loadCells(`E${studentRow.rowNumber}:I${studentRow.rowNumber}`);
    
    // 2. Update Column E (Total Classes)
    const totalCell = mainSheet.getCellByA1(`E${studentRow.rowNumber}`);
    totalCell.value = newTotal;

    // 3. Bonus Fix: If they just started a new cycle (Class 1, 5, 9, etc.), reset the Google Sheet to Pending!
    if (newTotal > 1 && (newTotal - 1) % 4 === 0) {
      const paymentCell = mainSheet.getCellByA1(`I${studentRow.rowNumber}`);
      paymentCell.value = 'Pending';
    }

    // 4. Save ONLY the targeted cells!
    await mainSheet.saveUpdatedCells();

    // 5. Update the Attendance Log (Tab 2) manually!
    const logSheet = doc.sheetsByIndex[1];
    const logRows = await logSheet.getRows();
    
    // Exact math: Number of filled logs + Header row + 1 for the new empty row
    const nextRowNumber = logRows.length + 2; 

    // THE ULTIMATE FIX: If the grid is too small, force the code to expand the sheet!
    if (nextRowNumber > logSheet.rowCount) {
      await logSheet.resize({ 
        rowCount: logSheet.rowCount + 50, 
        columnCount: logSheet.columnCount 
      });
    }

    // Now it is 100% safe to load the cells
    await logSheet.loadCells(`A${nextRowNumber}:C${nextRowNumber}`);
    
    const timestampCell = logSheet.getCellByA1(`A${nextRowNumber}`);
    timestampCell.value = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    const idCell = logSheet.getCellByA1(`B${nextRowNumber}`);
    idCell.value = studentId;

    const actionCell = logSheet.getCellByA1(`C${nextRowNumber}`);
    actionCell.value = 'Class Attended';

    // Save only those 3 cells!
    await logSheet.saveUpdatedCells();

    // 6. Tell the frontend it was a success!
    return NextResponse.json({ success: true, updatedTotal: newTotal });

  } catch (error) {
    console.error("Google Sheets API Error:", error);
    return NextResponse.json({ error: 'Failed to update attendance' }, { status: 500 });
  }
}