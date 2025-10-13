@echo off
REM Arachchi Spicy Management System - Team Setup Script for Windows
REM This script helps new team members set up the development environment

echo 🚀 Setting up Arachchi Spicy Management System for team collaboration...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js (v14 or higher) first.
    echo    Download from: https://nodejs.org/
    pause
    exit /b 1
)

REM Check if Git is installed
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Git is not installed. Please install Git first.
    echo    Download from: https://git-scm.com/
    pause
    exit /b 1
)

echo ✅ Prerequisites check passed!

REM Install server dependencies
echo 📦 Installing server dependencies...
cd server
if not exist "node_modules" (
    npm install
    if %errorlevel% equ 0 (
        echo ✅ Server dependencies installed successfully!
    ) else (
        echo ❌ Failed to install server dependencies
        pause
        exit /b 1
    )
) else (
    echo ✅ Server dependencies already installed
)

REM Install client dependencies
echo 📦 Installing client dependencies...
cd ..\client
if not exist "node_modules" (
    npm install
    if %errorlevel% equ 0 (
        echo ✅ Client dependencies installed successfully!
    ) else (
        echo ❌ Failed to install client dependencies
        pause
        exit /b 1
    )
) else (
    echo ✅ Client dependencies already installed
)

cd ..

echo.
echo 🎉 Setup completed successfully!
echo.
echo 📋 Next steps:
echo 1. Start the backend server:
echo    cd server ^&^& npm start
echo.
echo 2. Start the frontend server (in a new terminal):
echo    cd client ^&^& npm start
echo.
echo 3. Access the application:
echo    Frontend: http://localhost:3000
echo    Backend: http://localhost:5000
echo.
echo 4. Read the team collaboration guide:
echo    TEAM_COLLABORATION_GUIDE.md
echo.
echo 🤝 Happy coding with your team!
pause
