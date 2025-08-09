#!/bin/bash

echo "========================================"
echo "   FM Transfer Analyzer Portfolio App"
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

echo "Java found! Compiling portfolio application..."
javac Portfolio_App_Complete.java
if [ $? -ne 0 ]; then
    echo "ERROR: Compilation failed"
    echo "Make sure Portfolio_App_Complete.java is in this folder"
    echo
    read -p "Press Enter to exit..."
    exit 1
fi

echo "Compilation successful! Starting portfolio app..."
echo
echo "========================================"
echo "   Portfolio Application Launched"
echo "========================================"
echo
java Portfolio_App_Complete

echo
echo "Press Enter to exit..."
read 