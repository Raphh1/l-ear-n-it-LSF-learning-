#!/bin/bash
# Lance tout le projet en local (base, API, front) : ./start-local.sh
# Arrêt : docker compose -f docker-compose.local.yml down
set -e
cd "$(dirname "$0")"

# npm vient de nvm, absent du PATH des shells non interactifs
if [ -s "$HOME/.nvm/nvm.sh" ]; then
  . "$HOME/.nvm/nvm.sh"
fi

./build.sh
docker compose -f docker-compose.local.yml up -d --build

echo "==> Prêt : http://localhost:8000 (ou le port LSF_PORT de .env)"
