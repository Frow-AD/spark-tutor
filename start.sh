#!/bin/bash
# Start Kokoro TTS server + Next.js dev server

echo "Starting Kokoro TTS server..."
pkill -f "kokoro-server/server.py" 2>/dev/null
python3 /Users/alex81/.openclaw/workspace/kokoro-server/server.py > /tmp/kokoro.log 2>&1 &
echo "Kokoro running on :5050"

echo "Starting Spark..."
cd "$(dirname "$0")"

# Load .env.local so Next.js/Turbopack picks up ANTHROPIC_API_KEY reliably
if [ -f .env.local ]; then
  export $(grep -v '^#' .env.local | xargs)
fi

npm run dev
