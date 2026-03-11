#!/bin/bash

# Start server and client in parallel
echo "Starting server (npm start)..."
cd "$(dirname "$0")/server" && npm start &
SERVER_PID=$!

echo "Starting client (npm run dev)..."
cd "$(dirname "$0")/client" && npm run dev &
CLIENT_PID=$!

# On Ctrl+C, kill both processes
trap "echo 'Stopping...'; kill $SERVER_PID $CLIENT_PID 2>/dev/null; exit 0" SIGINT SIGTERM

echo "Server PID: $SERVER_PID | Client PID: $CLIENT_PID"
echo "Press Ctrl+C to stop both."

wait $SERVER_PID $CLIENT_PID
