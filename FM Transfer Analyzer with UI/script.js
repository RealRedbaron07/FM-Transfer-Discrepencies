// Global State
let currentSaveData = null;
let originalSaveData = null;
let currentFileName = '';
let originalFileExtension = '.fm';
let rawFileData = null;
let isPremiumUser = false; // For monetization
let simulationYearOffset = 0;

// Constants
const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB
const VALID_EXTENSIONS = ['.fm', '.sav', '.dat'];
const PREMIUM_KEY = 'fm_premium_v1';
const FREE_DOWNLOADS_KEY = 'fm_free_downloads_count';
const MAX_FREE_DOWNLOADS = 2;

// DOM Elements (assigned in init after DOMContentLoaded)
let uploadArea;
let fileInput;
let uploadSection;
let loadingContainer;
let editorSection;
let fileInfoDisplay;
let alertContainer;

// Initialize
document.addEventListener('DOMContentLoaded', init);

function init() {
    try {
        isPremiumUser = localStorage.getItem(PREMIUM_KEY) === '1';
    } catch (_) {}

    // safely grab elements after DOM is ready
    uploadArea = document.getElementById('uploadArea');
    fileInput = document.getElementById('fileInput');
    uploadSection = document.getElementById('uploadSection');
    loadingContainer = document.getElementById('loadingContainer');
    editorSection = document.getElementById('editorSection');
    fileInfoDisplay = document.getElementById('fileInfoDisplay');
    alertContainer = document.getElementById('alertContainer');

    setupEventListeners();
    console.log('✅ FM Save Editor initialized');
}

// Event Listeners Setup
function setupEventListeners() {
    // File upload
    if (fileInput) {
        // only the button, not entire area
        const chooseBtn = document.getElementById('chooseFileBtn');
        chooseBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            fileInput.click();
        });
        fileInput.addEventListener('change', handleFileSelect);
    }

    if (uploadArea) {
        // Drag and drop only
        uploadArea.addEventListener('dragover', handleDragOver);
        uploadArea.addEventListener('dragleave', handleDragLeave);
        uploadArea.addEventListener('drop', handleDrop);
    }

    // Tab switching
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });
    
    // Action buttons
    document.getElementById('saveBtn')?.addEventListener('click', saveChanges);
    document.getElementById('downloadBtn')?.addEventListener('click', downloadModifiedSave);
    document.getElementById('resetBtn')?.addEventListener('click', resetChanges);
    document.getElementById('newFileBtn')?.addEventListener('click', loadNewFile);
    document.getElementById('demoBtn')?.addEventListener('click', loadDemoData);
    
    // Player search
    document.getElementById('playerSearch')?.addEventListener('input', filterPlayers);
}

// helper to print upload debug
function setUploadDebug(msg) {
    const el = document.getElementById('uploadDebug');
    if (el) el.textContent = msg;
}

// Drag and Drop Handlers
function handleDragOver(e) {
    e.preventDefault();
    uploadArea.classList.add('dragover');
    setUploadDebug('Dragging file over drop zone...');
}

function handleDragLeave() {
    uploadArea.classList.remove('dragover');
    setUploadDebug('Drag left. Waiting for file...');
}

function handleDrop(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        setUploadDebug(`Dropped: ${files[0].name}`);
        handleFile(files[0]);
    }
}

// File Selection Handler
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        setUploadDebug(`Selected: ${file.name}`);
        handleFile(file);
    }
}

// Simple deterministic RNG (Mulberry32-ish)
function createSeededRandom(seed) {
    let s = seed >>> 0;
    return function rand() {
        s |= 0;
        s = (s + 0x6D2B79F5) | 0;
        let t = Math.imul(s ^ (s >>> 15), 1 | s);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function hashStringToInt(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
        h = Math.imul(31, h) + str.charCodeAt(i) | 0;
    }
    return h >>> 0;
}

// Main File Handler
function handleFile(file) {
    console.log('📂 Processing file:', file.name);
    
    // Validate file extension
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    if (!VALID_EXTENSIONS.includes(fileExtension)) {
        showAlert('error', `❌ Invalid file type! Please upload a ${VALID_EXTENSIONS.join(' or ')} file.`);
        return;
    }
    
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
        showAlert('error', `❌ File too large! Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB.`);
        return;
    }
    
    // Store file metadata
    currentFileName = file.name.replace(/\.[^/.]+$/, '');
    originalFileExtension = fileExtension;
    
    // Show loading
    if (uploadSection) uploadSection.style.display = 'none';
    if (editorSection) editorSection.classList.remove('active');
    if (loadingContainer) loadingContainer.classList.add('active');
    
    // Read file as binary
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            rawFileData = e.target.result;
            
            // NOTE: removed Premium gate on large files so upload is always free
            // parse directly
            parseSaveFile(rawFileData, file);
            
            setTimeout(() => {
                if (loadingContainer) loadingContainer.classList.remove('active');
                if (editorSection) editorSection.classList.add('active');
                showFileInfo(file);
                showAlert('success', `✅ Save file loaded successfully! Found ${currentSaveData.players.length} players.`);
            }, 1000);
            
        } catch (error) {
            console.error('Error reading file:', error);
            if (loadingContainer) loadingContainer.classList.remove('active');
            if (uploadSection) uploadSection.style.display = 'block';
            showAlert('error', `❌ Error reading file: ${error.message}`);
        }
    };
    
    reader.onerror = function() {
        if (loadingContainer) loadingContainer.classList.remove('active');
        if (uploadSection) uploadSection.style.display = 'block';
        showAlert('error', '❌ Error reading file. Please try again.');
    };
    
    // Read as ArrayBuffer for binary FM files
    reader.readAsArrayBuffer(file);
}

// Extract Club Names from Text OR from file name
function extractClubNames(text, fileName) {
    // 1) Try from filename first: e.g. "Liverpool 2028.fm" or "save_barcelona_2030.fm"
    const base = fileName.replace(/\.[^/.]+$/, ''); // strip extension
    const cleaned = base.replace(/[_\-]+/g, ' ').trim(); // underscores/dashes -> spaces

    // simple heuristics: split words, keep capitalised or long words
    const tokens = cleaned.split(/\s+/);
    const nameTokens = tokens.filter(t => t.length > 2 && /^[A-Za-z]/.test(t));
    let inferredClub = nameTokens.join(' ').trim();

    // drop obvious non-club tokens like "save", "career", "fm24" etc.
    inferredClub = inferredClub
        .replace(/\b(save|career|fm\d{2}|fm20\d{2}|autosave|manual)\b/gi, '')
        .replace(/\s+/g, ' ')
        .trim();

    if (inferredClub.length >= 3) {
        return [inferredClub];
    }

    // 2) If filename failed, try scanning text for known clubs as a hint
    const clubs = [];
    const commonClubs = [
        'Manchester United', 'Liverpool', 'Chelsea', 'Arsenal', 'Manchester City',
        'Tottenham', 'Real Madrid', 'Barcelona', 'Bayern Munich', 'PSG'
    ];
    
    commonClubs.forEach(club => {
        if (text.includes(club)) {
            clubs.push(club);
        }
    });
    
    // 3) Final fallback: clearly mark that it’s generic
    return clubs.length > 0 ? clubs : ['Generic FC'];
}

// Extract Game Date (enhanced: try from filename year too)
function extractGameDate(text, fileDate, fileName) {
    // Try to find year patterns in text
    let yearMatch = text.match(/20(1[5-9]|2[0-9])/);
    
    // If not in text, try from filename: my_save_2030.fm
    if (!yearMatch) {
        const nameYearMatch = fileName.match(/20(1[5-9]|2[0-9])/);
        if (nameYearMatch) {
            yearMatch = nameYearMatch;
        }
    }

    if (yearMatch) {
        return new Date(parseInt(yearMatch[0]), 6, 1); // July 1st of that year
    }
    
    // Use file modified date as fallback
    return new Date(fileDate);
}

// Compute Save Fingerprint
function computeSaveFingerprint(arrayBuffer, file) {
    // small hash from first 4KB
    const view = new Uint8Array(arrayBuffer, 0, Math.min(4096, arrayBuffer.byteLength));
    let acc = '';
    for (let i = 0; i < view.length; i += 64) {
        acc += String.fromCharCode(view[i]);
    }
    const raw = `${file.name}|${file.size}|${file.lastModified}|${acc}`;
    const id = hashStringToInt(raw).toString(16).padStart(8, '0');

    // buckets by rough characteristics
    const sizeMB = file.size / (1024 * 1024);
    const lastMod = new Date(file.lastModified);
    const year = lastMod.getFullYear();
    let bucket = 'unknown';
    const notes = [];

    if (sizeMB < 20) { bucket = 'small_career'; notes.push('Small career / test save size detected'); }
    else if (sizeMB < 80) { bucket = 'standard_career'; notes.push('Standard career save size detected'); }
    else { bucket = 'large_career'; notes.push('Large / long-term career save size detected'); }

    if (year < 2022) notes.push('Older save file (pre‑2022) – possible legacy FM version');
    else if (year > 2026) notes.push('Future‑dated save – likely advanced in time');

    return { id, bucket, notes, sizeMB: sizeMB.toFixed(1), lastModifiedISO: lastMod.toISOString() };
}

// Enhanced Parse FM Save File
function parseSaveFile(arrayBuffer, file) {
    console.log('🔍 Parsing FM save file...');
    console.log('File size:', arrayBuffer.byteLength, 'bytes');

    const fingerprint = computeSaveFingerprint(arrayBuffer, file);

    let extractedText = '';
    try {
        const textDecoder = new TextDecoder('utf-8', { fatal: false });
        const chunkSize = 1024;
        for (let i = 0; i < Math.min(arrayBuffer.byteLength, 64 * 1024); i += chunkSize) {
            const chunk = new Uint8Array(arrayBuffer, i, Math.min(chunkSize, arrayBuffer.byteLength - i));
            extractedText += textDecoder.decode(chunk, { stream: true });
        }
    } catch (err) {
        console.warn('Text extraction failed, continuing with empty text:', err);
    }

    // NOTE: pass file.name into extractors so they can use it
    const clubNames = extractClubNames(extractedText, file.name);
    const playerNames = extractPlayerNames(extractedText);
    const gameDate = extractGameDate(extractedText, file.lastModified, file.name);

    // Build a deterministic seed from file metadata + a tiny byte sample + extracted text
    let seedSource = file.name + '|' + file.size + '|' + file.lastModified + '|' + fingerprint.id;

    try {
        const bytes = new Uint8Array(arrayBuffer, 0, Math.min(256, arrayBuffer.byteLength));
        for (let i = 0; i < bytes.length; i++) {
            seedSource += String.fromCharCode(bytes[i]);
        }
    } catch (_) {}

    seedSource += '|' + extractedText.slice(0, 1024);
    const seed = hashStringToInt(seedSource);
    const rng = createSeededRandom(seed);

    console.log('Extracted data:', { clubNames, playerCount: playerNames.length, gameDate, seed, fingerprint });

    currentSaveData = generateRealisticSaveData(file.name, clubNames, playerNames, gameDate, rng, fingerprint);
    originalSaveData = JSON.parse(JSON.stringify(currentSaveData));
    renderAllData();
    console.log('✅ Save file parsed deterministically from filename/bytes');
}

// Generate Realistic Save Data
function generateRealisticSaveData(fileName, clubs, playerNames, gameDate, rng, fingerprint) {
    const localRng = rng || createSeededRandom(hashStringToInt(fileName + gameDate.toISOString()));
    const fp = fingerprint || { bucket: 'unknown', notes: [], id: 'na', sizeMB: '0', lastModifiedISO: '' };

    const mainClub = (clubs && clubs.length > 0 ? clubs[0] : 'Generic FC');
    const season = `${gameDate.getFullYear()}/${(gameDate.getFullYear() + 1).toString().slice(2)}`;

    // adjust finances/profile based on bucket
    let baseRep = 6500;
    let baseBalance = 15000000;
    let baseTransfer = 10000000;

    if (fp.bucket === 'large_career') {
        baseRep += 1500;
        baseBalance *= 3;
        baseTransfer *= 3;
    } else if (fp.bucket === 'standard_career') {
        baseRep += 500;
        baseBalance *= 1.8;
        baseTransfer *= 1.8;
    } // small_career stays as base

    return {
        metadata: {
            fileName: fileName,
            gameVersion: 'FM24 24.4.0 (simulated)',
            saveDate: new Date().toISOString(),
            gameDate: gameDate.toISOString().split('T')[0],
            season: season,
            source: 'Simulated view – not reading actual FM internals',
            fingerprint: fp
        },
        club: {
            name: mainClub,
            shortName: mainClub.split(' ').pop(),
            nation: 'Unknown',
            division: 'Unknown',
            reputation: baseRep + Math.floor(localRng() * 2000),
            trainingFacilities: 8 + Math.floor(localRng() * 10),
            youthFacilities: 6 + Math.floor(localRng() * 10),
            youthRecruitment: 6 + Math.floor(localRng() * 10),
            stadiumCapacity: 15000 + Math.floor(localRng() * 60000),
            stadiumName: `${mainClub} Stadium`
        },
        finances: {
            balance: baseBalance + Math.floor(localRng() * baseBalance),
            transferBudget: baseTransfer + Math.floor(localRng() * baseTransfer),
            wageBudget: 500000 + Math.floor(localRng() * 2000000),
            totalWages: 500000 + Math.floor(localRng() * 3000000),
            revenue: 20000000 + Math.floor(localRng() * 80000000),
            expenditure: 15000000 + Math.floor(localRng() * 60000000)
        },
        players: generatePlayersFromNames(playerNames, localRng),
        staff: generateMockStaff(8, localRng),
        advanced: {
            managerReputation: baseRep + Math.floor(localRng() * 1000),
            boardConfidence: 40 + Math.floor(localRng() * 60),
            fanConfidence: 40 + Math.floor(localRng() * 60),
            mediaHandling: 'Simulated',
            pressApproach: 'Simulated'
        }
    };
}

// Generate Players from Extracted Names
function generatePlayersFromNames(names, rng) {
    const localRng = rng || createSeededRandom(12345);

    if (names.length === 0) {
        return generateMockPlayers(25, localRng);
    }
    
    const positions = ['GK', 'DR', 'DC', 'DL', 'DMC', 'MC', 'AMC', 'AMR', 'AML', 'ST'];
    const nations = ['England', 'Spain', 'France', 'Brazil', 'Argentina', 'Portugal', 'Germany', 'Italy'];
    
    return names.map((fullName, i) => {
        const nameParts = fullName.split(' ');
        return {
            id: i + 1,
            firstName: nameParts[0],
            lastName: nameParts.slice(1).join(' '),
            age: 18 + Math.floor(localRng() * 17),
            nation: nations[Math.floor(localRng() * nations.length)],
            position: positions[Math.floor(localRng() * positions.length)],
            currentAbility: 120 + Math.floor(localRng() * 80),
            potentialAbility: 130 + Math.floor(localRng() * 70),
            value: (5 + localRng() * 95) * 1000000,
            wage: (20 + localRng() * 280) * 1000,
            contract: new Date(2024 + Math.floor(localRng() * 5), 5, 30).toISOString().split('T')[0],
            morale: ['Very Happy', 'Happy', 'Content', 'Unhappy'][Math.floor(localRng() * 4)],
            condition: 85 + Math.floor(localRng() * 15)
        };
    });
}

// Download Modified Save - Enhanced with Premium Check
function downloadModifiedSave() {
    // Premium feature check
    if (!isPremiumUser) {
        const usedDownloads = parseInt(localStorage.getItem(FREE_DOWNLOADS_KEY) || '0');
        
        if (usedDownloads >= MAX_FREE_DOWNLOADS) {
            showPremiumPrompt(`You have used all ${MAX_FREE_DOWNLOADS} free downloads. Upgrade to Premium for unlimited access.`);
            return;
        }
        
        // Increment usage
        localStorage.setItem(FREE_DOWNLOADS_KEY, (usedDownloads + 1).toString());
        // Notify user (small delay so download starts first)
        setTimeout(() => {
            alert(`ℹ️ Free download used (${usedDownloads + 1}/${MAX_FREE_DOWNLOADS}). You have ${MAX_FREE_DOWNLOADS - (usedDownloads + 1)} remaining.`);
        }, 500);
    }
    
    try {
        // Create modified save data
        const modifiedData = {
            ...currentSaveData,
            metadata: {
                ...currentSaveData.metadata,
                modified: true,
                modifiedDate: new Date().toISOString(),
                editor: 'FM Save Editor v2.0'
            }
        };
        
        const dataStr = JSON.stringify(modifiedData, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${currentFileName}_EDITED.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showAlert('success', `✅ Modified save downloaded! Note: This is JSON format for testing. Real FM format requires Premium.`);
        
    } catch (error) {
        console.error('Download error:', error);
        showAlert('error', `❌ Error downloading file: ${error.message}`);
    }
}

// Show Premium Prompt (modal version)
function showPremiumPrompt(message) {
    // remove any existing modal first to avoid duplicates
    closePremiumPrompt();

    const modal = document.createElement('div');
    modal.id = 'premiumPromptModal';
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0,0,0,0.8); display: flex; align-items: center;
        justify-content: center; z-index: 10000;
    `;
    
    modal.innerHTML = `
        <div style="background: white; padding: 40px; border-radius: 20px; max-width: 500px; text-align: center;">
            <h2 style="color: #667eea; margin-bottom: 20px;">⭐ Premium Feature</h2>
            <p style="margin-bottom: 30px; font-size: 1.1em;">${message}</p>
            <div style="display: flex; gap: 15px; justify-content: center;">
                <button id="premiumPromptLaterBtn"
                    style="padding: 12px 24px; background: #6c757d; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                    Maybe Later
                </button>
                <button id="premiumPromptUpgradeBtn"
                    style="padding: 12px 24px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                    Upgrade to Premium - $4.99
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);

    // wire buttons
    document.getElementById('premiumPromptLaterBtn')?.addEventListener('click', closePremiumPrompt);
    document.getElementById('premiumPromptUpgradeBtn')?.addEventListener('click', () => {
        window.open('https://your-payment-link.com', '_blank');
    });
}

function closePremiumPrompt() {
    const existing = document.getElementById('premiumPromptModal');
    if (existing && existing.parentElement) {
        existing.parentElement.removeChild(existing);
    }
}

// Generate Mock Players
function generateMockPlayers(count, rng) {
    const localRng = rng || createSeededRandom(98765);

    const positions = ['GK', 'DR', 'DC', 'DL', 'DMC', 'MC', 'AMC', 'AMR', 'AML', 'ST'];
    const nations = ['England', 'Spain', 'France', 'Brazil', 'Argentina', 'Portugal', 'Germany'];
    const firstNames = ['Marcus', 'Bruno', 'Casemiro', 'Antony', 'Jadon', 'Harry', 'Luke', 'Aaron', 'Christian', 'Raphael'];
    const lastNames = ['Rashford', 'Fernandes', 'Silva', 'Santos', 'Sancho', 'Maguire', 'Shaw', 'Wan-Bissaka', 'Eriksen', 'Varane'];
    
    const players = [];
    for (let i = 0; i < count; i++) {
        players.push({
            id: i + 1,
            firstName: firstNames[Math.floor(localRng() * firstNames.length)],
            lastName: lastNames[Math.floor(localRng() * lastNames.length)],
            age: 18 + Math.floor(localRng() * 17),
            nation: nations[Math.floor(localRng() * nations.length)],
            position: positions[Math.floor(localRng() * positions.length)],
            currentAbility: 100 + Math.floor(localRng() * 100),
            potentialAbility: 120 + Math.floor(localRng() * 80),
            value: (1 + localRng() * 100) * 1000000,
            wage: (10 + localRng() * 300) * 1000,
            contract: new Date(2024 + Math.floor(localRng() * 5), 5, 30).toISOString().split('T')[0],
            morale: ['Very Happy', 'Happy', 'Content', 'Unhappy'][Math.floor(localRng() * 4)],
            condition: 85 + Math.floor(localRng() * 15)
        });
    }
    return players;
}

// Generate Mock Staff
function generateMockStaff(count, rng) {
    const localRng = rng || createSeededRandom(45678);

    const roles = ['Assistant Manager', 'First Team Coach', 'Goalkeeping Coach', 'Fitness Coach', 'Physio'];
    const names = ['Erik ten Hag', 'Steve McClaren', 'Mitchell van der Gaag', 'Richard Hartis', 'Eric Ramsay'];
    
    const staff = [];
    for (let i = 0; i < count; i++) {
        staff.push({
            id: i + 1,
            name: names[i % names.length] + (i >= names.length ? ` ${i}` : ''),
            role: roles[i % roles.length],
            ability: 15 + Math.floor(localRng() * 5),
            wage: (20 + localRng() * 80) * 1000,
            contract: new Date(2024 + Math.floor(localRng() * 4), 5, 30).toISOString().split('T')[0]
        });
    }
    return staff;
}

// Render All Data
function renderAllData() {
    renderOverview();
    renderClubData();
    renderFinancesData();
    renderPlayersData();
    renderStaffData();
    renderAdvancedData();
}

// Render Overview
function renderOverview() {
    const container = document.getElementById('overviewData');
    if (!container || !currentSaveData) return;
    const fp = currentSaveData.metadata.fingerprint;
    container.innerHTML = `
        <p>Club: <strong>${currentSaveData.club.name}</strong></p>
        <p>Season: <strong>${currentSaveData.metadata.season}</strong></p>
        <p>Squad Size: <strong>${currentSaveData.players.length}</strong></p>
        ${fp ? `
        <p>Save ID: <strong>${fp.id}</strong></p>
        <p>Profile: <strong>${fp.bucket}</strong> (${fp.sizeMB} MB, last modified ${fp.lastModifiedISO.split('T')[0]})</p>
        ${fp.notes && fp.notes.length ? `<p>Notes: ${fp.notes.join(' · ')}</p>` : ''}` : ''}
    `;
}

function renderClubData() {
    const container = document.getElementById('clubData');
    if (!container || !currentSaveData) return;
    // minimal summary; extend later
    container.innerHTML = `
        <p>Division: ${currentSaveData.club.division}</p>
        <p>Reputation: ${currentSaveData.club.reputation}</p>
    `;
}

function renderFinancesData() {
    const container = document.getElementById('financesData');
    if (!container || !currentSaveData) return;
    const f = currentSaveData.finances;
    container.innerHTML = `
        <div class="data-item">
            <label>Balance</label>
            <input type="text" value="€${(f.balance/1_000_000).toFixed(1)}M" readonly>
        </div>
        <div class="data-item">
            <label>Transfer Budget</label>
            <input type="text" value="€${(f.transferBudget/1_000_000).toFixed(1)}M" readonly>
        </div>
        <div class="data-item">
            <label>Wage Budget</label>
            <input type="text" value="€${(f.wageBudget/1_000).toFixed(1)}k p/w" readonly>
        </div>
    `;
}

// Updated to match your CSS .player-card class
function renderPlayersData() {
    const container = document.getElementById('playersData');
    if (!container || !currentSaveData) return;
    
    container.innerHTML = currentSaveData.players.map(p => `
        <div class="player-card">
            <div class="player-header">
                <div class="player-name">${p.firstName} ${p.lastName}</div>
                <div class="player-position">${p.position}</div>
            </div>
            <div class="player-stats">
                <div style="display:flex; flex-direction:column; gap:4px;">
                    <small style="color:#666">Ability</small>
                    <strong>${p.currentAbility} / ${p.potentialAbility}</strong>
                </div>
                <div style="display:flex; flex-direction:column; gap:4px;">
                    <small style="color:#666">Value</small>
                    <strong>€${(p.value/1_000_000).toFixed(1)}M</strong>
                </div>
                <div style="display:flex; flex-direction:column; gap:4px;">
                    <small style="color:#666">Age</small>
                    <strong>${p.age}</strong>
                </div>
                <div style="display:flex; flex-direction:column; gap:4px;">
                    <small style="color:#666">Nation</small>
                    <strong>${p.nation}</strong>
                </div>
            </div>
        </div>
    `).join('');
}

function renderStaffData() {
    const container = document.getElementById('staffData');
    if (!container || !currentSaveData) return;
    container.innerHTML = currentSaveData.staff.map(s => `
        <div class="staff-row">
            <span>${s.name}</span>
            <span>${s.role}</span>
            <span>${s.ability}/20</span>
        </div>
    `).join('');
}

function renderAdvancedData() {
    const container = document.getElementById('advancedData');
    if (!container || !currentSaveData) return;
    const a = currentSaveData.advanced;
    container.innerHTML = `
        <p>Manager Reputation: ${a.managerReputation}</p>
        <p>Board Confidence: ${a.boardConfidence}%</p>
        <p>Fan Confidence: ${a.fanConfidence}%</p>
    `;
}

// Simulation Logic
function simulateFuture(years) {
    if (!isPremiumUser) {
        showPremiumPrompt(`Simulating ${years} years into the future is a Premium feature.`);
        return;
    }
    
    currentSaveData.players.forEach(p => {
        p.age += years;
        const growth = p.potentialAbility - p.currentAbility;
        if (p.age < 24) p.currentAbility += Math.min(growth, Math.floor(Math.random() * 5 * years) + years);
        else if (p.age > 30) p.currentAbility -= Math.floor(Math.random() * 3 * years) + years;
        if (p.age < 22) p.value *= (1 + (0.2 * years));
        if (p.age > 30) p.value *= (1 - (0.2 * years));
        p.value = Math.max(0, p.value);
        p.currentAbility = Math.max(1, Math.min(p.potentialAbility, p.currentAbility));
    });
    
    const d = new Date(currentSaveData.metadata.gameDate);
    d.setFullYear(d.getFullYear() + years);
    currentSaveData.metadata.gameDate = d.toISOString().split('T')[0];
    currentSaveData.metadata.season = `${d.getFullYear()}/${(d.getFullYear() + 1).toString().slice(2)}`;
    
    renderAllData();
    alert(`🔮 Advanced ${years} years!`);
}

function resetSimulation() {
    if (originalSaveData) {
        currentSaveData = JSON.parse(JSON.stringify(originalSaveData));
        renderAllData();
    }
}

// Premium Features
function setPremiumUser(val) {
    isPremiumUser = !!val;
    try {
        if (val) localStorage.setItem(PREMIUM_KEY, '1');
        else localStorage.removeItem(PREMIUM_KEY);
    } catch (_) {}
}

// --- UI helpers (NEW) ---

function showUploadZone() {
    const uploadZone = document.getElementById('uploadZone');
    if (uploadZone && uploadSection) {
        uploadZone.style.display = 'block';
    }
}

function hideUploadZone() {
    const uploadZone = document.getElementById('uploadZone');
    if (uploadZone && uploadSection) {
        uploadZone.style.display = 'none';
    }
}

function loadDemoData() {
    // use deterministic rng with fixed seed so demo is stable
    const rng = createSeededRandom(hashStringToInt('DEMO_LIVERPOOL'));
    const fakeFingerprint = {
        id: 'demo_liv',
        bucket: 'standard_career',
        notes: ['Demo dataset – not based on a real save'],
        sizeMB: '42.0',
        lastModifiedISO: new Date().toISOString()
    };
    currentSaveData = generateRealisticSaveData(
        'Demo_Liverpool.fm',
        ['Liverpool'],
        ['Mohamed Salah', 'Virgil van Dijk', 'Alisson Becker', 'Trent Alexander-Arnold'],
        new Date(),
        rng,
        fakeFingerprint
    );
    originalSaveData = JSON.parse(JSON.stringify(currentSaveData));
    // show editor/results view
    if (uploadSection) uploadSection.style.display = 'none';
    if (loadingContainer) loadingContainer.classList.remove('active');
    if (editorSection) editorSection.classList.add('active');
    renderAllData();
    showAlert('success', 'Loaded demo Liverpool squad.');
}

function showFileInfo(file) {
    if (!fileInfoDisplay) return;
    
    document.getElementById('fileName').textContent = file.name;
    document.getElementById('fileSize').textContent = `${(file.size / 1024 / 1024).toFixed(2)} MB`;
    document.getElementById('fileType').textContent = file.type || 'Unknown';

    fileInfoDisplay.classList.add('active');
}

function showAlert(type, message) {
    if (!alertContainer) {
        alert(message);
        return;
    }
    const el = document.createElement('div');
    el.className = `alert alert-${type}`;
    el.textContent = message;
    alertContainer.appendChild(el);
    setTimeout(() => el.remove(), 4000);
}

function switchTab(tabName) {
    const tabs = document.querySelectorAll('.tab');
    const panes = {
        overview: document.getElementById('overviewTab'),
        club: document.getElementById('clubTab'),
        finances: document.getElementById('financesTab'),
        players: document.getElementById('playersTab'),
        staff: document.getElementById('staffTab'),
        advanced: document.getElementById('advancedTab')
    };

    tabs.forEach(t => t.classList.remove('active'));
    document.querySelector(`.tab[data-tab="${tabName}"]`)?.classList.add('active');

    Object.values(panes).forEach(p => p && p.classList.remove('active'));
    panes[tabName]?.classList.add('active');
}

// --- Premium modal for nav "Go Pro" button ---

function showPremiumModal() {
    closePremiumModal(); // ensure only one modal

    const root = document.getElementById('premiumModalRoot') || document.body;
    const modal = document.createElement('div');
    modal.id = 'premiumMainModal';
    modal.style.cssText = `
        position: fixed; inset: 0;
        background: rgba(0,0,0,0.75);
        display: flex; align-items: center; justify-content: center;
        z-index: 10001;
    `;
    modal.innerHTML = `
        <div style="background:#111827;color:#fff;padding:32px;border-radius:16px;max-width:420px;width:100%;font-family:system-ui;">
            <h2 style="margin-bottom:12px;">Unlock FM Transfer Analyzer Pro</h2>
            <p style="margin-bottom:20px;font-size:14px;line-height:1.5;">
                • Download edited saves<br>
                • Large savefile support<br>
                • Long-term simulations & advanced insights
            </p>
            <div style="display:flex;gap:12px;justify-content:flex-end;">
                <button id="premiumModalLaterBtn"
                        style="padding:8px 16px;border-radius:8px;border:none;background:#4b5563;color:#fff;cursor:pointer;">
                    Maybe later
                </button>
                <button id="premiumModalUpgradeBtn"
                        style="padding:8px 16px;border-radius:8px;border:none;background:#8b5cf6;color:#fff;cursor:pointer;font-weight:600;">
                    Go Pro – $4.99
                </button>
            </div>
        </div>
    `;
    root.appendChild(modal);

    document.getElementById('premiumModalLaterBtn')?.addEventListener('click', closePremiumModal);
    document.getElementById('premiumModalUpgradeBtn')?.addEventListener('click', () => {
        window.open('https://your-payment-link.com','_blank');
    });
}

function closePremiumModal() {
    const modal = document.getElementById('premiumMainModal');
    if (modal && modal.parentElement) {
        modal.parentElement.removeChild(modal);
    }
}

// --- MISSING FUNCTIONS ADDED BELOW ---

function saveChanges() {
    // In a real app, this might save to IndexedDB or prepare a blob
    showAlert('success', 'Changes saved to session! Click "Download Save" to export.');
}

function resetChanges() {
    if (!originalSaveData) return;
    if (confirm('Are you sure you want to discard all changes?')) {
        currentSaveData = JSON.parse(JSON.stringify(originalSaveData));
        renderAllData();
        showAlert('info', 'All changes have been reset to original state.');
    }
}

function loadNewFile() {
    if (confirm('Load a new file? Any unsaved changes will be lost.')) {
        location.reload();
    }
}

function filterPlayers(e) {
    const term = e.target.value.toLowerCase();
    const cards = document.querySelectorAll('.player-card');
    
    cards.forEach(card => {
        const name = card.querySelector('.player-name').textContent.toLowerCase();
        if (name.includes(term)) {
            card.style.display = 'block'; 
        } else {
            card.style.display = 'none';
        }
    });
}
function extractPlayerNames(text) {
    // Pattern to match full names (first and last, capitalized)
    const namePattern = /\b[A-Z][a-z]{2,}(?:\s[A-Z][a-z]+)+\b/g;
    let matches = text.match(namePattern);
    if (matches) {
        // Return unique names, limit to 50 for performance
        return [...new Set(matches)].slice(0, 50);
    }
    return []; // Return empty array if no names found
}