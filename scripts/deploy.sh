#!/usr/bin/env bash
# Deploy da API usando o container publicado no GitHub Container Registry (GHCR).
# Roda no servidor (ou no seu computador). Requer Docker e curl instalados.
#
# Uso:
#   bash scripts/deploy.sh
#   IMAGE=ghcr.io/arthursperb/todo-api-devops:sha-abc1234 bash scripts/deploy.sh
set -euo pipefail

IMAGE="${IMAGE:-ghcr.io/arthursperb/todo-api-devops:latest}"
NAME="todo-api"
PORT="${PORT:-3000}"

echo ">> Baixando a imagem $IMAGE"
docker pull "$IMAGE"

echo ">> Removendo a versão anterior (se existir)"
docker rm -f "$NAME" >/dev/null 2>&1 || true

echo ">> Iniciando o novo container"
docker run -d \
  --name "$NAME" \
  --restart unless-stopped \
  -p "${PORT}:3000" \
  "$IMAGE"

echo ">> Verificando se a API subiu"
for i in $(seq 1 15); do
  if curl -fsS "http://localhost:${PORT}/health" >/dev/null 2>&1; then
    echo "Deploy concluído: API respondendo na porta ${PORT}."
    exit 0
  fi
  sleep 2
done

echo "A API não respondeu. Últimos logs do container:"
docker logs --tail 50 "$NAME"
exit 1
