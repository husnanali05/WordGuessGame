#!/bin/bash

echo "🚀 Starting Words Guess Game Development Environment..."
echo ""

# Check if we're in the right directory
if [ ! -d "wordguess-api" ] || [ ! -d "wordguess-web" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    echo "   Make sure you're in the directory containing wordguess-api and wordguess-web folders"
    exit 1
fi

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Error: Python3 is not installed or not in PATH"
    exit 1
fi

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed or not in PATH"
    exit 1
fi

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ Error: npm is not installed or not in PATH"
    exit 1
fi

echo "✅ All dependencies found"
echo ""

# Start both servers
echo "🎮 Starting Flask backend (port 5001)..."
echo "🎨 Starting React frontend (port 5173)..."
echo ""
echo "📱 Frontend will be available at: http://localhost:5173"
echo "🔧 Backend API will be available at: http://127.0.0.1:5001"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Run both servers concurrently
npm run dev
