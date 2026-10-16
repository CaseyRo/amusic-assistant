#!/usr/bin/env bash
# Build amusic-assistant and publish it to the Music Assistant server, which
# serves it in place of its bundled frontend (a read-only volume in the Komodo
# stack "music-assistant" mounts this folder over music_assistant_frontend).
set -euo pipefail

HOST="${AMUSIC_HOST:-realnasivm}"
CONTAINER="${AMUSIC_CONTAINER:-music-assistant}"
TARGET="${AMUSIC_TARGET:-/srv/tank/fleetdata/containers/music-assistant/amusic-frontend}"
# must match the mount in the stack's compose
MOUNTED="/app/venv/lib/python3.14/site-packages/music_assistant_frontend"

cd "$(dirname "$0")/.."

# the mount follows the image's Python version; after a server upgrade it can
# point at nothing and the stock UI silently comes back
actual=$(ssh "$HOST" "docker exec $CONTAINER python3 -c 'import music_assistant_frontend as f; print(f.where())'")
if [[ "$actual" != "$MOUNTED" ]]; then
  echo "The server's frontend now lives at $actual, but the stack mounts $MOUNTED." >&2
  echo "Update the volume in the Komodo stack and MOUNTED in this script, then rerun." >&2
  exit 1
fi

pnpm build
rsync -a --delete music_assistant_frontend/ "$HOST:$TARGET/"
echo "Deployed. Reload the app (the PWA service worker may hold the old version until then)."
