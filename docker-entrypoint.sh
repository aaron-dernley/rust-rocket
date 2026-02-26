#!/bin/bash
set -e

./rust-rocket &
BACKEND_PID=$!

node frontend/server.js &
FRONTEND_PID=$!

wait -n $BACKEND_PID $FRONTEND_PID
