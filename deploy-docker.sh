#!/usr/bin/env bash
set -e

IMAGE_NAME="salesroomai"
CONTAINER_NAME="salesroomai"

echo ">> Build de l'image Docker..."
docker build -t "$IMAGE_NAME" .

echo ">> Stop / suppression éventuelle de l'ancien conteneur..."
if [ "$(docker ps -aq -f name=$CONTAINER_NAME)" ]; then
  docker stop "$CONTAINER_NAME" || true
  docker rm "$CONTAINER_NAME" || true
fi

echo ">> Lancement du nouveau conteneur..."
docker run -d \
  --env-file .env.docker \
  --name "$CONTAINER_NAME" \
  -p 3000:3000 \
  "$IMAGE_NAME"

echo ">> Conteneur lancé."
echo "Accède à l'app sur: http://localhost:3000 (ou l'IP du serveur sur le port 3000)."
