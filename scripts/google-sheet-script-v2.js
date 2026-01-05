// ============================================================================
// LIKHA FORMS - GOOGLE APPS SCRIPT (Merged Version)
// ============================================================================
// 1. Open your Google Sheet
// 2. Go to Extensions > Apps Script
// 3. Delete any code in the editor and paste this code
// 4. Save the project (File > Save)
// 5. Run the 'setup' function once to create sheets and headers
// 6. Deploy as Web App:
//    - Click 'Deploy' > 'New deployment'
//    - Select type: 'Web app'
//    - Execute as: 'Me'
//    - Who has access: 'Anyone'
//    - Click 'Deploy'
//    - Copy the Web App URL and replace the GOOGLE_SCRIPT_URL in App.tsx
// ============================================================================

const SHEET_NAME = 'Responses';
const DASHBOARD_SHEET_NAME = 'Dashboard';
const UPLOAD_FOLDER_NAME = 'Likha Form Uploads';

// ============================================================================
// MAIN FORM HANDLER
// ============================================================================
function doPost(e) {
    const lock = LockService.getScriptLock();
    lock.tryLock(10000);

    try {
        const doc = SpreadsheetApp.getActiveSpreadsheet();
        let sheet = doc.getSheetByName(SHEET_NAME);

        if (!sheet) {
            sheet = doc.insertSheet(SHEET_NAME);
            ensureHeaders(sheet);
        }

        const p = e.parameter;
        const folder = getOrCreateFolder(UPLOAD_FOLDER_NAME);

        // Handle File Uploads
        let logoUrl = '';
        if (p.logoFile && p.logoFile.startsWith('data:')) {
            logoUrl = saveFile(folder, p.logoFile, `logo_${sanitize(p.businessName)}_${Date.now()}`);
        } else if (p.logoChoice === 'text') {
            logoUrl = 'Requested Text Logo';
        } else if (p.logoChoice === 'none') {
            logoUrl = 'No Logo Needed';
        }

        let photosUrl = '';
        if (p.productPhotos && p.productPhotos.startsWith('data:')) {
            photosUrl = saveFile(folder, p.productPhotos, `photos_${sanitize(p.businessName)}_${Date.now()}`);
        } else if (p.photoChoice === 'temp') {
            photosUrl = 'Use Temporary Icons';
        }

        const nextRow = sheet.getLastRow() + 1;
        const newRow = [
            new Date(),                                              // Timestamp
            p.businessName || '',                                    // Business Name
            p.ownerName || '',                                       // Owner Name
            p.contactNumber || '',                                   // Contact Number
            p.email || '',                                           // Email
            p.facebookPage || '',                                    // Facebook Page
            p.plan === '999' ? 'Basic (999)' : 'Advance (2499)',    // Plan
            p.businessType || '',                                    // Business Type
            p.productsAndPrices || '',                               // Products & Prices
            logoUrl,                                                 // Logo Link
            photosUrl,                                               // Product Photos Link
            'New',                                                   // Status (default)
            '',                                                      // Assign To
            ''                                                       // Referred By
        ];

        sheet.getRange(nextRow, 1, 1, newRow.length).setValues([newRow]);

        return ContentService
            .createTextOutput(JSON.stringify({ 'result': 'success', 'row': nextRow }))
            .setMimeType(ContentService.MimeType.JSON);

    } catch (err) {
        return ContentService
            .createTextOutput(JSON.stringify({ 'result': 'error', 'error': err.toString() }))
            .setMimeType(ContentService.MimeType.JSON);
    } finally {
        lock.releaseLock();
    }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================
function saveFile(folder, base64Data, filename) {
    try {
        const split = base64Data.split(',');
        const type = split[0].split(';')[0].replace('data:', '');
        const data = Utilities.base64Decode(split[1]);
        const blob = Utilities.newBlob(data, type, filename);
        const file = folder.createFile(blob);
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        return file.getUrl();
    } catch (err) {
        return 'Error saving file: ' + err.toString();
    }
}

function getOrCreateFolder(folderName) {
    const folders = DriveApp.getFoldersByName(folderName);
    if (folders.hasNext()) {
        return folders.next();
    }
    return DriveApp.createFolder(folderName);
}

function sanitize(str) {
    return (str || '').replace(/[^a-zA-Z0-9]/g, '_');
}

// ============================================================================
// SETUP FUNCTION - Run this once!
// ============================================================================
function setup() {
    const doc = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = doc.getSheetByName(SHEET_NAME);

    if (!sheet) {
        sheet = doc.insertSheet(SHEET_NAME);
    }

    ensureHeaders(sheet);
    createDashboard(doc);
}

function ensureHeaders(sheet) {
    const headers = [
        'Timestamp',
        'Business Name',
        'Owner Name',
        'Contact Number',
        'Email',
        'Facebook Page',
        'Plan',
        'Business Type',
        'Products & Prices',
        'Logo Link',
        'Product Photos Link',
        'Status',
        'Assign To',
        'Referred By'
    ];

    if (sheet.getLastRow() === 0) {
        sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
        sheet.setFrozenRows(1);

        // ========== DATA VALIDATION ==========

        // Status column (column 12)
        const statusRange = sheet.getRange(2, 12, 500);
        const statusRule = SpreadsheetApp.newDataValidation()
            .requireValueInList(['New', 'In Progress', 'Completed', 'Lost/Rejected'])
            .setAllowInvalid(false)
            .build();
        statusRange.setDataValidation(statusRule);

        // Assign To column (column 13)
        const assigneeRange = sheet.getRange(2, 13, 500);
        const assigneeRule = SpreadsheetApp.newDataValidation()
            .requireValueInList(['Audreylyn', 'Samantha'])
            .setAllowInvalid(false)
            .build();
        assigneeRange.setDataValidation(assigneeRule);

        // Referred By column (column 14)
        const referredByRange = sheet.getRange(2, 14, 500);
        const referredByRule = SpreadsheetApp.newDataValidation()
            .requireValueInList(['Jester', 'Marc', 'Wayne'])
            .setAllowInvalid(false)
            .build();
        referredByRange.setDataValidation(referredByRule);

        // ========== CONDITIONAL FORMATTING FOR STATUS COLORS ==========
        const statusColorRange = sheet.getRange(2, 12, 500);

        // Clear existing conditional format rules for this range
        const existingRules = sheet.getConditionalFormatRules();

        // New - Green
        const ruleNew = SpreadsheetApp.newConditionalFormatRule()
            .whenTextEqualTo('New')
            .setBackground('#b7e1cd')  // Light green
            .setFontColor('#137333')   // Dark green
            .setRanges([statusColorRange])
            .build();

        // In Progress - Yellow
        const ruleInProgress = SpreadsheetApp.newConditionalFormatRule()
            .whenTextEqualTo('In Progress')
            .setBackground('#fce8b2')  // Light yellow
            .setFontColor('#b45309')   // Dark amber
            .setRanges([statusColorRange])
            .build();

        // Completed - Orange
        const ruleCompleted = SpreadsheetApp.newConditionalFormatRule()
            .whenTextEqualTo('Completed')
            .setBackground('#fdd09f')  // Light orange
            .setFontColor('#c65102')   // Dark orange
            .setRanges([statusColorRange])
            .build();

        // Lost/Rejected - Red
        const ruleLost = SpreadsheetApp.newConditionalFormatRule()
            .whenTextEqualTo('Lost/Rejected')
            .setBackground('#f4c7c3')  // Light red
            .setFontColor('#a50e0e')   // Dark red
            .setRanges([statusColorRange])
            .build();

        // Apply all rules
        sheet.setConditionalFormatRules([ruleNew, ruleInProgress, ruleCompleted, ruleLost]);
    }
}

// ============================================================================
// DASHBOARD WITH CHARTS
// ============================================================================
function createDashboard(doc) {
    let sheet = doc.getSheetByName(DASHBOARD_SHEET_NAME);
    if (sheet) {
        doc.deleteSheet(sheet);
    }
    sheet = doc.insertSheet(DASHBOARD_SHEET_NAME, 0);

    // --- Styling Constants ---
    const BG_COLOR = '#f8f9fa';
    const CARD_BG = '#ffffff';
    const TITLE_COLOR = '#202124';
    const SUBTITLE_COLOR = '#5f6368';

    sheet.setTabColor('#1a73e8');
    sheet.setHiddenGridlines(true);

    // --- Header ---
    const titleCell = sheet.getRange('B2');
    titleCell.setValue('Likha Forms Dashboard');
    titleCell.setFontSize(24).setFontWeight('bold').setFontColor(TITLE_COLOR).setFontFamily('Google Sans');

    const subtitleCell = sheet.getRange('B3');
    subtitleCell.setValue('Real-time overview of form submissions and status');
    subtitleCell.setFontSize(11).setFontColor(SUBTITLE_COLOR).setFontFamily('Roboto');

    // --- KPI Cards ---
    const kpis = [
        { title: 'Total Leads', formula: '=COUNTA(\'Responses\'!A2:A)', row: 5, col: 2, color: '#1a73e8' },
        { title: 'New', formula: '=COUNTIFS(\'Responses\'!A2:A,"<>",\'Responses\'!L2:L,"New")', row: 5, col: 5, color: '#188038' },
        { title: 'In Progress', formula: '=COUNTIFS(\'Responses\'!A2:A,"<>",\'Responses\'!L2:L,"In Progress")', row: 5, col: 8, color: '#f9ab00' },
        { title: 'Completed', formula: '=COUNTIFS(\'Responses\'!A2:A,"<>",\'Responses\'!L2:L,"Completed")', row: 5, col: 11, color: '#e37400' }
    ];

    kpis.forEach(kpi => {
        // Value Area (Top 3 rows)
        const valueRange = sheet.getRange(kpi.row, kpi.col, 3, 2);
        valueRange.merge()
            .setBackground(CARD_BG)
            .setBorder(true, true, true, true, null, null, '#dadce0', SpreadsheetApp.BorderStyle.SOLID);
        valueRange.setFormula(kpi.formula)
            .setFontSize(36)
            .setFontWeight('bold')
            .setFontColor(kpi.color)
            .setHorizontalAlignment('center')
            .setVerticalAlignment('middle')
            .setFontFamily('Google Sans');

        // Label row
        const labelRange = sheet.getRange(kpi.row + 3, kpi.col, 1, 2);
        labelRange.merge()
            .setValue(kpi.title)
            .setBackground(kpi.color)
            .setFontColor('#ffffff')
            .setFontSize(10)
            .setFontWeight('bold')
            .setHorizontalAlignment('center')
            .setFontFamily('Roboto');
    });

    // --- Data Tables for Charts (hidden columns) ---
    const dataStartCol = 27;

    // Status Distribution Table
    sheet.getRange(1, dataStartCol).setValue('Status');
    sheet.getRange(1, dataStartCol + 1).setValue('Count');
    sheet.getRange(2, dataStartCol).setValue('New');
    sheet.getRange(2, dataStartCol + 1).setFormula('=COUNTIFS(\'Responses\'!A:A,"<>",\'Responses\'!L:L,"New")');
    sheet.getRange(3, dataStartCol).setValue('In Progress');
    sheet.getRange(3, dataStartCol + 1).setFormula('=COUNTIFS(\'Responses\'!A:A,"<>",\'Responses\'!L:L,"In Progress")');
    sheet.getRange(4, dataStartCol).setValue('Completed');
    sheet.getRange(4, dataStartCol + 1).setFormula('=COUNTIFS(\'Responses\'!A:A,"<>",\'Responses\'!L:L,"Completed")');
    sheet.getRange(5, dataStartCol).setValue('Lost/Rejected');
    sheet.getRange(5, dataStartCol + 1).setFormula('=COUNTIFS(\'Responses\'!A:A,"<>",\'Responses\'!L:L,"Lost/Rejected")');

    // Assignee Workload Table
    const assigneeCol = dataStartCol + 3;
    sheet.getRange(1, assigneeCol).setValue('Assignee');
    sheet.getRange(1, assigneeCol + 1).setValue('Count');
    const assignees = ['Audreylyn', 'Samantha'];
    assignees.forEach((name, i) => {
        sheet.getRange(2 + i, assigneeCol).setValue(name);
        sheet.getRange(2 + i, assigneeCol + 1).setFormula('=COUNTIFS(\'Responses\'!A:A,"<>",\'Responses\'!M:M,"' + name + '")');
    });

    // Referred By Table
    const referredByCol = dataStartCol + 6;
    sheet.getRange(1, referredByCol).setValue('Referred By');
    sheet.getRange(1, referredByCol + 1).setValue('Count');
    const referrers = ['Jester', 'Marc', 'Wayne'];
    referrers.forEach((name, i) => {
        sheet.getRange(2 + i, referredByCol).setValue(name);
        sheet.getRange(2 + i, referredByCol + 1).setFormula('=COUNTIFS(\'Responses\'!A:A,"<>",\'Responses\'!N:N,"' + name + '")');
    });

    // Plan Breakdown Table
    const planCol = dataStartCol + 9;
    sheet.getRange(1, planCol).setValue('Plan');
    sheet.getRange(1, planCol + 1).setValue('Count');
    sheet.getRange(2, planCol).setValue('Basic (999)');
    sheet.getRange(2, planCol + 1).setFormula('=COUNTIF(\'Responses\'!G:G,"Basic (999)")');
    sheet.getRange(3, planCol).setValue('Advance (2499)');
    sheet.getRange(3, planCol + 1).setFormula('=COUNTIF(\'Responses\'!G:G,"Advance (2499)")');

    // --- Charts ---

    // Chart 1: Status (Pie)
    const statusChart = sheet.newChart()
        .asPieChart()
        .addRange(sheet.getRange(1, dataStartCol, 5, 2))
        .setPosition(10, 2, 0, 0)
        .setOption('title', 'Status Distribution')
        .setOption('pieHole', 0.4)
        .setOption('width', 400)
        .setOption('height', 300)
        .setOption('legend', { position: 'right' })
        .setOption('colors', ['#188038', '#f9ab00', '#e37400', '#d93025'])
        .build();
    sheet.insertChart(statusChart);

    // Chart 2: Assignee Workload (Column)
    const assigneeChart = sheet.newChart()
        .asColumnChart()
        .addRange(sheet.getRange(1, assigneeCol, 3, 2))
        .setPosition(10, 8, 0, 0)
        .setOption('title', 'Workload by Assignee')
        .setOption('width', 350)
        .setOption('height', 300)
        .setOption('legend', { position: 'none' })
        .setOption('colors', ['#1a73e8'])
        .build();
    sheet.insertChart(assigneeChart);

    // Chart 3: Referred By (Bar)
    const referredByChart = sheet.newChart()
        .asBarChart()
        .addRange(sheet.getRange(1, referredByCol, 4, 2))
        .setPosition(25, 2, 0, 0)
        .setOption('title', 'Leads by Referrer')
        .setOption('width', 400)
        .setOption('height', 250)
        .setOption('legend', { position: 'none' })
        .setOption('colors', ['#34a853'])
        .build();
    sheet.insertChart(referredByChart);

    // Chart 4: Plan Distribution (Pie)
    const planChart = sheet.newChart()
        .asPieChart()
        .addRange(sheet.getRange(1, planCol, 3, 2))
        .setPosition(25, 8, 0, 0)
        .setOption('title', 'Plan Distribution')
        .setOption('pieHole', 0.4)
        .setOption('width', 350)
        .setOption('height', 250)
        .setOption('legend', { position: 'right' })
        .setOption('colors', ['#fbbc04', '#4285f4'])
        .build();
    sheet.insertChart(planChart);

    // Hide data columns
    sheet.hideColumns(dataStartCol, 15);

    // Auto-resize visible columns
    sheet.autoResizeColumns(1, 15);
}
