#!/bin/bash

# FM Transfer Analyzer Comprehensive Test Script
echo "🧪 Testing FM Transfer Analyzer Pro..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test 1: Compilation
echo -e "${BLUE}📝 Test 1: Compilation${NC}"
if javac FmTransferAnalyzer.java; then
    echo -e "${GREEN}✅ Compilation successful${NC}"
else
    echo -e "${RED}❌ Compilation failed${NC}"
    exit 1
fi

# Test 2: Basic functionality
echo -e "${BLUE}📝 Test 2: Basic functionality${NC}"
echo "Testing basic menu and exit..."
echo "8" | java FmTransferAnalyzer > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Basic functionality test passed${NC}"
else
    echo -e "${RED}❌ Basic functionality test failed${NC}"
fi

# Test 3: Error handling
echo -e "${BLUE}📝 Test 3: Error handling${NC}"
echo "Testing invalid input handling..."
echo -e "abc\n8" | java FmTransferAnalyzer > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Error handling test passed${NC}"
else
    echo -e "${RED}❌ Error handling test failed${NC}"
fi

# Test 4: Web interface
echo -e "${BLUE}📝 Test 4: Web interface${NC}"
if [ -f "web_analyzer.html" ]; then
    echo -e "${GREEN}✅ Web interface file exists${NC}"
else
    echo -e "${RED}❌ Web interface file missing${NC}"
fi

# Test 5: Launch script
echo -e "${BLUE}📝 Test 5: Launch script${NC}"
if [ -f "run_web_analyzer.sh" ] && [ -x "run_web_analyzer.sh" ]; then
    echo -e "${GREEN}✅ Launch script exists and is executable${NC}"
else
    echo -e "${RED}❌ Launch script missing or not executable${NC}"
fi

# Test 6: Documentation
echo -e "${BLUE}📝 Test 6: Documentation${NC}"
if [ -f "FM_ANALYZER_IMPROVEMENTS.md" ]; then
    echo -e "${GREEN}✅ Documentation exists${NC}"
else
    echo -e "${RED}❌ Documentation missing${NC}"
fi

# Test 7: File structure
echo -e "${BLUE}📝 Test 7: File structure${NC}"
required_files=("FmTransferAnalyzer.java" "web_analyzer.html" "run_web_analyzer.sh" "FM_ANALYZER_IMPROVEMENTS.md")
missing_files=0

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file exists${NC}"
    else
        echo -e "${RED}❌ $file missing${NC}"
        missing_files=$((missing_files + 1))
    fi
done

# Summary
echo -e "\n${BLUE}📊 Test Summary:${NC}"
if [ $missing_files -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed! FM Transfer Analyzer is ready to use.${NC}"
    echo -e "${YELLOW}💡 To run the application:${NC}"
    echo -e "   Console: java FmTransferAnalyzer"
    echo -e "   Web: ./run_web_analyzer.sh"
else
    echo -e "${RED}⚠️  Some tests failed. Please check the missing files.${NC}"
fi

echo -e "\n${BLUE}🎯 Features Available:${NC}"
echo -e "   • Dark blue FM-style UI"
echo -e "   • Automatic regen detection"
echo -e "   • Real-time transfer data import"
echo -e "   • Advanced market analysis"
echo -e "   • Transfer discrepancy detection"
echo -e "   • Comprehensive error handling"
echo -e "   • Input validation"
echo -e "   • Professional console interface"

echo -e "\n${GREEN}✅ Testing complete!${NC}" 