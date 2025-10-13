#!/bin/bash

# Arachchi Spicy Management System - Team Setup Script
# This script helps new team members set up the development environment

echo "🚀 Setting up Arachchi Spicy Management System for team collaboration..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js (v14 or higher) first."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

# Check if Git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git first."
    echo "   Download from: https://git-scm.com/"
    exit 1
fi

echo "✅ Prerequisites check passed!"

# Install server dependencies
echo "📦 Installing server dependencies..."
cd server
if [ ! -d "node_modules" ]; then
    npm install
    if [ $? -eq 0 ]; then
        echo "✅ Server dependencies installed successfully!"
    else
        echo "❌ Failed to install server dependencies"
        exit 1
    fi
else
    echo "✅ Server dependencies already installed"
fi

# Install client dependencies
echo "📦 Installing client dependencies..."
cd ../client
if [ ! -d "node_modules" ]; then
    npm install
    if [ $? -eq 0 ]; then
        echo "✅ Client dependencies installed successfully!"
    else
        echo "❌ Failed to install client dependencies"
        exit 1
    fi
else
    echo "✅ Client dependencies already installed"
fi

cd ..

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Start the backend server:"
echo "   cd server && npm start"
echo ""
echo "2. Start the frontend server (in a new terminal):"
echo "   cd client && npm start"
echo ""
echo "3. Access the application:"
echo "   Frontend: http://localhost:3000"
echo "   Backend: http://localhost:5000"
echo ""
echo "4. Read the team collaboration guide:"
echo "   TEAM_COLLABORATION_GUIDE.md"
echo ""
echo "🤝 Happy coding with your team!"
