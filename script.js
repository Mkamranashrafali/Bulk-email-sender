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
    theme: 'dark', // 'dark' or 'light'
    // Licensing system
    isPro: false,
    licenseKey: '',
    trialStartDate: null,
    emailsSent: 0,
    freeEmailLimit: 20
};

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
    // Load saved state from Chrome storage
    await loadState();
    
    // Initialize trial if first time
    initializeTrial();
    
    // Initialize event listeners
    initializeEventListeners();
    
    // Restore UI state
    updateUI();
    
    // Update plan status
    updatePlanStatus();
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
    // Keep theme, license, and trial data
    saveState();
}

// ============================================
// LICENSING SYSTEM
// ============================================

function initializeTrial() {
    if (!state.trialStartDate) {
        state.trialStartDate = Date.now();
        state.emailsSent = 0;
        saveState();
    }
}

function isTrialActive() {
    if (state.isPro) return true;
    
    const trialDuration = 3 * 24 * 60 * 60 * 1000; // 3 days in milliseconds
    const elapsed = Date.now() - state.trialStartDate;
    return elapsed < trialDuration;
}

function canSendEmails() {
    if (state.isPro) return true;
    return isTrialActive() && state.emailsSent < state.freeEmailLimit;
}

function getRemainingEmails() {
    if (state.isPro) return 'Unlimited';
    return Math.max(0, state.freeEmailLimit - state.emailsSent);
}

function activateLicense(key) {
    const validLicenseKey = 'activate@';
    
    if (key === validLicenseKey) {
        state.isPro = true;
        state.licenseKey = key;
        saveState();
        return true;
    }
    return false;
}

function updatePlanStatus() {
    const planLabel = document.getElementById('planLabel');
    const emailLimit = document.getElementById('emailLimit');
    const upgradeBtn = document.getElementById('upgradeBtn');
    
    if (planLabel && emailLimit) {
        if (state.isPro) {
            planLabel.textContent = 'Pro Plan';
            planLabel.classList.add('pro');
            emailLimit.textContent = '∞ Unlimited';
            emailLimit.classList.remove('warning', 'error');
        } else {
            planLabel.textContent = 'Free Plan';
            planLabel.classList.remove('pro');
            const remaining = getRemainingEmails();
            emailLimit.textContent = `${state.emailsSent}/${state.freeEmailLimit} emails`;
            
            if (remaining <= 5) {
                emailLimit.classList.add('error');
            } else if (remaining <= 10) {
                emailLimit.classList.add('warning');
            }
        }
    }
    
    if (upgradeBtn) {
        if (state.isPro) {
            upgradeBtn.classList.add('pro-active');
            upgradeBtn.querySelector('.upgrade-text').textContent = 'Pro Active';
            upgradeBtn.querySelector('.upgrade-icon').textContent = '✓';
        } else {
            upgradeBtn.classList.remove('pro-active');
            upgradeBtn.querySelector('.upgrade-text').textContent = 'Go Pro';
            upgradeBtn.querySelector('.upgrade-icon').textContent = '✨';
        }
    }
}

function showUpgradePrompt(message) {
    const warningDiv = document.createElement('div');
    warningDiv.className = 'limit-warning';
    warningDiv.innerHTML = `
        <span class="warning-icon">⚠️</span>
        <span class="warning-text">${message}</span>
        <span class="upgrade-link" onclick="goToLicenseScreen()">Upgrade Now</span>
    `;
    
    // Insert at the beginning of the current step
    const currentStep = document.querySelector('.step.active');
    if (currentStep) {
        currentStep.insertBefore(warningDiv, currentStep.firstChild);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            warningDiv.style.animation = 'fadeOut 0.5s ease';
            setTimeout(() => warningDiv.remove(), 500);
        }, 5000);
    }
}

function checkFeatureAccess(feature) {
    if (state.isPro) return true;
    
    switch (feature) {
        case 'variableMapping':
            showUpgradePrompt('Variable mapping is a Pro feature. Upgrade to unlock!');
            return false;
        case 'statusTracking':
            showUpgradePrompt('Status tracking is a Pro feature. Upgrade to unlock!');
            return false;
        case 'unlimitedSending':
            if (!canSendEmails()) {
                showUpgradePrompt(`You've reached the ${state.freeEmailLimit} email limit. Upgrade for unlimited sending!`);
                return false;
            }
            return true;
        default:
            return true;
    }
}

function goToLicenseScreen() {
    const steps = document.querySelectorAll('.step');
    steps.forEach(step => step.classList.remove('active'));
    document.getElementById('licenseScreen').classList.add('active');
    document.getElementById('mainHeader').style.display = 'none';
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
    
    // Welcome screen upgrade button
    const welcomeUpgradeBtn = document.getElementById('welcomeUpgradeBtn');
    if (welcomeUpgradeBtn) {
        welcomeUpgradeBtn.addEventListener('click', () => {
            goToLicenseScreen();
        });
    }
    
    // License activation
    const activateBtn = document.getElementById('activateBtn');
    const licenseKeyInput = document.getElementById('licenseKey');
    const backToWelcomeBtn = document.getElementById('backToWelcomeBtn');
    
    if (activateBtn) {
        activateBtn.addEventListener('click', () => {
            const key = licenseKeyInput.value.trim();
            const errorDiv = document.getElementById('licenseError');
            const successDiv = document.getElementById('licenseSuccess');
            
            if (activateLicense(key)) {
                errorDiv.style.display = 'none';
                successDiv.style.display = 'block';
                updatePlanStatus();
                
                // Redirect to main app after 2 seconds
                setTimeout(() => {
                    goToStep(state.currentStep || 1);
                    document.getElementById('mainHeader').style.display = 'block';
                }, 2000);
            } else {
                successDiv.style.display = 'none';
                errorDiv.style.display = 'block';
            }
        });
    }
    
    if (backToWelcomeBtn) {
        backToWelcomeBtn.addEventListener('click', () => {
            goToStep(0);
        });
    }
    
    // Upgrade button
    const upgradeBtn = document.getElementById('upgradeBtn');
    if (upgradeBtn) {
        upgradeBtn.addEventListener('click', () => {
            goToLicenseScreen();
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
    // Step 2 Next - skip Step 3 for free users
    document.getElementById('step2Next').addEventListener('click', () => {
        if (state.isPro && state.detectedVariables.length > 0) {
            goToStep(3); // Pro users with variables go to mapping
        } else {
            goToStep(4); // Free users or no variables skip to preview
        }
    });
    document.getElementById('step3Back').addEventListener('click', () => goToStep(2));
    document.getElementById('step3Next').addEventListener('click', () => goToStep(4));
    document.getElementById('step4Back').addEventListener('click', () => {
        if (state.isPro && state.detectedVariables.length > 0) {
            goToStep(3); // Go back to mapping if it was shown
        } else {
            goToStep(2); // Otherwise go back to template
        }
    });
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
            
            // Update progress bar - adjust for free users skipping step 3
            let totalSteps = 5;
            let currentStepDisplay = stepNumber;
            
            // If free user and on step 4 or 5, adjust display
            if (!state.isPro) {
                if (stepNumber === 4) {
                    currentStepDisplay = 3; // Show as step 3
                    totalSteps = 4;
                } else if (stepNumber === 5) {
                    currentStepDisplay = 4; // Show as step 4
                    totalSteps = 4;
                }
            }
            
            const progressFill = document.getElementById('progressFill');
            progressFill.style.width = `${(currentStepDisplay / totalSteps) * 100}%`;
            
            // Update step indicator
            document.getElementById('stepIndicator').textContent = `Step ${currentStepDisplay} of ${totalSteps}`;
            
            // Update plan status
            updatePlanStatus();
        }
        
        // Update state
        state.currentStep = stepNumber;
        
        // Execute step-specific actions
        switch(stepNumber) {
            case 1:
                // Check email limit for free users
                if (!state.isPro && state.emailsSent >= state.freeEmailLimit) {
                    showUpgradePrompt(`You've used all ${state.freeEmailLimit} free emails. Upgrade to Pro for unlimited sending!`);
                }
                break;
            case 3:
                // Only show Step 3 for Pro users with variables
                if (!state.isPro) {
                    // Free users should not access this step
                    console.log('Free users skip variable mapping');
                } else {
                    const mappingContainer = document.getElementById('mappingContainer');
                    if (mappingContainer) {
                        mappingContainer.classList.remove('feature-locked');
                    }
                    buildMappingUI();
                }
                break;
            case 4:
                generatePersonalizedEmails();
                displayEmailPreview();
                
                // Show warning if free user has more than limit
                if (!state.isPro && state.uploadedData.length > state.freeEmailLimit) {
                    showUpgradePrompt(`Your CSV has ${state.uploadedData.length} emails, but the free plan is limited to ${state.freeEmailLimit}. Only the first ${state.freeEmailLimit} will be processed. Upgrade to Pro for unlimited emails!`);
                }
                break;
            case 5:
                // Initialize sending status if not already done
                if (!state.sendingStatus.details) {
                    state.sendingStatus = { sent: 0, failed: 0, details: [] };
                }
                
                // Show warning if free user has more than limit
                if (!state.isPro && state.uploadedData.length > state.freeEmailLimit) {
                    showUpgradePrompt(`Only ${state.freeEmailLimit} out of ${state.uploadedData.length} emails will be available to send on the free plan. Upgrade to Pro for unlimited sending!`);
                }
                
                displayRecipientList();
                updateSendingStats();
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
    
    // Update plan status
    updatePlanStatus();
    
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
    } else {
        state.detectedVariables = [];
        document.getElementById('detectedVariables').style.display = 'none';
    }
    
    // Enable Next button if there's any content in subject or body
    const hasContent = subject.trim().length > 0 || body.trim().length > 0;
    document.getElementById('step2Next').disabled = !hasContent;
    
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
    // Limit data to free plan limit for non-Pro users
    let dataToProcess = state.uploadedData;
    if (!state.isPro && state.uploadedData.length > state.freeEmailLimit) {
        dataToProcess = state.uploadedData.slice(0, state.freeEmailLimit);
    }
    
    state.personalizedEmails = dataToProcess.map(row => {
        let subject = state.emailSubject;
        let body = state.emailBody;
        
        // Replace all variables with actual data (only if there are variables)
        if (state.detectedVariables.length > 0) {
            state.detectedVariables.forEach(variable => {
                const column = state.variableMapping[variable];
                if (column) {
                    const value = row[column] || `[${variable}]`;
                    const regex = new RegExp(`\\[${variable}\\]`, 'g');
                    subject = subject.replace(regex, value);
                    body = body.replace(regex, value);
                }
            });
        }
        
        // Try to find email field for recipient
        let recipientEmail = 'N/A';
        const emailFields = ['Email', 'email', 'EMAIL', 'e-mail', 'E-mail'];
        for (const field of emailFields) {
            if (row[field]) {
                recipientEmail = row[field];
                break;
            }
        }
        
        // If variable mapping exists and has Email mapped, use that
        if (state.variableMapping['Email']) {
            recipientEmail = row[state.variableMapping['Email']] || recipientEmail;
        }
        
        return {
            recipient: recipientEmail,
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
                <div class="recipient-actions">
                    <span class="recipient-status status-${status.status}">${status.status}</span>
                    <button class="mark-sent-btn" data-index="${index}" title="Click to toggle status">✓</button>
                </div>
            </div>
        `;
    }).join('');
    
    // Add event listeners for mark-sent buttons
    document.querySelectorAll('.mark-sent-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            toggleEmailStatus(index);
        });
    });
}function toggleEmailStatus(index) {
    // Check if status tracking is allowed
    if (!state.isPro) {
        showUpgradePrompt('Full status tracking is a Pro feature. Upgrade to unlock!');
        return;
    }
    
    if (!state.sendingStatus.details[index]) {
        state.sendingStatus.details[index] = { status: 'pending' };
    }
    
    const currentStatus = state.sendingStatus.details[index].status;
    
    if (currentStatus === 'pending') {
        // Change to sent
        state.sendingStatus.details[index].status = 'sent';
        state.sendingStatus.sent = (state.sendingStatus.sent || 0) + 1;
    } else if (currentStatus === 'sent') {
        // Change back to pending
        state.sendingStatus.details[index].status = 'pending';
        state.sendingStatus.sent = Math.max(0, (state.sendingStatus.sent || 0) - 1);
    }
    
    displayRecipientList();
    updateSendingStats();
    saveState();
}

function updateSendingStats() {
    const sentCount = state.sendingStatus.sent || 0;
    const totalCount = state.personalizedEmails.length;
    const pendingCount = totalCount - sentCount;

    // Update any UI elements that show stats
    const sentElement = document.getElementById('sentCount');
    const failedElement = document.getElementById('failedCount');

    if (sentElement) sentElement.textContent = sentCount;
    if (failedElement) failedElement.textContent = state.sendingStatus.failed || 0;
}

async function startSending() {
    // Check if user can send emails
    if (!checkFeatureAccess('unlimitedSending')) {
        return;
    }
    
    const startBtn = document.getElementById('startSending');
    const progressContainer = document.getElementById('sendingProgress');
    const reportContainer = document.getElementById('sendingReport');

    // Find the next pending email
    const nextPendingIndex = state.personalizedEmails.findIndex((email, index) => {
        const status = state.sendingStatus.details[index] || { status: 'pending' };
        return status.status === 'pending';
    });

    if (nextPendingIndex === -1) {
        alert('All emails have been sent!');
        return;
    }

    // Initialize sending status if not already done
    if (!state.sendingStatus.details) {
        state.sendingStatus = { sent: 0, failed: 0, details: [] };
    }

    const email = state.personalizedEmails[nextPendingIndex];

    try {
        await openEmailClient(email);
        
        // Increment email counter for free users
        if (!state.isPro) {
            state.emailsSent++;
            updatePlanStatus();
        }
        
        // Don't automatically mark as sent - let user do it manually
        displayRecipientList();
        updateSendingStats();
    } catch (error) {
        console.error('Error opening email client:', error);
        alert('Error opening email client. Please try again.');
    }

    saveState();
}

async function sendIndividual() {
    // Removed - now using manual sending
}

async function sendBulk() {
    // Removed - now using manual sending
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
