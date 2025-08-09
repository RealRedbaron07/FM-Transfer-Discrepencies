// Content script for FM Transfer Analyzer Pro Extension

// Listen for messages from popup
window.addEventListener('message', (event) => {
  if (event.source !== window) return;
  
  if (event.data.type === 'FROM_POPUP') {
    handlePopupMessage(event.data);
  }
});

// Handle messages from popup
function handlePopupMessage(data) {
  switch (data.action) {
    case 'FETCH_TRANSFERS':
      chrome.runtime.sendMessage({
        action: 'fetchTransfers',
        data: data.payload
      }, (response) => {
        window.postMessage({
          type: 'FROM_CONTENT',
          action: 'FETCH_TRANSFERS_RESPONSE',
          data: response
        }, '*');
      });
      break;
      
    case 'SAVE_DATA':
      chrome.runtime.sendMessage({
        action: 'saveData',
        data: data.payload
      }, (response) => {
        window.postMessage({
          type: 'FROM_CONTENT',
          action: 'SAVE_DATA_RESPONSE',
          data: response
        }, '*');
      });
      break;
      
    case 'LOAD_DATA':
      chrome.runtime.sendMessage({
        action: 'loadData',
        keys: data.payload
      }, (response) => {
        window.postMessage({
          type: 'FROM_CONTENT',
          action: 'LOAD_DATA_RESPONSE',
          data: response
        }, '*');
      });
      break;
  }
}

// Inject styles for extension popup
const style = document.createElement('style');
style.textContent = `
  /* Extension-specific styles */
  body {
    width: 1200px;
    height: 800px;
    margin: 0;
    padding: 0;
    overflow: hidden;
  }
  
  #app {
    width: 100%;
    height: 100%;
  }
  
  .main-content {
    height: calc(100vh - 80px);
    overflow-y: auto;
  }
  
  /* Responsive design for extension */
  @media (max-width: 1200px) {
    body {
      width: 100vw;
      height: 100vh;
    }
  }
`;
document.head.appendChild(style);

// Initialize extension
console.log('FM Transfer Analyzer Pro Extension loaded'); 