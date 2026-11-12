#!/bin/bash
set -e

API_URL=${API_URL:-http://localhost:5097}

echo "==> Building .NET API..."
cd lsf-api
dotnet publish -c Release -o publish
cd ..

echo "==> Building Next.js frontend (API_URL=$API_URL)..."
cd lsf-web
npm ci
NEXT_PUBLIC_API_URL=$API_URL npm run build
cd ..

echo "==> Build done. Lance 'docker compose up --build' pour démarrer."
