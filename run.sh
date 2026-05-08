#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}   CollegeHub - Starting Application    ${NC}"
echo -e "${CYAN}========================================${NC}"

# Get the directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/backend"
FRONTEND_DIR="$SCRIPT_DIR/frontend"

# Function to cleanup background processes on exit
cleanup() {
    echo -e "\n${YELLOW}Shutting down servers...${NC}"
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set trap to handle Ctrl+C
trap cleanup SIGINT SIGTERM

# Check if node_modules exists for backend
if [ ! -d "$BACKEND_DIR/node_modules" ]; then
    echo -e "${YELLOW}Installing backend dependencies...${NC}"
    cd "$BACKEND_DIR"
    npm install
fi

# Check if node_modules exists for frontend
if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
    echo -e "${YELLOW}Installing frontend dependencies...${NC}"
    cd "$FRONTEND_DIR"
    npm install
fi

echo -e "\n${GREEN}Starting Backend Server (Port 5001)...${NC}"
cd "$BACKEND_DIR"
npx tsx src/server.ts &
BACKEND_PID=$!
echo -e "${CYAN}Backend PID: $BACKEND_PID${NC}"

# Wait for backend to start
sleep 5

echo -e "\n${GREEN}Starting Frontend Server (Port 5173)...${NC}"
cd "$FRONTEND_DIR"
npm run dev &
FRONTEND_PID=$!
echo -e "${CYAN}Frontend PID: $FRONTEND_PID${NC}"

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}   Application Started Successfully!   ${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "\n${CYAN}Backend:${NC}  http://localhost:5001"
echo -e "${CYAN}Frontend:${NC} http://localhost:5173"
echo -e "${CYAN}Health:${NC}   http://localhost:5001/api/health"
echo -e "\n${YELLOW}Press Ctrl+C to stop both servers${NC}\n"

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID