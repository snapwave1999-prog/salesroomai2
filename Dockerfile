# syntax=docker.io/docker/dockerfile:1

# Étape 1 : base Node
# "Node 20-alpine" = Node.js version 20 sur un petit Linux léger.
FROM node:20-alpine AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# Étape 2 : installation des dépendances (les packages Node)
FROM base AS deps
# libc6-compat = petit paquet Linux pour que Node fonctionne bien.
RUN apk add --no-cache libc6-compat
# On copie les fichiers de dépendances
COPY package.json package-lock.json* ./
# On installe les modules Node (node_modules)
RUN npm install

# Étape 3 : build de l'app (création de la version prête pour la prod)
FROM base AS builder
WORKDIR /app
# On récupère les node_modules de l'étape deps
COPY --from=deps /app/node_modules ./node_modules
# On copie tout le code
COPY . .
ENV NODE_ENV=production
# On lance le build Next.js (npm run build)
RUN npm run build

# Étape 4 : image finale pour faire tourner l'app
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# On copie seulement ce qui sert à l'exécution
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json ./package.json
# Si un fichier next.config.* existe, on le copie (sinon ce n'est pas grave)
COPY --from=builder /app/next.config.* ./  || true

# On installe uniquement les dépendances de production (plus léger)
RUN npm install --omit=dev

# On ouvre le port 3000 dans le conteneur
EXPOSE 3000

# On démarre l'app avec "npm start"
CMD ["npm", "start"]
s