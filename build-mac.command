#!/bin/bash
set -e
cd "$(dirname "$0")"
echo "[1/3] Installing dependencies..."
npm install
echo "[2/3] Building macOS application..."
npm run dist:mac
echo "[3/3] Finished. Check the dist folder."
open dist
