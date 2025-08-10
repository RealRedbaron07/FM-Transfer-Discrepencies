#!/bin/bash

echo "========================================"
echo "   FM Transfer Analyzer Launcher"
echo "========================================"
echo

echo "Checking Java installation..."
if ! command -v java &> /dev/null; then
    echo "ERROR: Java is not installed or not in PATH"
    echo "Please install Java from: https://adoptium.net/"
    echo
    read -p "Press Enter to exit..."
    exit 1
fi

echo "Java found! Compiling application..."
javac FmTransferAnalyzer.java
if [ $? -ne 0 ]; then
    echo "ERROR: Compilation failed"
    echo "Make sure FmTransferAnalyzer.java is in this folder"
    echo
    read -p "Press Enter to exit..."
    exit 1
fi

echo "Compilation successful! Starting analyzer..."
echo
echo "========================================"
echo "   Football Manager Transfer Analyzer"
echo "========================================"
echo
java FmTransferAnalyzer

echo
echo "Press Enter to exit..."
read 