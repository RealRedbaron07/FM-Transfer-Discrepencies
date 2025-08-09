# SportMonks API Integration for FM Transfer Analyzer

## Overview

This integration adds structured transfer data capabilities to the FM Transfer Analyzer using the SportMonks API. The API provides comprehensive transfer information including player details, team information, transfer fees, and more.

## Features

- **Structured Data**: Access to comprehensive transfer information from SportMonks
- **Player Details**: Complete player profiles with age, position, and abilities
- **Team Information**: Detailed club and league data
- **Filtering Options**: Filter by season, date range, teams, and players
- **Seamless Integration**: Imported transfers are added to your existing database
- **Consistent UI**: Maintains the same dark blue/purple theme throughout
- **Error Handling**: Comprehensive error handling and user feedback

## Setup Instructions

### 1. Get a SportMonks API Token

1. Go to [SportMonks](https://www.sportmonks.com/)
2. Create an account or sign in
3. Navigate to your account settings
4. Copy your API token

### 2. Configure the API

1. Open the FM Transfer Analyzer
2. Navigate to the **API** tab
3. Enter your SportMonks API token in the configuration section
4. Click "Save Token"
5. Click "Test Connection" to verify the setup

### 3. Import Transfer Data

1. In the API tab, configure filters (optional):
   - Select a specific season
   - Set date range for transfers
2. Click "Fetch Transfer Data"
3. The system will:
   - Fetch structured transfer data from SportMonks
   - Include player details, team information, and transfer fees
   - Convert to your app's transfer format
   - Add them to your database

## API Components

### SportMonksTransferAPI Class (`sportmonks-api.js`)

The main API integration class that handles:

- **Initialization**: Sets up the SportMonks API client
- **Data Fetching**: Retrieves transfers, seasons, teams, and players
- **Data Processing**: Converts SportMonks format to app format
- **Filtering**: Supports various filter options

### Key Methods

```javascript
// Initialize the API
await sportmonksAPI.initialize(apiToken)

// Fetch transfers with filters
const result = await sportmonksAPI.fetchTransfers({
    page: 1,
    perPage: 50,
    filters: { season_id: 123, date_from: '2023-01-01' }
})

// Fetch additional data
const seasons = await sportmonksAPI.fetchSeasons()
const teams = await sportmonksAPI.fetchTeams(seasonId)
const players = await sportmonksAPI.fetchPlayers(teamId)
```

## Data Flow

1. **Authentication**: Initialize with SportMonks API token
2. **Data Fetching**: Retrieve transfer data with optional filters
3. **Data Processing**: Convert SportMonks format to app format
4. **Data Conversion**: Map positions, calculate ages, estimate abilities
5. **Integration**: Add transfers to the main database

## Available Filters

- **Season**: Filter by specific football season
- **Date Range**: Filter by transfer date (from/to)
- **Player**: Filter by specific player ID
- **From Team**: Filter by selling club
- **To Team**: Filter by buying club

## Data Mapping

The integration maps SportMonks data to your app's format:

- **Player Names**: Uses display_name or name
- **Positions**: Maps position IDs to readable positions (GK, CB, ST, etc.)
- **Ages**: Calculated from date of birth
- **Abilities**: Estimated based on age and physical attributes
- **Transfer Fees**: Parsed and converted to millions
- **League Levels**: Determined by country/league tier

## Color Theme Consistency

The integration maintains the existing dark blue/purple theme:

- **Primary Background**: `#0a0e1a`
- **Secondary Background**: `#1a1f2e`
- **Accent Blue**: `#4a90e2`
- **Accent Purple**: `#8b5cf6`
- **Success Green**: `#10b981`
- **Error Red**: `#ef4444`

## Error Handling

The integration includes comprehensive error handling:

- **API Token Validation**: Checks for valid API token
- **Connection Testing**: Verifies API connectivity
- **User Feedback**: Clear notifications for all operations
- **Graceful Degradation**: Continues working even if API fails

## Testing

Use the `test-sportmonks-api.html` file to test the API integration:

1. Open `test-sportmonks-api.html` in your browser
2. Enter your SportMonks API token
3. Test initialization, seasons fetching, and transfer data
4. View results in real-time

## Troubleshooting

### Common Issues

1. **"API Token Not Set"**
   - Make sure you've entered your SportMonks API token
   - Click "Save Token" after entering

2. **"Connection Failed"**
   - Verify your API token is correct
   - Check your internet connection
   - Ensure you have sufficient SportMonks credits

3. **"No Transfers Found"**
   - Try adjusting your filters (season, date range)
   - Check if the selected season has transfer data
   - Try without filters to see all available transfers

### Getting Help

- Check the browser console for detailed error messages
- Verify your SportMonks account has sufficient credits
- Ensure your API token has the necessary permissions

## Security Notes

- API tokens are stored locally in browser localStorage
- No tokens are transmitted to external servers except SportMonks
- All API calls are made directly from the browser

## Future Enhancements

- Support for multiple data sources
- Advanced filtering options
- Real-time transfer notifications
- Export functionality for API data
- Custom data mapping options
- Batch import capabilities

## Technical Details

### Dependencies

- **Fetch API**: For HTTP requests
- **Chart.js**: For data visualization (existing)
- **Font Awesome**: For icons (existing)

### Browser Compatibility

- Modern browsers with ES6+ support
- Requires HTTPS for API calls (SportMonks requirement)
- Local storage for token persistence

### Performance

- Asynchronous API calls
- Efficient data processing
- Minimal impact on existing functionality
- Responsive UI updates
- Pagination support for large datasets

## API Endpoints Used

- `/transfers` - Get transfer data
- `/seasons` - Get available seasons
- `/teams` - Get team information
- `/players` - Get player details

## Data Quality

SportMonks provides high-quality structured data:

- **Accuracy**: Official transfer records
- **Completeness**: Full player and team details
- **Timeliness**: Regular updates
- **Consistency**: Standardized data format 