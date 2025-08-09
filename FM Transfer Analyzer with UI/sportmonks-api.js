// SportMonks API Integration Module
// This module handles the SportMonks API integration for structured transfer data

class SportMonksTransferAPI {
    constructor() {
        this.apiToken = null;
        this.baseUrl = 'https://api.sportmonks.com/v3/football';
        this.isInitialized = false;
    }

    // Initialize the API with token
    async initialize(apiToken) {
        try {
            this.apiToken = apiToken;
            this.isInitialized = true;
            
            // Test the connection
            const testResponse = await this.makeRequest('/transfers?api_token=' + apiToken);
            if (testResponse && testResponse.data) {
                console.log('SportMonks API initialized successfully');
                return true;
            } else {
                throw new Error('Invalid API response');
            }
        } catch (error) {
            console.error('Failed to initialize SportMonks API:', error);
            this.isInitialized = false;
            return false;
        }
    }

    // Make HTTP request to SportMonks API
    async makeRequest(endpoint) {
        if (!this.isInitialized) {
            throw new Error('SportMonks API not initialized. Please provide an API token first.');
        }

        try {
            const url = `${this.baseUrl}${endpoint}`;
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error making API request:', error);
            throw error;
        }
    }

    // Fetch transfers with pagination and filtering
    async fetchTransfers(options = {}) {
        const {
            page = 1,
            perPage = 25,
            include = 'player,from_team,to_team',
            filters = {}
        } = options;

        try {
            let url = `/transfers?api_token=${this.apiToken}&page=${page}&per_page=${perPage}&include=${include}`;
            
            // Add filters
            if (filters.season_id) url += `&filters=season_id:${filters.season_id}`;
            if (filters.player_id) url += `&filters=player_id:${filters.player_id}`;
            if (filters.from_team_id) url += `&filters=from_team_id:${filters.from_team_id}`;
            if (filters.to_team_id) url += `&filters=to_team_id:${filters.to_team_id}`;
            if (filters.date_from) url += `&filters=date_from:${filters.date_from}`;
            if (filters.date_to) url += `&filters=date_to:${filters.date_to}`;

            console.log('Fetching transfers from SportMonks API...');
            const response = await this.makeRequest(url);
            
            return this.processTransfersResponse(response);
        } catch (error) {
            console.error('Error fetching transfers:', error);
            throw error;
        }
    }

    // Process the API response and convert to our format
    processTransfersResponse(response) {
        console.log('Raw API response:', response);
        
        if (!response.data) {
            console.log('No data in response');
            return { transfers: [], pagination: null };
        }

        console.log('Processing', response.data.length, 'transfers');
        const transfers = response.data.map(transfer => {
            console.log('Processing transfer:', transfer);
            return this.convertTransferToAppFormat(transfer);
        });
        const pagination = response.pagination || null;

        console.log('Converted transfers:', transfers);
        return { transfers, pagination };
    }

    // Convert SportMonks transfer format to app format
    convertTransferToAppFormat(transfer) {
        const player = transfer.player || {};
        const fromTeam = transfer.from_team || {};
        const toTeam = transfer.to_team || {};

        console.log('Converting transfer:', {
            id: transfer.id,
            player: player,
            fromTeam: fromTeam,
            toTeam: toTeam,
            fee: transfer.fee,
            date: transfer.date
        });

        const convertedTransfer = {
            id: transfer.id,
            player: {
                name: player.display_name || player.name || 'Unknown Player',
                age: this.calculateAge(player.date_of_birth),
                position: this.mapPosition(player.position_id),
                currentAbility: this.estimateAbility(player.height, player.weight, player.age),
                potentialAbility: this.estimatePotential(player.age, player.position_id),
                contractYears: transfer.contract_years || 3,
                reputation: this.estimateReputation(transfer.fee, player.age)
            },
            sellingClub: fromTeam.name || 'Unknown Club',
            buyingClub: toTeam.name || 'Unknown Club',
            transferFee: this.parseTransferFee(transfer.fee),
            leagueLevel: this.determineLeagueLevel(fromTeam.country_id, toTeam.country_id),
            transferType: 'AI',
            transferDate: transfer.date || new Date().toISOString().split('T')[0],
            sportmonksId: transfer.id,
            playerId: player.id,
            fromTeamId: fromTeam.id,
            toTeamId: toTeam.id,
            transferType: transfer.type || 'permanent',
            season: transfer.season_id
        };

        console.log('Converted transfer:', convertedTransfer);
        return convertedTransfer;
    }

    // Helper methods for data conversion
    calculateAge(dateOfBirth) {
        if (!dateOfBirth) return 25;
        const birthDate = new Date(dateOfBirth);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }

    mapPosition(positionId) {
        const positionMap = {
            1: 'GK', 2: 'CB', 3: 'LB', 4: 'RB', 5: 'DM', 6: 'CM', 7: 'AM', 8: 'LW', 9: 'RW', 10: 'ST'
        };
        return positionMap[positionId] || 'Unknown';
    }

    estimateAbility(height, weight, age) {
        // Simple estimation based on age and physical attributes
        let baseAbility = 150;
        if (age <= 23) baseAbility += 10;
        if (age >= 30) baseAbility -= 10;
        if (height > 180) baseAbility += 5;
        if (weight > 75) baseAbility += 5;
        return Math.min(200, Math.max(100, baseAbility));
    }

    estimatePotential(currentAge, positionId) {
        let potential = this.estimateAbility(null, null, currentAge);
        if (currentAge <= 21) potential += 20;
        else if (currentAge <= 24) potential += 10;
        else if (currentAge >= 28) potential -= 10;
        return Math.min(200, Math.max(100, potential));
    }

    estimateReputation(fee, age) {
        if (!fee) return 15;
        const feeValue = this.parseTransferFee(fee);
        if (feeValue > 50) return 19;
        if (feeValue > 30) return 18;
        if (feeValue > 15) return 17;
        if (feeValue > 5) return 16;
        return 15;
    }

    parseTransferFee(feeString) {
        console.log('Parsing transfer fee:', feeString);
        
        if (!feeString) {
            console.log('No fee string, returning 0');
            return 0;
        }
        
        // Remove currency symbols and convert to number
        const cleanFee = feeString.replace(/[€£$,\s]/g, '');
        const fee = parseFloat(cleanFee);
        
        console.log('Cleaned fee:', cleanFee, 'Parsed fee:', fee);
        
        let result;
        // Handle different units (million, billion, etc.)
        if (feeString.toLowerCase().includes('billion') || feeString.toLowerCase().includes('b')) {
            result = fee * 1000;
        } else if (feeString.toLowerCase().includes('million') || feeString.toLowerCase().includes('m')) {
            result = fee;
        } else {
            result = fee / 1000000; // Assume it's in base currency
        }
        
        console.log('Final parsed fee:', result);
        return result;
    }

    determineLeagueLevel(fromCountryId, toCountryId) {
        // Top leagues (England, Spain, Germany, Italy, France)
        const topLeagues = [1, 2, 3, 4, 5];
        if (topLeagues.includes(fromCountryId) || topLeagues.includes(toCountryId)) {
            return 1;
        }
        // Second tier leagues
        const secondTier = [6, 7, 8, 9, 10];
        if (secondTier.includes(fromCountryId) || secondTier.includes(toCountryId)) {
            return 2;
        }
        return 3;
    }

    // Fetch additional data
    async fetchSeasons() {
        try {
            const response = await this.makeRequest(`/seasons?api_token=${this.apiToken}`);
            return response.data || [];
        } catch (error) {
            console.error('Error fetching seasons:', error);
            return [];
        }
    }

    async fetchTeams(seasonId = null) {
        try {
            let url = `/teams?api_token=${this.apiToken}`;
            if (seasonId) url += `&filters=season_id:${seasonId}`;
            
            const response = await this.makeRequest(url);
            return response.data || [];
        } catch (error) {
            console.error('Error fetching teams:', error);
            return [];
        }
    }

    async fetchPlayers(teamId = null) {
        try {
            let url = `/players?api_token=${this.apiToken}`;
            if (teamId) url += `&filters=team_id:${teamId}`;
            
            const response = await this.makeRequest(url);
            return response.data || [];
        } catch (error) {
            console.error('Error fetching players:', error);
            return [];
        }
    }

    // Get API status
    getStatus() {
        return {
            initialized: this.isInitialized,
            hasToken: !!this.apiToken,
            baseUrl: this.baseUrl
        };
    }
}

// Global instance
window.sportmonksAPI = new SportMonksTransferAPI();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SportMonksTransferAPI;
} 