#!/usr/bin/env bash
# Teste rápido de fumaça: confirma que a API está no ar e responde às rotas principais.
# Uso: bash scripts/smoke-test.sh [URL_BASE]   (padrão: http://localhost:3000)
set -euo pipefail

BASE="${1:-http://localhost:3000}"

echo ">> Aguardando a API em $BASE ..."
for i in $(seq 1 20); do
  if curl -fsS "$BASE/health" >/dev/null 2>&1; then
    break
  fi
  if [ "$i" -eq 20 ]; then
    echo "A API não respondeu a tempo."
    exit 1
  fi
  sleep 2
done

echo ">> GET /health"
curl -fsS "$BASE/health"
echo

echo ">> POST /tasks"
resp=$(curl -fsS -X POST "$BASE/tasks" -H 'Content-Type: application/json' -d '{"title":"tarefa de teste do deploy"}')
echo "$resp"
id=$(echo "$resp" | sed -n 's/.*"id":\([0-9]*\).*/\1/p')
if [ -z "$id" ]; then
  echo "Não foi possível ler o id da tarefa criada."
  exit 1
fi

echo ">> GET /tasks/$id"
curl -fsS "$BASE/tasks/$id"
echo

echo ">> DELETE /tasks/$id"
curl -fsS -o /dev/null -X DELETE "$BASE/tasks/$id"

echo "Smoke test OK"
