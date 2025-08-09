@echo off
echo ========================================
echo    FM Transfer Analyzer Launcher
echo ========================================
echo.

echo Checking Java installation...
java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Java is not installed or not in PATH
    echo Please install Java from: https://adoptium.net/
    echo.
    pause
    exit /b 1
)

echo Java found! Compiling application...
javac FmTransferAnalyzer.java
if %errorlevel% neq 0 (
    echo ERROR: Compilation failed
    echo Make sure FmTransferAnalyzer.java is in this folder
    echo.
    pause
    exit /b 1
)

echo Compilation successful! Starting analyzer...
echo.
echo ========================================
echo    Football Manager Transfer Analyzer
echo ========================================
echo.
java FmTransferAnalyzer

echo.
echo Press any key to exit...
pause >nul 