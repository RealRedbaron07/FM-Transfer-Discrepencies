# FM Transfer Analyzer Pro - Chrome Extension

## Overview

FM Transfer Analyzer Pro is a professional Chrome extension that provides comprehensive transfer analysis and scouting tools for Football Manager players. The extension works both as a standalone web app and as a Chrome extension with enhanced features.

## Features

### 🎯 **Core Features**
- **Transfer Analysis**: Analyze transfer fees, player values, and market trends
- **Player Scouting**: Scout players with detailed statistics and asking prices
- **Market Insights**: Get real-time market trends and undervalued positions
- **Transfer Slots**: Manage your transfer budget with limited slots
- **Premium Features**: Advanced scouting and market analysis for subscribers

### 🔧 **Extension Features**
- **Chrome Integration**: Works as a popup and new tab replacement
- **Background Sync**: Data persists across browser sessions
- **Badge Notifications**: Shows transfer count in extension badge
- **API Integration**: Direct access to SportMonks API for real transfer data
- **Offline Support**: Works without internet connection

## Installation

### Chrome Extension
1. Download the extension files
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the extension folder
5. The extension will appear in your toolbar

### Web App
1. Open `index.html` in any modern browser
2. All features work without installation

## Usage

### Getting Started
1. **Open the Extension**: Click the extension icon in your toolbar
2. **Configure API**: Go to the API tab and enter your SportMonks API token
3. **Start Scouting**: Use the Scouting tab to find players
4. **Analyze Transfers**: View transfer history and market trends

### Premium Features
- **Advanced Scouting**: Detailed player statistics and market analysis
- **Market Insights**: Real-time market trends and position analysis
- **Extended Limits**: 20 transfer slots and 25 scouted players
- **Priority Support**: Direct access to customer support

## Subscription Plans

### Free Plan
- 5 transfer slots
- 10 scouted players
- Basic analysis
- Standard scouting

### Monthly Pro - $9.99/month
- 20 transfer slots
- 25 scouted players
- Advanced scouting
- Market insights
- Priority support

### Yearly Pro - $99.99/year (17% savings)
- All Monthly Pro features
- Annual billing discount

### Lifetime Pro - $299.99 (75% savings)
- All features forever
- One-time payment

## API Integration

### SportMonks API
The extension integrates with SportMonks API for real transfer data:
- Real transfer records
- Player statistics
- Club information
- Market trends

### Setup
1. Get a SportMonks API token from [SportMonks](https://www.sportmonks.com/)
2. Enter the token in the API tab
3. Test the connection
4. Start importing real transfer data

## Technical Details

### Architecture
- **Manifest V3**: Modern Chrome extension architecture
- **Background Script**: Handles API calls and data management
- **Content Script**: Manages popup communication
- **Storage**: Chrome storage for extension, localStorage for web

### Data Management
- **Transfer Data**: Stored locally for privacy
- **User Preferences**: Saved across sessions
- **API Tokens**: Securely stored in extension storage
- **Sync**: Data syncs across browser sessions

### Security
- **Local Storage**: All data stored locally
- **API Security**: Tokens never shared with third parties
- **Privacy**: No data sent to external servers except API calls
- **HTTPS**: All API calls use secure connections

## Development

### File Structure
```
fm-transfer-analyzer/
├── manifest.json          # Extension manifest
├── background.js          # Background script
├── content.js            # Content script
├── index.html            # Main interface
├── app.js                # Main application logic
├── sportmonks-api.js     # API integration
├── styles.css            # Styling
├── icons/                # Extension icons
└── README files
```

### Building
1. No build process required
2. All files are ready to use
3. Load directly into Chrome

### Customization
- Modify `styles.css` for theme changes
- Update `app.js` for feature additions
- Edit `manifest.json` for extension settings

## Troubleshooting

### Common Issues
1. **Extension not loading**: Check Chrome extension permissions
2. **API errors**: Verify SportMonks API token
3. **Data not saving**: Check storage permissions
4. **UI issues**: Clear browser cache

### Support
- **Free Users**: Community support
- **Premium Users**: Priority support via extension
- **Bug Reports**: Submit via extension feedback

## Roadmap

### Upcoming Features
- **Mobile App**: iOS and Android versions
- **Cloud Sync**: Cross-device data synchronization
- **Advanced Analytics**: Machine learning-powered insights
- **Team Integration**: Direct FM save file integration
- **Social Features**: Share transfers and scouting reports

### Version History
- **v1.0.0**: Initial release with core features
- **v1.1.0**: Premium features and subscription system
- **v1.2.0**: Advanced scouting and market insights
- **v1.3.0**: Extension optimization and performance improvements

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- **Email**: support@fmtransferanalyzer.com
- **Discord**: Join our community server
- **Documentation**: See EXTENSION_README.md for detailed guides

---

**FM Transfer Analyzer Pro** - The ultimate tool for Football Manager transfer analysis and scouting. 