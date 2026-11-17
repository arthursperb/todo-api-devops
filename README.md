# todo-api-devops

API REST de tarefas (to-do list) em Node.js + Express, criada como projeto da disciplina **DevOps na Prática** (PUCRS Online).
O foco não é a aplicação em si, e sim o ciclo DevOps ao redor dela: integração contínua, testes automatizados e infraestrutura como código.

## Rotas

| Método | Rota | Descrição |
|---|---|---|
| GET | `/health` | Verifica se a API está no ar |
| GET | `/tasks` | Lista as tarefas |
| POST | `/tasks` | Cria uma tarefa (`{"title": "..."}`) |
| GET | `/tasks/:id` | Busca uma tarefa |
| PUT | `/tasks/:id` | Atualiza `title` e/ou `done` |
| DELETE | `/tasks/:id` | Remove a tarefa |

## Rodando localmente

```bash
npm ci
npm start        # http://localhost:3000
npm run lint     # análise estática
npm test         # testes + cobertura
```

## Pipeline CI/CD (GitHub Actions)

Arquivo: `.github/workflows/ci.yml`. Roda a cada push ou pull request nas branches `main` e `fase-2` (a Fase 2 fica na branch `fase-2`):

1. **build-and-test** (Node 20 e 22): `npm ci` → `npm run lint` → `npm test` (com cobertura mínima de 80% das linhas)
2. **terraform-validate**: `terraform fmt -check`, `terraform init -backend=false` e `terraform validate`
3. **docker-build-push** (só em push na `fase-2` ou na `main`, depois dos dois jobs acima): constrói a imagem, sobe o container e roda `scripts/smoke-test.sh`; se passar, publica em `ghcr.io/arthursperb/todo-api-devops` com as tags `latest` e `sha-<commit>`
4. **deploy** (opcional, só se a variável `DEPLOY_ENABLED` for `true`): conecta na EC2 por SSH e roda `scripts/deploy.sh`

## Docker

```bash
# construir e rodar localmente
docker build -t todo-api .
docker run -d --name todo-api -p 3000:3000 todo-api

# ou com Docker Compose
docker compose up -d --build

# usar a imagem publicada pelo pipeline
docker run -d -p 3000:3000 ghcr.io/arthursperb/todo-api-devops:latest

# testar e ver os logs
curl http://localhost:3000/health
bash scripts/smoke-test.sh
docker logs todo-api
```

## Scripts

| Script | Para que serve |
|---|---|
| `scripts/deploy.sh` | Baixa a imagem do GHCR, troca o container e confere a rota `/health` |
| `scripts/smoke-test.sh` | Espera a API subir e testa `/health` e as rotas de tarefas |

## Ligando o deploy automático na EC2

1. Crie a infraestrutura (`terraform apply`, informando `key_name`). O servidor já sobe com Docker instalado.
2. No GitHub: *Settings > Secrets and variables > Actions*. Crie os secrets `EC2_HOST` (IP público) e `EC2_SSH_KEY` (chave privada do key pair) e a variável `DEPLOY_ENABLED` com valor `true`.
3. Em *Packages*, deixe a imagem pública para o servidor baixar sem login.
4. Faça um novo push: o job **deploy** atualiza o servidor.

## Infraestrutura (Terraform)

Pasta `infra/`: cria na AWS uma instância EC2 (Amazon Linux 2023, `t3.micro`, com Docker instalado) e um Security Group que libera a porta da API (3000) e o SSH (22).

```bash
cd infra
cp terraform.tfvars.example terraform.tfvars   # ajuste os valores
terraform init
terraform plan
terraform apply
terraform destroy   # para não gerar custo depois da entrega
```

Requer credenciais da AWS configuradas (`aws configure`).
