// ============================================
// BULK EMAIL PERSONALIZER - MAIN SCRIPT
// ============================================

// Global state management
const state = {
    currentStep: 0, // 0 = welcome screen, 1-5 = steps
    uploadedData: [],
    columns: [],
    fileName: '',
    emailSubject: '',
    emailBody: '',
    detectedVariables: [],
    variableMapping: {},
    personalizedEmails: [],
    sendingMode: 'individual',
    emailClient: 'gmail',
    currentPreviewIndex: 0,
    sendingStatus: {
        sent: 0,
        failed: 0,
        details: []
    },
    hasSeenWelcome: false,
    theme: 'dark' // 'dark' or 'light'
};

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
    // Load saved state from Chrome storage
    await loadState();
    
    // Initialize event listeners
    initializeEventListeners();
    
    // Restore UI state
    updateUI();
});

// ============================================
// STATE MANAGEMENT
// ============================================

async function saveState() {
    try {
        await chrome.storage.local.set({ emailPersonalizerState: state });
    } catch (error) {
        console.error('Error saving state:', error);
    }
}

async function loadState() {
    try {
        const result = await chrome.storage.local.get('emailPersonalizerState');
        if (result.emailPersonalizerState) {
            Object.assign(state, result.emailPersonalizerState);
        }
    } catch (error) {
        console.error('Error loading state:', error);
    }
}

function resetState() {
    state.currentStep = 0;
    state.uploadedData = [];
    state.columns = [];
    state.fileName = '';
    state.emailSubject = '';
    state.emailBody = '';
    state.detectedVariables = [];
    state.variableMapping = {};
    state.personalizedEmails = [];
    state.currentPreviewIndex = 0;
    state.sendingStatus = { sent: 0, failed: 0, details: [] };
    state.hasSeenWelcome = false;
    // Keep theme preference
    saveState();
}

// ============================================
// EVENT LISTENERS
// ============================================

function initializeEventListeners() {
    // Welcome screen
    const welcomeStartBtn = document.getElementById('welcomeStartBtn');
    if (welcomeStartBtn) {
        welcomeStartBtn.addEventListener('click', () => {
            state.hasSeenWelcome = true;
            document.getElementById('mainHeader').style.display = 'block';
            goToStep(1);
        });
    }
    
    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    // Step 1: File Upload
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const browseBtn = document.getElementById('browseBtn');
    const searchInput = document.getElementById('searchInput');
    
    uploadArea.addEventListener('click', () => fileInput.click());
    browseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        fileInput.click();
    });
    
    fileInput.addEventListener('change', handleFileSelect);
    
    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('drag-over');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('drag-over');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    });
    
    // Search functionality
    if (searchInput) {
        searchInput.addEventListener('input', filterRecipients);
    }
    
    // Step 2: Template
    const emailSubject = document.getElementById('emailSubject');
    const emailBody = document.getElementById('emailBody');
    
    emailSubject.addEventListener('input', () => {
        state.emailSubject = emailSubject.value;
        detectVariables();
        saveState();
    });
    
    emailBody.addEventListener('input', () => {
        state.emailBody = emailBody.value;
        detectVariables();
        saveState();
    });
    
    // Template presets
    document.getElementById('templateSales').addEventListener('click', () => loadTemplate('sales'));
    document.getElementById('templateFollow').addEventListener('click', () => loadTemplate('follow'));
    document.getElementById('templateNewsletter').addEventListener('click', () => loadTemplate('newsletter'));
    
    // Step 4: Preview navigation
    document.getElementById('prevEmail').addEventListener('click', () => navigatePreview(-1));
    document.getElementById('nextEmail').addEventListener('click', () => navigatePreview(1));
    
    // Step 5: Sending options
    document.querySelectorAll('input[name="sendMode"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            state.sendingMode = e.target.value;
            saveState();
        });
    });
    
    document.querySelectorAll('input[name="emailClient"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            state.emailClient = e.target.value;
            saveState();
        });
    });
    
    document.getElementById('startSending').addEventListener('click', startSending);
    document.getElementById('resetAll').addEventListener('click', resetAll);
    
    // Navigation buttons
    document.getElementById('step1Next').addEventListener('click', () => goToStep(2));
    document.getElementById('step2Back').addEventListener('click', () => goToStep(1));
    document.getElementById('step2Next').addEventListener('click', () => goToStep(3));
    document.getElementById('step3Back').addEventListener('click', () => goToStep(2));
    document.getElementById('step3Next').addEventListener('click', () => goToStep(4));
    document.getElementById('step4Back').addEventListener('click', () => goToStep(3));
    document.getElementById('step4Next').addEventListener('click', () => goToStep(5));
    document.getElementById('step5Back').addEventListener('click', () => goToStep(4));
}

// ============================================
// STEP NAVIGATION WITH SMOOTH ANIMATIONS
// ============================================

function goToStep(stepNumber) {
    const steps = document.querySelectorAll('.step');
    const currentActiveStep = document.querySelector('.step.active');
    
    // Determine animation direction
    const oldStep = state.currentStep;
    const isForward = stepNumber > oldStep;
    
    // Add slide-out animation to current step
    if (currentActiveStep && oldStep !== 0) {
        currentActiveStep.classList.add(isForward ? 'slide-out-left' : 'slide-out-right');
        currentActiveStep.classList.remove('active');
    }
    
    // After animation, show new step
    setTimeout(() => {
        // Remove all active and animation classes
        steps.forEach(step => {
            step.classList.remove('active', 'slide-out-left', 'slide-out-right');
        });
        
        // Show appropriate step (welcome or numbered step)
        if (stepNumber === 0) {
            document.getElementById('welcomeScreen').classList.add('active');
            document.getElementById('mainHeader').style.display = 'none';
        } else {
            document.getElementById(`step${stepNumber}`).classList.add('active');
            document.getElementById('mainHeader').style.display = 'block';
            
            // Update progress bar
            const progressFill = document.getElementById('progressFill');
            progressFill.style.width = `${(stepNumber / 5) * 100}%`;
            
            // Update step indicator
            document.getElementById('stepIndicator').textContent = `Step ${stepNumber} of 5`;
        }
        
        // Update state
        state.currentStep = stepNumber;
        
        // Execute step-specific actions
        switch(stepNumber) {
            case 3:
                buildMappingUI();
                break;
            case 4:
                generatePersonalizedEmails();
                displayEmailPreview();
                break;
            case 5:
                displayRecipientList();
                break;
        }
        
        saveState();
    }, oldStep === 0 ? 0 : 400); // No delay for welcome screen
}

function updateUI() {
    // Check if user has seen welcome screen
    if (state.hasSeenWelcome) {
        document.getElementById('mainHeader').style.display = 'block';
        goToStep(state.currentStep === 0 ? 1 : state.currentStep);
    } else {
        goToStep(0);
    }
    
    // Apply theme
    applyTheme();
    
    // Restore uploaded data
    if (state.uploadedData.length > 0) {
        displayDataPreview();
        document.getElementById('step1Next').disabled = false;
    }
    
    // Restore template
    if (state.emailSubject || state.emailBody) {
        document.getElementById('emailSubject').value = state.emailSubject;
        document.getElementById('emailBody').value = state.emailBody;
        detectVariables();
    }
}

// ============================================
// THEME MANAGEMENT
// ============================================

function applyTheme() {
    document.documentElement.setAttribute('data-theme', state.theme);
    updateThemeToggleIcon();
}

function toggleTheme() {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    applyTheme();
    saveState();
}

function updateThemeToggleIcon() {
    const themeIcon = document.querySelector('.theme-icon');
    if (themeIcon) {
        themeIcon.textContent = state.theme === 'dark' ? '🌙' : '☀️';
    }
}

// ============================================
// FILE UPLOAD & PARSING
// ============================================

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        handleFile(file);
    }
}

async function handleFile(file) {
    const fileExtension = file.name.split('.').pop().toLowerCase();
    
    if (!['csv', 'xlsx', 'xls'].includes(fileExtension)) {
        alert('Please upload a CSV or Excel file.');
        return;
    }
    
    state.fileName = file.name;
    
    try {
        const data = await readFile(file, fileExtension);
        state.uploadedData = data;
        state.columns = Object.keys(data[0] || {});
        
        displayDataPreview();
        document.getElementById('step1Next').disabled = false;
        saveState();
    } catch (error) {
        console.error('Error reading file:', error);
        alert('Error reading file. Please try again.');
    }
}

function readFile(file, fileExtension) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                if (fileExtension === 'csv') {
                    const data = parseCSV(e.target.result);
                    resolve(data);
                } else {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                    const jsonData = XLSX.utils.sheet_to_json(firstSheet);
                    resolve(jsonData);
                }
            } catch (error) {
                reject(error);
            }
        };
        
        reader.onerror = () => reject(reader.error);
        
        if (fileExtension === 'csv') {
            reader.readAsText(file);
        } else {
            reader.readAsArrayBuffer(file);
        }
    });
}

function parseCSV(text) {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length === 0) return [];
    
    // Detect delimiter (comma or tab)
    const firstLine = lines[0];
    const commaCount = (firstLine.match(/,/g) || []).length;
    const tabCount = (firstLine.match(/\t/g) || []).length;
    const delimiter = tabCount > commaCount ? '\t' : ',';
    
    // Parse headers
    const headers = parseCSVLine(lines[0], delimiter);
    
    const data = [];
    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const values = parseCSVLine(lines[i], delimiter);
        const row = {};
        headers.forEach((header, index) => {
            row[header] = values[index] || '';
        });
        data.push(row);
    }
    
    return data;
}

function parseCSVLine(line, delimiter) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
                // Escaped quote
                current += '"';
                i++; // Skip next quote
            } else {
                // Toggle quote state
                inQuotes = !inQuotes;
            }
        } else if (char === delimiter && !inQuotes) {
            // Field separator
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    
    // Add the last field
    result.push(current.trim());
    
    return result;
}

function displayDataPreview() {
    // Update file info
    document.getElementById('fileName').textContent = state.fileName;
    document.getElementById('rowCount').textContent = state.uploadedData.length;
    document.getElementById('columnCount').textContent = state.columns.length;
    document.getElementById('fileInfo').style.display = 'block';
    
    // Create preview table
    const previewTable = document.getElementById('previewTable');
    const previewData = state.uploadedData.slice(0, 10); // Show first 10 rows
    
    let html = '<thead><tr>';
    state.columns.forEach(col => {
        html += `<th>${col}</th>`;
    });
    html += '</tr></thead><tbody>';
    
    previewData.forEach(row => {
        html += '<tr>';
        state.columns.forEach(col => {
            html += `<td>${row[col] || ''}</td>`;
        });
        html += '</tr>';
    });
    html += '</tbody>';
    
    previewTable.innerHTML = html;
    document.getElementById('dataPreview').style.display = 'block';
}

function filterRecipients() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const rows = document.querySelectorAll('#previewTable tbody tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

// ============================================
// TEMPLATE MANAGEMENT
// ============================================

function detectVariables() {
    const subject = document.getElementById('emailSubject').value;
    const body = document.getElementById('emailBody').value;
    const combined = subject + ' ' + body;
    
    // Detect variables in format [VariableName]
    const regex = /\[([^\]]+)\]/g;
    const matches = combined.match(regex);
    
    if (matches && matches.length > 0) {
        state.detectedVariables = [...new Set(matches.map(m => m.slice(1, -1)))];
        
        // Display detected variables
        const chipsContainer = document.getElementById('variableChips');
        chipsContainer.innerHTML = state.detectedVariables
            .map(variable => `<span class="chip">[${variable}]</span>`)
            .join('');
        
        document.getElementById('detectedVariables').style.display = 'block';
        document.getElementById('step2Next').disabled = false;
    } else {
        document.getElementById('detectedVariables').style.display = 'none';
        document.getElementById('step2Next').disabled = true;
    }
    
    saveState();
}

function loadTemplate(type) {
    const templates = {
        sales: {
            subject: 'Quick question about [Company]',
            body: `Hi [Name],

I noticed that [Company] is in the [Industry] industry and thought you might be interested in how we've helped similar companies achieve [Result].

Would you be open to a quick 15-minute call this week?

Best regards,
[YourName]`
        },
        follow: {
            subject: 'Following up - [Topic]',
            body: `Hi [Name],

I wanted to follow up on my previous message about [Topic].

I understand you're busy, so I'll keep this brief. Would [Date] work for a quick chat?

Looking forward to hearing from you!

Best,
[YourName]`
        },
        newsletter: {
            subject: '[Month] Newsletter - [Topic]',
            body: `Hello [Name],

Welcome to our [Month] newsletter!

Here's what's new:
• [Update1]
• [Update2]
• [Update3]

Thank you for being a valued member of our community at [Company].

Best regards,
The [Company] Team`
        }
    };
    
    const template = templates[type];
    document.getElementById('emailSubject').value = template.subject;
    document.getElementById('emailBody').value = template.body;
    state.emailSubject = template.subject;
    state.emailBody = template.body;
    
    detectVariables();
    saveState();
}

// ============================================
// VARIABLE MAPPING
// ============================================

function buildMappingUI() {
    const container = document.getElementById('mappingContainer');
    container.innerHTML = '';
    
    state.detectedVariables.forEach(variable => {
        const row = document.createElement('div');
        row.className = 'mapping-row';
        
        const variableSpan = document.createElement('span');
        variableSpan.className = 'mapping-variable';
        variableSpan.textContent = `[${variable}]`;
        
        const arrow = document.createElement('span');
        arrow.className = 'mapping-arrow';
        arrow.textContent = '→';
        
        const select = document.createElement('select');
        select.id = `mapping-${variable}`;
        
        // Add default option
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Select column...';
        select.appendChild(defaultOption);
        
        // Add column options
        state.columns.forEach(col => {
            const option = document.createElement('option');
            option.value = col;
            option.textContent = col;
            
            // Auto-select if variable name matches column name (case-insensitive)
            if (variable.toLowerCase() === col.toLowerCase()) {
                option.selected = true;
                state.variableMapping[variable] = col;
            }
            
            select.appendChild(option);
        });
        
        // Restore saved mapping
        if (state.variableMapping[variable]) {
            select.value = state.variableMapping[variable];
        }
        
        select.addEventListener('change', () => {
            state.variableMapping[variable] = select.value;
            validateMapping();
            saveState();
        });
        
        row.appendChild(variableSpan);
        row.appendChild(arrow);
        row.appendChild(select);
        container.appendChild(row);
    });
    
    validateMapping();
}

function validateMapping() {
    const warnings = [];
    const warningsList = document.getElementById('warningsList');
    const warningsContainer = document.getElementById('validationWarnings');
    
    // Check if all variables are mapped
    state.detectedVariables.forEach(variable => {
        if (!state.variableMapping[variable]) {
            warnings.push(`Variable [${variable}] is not mapped to any column`);
        }
    });
    
    // Check for missing data in mapped columns
    const mappedColumns = Object.values(state.variableMapping);
    mappedColumns.forEach(column => {
        const emptyCount = state.uploadedData.filter(row => !row[column]).length;
        if (emptyCount > 0) {
            warnings.push(`${emptyCount} row(s) have missing data in column "${column}"`);
        }
    });
    
    if (warnings.length > 0) {
        warningsList.innerHTML = warnings.map(w => `<li>${w}</li>`).join('');
        warningsContainer.style.display = 'block';
    } else {
        warningsContainer.style.display = 'none';
    }
    
    // Enable next button if all variables are mapped
    const allMapped = state.detectedVariables.every(v => state.variableMapping[v]);
    document.getElementById('step3Next').disabled = !allMapped;
}

// ============================================
// EMAIL PREVIEW
// ============================================

function generatePersonalizedEmails() {
    state.personalizedEmails = state.uploadedData.map(row => {
        let subject = state.emailSubject;
        let body = state.emailBody;
        
        // Replace all variables with actual data
        state.detectedVariables.forEach(variable => {
            const column = state.variableMapping[variable];
            const value = row[column] || `[${variable}]`;
            const regex = new RegExp(`\\[${variable}\\]`, 'g');
            subject = subject.replace(regex, value);
            body = body.replace(regex, value);
        });
        
        return {
            recipient: row[state.variableMapping['Email']] || row['Email'] || row['email'] || 'N/A',
            subject: subject,
            body: body,
            originalRow: row
        };
    });
    
    state.currentPreviewIndex = 0;
}

function displayEmailPreview() {
    if (state.personalizedEmails.length === 0) return;
    
    const email = state.personalizedEmails[state.currentPreviewIndex];
    
    document.getElementById('previewRecipient').textContent = email.recipient;
    document.getElementById('previewSubject').textContent = email.subject;
    document.getElementById('previewBody').textContent = email.body;
    
    document.getElementById('emailCounter').textContent = 
        `Email ${state.currentPreviewIndex + 1} of ${state.personalizedEmails.length}`;
    
    // Enable/disable navigation buttons
    document.getElementById('prevEmail').disabled = state.currentPreviewIndex === 0;
    document.getElementById('nextEmail').disabled = 
        state.currentPreviewIndex === state.personalizedEmails.length - 1;
}

function navigatePreview(direction) {
    state.currentPreviewIndex += direction;
    state.currentPreviewIndex = Math.max(0, Math.min(
        state.currentPreviewIndex,
        state.personalizedEmails.length - 1
    ));
    displayEmailPreview();
}

// ============================================
// RECIPIENT LIST & SENDING
// ============================================

function displayRecipientList() {
    const container = document.getElementById('recipientItems');
    const count = document.getElementById('recipientCount');
    
    count.textContent = state.personalizedEmails.length;
    
    container.innerHTML = state.personalizedEmails.map((email, index) => {
        const status = state.sendingStatus.details[index] || { status: 'pending' };
        return `
            <div class="recipient-item">
                <div class="recipient-info">
                    <div class="recipient-email">${email.recipient}</div>
                    <div class="recipient-details">${email.subject}</div>
                </div>
                <span class="recipient-status status-${status.status}">${status.status}</span>
            </div>
        `;
    }).join('');
}

async function startSending() {
    const startBtn = document.getElementById('startSending');
    const progressContainer = document.getElementById('sendingProgress');
    const reportContainer = document.getElementById('sendingReport');
    
    startBtn.disabled = true;
    progressContainer.style.display = 'block';
    reportContainer.style.display = 'none';
    
    state.sendingStatus = { sent: 0, failed: 0, details: [] };
    
    if (state.sendingMode === 'individual') {
        await sendIndividual();
    } else {
        await sendBulk();
    }
    
    // Show report
    progressContainer.style.display = 'none';
    reportContainer.style.display = 'block';
    document.getElementById('sentCount').textContent = state.sendingStatus.sent;
    document.getElementById('failedCount').textContent = state.sendingStatus.failed;
    
    // Show reset button
    document.getElementById('resetAll').style.display = 'inline-flex';
    startBtn.style.display = 'none';
    
    displayRecipientList();
    saveState();
}

async function sendIndividual() {
    const progressFill = document.getElementById('progressFillSend');
    const status = document.getElementById('sendingStatus');
    
    for (let i = 0; i < state.personalizedEmails.length; i++) {
        const email = state.personalizedEmails[i];
        
        status.textContent = `Opening email ${i + 1} of ${state.personalizedEmails.length}...`;
        progressFill.style.width = `${((i + 1) / state.personalizedEmails.length) * 100}%`;
        
        try {
            await openEmailClient(email);
            state.sendingStatus.sent++;
            state.sendingStatus.details[i] = { status: 'sent' };
            
            // Wait 2 seconds between emails
            await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (error) {
            state.sendingStatus.failed++;
            state.sendingStatus.details[i] = { status: 'failed', error: error.message };
        }
        
        displayRecipientList();
    }
}

async function sendBulk() {
    const progressFill = document.getElementById('progressFillSend');
    const status = document.getElementById('sendingStatus');
    
    status.textContent = `Preparing ${state.personalizedEmails.length} emails...`;
    
    // Open all emails with slight delay
    for (let i = 0; i < state.personalizedEmails.length; i++) {
        const email = state.personalizedEmails[i];
        
        status.textContent = `Opening email ${i + 1} of ${state.personalizedEmails.length}...`;
        progressFill.style.width = `${((i + 1) / state.personalizedEmails.length) * 100}%`;
        
        try {
            await openEmailClient(email);
            state.sendingStatus.sent++;
            state.sendingStatus.details[i] = { status: 'sent' };
        } catch (error) {
            state.sendingStatus.failed++;
            state.sendingStatus.details[i] = { status: 'failed', error: error.message };
        }
        
        // Small delay between bulk sends
        await new Promise(resolve => setTimeout(resolve, 500));
        displayRecipientList();
    }
}

async function openEmailClient(email) {
    const encodedSubject = encodeURIComponent(email.subject);
    const encodedBody = encodeURIComponent(email.body);
    const encodedRecipient = encodeURIComponent(email.recipient);
    
    let url;
    
    if (state.emailClient === 'gmail') {
        url = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodedRecipient}&su=${encodedSubject}&body=${encodedBody}`;
    } else {
        url = `mailto:${encodedRecipient}?subject=${encodedSubject}&body=${encodedBody}`;
    }
    
    return new Promise((resolve) => {
        chrome.tabs.create({ url: url }, () => {
            resolve();
        });
    });
}

function resetAll() {
    if (confirm('Are you sure you want to start a new campaign? All current data will be cleared.')) {
        resetState();
        location.reload();
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Auto-save state periodically
setInterval(saveState, 30000); // Save every 30 seconds
