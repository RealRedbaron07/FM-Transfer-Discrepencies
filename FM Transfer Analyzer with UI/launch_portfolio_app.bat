@echo off
echo ========================================
echo    FM Transfer Analyzer Portfolio App
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

echo Java found! Compiling portfolio application...
javac Portfolio_App_Complete.java
if %errorlevel% neq 0 (
    echo ERROR: Compilation failed
    echo Make sure Portfolio_App_Complete.java is in this folder
    echo.
    pause
    exit /b 1
)

echo Compilation successful! Starting portfolio app...
echo.
echo ========================================
echo    Portfolio Application Launched
echo ========================================
echo.
java Portfolio_App_Complete

echo.
echo Press any key to exit...
pause >nul 