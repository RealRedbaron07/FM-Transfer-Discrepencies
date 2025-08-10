// Background script for FM Transfer Analyzer Pro Extension

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // Initialize default data
    chrome.storage.local.set({
      fmTransfers: [],
      fmUser: {
        plan: 'free',
        transfersThisMonth: 0,
        maxTransfers: 10,
        openTransferSlots: 5,
        scoutedPlayers: [],
        premiumFeatures: {
          unlimitedTransfers: false,
          advancedScouting: false,
          marketInsights: false,
          transferHistory: false,
          customReports: false,
          prioritySupport: false
        }
      },
      fmScoutedPlayers: []
    });
    
    // Open welcome page
    chrome.tabs.create({
      url: chrome.runtime.getURL('index.html')
    });
  }
});

// Handle messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'fetchTransfers') {
    // Handle API calls through background script
    fetchTransfers(request.data)
      .then(response => sendResponse({ success: true, data: response }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Keep message channel open for async response
  }
  
  if (request.action === 'saveData') {
    chrome.storage.local.set(request.data)
      .then(() => sendResponse({ success: true }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
  
  if (request.action === 'loadData') {
    chrome.storage.local.get(request.keys)
      .then(data => sendResponse({ success: true, data }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
});

// Fetch transfers from SportMonks API
async function fetchTransfers(options = {}) {
  const { apiToken, filters = {} } = options;
  
  if (!apiToken) {
    throw new Error('API token required');
  }
  
  let url = `https://api.sportmonks.com/v3/football/transfers?api_token=${apiToken}`;
  
  // Add filters
  if (filters.season_id) url += `&filters=season_id:${filters.season_id}`;
  if (filters.player_id) url += `&filters=player_id:${filters.player_id}`;
  if (filters.from_team_id) url += `&filters=from_team_id:${filters.from_team_id}`;
  if (filters.to_team_id) url += `&filters=to_team_id:${filters.to_team_id}`;
  if (filters.date_from) url += `&filters=date_from:${filters.date_from}`;
  if (filters.date_to) url += `&filters=date_to:${filters.date_to}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return await response.json();
}

// Handle badge updates
function updateBadge() {
  chrome.storage.local.get(['fmTransfers', 'fmUser'], (data) => {
    const transferCount = data.fmTransfers?.length || 0;
    const scoutedCount = data.fmUser?.scoutedPlayers?.length || 0;
    
    chrome.action.setBadgeText({
      text: transferCount.toString()
    });
    
    chrome.action.setBadgeBackgroundColor({
      color: '#00d4aa'
    });
  });
}

// Update badge when data changes
chrome.storage.onChanged.addListener((changes) => {
  if (changes.fmTransfers || changes.fmUser) {
    updateBadge();
  }
});

// Initialize badge
updateBadge(); 