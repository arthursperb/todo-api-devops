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

## Pipeline de CI (GitHub Actions)

Arquivo: `.github/workflows/ci.yml`. Roda a cada push ou pull request na `main`:

1. **build-and-test** (Node 20 e 22): `npm ci` → `npm run lint` → `npm test` (com cobertura mínima de 80% das linhas)
2. **terraform-validate**: `terraform fmt -check`, `terraform init -backend=false` e `terraform validate`

## Infraestrutura (Terraform)

Pasta `infra/`: cria na AWS uma instância EC2 (Amazon Linux 2023, `t3.micro`) com um Security Group que libera a porta da API (3000) e o SSH (22).

```bash
cd infra
cp terraform.tfvars.example terraform.tfvars   # ajuste os valores
terraform init
terraform plan
terraform apply
terraform destroy   # para não gerar custo depois da entrega
```

Requer credenciais da AWS configuradas (`aws configure`).
