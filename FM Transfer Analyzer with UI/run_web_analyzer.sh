#!/bin/bash

# FM Transfer Analyzer Web Interface Launcher
echo "🚀 Launching FM Transfer Analyzer Web Interface..."

# Get the current directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Path to the HTML file
HTML_FILE="$SCRIPT_DIR/web_analyzer.html"

# Check if the HTML file exists
if [ ! -f "$HTML_FILE" ]; then
    echo "❌ Error: web_analyzer.html not found in $SCRIPT_DIR"
    exit 1
fi

# Open the HTML file in the default browser
echo "📊 Opening web interface in your default browser..."
echo "📍 File location: $HTML_FILE"

# Try different commands to open the browser
if command -v open >/dev/null 2>&1; then
    # macOS
    open "$HTML_FILE"
elif command -v xdg-open >/dev/null 2>&1; then
    # Linux
    xdg-open "$HTML_FILE"
elif command -v start >/dev/null 2>&1; then
    # Windows
    start "$HTML_FILE"
else
    echo "⚠️  Could not automatically open browser. Please manually open:"
    echo "   $HTML_FILE"
fi

echo "✅ Web interface launched!"
echo ""
echo "🎯 Features available:"
echo "   • Dark blue FM-style UI"
echo "   • Automatic regen detection"
echo "   • Real-time transfer data import"
echo "   • Advanced market analysis"
echo "   • Transfer discrepancy detection"
echo ""
echo "🌐 If the browser didn't open automatically, please open:"
echo "   file://$HTML_FILE" 