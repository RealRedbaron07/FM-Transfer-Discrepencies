// Website embedding code
(function() {
    'use strict';
    
    // Create embed container
    function createFMAnalyzerEmbed(containerId, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error('FM Analyzer embed container not found');
            return;
        }
        
        const iframe = document.createElement('iframe');
        iframe.src = options.src || 'https://your-domain.com/fm-analyzer/';
        iframe.width = options.width || '100%';
        iframe.height = options.height || '600px';
        iframe.style.border = 'none';
        iframe.style.borderRadius = '12px';
        iframe.style.boxShadow = '0 8px 32px rgba(0,0,0,0.1)';
        
        container.appendChild(iframe);
        
        // Add promotional text
        const promo = document.createElement('div');
        promo.innerHTML = `
            <div style="text-align: center; margin-top: 1rem; font-family: 'Inter', sans-serif;">
                <p style="color: #64748b; font-size: 0.9rem;">
                    Powered by <strong>FM Transfer Analyzer Pro</strong> - 
                    <a href="https://your-domain.com/fm-analyzer/" target="_blank" 
                       style="color: #4a90e2; text-decoration: none;">
                        Get the full version →
                    </a>
                </p>
            </div>
        `;
        container.appendChild(promo);
    }
    
    // Make globally available
    window.FMAnalyzerEmbed = createFMAnalyzerEmbed;
})();