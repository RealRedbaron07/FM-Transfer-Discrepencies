// app.js - Enhanced with real functionality
let players = [];
let currentView = 'all';
let saveFileParser = null;
let subscriptionManager = null;

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    console.log('FM Transfer Analyzer Pro - Real Version');
    
    // Initialize managers
    saveFileParser = new FMSaveFileParser();
    subscriptionManager = new SubscriptionManager();
    
    initializeUpload();
    updateUIForSubscription();
    showSubscriptionStatus();
});

function initializeUpload() {
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
        fileInput.addEventListener('change', handleFileSelect);
    }
    
    // Add drag and drop functionality
    const uploadZone = document.getElementById('uploadZone');
    if (uploadZone) {
        uploadZone.addEventListener('dragover', handleDragOver);
        uploadZone.addEventListener('drop', handleDrop);
        uploadZone.addEventListener('click', () => fileInput.click());
    }
}

function handleDragOver(event) {
    event.preventDefault();
    event.currentTarget.classList.add('dragover');
}

function handleDrop(event) {
    event.preventDefault();
    event.currentTarget.classList.remove('dragover');
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
        handleFileUpload(files[0]);
    }
}

function showUploadZone() {
    // Check if user can parse save files
    const canParse = subscriptionManager.canParseSaveFile();
    
    if (!canParse.allowed) {
        showUpgradePrompt('Save File Parsing', canParse.reason);
        return;
    }
    
    document.getElementById('uploadZone').style.display = 'block';
    document.querySelector('.hero-content').style.display = 'none';
}

function hideUploadZone() {
    document.getElementById('uploadZone').style.display = 'none';
    document.querySelector('.hero-content').style.display = 'block';
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        handleFileUpload(file);
    }
}

async function handleFileUpload(file) {
    try {
        // Check subscription
        const canParse = subscriptionManager.canParseSaveFile();
        if (!canParse.allowed) {
            showUpgradePrompt('Save File Parsing', canParse.reason);
            return;
        }
        
        showProgress();
        
        // Parse the actual save file
        const saveData = await saveFileParser.parseSaveFile(file);
        
        // Load the parsed data
        players = saveData.players;
        
        // Update UI with parsed data
        document.getElementById('squadTitle').textContent = `${saveData.saveInfo.fileName} - Squad Analysis`;
        
        showResults();
        
        // Track usage
        subscriptionManager.addTransfer();
        
    } catch (error) {
        hideProgress();
        showError('Save File Parsing Error', error.message);
    }
}

function showProgress() {
    document.getElementById('uploadSection').style.display = 'none';
    document.getElementById('progressSection').style.display = 'block';
    
    let progress = 0;
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    
    const messages = [
        'Reading save file format...',
        'Decompressing save data...',
        'Extracting player information...',
        'Parsing club data...',
        'Calculating market values...',
        'Analyzing squad composition...',
        'Generating insights...'
    ];
    
    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 100) progress = 100;
        
        progressFill.style.width = progress + '%';
        
        const messageIndex = Math.floor((progress / 100) * messages.length);
        if (messageIndex < messages.length) {
            progressText.textContent = messages[messageIndex];
        }
        
        if (progress >= 100) {
            clearInterval(interval);
        }
    }, 800);
}

function hideProgress() {
    document.getElementById('progressSection').style.display = 'none';
}

// Enhanced loadDemoData function
function loadDemoData() {
    console.log('Loading demo data...');
    
    // Check transfer limit for free users
    const canAdd = subscriptionManager.canAddTransfer();
    if (!canAdd.allowed) {
        showUpgradePrompt('Transfer Limit Reached', canAdd.reason);
        return;
    }
    
    // Load demo Liverpool squad
    players = saveFileParser.getLiverpoolSquad();
    
    // Track usage for free users
    subscriptionManager.addTransfer();
    
    console.log('Demo data loaded:', players.length, 'players');
    showResults();
}

function showResults() {
    console.log('Showing results...');
    document.getElementById('uploadSection').style.display = 'none';
    document.getElementById('progressSection').style.display = 'none';
    document.getElementById('resultsSection').style.display = 'block';
    
    updateStats();
    updatePlayersTable('all');
    updateSubscriptionStatus();
}

function updateStats() {
    const totalValue = players.reduce((sum, player) => sum + player.value, 0);
    const avgAge = players.reduce((sum, player) => sum + player.age, 0) / players.length;
    const starPlayers = players.filter(player => 
        player.status.includes('Star') || player.status.includes('Wonderkid')).length;
    
    document.getElementById('totalPlayers').textContent = players.length;
    document.getElementById('totalValue').textContent = `€${Math.round(totalValue / 1000000)}M`;
    document.getElementById('avgAge').textContent = avgAge.toFixed(1);
    document.getElementById('starPlayers').textContent = starPlayers;
}

function exportToCSV() {
    // Check if user can export
    const canExport = subscriptionManager.canExportReports();
    if (!canExport.allowed) {
        showUpgradePrompt('Export Reports', canExport.reason);
        return;
    }
    
    const headers = ['Name', 'Age', 'Position', 'Current Ability', 'Potential', 'Value', 'Contract Years', 'Status', 'Club'];
    const csvContent = [
        headers.join(','),
        ...players.map(player => [
            `"${player.name}"`,
            player.age,
            player.position,
            player.currentAbility,
            player.potential,
            player.value,
            player.contractYears,
            `"${player.status}"`,
            `"${player.club || 'Unknown'}"`
        ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fm_squad_analysis_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    // Show success message
    showSuccessMessage('Report exported successfully!');
}

// Subscription UI Management
function updateUIForSubscription() {
    const userInfo = subscriptionManager.getUserInfo();
    
    // Update navigation
    const navBtn = document.querySelector('.nav-btn');
    if (userInfo.isPro) {
        navBtn.innerHTML = '<span class="premium-icon">👑</span> Pro Member';
        navBtn.style.background = 'linear-gradient(135deg, #00ff9f, #00d4ff)';
    }
    
    // Update buttons based on subscription
    updateButtonStates(userInfo);
}

function updateButtonStates(userInfo) {
    // Upload button
    const uploadBtn = document.querySelector('.cta-btn.secondary');
    if (!userInfo.features.saveFileParsing) {
        uploadBtn.innerHTML = `
            <span class="btn-icon">🔒</span>
            <span class="btn-text">
                <strong>Upload Save File (Pro)</strong>
                <small>Upgrade to unlock</small>
            </span>
        `;
    }
    
    // Export buttons
    const exportBtns = document.querySelectorAll('.export-btn:not(.premium)');
    exportBtns.forEach(btn => {
        if (!userInfo.features.exportReports) {
            btn.innerHTML = '🔒 Export CSV (Pro Only)';
            btn.classList.add('disabled');
        }
    });
}

function showSubscriptionStatus() {
    const userInfo = subscriptionManager.getUserInfo();
    
    // Create status indicator
    const statusIndicator = document.createElement('div');
    statusIndicator.className = 'subscription-status';
    statusIndicator.innerHTML = `
        <div class="status-content">
            <div class="status-plan">${userInfo.plan.toUpperCase()}</div>
            <div class="status-usage">
                ${userInfo.isPro ? 'Unlimited' : `${userInfo.transfersUsed}/${userInfo.transfersUsed + userInfo.transfersRemaining}`} transfers
            </div>
        </div>
    `;
    
    // Style the indicator
    statusIndicator.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: ${userInfo.isPro ? 'linear-gradient(135deg, #00ff9f, #00d4ff)' : 'rgba(255,255,255,0.15)'};
    padding: 0.75rem 1rem;
    border-radius: 12px;
    color: white;
    font-size: 0.9rem;
    backdrop-filter: blur(15px);
    border: 1px solid rgba(255,255,255,0.2);
    z-index: 100;
    box-shadow: 0 8px 25px rgba(0,0,0,0.3);
    min-width: 140px;
    text-align: center;
    transition: all 0.3s ease;
    cursor: pointer;
`;
    document.body.appendChild(statusIndicator);
}

function updateSubscriptionStatus() {
    const existing = document.querySelector('.subscription-status');
    if (existing) {
        existing.remove();
    }
    showSubscriptionStatus();
}

// Upgrade Prompts
function showUpgradePrompt(feature, reason) {
    const modal = document.createElement('div');
    modal.className = 'upgrade-modal';
    modal.innerHTML = `
        <div class="upgrade-content">
            <button class="modal-close" onclick="this.closest('.upgrade-modal').remove()">×</button>
            <div class="upgrade-header">
                <h2>🚀 Unlock ${feature}</h2>
                <p>${reason}</p>
            </div>
            <div class="upgrade-benefits">
                <div class="benefit">✅ Unlimited squad analysis</div>
                <div class="benefit">✅ Real save file parsing</div>
                <div class="benefit">✅ Advanced reports & export</div>
                <div class="benefit">✅ Priority support</div>
            </div>
            <div class="upgrade-pricing">
                <div class="price-option" onclick="handleUpgrade('monthly')">
                    <div class="price-name">Monthly</div>
                    <div class="price-amount">$9.99</div>
                    <button class="price-btn">Subscribe</button>
                </div>
                <div class="price-option featured" onclick="handleUpgrade('yearly')">
                    <div class="price-badge">Best Value</div>
                    <div class="price-name">Yearly</div>
                    <div class="price-amount">$99.99</div>
                    <div class="price-savings">Save 17%</div>
                    <button class="price-btn">Subscribe</button>
                </div>
            </div>
        </div>
    `;
    
    // Style the modal
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        backdrop-filter: blur(10px);
    `;
    
    document.body.appendChild(modal);
}

async function handleUpgrade(planType) {
    try {
        // Close upgrade modal
        const modal = document.querySelector('.upgrade-modal');
        if (modal) modal.remove();
        
        // Process upgrade
        await subscriptionManager.upgradeToPro(planType);
        
        // Update UI
        updateUIForSubscription();
        updateSubscriptionStatus();
        
    } catch (error) {
        showError('Upgrade Error', error.message);
    }
}

// Enhanced error handling
function showError(title, message) {
    const errorModal = document.createElement('div');
    errorModal.innerHTML = `
        <div class="error-modal">
            <div class="error-content">
                <div class="error-icon">⚠️</div>
                <h2>${title}</h2>
                <p>${message}</p>
                <button onclick="this.closest('.error-modal').remove()" class="error-btn">
                    OK
                </button>
            </div>
        </div>
    `;
    
    errorModal.querySelector('.error-modal').style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
    `;
    
    errorModal.querySelector('.error-content').style.cssText = `
        background: linear-gradient(135deg, #1a2332, #2d5a8b);
        padding: 2rem;
        border-radius: 15px;
        text-align: center;
        color: white;
        max-width: 400px;
    `;
    
    document.body.appendChild(errorModal);
}

function showSuccessMessage(message) {
    const successDiv = document.createElement('div');
    successDiv.innerHTML = `
        <div class="success-toast">
            ✅ ${message}
        </div>
    `;
    
    successDiv.querySelector('.success-toast').style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, #00ff9f, #00d4ff);
        color: white;
        padding: 1rem 2rem;
        border-radius: 10px;
        z-index: 1000;
        animation: slideDown 0.5s ease;
    `;
    
    document.body.appendChild(successDiv);
    
    setTimeout(() => {
        document.body.removeChild(successDiv);
    }, 3000);
}

// Keep existing functions
function showTab(filter, tabElement) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    tabElement.classList.add('active');
    
    currentView = filter;
    updatePlayersTable(filter);
}

function updatePlayersTable(filter) {
    let filteredPlayers = [...players];
    
    switch (filter) {
        case 'valuable':
            filteredPlayers = players.filter(p => p.value >= 40000000);
            break;
        case 'young':
            filteredPlayers = players.filter(p => p.age <= 23);
            break;
        case 'contracts':
            filteredPlayers = players.filter(p => p.contractYears <= 2);
            break;
    }
    
    const tbody = document.getElementById('playersTableBody');
    tbody.innerHTML = '';
    
    filteredPlayers.forEach(player => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <strong>${player.name}</strong><br>
                <small style="color: #94a3b8;">${player.nationality}</small>
            </td>
            <td>${player.age}</td>
            <td>
                <span style="background: rgba(0,212,255,0.2); color: var(--fm-cyan); padding: 0.25rem 0.5rem; border-radius: 5px; font-size: 0.8rem;">
                    ${player.position}
                </span>
            </td>
            <td>${player.currentAbility}</td>
            <td>${player.potential}</td>
            <td><strong>€${(player.value / 1000000).toFixed(1)}M</strong></td>
            <td>${player.contractYears} year${player.contractYears !== 1 ? 's' : ''}</td>
            <td>${player.status}</td>
        `;
        tbody.appendChild(row);
    });
}

function goBack() {
    document.getElementById('resultsSection').style.display = 'none';
    document.getElementById('uploadSection').style.display = 'block';
    document.querySelector('.hero-content').style.display = 'block';
    document.getElementById('uploadZone').style.display = 'none';
}

function showPremiumModal() {
    const userInfo = subscriptionManager.getUserInfo();
    
    if (userInfo.isPro) {
        // Show account management for pro users
        showAccountManagement();
    } else {
        // Show upgrade options
        showUpgradePrompt('Premium Features', 'Unlock all features with a Pro subscription');
    }
}

function showAccountManagement() {
    const userInfo = subscriptionManager.getUserInfo();
    
    const modal = document.createElement('div');
    modal.innerHTML = `
        <div class="account-modal">
            <div class="account-content">
                <button class="modal-close" onclick="this.closest('.account-modal').remove()">×</button>
                <h2>👑 Pro Account</h2>
                <div class="account-info">
                    <div class="info-item">
                        <strong>Plan:</strong> ${userInfo.plan.toUpperCase()}
                    </div>
                    <div class="info-item">
                        <strong>Status:</strong> Active
                    </div>
                    <div class="info-item">
                        <strong>Features:</strong> All Unlocked
                    </div>
                </div>
                <div class="account-features">
                    <div class="feature">✅ Unlimited transfers</div>
                    <div class="feature">✅ Save file parsing</div>
                    <div class="feature">✅ Export reports</div>
                    <div class="feature">✅ Priority support</div>
                </div>
                <button onclick="this.closest('.account-modal').remove()" class="account-btn">
                    Continue Using Pro
                </button>
            </div>
        </div>
    `;
    
    modal.querySelector('.account-modal').style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
    `;
    
    document.body.appendChild(modal);
}

function closePremiumModal() {
    const modal = document.getElementById('premiumModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideDown {
        from { transform: translate(-50%, -100%); opacity: 0; }
        to { transform: translate(-50%, 0); opacity: 1; }
    }
    
    .dragover {
        border-color: var(--fm-cyan) !important;
        background: rgba(0, 212, 255, 0.1) !important;
    }
    
    .disabled {
        opacity: 0.5;
        cursor: not-allowed !important;
    }
    
    .upgrade-content, .account-content, .error-content {
        background: linear-gradient(135deg, #1a2332, #2d5a8b);
        padding: 2rem;
        border-radius: 15px;
        color: white;
        max-width: 500px;
        position: relative;
    }
    
    .modal-close {
        position: absolute;
        top: 1rem;
        right: 1rem;
        background: none;
        border: none;
        color: white;
        font-size: 1.5rem;
        cursor: pointer;
    }
    
    .upgrade-pricing {
        display: flex;
        gap: 1rem;
        margin-top: 2rem;
    }
    
    .price-option {
        flex: 1;
        background: rgba(255,255,255,0.1);
        padding: 1.5rem;
        border-radius: 10px;
        text-align: center;
        cursor: pointer;
        transition: all 0.3s ease;
        position: relative;
    }
    
    .price-option:hover {
        background: rgba(255,255,255,0.2);
    }
    
    .price-option.featured {
        border: 2px solid var(--fm-cyan);
    }
    
    .price-badge {
        position: absolute;
        top: -10px;
        left: 50%;
        transform: translateX(-50%);
        background: var(--fm-cyan);
        color: white;
        padding: 0.25rem 0.75rem;
        border-radius: 15px;
        font-size: 0.8rem;
    }
`;
document.head.appendChild(style);