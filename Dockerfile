# Imagem da API de tarefas
FROM node:20-alpine

ENV NODE_ENV=production
WORKDIR /app

# Instala só as dependências de produção (camada em cache enquanto o package*.json não mudar)
COPY package*.json ./
RUN npm ci --omit=dev

COPY src ./src

# Roda sem privilégios de administrador
USER node

EXPOSE 3000

# O Docker marca o container como "healthy" ou "unhealthy" usando a rota /health
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "src/server.js"]
