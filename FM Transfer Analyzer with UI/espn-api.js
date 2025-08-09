// ESPN API Integration Module
// This module handles the Apify ESPN scraper integration

class ESPNTransferAPI {
    constructor() {
        this.client = null;
        this.isInitialized = false;
        this.apiToken = null;
    }

    // Initialize the API client
    async initialize(apiToken) {
        try {
            // Dynamically import the ApifyClient
            const { ApifyClient } = await import('https://cdn.jsdelivr.net/npm/apify-client@2.7.1/+esm');
            
            this.client = new ApifyClient({
                token: apiToken,
            });
            
            this.apiToken = apiToken;
            this.isInitialized = true;
            
            console.log('ESPN API initialized successfully');
            return true;
        } catch (error) {
            console.error('Failed to initialize ESPN API:', error);
            return false;
        }
    }

    // Fetch transfer news from ESPN
    async fetchTransferNews() {
        if (!this.isInitialized) {
            throw new Error('ESPN API not initialized. Please provide an API token first.');
        }

        try {
            // Prepare Actor input
            const input = {
                "startUrls": [
                    {
                        "url": "https://africa.espn.com/football/"
                    }
                ],
                "proxyConfiguration": {
                    "useApifyProxy": true
                }
            };

            // Run the Actor and wait for it to finish
            console.log('Starting ESPN transfer news scraping...');
            const run = await this.client.actor("deloni/espn-football-news-scraper").call(input);

            // Fetch results from the run's dataset
            console.log(`💾 Check your data here: https://console.apify.com/storage/datasets/${run.defaultDatasetId}`);
            const { items } = await this.client.dataset(run.defaultDatasetId).listItems();
            
            // Process and filter transfer-related news
            const transferNews = this.processTransferNews(items);
            
            console.log(`Found ${transferNews.length} transfer-related news items`);
            return transferNews;
            
        } catch (error) {
            console.error('Error fetching transfer news:', error);
            throw error;
        }
    }

    // Process and filter transfer-related news
    processTransferNews(items) {
        const transferKeywords = [
            'transfer', 'signing', 'deal', 'move', 'join', 'leave', 'departure',
            'arrival', 'contract', 'extension', 'loan', 'permanent', 'fee',
            'million', 'euro', 'pound', 'dollar', 'buy', 'sell', 'purchase'
        ];

        return items.filter(item => {
            if (!item.title && !item.description) return false;
            
            const text = `${item.title || ''} ${item.description || ''}`.toLowerCase();
            return transferKeywords.some(keyword => text.includes(keyword));
        }).map(item => ({
            id: Date.now() + Math.random(),
            title: item.title || 'Transfer News',
            description: item.description || '',
            url: item.url || '',
            publishedAt: item.publishedAt || new Date().toISOString(),
            source: 'ESPN',
            type: 'news'
        }));
    }

    // Convert news to transfer format for the app
    convertNewsToTransfers(newsItems) {
        return newsItems.map(news => {
            // Extract potential transfer information from news
            const transferInfo = this.extractTransferInfo(news.title + ' ' + news.description);
            
            return {
                id: news.id,
                player: {
                    name: transferInfo.playerName || 'Unknown Player',
                    age: transferInfo.age || 25,
                    position: transferInfo.position || 'Unknown',
                    currentAbility: transferInfo.currentAbility || 150,
                    potentialAbility: transferInfo.potentialAbility || 160,
                    contractYears: transferInfo.contractYears || 3,
                    reputation: transferInfo.reputation || 15
                },
                sellingClub: transferInfo.sellingClub || 'Unknown Club',
                buyingClub: transferInfo.buyingClub || 'Unknown Club',
                transferFee: transferInfo.transferFee || 0,
                leagueLevel: transferInfo.leagueLevel || 1,
                transferType: 'AI',
                transferDate: new Date(news.publishedAt).toISOString().split('T')[0],
                newsSource: news.url,
                newsTitle: news.title
            };
        });
    }

    // Extract transfer information from news text
    extractTransferInfo(text) {
        const info = {};
        
        // Extract player names (common patterns)
        const playerNameMatch = text.match(/(?:signs|joins|moves|transfers?)\s+(?:to|for)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i);
        if (playerNameMatch) {
            info.playerName = playerNameMatch[1];
        }

        // Extract transfer fees
        const feeMatch = text.match(/(?:€|£|\$)?(\d+(?:\.\d+)?)\s*(?:million|m|billion|b)/i);
        if (feeMatch) {
            info.transferFee = parseFloat(feeMatch[1]);
        }

        // Extract clubs
        const clubMatch = text.match(/(?:from|at)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i);
        if (clubMatch) {
            info.sellingClub = clubMatch[1];
        }

        const buyingClubMatch = text.match(/(?:to|joins|signs\s+for)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i);
        if (buyingClubMatch) {
            info.buyingClub = buyingClubMatch[1];
        }

        return info;
    }

    // Get API status
    getStatus() {
        return {
            initialized: this.isInitialized,
            hasToken: !!this.apiToken
        };
    }
}

// Global instance
window.espnAPI = new ESPNTransferAPI();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ESPNTransferAPI;
} 